// ============================================================================
// سيتارة | SETARA - Dedicated Local Product Catalog & Centralized Fabrics
// ============================================================================
// Self-contained, typed catalog with centralized shared fabrics and stable
// image resolution across curtain types (Electric, Manual, Roller).
// ============================================================================

export interface ColorOption {
  id: string; // 'ivory' | 'sand' | 'cocoa' | 'charcoal' | 'white'
  name: string;
  hex: string;
  image: string;
  gallery: string[];
}

export interface FabricOption {
  id: string; // 'linen' | 'velvet' | 'chiffon' | 'blackout' | 'screen' | 'zebra'
  name: string; // 'كتان طبيعي' | 'مخمل ناعم' | 'شيفون انسيابي' | 'بلاك أوت' | 'سكرين' | 'زيبرا'
  description: string;
  badge?: string;
}

export interface SizeOption {
  id: string;
  label: string;
  widthCm: number;
  heightCm: number;
  price: number;
  variantId?: string;
  stockQuantity?: number;
}

export interface FabricCurtainPricingMetadata {
  standardWidthCm: number;
  standardHeightCm: number;
  maxIncludedHeightCm: number;
  basePrice: number;
  pricePerCm: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  curtainType: 'electric' | 'manual' | 'roller';
  category: 'electric' | 'manual' | 'roller' | string;
  categoryName: string;
  shortDesc: string;
  description: string;
  fabric: string;
  lightBlocking: string;
  mainImage: string;
  images: string[];
  defaultFabricId: string;
  colors: ColorOption[];
  sizes: SizeOption[];
  care: string[];
  features: string[];
  isFeatured?: boolean;
  isUnpriced?: boolean;
  priceDisplay?: string;
  standardHeightCm?: number;
  curtainStyles?: string[]; // e.g. ['ويفي', 'أمريكي']
  liningOptions?: string[]; // e.g. ['بطانة 50%', 'بطانة 80%', 'تعتيم 100% — Blackout']
  pricingMeta?: FabricCurtainPricingMetadata;
  fabricOptions?: FabricOption[];
}

export interface CategoryInfo {
  id: 'all' | 'electric' | 'manual' | 'roller' | string;
  name: string;
  subtitle: string;
  description: string;
  image: string;
}

// ----------------------------------------------------------------------------
// 1. Centralized Fabric Definitions (Shared across EVERY curtain type)
// ----------------------------------------------------------------------------
export const CENTRAL_FABRICS: FabricOption[] = [
  {
    id: 'linen',
    name: 'كتان طبيعي',
    description: 'نسيج كتاني طبيعي مريح ينسدل بخفة وأناقة ويسمح بتدفق ناعم لضوء النهار.',
    badge: 'طبيعي انسيابي',
  },
  {
    id: 'velvet',
    name: 'مخمل ناعم',
    description: 'مخمل فاخر بملمس ناعم وعزل حراري وصوتي عالي مع ثنيات فخمة متناسقة.',
    badge: 'فاخر ثقيل',
  },
  {
    id: 'chiffon',
    name: 'شيفون انسيابي',
    description: 'شيفون خفيف الوزن ينسدل برقة فوق النوافذ ويمنح المكان لمسة هادئة ومريحة.',
    badge: 'شفاف لطيف',
  },
  {
    id: 'blackout',
    name: 'بلاك أوت',
    description: 'قماش معتم تماماً بنسبة 100% يحجب الضوء الخارجي ويحفظ برودة الغرفة وسكونها.',
    badge: 'تعتيم 100%',
  },
  {
    id: 'screen',
    name: 'سكرين',
    description: 'نسيج شبكي شمسي يرشح وهج الشمس والحرارة مع الحفاظ على وضوح الرؤية للخارج.',
    badge: 'واقي شمسي ميكروي',
  },
  {
    id: 'zebra',
    name: 'زيبرا',
    description: 'شرائح أفقية متناوبة تتيح التبديل الفوري بين الشفافية والخصوصية بحركة سحب واحدة.',
    badge: 'شرائح متناوبة',
  },
];

// ----------------------------------------------------------------------------
// 1b. Dedicated Electric Fabric Options (Replacing "شيفون" with "لينين")
// ----------------------------------------------------------------------------
export const ELECTRIC_FABRICS: FabricOption[] = [
  {
    id: 'linen',
    name: 'كتان طبيعي',
    description: 'نسيج كتاني طبيعي مريح ينسدل بخفة وأناقة ويسمح بتدفق ناعم لضوء النهار.',
    badge: 'طبيعي انسيابي',
  },
  {
    id: 'velvet',
    name: 'مخمل ناعم',
    description: 'مخمل فاخر بملمس ناعم وعزل حراري وصوتي عالي مع ثنيات فخمة متناسقة.',
    badge: 'فاخر ثقيل',
  },
  {
    id: 'flax_linen',
    name: 'لينين',
    description: 'قماش لينين راقٍ بنسيج أوروبي فاخر ومظهر طبيعي متهدل بطيات مميزة.',
    badge: 'لينين فاخر',
  },
  {
    id: 'blackout',
    name: 'بلاك أوت',
    description: 'قماش معتم تماماً بنسبة 100% يحجب الضوء الخارجي ويحفظ برودة الغرفة وسكونها.',
    badge: 'تعتيم 100%',
  },
  {
    id: 'screen',
    name: 'سكرين',
    description: 'نسيج شبكي شمسي يرشح وهج الشمس والحرارة مع الحفاظ على وضوح الرؤية للخارج.',
    badge: 'واقي شمسي ميكروي',
  },
  {
    id: 'zebra',
    name: 'زيبرا',
    description: 'شرائح أفقية متناوبة تتيح التبديل الفوري بين الشفافية والخصوصية بحركة سحب واحدة.',
    badge: 'شرائح متناوبة',
  },
];

// ----------------------------------------------------------------------------
// 2. Centralized Color Definitions
// ----------------------------------------------------------------------------
export const CENTRAL_COLORS: ColorOption[] = [
  {
    id: 'ivory',
    name: 'عاجي طبيعي',
    hex: '#F5EFE6',
    image: '/images/curtain_manual.jpg',
    gallery: ['/images/curtain_manual.jpg'],
  },
  {
    id: 'sand',
    name: 'رملي دافئ',
    hex: '#D8C6AE',
    image: '/images/linen_sheer_sand.jpg',
    gallery: ['/images/linen_sheer_sand.jpg'],
  },
  {
    id: 'cocoa',
    name: 'كاكاو داكن',
    hex: '#2A201A',
    image: '/images/lustre_cocoa.jpg',
    gallery: ['/images/lustre_cocoa.jpg'],
  },
  {
    id: 'charcoal',
    name: 'رمادي حجري',
    hex: '#4A4846',
    image: '/images/curtain_charcoal_roller.jpg',
    gallery: ['/images/curtain_charcoal_roller.jpg'],
  },
  {
    id: 'white',
    name: 'أبيض ناصع',
    hex: '#FFFFFF',
    image: '/images/linen_sheer_white.jpg',
    gallery: ['/images/linen_sheer_white.jpg'],
  },
];

// ----------------------------------------------------------------------------
// 3. Stable Image Resolution Engine
// ----------------------------------------------------------------------------
// Resolves displayed image from: curtainType + fabricId + colorId
// Every combination maps to a verified authentic local asset without faking filters.
// ----------------------------------------------------------------------------
export const IMAGE_MAP: Record<string, string> = {
  // --- ROLLER CURTAINS ---
  'roller:zebra:ivory': '/images/roller_zebra.jpg',
  'roller:zebra:sand': '/images/roller_zebra_cream.jpg',
  'roller:zebra:cocoa': '/images/curtain_mocha_roller.jpg',
  'roller:zebra:charcoal': '/images/roller_zebra_charcoal.jpg',
  'roller:zebra:white': '/images/roller_zebra_white.jpg',

  'roller:blackout:ivory': '/images/roller_blackout_ivory.jpg',
  'roller:blackout:sand': '/images/roller_blackout_sand.jpg',
  'roller:blackout:cocoa': '/images/roller_blackout_cocoa.jpg',
  'roller:blackout:charcoal': '/images/curtain_charcoal_roller.jpg',
  'roller:blackout:white': '/images/roller_blackout_white.jpg',

  'roller:screen:ivory': '/images/roller_screen_ivory.jpg',
  'roller:screen:sand': '/images/roller_screen_sand.jpg',
  'roller:screen:cocoa': '/images/roller_screen.jpg',
  'roller:screen:charcoal': '/images/roller_screen_charcoal.jpg',
  'roller:screen:white': '/images/roller_screen_white.jpg',

  'roller:linen:ivory': '/images/roller_linen_ivory.jpg',
  'roller:linen:sand': '/images/roller_linen_sand.jpg',
  'roller:linen:cocoa': '/images/roller_linen_cocoa.jpg',
  'roller:linen:charcoal': '/images/roller_linen_charcoal.jpg',
  'roller:linen:white': '/images/roller_linen_white.jpg',

  'roller:velvet:ivory': '/images/roller_velvet_ivory.jpg',
  'roller:velvet:sand': '/images/roller_velvet_sand.jpg',
  'roller:velvet:cocoa': '/images/roller_velvet_cocoa.jpg',
  'roller:velvet:charcoal': '/images/roller_velvet_charcoal.jpg',
  'roller:velvet:white': '/images/roller_velvet_white.jpg',

  'roller:chiffon:ivory': '/images/roller_chiffon_ivory.jpg',
  'roller:chiffon:sand': '/images/roller_chiffon_sand.jpg',
  'roller:chiffon:cocoa': '/images/roller_chiffon_cocoa.jpg',
  'roller:chiffon:charcoal': '/images/roller_chiffon_charcoal.jpg',
  'roller:chiffon:white': '/images/roller_chiffon_white.jpg',

  // --- ELECTRIC CURTAINS ---
  'electric:linen:ivory': '/images/curtain_electric.jpg',
  'electric:linen:sand': '/images/linen_sheer_sand.jpg',
  'electric:linen:cocoa': '/images/lustre_cocoa.jpg',
  'electric:linen:charcoal': '/images/curtain_linen_charcoal.jpg',
  'electric:linen:white': '/images/linen_sheer_white.jpg',

  // Electric Linen: Specific Style & Lining Combinations
  'electric:linen:ivory:wave:lining50': '/images/elec_linen_iv_w_50.jpg',
  'electric:linen:ivory:wave:lining80': '/images/elec_linen_iv_w_80.jpg',
  'electric:linen:ivory:wave:lining100': '/images/elec_linen_iv_w_100.jpg',
  'electric:linen:ivory:american:lining50': '/images/elec_linen_iv_am_50.jpg',
  'electric:linen:ivory:american:lining80': '/images/elec_linen_iv_am_80.jpg',
  'electric:linen:ivory:american:lining100': '/images/elec_linen_iv_am_100.jpg',
  'electric:linen:ivory:wave': '/images/elec_linen_iv_w_50.jpg',
  'electric:linen:ivory:american': '/images/elec_linen_iv_am_50.jpg',

  // Electric "لينين" (flax_linen): Dedicated linen texture across styles & linings
  'electric:flax_linen:ivory:wave:lining50': '/images/elec_flax_ivory_w.jpg',
  'electric:flax_linen:ivory:wave:lining80': '/images/elec_flax_iv_w_80.jpg',
  'electric:flax_linen:ivory:wave:lining100': '/images/elec_flax_iv_w_100.jpg',
  'electric:flax_linen:ivory:american:lining50': '/images/elec_flax_ivory_am.jpg',
  'electric:flax_linen:ivory:american:lining80': '/images/elec_flax_iv_w_80.jpg',
  'electric:flax_linen:ivory:american:lining100': '/images/elec_flax_iv_w_100.jpg',
  'electric:flax_linen:ivory:wave': '/images/elec_flax_ivory_w.jpg',
  'electric:flax_linen:ivory:american': '/images/elec_flax_ivory_am.jpg',
  'electric:flax_linen:ivory': '/images/elec_flax_ivory_w.jpg',

  'electric:flax_linen:sand:wave': '/images/elec_flax_sand_w.jpg',
  'electric:flax_linen:sand:american': '/images/elec_flax_sand_am.jpg',
  'electric:flax_linen:sand:wave:lining80': '/images/elec_flax_sand_w_80.jpg',
  'electric:flax_linen:sand': '/images/elec_flax_sand_w.jpg',

  'electric:flax_linen:cocoa:wave': '/images/elec_flax_cocoa_w.jpg',
  'electric:flax_linen:cocoa:american': '/images/elec_flax_cocoa_am.jpg',
  'electric:flax_linen:cocoa': '/images/elec_flax_cocoa_w.jpg',

  'electric:flax_linen:charcoal:wave': '/images/elec_flax_charcoal_w.jpg',
  'electric:flax_linen:charcoal:american': '/images/elec_flax_charcoal_am.jpg',
  'electric:flax_linen:charcoal': '/images/elec_flax_charcoal_w.jpg',

  'electric:flax_linen:white:wave': '/images/elec_flax_white_w.jpg',
  'electric:flax_linen:white:american': '/images/elec_flax_white_am.jpg',
  'electric:flax_linen:white': '/images/elec_flax_white_w.jpg',

  'electric:velvet:ivory': '/images/velvet_champagne.jpg',
  'electric:velvet:sand': '/images/craft_textures.jpg',
  'electric:velvet:cocoa': '/images/curtain_velvet_cocoa.jpg',
  'electric:velvet:charcoal': '/images/velvet_charcoal.jpg',
  'electric:velvet:white': '/images/raw_linen_white.jpg',
  'electric:velvet:ivory:wave': '/images/velvet_champagne.jpg',
  'electric:velvet:ivory:american': '/images/elec_velvet_iv_am.jpg',
  'electric:velvet:cocoa:wave': '/images/curtain_velvet_cocoa.jpg',
  'electric:velvet:cocoa:american': '/images/elec_velvet_cocoa_am.jpg',
  'electric:velvet:charcoal:wave': '/images/velvet_charcoal.jpg',
  'electric:velvet:charcoal:american': '/images/elec_velvet_charcoal_am.jpg',

  'electric:chiffon:ivory': '/images/prod_andalusian.jpg',
  'electric:chiffon:sand': '/images/chiffon_champagne.jpg',
  'electric:chiffon:cocoa': '/images/chiffon_cocoa.jpg',
  'electric:chiffon:charcoal': '/images/chiffon_charcoal.jpg',
  'electric:chiffon:white': '/images/chiffon_white.jpg',

  'electric:blackout:ivory': '/images/curtain_blackout_ivory.jpg',
  'electric:blackout:sand': '/images/curtain_blackout_sand.jpg',
  'electric:blackout:cocoa': '/images/cat_blackout.jpg',
  'electric:blackout:charcoal': '/images/curtain_blackout_charcoal.jpg',
  'electric:blackout:white': '/images/curtain_blackout_white.jpg',
  'electric:blackout:ivory:wave': '/images/curtain_blackout_ivory.jpg',
  'electric:blackout:ivory:american': '/images/elec_blackout_iv_am.jpg',
  'electric:blackout:sand:wave': '/images/curtain_blackout_sand.jpg',
  'electric:blackout:sand:american': '/images/elec_blackout_sand_am.jpg',
  'electric:blackout:charcoal:wave': '/images/curtain_blackout_charcoal.jpg',
  'electric:blackout:charcoal:american': '/images/elec_blackout_charcoal_am.jpg',

  'electric:screen:ivory': '/images/solar_offwhite.jpg',
  'electric:screen:sand': '/images/prod_solar.jpg',
  'electric:screen:cocoa': '/images/roller_screen.jpg',
  'electric:screen:charcoal': '/images/roller_screen_charcoal.jpg',
  'electric:screen:white': '/images/roller_screen_white.jpg',

  'electric:zebra:ivory': '/images/roller_zebra.jpg',
  'electric:zebra:sand': '/images/roller_zebra_cream.jpg',
  'electric:zebra:cocoa': '/images/curtain_mocha_roller.jpg',
  'electric:zebra:charcoal': '/images/roller_zebra_charcoal.jpg',
  'electric:zebra:white': '/images/roller_zebra_white.jpg',

  // --- MANUAL CURTAINS ---
  'manual:linen:ivory': '/images/curtain_manual.jpg',
  'manual:linen:sand': '/images/linen_sheer_sand.jpg',
  'manual:linen:cocoa': '/images/lustre_cocoa.jpg',
  'manual:linen:charcoal': '/images/curtain_linen_charcoal.jpg',
  'manual:linen:white': '/images/linen_sheer_white.jpg',

  'manual:velvet:ivory': '/images/velvet_champagne.jpg',
  'manual:velvet:sand': '/images/craft_textures.jpg',
  'manual:velvet:cocoa': '/images/curtain_velvet_cocoa.jpg',
  'manual:velvet:charcoal': '/images/velvet_charcoal.jpg',
  'manual:velvet:white': '/images/raw_linen_white.jpg',

  'manual:chiffon:ivory': '/images/prod_andalusian.jpg',
  'manual:chiffon:sand': '/images/chiffon_champagne.jpg',
  'manual:chiffon:cocoa': '/images/chiffon_cocoa.jpg',
  'manual:chiffon:charcoal': '/images/chiffon_charcoal.jpg',
  'manual:chiffon:white': '/images/chiffon_white.jpg',

  'manual:blackout:ivory': '/images/curtain_blackout_ivory.jpg',
  'manual:blackout:sand': '/images/curtain_blackout_sand.jpg',
  'manual:blackout:cocoa': '/images/cat_blackout.jpg',
  'manual:blackout:charcoal': '/images/curtain_blackout_charcoal.jpg',
  'manual:blackout:white': '/images/curtain_blackout_white.jpg',

  'manual:screen:ivory': '/images/solar_offwhite.jpg',
  'manual:screen:sand': '/images/prod_solar.jpg',
  'manual:screen:cocoa': '/images/roller_screen.jpg',
  'manual:screen:charcoal': '/images/roller_screen_charcoal.jpg',
  'manual:screen:white': '/images/roller_screen_white.jpg',

  'manual:zebra:ivory': '/images/roller_zebra.jpg',
  'manual:zebra:sand': '/images/roller_zebra_cream.jpg',
  'manual:zebra:cocoa': '/images/curtain_mocha_roller.jpg',
  'manual:zebra:charcoal': '/images/roller_zebra_charcoal.jpg',
  'manual:zebra:white': '/images/roller_zebra_white.jpg',
};

export function resolveCurtainImage(
  curtainType: string,
  fabricId: string,
  colorId: string,
  style?: string,
  lining?: string
): string {
  const normType = curtainType.toLowerCase().trim();
  const normFabric = fabricId.toLowerCase().trim();
  const normColor = colorId.toLowerCase().trim();

  // Normalize style
  const normStyle = style === 'أمريكي' || style === 'american' ? 'american' : 'wave';

  // Normalize lining
  const normLining =
    lining?.includes('100') || lining?.includes('Blackout')
      ? 'lining100'
      : lining?.includes('80')
      ? 'lining80'
      : 'lining50';

  // 1. Try full 5-key exact match: type:fabric:color:style:lining
  const fullKey = `${normType}:${normFabric}:${normColor}:${normStyle}:${normLining}`;
  if (IMAGE_MAP[fullKey]) {
    return IMAGE_MAP[fullKey];
  }

  // 2. Try 4-key style match: type:fabric:color:style
  const styleKey = `${normType}:${normFabric}:${normColor}:${normStyle}`;
  if (IMAGE_MAP[styleKey]) {
    return IMAGE_MAP[styleKey];
  }

  // 3. Try standard 3-key match: type:fabric:color
  const key = `${normType}:${normFabric}:${normColor}`;
  if (IMAGE_MAP[key]) {
    return IMAGE_MAP[key];
  }

  // Fallbacks by fabric and color
  const fabricColorKey = `roller:${normFabric}:${normColor}`;
  if (IMAGE_MAP[fabricColorKey]) {
    return IMAGE_MAP[fabricColorKey];
  }

  // Fallback by color
  const colorMatch = CENTRAL_COLORS.find((c) => c.id === normColor);
  if (colorMatch?.image) {
    return colorMatch.image;
  }

  return '/images/curtain_manual.jpg';
}

// ----------------------------------------------------------------------------
// 4. Stored Base-Pricing Metadata (for upcoming phase)
// ----------------------------------------------------------------------------
export const FABRIC_CURTAINS_METADATA: Record<'electric' | 'manual', FabricCurtainPricingMetadata> = {
  electric: {
    standardWidthCm: 250,
    standardHeightCm: 300,
    maxIncludedHeightCm: 360,
    basePrice: 120, // 120 JOD per standard 250 cm curtain
    pricePerCm: 0.48, // 120 / 250 = 0.48 JOD per cm
  },
  manual: {
    standardWidthCm: 250,
    standardHeightCm: 300,
    maxIncludedHeightCm: 360,
    basePrice: 70, // 70 JOD per standard 250 cm curtain
    pricePerCm: 0.28, // 70 / 250 = 0.28 JOD per cm
  },
};

// ----------------------------------------------------------------------------
// 5. Storefront Categories
// ----------------------------------------------------------------------------
export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'electric',
    name: 'ستائر كهربائية',
    subtitle: 'مسار آلي بمحرك — 120 د.أ',
    description: 'ستائر فاخرة تعمل بمحرك كهربائي ومسار سقفي انسيابي، مقاس معياري 250 × 300 سم بكافة خيارات الأقمشة.',
    image: '/images/curtain_electric.jpg',
  },
  {
    id: 'manual',
    name: 'ستائر عادية',
    subtitle: 'تشغيل يدوي كلاسيكي — 70 د.أ',
    description: 'ستائر قماشية يدوية بدون محرك بطيات ويفي أو أمريكي أنيقة، مقاس معياري 250 × 300 سم بكافة خيارات الأقمشة.',
    image: '/images/curtain_manual.jpg',
  },
  {
    id: 'roller',
    name: 'ستائر رول',
    subtitle: 'بلاك أوت، سكرين، وزيبرا',
    description: 'حلول عملية مستقيمة للنوافذ بارتفاع معياري 300 سم تعمل بسحب بحبل سلس، والسعر عند الاستفسار.',
    image: '/images/roller_blackout.jpg',
  },
];

// ----------------------------------------------------------------------------
// 6. Products Catalog
// ----------------------------------------------------------------------------
export const PRODUCTS: Product[] = [
  // 1. ستائر كهربائية
  {
    id: 'curtain-electric',
    slug: 'electric-curtain',
    name: 'ستائر كهربائية',
    curtainType: 'electric',
    category: 'electric',
    categoryName: 'ستائر كهربائية',
    shortDesc: 'ستارة تعمل بمحرك كهربائي ومسار سقفي انسيابي، مقاس معياري 250 × 300 سم بسعر 120 د.أ.',
    description: 'ستارة فاخرة بمحرك كهربائي هادئ وعالي الجودة لفتح وإغلاق الستارة بسلاسة. تشمل خيارات تفصيل ويفي أو أمريكي مع خيارات بطانة متعددة، وسعر موحد لكافة خيارات الأقمشة.',
    fabric: 'تشمل جميع خيارات الأقمشة (كتان، مخمل، لينين، بلاك أوت، سكرين، زيبرا)',
    lightBlocking: 'حسب نوع القماش والبطانة المختارة',
    mainImage: '/images/curtain_electric.jpg',
    images: ['/images/curtain_electric.jpg', '/images/linen_sheer_sand.jpg', '/images/velvet_champagne.jpg'],
    defaultFabricId: 'linen',
    curtainStyles: ['ويفي', 'أمريكي'],
    liningOptions: ['بطانة 50%', 'بطانة 80%', 'تعتيم 100% — Blackout'],
    pricingMeta: FABRIC_CURTAINS_METADATA.electric,
    fabricOptions: ELECTRIC_FABRICS,
    colors: CENTRAL_COLORS,
    sizes: [
      {
        id: 'std-electric',
        label: '250 × 300 سم (مقاس معياري)',
        widthCm: 250,
        heightCm: 300,
        price: 120,
      },
    ],
    care: ['تنظيف جاف موصى به للمحافظة على انسيابية الطيات', 'مسح المسار بقطعة قماش ناعمة جافة'],
    features: [
      'محرك كهربائي هادئ ومتين مع مسار سقفي',
      'مقاس معياري: 250 سم عرض × 300 سم ارتفاع',
      'خيارات تفصيل: طيات ويفي أو أمريكي',
      'خيارات أقمشة كاملة: كتان، مخمل، لينين، بلاك أوت، سكرين، وزيبرا',
      'سعر موحد ثابت 120 د.أ لجميع أنواع الأقمشة والألوان',
    ],
    isFeatured: true,
  },

  // 2. ستارة عادية
  {
    id: 'curtain-manual',
    slug: 'manual-curtain',
    name: 'ستارة عادية',
    curtainType: 'manual',
    category: 'manual',
    categoryName: 'ستائر عادية',
    shortDesc: 'ستارة قماشية يدوية انسيابية بدون محرك، مقاس معياري 250 × 300 سم بسعر 70 د.أ.',
    description: 'ستارة قماشية كلاسيكية بتشغيل يدوي تقليدي سلس بدون محرك كهربائي. تتوفر بموديل طيات ويفي أو أمريكي ونفس تشكيلة الأقمشة الكاملة بسعر موحد 70 د.أ.',
    fabric: 'تشمل جميع خيارات الأقمشة (كتان، مخمل، شيفون، بلاك أوت، سكرين، زيبرا)',
    lightBlocking: 'حسب نوع القماش والبطانة المختارة',
    mainImage: '/images/curtain_manual.jpg',
    images: ['/images/curtain_manual.jpg', '/images/linen_sheer_white.jpg', '/images/velvet_charcoal.jpg'],
    defaultFabricId: 'linen',
    curtainStyles: ['ويفي', 'أمريكي'],
    liningOptions: ['بطانة 50%', 'بطانة 80%', 'تعتيم 100% — Blackout'],
    pricingMeta: FABRIC_CURTAINS_METADATA.manual,
    colors: CENTRAL_COLORS,
    sizes: [
      {
        id: 'std-manual',
        label: '250 × 300 سم (مقاس معياري)',
        widthCm: 250,
        heightCm: 300,
        price: 70,
      },
    ],
    care: ['تنظيف جاف أو غسيل لطيف حسب نوع القماش', 'كي خفيف بالبخار لترتيب الطيات'],
    features: [
      'تشغيل يدوي كلاسيكي سلس بدون محرك',
      'مقاس معياري: 250 سم عرض × 300 سم ارتفاع',
      'خيارات تفصيل: طيات ويفي أو أمريكي',
      'خيارات أقمشة كاملة: كتان، مخمل، شيفون، بلاك أوت، سكرين، وزيبرا',
      'سعر موحد ثابت 70 د.أ لجميع أنواع الأقمشة والألوان',
    ],
    isFeatured: true,
  },

  // 3. رول بلاك أوت
  {
    id: 'roller-blackout',
    slug: 'roller-blackout',
    name: 'رول بلاك أوت',
    curtainType: 'roller',
    category: 'roller',
    categoryName: 'ستائر رول',
    shortDesc: 'ستارة رول معتمة تماماً 100% لحجب الضوء والحرارة، بسحب بحبل سلس وارتفاع معياري 300 سم.',
    description: 'ستارة رول معتمة متينة تضمن حجب أشعة الشمس والضوء بنسبة 100% لتوفير أقصى درجات الخصوصية والهدوء. تعمل بآلية سحب بحبل سلس، بارتفاع معياري 300 سم، والسعر عند الاستفسار.',
    fabric: 'قماش بلاك أوت عازل تماماً مع إمكانية اختيار أي خامة أخرى',
    lightBlocking: 'تعتيم كامل 100% وحجب حراري ممتاز',
    mainImage: '/images/roller_blackout.jpg',
    images: ['/images/roller_blackout.jpg', '/images/roller_blackout_sand.jpg', '/images/roller_blackout_cocoa.jpg'],
    defaultFabricId: 'blackout',
    isUnpriced: true,
    priceDisplay: 'السعر عند الاستفسار',
    standardHeightCm: 300,
    colors: CENTRAL_COLORS,
    sizes: [
      {
        id: 'std-r-blackout',
        label: 'ارتفاع معياري 300 سم (العرض حسب الطلب)',
        widthCm: 250,
        heightCm: 300,
        price: 0,
      },
    ],
    care: ['مسح بإسفنجة رطبة خفيفة ومسحوق لطيف', 'مقاوم للغبار والرطوبة'],
    features: [
      'حجب كامل للضوء 100% لتعتيم مثالي',
      'آلية سحب بحبل ميكانيكي سلس ومتين',
      'ارتفاع معياري معروض: 300 سم',
      'السعر عند الاستفسار عبر واتساب',
    ],
    isFeatured: true,
  },

  // 4. رول سكرين
  {
    id: 'roller-screen',
    slug: 'roller-screen',
    name: 'رول سكرين',
    curtainType: 'roller',
    category: 'roller',
    categoryName: 'ستائر رول',
    shortDesc: 'ستارة رول شبكية تكسر الوهج وأشعة الشمس مع وضوح الرؤية للخارج، بسحب بحبل.',
    description: 'نسيج شبكي ميكروي معاصر يخفف حدة الضوء والوهج بنعومة داخل الغرفة مع الحفاظ على وضوح الرؤية الخارجية نهاراً. تعمل بحبل سحب يدوي سلس، بارتفاع معياري 300 سم.',
    fabric: 'ألياف شبكية واقية من الأشعة فوق البنفسجية والحرارة (Solar Mesh)',
    lightBlocking: 'ترشيح الوهج مع وضوح الرؤية للخارج',
    mainImage: '/images/roller_screen.jpg',
    images: ['/images/roller_screen.jpg', '/images/prod_solar.jpg', '/images/solar_offwhite.jpg'],
    defaultFabricId: 'screen',
    isUnpriced: true,
    priceDisplay: 'السعر عند الاستفسار',
    standardHeightCm: 300,
    colors: CENTRAL_COLORS,
    sizes: [
      {
        id: 'std-r-screen',
        label: 'ارتفاع معياري 300 سم (العرض حسب الطلب)',
        widthCm: 250,
        heightCm: 300,
        price: 0,
      },
    ],
    care: ['تنظيف جاف بالفرشاة أو مسح رطب خفيف', 'مقاوم للبقع والبهتان'],
    features: [
      'آلية سحب بحبل متين وسلس',
      'كسر وهج الشاشات وحفظ الإطلالة الخارجية',
      'ارتفاع معياري معروض: 300 سم',
      'السعر عند الاستفسار عبر واتساب',
    ],
    isFeatured: true,
  },

  // 5. رول زيبرا
  {
    id: 'roller-zebra',
    slug: 'roller-zebra',
    name: 'رول زيبرا',
    curtainType: 'roller',
    category: 'roller',
    categoryName: 'ستائر رول',
    shortDesc: 'ستارة رول بشرائح أفقية متناوبة تتيح التبديل الفوري بين الشفافية والخصوصية.',
    description: 'طبقات قماشية مزدوجة بخطوط شفافة ومعتمة متناوبة بوضوح، تتيح التحكم الفوري في مستوى الإضاءة بحركة سحب واحدة بحبل السحب الميكانيكي، بارتفاع معياري 300 سم.',
    fabric: 'بوليستر تقني معالج بنظام الشرائح المزدوجة المتناوبة',
    lightBlocking: 'تحكم تدريجي بين الشفافية والتعتيم',
    mainImage: '/images/roller_zebra.jpg',
    images: ['/images/roller_zebra.jpg', '/images/curtain_mocha_roller.jpg', '/images/roller_zebra_cream.jpg'],
    defaultFabricId: 'zebra',
    isUnpriced: true,
    priceDisplay: 'السعر عند الاستفسار',
    standardHeightCm: 300,
    colors: CENTRAL_COLORS,
    sizes: [
      {
        id: 'std-r-zebra',
        label: 'ارتفاع معياري 300 سم (العرض حسب الطلب)',
        widthCm: 250,
        heightCm: 300,
        price: 0,
      },
    ],
    care: ['مسح خفيف بإسفنجة ناعمة', 'تجنب الفرك القوي للحفاظ على استقامة الشرائح'],
    features: [
      'آلية سحب بحبل لضبط محاذاة الخطوط المزدوجة',
      'شرائح أفقية متناوبة واضحة وعصرية',
      'ارتفاع معياري معروض: 300 سم',
      'السعر عند الاستفسار عبر واتساب',
    ],
    isFeatured: true,
  },
];
