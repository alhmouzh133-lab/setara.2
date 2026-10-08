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

export interface ZebraColorOption {
  id: string;
  name: string;
  sampleCode?: string;
  hex: string;
  image: string;
  installedImage: string;
}

export const ZEBRA_COLORS: ZebraColorOption[] = [
  { id: 'white', name: 'أبيض كلاسيكي', sampleCode: 'سادة', hex: '#FFFFFF', image: '/images/zebra_white.jpg', installedImage: '/images/zebra_inst_white.jpg' },
  { id: 'offwhite', name: 'أوف وايت كريمي', sampleCode: 'سادة', hex: '#F5F2EB', image: '/images/zebra_offwhite.jpg', installedImage: '/images/zebra_inst_offwhite.jpg' },
  { id: 'sand', name: 'بيج رملي دافئ', sampleCode: 'سادة', hex: '#D6C7B2', image: '/images/zebra_sand.jpg', installedImage: '/images/zebra_inst_sand.jpg' },
  { id: 'light_gray', name: 'رمادي فاتح هادئ', sampleCode: 'سادة', hex: '#C5CAD0', image: '/images/zebra_light_gray.jpg', installedImage: '/images/zebra_inst_light_gray.jpg' },
  { id: 'charcoal', name: 'رمادي فحمي ملكي', sampleCode: 'سادة', hex: '#4E5259', image: '/images/zebra_charcoal.jpg', installedImage: '/images/zebra_inst_charcoal.jpg' },
  { id: 'brown', name: 'بني شوكولاتة', sampleCode: 'سادة', hex: '#6E5643', image: '/images/zebra_brown.jpg', installedImage: '/images/zebra_inst_brown.jpg' },
  { id: 'black', name: 'أسود معتم', sampleCode: 'سادة', hex: '#1C1C1E', image: '/images/zebra_black.jpg', installedImage: '/images/zebra_inst_black.jpg' },
  { id: 'navy', name: 'كحلي داكن', sampleCode: 'سادة', hex: '#1B2A4A', image: '/images/zebra_navy.jpg', installedImage: '/images/zebra_inst_navy.jpg' },
  { id: 'linen', name: 'ملمس كتاني طبيعي', sampleCode: 'نسيج كتان', hex: '#C9B89F', image: '/images/zebra_sand.jpg', installedImage: '/images/zebra_inst_linen.jpg' },
  { id: 'patterned', name: 'نقوش وزخارف ناعمة', sampleCode: 'منقوش', hex: '#DCD4C8', image: '/images/zebra_det_pattern.jpg', installedImage: '/images/zebra_inst_pattern.jpg' },
  { id: 'wide_slats', name: 'شرائح عريضة مودرن', sampleCode: 'شرائح عريضة', hex: '#EBEAE6', image: '/images/zebra_white.jpg', installedImage: '/images/zebra_inst_wide.jpg' },
  { id: 'extra_dark', name: 'تعتيم إضافي داكن', sampleCode: 'تعتيم عالي', hex: '#2F3337', image: '/images/zebra_charcoal.jpg', installedImage: '/images/zebra_inst_dark.jpg' },
];

/**
 * Resolves the preview image directly from the selected zebra variant.
 */
export function resolveZebraImages(
  colorOrModelId: string,
  maybeColorId?: string
): { mainImage: string; detailImage: string } {
  const targetId = maybeColorId || colorOrModelId;
  const match = ZEBRA_COLORS.find((c) => c.id === targetId || c.id === colorOrModelId) || ZEBRA_COLORS[0];
  return {
    mainImage: match.installedImage,
    detailImage: match.image,
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
  sidePanelImages?: {
    both: string;
    right: string;
    left: string;
  };
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
  curtainType: 'electric' | 'manual' | 'roller' | 'track' | string;
  category: 'electric' | 'manual' | 'roller' | 'tracks' | string;
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
  zebraColors?: ZebraColorOption[];
  isTrackAccessory?: boolean;
  isInstallationService?: boolean;
  isDryCleaningService?: boolean;
  isLinenSidePanel?: boolean;
  availabilityBadge?: string;
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
// 1b. Shared Fabric Options for Linen and Electric Curtains
// Fabrics: لينين، لينين ديم أوت، لينين موشح، لينين موشح مبزر، جاكار، ديم أوت،
//          بلاك أوت، أفوال، كروشيه، مطرز، مقصب، تل مقصب، تي ان، مخمل
// Treat كتان and لينين as the same existing fabric option.
// Treat velvet / فلفت / مخمل as one option.
// ----------------------------------------------------------------------------
export const SHARED_CURTAIN_FABRICS: FabricOption[] = [
  {
    id: 'flax_linen',
    name: 'لينين',
    description: 'قماش لينين راقٍ بنسيج أوروبي فاخر ومظهر طبيعي متهدل بطيات مميزة.',
    badge: 'طبيعي فاخر',
  },
  {
    id: 'linen_dimout',
    name: 'لينين ديم أوت',
    description: 'قماش لينين ديم أوت يجمع بين فخامة مظهر اللينين وعزل ناعم لأشعة الشمس والحرارة.',
    badge: 'لينين عازل ناعم',
  },
  {
    id: 'linen_mowashah',
    name: 'لينين موشح',
    description: 'قماش لينين بنسيج موشح متداخل الألوان يضفي لمسة عصرية دافئة وفخمة على المساحة.',
    badge: 'موشح عصري',
  },
  {
    id: 'mobazar',
    name: 'مبزر',
    description: 'قماش مبزر بتموجات ونسيج نافز خفيف يمنح الستارة عمقاً وثراءً بصرياً فاخراً.',
    badge: 'مبزر فاخر',
  },
  {
    id: 'mankoush',
    name: 'منكوش',
    description: 'قماش منكوش أنيق بتموجات عضوية خفيفة تعكس الضوء برقة وأناقة عصرية.',
    badge: 'منكوش متموج',
  },
  {
    id: 'jacquard',
    name: 'جاكار',
    description: 'نسيج جاكار منسوج بنقوش وزخارف فخمة تمنح الغرفة طابعاً ملكياً راقياً.',
    badge: 'نقوش ملكية',
  },
  {
    id: 'dimout',
    name: 'ديم أوت',
    description: 'قماش ديم أوت لحجب ناعم للضوء والحرارة بنسبة 70-80% مع حفظ انسيابية الستارة.',
    badge: 'حجب ناعم 80%',
  },
  {
    id: 'blackout',
    name: 'بلاك أوت',
    description: 'قماش معتم تماماً بنسبة 100% يحجب الضوء الخارجي ويحفظ برودة الغرفة وسكونها.',
    badge: 'تعتيم 100%',
  },
  {
    id: 'voile',
    name: 'أفوال',
    description: 'شيفون أفوال خفيف انسيابي ينسدل برقة فوق النوافذ ويسمح بتدفق ناعم لضوء النهار.',
    badge: 'شفاف لطيف',
  },
  {
    id: 'crochet',
    name: 'كروشيه',
    description: 'نسيج كروشيه كلاسيكي محبوك بغرز مفتوحة وتطريزات راقية للصالونات والمجالس.',
    badge: 'محبوك كلاسيكي',
  },
  {
    id: 'embroidered',
    name: 'مطرز',
    description: 'أقمشة شفافة فاخرة بتطريزات ونقوش نباتية وهندسية أنيقة تضفي فخامة استثنائية.',
    badge: 'مطرز راقٍ',
  },
  {
    id: 'mouqasab',
    name: 'مقصب',
    description: 'قماش مقصب بخيوط معدنية برّاقة ناعمة تعكس الإضاءة ببريق خافت هادئ وأنيق.',
    badge: 'بريق هادئ فاخر',
  },
  {
    id: 'tulle_mouqasab',
    name: 'تل مقصب',
    description: 'نسيج تل انسيابي مطعم بخيوط مقصبة لامعة بنعومة تمنح النوافذ حيوية وتألقاً.',
    badge: 'تل بلمعة ناعمة',
  },
  {
    id: 'tn',
    name: 'تي ان',
    description: 'قماش تي إن متين وعصري بمقاومة عالية للتجعد وملمس ناعم يدوم طويلاً.',
    badge: 'عصري متين',
  },
  {
    id: 'velvet',
    name: 'مخمل',
    description: 'مخمل فاخر بملمس ناعم وعزل حراري وصوتي عالي مع ثنيات فخمة متناسقة.',
    badge: 'فاخر ثقيل',
  },
];

// Backwards-compatible aliases pointing to the unified shared fabrics
export const MANUAL_FABRICS: FabricOption[] = SHARED_CURTAIN_FABRICS;
export const ELECTRIC_FABRICS: FabricOption[] = SHARED_CURTAIN_FABRICS;

// ----------------------------------------------------------------------------
// 1c. Pattern / Design Options for Embroidered (مطرز) and Crochet (كروشيه)
// ----------------------------------------------------------------------------
export interface FabricPatternOption {
  id: string;
  name: string;
  description: string;
  image: string;
  badge?: string;
}

export const EMBROIDERED_PATTERNS: FabricPatternOption[] = [
  {
    id: 'floral_white',
    name: 'ورد ناعم أبيض / عاجي',
    description: 'تطريز نباتي زهري ناعم متساقط بخيوط عاجية نقية',
    image: '/images/curtain_emb_floral.jpg',
    badge: 'ورد أبيض عاجي',
  },
  {
    id: 'gold_branch',
    name: 'أغصان ذهبية',
    description: 'أغصان شجرية مذهبة برّاقة تمتد بأناقة على قماش التول الشفاف',
    image: '/images/curtain_emb_goldbranch.jpg',
    badge: 'أغصان ذهبية',
  },
  {
    id: 'gold_decorative',
    name: 'زخارف ذهبية',
    description: 'نقوش وزخارف كلاسيكية ذهبية فخمة بحواف مموجة أنيقة',
    image: '/images/curtain_emb_goldscallop.jpg',
    badge: 'زخارف ذهبية',
  },
];

export const CROCHET_PATTERNS: FabricPatternOption[] = [
  {
    id: 'crochet_stripe',
    name: 'كروشيه شبكي مقلم',
    description: 'نسيج كروشيه مفتوح بخطوط رأسية مقلمة عصرية وأنيقة',
    image: '/images/curtain_crochet_stripe.jpg',
    badge: 'شبكي مقلم',
  },
  {
    id: 'crochet_grid',
    name: 'كروشيه شبكي مربعات',
    description: 'نسيج كروشيه محبوك بغرز شبكية مربعة بنمط وافل هندسي',
    image: '/images/curtain_crochet_grid.jpg',
    badge: 'شبكي مربعات',
  },
  {
    id: 'crochet_zigzag',
    name: 'كروشيه شبكي زكزاك',
    description: 'نسيج كروشيه مفتوح بنقشات زكزاك متعرجة هندسية فخمة',
    image: '/images/curtain_crochet_zigzag.jpg',
    badge: 'شبكي زكزاك',
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

// Palette for جوانب ستائر كتان (Side Panels)
export const SIDE_PANEL_COLORS: ColorOption[] = [
  {
    id: 'white',
    name: 'أبيض',
    hex: '#FFFFFF',
    image: '/images/side_panel_white_both.jpg',
    gallery: [
      '/images/side_panel_white_both.jpg',
      '/images/side_panel_white_right.jpg',
      '/images/side_panel_white_left.jpg',
    ],
    sidePanelImages: {
      both: '/images/side_panel_white_both.jpg',
      right: '/images/side_panel_white_right.jpg',
      left: '/images/side_panel_white_left.jpg',
    },
  },
  {
    id: 'ivory',
    name: 'عاجي',
    hex: '#F5EFE6',
    image: '/images/side_panel_ivory_both.jpg',
    gallery: [
      '/images/side_panel_ivory_both.jpg',
      '/images/side_panel_ivory_right.jpg',
      '/images/side_panel_ivory_left.jpg',
    ],
    sidePanelImages: {
      both: '/images/side_panel_ivory_both.jpg',
      right: '/images/side_panel_ivory_right.jpg',
      left: '/images/side_panel_ivory_left.jpg',
    },
  },
  {
    id: 'light_beige',
    name: 'بيج فاتح',
    hex: '#EAE2D6',
    image: '/images/side_panel_light_beige_both.jpg',
    gallery: [
      '/images/side_panel_light_beige_both.jpg',
      '/images/side_panel_light_beige_right.jpg',
      '/images/side_panel_light_beige_left.jpg',
    ],
    sidePanelImages: {
      both: '/images/side_panel_light_beige_both.jpg',
      right: '/images/side_panel_light_beige_right.jpg',
      left: '/images/side_panel_light_beige_left.jpg',
    },
  },
  {
    id: 'sand_beige',
    name: 'بيج رملي',
    hex: '#D8C6AE',
    image: '/images/side_panel_sand_beige_both.jpg',
    gallery: [
      '/images/side_panel_sand_beige_both.jpg',
      '/images/side_panel_sand_beige_right.jpg',
      '/images/side_panel_sand_beige_left.jpg',
    ],
    sidePanelImages: {
      both: '/images/side_panel_sand_beige_both.jpg',
      right: '/images/side_panel_sand_beige_right.jpg',
      left: '/images/side_panel_sand_beige_left.jpg',
    },
  },
  {
    id: 'grey_beige',
    name: 'بيج رمادي',
    hex: '#B8AF9E',
    image: '/images/side_panel_grey_beige_both.jpg',
    gallery: [
      '/images/side_panel_grey_beige_both.jpg',
      '/images/side_panel_grey_beige_right.jpg',
      '/images/side_panel_grey_beige_left.jpg',
    ],
    sidePanelImages: {
      both: '/images/side_panel_grey_beige_both.jpg',
      right: '/images/side_panel_grey_beige_right.jpg',
      left: '/images/side_panel_grey_beige_left.jpg',
    },
  },
  {
    id: 'light_grey',
    name: 'رمادي فاتح',
    hex: '#C5C3C0',
    image: '/images/side_panel_light_grey_both.jpg',
    gallery: [
      '/images/side_panel_light_grey_both.jpg',
      '/images/side_panel_light_grey_right.jpg',
      '/images/side_panel_light_grey_left.jpg',
    ],
    sidePanelImages: {
      both: '/images/side_panel_light_grey_both.jpg',
      right: '/images/side_panel_light_grey_right.jpg',
      left: '/images/side_panel_light_grey_left.jpg',
    },
  },
  {
    id: 'medium_grey',
    name: 'رمادي متوسط',
    hex: '#8B8884',
    image: '/images/side_panel_medium_grey_both.jpg',
    gallery: [
      '/images/side_panel_medium_grey_both.jpg',
      '/images/side_panel_medium_grey_right.jpg',
      '/images/side_panel_medium_grey_left.jpg',
    ],
    sidePanelImages: {
      both: '/images/side_panel_medium_grey_both.jpg',
      right: '/images/side_panel_medium_grey_right.jpg',
      left: '/images/side_panel_medium_grey_left.jpg',
    },
  },
  {
    id: 'dark_grey',
    name: 'رمادي غامق',
    hex: '#4A4846',
    image: '/images/side_panel_dark_grey_both.jpg',
    gallery: [
      '/images/side_panel_dark_grey_both.jpg',
      '/images/side_panel_dark_grey_right.jpg',
      '/images/side_panel_dark_grey_left.jpg',
    ],
    sidePanelImages: {
      both: '/images/side_panel_dark_grey_both.jpg',
      right: '/images/side_panel_dark_grey_right.jpg',
      left: '/images/side_panel_dark_grey_left.jpg',
    },
  },
  {
    id: 'blue_grey',
    name: 'رمادي مزرق',
    hex: '#5B6B7C',
    image: '/images/side_panel_blue_grey_both.jpg',
    gallery: [
      '/images/side_panel_blue_grey_both.jpg',
      '/images/side_panel_blue_grey_right.jpg',
      '/images/side_panel_blue_grey_left.jpg',
    ],
    sidePanelImages: {
      both: '/images/side_panel_blue_grey_both.jpg',
      right: '/images/side_panel_blue_grey_right.jpg',
      left: '/images/side_panel_blue_grey_left.jpg',
    },
  },
  {
    id: 'blue',
    name: 'أزرق',
    hex: '#3B6282',
    image: '/images/side_panel_blue_both.jpg',
    gallery: [
      '/images/side_panel_blue_both.jpg',
      '/images/side_panel_blue_right.jpg',
      '/images/side_panel_blue_left.jpg',
    ],
    sidePanelImages: {
      both: '/images/side_panel_blue_both.jpg',
      right: '/images/side_panel_blue_right.jpg',
      left: '/images/side_panel_blue_left.jpg',
    },
  },
  {
    id: 'navy_blue',
    name: 'كحلي',
    hex: '#1B2A4A',
    image: '/images/side_panel_navy_blue_both.jpg',
    gallery: [
      '/images/side_panel_navy_blue_both.jpg',
      '/images/side_panel_navy_blue_right.jpg',
      '/images/side_panel_navy_blue_left.jpg',
    ],
    sidePanelImages: {
      both: '/images/side_panel_navy_blue_both.jpg',
      right: '/images/side_panel_navy_blue_right.jpg',
      left: '/images/side_panel_navy_blue_left.jpg',
    },
  },
];

/**
 * Resolves the exact installed linen side-panel photograph matching BOTH
 * selected color and selected placement ('right', 'left', 'both').
 * Never substitutes roller blinds, unrelated curtains, or fabric sample sheets.
 */
export function resolveSidePanelImage(
  colorId: string,
  placement: 'right' | 'left' | 'both' | string = 'both'
): { image: string; isMissing: boolean } {
  const normColor = colorId?.toLowerCase().trim() || '';
  const normPlacement: 'right' | 'left' | 'both' =
    placement === 'right' || placement === 'left' || placement === 'both'
      ? placement
      : 'both';

  const colorEntry = SIDE_PANEL_COLORS.find((c) => c.id === normColor);
  const resolved = colorEntry?.sidePanelImages?.[normPlacement];

  if (!resolved) {
    return { image: '', isMissing: true };
  }

  return { image: resolved, isMissing: false };
}

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
  'electric:flax_linen:ivory': '/images/curtain_electric.jpg',
  'electric:flax_linen:ivory:wave': '/images/elec_flax_ivory_w.jpg',
  'electric:flax_linen:ivory:american': '/images/elec_flax_ivory_am.jpg',
  'electric:flax_linen:ivory:wave:lining50': '/images/elec_flax_ivory_w.jpg',
  'electric:flax_linen:ivory:wave:lining80': '/images/elec_flax_iv_w_80.jpg',
  'electric:flax_linen:ivory:wave:lining100': '/images/elec_flax_iv_w_100.jpg',
  'electric:flax_linen:ivory:american:lining50': '/images/elec_flax_ivory_am.jpg',
  'electric:flax_linen:ivory:american:lining80': '/images/elec_flax_iv_am_80.jpg',
  'electric:flax_linen:ivory:american:lining100': '/images/elec_flax_iv_am_100.jpg',

  'electric:flax_linen:sand': '/images/elec_flax_sand_w.jpg',
  'electric:flax_linen:sand:wave': '/images/elec_flax_sand_w.jpg',
  'electric:flax_linen:sand:american': '/images/elec_flax_sand_am.jpg',
  'electric:flax_linen:sand:wave:lining80': '/images/elec_flax_sand_w_80.jpg',

  'electric:flax_linen:cocoa': '/images/elec_flax_cocoa_w.jpg',
  'electric:flax_linen:cocoa:wave': '/images/elec_flax_cocoa_w.jpg',
  'electric:flax_linen:cocoa:american': '/images/elec_flax_cocoa_am.jpg',

  'electric:flax_linen:charcoal': '/images/elec_flax_charcoal_w.jpg',
  'electric:flax_linen:charcoal:wave': '/images/elec_flax_charcoal_w.jpg',
  'electric:flax_linen:charcoal:american': '/images/elec_flax_charcoal_am.jpg',

  'electric:flax_linen:white': '/images/elec_flax_white_w.jpg',
  'electric:flax_linen:white:wave': '/images/elec_flax_white_w.jpg',
  'electric:flax_linen:white:american': '/images/elec_flax_white_am.jpg',

  'electric:jacquard:ivory': '/images/jacquard_iv_w.jpg',
  'electric:jacquard:ivory:wave': '/images/jacquard_iv_w.jpg',
  'electric:jacquard:ivory:american': '/images/jacquard_iv_am.jpg',
  'electric:jacquard:sand': '/images/nordic_sand.jpg',
  'electric:jacquard:sand:wave': '/images/nordic_sand.jpg',
  'electric:jacquard:sand:american': '/images/nordic_sand.jpg',
  'electric:jacquard:cocoa': '/images/lustre_cocoa.jpg',
  'electric:jacquard:cocoa:wave': '/images/lustre_cocoa.jpg',
  'electric:jacquard:cocoa:american': '/images/lustre_cocoa.jpg',
  'electric:jacquard:charcoal': '/images/lustre_warmgrey.jpg',
  'electric:jacquard:charcoal:wave': '/images/lustre_warmgrey.jpg',
  'electric:jacquard:charcoal:american': '/images/lustre_warmgrey.jpg',
  'electric:jacquard:white': '/images/prod_raw_linen.jpg',
  'electric:jacquard:white:wave': '/images/prod_raw_linen.jpg',
  'electric:jacquard:white:american': '/images/prod_raw_linen.jpg',

  'electric:dimout:ivory': '/images/elec_linen_iv_w_80.jpg',
  'electric:dimout:ivory:wave': '/images/elec_linen_iv_w_80.jpg',
  'electric:dimout:ivory:american': '/images/elec_linen_iv_am_80.jpg',
  'electric:dimout:ivory:wave:lining50': '/images/elec_linen_iv_w_50.jpg',
  'electric:dimout:ivory:wave:lining80': '/images/elec_linen_iv_w_80.jpg',
  'electric:dimout:ivory:wave:lining100': '/images/elec_linen_iv_w_100.jpg',
  'electric:dimout:ivory:american:lining50': '/images/elec_linen_iv_am_50.jpg',
  'electric:dimout:ivory:american:lining80': '/images/elec_linen_iv_am_80.jpg',
  'electric:dimout:ivory:american:lining100': '/images/elec_linen_iv_am_100.jpg',
  'electric:dimout:sand': '/images/nordic_sand.jpg',
  'electric:dimout:sand:wave': '/images/nordic_sand.jpg',
  'electric:dimout:sand:american': '/images/elec_flax_sand_am.jpg',
  'electric:dimout:cocoa': '/images/lustre_cocoa.jpg',
  'electric:dimout:cocoa:wave': '/images/lustre_cocoa.jpg',
  'electric:dimout:cocoa:american': '/images/elec_flax_cocoa_am.jpg',
  'electric:dimout:charcoal': '/images/curtain_linen_charcoal.jpg',
  'electric:dimout:charcoal:wave': '/images/curtain_linen_charcoal.jpg',
  'electric:dimout:charcoal:american': '/images/elec_flax_charcoal_am.jpg',
  'electric:dimout:white': '/images/raw_linen_white.jpg',
  'electric:dimout:white:wave': '/images/raw_linen_white.jpg',
  'electric:dimout:white:american': '/images/elec_flax_white_am.jpg',

  'electric:blackout:ivory': '/images/curtain_blackout_ivory.jpg',
  'electric:blackout:ivory:wave': '/images/curtain_blackout_ivory.jpg',
  'electric:blackout:ivory:american': '/images/elec_blackout_iv_am.jpg',
  'electric:blackout:sand': '/images/curtain_blackout_sand.jpg',
  'electric:blackout:sand:wave': '/images/curtain_blackout_sand.jpg',
  'electric:blackout:sand:american': '/images/elec_blackout_sand_am.jpg',
  'electric:blackout:cocoa': '/images/blackout_cocoa_w.jpg',
  'electric:blackout:cocoa:wave': '/images/blackout_cocoa_w.jpg',
  'electric:blackout:cocoa:american': '/images/blackout_cocoa_am.jpg',
  'electric:blackout:charcoal': '/images/curtain_blackout_charcoal.jpg',
  'electric:blackout:charcoal:wave': '/images/curtain_blackout_charcoal.jpg',
  'electric:blackout:charcoal:american': '/images/elec_blackout_charcoal_am.jpg',
  'electric:blackout:white': '/images/curtain_blackout_white.jpg',
  'electric:blackout:white:wave': '/images/curtain_blackout_white.jpg',
  'electric:blackout:white:american': '/images/blackout_white_am.jpg',

  'electric:voile:ivory': '/images/chiffon_champagne.jpg',
  'electric:voile:ivory:wave': '/images/chiffon_champagne.jpg',
  'electric:voile:ivory:american': '/images/voile_iv_am.jpg',
  'electric:voile:ivory:wave:lining80': '/images/voile_iv_w_lined.jpg',
  'electric:voile:ivory:wave:lining100': '/images/voile_iv_w_lined.jpg',
  'electric:voile:ivory:american:lining80': '/images/voile_iv_am_lined.jpg',
  'electric:voile:ivory:american:lining100': '/images/voile_iv_am_lined.jpg',
  'electric:voile:sand': '/images/chiffon_champagne.jpg',
  'electric:voile:sand:wave': '/images/chiffon_champagne.jpg',
  'electric:voile:sand:american': '/images/voile_iv_am.jpg',
  'electric:voile:cocoa': '/images/chiffon_cocoa.jpg',
  'electric:voile:cocoa:wave': '/images/chiffon_cocoa.jpg',
  'electric:voile:cocoa:american': '/images/chiffon_cocoa.jpg',
  'electric:voile:charcoal': '/images/chiffon_charcoal.jpg',
  'electric:voile:charcoal:wave': '/images/chiffon_charcoal.jpg',
  'electric:voile:charcoal:american': '/images/chiffon_charcoal.jpg',
  'electric:voile:white': '/images/chiffon_white.jpg',
  'electric:voile:white:wave': '/images/chiffon_white.jpg',
  'electric:voile:white:american': '/images/chiffon_white.jpg',

  'electric:crochet:ivory': '/images/crochet_iv_w.jpg',
  'electric:crochet:ivory:wave': '/images/crochet_iv_w.jpg',
  'electric:crochet:ivory:american': '/images/crochet_iv_am.jpg',
  'electric:crochet:sand': '/images/linen_sheer_sand.jpg',
  'electric:crochet:sand:wave': '/images/linen_sheer_sand.jpg',
  'electric:crochet:sand:american': '/images/linen_sheer_sand.jpg',
  'electric:crochet:cocoa': '/images/lustre_cocoa.jpg',
  'electric:crochet:cocoa:wave': '/images/lustre_cocoa.jpg',
  'electric:crochet:cocoa:american': '/images/lustre_cocoa.jpg',
  'electric:crochet:charcoal': '/images/curtain_linen_charcoal.jpg',
  'electric:crochet:charcoal:wave': '/images/curtain_linen_charcoal.jpg',
  'electric:crochet:charcoal:american': '/images/curtain_linen_charcoal.jpg',
  'electric:crochet:white': '/images/linen_sheer_white.jpg',
  'electric:crochet:white:wave': '/images/linen_sheer_white.jpg',
  'electric:crochet:white:american': '/images/linen_sheer_white.jpg',

  'electric:tn:ivory': '/images/tn_iv_w.jpg',
  'electric:tn:ivory:wave': '/images/tn_iv_w.jpg',
  'electric:tn:ivory:american': '/images/tn_iv_am.jpg',
  'electric:tn:sand': '/images/nordic_sand.jpg',
  'electric:tn:sand:wave': '/images/nordic_sand.jpg',
  'electric:tn:sand:american': '/images/elec_flax_sand_am.jpg',
  'electric:tn:cocoa': '/images/lustre_cocoa.jpg',
  'electric:tn:cocoa:wave': '/images/lustre_cocoa.jpg',
  'electric:tn:cocoa:american': '/images/elec_flax_cocoa_am.jpg',
  'electric:tn:charcoal': '/images/curtain_linen_charcoal.jpg',
  'electric:tn:charcoal:wave': '/images/curtain_linen_charcoal.jpg',
  'electric:tn:charcoal:american': '/images/elec_flax_charcoal_am.jpg',
  'electric:tn:white': '/images/raw_linen_white.jpg',
  'electric:tn:white:wave': '/images/raw_linen_white.jpg',
  'electric:tn:white:american': '/images/elec_flax_white_am.jpg',

  'electric:velvet:ivory': '/images/velvet_champagne.jpg',
  'electric:velvet:ivory:wave': '/images/velvet_champagne.jpg',
  'electric:velvet:ivory:american': '/images/elec_velvet_iv_am.jpg',
  'electric:velvet:sand': '/images/velvet_sand_w.jpg',
  'electric:velvet:sand:wave': '/images/velvet_sand_w.jpg',
  'electric:velvet:sand:american': '/images/velvet_sand_am.jpg',
  'electric:velvet:cocoa': '/images/curtain_velvet_cocoa.jpg',
  'electric:velvet:cocoa:wave': '/images/curtain_velvet_cocoa.jpg',
  'electric:velvet:cocoa:american': '/images/elec_velvet_cocoa_am.jpg',
  'electric:velvet:charcoal': '/images/velvet_charcoal.jpg',
  'electric:velvet:charcoal:wave': '/images/velvet_charcoal.jpg',
  'electric:velvet:charcoal:american': '/images/elec_velvet_charcoal_am.jpg',
  'electric:velvet:white': '/images/velvet_white_w.jpg',
  'electric:velvet:white:wave': '/images/velvet_white_w.jpg',
  'electric:velvet:white:american': '/images/velvet_white_am.jpg',

  // Electric legacy aliases
  'electric:linen:ivory': '/images/curtain_electric.jpg',
  'electric:linen:sand': '/images/linen_sheer_sand.jpg',
  'electric:linen:cocoa': '/images/lustre_cocoa.jpg',
  'electric:linen:charcoal': '/images/curtain_linen_charcoal.jpg',
  'electric:linen:white': '/images/linen_sheer_white.jpg',
  'electric:chiffon:ivory': '/images/prod_andalusian.jpg',
  'electric:chiffon:sand': '/images/chiffon_champagne.jpg',
  'electric:chiffon:cocoa': '/images/chiffon_cocoa.jpg',
  'electric:chiffon:charcoal': '/images/chiffon_charcoal.jpg',
  'electric:chiffon:white': '/images/chiffon_white.jpg',
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
  'manual:flax_linen:ivory': '/images/elec_flax_ivory_w.jpg',
  'manual:flax_linen:ivory:wave': '/images/elec_flax_ivory_w.jpg',
  'manual:flax_linen:ivory:american': '/images/elec_flax_ivory_am.jpg',
  'manual:flax_linen:ivory:wave:lining50': '/images/elec_flax_ivory_w.jpg',
  'manual:flax_linen:ivory:wave:lining80': '/images/elec_flax_iv_w_80.jpg',
  'manual:flax_linen:ivory:wave:lining100': '/images/elec_flax_iv_w_100.jpg',
  'manual:flax_linen:ivory:american:lining50': '/images/elec_flax_ivory_am.jpg',
  'manual:flax_linen:ivory:american:lining80': '/images/elec_flax_iv_am_80.jpg',
  'manual:flax_linen:ivory:american:lining100': '/images/elec_flax_iv_am_100.jpg',

  'manual:flax_linen:sand': '/images/elec_flax_sand_w.jpg',
  'manual:flax_linen:sand:wave': '/images/elec_flax_sand_w.jpg',
  'manual:flax_linen:sand:american': '/images/elec_flax_sand_am.jpg',
  'manual:flax_linen:sand:wave:lining80': '/images/elec_flax_sand_w_80.jpg',
  'manual:flax_linen:sand:wave:lining100': '/images/elec_flax_sand_w_80.jpg',
  'manual:flax_linen:sand:american:lining80': '/images/elec_flax_sand_am.jpg',
  'manual:flax_linen:sand:american:lining100': '/images/elec_flax_sand_am.jpg',

  'manual:flax_linen:cocoa': '/images/elec_flax_cocoa_w.jpg',
  'manual:flax_linen:cocoa:wave': '/images/elec_flax_cocoa_w.jpg',
  'manual:flax_linen:cocoa:american': '/images/elec_flax_cocoa_am.jpg',

  'manual:flax_linen:charcoal': '/images/elec_flax_charcoal_w.jpg',
  'manual:flax_linen:charcoal:wave': '/images/elec_flax_charcoal_w.jpg',
  'manual:flax_linen:charcoal:american': '/images/elec_flax_charcoal_am.jpg',

  'manual:flax_linen:white': '/images/elec_flax_white_w.jpg',
  'manual:flax_linen:white:wave': '/images/elec_flax_white_w.jpg',
  'manual:flax_linen:white:american': '/images/elec_flax_white_am.jpg',

  'manual:jacquard:ivory': '/images/jacquard_iv_w.jpg',
  'manual:jacquard:ivory:wave': '/images/jacquard_iv_w.jpg',
  'manual:jacquard:ivory:american': '/images/jacquard_iv_am.jpg',
  'manual:jacquard:sand': '/images/nordic_sand.jpg',
  'manual:jacquard:sand:wave': '/images/nordic_sand.jpg',
  'manual:jacquard:sand:american': '/images/nordic_sand.jpg',
  'manual:jacquard:cocoa': '/images/lustre_cocoa.jpg',
  'manual:jacquard:cocoa:wave': '/images/lustre_cocoa.jpg',
  'manual:jacquard:cocoa:american': '/images/lustre_cocoa.jpg',
  'manual:jacquard:charcoal': '/images/lustre_warmgrey.jpg',
  'manual:jacquard:charcoal:wave': '/images/lustre_warmgrey.jpg',
  'manual:jacquard:charcoal:american': '/images/lustre_warmgrey.jpg',
  'manual:jacquard:white': '/images/prod_raw_linen.jpg',
  'manual:jacquard:white:wave': '/images/prod_raw_linen.jpg',
  'manual:jacquard:white:american': '/images/prod_raw_linen.jpg',

  'manual:dimout:ivory': '/images/elec_linen_iv_w_80.jpg',
  'manual:dimout:ivory:wave': '/images/elec_linen_iv_w_80.jpg',
  'manual:dimout:ivory:american': '/images/elec_linen_iv_am_80.jpg',
  'manual:dimout:ivory:wave:lining50': '/images/elec_linen_iv_w_50.jpg',
  'manual:dimout:ivory:wave:lining80': '/images/elec_linen_iv_w_80.jpg',
  'manual:dimout:ivory:wave:lining100': '/images/elec_linen_iv_w_100.jpg',
  'manual:dimout:ivory:american:lining50': '/images/elec_linen_iv_am_50.jpg',
  'manual:dimout:ivory:american:lining80': '/images/elec_linen_iv_am_80.jpg',
  'manual:dimout:ivory:american:lining100': '/images/elec_linen_iv_am_100.jpg',
  'manual:dimout:sand': '/images/elec_flax_sand_w_80.jpg',
  'manual:dimout:sand:wave': '/images/elec_flax_sand_w_80.jpg',
  'manual:dimout:sand:american': '/images/elec_flax_sand_am.jpg',
  'manual:dimout:cocoa': '/images/curtain_velvet_cocoa.jpg',
  'manual:dimout:cocoa:wave': '/images/curtain_velvet_cocoa.jpg',
  'manual:dimout:cocoa:american': '/images/elec_velvet_cocoa_am.jpg',
  'manual:dimout:charcoal': '/images/curtain_linen_charcoal.jpg',
  'manual:dimout:charcoal:wave': '/images/curtain_linen_charcoal.jpg',
  'manual:dimout:charcoal:american': '/images/elec_flax_charcoal_am.jpg',
  'manual:dimout:white': '/images/raw_linen_white.jpg',
  'manual:dimout:white:wave': '/images/raw_linen_white.jpg',
  'manual:dimout:white:american': '/images/elec_flax_white_am.jpg',

  'manual:blackout:ivory': '/images/curtain_blackout_ivory.jpg',
  'manual:blackout:ivory:wave': '/images/curtain_blackout_ivory.jpg',
  'manual:blackout:ivory:american': '/images/elec_blackout_iv_am.jpg',
  'manual:blackout:sand': '/images/curtain_blackout_sand.jpg',
  'manual:blackout:sand:wave': '/images/curtain_blackout_sand.jpg',
  'manual:blackout:sand:american': '/images/elec_blackout_sand_am.jpg',
  'manual:blackout:cocoa': '/images/blackout_cocoa_w.jpg',
  'manual:blackout:cocoa:wave': '/images/blackout_cocoa_w.jpg',
  'manual:blackout:cocoa:american': '/images/blackout_cocoa_am.jpg',
  'manual:blackout:charcoal': '/images/curtain_blackout_charcoal.jpg',
  'manual:blackout:charcoal:wave': '/images/curtain_blackout_charcoal.jpg',
  'manual:blackout:charcoal:american': '/images/elec_blackout_charcoal_am.jpg',
  'manual:blackout:white': '/images/curtain_blackout_white.jpg',
  'manual:blackout:white:wave': '/images/curtain_blackout_white.jpg',
  'manual:blackout:white:american': '/images/blackout_white_am.jpg',

  'manual:voile:ivory': '/images/prod_andalusian.jpg',
  'manual:voile:ivory:wave': '/images/prod_andalusian.jpg',
  'manual:voile:ivory:american': '/images/voile_iv_am.jpg',
  'manual:voile:ivory:wave:lining50': '/images/prod_andalusian.jpg',
  'manual:voile:ivory:wave:lining80': '/images/voile_iv_w_lined.jpg',
  'manual:voile:ivory:wave:lining100': '/images/voile_iv_w_lined.jpg',
  'manual:voile:ivory:american:lining50': '/images/voile_iv_am.jpg',
  'manual:voile:ivory:american:lining80': '/images/voile_iv_am_lined.jpg',
  'manual:voile:ivory:american:lining100': '/images/voile_iv_am_lined.jpg',
  'manual:voile:sand': '/images/chiffon_champagne.jpg',
  'manual:voile:sand:wave': '/images/chiffon_champagne.jpg',
  'manual:voile:sand:american': '/images/chiffon_champagne.jpg',
  'manual:voile:cocoa': '/images/chiffon_cocoa.jpg',
  'manual:voile:cocoa:wave': '/images/chiffon_cocoa.jpg',
  'manual:voile:cocoa:american': '/images/chiffon_cocoa.jpg',
  'manual:voile:charcoal': '/images/chiffon_charcoal.jpg',
  'manual:voile:charcoal:wave': '/images/chiffon_charcoal.jpg',
  'manual:voile:charcoal:american': '/images/chiffon_charcoal.jpg',
  'manual:voile:white': '/images/chiffon_white.jpg',
  'manual:voile:white:wave': '/images/chiffon_white.jpg',
  'manual:voile:white:american': '/images/chiffon_white.jpg',

  'manual:crochet:ivory': '/images/crochet_iv_w.jpg',
  'manual:crochet:ivory:wave': '/images/crochet_iv_w.jpg',
  'manual:crochet:ivory:american': '/images/crochet_iv_am.jpg',
  'manual:crochet:sand': '/images/linen_sheer_sand.jpg',
  'manual:crochet:sand:wave': '/images/linen_sheer_sand.jpg',
  'manual:crochet:sand:american': '/images/linen_sheer_sand.jpg',
  'manual:crochet:cocoa': '/images/lustre_cocoa.jpg',
  'manual:crochet:cocoa:wave': '/images/lustre_cocoa.jpg',
  'manual:crochet:cocoa:american': '/images/lustre_cocoa.jpg',
  'manual:crochet:charcoal': '/images/curtain_linen_charcoal.jpg',
  'manual:crochet:charcoal:wave': '/images/curtain_linen_charcoal.jpg',
  'manual:crochet:charcoal:american': '/images/curtain_linen_charcoal.jpg',
  'manual:crochet:white': '/images/linen_sheer_white.jpg',
  'manual:crochet:white:wave': '/images/linen_sheer_white.jpg',
  'manual:crochet:white:american': '/images/linen_sheer_white.jpg',

  'manual:tn:ivory': '/images/tn_iv_w.jpg',
  'manual:tn:ivory:wave': '/images/tn_iv_w.jpg',
  'manual:tn:ivory:american': '/images/tn_iv_am.jpg',
  'manual:tn:sand': '/images/nordic_sand.jpg',
  'manual:tn:sand:wave': '/images/nordic_sand.jpg',
  'manual:tn:sand:american': '/images/elec_flax_sand_am.jpg',
  'manual:tn:cocoa': '/images/lustre_cocoa.jpg',
  'manual:tn:cocoa:wave': '/images/lustre_cocoa.jpg',
  'manual:tn:cocoa:american': '/images/elec_flax_cocoa_am.jpg',
  'manual:tn:charcoal': '/images/curtain_linen_charcoal.jpg',
  'manual:tn:charcoal:wave': '/images/curtain_linen_charcoal.jpg',
  'manual:tn:charcoal:american': '/images/elec_flax_charcoal_am.jpg',
  'manual:tn:white': '/images/raw_linen_white.jpg',
  'manual:tn:white:wave': '/images/raw_linen_white.jpg',
  'manual:tn:white:american': '/images/elec_flax_white_am.jpg',

  'manual:velvet:ivory': '/images/velvet_champagne.jpg',
  'manual:velvet:ivory:wave': '/images/velvet_champagne.jpg',
  'manual:velvet:ivory:american': '/images/elec_velvet_iv_am.jpg',
  'manual:velvet:sand': '/images/velvet_sand_w.jpg',
  'manual:velvet:sand:wave': '/images/velvet_sand_w.jpg',
  'manual:velvet:sand:american': '/images/velvet_sand_am.jpg',
  'manual:velvet:cocoa': '/images/curtain_velvet_cocoa.jpg',
  'manual:velvet:cocoa:wave': '/images/curtain_velvet_cocoa.jpg',
  'manual:velvet:cocoa:american': '/images/elec_velvet_cocoa_am.jpg',
  'manual:velvet:charcoal': '/images/velvet_charcoal.jpg',
  'manual:velvet:charcoal:wave': '/images/velvet_charcoal.jpg',
  'manual:velvet:charcoal:american': '/images/elec_velvet_charcoal_am.jpg',
  'manual:velvet:white': '/images/velvet_white_w.jpg',
  'manual:velvet:white:wave': '/images/velvet_white_w.jpg',
  'manual:velvet:white:american': '/images/velvet_white_am.jpg',

  // --- NEW MERCHANT FABRICS (Electric & Manual) ---
  // linen_dimout (لينين ديم أوت)
  'electric:linen_dimout:ivory': '/images/elec_linen_iv_w_80.jpg',
  'electric:linen_dimout:ivory:wave': '/images/elec_linen_iv_w_80.jpg',
  'electric:linen_dimout:ivory:american': '/images/elec_linen_iv_am_80.jpg',
  'electric:linen_dimout:sand': '/images/elec_flax_sand_w_80.jpg',
  'electric:linen_dimout:sand:wave': '/images/elec_flax_sand_w_80.jpg',
  'electric:linen_dimout:sand:american': '/images/elec_flax_sand_am.jpg',
  'electric:linen_dimout:cocoa': '/images/curtain_velvet_cocoa.jpg',
  'electric:linen_dimout:charcoal': '/images/curtain_linen_charcoal.jpg',
  'electric:linen_dimout:white': '/images/raw_linen_white.jpg',

  'manual:linen_dimout:ivory': '/images/elec_linen_iv_w_80.jpg',
  'manual:linen_dimout:ivory:wave': '/images/elec_linen_iv_w_80.jpg',
  'manual:linen_dimout:ivory:american': '/images/elec_linen_iv_am_80.jpg',
  'manual:linen_dimout:sand': '/images/elec_flax_sand_w_80.jpg',
  'manual:linen_dimout:sand:wave': '/images/elec_flax_sand_w_80.jpg',
  'manual:linen_dimout:sand:american': '/images/elec_flax_sand_am.jpg',
  'manual:linen_dimout:cocoa': '/images/curtain_velvet_cocoa.jpg',
  'manual:linen_dimout:charcoal': '/images/curtain_linen_charcoal.jpg',
  'manual:linen_dimout:white': '/images/raw_linen_white.jpg',

  // linen_mowashah (لينين موشح)
  'electric:linen_mowashah:ivory': '/images/nordic_sand.jpg',
  'electric:linen_mowashah:sand': '/images/nordic_sand.jpg',
  'electric:linen_mowashah:cocoa': '/images/lustre_cocoa.jpg',
  'electric:linen_mowashah:charcoal': '/images/lustre_warmgrey.jpg',
  'electric:linen_mowashah:white': '/images/prod_raw_linen.jpg',

  'manual:linen_mowashah:ivory': '/images/nordic_sand.jpg',
  'manual:linen_mowashah:sand': '/images/nordic_sand.jpg',
  'manual:linen_mowashah:cocoa': '/images/lustre_cocoa.jpg',
  'manual:linen_mowashah:charcoal': '/images/lustre_warmgrey.jpg',
  'manual:linen_mowashah:white': '/images/prod_raw_linen.jpg',

  // linen_mowashah_mobazar (لينين موشح مبزر)
  'electric:linen_mowashah_mobazar:ivory': '/images/craft_textures.jpg',
  'electric:linen_mowashah_mobazar:sand': '/images/craft_textures.jpg',
  'electric:linen_mowashah_mobazar:cocoa': '/images/craft_textures.jpg',
  'electric:linen_mowashah_mobazar:charcoal': '/images/craft_fabric_textures_1790877431954.jpg',
  'electric:linen_mowashah_mobazar:white': '/images/craft_textures.jpg',

  'manual:linen_mowashah_mobazar:ivory': '/images/craft_textures.jpg',
  'manual:linen_mowashah_mobazar:sand': '/images/craft_textures.jpg',
  'manual:linen_mowashah_mobazar:cocoa': '/images/craft_textures.jpg',
  'manual:linen_mowashah_mobazar:charcoal': '/images/craft_fabric_textures_1790877431954.jpg',
  'manual:linen_mowashah_mobazar:white': '/images/craft_textures.jpg',

  // embroidered (مطرز)
  'electric:embroidered:ivory': '/images/prod_andalusian.jpg',
  'electric:embroidered:sand': '/images/chiffon_champagne.jpg',
  'electric:embroidered:cocoa': '/images/chiffon_cocoa.jpg',
  'electric:embroidered:charcoal': '/images/chiffon_charcoal.jpg',
  'electric:embroidered:white': '/images/linen_sheer_white.jpg',

  'manual:embroidered:ivory': '/images/prod_andalusian.jpg',
  'manual:embroidered:sand': '/images/chiffon_champagne.jpg',
  'manual:embroidered:cocoa': '/images/chiffon_cocoa.jpg',
  'manual:embroidered:charcoal': '/images/chiffon_charcoal.jpg',
  'manual:embroidered:white': '/images/linen_sheer_white.jpg',

  // mouqasab (مقصب - subtle metallic shine)
  'electric:mouqasab:ivory': '/images/velvet_champagne.jpg',
  'electric:mouqasab:sand': '/images/lustre_warmgrey.jpg',
  'electric:mouqasab:cocoa': '/images/lustre_cocoa.jpg',
  'electric:mouqasab:charcoal': '/images/lustre_warmgrey.jpg',
  'electric:mouqasab:white': '/images/linen_sheer_white.jpg',

  'manual:mouqasab:ivory': '/images/velvet_champagne.jpg',
  'manual:mouqasab:sand': '/images/lustre_warmgrey.jpg',
  'manual:mouqasab:cocoa': '/images/lustre_cocoa.jpg',
  'manual:mouqasab:charcoal': '/images/lustre_warmgrey.jpg',
  'manual:mouqasab:white': '/images/linen_sheer_white.jpg',

  // tulle_mouqasab (تل مقصب)
  'electric:tulle_mouqasab:ivory': '/images/chiffon_champagne.jpg',
  'electric:tulle_mouqasab:sand': '/images/chiffon_champagne.jpg',
  'electric:tulle_mouqasab:cocoa': '/images/chiffon_cocoa.jpg',
  'electric:tulle_mouqasab:charcoal': '/images/chiffon_charcoal.jpg',
  'electric:tulle_mouqasab:white': '/images/voile_iv_w_lined.jpg',

  'manual:tulle_mouqasab:ivory': '/images/chiffon_champagne.jpg',
  'manual:tulle_mouqasab:sand': '/images/chiffon_champagne.jpg',
  'manual:tulle_mouqasab:cocoa': '/images/chiffon_cocoa.jpg',
  'manual:tulle_mouqasab:charcoal': '/images/chiffon_charcoal.jpg',
  'manual:tulle_mouqasab:white': '/images/voile_iv_w_lined.jpg',

  // Legacy manual aliases
  'manual:linen:ivory': '/images/curtain_manual.jpg',
  'manual:linen:sand': '/images/linen_sheer_sand.jpg',
  'manual:linen:cocoa': '/images/lustre_cocoa.jpg',
  'manual:linen:charcoal': '/images/curtain_linen_charcoal.jpg',
  'manual:linen:white': '/images/linen_sheer_white.jpg',
  'manual:chiffon:ivory': '/images/prod_andalusian.jpg',
  'manual:chiffon:sand': '/images/chiffon_champagne.jpg',
  'manual:chiffon:cocoa': '/images/chiffon_cocoa.jpg',
  'manual:chiffon:charcoal': '/images/chiffon_charcoal.jpg',
  'manual:chiffon:white': '/images/chiffon_white.jpg',
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
  lining?: string,
  patternId?: string
): string {
  const normType = curtainType.toLowerCase().trim();
  const normFabric = fabricId.toLowerCase().trim();
  const normColor = colorId.toLowerCase().trim();

  // 1. Direct Pattern resolution for Embroidered (مطرز)
  if (normFabric === 'embroidered') {
    if (patternId === 'gold_branch') return '/images/curtain_emb_goldbranch.jpg';
    if (patternId === 'gold_decorative') return '/images/curtain_emb_goldscallop.jpg';
    if (patternId === 'floral_white') return '/images/curtain_emb_floral.jpg';
    return '/images/curtain_emb_floral.jpg';
  }

  // 2. Direct Pattern resolution for Crochet (كروشيه)
  if (normFabric === 'crochet') {
    if (patternId === 'crochet_stripe') return '/images/curtain_crochet_stripe.jpg';
    if (patternId === 'crochet_grid') return '/images/curtain_crochet_grid.jpg';
    if (patternId === 'crochet_zigzag') return '/images/curtain_crochet_zigzag.jpg';
    if (style?.includes('أمريكي') || style?.includes('american')) {
      return '/images/crochet_iv_am.jpg';
    }
    return '/images/crochet_iv_w.jpg';
  }

  // 3. Direct resolution for Mobazar & Mankoush
  if (normFabric === 'mobazar' || normFabric === 'linen_mowashah_mobazar') {
    return '/images/curtain_mobazar.jpg';
  }
  if (normFabric === 'mankoush') {
    return '/images/curtain_mankoush.jpg';
  }

  // Normalize style
  const normStyle =
    style?.includes('أمريكي') || style?.includes('american')
      ? 'american'
      : style?.includes('ويفي') || style?.includes('wave')
      ? 'wave'
      : style === 'زم'
      ? 'shirred'
      : style === 'دكة'
      ? 'rod_pocket'
      : style === 'رينجات'
      ? 'rings'
      : 'wave';

  // Normalize lining
  const normLining =
    lining?.includes('100') || lining?.includes('Blackout')
      ? 'lining100'
      : lining?.includes('80')
      ? 'lining80'
      : 'lining50';

  // 4. Try full 5-key exact match: type:fabric:color:style:lining
  const fullKey = `${normType}:${normFabric}:${normColor}:${normStyle}:${normLining}`;
  if (IMAGE_MAP[fullKey]) {
    return IMAGE_MAP[fullKey];
  }

  // 5. Try 4-key style match: type:fabric:color:style
  const styleKey = `${normType}:${normFabric}:${normColor}:${normStyle}`;
  if (IMAGE_MAP[styleKey]) {
    return IMAGE_MAP[styleKey];
  }

  // 6. Try standard 3-key match: type:fabric:color
  const key = `${normType}:${normFabric}:${normColor}`;
  if (IMAGE_MAP[key]) {
    return IMAGE_MAP[key];
  }

  // 7. Try counterpart fallback between electric and manual
  if (normType === 'manual') {
    const elecFullKey = `electric:${normFabric}:${normColor}:${normStyle}:${normLining}`;
    if (IMAGE_MAP[elecFullKey]) return IMAGE_MAP[elecFullKey];

    const elecStyleKey = `electric:${normFabric}:${normColor}:${normStyle}`;
    if (IMAGE_MAP[elecStyleKey]) return IMAGE_MAP[elecStyleKey];

    const elecKey = `electric:${normFabric}:${normColor}`;
    if (IMAGE_MAP[elecKey]) return IMAGE_MAP[elecKey];
  } else if (normType === 'electric') {
    const manFullKey = `manual:${normFabric}:${normColor}:${normStyle}:${normLining}`;
    if (IMAGE_MAP[manFullKey]) return IMAGE_MAP[manFullKey];

    const manStyleKey = `manual:${normFabric}:${normColor}:${normStyle}`;
    if (IMAGE_MAP[manStyleKey]) return IMAGE_MAP[manStyleKey];

    const manKey = `manual:${normFabric}:${normColor}`;
    if (IMAGE_MAP[manKey]) return IMAGE_MAP[manKey];
  }

  // Fabric-specific graceful fallbacks
  if (normFabric === 'voile') {
    return normStyle === 'american' ? '/images/voile_iv_am.jpg' : '/images/chiffon_champagne.jpg';
  }
  if (normFabric === 'jacquard') {
    return normStyle === 'american' ? '/images/jacquard_iv_am.jpg' : '/images/jacquard_iv_w.jpg';
  }
  if (normFabric === 'blackout') {
    return normStyle === 'american' ? '/images/elec_blackout_iv_am.jpg' : '/images/curtain_blackout_ivory.jpg';
  }
  if (normFabric === 'dimout' || normFabric === 'linen_dimout') {
    return normStyle === 'american' ? '/images/elec_linen_iv_am_80.jpg' : '/images/elec_linen_iv_w_80.jpg';
  }
  if (normFabric === 'velvet') {
    return normStyle === 'american' ? '/images/elec_velvet_iv_am.jpg' : '/images/velvet_champagne.jpg';
  }
  if (normFabric === 'tn') {
    return normStyle === 'american' ? '/images/tn_iv_am.jpg' : '/images/tn_iv_w.jpg';
  }
  if (normFabric === 'mouqasab') {
    return '/images/velvet_champagne.jpg';
  }
  if (normFabric === 'tulle_mouqasab') {
    return '/images/chiffon_champagne.jpg';
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

  return normType === 'electric' ? '/images/curtain_electric.jpg' : '/images/curtain_manual.jpg';
}

export interface TrackOption {
  id: string;
  name: string;
  ratePerMeter: number | null; // null if unpriced
  ratePerCm: number | null;
  description: string;
  isElectric?: boolean;
  image: string;
}

export const TRACK_OPTIONS: TrackOption[] = [
  {
    id: 'standard_track',
    name: 'سكة عادية',
    ratePerMeter: 4,
    ratePerCm: 0.04,
    description: 'سكة ألمنيوم كلاسيكية بحركة انسيابية — 4 د.أ للمتر الطولي',
    image: '/images/aluminum_curtain_track.jpg',
  },
  {
    id: 'turbo_steel',
    name: 'سكة حديد تيربو',
    ratePerMeter: 5,
    ratePerCm: 0.05,
    description: 'سكة حديد تيربو فائقة المتانة للأوزان الثقيلة — 5 د.أ للمتر الطولي',
    image: '/images/aluminum_curtain_track.jpg',
  },
  {
    id: 'pipe',
    name: 'بايب',
    ratePerMeter: 3,
    ratePerCm: 0.03,
    description: 'ماسورة بايب معدنية لتعليق الستائر — 3 د.أ للمتر الطولي',
    image: '/images/aluminum_curtain_track.jpg',
  },
  {
    id: 'wave_track',
    name: 'ويفي كهربائي',
    ratePerMeter: 10,
    ratePerCm: 0.10,
    description: 'مسار ويفي كهربائي متناسق لطيات انسيابية — 10 د.أ للمتر الطولي (25 د.أ لكل 250 سم)',
    image: '/images/aluminum_curtain_track.jpg',
  },
  {
    id: 'american_track',
    name: 'جسر أمريكي كهربائي',
    ratePerMeter: 10,
    ratePerCm: 0.10,
    description: 'مسار سحب أمريكي كهربائي ميكانيكي — 10 د.أ للمتر الطولي (25 د.أ لكل 250 سم)',
    image: '/images/aluminum_curtain_track.jpg',
  },
];

// ----------------------------------------------------------------------------
// 4. Stored Base-Pricing Metadata & Central Pricing Calculator
// ----------------------------------------------------------------------------
export const LINEN_CURTAIN_RATE_PER_CM = 60 / 250; // 0.24 JOD/cm (60 JOD per 250 cm)
export const ELECTRIC_CURTAIN_RATE_PER_CM = 120 / 250; // 0.48 JOD/cm (120 JOD per 250 cm)
export const OPTIONAL_LINING_FEE_JOD = 10; // Fixed 10 JOD per curtain regardless of length or blackout %

export interface FabricCurtainPriceCalculation {
  ratePerCm: number;
  ratePerMeter: number;
  basePrice: number;
  liningFee: number;
  unitPrice: number;
  lineTotal: number;
}

/**
 * Single authoritative pricing calculator for Linen ("ستائر لينين") and Electric ("ستائر كهربائية") curtains.
 * - Linen without lining: 60 JOD per 250 cm => 0.24 JOD/cm (height 100-360 cm included, never multiplies price)
 * - Electric without lining: 120 JOD per 250 cm => 0.48 JOD/cm (height 100-360 cm included, never multiplies price)
 * - Optional lining: fixed +10 JOD per curtain regardless of horizontal length or blackout percentage
 * - unitPrice = basePrice + (hasLining ? 10 : 0)
 * - lineTotal = unitPrice * quantity
 */
export function calculateFabricCurtainPricing(
  curtainType: 'manual' | 'electric' | string,
  horizontalLengthCm: number,
  hasLining: boolean,
  quantity: number = 1
): FabricCurtainPriceCalculation {
  const isManual =
    curtainType === 'manual' ||
    curtainType === 'curtain-manual' ||
    curtainType === 'linen';
  const ratePerCm = isManual ? LINEN_CURTAIN_RATE_PER_CM : ELECTRIC_CURTAIN_RATE_PER_CM;
  const ratePerMeter = isManual ? 24 : 48;
  const validLength =
    Number.isFinite(horizontalLengthCm) && horizontalLengthCm > 0 ? horizontalLengthCm : 0;
  const validQty = Number.isFinite(quantity) && quantity >= 1 ? quantity : 1;

  const basePrice = validLength > 0 ? Math.round(validLength * ratePerCm * 100) / 100 : 0;
  const liningFee = validLength > 0 && hasLining ? OPTIONAL_LINING_FEE_JOD : 0;
  const unitPrice = validLength > 0 ? Math.round((basePrice + liningFee) * 100) / 100 : 0;
  const lineTotal = validLength > 0 ? Math.round(unitPrice * validQty * 100) / 100 : 0;

  return {
    ratePerCm,
    ratePerMeter,
    basePrice,
    liningFee,
    unitPrice,
    lineTotal,
  };
}

export const FABRIC_CURTAINS_METADATA: Record<'electric' | 'manual', FabricCurtainPricingMetadata> = {
  electric: {
    standardWidthCm: 250,
    standardHeightCm: 300,
    maxIncludedHeightCm: 360,
    basePrice: 120, // 120 JOD for 250 cm horizontal span without lining
    pricePerCm: 0.48, // 120 / 250 = 0.48 JOD per cm (48 JOD per running metre)
  },
  manual: {
    standardWidthCm: 250,
    standardHeightCm: 300,
    maxIncludedHeightCm: 360,
    basePrice: 60, // 60 JOD for 250 cm horizontal span without lining
    pricePerCm: 0.24, // 60 / 250 = 0.24 JOD per cm (24 JOD per running metre)
  },
};

// ----------------------------------------------------------------------------
// 5. Storefront Categories
// ----------------------------------------------------------------------------
export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'electric',
    name: 'ستائر كهربائية',
    subtitle: 'تشغيل ذكي ثلاثي — 120 د.أ / 250 سم (0.48 د.أ/سم)',
    description: 'ستائر كهربائية تعمل باللمس، وبالريموت كنترول، وعبر تطبيق على الهاتف، تفصيل حسب المقاس والارتفاع مشمول حتى 360 سم.',
    image: '/images/curtain_electric.jpg',
  },
  {
    id: 'manual',
    name: 'ستائر لينين',
    subtitle: 'تشغيل يدوي — 60 د.أ / 250 سم (0.24 د.أ/سم)',
    description: 'ستائر لينين يدوية بدون محرك بطيات ويفي أو أمريكي أو زم أو دكة أو رينجات، تفصيل حسب المقاس والارتفاع مشمول حتى 360 سم.',
    image: '/images/curtain_manual.jpg',
  },
  {
    id: 'roller',
    name: 'ستائر رول',
    subtitle: 'بلاك أوت، سكرين، وزيبرا',
    description: 'حلول عملية مستقيمة للنوافذ بارتفاع معياري 300 سم تعمل بسحب بحبل سلس، والسعر عند الاستفسار.',
    image: '/images/roller_blackout.jpg',
  },
  {
    id: 'tracks',
    name: 'جسور وسكك الستائر',
    subtitle: 'عادية، تيربو، بايب، كهربائية',
    description: 'تشكيلة متكاملة من سكك الألمنيوم والحديد والمواسير والمسارات الكهربائية، تفصيل حسب الطول المطلوب بالسنتيمتر.',
    image: '/images/aluminum_curtain_track.jpg',
  },
  {
    id: 'services',
    name: 'خدمات التركيب والغسيل',
    subtitle: 'تركيب، غسيل وكي البرادي — 25 د.أ',
    description: 'خدمة فني تركيب معتمد، وخدمة متكاملة لفك وغسيل وكوي البرادي بالبخار وإعادة تركيبها داخل عمان.',
    image: '/images/curtain_installation_service.png',
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
    shortDesc: 'ستائر كهربائية تعمل باللمس، وبالريموت كنترول، وعبر تطبيق على الهاتف (120 د.أ لكل 250 سم عرض بدون بطانة).',
    description: 'ستائر كهربائية تعمل باللمس، وبالريموت كنترول، وعبر تطبيق على الهاتف. تشمل خيارات أقمشة فاخرة متعددة، تفصيل حسب المقاس (120 د.أ لكل 250 سم عرض — 0.48 د.أ/سم بدون بطانة) مع شمول الارتفاع حتى 360 سم، وإمكانية إضافة بطانة اختيارية بسعر ثابت 10 دنانير.',
    fabric: 'تشمل خيارات أقمشة فاخرة: لينين، لينين ديم أوت، لينين موشح، مبزر، منكوش، جاكار، ديم أوت، بلاك أوت، أفوال، كروشيه، مطرز، مقصب، تل مقصب، تي ان، مخمل',
    lightBlocking: 'إضافة بطانة اختيارية (10 دنانير) بنسب تعتيم: 50%، 80%، 100%',
    mainImage: '/images/curtain_electric.jpg',
    images: ['/images/curtain_electric.jpg', '/images/elec_flax_ivory_w.jpg', '/images/velvet_champagne.jpg'],
    defaultFabricId: 'flax_linen',
    curtainStyles: ['ويفي كهربائي', 'أمريكي كهربائي'],
    liningOptions: ['50%', '80%', '100%'],
    pricingMeta: FABRIC_CURTAINS_METADATA.electric,
    fabricOptions: SHARED_CURTAIN_FABRICS,
    colors: CENTRAL_COLORS,
    sizes: [],
    priceDisplay: '120 د.أ / 250 سم (48 د.أ/م)',
    care: ['تنظيف جاف موصى به للمحافظة على انسيابية الطيات', 'مسح المسار الكهربائي بقطعة قماش ناعمة جافة'],
    features: [
      'ستائر كهربائية تعمل باللمس، وبالريموت كنترول، وعبر تطبيق على الهاتف',
      'تفصيل دقيق حسب المقاس بدون بطانة: 120 د.أ لكل 250 سم عرض (0.48 د.أ / سم)',
      'الارتفاع من 100 إلى 360 سم مشمول بالسعر دون تكلفة إضافية',
      'إمكانية إضافة بطانة اختيارية بتكلفة ثابتة 10 دنانير للستارة (بنسب تعتيم 50%، 80%، 100%)',
      'خيارات تفصيل: ويفي كهربائي أو أمريكي كهربائي',
      'أقمشة فاخرة: لينين، لينين ديم أوت، لينين موشح، مبزر، منكوش، جاكار، ديم أوت، بلاك أوت، أفوال، كروشيه، مطرز، مقصب، تل مقصب، تي ان، مخمل',
    ],
    isFeatured: true,
  },

  // 2. ستائر لينين (formerly ستائر عادية)
  {
    id: 'curtain-manual',
    slug: 'manual-curtain',
    name: 'ستائر لينين',
    curtainType: 'manual',
    category: 'manual',
    categoryName: 'ستائر لينين',
    shortDesc: 'ستائر لينين يدوية انسيابية بدون محرك، تفصيل حسب المقاس بدقة (60 د.أ لكل 250 سم عرض بدون بطانة) مع شمول الارتفاع حتى 360 سم.',
    description: 'ستائر لينين راقية بتشغيل يدوي سلس بدون محرك. تشمل خيارات أقمشة فاخرة متعددة، تفصيل حسب المقاس (60 د.أ لكل 250 سم عرض — 0.24 د.أ/سم بدون بطانة) مع شمول الارتفاع من 100 إلى 360 سم بالسعر دون تكلفة إضافية، وإمكانية إضافة بطانة اختيارية بسعر ثابت 10 دنانير.',
    fabric: 'تشمل خيارات أقمشة فاخرة: لينين، لينين ديم أوت، لينين موشح، مبزر، منكوش، جاكار، ديم أوت، بلاك أوت، أفوال، كروشيه، مطرز، مقصب، تل مقصب، تي ان، مخمل',
    lightBlocking: 'إضافة بطانة اختيارية (10 دنانير) بنسب تعتيم: 50%، 80%، 100%',
    mainImage: '/images/curtain_manual.jpg',
    images: ['/images/curtain_manual.jpg', '/images/elec_flax_ivory_w.jpg', '/images/velvet_champagne.jpg'],
    defaultFabricId: 'flax_linen',
    curtainStyles: ['ويفي', 'أمريكي', 'زم', 'دكة', 'رينجات'],
    liningOptions: ['50%', '80%', '100%'],
    pricingMeta: FABRIC_CURTAINS_METADATA.manual,
    fabricOptions: SHARED_CURTAIN_FABRICS,
    colors: CENTRAL_COLORS,
    sizes: [],
    priceDisplay: '60 د.أ / 250 سم (24 د.أ/م)',
    care: ['تنظيف جاف موصى به للمحافظة على انسيابية الطيات', 'كي خفيف بالبخار لترتيب القماش'],
    features: [
      'تشغيل يدوي كلاسيكي انسيابي بدون محرك',
      'تفصيل دقيق حسب المقاس بدون بطانة: 60 د.أ لكل 250 سم عرض (0.24 د.أ / سم)',
      'الارتفاع من 100 إلى 360 سم مشمول بالسعر دون تكلفة إضافية',
      'إمكانية إضافة بطانة اختيارية بتكلفة ثابتة 10 دنانير للستارة (بنسب تعتيم 50%، 80%، 100%)',
      'خيارات تفصيل متعددة: ويفي، أمريكي، زم، دكة، رينجات',
      'أقمشة فاخرة: لينين، لينين ديم أوت، لينين موشح، مبزر، منكوش، جاكار، ديم أوت، بلاك أوت، أفوال، كروشيه، مطرز، مقصب، تل مقصب، تي ان، مخمل',
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
    shortDesc: 'ستارة رول زيبرا ذات شرائح متناوبة تفصيل حسب المقاس بدقة، بسعر 20 د.أ لكل متر مربع.',
    description: 'ستارة رول زيبرا بأسلوب الشرائح المزدوجة المتناوبة للتحكم بالضوء والخصوصية بدقة تامة. مصنعة حسب المقاس، بسعر 20 د.أ لكل متر مربع.',
    fabric: 'بوليستر تقني معالج بنظام الشرائح المزدوجة',
    lightBlocking: 'تحكم تدريجي بين الشفافية والتعتيم',
    mainImage: '/images/zebra_inst_white.jpg',
    images: ['/images/zebra_inst_white.jpg', '/images/zebra_inst_sand.jpg', '/images/zebra_inst_charcoal.jpg', '/images/zebra_inst_linen.jpg'],
    defaultFabricId: 'zebra',
    isUnpriced: false,
    priceDisplay: '20 د.أ / م²',
    isMadeToMeasureZebra: true,
    zebraColors: ZEBRA_COLORS,
    colors: ZEBRA_COLORS.map((z) => ({
      id: z.id,
      name: z.name,
      hex: z.hex,
      image: z.installedImage,
      gallery: [z.installedImage],
    })),
    sizes: [],
    care: ['مسح خفيف بإسفنجة ناعمة', 'تجنب الفرك القوي للحفاظ على استقامة الشرائح'],
    features: [
      'تفصيل دقيق حسب المقاس (العرض × الطول)',
      'سعر مباشر حسب المساحة: 20 د.أ لكل متر مربع',
      'شرائح أفقية مزدوجة متناوبة للتحكم الفوري بالإضاءة',
      'تشكيلات ألوان وتصاميم متنوعة تناسب مختلف المساحات',
    ],
    isFeatured: true,
  },

  // 6. جسور وسكك الستائر
  {
    id: 'curtain-track-aluminum',
    slug: 'aluminum-curtain-track',
    name: 'جسور وسكك الستائر',
    curtainType: 'track',
    category: 'tracks',
    categoryName: 'سكك وملحقات',
    shortDesc: 'سكك عادية، تيربو، بايب، ويفي كهربائي، وجسر أمريكي كهربائي، تفصيل حسب الطول بالسنتيمتر بدقة.',
    description: 'تشكيلة متكاملة من جسور وسكك الستائر: سكة عادية (4 د.أ/م)، سكة حديد تيربو (5 د.أ/م)، بايب (3 د.أ/م)، ويفي كهربائي (10 د.أ/م)، جسر أمريكي كهربائي (10 د.أ/م).',
    fabric: 'سكك ألمنيوم وحديد تيربو ومواسير بايب ومسارات ويفي وأمريكي متطورة',
    lightBlocking: 'ملحقات ومسارات لكافة أنواع الستائر',
    mainImage: '/images/aluminum_curtain_track.jpg',
    images: ['/images/aluminum_curtain_track.jpg'],
    defaultFabricId: 'track_standard',
    isTrackAccessory: true,
    priceDisplay: 'ابتداءً من 3 د.أ للمتر الطولي',
    colors: [
      {
        id: 'white_thermal',
        name: 'أبيض مدهون حرارياً',
        hex: '#FFFFFF',
        image: '/images/aluminum_curtain_track.jpg',
        gallery: ['/images/aluminum_curtain_track.jpg'],
      },
    ],
    sizes: [],
    care: ['مسح المسار بقطعة قماش ناعمة وجافة للحفاظ على انسيابية الحركة', 'عجلات سايلنت هادئة تدوم طويلاً'],
    features: [
      'سكة عادية: 4 د.أ للمتر الطولي',
      'سكة حديد تيربو: 5 د.أ للمتر الطولي',
      'بايب: 3 د.أ للمتر الطولي',
      'ويفي كهربائي: 10 د.أ للمتر الطولي (25 د.أ لكل 250 سم)',
      'جسر أمريكي كهربائي: 10 د.أ للمتر الطولي (25 د.أ لكل 250 سم)',
      'تفصيل دقيق حسب الطول المطلوب بالسنتيمتر',
    ],
    isFeatured: true,
  },

  // 7. جوانب ستائر كتان
  {
    id: 'curtain-linen-side-panels',
    slug: 'linen-side-panels',
    name: 'جوانب ستائر كتان',
    curtainType: 'manual',
    category: 'manual',
    categoryName: 'ستائر لينين',
    shortDesc: 'جوانب ستائر كتان أنيقة لتأطير النوافذ، اختر الجانب (يمين، يسار، كلاهما) واللون.',
    description: 'جوانب ستائر قماشية من الكتان الفاخر المنسوج لتأطير النوافذ وتوفير لمسة دافئة وفخمة. تتوفر للجانب الأيمن (30 د.أ)، الجانب الأيسر (30 د.أ)، أو كلاهما كزوج متكامل (60 د.أ).',
    fabric: 'كتان فاخر 100% (100% Linen)',
    lightBlocking: 'تأطير أنيق وتمرير لطيف للضوء',
    mainImage: '/images/side_panel_ivory_both.jpg',
    images: [
      '/images/side_panel_ivory_both.jpg',
      '/images/side_panel_sand_beige_right.jpg',
      '/images/side_panel_dark_grey_left.jpg',
    ],
    defaultFabricId: 'flax_linen',
    isLinenSidePanel: true,
    priceDisplay: '30 د.أ للجانب · 60 د.أ للزوج',
    colors: SIDE_PANEL_COLORS,
    sizes: [],
    care: ['تنظيف جاف موصى به لحفظ جودة وانسيابية القماش', 'كي خفيف بالبخار لترتيب الجوانب'],
    features: [
      'جوانب ستائر كتان فاخرة لتأطير النوافذ بأناقة',
      'اختيار تحديد الجانب: يمين (30 د.أ)، يسار (30 د.أ)، كلاهما (60 د.أ)',
      'تشكيلة من 11 لوناً مميزاً تناسب كافة الديكورات والمجالس',
      'قماش كتان طبيعي عالي الجودة بانسيابية ممتازة',
    ],
    isFeatured: true,
  },

  // 7. طلب فني تركيب
  {
    id: 'service-installation',
    slug: 'curtain-installation-technician',
    name: 'طلب فني تركيب',
    curtainType: 'service',
    category: 'services',
    categoryName: 'خدمات التركيب',
    shortDesc: 'تُحسب تكلفة التركيب لكل ستارة حسب المنطقة المختارة.',
    description: 'تُحسب تكلفة التركيب لكل ستارة حسب المنطقة المختارة.',
    fabric: 'خدمة فني معتمد للتركيب والتثبيت الاحترافي',
    lightBlocking: 'خدمة فنية معتمدة',
    mainImage: '/images/curtain_installation_service.png',
    images: ['/images/curtain_installation_service.png'],
    defaultFabricId: 'service_standard',
    isInstallationService: true,
    priceDisplay: '10 د.أ داخل عمان · 25 د.أ خارج عمان',
    colors: [],
    sizes: [],
    care: ['يتم التنسيق لتحديد موعد الزيارة المناسب بعد تأكيد الطلب'],
    features: [
      'فني تركيب محترف مع كافة معدات وأدوات التثبيت المتطورة',
      'داخل عمان: 10 د.أ لكل ستارة',
      'خارج عمان: 25 د.أ لكل ستارة',
      'ضمان التثبيت السليم والمتوازن للسكك والستائر',
    ],
    isFeatured: true,
  },

  // 8. غسيل وكي البرادي
  {
    id: 'service-dry-cleaning',
    slug: 'curtain-dry-cleaning',
    name: 'غسيل وكي البرادي',
    curtainType: 'service',
    category: 'services',
    categoryName: 'خدمات العناية والتركيب',
    shortDesc: 'خدمة متكاملة تشمل فك البرداية وغسيلها وكويها وإعادة تركيبها بعناية فائقة.',
    description: 'خدمة متكاملة تشمل فك البرداية وغسيلها وكويها بأحدث أجهزة البخار وإعادة تركيبها.',
    fabric: 'غسيل وتعقيم وكوي بالبخار لجميع أنواع أقمشة البرادي',
    lightBlocking: 'متوفر داخل عمان فقط',
    mainImage: '/images/washing_curtains.jpg',
    images: ['/images/washing_curtains.jpg'],
    defaultFabricId: 'dry_cleaning',
    isDryCleaningService: true,
    availabilityBadge: 'متوفر داخل عمان فقط',
    priceDisplay: '25 د.أ لكل برداية',
    colors: [],
    sizes: [],
    care: ['يشمل فك البرادي بحرص وغسيلها وكويها ونقلها وإعادة تركيبها بأعلى جودة'],
    features: [
      'خدمة متكاملة: فك، غسيل، كوي بالبخار، وإعادة تركيب',
      'متوفر داخل عمان فقط',
      '25 د.أ لكل برداية شاملة كافة مراحل الخدمة',
      'عناية فائقة بكافة أنواع أقمشة البرادي الحساسة والمبطنة',
    ],
    isFeatured: true,
  },
];
