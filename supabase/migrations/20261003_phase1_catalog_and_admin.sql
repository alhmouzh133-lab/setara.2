-- ============================================================================
-- سيتارة / SETARA - PHASE 1 DATABASE MIGRATION
-- Production Catalog, Admin Authentication & Supabase Storage
-- ============================================================================

-- Ensure transaction atomicity
begin;

-- ----------------------------------------------------------------------------
-- 1. Admin Users Table (Linked to auth.users)
-- ----------------------------------------------------------------------------
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'admin' check (role in ('admin', 'super_admin')),
  created_at timestamptz not null default now()
);

-- Enable Row Level Security immediately
alter table public.admin_users enable row level security;

-- Revoke all client privileges first, then restore only authenticated SELECT
revoke all on table public.admin_users from public, anon, authenticated;
grant select on table public.admin_users to authenticated;
grant all on table public.admin_users to postgres, service_role;

-- ----------------------------------------------------------------------------
-- 2. Security Definer Helper: is_admin()
-- ----------------------------------------------------------------------------
-- Evaluates whether the currently authenticated session belongs to a verified admin.
-- Uses strict empty search_path ('') to completely prevent schema hijacking.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

-- Execution granted ONLY to authenticated and service_role; revoked from public and anon
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;

-- RLS Policy: Authenticated users can view their own admin record
-- This allows non-recursive lookup by user_id and enables public.is_admin() evaluation
drop policy if exists "Admins can view admin list" on public.admin_users;
drop policy if exists "Users can view own admin record" on public.admin_users;
create policy "Users can view own admin record"
  on public.admin_users
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- ----------------------------------------------------------------------------
-- 3. Owner-Only Bootstrap Procedure: provision_admin_user(admin_email)
-- ----------------------------------------------------------------------------
-- Uses SECURITY INVOKER with EXECUTE granted ONLY to postgres (SQL Editor context).
-- Revoked from public, anon, authenticated, and service_role.
create or replace function public.provision_admin_user(admin_email text)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_user_id uuid;
begin
  select id into target_user_id from auth.users where email = admin_email;
  if target_user_id is null then
    return 'USER_NOT_FOUND: Create an account with email ' || admin_email || ' in Supabase Auth first, then run this function.';
  end if;

  insert into public.admin_users (user_id, email, role)
  values (target_user_id, admin_email, 'super_admin')
  on conflict (user_id) do update set role = 'super_admin';

  return 'SUCCESS: Admin role granted to ' || admin_email;
end;
$$;

-- Revoke execute from all client roles and service_role; grant exclusively to postgres
revoke all on function public.provision_admin_user(text) from public, anon, authenticated, service_role;
grant execute on function public.provision_admin_user(text) to postgres;

-- ----------------------------------------------------------------------------
-- 4. Categories Table
-- ----------------------------------------------------------------------------
create table if not exists public.categories (
  id text primary key,
  slug text unique not null,
  name text not null,
  subtitle text,
  description text,
  image text not null,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.categories enable row level security;

-- Table-level privileges: revoke unnecessary privileges first
revoke all on table public.categories from public, anon, authenticated;
grant select on table public.categories to anon, authenticated;
grant insert, update, delete on table public.categories to authenticated;
grant all on table public.categories to postgres, service_role;

-- Separate Public and Admin SELECT policies
drop policy if exists "Public can view active categories" on public.categories;
create policy "Public can view active categories"
  on public.categories
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Admins can view all categories" on public.categories;
create policy "Admins can view all categories"
  on public.categories
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can insert categories" on public.categories;
create policy "Admins can insert categories"
  on public.categories
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update categories" on public.categories;
create policy "Admins can update categories"
  on public.categories
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete categories" on public.categories;
create policy "Admins can delete categories"
  on public.categories
  for delete
  to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- 5. Products Table
-- ----------------------------------------------------------------------------
create table if not exists public.products (
  id text primary key,
  slug text unique not null,
  name text not null,
  category_id text not null references public.categories(id) on delete restrict,
  short_desc text not null,
  description text not null,
  fabric text not null,
  light_blocking text not null,
  main_image text,
  care jsonb not null default '[]'::jsonb,
  features jsonb not null default '[]'::jsonb,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- Table-level privileges
revoke all on table public.products from public, anon, authenticated;
grant select on table public.products to anon, authenticated;
grant insert, update, delete on table public.products to authenticated;
grant all on table public.products to postgres, service_role;

-- Separate Public and Admin SELECT policies
drop policy if exists "Public can view active products" on public.products;
create policy "Public can view active products"
  on public.products
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Admins can view all products" on public.products;
create policy "Admins can view all products"
  on public.products
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
  on public.products
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
  on public.products
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
  on public.products
  for delete
  to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- 6. Product Colors Table
-- ----------------------------------------------------------------------------
create table if not exists public.product_colors (
  id text primary key,
  product_id text not null references public.products(id) on delete cascade,
  color_key text not null,
  name text not null,
  hex text not null,
  image text not null,
  gallery jsonb not null default '[]'::jsonb,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  constraint uq_product_colors_key unique (product_id, color_key),
  constraint uq_product_colors_composite unique (product_id, id)
);

alter table public.product_colors enable row level security;

-- Table-level privileges
revoke all on table public.product_colors from public, anon, authenticated;
grant select on table public.product_colors to anon, authenticated;
grant insert, update, delete on table public.product_colors to authenticated;
grant all on table public.product_colors to postgres, service_role;

-- Separate Public and Admin SELECT policies
drop policy if exists "Public can view colors of active products" on public.product_colors;
create policy "Public can view colors of active products"
  on public.product_colors
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_colors.product_id
      and p.is_active = true
    )
  );

drop policy if exists "Admins can view all colors" on public.product_colors;
create policy "Admins can view all colors"
  on public.product_colors
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can insert colors" on public.product_colors;
create policy "Admins can insert colors"
  on public.product_colors
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update colors" on public.product_colors;
create policy "Admins can update colors"
  on public.product_colors
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete colors" on public.product_colors;
create policy "Admins can delete colors"
  on public.product_colors
  for delete
  to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- 7. Product Sizes Table
-- ----------------------------------------------------------------------------
create table if not exists public.product_sizes (
  id text primary key,
  product_id text not null references public.products(id) on delete cascade,
  size_key text not null,
  label text not null,
  width_cm numeric(6, 1) not null check (width_cm > 0),
  height_cm numeric(6, 1) not null check (height_cm > 0),
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  constraint uq_product_sizes_key unique (product_id, size_key),
  constraint uq_product_sizes_composite unique (product_id, id)
);

alter table public.product_sizes enable row level security;

-- Table-level privileges
revoke all on table public.product_sizes from public, anon, authenticated;
grant select on table public.product_sizes to anon, authenticated;
grant insert, update, delete on table public.product_sizes to authenticated;
grant all on table public.product_sizes to postgres, service_role;

-- Separate Public and Admin SELECT policies
drop policy if exists "Public can view sizes of active products" on public.product_sizes;
create policy "Public can view sizes of active products"
  on public.product_sizes
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_sizes.product_id
      and p.is_active = true
    )
  );

drop policy if exists "Admins can view all sizes" on public.product_sizes;
create policy "Admins can view all sizes"
  on public.product_sizes
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can insert sizes" on public.product_sizes;
create policy "Admins can insert sizes"
  on public.product_sizes
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update sizes" on public.product_sizes;
create policy "Admins can update sizes"
  on public.product_sizes
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete sizes" on public.product_sizes;
create policy "Admins can delete sizes"
  on public.product_sizes
  for delete
  to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- 8. Product Variants Table (Unique color + size with composite foreign keys)
-- ----------------------------------------------------------------------------
create table if not exists public.product_variants (
  id text primary key,
  product_id text not null references public.products(id) on delete cascade,
  color_id text not null,
  size_id text not null,
  price numeric(10, 2) not null check (price >= 0),
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  is_available boolean not null default true,
  sku text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_product_variants_combination unique (product_id, color_id, size_id),
  constraint fk_product_variants_color foreign key (product_id, color_id)
    references public.product_colors(product_id, id) on delete cascade,
  constraint fk_product_variants_size foreign key (product_id, size_id)
    references public.product_sizes(product_id, id) on delete cascade
);

alter table public.product_variants enable row level security;

-- Table-level privileges
revoke all on table public.product_variants from public, anon, authenticated;
grant select on table public.product_variants to anon, authenticated;
grant insert, update, delete on table public.product_variants to authenticated;
grant all on table public.product_variants to postgres, service_role;

-- Separate Public and Admin SELECT policies
drop policy if exists "Public can view available variants" on public.product_variants;
create policy "Public can view available variants"
  on public.product_variants
  for select
  to anon, authenticated
  using (
    is_available = true
    and exists (
      select 1 from public.products p
      where p.id = product_variants.product_id
      and p.is_active = true
    )
  );

drop policy if exists "Admins can view all variants" on public.product_variants;
create policy "Admins can view all variants"
  on public.product_variants
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can insert variants" on public.product_variants;
create policy "Admins can insert variants"
  on public.product_variants
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update variants" on public.product_variants;
create policy "Admins can update variants"
  on public.product_variants
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete variants" on public.product_variants;
create policy "Admins can delete variants"
  on public.product_variants
  for delete
  to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- 9. Supabase Storage Bucket Configuration (product-media)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-media',
  'product-media',
  true,
  5242880, -- 5 MB limit
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Public can view media
drop policy if exists "Public can view product media" on storage.objects;
create policy "Public can view product media"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'product-media');

-- Explicit role restriction to authenticated for admin operations
drop policy if exists "Admins can upload product media" on storage.objects;
create policy "Admins can upload product media"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'product-media'
    and public.is_admin()
  );

drop policy if exists "Admins can update product media" on storage.objects;
create policy "Admins can update product media"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'product-media'
    and public.is_admin()
  );

drop policy if exists "Admins can delete product media" on storage.objects;
create policy "Admins can delete product media"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'product-media'
    and public.is_admin()
  );

-- ----------------------------------------------------------------------------
-- 10. NON-DESTRUCTIVE CATALOG SEEDING (ON CONFLICT DO NOTHING)
-- ----------------------------------------------------------------------------

-- Categories
insert into public.categories (id, slug, name, subtitle, description, image, display_order)
values
  ('sheer', 'sheer', 'ستائر شفافة', 'ترشيح لطيف لضوء النهار', 'أنسجة كتانية وشيفون انسيابية توفر خصوصية نهارية وتسمح بنفاذ الضوء بنعومة.', '/images/cat_sheer.jpg', 1),
  ('blackout', 'blackout', 'ستائر تعتيم', 'عزل تام للضوء والحرارة', 'خامات مخملية وأنسجة ثلاثية الطبقات لحجب الإنارة الخارجية وحفظ برودة الغرفة.', '/images/cat_blackout.jpg', 2),
  ('roller', 'roller', 'ستائر رول', 'تصميم عملي وأنيق', 'ستائر شيد وزيبرا عصرية وسهلة التحكم ومناسبة للمكاتب والمطابخ والغرف المودرن.', '/images/cat_roller.jpg', 3)
on conflict (id) do nothing;

-- Products
insert into public.products (id, slug, name, category_id, short_desc, description, fabric, light_blocking, care, features, is_featured, is_active, display_order)
values
  (
    'andalusian-voile',
    'andalusian-voile',
    'ستائر فوال أندلسي',
    'sheer',
    'نسيج فوال شفاف ناعم بنقشة رقيقة تمنح صالتك لمسة دافئة وتسمح بمرور ضوء النهار.',
    'ستارة فوال أندلسي خفيفة الوزن ومصنوعة بعناية لتضفي على الغرفة إحساساً بالرحابة والهدوء. النسيج يتميز بثنيات انسيابية راقية تتدلى بنعومة وتناسب غرف الاستقبال والمعيشة.',
    'بوليستر فوال معالج بنسبة 100%',
    'شفافية 30% (تسمح بنفاذ الضوء الخافت)',
    '["غسيل آلي ببرنامج خفيف (30 درجة مئوية)", "يُمنع استخدام المبيضات أو الكي المباشر بحرارة عالية", "يُفضل التعليق رطباً للحفاظ على الانسيابية الطبيعية"]'::jsonb,
    '["نسيج انسيابي مقاوم للتجعيد", "حاشية سفلية مثقلة لتوازن مثالي", "سهولة الفك والتركيب على القضبان القياسية"]'::jsonb,
    true,
    true,
    1
  ),
  (
    'nordic-thermal',
    'nordic-thermal',
    'ستائر نورديك عازلة للضوء والحرارة',
    'blackout',
    'قماش ثلاثي الطبقات لحجب الضوء بنسبة 95% وحفظ برودة الغرفة في الصيف والدفء في الشتاء.',
    'صُممت ستائر نورديك العازلة لتمنحك نوماً هادئاً وبيئة معزولة عن أشعة الشمس القوية وضوضاء الشارع. مناسبة لغرف النوم والمكاتب المنزلية التي تتطلب تركيزاً واسترخاءً تامين.',
    'أنسجة حرارية ثلاثية الحياكة (Triple Weave)',
    'تعتيم 95% (حجب ممتاز للإنارة الخارجية)',
    '["تنظيف جاف أو غسيل يدوي بماء بارد", "كي بالبخار بحرارة منخفضة من الجهة الخلفية", "تجنب العصر الشديد"]'::jsonb,
    '["عزل حراري يساعد في توفير الطاقة", "تقليل ارتداد الصوت والضجيج الخارجي", "ألوان متناسقة تدوم مع الغسيل"]'::jsonb,
    true,
    true,
    2
  ),
  (
    'raw-linen-natural',
    'raw-linen-natural',
    'ستائر كتان خام طبيعي',
    'sheer',
    'ملمس نسيجي بارز بلون ترابي ناعم يتناغم مع الديكورات البسيطة والمودرن والمنازل الريفية.',
    'تجمع ستائر الكتان الخام بين البساطة والجمال العضوي. الخيوط ذات المظهر الطبيعي المائل للخشونة تعطي إضاءة ذهبية فريدة للغرفة وتمنح المساحة طابعاً حميمياً مريحاً.',
    'خليط كتان 60% وبوليستر معالج 40%',
    'تعتيم خفيف 45% (ترشيح ضوء طبيعي متوازن)',
    '["غسيل بارد منفصل لأول مرة", "يُفضل استخدام منظفات خفيفة للأقمشة الطبيعية", "يُكوى بدرجة حرارة متوسطة وهو رطب قليلاً"]'::jsonb,
    '["مظهر طبيعي أصيل وأنيق", "تنفس ممتاز للأنسجة وتدفق هواء خفيف", "مقاوم للتمدد والانكماش بفضل مزيج البوليستر"]'::jsonb,
    true,
    true,
    3
  ),
  (
    'solar-screen-roller',
    'solar-screen-roller',
    'ستائر رول واقية من الشمس (سولار)',
    'roller',
    'ستارة رول بتقنية عاكسة للأشعة فوق البنفسجية تقلل الوهج وتسمح برؤية الخارج بوضوح.',
    'الحل المثالي للمكاتب ومساحات العمل والمطابخ العصرية. تحجب وهج الشمس الحارق والأشعة فوق البنفسجية الضارة بنسبة تصل إلى 90% مع الحفاظ على المنظر الخارجي أثناء النهار.',
    'ألياف زجاجية مغلفة ببوليمر خاص بنسبة انفتاح 5%',
    'حجب الأشعة 90% مع شفافية بصرية نهارية',
    '["مسح سريع بقطعة قماش مبللة وإسفنجة ناعمة", "يُمنع استخدام المنظفات الكيماوية الكاشطة", "تجفيف تلقائي بعد الفرد الكامل"]'::jsonb,
    '["تقليل استهلاك التكييف وخفض حرارة الغرفة", "آلية سحب سلسة ومتينة مع قفل أمان للأطفال", "مقاومة للرطوبة وتراكم الأتربة"]'::jsonb,
    false,
    true,
    4
  ),
  (
    'chiffon-champagne',
    'chiffon-champagne',
    'ستائر شيفون فاخر شامبين',
    'sheer',
    'شيفون حريري لامع بدرجات الشامبين واللؤلؤ لإضفاء بريق فندقي هادئ على مجالس الضيوف.',
    'صُممت هذه المجموعة لتكون قطعة مركزية في الصالونات وغرف المعيشة الفخمة. النسيج يتمتع بلمعة حريرية مدروسة تبرز تحت الإنارة المسائية وتوزع الضوء النهاري بسحر فائق.',
    'بوليستر شيفون عالي الكثافة (Micro-chiffon)',
    'شفافية 25% (ترشيح ناعم ومظهر ملائكي)',
    '["غسيل يدوي أو تنظيف جاف متخصص", "كي بالبخار على درجة منخفضة جداً", "يُحفظ بعيداً عن الأشياء الحادة"]'::jsonb,
    '["لمعان هادئ ومظهر فندقي خمس نجوم", "خيوط قوية تدوم لسنوات دون تلف", "درجات لونية غنية ومحبوبة في البيوت الأردنية"]'::jsonb,
    false,
    true,
    5
  ),
  (
    'velvet-charcoal',
    'velvet-charcoal',
    'ستائر مخمل فخم معتم',
    'blackout',
    'خامة مخملية ثقيلة تمنح الجدران عمقاً وفخامة وتوفر عزل ضوء متكامل بنسبة 98%.',
    'الخيار الأمثل للمساحات التي تبحث عن الفخامة والخصوصية المطلقة. المخمل يمنح الغرفة دفئاً بصرياً ولمساً استثنائياً، مع خصائص عزل حراري وصوتي ممتازة.',
    'مخمل بوليستر كثيف 380 غرام/م²',
    'تعتيم 98% (حجب ضوء شبه كامل)',
    '["تنظيف جاف متخصص للمحافظة على وبر المخمل", "كي بالبخار فقط من الجهة الخلفية مع اتجاه الوبر", "تنظيف دوري بفرشاة قماش ناعمة"]'::jsonb,
    '["وبر ناعم غني وثقيل الهطول", "أقصى درجات الخصوصية وحجب الشمس", "أطراف مخيطة يدوياً بإتقان"]'::jsonb,
    true,
    true,
    6
  ),
  (
    'lustre-cocoa',
    'lustre-cocoa',
    'ستائر تعتيم نسيج لوستر كاكاو',
    'blackout',
    'نسيج محاك متداخل بدرجات الكاكاو والرمادي الدافئ يجمع بين المظهر المودرن والتعتيم الكامل.',
    'تتميز ستائر لوستر كاكاو بمزيج لوني راقٍ يناسب الأثاث الخشبي والمودرن على حد سواء. النسيج غير لامع ومصنوع من خيوط متينة تعطي الغرفة لمسة معمارية حديثة.',
    'أنسجة بوليستر متداخلة ثنائية اللون',
    'تعتيم 92% (بيئة مريحة للنوم والاسترخاء)',
    '["غسيل آلي لطيف بماء فاتر", "يُعلق مباشرة بعد الغسيل لتقليل الحاجة للكي", "كي سريع بدرجة حرارة متوسطة"]'::jsonb,
    '["خامة متينة ضد البهتان", "توازن مثالي بين الديكور العصري والعزل الضوئي", "خالية من المركبات الضارة"]'::jsonb,
    false,
    true,
    7
  ),
  (
    'zebra-roller-dual',
    'zebra-roller-dual',
    'ستائر زيبرا مزدوجة (ليل ونهار)',
    'roller',
    'طبقات متناوبة من القماش الشفاف والمعتم للتحكم الكامل بكمية الضوء والخصوصية بحركة واحدة.',
    'تمنحك ستارة الزيبرا مرونة لا تضاهى: بمجرد سحب السلسلة، يمكنك التبديل بين وضعية الإضاءة النهارية اللطيفة أو وضعية الخصوصية الكاملة. مناسبة للمطابخ والمكاتب وغرف النوم.',
    'بوليستر تقني 100% مع أشرطة ترشيح شفافة',
    'تحكم تدريجي من 30% إلى 85% حسب محاذاة الأشرطة',
    '["مسح الأشرطة بإسفنجة ناعمة أو منفضة غبار جافة", "يُمنع غمر الصندوق المعدني بالماء", "فحص دوري لحبل السحب"]'::jsonb,
    '["نظام حركة مزدوج دقيق وسهل", "صندوق علوي أنيق من الألمنيوم يخفي الرول", "تصميم عصري يوفر المساحة على النوافذ"]'::jsonb,
    false,
    true,
    8
  )
on conflict (id) do nothing;

-- Colors for all products
insert into public.product_colors (id, product_id, color_key, name, hex, image, gallery, display_order)
values
  -- andalusian-voile
  ('color_and_sand', 'andalusian-voile', 'sand', 'بيج رملي', '#D4C4A8', '/images/prod_andalusian.jpg', '["/images/prod_andalusian.jpg", "/images/craft_textures.jpg"]'::jsonb, 1),
  ('color_and_white', 'andalusian-voile', 'white', 'أبيض ناصع', '#F8F6F0', '/images/linen_sheer_white.jpg', '["/images/linen_sheer_white.jpg"]'::jsonb, 2),
  ('color_and_champagne', 'andalusian-voile', 'champagne', 'شامبين عاجي', '#E8DFD0', '/images/chiffon_champagne.jpg', '["/images/chiffon_champagne.jpg"]'::jsonb, 3),

  -- nordic-thermal
  ('color_nordic_sand', 'nordic-thermal', 'sand', 'بيج اسكندنافي', '#C5B59E', '/images/nordic_sand.jpg', '["/images/nordic_sand.jpg", "/images/craft_textures.jpg"]'::jsonb, 1),
  ('color_nordic_charcoal', 'nordic-thermal', 'charcoal', 'فحمي داكن', '#2C2B29', '/images/velvet_charcoal.jpg', '["/images/velvet_charcoal.jpg"]'::jsonb, 2),
  ('color_nordic_olive', 'nordic-thermal', 'olive', 'زيتي ملكي', '#3C4035', '/images/curtain_olive.jpg', '["/images/curtain_olive.jpg"]'::jsonb, 3),

  -- raw-linen-natural
  ('color_raw_linen_white', 'raw-linen-natural', 'white', 'كتان أبيض دافئ', '#EDE7DC', '/images/raw_linen_white.jpg', '["/images/raw_linen_white.jpg", "/images/craft_textures.jpg"]'::jsonb, 1),
  ('color_raw_linen_sand', 'raw-linen-natural', 'sand', 'كتان رملي طبيعي', '#D6C7B2', '/images/linen_sheer_sand.jpg', '["/images/linen_sheer_sand.jpg"]'::jsonb, 2),

  -- solar-screen-roller
  ('color_solar_offwhite', 'solar-screen-roller', 'offwhite', 'أبيض عاجي عاكس', '#EFECE6', '/images/solar_offwhite.jpg', '["/images/solar_offwhite.jpg"]'::jsonb, 1),
  ('color_solar_charcoal', 'solar-screen-roller', 'charcoal', 'رمادي فحمي معدني', '#3D3B39', '/images/curtain_charcoal_roller.jpg', '["/images/curtain_charcoal_roller.jpg"]'::jsonb, 2),

  -- chiffon-champagne
  ('color_chiffon_champagne', 'chiffon-champagne', 'champagne', 'شامبين لؤلؤي', '#E5DACB', '/images/chiffon_champagne.jpg', '["/images/chiffon_champagne.jpg"]'::jsonb, 1),
  ('color_chiffon_white', 'chiffon-champagne', 'white', 'أبيض ثلجي شفاف', '#FBF9F5', '/images/linen_sheer_white.jpg', '["/images/linen_sheer_white.jpg"]'::jsonb, 2),

  -- velvet-charcoal
  ('color_velvet_charcoal', 'velvet-charcoal', 'charcoal', 'فحمي مخملي عميق', '#242322', '/images/velvet_charcoal.jpg', '["/images/velvet_charcoal.jpg"]'::jsonb, 1),
  ('color_velvet_champagne', 'velvet-charcoal', 'champagne', 'ذهبي شامبين مخملي', '#C8AA78', '/images/velvet_champagne.jpg', '["/images/velvet_champagne.jpg"]'::jsonb, 2),
  ('color_velvet_olive', 'velvet-charcoal', 'olive', 'زيتي كلاسيك', '#2D3328', '/images/curtain_olive.jpg', '["/images/curtain_olive.jpg"]'::jsonb, 3),

  -- lustre-cocoa
  ('color_lustre_cocoa', 'lustre-cocoa', 'cocoa', 'كاكاو دافئ', '#4A3B32', '/images/lustre_cocoa.jpg', '["/images/lustre_cocoa.jpg"]'::jsonb, 1),
  ('color_lustre_warmgrey', 'lustre-cocoa', 'warmgrey', 'رمادي دافئ', '#7A726B', '/images/lustre_warmgrey.jpg', '["/images/lustre_warmgrey.jpg"]'::jsonb, 2),

  -- zebra-roller-dual
  ('color_zebra_cream', 'zebra-roller-dual', 'cream', 'كريمي هادئ', '#EAE3D2', '/images/roller_zebra_cream.jpg', '["/images/roller_zebra_cream.jpg"]'::jsonb, 1),
  ('color_zebra_mocha', 'zebra-roller-dual', 'mocha', 'موكا دافئ', '#5C4E43', '/images/curtain_mocha_roller.jpg', '["/images/curtain_mocha_roller.jpg"]'::jsonb, 2)
on conflict (id) do nothing;

-- Sizes for all products (strictly positive width_cm and height_cm)
insert into public.product_sizes (id, product_id, size_key, label, width_cm, height_cm, display_order)
values
  -- andalusian-voile
  ('size_and_150_260', 'andalusian-voile', '150x260', '150 × 260 سم', 150.0, 260.0, 1),
  ('size_and_200_260', 'andalusian-voile', '200x260', '200 × 260 سم', 200.0, 260.0, 2),
  ('size_and_300_260', 'andalusian-voile', '300x260', '300 × 260 سم', 300.0, 260.0, 3),

  -- nordic-thermal
  ('size_nordic_150_260', 'nordic-thermal', '150x260', '150 × 260 سم', 150.0, 260.0, 1),
  ('size_nordic_200_260', 'nordic-thermal', '200x260', '200 × 260 سم', 200.0, 260.0, 2),
  ('size_nordic_300_280', 'nordic-thermal', '300x280', '300 × 280 سم', 300.0, 280.0, 3),

  -- raw-linen-natural
  ('size_raw_150_260', 'raw-linen-natural', '150x260', '150 × 260 سم', 150.0, 260.0, 1),
  ('size_raw_200_260', 'raw-linen-natural', '200x260', '200 × 260 سم', 200.0, 260.0, 2),
  ('size_raw_250_270', 'raw-linen-natural', '250x270', '250 × 270 سم', 250.0, 270.0, 3),

  -- solar-screen-roller
  ('size_solar_120_180', 'solar-screen-roller', '120x180', '120 × 180 سم', 120.0, 180.0, 1),
  ('size_solar_160_200', 'solar-screen-roller', '160x200', '160 × 200 سم', 160.0, 200.0, 2),
  ('size_solar_200_220', 'solar-screen-roller', '200x220', '200 × 220 سم', 200.0, 220.0, 3),

  -- chiffon-champagne
  ('size_chiffon_150_260', 'chiffon-champagne', '150x260', '150 × 260 سم', 150.0, 260.0, 1),
  ('size_chiffon_200_260', 'chiffon-champagne', '200x260', '200 × 260 سم', 200.0, 260.0, 2),
  ('size_chiffon_300_280', 'chiffon-champagne', '300x280', '300 × 280 سم', 300.0, 280.0, 3),

  -- velvet-charcoal
  ('size_velvet_150_260', 'velvet-charcoal', '150x260', '150 × 260 سم', 150.0, 260.0, 1),
  ('size_velvet_200_260', 'velvet-charcoal', '200x260', '200 × 260 سم', 200.0, 260.0, 2),
  ('size_velvet_300_280', 'velvet-charcoal', '300x280', '300 × 280 سم', 300.0, 280.0, 3),

  -- lustre-cocoa
  ('size_lustre_150_260', 'lustre-cocoa', '150x260', '150 × 260 سم', 150.0, 260.0, 1),
  ('size_lustre_200_260', 'lustre-cocoa', '200x260', '200 × 260 سم', 200.0, 260.0, 2),

  -- zebra-roller-dual
  ('size_zebra_120_180', 'zebra-roller-dual', '120x180', '120 × 180 سم', 120.0, 180.0, 1),
  ('size_zebra_160_200', 'zebra-roller-dual', '160x200', '160 × 200 سم', 160.0, 200.0, 2),
  ('size_zebra_200_220', 'zebra-roller-dual', '200x220', '200 × 220 سم', 200.0, 220.0, 3)
on conflict (id) do nothing;

-- Variants Matrix (Unique combination of product + color + size with real JOD prices)
insert into public.product_variants (id, product_id, color_id, size_id, price, stock_quantity, is_available, sku)
values
  -- andalusian-voile (sand, white, champagne) x (150x260: 24.00, 200x260: 32.00, 300x260: 44.00)
  ('var_and_sand_150', 'andalusian-voile', 'color_and_sand', 'size_and_150_260', 24.00, 15, true, 'AND-SND-150'),
  ('var_and_sand_200', 'andalusian-voile', 'color_and_sand', 'size_and_200_260', 32.00, 12, true, 'AND-SND-200'),
  ('var_and_sand_300', 'andalusian-voile', 'color_and_sand', 'size_and_300_260', 44.00, 8, true, 'AND-SND-300'),
  ('var_and_wht_150', 'andalusian-voile', 'color_and_white', 'size_and_150_260', 24.00, 20, true, 'AND-WHT-150'),
  ('var_and_wht_200', 'andalusian-voile', 'color_and_white', 'size_and_200_260', 32.00, 18, true, 'AND-WHT-200'),
  ('var_and_wht_300', 'andalusian-voile', 'color_and_white', 'size_and_300_260', 44.00, 10, true, 'AND-WHT-300'),
  ('var_and_chm_150', 'andalusian-voile', 'color_and_champagne', 'size_and_150_260', 24.00, 14, true, 'AND-CHM-150'),
  ('var_and_chm_200', 'andalusian-voile', 'color_and_champagne', 'size_and_200_260', 32.00, 11, true, 'AND-CHM-200'),
  ('var_and_chm_300', 'andalusian-voile', 'color_and_champagne', 'size_and_300_260', 44.00, 6, true, 'AND-CHM-300'),

  -- nordic-thermal (sand, charcoal, olive) x (150x260: 38.00, 200x260: 48.00, 300x280: 68.00)
  ('var_nordic_sand_150', 'nordic-thermal', 'color_nordic_sand', 'size_nordic_150_260', 38.00, 10, true, 'NOR-SND-150'),
  ('var_nordic_sand_200', 'nordic-thermal', 'color_nordic_sand', 'size_nordic_200_260', 48.00, 8, true, 'NOR-SND-200'),
  ('var_nordic_sand_300', 'nordic-thermal', 'color_nordic_sand', 'size_nordic_300_280', 68.00, 5, true, 'NOR-SND-300'),
  ('var_nordic_chc_150', 'nordic-thermal', 'color_nordic_charcoal', 'size_nordic_150_260', 38.00, 12, true, 'NOR-CHC-150'),
  ('var_nordic_chc_200', 'nordic-thermal', 'color_nordic_charcoal', 'size_nordic_200_260', 48.00, 9, true, 'NOR-CHC-200'),
  ('var_nordic_chc_300', 'nordic-thermal', 'color_nordic_charcoal', 'size_nordic_300_280', 68.00, 6, true, 'NOR-CHC-300'),
  ('var_nordic_olv_150', 'nordic-thermal', 'color_nordic_olive', 'size_nordic_150_260', 38.00, 8, true, 'NOR-OLV-150'),
  ('var_nordic_olv_200', 'nordic-thermal', 'color_nordic_olive', 'size_nordic_200_260', 48.00, 7, true, 'NOR-OLV-200'),
  ('var_nordic_olv_300', 'nordic-thermal', 'color_nordic_olive', 'size_nordic_300_280', 68.00, 4, true, 'NOR-OLV-300'),

  -- raw-linen-natural (white, sand) x (150x260: 32.00, 200x260: 42.00, 250x270: 52.00)
  ('var_raw_wht_150', 'raw-linen-natural', 'color_raw_linen_white', 'size_raw_150_260', 32.00, 16, true, 'RAW-WHT-150'),
  ('var_raw_wht_200', 'raw-linen-natural', 'color_raw_linen_white', 'size_raw_200_260', 42.00, 12, true, 'RAW-WHT-200'),
  ('var_raw_wht_250', 'raw-linen-natural', 'color_raw_linen_white', 'size_raw_250_270', 52.00, 8, true, 'RAW-WHT-250'),
  ('var_raw_snd_150', 'raw-linen-natural', 'color_raw_linen_sand', 'size_raw_150_260', 32.00, 14, true, 'RAW-SND-150'),
  ('var_raw_snd_200', 'raw-linen-natural', 'color_raw_linen_sand', 'size_raw_200_260', 42.00, 10, true, 'RAW-SND-200'),
  ('var_raw_snd_250', 'raw-linen-natural', 'color_raw_linen_sand', 'size_raw_250_270', 52.00, 7, true, 'RAW-SND-250'),

  -- solar-screen-roller (offwhite, charcoal) x (120x180: 28.00, 160x200: 38.00, 200x220: 48.00)
  ('var_solar_wht_120', 'solar-screen-roller', 'color_solar_offwhite', 'size_solar_120_180', 28.00, 18, true, 'SOL-WHT-120'),
  ('var_solar_wht_160', 'solar-screen-roller', 'color_solar_offwhite', 'size_solar_160_200', 38.00, 14, true, 'SOL-WHT-160'),
  ('var_solar_wht_200', 'solar-screen-roller', 'color_solar_offwhite', 'size_solar_200_220', 48.00, 9, true, 'SOL-WHT-200'),
  ('var_solar_chc_120', 'solar-screen-roller', 'color_solar_charcoal', 'size_solar_120_180', 28.00, 15, true, 'SOL-CHC-120'),
  ('var_solar_chc_160', 'solar-screen-roller', 'color_solar_charcoal', 'size_solar_160_200', 38.00, 11, true, 'SOL-CHC-160'),
  ('var_solar_chc_200', 'solar-screen-roller', 'color_solar_charcoal', 'size_solar_200_220', 48.00, 8, true, 'SOL-CHC-200'),

  -- chiffon-champagne (champagne, white) x (150x260: 26.00, 200x260: 34.00, 300x280: 48.00)
  ('var_chiffon_chm_150', 'chiffon-champagne', 'color_chiffon_champagne', 'size_chiffon_150_260', 26.00, 12, true, 'CHF-CHM-150'),
  ('var_chiffon_chm_200', 'chiffon-champagne', 'color_chiffon_champagne', 'size_chiffon_200_260', 34.00, 10, true, 'CHF-CHM-200'),
  ('var_chiffon_chm_300', 'chiffon-champagne', 'color_chiffon_champagne', 'size_chiffon_300_280', 48.00, 7, true, 'CHF-CHM-300'),
  ('var_chiffon_wht_150', 'chiffon-champagne', 'color_chiffon_white', 'size_chiffon_150_260', 26.00, 14, true, 'CHF-WHT-150'),
  ('var_chiffon_wht_200', 'chiffon-champagne', 'color_chiffon_white', 'size_chiffon_200_260', 34.00, 11, true, 'CHF-WHT-200'),
  ('var_chiffon_wht_300', 'chiffon-champagne', 'color_chiffon_white', 'size_chiffon_300_280', 48.00, 8, true, 'CHF-WHT-300'),

  -- velvet-charcoal (charcoal, champagne, olive) x (150x260: 44.00, 200x260: 58.00, 300x280: 78.00)
  ('var_velvet_chc_150', 'velvet-charcoal', 'color_velvet_charcoal', 'size_velvet_150_260', 44.00, 10, true, 'VLV-CHC-150'),
  ('var_velvet_chc_200', 'velvet-charcoal', 'color_velvet_charcoal', 'size_velvet_200_260', 58.00, 8, true, 'VLV-CHC-200'),
  ('var_velvet_chc_300', 'velvet-charcoal', 'color_velvet_charcoal', 'size_velvet_300_280', 78.00, 5, true, 'VLV-CHC-300'),
  ('var_velvet_chm_150', 'velvet-charcoal', 'color_velvet_champagne', 'size_velvet_150_260', 44.00, 9, true, 'VLV-CHM-150'),
  ('var_velvet_chm_200', 'velvet-charcoal', 'color_velvet_champagne', 'size_velvet_200_260', 58.00, 7, true, 'VLV-CHM-200'),
  ('var_velvet_chm_300', 'velvet-charcoal', 'color_velvet_champagne', 'size_velvet_300_280', 78.00, 4, true, 'VLV-CHM-300'),
  ('var_velvet_olv_150', 'velvet-charcoal', 'color_velvet_olive', 'size_velvet_150_260', 44.00, 8, true, 'VLV-OLV-150'),
  ('var_velvet_olv_200', 'velvet-charcoal', 'color_velvet_olive', 'size_velvet_200_260', 58.00, 6, true, 'VLV-OLV-200'),
  ('var_velvet_olv_300', 'velvet-charcoal', 'color_velvet_olive', 'size_velvet_300_280', 78.00, 3, true, 'VLV-OLV-300'),

  -- lustre-cocoa (cocoa, warmgrey) x (150x260: 36.00, 200x260: 46.00)
  ('var_lustre_coc_150', 'lustre-cocoa', 'color_lustre_cocoa', 'size_lustre_150_260', 36.00, 11, true, 'LUS-COC-150'),
  ('var_lustre_coc_200', 'lustre-cocoa', 'color_lustre_cocoa', 'size_lustre_200_260', 46.00, 9, true, 'LUS-COC-200'),
  ('var_lustre_gry_150', 'lustre-cocoa', 'color_lustre_warmgrey', 'size_lustre_150_260', 36.00, 13, true, 'LUS-GRY-150'),
  ('var_lustre_gry_200', 'lustre-cocoa', 'color_lustre_warmgrey', 'size_lustre_200_260', 46.00, 10, true, 'LUS-GRY-200'),

  -- zebra-roller-dual (cream, mocha) x (120x180: 32.00, 160x200: 44.00, 200x220: 56.00)
  ('var_zebra_crm_120', 'zebra-roller-dual', 'color_zebra_cream', 'size_zebra_120_180', 32.00, 14, true, 'ZEB-CRM-120'),
  ('var_zebra_crm_160', 'zebra-roller-dual', 'color_zebra_cream', 'size_zebra_160_200', 44.00, 10, true, 'ZEB-CRM-160'),
  ('var_zebra_crm_200', 'zebra-roller-dual', 'color_zebra_cream', 'size_zebra_200_220', 56.00, 7, true, 'ZEB-CRM-200'),
  ('var_zebra_mch_120', 'zebra-roller-dual', 'color_zebra_mocha', 'size_zebra_120_180', 32.00, 12, true, 'ZEB-MCH-120'),
  ('var_zebra_mch_160', 'zebra-roller-dual', 'color_zebra_mocha', 'size_zebra_160_200', 44.00, 9, true, 'ZEB-MCH-160'),
  ('var_zebra_mch_200', 'zebra-roller-dual', 'color_zebra_mocha', 'size_zebra_200_220', 56.00, 6, true, 'ZEB-MCH-200')
on conflict (id) do nothing;

commit;
