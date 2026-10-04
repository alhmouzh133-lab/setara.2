import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerSupabase } from '@/lib/supabase/server';
import { verifyAdminSession } from '@/lib/auth/admin-auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
    .eq('id', id)
    .maybeSingle();

  data = initialQuery.data;
  error = initialQuery.error;

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
      .eq('id', id)
      .maybeSingle();
    data = retry.data;
    error = retry.error;
  }

  if (error || !data) {
    return NextResponse.json({ error: 'المنتج غير موجود.' }, { status: 404 });
  }

  return NextResponse.json({ product: data });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: 403 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const supabase = await createServerSupabase();

    // 1. Update Core Product Table
    const productUpdates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) productUpdates.name = body.name.trim();
    if (body.category_id !== undefined) productUpdates.category_id = body.category_id;
    if (body.short_desc !== undefined) productUpdates.short_desc = body.short_desc.trim();
    if (body.description !== undefined) productUpdates.description = body.description.trim();
    if (body.fabric !== undefined) productUpdates.fabric = body.fabric.trim();
    if (body.light_blocking !== undefined) productUpdates.light_blocking = body.light_blocking.trim();
    if (body.main_image !== undefined) productUpdates.main_image = body.main_image?.trim() || null;
    if (body.care !== undefined) productUpdates.care = Array.isArray(body.care) ? body.care : [];
    if (body.features !== undefined) productUpdates.features = Array.isArray(body.features) ? body.features : [];
    if (body.is_featured !== undefined) productUpdates.is_featured = Boolean(body.is_featured);
    if (body.is_active !== undefined) productUpdates.is_active = Boolean(body.is_active);
    if (body.display_order !== undefined) productUpdates.display_order = Number(body.display_order);

    let { error: prodUpdateError } = await supabase
      .from('products')
      .update(productUpdates)
      .eq('id', id);

    // Fallback if main_image column is missing
    if (prodUpdateError && (prodUpdateError.code === '42703' || prodUpdateError.message?.includes('main_image'))) {
      delete productUpdates.main_image;
      const retryUpdate = await supabase
        .from('products')
        .update(productUpdates)
        .eq('id', id);
      prodUpdateError = retryUpdate.error;
    }

    if (prodUpdateError) {
      return NextResponse.json({ error: prodUpdateError.message }, { status: 500 });
    }

    // 2. Sync Colors if provided with ID mapping
    const colorIdMap = new Map<string, string>();
    if (Array.isArray(body.colors) && body.colors.length > 0) {
      for (let i = 0; i < body.colors.length; i++) {
        const c = body.colors[i];
        if (c.id && !c.id.startsWith('temp_')) {
          colorIdMap.set(c.id, c.id);
          if (c.color_key) colorIdMap.set(c.color_key, c.id);
          if (c.name) colorIdMap.set(c.name.trim(), c.id);

          await supabase
            .from('product_colors')
            .update({
              name: c.name.trim(),
              hex: c.hex.trim(),
              image: c.image.trim(),
              gallery: Array.isArray(c.gallery) && c.gallery.length > 0 ? c.gallery : [c.image.trim()],
              display_order: c.display_order ?? i + 1,
            })
            .eq('id', c.id);
        } else {
          const newColorId = `clr_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`;
          if (c.id) colorIdMap.set(c.id, newColorId);
          if (c.color_key) colorIdMap.set(c.color_key, newColorId);
          if (c.name) colorIdMap.set(c.name.trim(), newColorId);

          await supabase.from('product_colors').insert({
            id: newColorId,
            product_id: id,
            color_key: c.color_key || `clr_${Date.now()}_${i}`,
            name: c.name.trim(),
            hex: c.hex.trim(),
            image: c.image.trim(),
            gallery: Array.isArray(c.gallery) && c.gallery.length > 0 ? c.gallery : [c.image.trim()],
            display_order: c.display_order ?? i + 1,
          });
        }
      }
    }

    // 3. Sync Sizes if provided with ID mapping
    const sizeIdMap = new Map<string, string>();
    if (Array.isArray(body.sizes) && body.sizes.length > 0) {
      for (let i = 0; i < body.sizes.length; i++) {
        const s = body.sizes[i];
        if (s.id && !s.id.startsWith('temp_')) {
          sizeIdMap.set(s.id, s.id);
          if (s.size_key) sizeIdMap.set(s.size_key, s.id);
          if (s.label) sizeIdMap.set(s.label.trim(), s.id);

          await supabase
            .from('product_sizes')
            .update({
              label: s.label.trim(),
              width_cm: Number(s.width_cm),
              height_cm: Number(s.height_cm),
              display_order: s.display_order ?? i + 1,
            })
            .eq('id', s.id);
        } else {
          const newSizeId = `sz_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`;
          if (s.id) sizeIdMap.set(s.id, newSizeId);
          if (s.size_key) sizeIdMap.set(s.size_key, newSizeId);
          if (s.label) sizeIdMap.set(s.label.trim(), newSizeId);

          await supabase.from('product_sizes').insert({
            id: newSizeId,
            product_id: id,
            size_key: s.size_key || `sz_${Date.now()}_${i}`,
            label: s.label.trim(),
            width_cm: Number(s.width_cm) || 150,
            height_cm: Number(s.height_cm) || 260,
            display_order: s.display_order ?? i + 1,
          });
        }
      }
    }

    // 4. Sync Explicitly Configured Variants
    if (Array.isArray(body.variants)) {
      const activeVariantKeys = new Set<string>();
      const upsertRecords: any[] = [];

      for (const v of body.variants) {
        if (v.is_available === false) continue;

        const resolvedColorId = colorIdMap.get(v.color_id) || colorIdMap.get(v.color_name) || v.color_id;
        const resolvedSizeId = sizeIdMap.get(v.size_id) || sizeIdMap.get(v.size_label) || v.size_id;

        if (resolvedColorId && resolvedSizeId) {
          const comboKey = `${resolvedColorId}_${resolvedSizeId}`;
          if (!activeVariantKeys.has(comboKey)) {
            activeVariantKeys.add(comboKey);
            const varId = v.id && !v.id.startsWith('temp_') ? v.id : `var_${resolvedColorId}_${resolvedSizeId}`;

            upsertRecords.push({
              id: varId,
              product_id: id,
              color_id: resolvedColorId,
              size_id: resolvedSizeId,
              price: Number(v.price) >= 0 ? Number(v.price) : 25.0,
              stock_quantity: Number(v.stock_quantity) >= 0 ? Number(v.stock_quantity) : 10,
              is_available: true,
              sku: v.sku || null,
              updated_at: new Date().toISOString(),
            });
          }
        }
      }

      // Remove or disable unselected variant combinations
      const { data: currentDbVariants } = await supabase
        .from('product_variants')
        .select('id, color_id, size_id')
        .eq('product_id', id);

      if (currentDbVariants && currentDbVariants.length > 0) {
        const variantsToRemove = currentDbVariants.filter(
          (dbV) => !activeVariantKeys.has(`${dbV.color_id}_${dbV.size_id}`)
        );

        if (variantsToRemove.length > 0) {
          const idsToDelete = variantsToRemove.map((x) => x.id);
          await supabase
            .from('product_variants')
            .delete()
            .in('id', idsToDelete);
        }
      }

      // Upsert all enabled combinations
      if (upsertRecords.length > 0) {
        await supabase
          .from('product_variants')
          .upsert(upsertRecords, { onConflict: 'product_id,color_id,size_id' });
      }
    }

    return NextResponse.json({ success: true, message: 'تم تحديث بيانات المنتج بنجاح.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: 403 });
  }

  const { id } = await params;
  try {
    const supabase = await createServerSupabase();

    // Check if product exists first
    const { data: existing, error: checkError } = await supabase
      .from('products')
      .select('id, name, is_active')
      .eq('id', id)
      .maybeSingle();

    if (checkError) {
      return NextResponse.json({ error: `فشل التحقق من المنتج: ${checkError.message}` }, { status: 500 });
    }

    if (!existing) {
      return NextResponse.json({ error: 'المنتج المطلوب أرشفته غير موجود.' }, { status: 404 });
    }

    // Soft delete / archive product
    const { error: updateError } = await supabase
      .from('products')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `تم أرشفة منتج "${existing.name}" بنجاح وإزالته من المتجر.`,
      productId: id,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
