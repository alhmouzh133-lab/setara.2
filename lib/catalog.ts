// ============================================================================
// سيتارة | SETARA - Dedicated Local Product Catalog & Centralized Fabrics
// ============================================================================
// Self-contained, typed catalog with centralized shared fabrics and stable
// image resolution across curtain types (Electric, Manual, Roller).
// ============================================================================

export interface ScreenColorOption {
  id: string;
  name: string;
  sampleCode: string;
  hex: string;
  image: string;
  installedImage?: string;
}

export interface ZebraModelOption {
  id: string;
  name: string;
  description: string;
}

export const ZEBRA_MODELS: ZebraModelOption[] = [
  { id: 'sada', name: 'سادة', description: 'شرائح أفقية معتمة ملساء مع شرائح شفافة' },
  { id: 'linen_look', name: 'بملمس كتاني', description: 'نسيج كتاني بارز وأنيق في الشرائح المعتمة' },
  { id: 'patterned', name: 'منقوشة', description: 'نقوش وزخارف ناعمة داخل الشرائح المعتمة' },
  { id: 'wide_slats', name: 'شرائح عريضة', description: 'شرائح أفقية أعرض لإطلالة عصرية جريئة' },
  { id: 'extra_dark', name: 'تعتيم أعلى', description: 'شرائح معتمة أكثر كثافة لحجب إضافي للضوء' },
];

export interface ZebraColorOption {
  id: string;
  name: string;
  hex: string;
  image: string;
  installedImage?: string;
}

export const ZEBRA_COLORS: ZebraColorOption[] = [
  { id: 'white', name: 'أبيض', hex: '#FFFFFF', image: '/images/zebra_white.jpg', installedImage: '/images/zebra_inst_white.jpg' },
  { id: 'offwhite', name: 'أوف وايت', hex: '#F5F2EB', image: '/images/zebra_offwhite.jpg', installedImage: '/images/zebra_inst_offwhite.jpg' },
  { id: 'sand', name: 'بيج رملي', hex: '#D6C7B2', image: '/images/zebra_sand.jpg', installedImage: '/images/zebra_inst_sand.jpg' },
  { id: 'light_gray', name: 'رمادي فاتح', hex: '#C5CAD0', image: '/images/zebra_light_gray.jpg', installedImage: '/images/zebra_inst_light_gray.jpg' },
  { id: 'charcoal', name: 'رمادي فحمي', hex: '#4E5259', image: '/images/zebra_charcoal.jpg', installedImage: '/images/zebra_inst_charcoal.jpg' },
  { id: 'brown', name: 'بني', hex: '#6E5643', image: '/images/zebra_brown.jpg', installedImage: '/images/zebra_inst_brown.jpg' },
  { id: 'black', name: 'أسود', hex: '#1C1C1E', image: '/images/zebra_black.jpg', installedImage: '/images/zebra_inst_black.jpg' },
  { id: 'navy', name: 'كحلي', hex: '#1B2A4A', image: '/images/zebra_navy.jpg', installedImage: '/images/zebra_inst_navy.jpg' },
];

/**
 * Resolves both the main installed preview image and the fabric-detail close-up image
 * based on the composite selection: productId ('roller-zebra') + selectedModelId + selectedColorId.
 */
export function resolveZebraImages(
  modelId: string,
  colorId: string
): { mainImage: string; detailImage: string } {
  const colorSwatch = ZEBRA_COLORS.find((c) => c.id === colorId) || ZEBRA_COLORS[0];

  // Specific model-based overrides that showcase the distinct physical properties
  if (modelId === 'linen_look') {
    return {
      mainImage: '/images/zebra_inst_linen.jpg',
      detailImage: colorSwatch.image || '/images/zebra_sand.jpg',
    };
  }

  if (modelId === 'patterned') {
    return {
      mainImage: '/images/zebra_inst_pattern.jpg',
      detailImage: '/images/zebra_det_pattern.jpg',
    };
  }

  if (modelId === 'wide_slats') {
    return {
      mainImage: '/images/zebra_inst_wide.jpg',
      detailImage: colorSwatch.image || '/images/zebra_white.jpg',
    };
  }

  if (modelId === 'extra_dark') {
    return {
      mainImage: '/images/zebra_inst_dark.jpg',
      detailImage: colorSwatch.image || '/images/zebra_charcoal.jpg',
    };
  }

  // Default 'sada' (smooth plain bands) resolved directly by color
  const colorMap: Record<string, string> = {
    white: '/images/zebra_inst_white.jpg',
    offwhite: '/images/zebra_inst_offwhite.jpg',
    sand: '/images/zebra_inst_sand.jpg',
    light_gray: '/images/zebra_inst_light_gray.jpg',
    charcoal: '/images/zebra_inst_charcoal.jpg',
    brown: '/images/zebra_inst_brown.jpg',
    black: '/images/zebra_inst_black.jpg',
    navy: '/images/zebra_inst_navy.jpg',
  };

  const main = colorMap[colorId] || colorSwatch.installedImage || colorSwatch.image || '/images/zebra_inst_white.jpg';

  return {
    mainImage: main,
    detailImage: colorSwatch.image,
  };
}

export interface BlackoutColorOption {
  id: string;
  name: string;
  sampleCode: string;
  hex: string;
  image: string;
  installedImage?: string;
}

export const BLACKOUT_COLORS: BlackoutColorOption[] = [
  { id: 'bo_1851', name: 'رمادي كتاني منقوش', sampleCode: '1851', hex: '#A3A3A3', image: '/images/bo_1851.jpg', installedImage: '/images/roller_blackout.jpg' },
  { id: 'bo_1886', name: 'أبيض لؤلؤي ناعم', sampleCode: '1886', hex: '#F5F5F0', image: '/images/bo_1886.jpg', installedImage: '/images/roller_blackout_white.jpg' },
  { id: 'bo_1891', name: 'بيج رملي ناعم', sampleCode: '1891', hex: '#D8C9B4', image: '/images/bo_1891.jpg', installedImage: '/images/roller_blackout_sand.jpg' },
  { id: 'bo_23m1', name: 'أبيض مطفي كلاسيكي', sampleCode: '23M-1', hex: '#FAFAFA', image: '/images/bo_23m1.jpg', installedImage: '/images/roller_blackout_white.jpg' },
  { id: 'bo_23d5', name: 'رمادي معدني فاخر', sampleCode: '23D-5', hex: '#8A929A', image: '/images/bo_23d5.jpg', installedImage: '/images/roller_blackout.jpg' },
  { id: 'bo_23b5', name: 'رمادي ستيل معتم', sampleCode: '23B-5', hex: '#757B84', image: '/images/bo_23b5.jpg', installedImage: '/images/curtain_charcoal_roller.jpg' },
];

export const SCREEN_COLORS: ScreenColorOption[] = [
  { id: 'offwhite', name: 'أوف وايت', sampleCode: '2073-1 / 2071-1', hex: '#F3EFEA', image: '/images/screen_offwhite.jpg', installedImage: '/images/roller_screen_ivory.jpg' },
  { id: 'sand_beige', name: 'بيج رملي', sampleCode: '2073-3 / 2071-3', hex: '#D4C5B9', image: '/images/screen_sand.jpg', installedImage: '/images/roller_screen_sand.jpg' },
  { id: 'medium_gray', name: 'رمادي متوسط', sampleCode: '2073-4', hex: '#8C8885', image: '/images/screen_medium_gray.jpg', installedImage: '/images/roller_screen.jpg' },
  { id: 'charcoal_gray', name: 'رمادي فحمي', sampleCode: '2073-8 / 2071-6', hex: '#4A4846', image: '/images/screen_charcoal_gray.jpg', installedImage: '/images/roller_screen_charcoal.jpg' },
  { id: 'textured_beige', name: 'بيج بنسيج متقاطع', sampleCode: '2090-2', hex: '#CDBCA9', image: '/images/screen_textured_beige.jpg', installedImage: '/images/roller_screen_sand.jpg' },
  { id: 'textured_gray', name: 'رمادي بنسيج متقاطع', sampleCode: '2090-4', hex: '#7A7672', image: '/images/screen_textured_gray.jpg', installedImage: '/images/roller_screen_charcoal.jpg' },
  { id: 'striped_beige', name: 'بيج مخطط', sampleCode: '2073-10', hex: '#C4B29E', image: '/images/screen_striped_beige.jpg', installedImage: '/images/roller_screen_sand.jpg' },
  { id: 'striped_gray', name: 'رمادي مخطط', sampleCode: '2073-11', hex: '#635F5B', image: '/images/screen_striped_gray.jpg', installedImage: '/images/roller_screen_charcoal.jpg' },
];

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
  isMadeToMeasureScreen?: boolean;
  screenColors?: ScreenColorOption[];
  isMadeToMeasureBlackout?: boolean;
  blackoutColors?: BlackoutColorOption[];
  isMadeToMeasureZebra?: boolean;
  zebraModels?: ZebraModelOption[];
  zebraColors?: ZebraColorOption[];
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
    shortDesc: 'ستارة رول بلاك أوت 100% معتمة تفصيل حسب المقاس بدقة، بسعر 20 د.أ لكل متر مربع.',
    description: 'ستارة رول بلاك أوت معتمة تماماً 100% مصنعة خصيصاً حسب مقاسات نافذتك بدقة لحجب الشمس والحرارة وتوفير خصوصية تامة. السعر 20 د.أ لكل متر مربع.',
    fabric: 'قماش بلاك أوت عازل تماماً 100% (100% Blackout Roller Fabric)',
    lightBlocking: 'تعتيم كامل 100% وحجب حراري ممتاز',
    mainImage: '/images/bo_1851.jpg',
    images: ['/images/bo_1851.jpg', '/images/bo_1886.jpg', '/images/bo_1891.jpg'],
    defaultFabricId: 'blackout',
    isUnpriced: false,
    priceDisplay: '20 د.أ / م²',
    isMadeToMeasureBlackout: true,
    blackoutColors: BLACKOUT_COLORS,
    colors: CENTRAL_COLORS,
    sizes: [],
    care: ['مسح بإسفنجة رطبة خفيفة ومسحوق لطيف', 'مقاوم للغبار والرطوبة'],
    features: [
      'تفصيل دقيق حسب المقاس (العرض × الطول)',
      'سعر مباشر حسب المساحة: 20 د.أ لكل متر مربع',
      'حجب كامل للضوء 100% لتعتيم مثالي',
      'آلية سحب بحبل ميكانيكي سلس ومتين',
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
    shortDesc: 'ستارة رول سكرين شبكية تفصيل حسب المقاس بدقة، بسعر 20 د.أ لكل متر مربع.',
    description: 'ستارة رول سكرين شبكية معاصرة مصنعة خصيصاً حسب مقاسات نافذتك بدقة. تكسر الوهج والحرارة مع الحفاظ على وضوح الرؤية للخارج. السعر 20 د.أ لكل متر مربع.',
    fabric: 'ألياف شبكية واقية من الأشعة فوق البنفسجية والحرارة (Solar Mesh)',
    lightBlocking: 'ترشيح الوهج مع وضوح الرؤية للخارج',
    mainImage: '/images/roller_screen.jpg',
    images: ['/images/roller_screen.jpg', '/images/roller_screen_ivory.jpg', '/images/roller_screen_sand.jpg'],
    defaultFabricId: 'screen',
    isUnpriced: false,
    priceDisplay: '20 د.أ / م²',
    isMadeToMeasureScreen: true,
    screenColors: SCREEN_COLORS,
    colors: CENTRAL_COLORS,
    sizes: [],
    care: ['تنظيف جاف بالفرشاة أو مسح رطب خفيف', 'مقاوم للبقع والبهتان'],
    features: [
      'تفصيل دقيق حسب المقاس (العرض × الطول)',
      'سعر مباشر حسب المساحة: 20 د.أ لكل متر مربع',
      'آلية سحب بحبل متين وسلس',
      'كسر وهج الشاشات وحفظ الإطلالة الخارجية',
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
    shortDesc: 'ستارة رول زيبرا ذات شرائح أفقية مزدوجة تفصيل حسب المقاس، بسعر 20 د.أ لكل متر مربع.',
    description: 'ستارة رول زيبرا بأسلوب الشرائح المزدوجة المتناوبة للتحكم بالضوء والخصوصية بدقة تامة. مصنعة حسب المقاس، بسعر 20 د.أ لكل متر مربع.',
    fabric: 'بوليستر تقني معالج بنظام الشرائح المزدوجة',
    lightBlocking: 'تحكم تدريجي بين الشفافية والتعتيم',
    mainImage: '/images/zebra_white.jpg',
    images: ['/images/zebra_white.jpg', '/images/zebra_offwhite.jpg', '/images/zebra_sand.jpg'],
    defaultFabricId: 'zebra',
    isUnpriced: false,
    priceDisplay: '20 د.أ / م²',
    isMadeToMeasureZebra: true,
    zebraModels: ZEBRA_MODELS,
    zebraColors: ZEBRA_COLORS,
    colors: CENTRAL_COLORS,
    sizes: [],
    care: ['مسح خفيف بإسفنجة ناعمة', 'تجنب الفرك القوي للحفاظ على استقامة الشرائح'],
    features: [
      'تفصيل دقيق حسب المقاس (العرض × الطول)',
      'سعر مباشر حسب المساحة: 20 د.أ لكل متر مربع',
      'شرائح أفقية مزدوجة متناوبة للتحكم الفوري بالإضاءة',
      'موديلات متنوعة وخيارات ألوان عصرية',
    ],
    isFeatured: true,
  },
];
