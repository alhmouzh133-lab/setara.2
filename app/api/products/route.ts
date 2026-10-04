import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerSupabase } from '@/lib/supabase/server';
import { verifyAdminSession } from '@/lib/auth/admin-auth';
import { getStorefrontProducts } from '@/lib/catalog-service';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isAdminRequest = searchParams.get('admin') === 'true';

  if (!isAdminRequest) {
    const products = await getStorefrontProducts();
    return NextResponse.json({ products });
  }

  // Admin Request: Require server-side verification
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: 403 });
  }

  const supabase = await createServerSupabase();
  let data: any = null;
  let error: any = null;

  const initialQuery = await supabase
    .from('products')
    .select(`
      id,
      slug,
      name,
      category_id,
      short_desc,
      description,
      fabric,
      light_blocking,
      main_image,
      care,
      features,
      is_featured,
      is_active,
      display_order,
      category:categories(id, name, slug),
      colors:product_colors(*),
      sizes:product_sizes(*),
      variants:product_variants(*)
    `)
    .order('display_order', { ascending: true });

  data = initialQuery.data;
  error = initialQuery.error;

  // Fallback if main_image column is not yet migrated on live database
  if (error && (error.code === '42703' || error.message?.includes('main_image'))) {
    const retry = await supabase
      .from('products')
      .select(`
        id,
        slug,
        name,
        category_id,
        short_desc,
        description,
        fabric,
        light_blocking,
        care,
        features,
        is_featured,
        is_active,
        display_order,
        category:categories(id, name, slug),
        colors:product_colors(*),
        sizes:product_sizes(*),
        variants:product_variants(*)
      `)
      .order('display_order', { ascending: true });
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ products: data });
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      name,
      category_id,
      short_desc,
      description,
      fabric,
      light_blocking,
      main_image,
      care,
      features,
      is_featured,
      is_active,
      display_order,
      colors,
      sizes,
      variants,
    } = body;

    // 1. Validation
    if (!name?.trim()) {
      return NextResponse.json({ error: 'اسم المنتج مطلوب.' }, { status: 400 });
    }
    if (!category_id) {
      return NextResponse.json({ error: 'يرجى تحديد قسم المنتج.' }, { status: 400 });
    }
    if (!Array.isArray(colors) || colors.length === 0) {
      return NextResponse.json({ error: 'يجب إضافة لون واحد على الأقل للمنتج.' }, { status: 400 });
    }
    if (!Array.isArray(sizes) || sizes.length === 0) {
      return NextResponse.json({ error: 'يجب إضافة مقاس واحد على الأقل للمنتج.' }, { status: 400 });
    }

    const productId = body.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const slug = body.slug || productId;
    const resolvedMainImage = main_image?.trim() || colors[0]?.image?.trim() || '';

    const supabase = await createServerSupabase();

    // 2. Insert Product (attempting with main_image first, falling back if column not yet added)
    const productInsertData: Record<string, any> = {
      id: productId,
      slug,
      name: name.trim(),
      category_id,
      short_desc: short_desc?.trim() || '',
      description: description?.trim() || '',
      fabric: fabric?.trim() || '',
      light_blocking: light_blocking?.trim() || '',
      main_image: resolvedMainImage || null,
      care: Array.isArray(care) ? care : [],
      features: Array.isArray(features) ? features : [],
      is_featured: Boolean(is_featured),
      is_active: is_active ?? true,
      display_order: Number(display_order) || 0,
    };

    let { error: prodError } = await supabase.from('products').insert(productInsertData);

    // Fallback if main_image column is missing
    if (prodError && (prodError.code === '42703' || prodError.message?.includes('main_image'))) {
      delete productInsertData.main_image;
      const retryInsert = await supabase.from('products').insert(productInsertData);
      prodError = retryInsert.error;
    }

    if (prodError) {
      return NextResponse.json({ error: `فشل إنشاء المنتج: ${prodError.message}` }, { status: 500 });
    }

    // 3. Insert Colors with ID mapping
    const colorIdMap = new Map<string, string>();
    const colorInserts = colors.map((c: any, index: number) => {
      const dbId = c.id && !c.id.startsWith('temp_') ? c.id : `clr_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`;
      if (c.id) colorIdMap.set(c.id, dbId);
      if (c.color_key) colorIdMap.set(c.color_key, dbId);
      if (c.name) colorIdMap.set(c.name.trim(), dbId);

      return {
        id: dbId,
        product_id: productId,
        color_key: c.color_key || `color_${index}`,
        name: c.name.trim(),
        hex: c.hex.trim(),
        image: c.image.trim(),
        gallery: Array.isArray(c.gallery) && c.gallery.length > 0 ? c.gallery : [c.image.trim()],
        display_order: c.display_order ?? index + 1,
      };
    });

    const { data: insertedColors, error: colorsError } = await supabase
      .from('product_colors')
      .insert(colorInserts)
      .select();

    if (colorsError) {
      return NextResponse.json({ error: `فشل حفظ ألوان المنتج: ${colorsError.message}` }, { status: 500 });
    }

    // Update colorIdMap with actual inserted records
    (insertedColors || []).forEach((c: any) => {
      colorIdMap.set(c.id, c.id);
      colorIdMap.set(c.color_key, c.id);
      colorIdMap.set(c.name, c.id);
    });

    // 4. Insert Sizes with ID mapping
    const sizeIdMap = new Map<string, string>();
    const sizeInserts = sizes.map((s: any, index: number) => {
      const dbId = s.id && !s.id.startsWith('temp_') ? s.id : `sz_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`;
      if (s.id) sizeIdMap.set(s.id, dbId);
      if (s.size_key) sizeIdMap.set(s.size_key, dbId);
      if (s.label) sizeIdMap.set(s.label.trim(), dbId);

      return {
        id: dbId,
        product_id: productId,
        size_key: s.size_key || `size_${index}`,
        label: s.label.trim(),
        width_cm: Number(s.width_cm) || 150,
        height_cm: Number(s.height_cm) || 260,
        display_order: s.display_order ?? index + 1,
      };
    });

    const { data: insertedSizes, error: sizesError } = await supabase
      .from('product_sizes')
      .insert(sizeInserts)
      .select();

    if (sizesError) {
      return NextResponse.json({ error: `فشل حفظ مقاسات المنتج: ${sizesError.message}` }, { status: 500 });
    }

    // Update sizeIdMap with actual inserted records
    (insertedSizes || []).forEach((s: any) => {
      sizeIdMap.set(s.id, s.id);
      sizeIdMap.set(s.size_key, s.id);
      sizeIdMap.set(s.label, s.id);
    });

    // 5. Insert ONLY explicitly configured and enabled variants (No blanket Cartesian product)
    const variantInserts: any[] = [];
    if (Array.isArray(variants) && variants.length > 0) {
      const seenCombinations = new Set<string>();

      for (const v of variants) {
        if (v.is_available === false) continue;

        const resolvedColorId = colorIdMap.get(v.color_id) || colorIdMap.get(v.color_name) || v.color_id;
        const resolvedSizeId = sizeIdMap.get(v.size_id) || sizeIdMap.get(v.size_label) || v.size_id;

        if (resolvedColorId && resolvedSizeId) {
          const comboKey = `${resolvedColorId}_${resolvedSizeId}`;
          if (!seenCombinations.has(comboKey)) {
            seenCombinations.add(comboKey);
            variantInserts.push({
              id: `var_${resolvedColorId}_${resolvedSizeId}`,
              product_id: productId,
              color_id: resolvedColorId,
              size_id: resolvedSizeId,
              price: Number(v.price) >= 0 ? Number(v.price) : 25.0,
              stock_quantity: Number(v.stock_quantity) >= 0 ? Number(v.stock_quantity) : 10,
              is_available: true,
              sku: v.sku || `${slug.toUpperCase()}-${resolvedColorId.slice(-4)}-${resolvedSizeId.slice(-4)}`,
            });
          }
        }
      }
    }

    if (variantInserts.length > 0) {
      const { error: varError } = await supabase.from('product_variants').insert(variantInserts);
      if (varError) {
        return NextResponse.json({ error: `فشل حفظ أصناف ومقاسات المنتج: ${varError.message}` }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, productId }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
