import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerSupabase } from '@/lib/supabase/server';
import { verifyAdminSession } from '@/lib/auth/admin-auth';

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

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.subtitle !== undefined) updates.subtitle = body.subtitle?.trim() || null;
    if (body.description !== undefined) updates.description = body.description?.trim() || null;
    if (body.image !== undefined) updates.image = body.image.trim();
    if (body.display_order !== undefined) updates.display_order = Number(body.display_order);
    if (body.is_active !== undefined) updates.is_active = Boolean(body.is_active);

    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, category: data });
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

    // Check if category has associated products
    const { count, error: countError } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    if (count && count > 0) {
      // Soft-archive instead of hard delete to avoid foreign key violation
      const { error: archiveError } = await supabase
        .from('categories')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (archiveError) {
        return NextResponse.json({ error: archiveError.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        archived: true,
        message: 'تم أرشفة القسم بنجاح لوجود منتجات مرتبطة به.',
      });
    }

    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deleted: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
