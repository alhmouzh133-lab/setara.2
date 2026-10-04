import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerSupabase } from '@/lib/supabase/server';
import { verifyAdminSession } from '@/lib/auth/admin-auth';
import { CATEGORIES as STATIC_CATEGORIES } from '@/lib/shop-data';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isAdminRequest = searchParams.get('admin') === 'true';

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({
      source: 'static',
      categories: STATIC_CATEGORIES.map((c, i) => ({
        id: c.id,
        slug: c.id,
        name: c.name,
        subtitle: c.subtitle,
        description: c.description,
        image: c.image,
        display_order: i + 1,
        is_active: true,
      })),
    });
  }

  const supabase = await createServerSupabase();

  let query = supabase.from('categories').select('*').order('display_order', { ascending: true });

  if (!isAdminRequest) {
    query = query.eq('is_active', true);
  } else {
    const auth = await verifyAdminSession();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.message }, { status: 403 });
    }
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ source: 'database', categories: data });
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, name, subtitle, description, image, display_order, is_active } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'اسم القسم مطلوب.' }, { status: 400 });
    }

    const slug = (body.slug || id || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, '-');

    const categoryId = id || slug || `cat_${Date.now()}`;

    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from('categories')
      .insert({
        id: categoryId,
        slug,
        name: name.trim(),
        subtitle: subtitle?.trim() || null,
        description: description?.trim() || null,
        image: image?.trim() || '/images/cat_sheer.jpg',
        display_order: Number(display_order) || 0,
        is_active: is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, category: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
