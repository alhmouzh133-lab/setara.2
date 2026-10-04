-- ============================================================================
-- سيتارة / SETARA - Minimal Additive Migration
-- Add main_image to public.products with backwards-compatible fallback
-- ============================================================================

-- 1. Add main_image column to public.products if it does not already exist
alter table public.products
add column if not exists main_image text;

-- 2. Backfill existing products: set main_image to the first color's image
update public.products p
set main_image = (
  select pc.image
  from public.product_colors pc
  where pc.product_id = p.id
  order by pc.display_order asc, pc.created_at asc
  limit 1
)
where p.main_image is null;

-- 3. Fallback for any product without colors
update public.products
set main_image = '/images/cat_sheer.jpg'
where main_image is null;
