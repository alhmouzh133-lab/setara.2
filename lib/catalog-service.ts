import { createClient as createServerSupabase } from '@/lib/supabase/server';
import {
  CATEGORIES as STATIC_CATEGORIES,
  PRODUCTS as STATIC_PRODUCTS,
  CategoryInfo,
  Product,
  ProductVariant,
  ColorOption,
  SizeOption,
} from './shop-data';

export interface DbCategory {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  image: string;
  display_order: number;
  is_active: boolean;
}

export interface DbProductColor {
  id: string;
  product_id: string;
  color_key: string;
  name: string;
  hex: string;
  image: string;
  gallery: string[];
  display_order: number;
}

export interface DbProductSize {
  id: string;
  product_id: string;
  size_key: string;
  label: string;
  width_cm: number;
  height_cm: number;
  display_order: number;
}

export interface DbProductVariant {
  id: string;
  product_id: string;
  color_id: string;
  size_id: string;
  price: number;
  stock_quantity: number;
  is_available: boolean;
  sku: string | null;
}

export interface DbProductFull {
  id: string;
  slug: string;
  name: string;
  category_id: string;
  short_desc: string;
  description: string;
  fabric: string;
  light_blocking: string;
  care: string[];
  features: string[];
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  category?: DbCategory;
  colors: DbProductColor[];
  sizes: DbProductSize[];
  variants: DbProductVariant[];
}

/**
 * Fetch categories for the public storefront.
 * Uses Supabase when credentials exist, falling back gracefully to static seed data.
 */
export async function getStorefrontCategories(): Promise<CategoryInfo[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return STATIC_CATEGORIES;
  }

  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from('categories')
      .select('id, slug, name, subtitle, description, image, display_order, is_active')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return STATIC_CATEGORIES;
    }

    return data.map((c) => ({
      id: c.id as CategoryInfo['id'],
      name: c.name,
      subtitle: c.subtitle || '',
      description: c.description || '',
      image: c.image,
    }));
  } catch {
    return STATIC_CATEGORIES;
  }
}

/**
 * Fetch products for the public storefront.
 * Maps relational DB structures (products + colors + sizes + variants) to storefront Product contract.
 */
export async function getStorefrontProducts(): Promise<Product[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return STATIC_PRODUCTS;
  }

  try {
    const supabase = await createServerSupabase();

    let dbProducts: any[] | null = null;
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
        category:categories(id, name),
        colors:product_colors(id, product_id, color_key, name, hex, image, gallery, display_order),
        sizes:product_sizes(id, product_id, size_key, label, width_cm, height_cm, display_order),
        variants:product_variants(id, product_id, color_id, size_id, price, stock_quantity, is_available, sku)
      `)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    dbProducts = initialQuery.data;
    error = initialQuery.error;

    // Defensive fallback: if remote database has not added main_image column yet, query without it
    if (error && (error.code === '42703' || error.message?.includes('main_image'))) {
      const fallbackQuery = await supabase
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
          category:categories(id, name),
          colors:product_colors(id, product_id, color_key, name, hex, image, gallery, display_order),
          sizes:product_sizes(id, product_id, size_key, label, width_cm, height_cm, display_order),
          variants:product_variants(id, product_id, color_id, size_id, price, stock_quantity, is_available, sku)
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      dbProducts = fallbackQuery.data;
      error = fallbackQuery.error;
    }

    if (error || !dbProducts || dbProducts.length === 0) {
      return STATIC_PRODUCTS;
    }

    return dbProducts.map((p: any) => {
      const colors: ColorOption[] = (p.colors || [])
        .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
        .map((c: any) => ({
          id: c.id || c.color_key,
          name: c.name,
          hex: c.hex,
          image: c.image,
          gallery: Array.isArray(c.gallery) && c.gallery.length > 0 ? c.gallery : [c.image],
        }));

      // Calculate size prices from variants
      const sizes: SizeOption[] = (p.sizes || [])
        .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
        .map((s: any) => {
          const matchingVariants = (p.variants || []).filter((v: any) => v.size_id === s.id && v.is_available);
          const price = matchingVariants.length > 0
            ? Math.min(...matchingVariants.map((v: any) => Number(v.price)))
            : 0;

          return {
            id: s.id || s.size_key,
            label: s.label,
            widthCm: Number(s.width_cm),
            heightCm: Number(s.height_cm),
            price,
          };
        });

      // Primary image: dedicated main_image or fallback to first color's image
      const primaryImage = p.main_image || colors[0]?.image || '/images/hero.jpg';
      const colorImages = colors.flatMap((c) => (c.gallery && c.gallery.length > 0 ? c.gallery : [c.image]));
      const allImages = [primaryImage, ...colorImages.filter((img) => img !== primaryImage)];
      const uniqueImages = Array.from(new Set(allImages.filter(Boolean)));

      // Map variants linking color_id and size_id with price, quantity, and availability
      const variants: ProductVariant[] = (p.variants || []).map((v: any) => ({
        id: v.id,
        productId: p.id,
        colorId: v.color_id,
        sizeId: v.size_id,
        price: Number(v.price) >= 0 ? Number(v.price) : 25,
        stockQuantity: Number(v.stock_quantity ?? 10),
        isAvailable: Boolean(v.is_available),
        sku: v.sku || undefined,
      }));

      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: p.category_id as Product['category'],
        categoryName: p.category?.name || 'ستائر',
        shortDesc: p.short_desc,
        description: p.description,
        fabric: p.fabric,
        lightBlocking: p.light_blocking,
        colors,
        sizes,
        variants,
        mainImage: primaryImage,
        images: uniqueImages.length > 0 ? uniqueImages : ['/images/hero.jpg'],
        care: Array.isArray(p.care) ? p.care : [],
        features: Array.isArray(p.features) ? p.features : [],
        isFeatured: Boolean(p.is_featured),
      };
    });
  } catch {
    return STATIC_PRODUCTS;
  }
}
