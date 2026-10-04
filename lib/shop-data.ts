// ============================================================================
// CONFIGURATION & CENTRALIZED STORE DATA
// ============================================================================
// Single source of truth for shop identity, confirmed details, categories,
// color-to-image mappings, and ready-made products.
// ============================================================================

export interface ColorOption {
  id: string;
  name: string;
  hex: string;
  image: string; // Dedicated preview photo for this color
  gallery: string[]; // Thumbnail angles and views for this color
}

export interface SizeOption {
  id: string;
  label: string; // e.g., "150 × 260 سم"
  widthCm: number;
  heightCm: number;
  price: number; // Demo price in JOD for this specific variant
  variantId?: string;
  stockQuantity?: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  colorId: string;
  sizeId: string;
  price: number;
  stockQuantity: number;
  isAvailable: boolean;
  sku?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: 'sheer' | 'blackout' | 'roller';
  categoryName: string;
  shortDesc: string;
  description: string;
  fabric: string;
  lightBlocking: string;
  colors: ColorOption[];
  sizes: SizeOption[];
  variants?: ProductVariant[];
  images: string[];
  mainImage?: string;
  care: string[];
  features: string[];
  isFeatured?: boolean;
}

export interface CategoryInfo {
  id: 'sheer' | 'blackout' | 'roller';
  name: string;
  subtitle: string;
  description: string;
  image: string;
}

export interface ShopConfig {
  brandName: string;
  brandTagline: string;
  country: string;
  city: string;
  locationConfirmed: string;
  contactConfirmed: string;
  currencySymbol: string;
  currencyCode: string;
  deliveryPricingNote: string;
  demoNotice: string;
}

// ----------------------------------------------------------------------------
// 1. Confirmed Shop Configuration
// ----------------------------------------------------------------------------
export const SHOP_CONFIG: ShopConfig = {
  brandName: 'سيتارة',
  brandTagline: 'ستائر فاخرة وتفصيل حسب الطلب',
  country: 'الأردن',
  city: 'عمّان',
  locationConfirmed: 'عمّان، المملكة الأردنية الهاشمية',
  contactConfirmed: 'الاستفسارات متاحة عبر نموذج التسعير المخصص أو المراسلة المباشرة',
  currencySymbol: 'د.أ',
  currencyCode: 'JOD',
  deliveryPricingNote: 'تُحدّد لاحقًا بحسب العنوان والمحافظة',
  demoNotice: 'صور المنتجات تمثيلية استعراضية لأغراض النموذج الأولي (Phase 1)؛ ولا تمثل مخزوناً مادياً جاهزاً للتسليم الفوري.',
};

// ----------------------------------------------------------------------------
// 2. Demo Categories
// ----------------------------------------------------------------------------
export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'sheer',
    name: 'ستائر شفافة',
    subtitle: 'ترشيح لطيف لضوء النهار',
    description: 'أنسجة كتانية وشيفون انسيابية توفر خصوصية نهارية وتسمح بنفاذ الضوء بنعومة.',
    image: '/images/cat_sheer.jpg',
  },
  {
    id: 'blackout',
    name: 'ستائر تعتيم',
    subtitle: 'عزل تام للضوء والحرارة',
    description: 'خامات مخملية وأنسجة ثلاثية الطبقات لحجب الإنارة الخارجية وحفظ برودة الغرفة.',
    image: '/images/cat_blackout.jpg',
  },
  {
    id: 'roller',
    name: 'ستائر رول',
    subtitle: 'تصميم عملي وأنيق',
    description: 'حلول معمارية مستقيمة للتحكم الدقيق بالإضاءة في المساحات الحديثة.',
    image: '/images/cat_roller.jpg',
  },
];

// ----------------------------------------------------------------------------
// 3. 8 Distinct Products with Dedicated, Non-Duplicated Color-to-Image Mappings
// ----------------------------------------------------------------------------
export const PRODUCTS: Product[] = [
  {
    id: 'curtain-01',
    slug: 'tulia-linen-sheer',
    name: 'ستارة توليا كتان شفاف',
    category: 'sheer',
    categoryName: 'ستائر شفافة',
    shortDesc: 'كتان طبيعي ناعم الملمس ينسدل بخفة ويمنح الغرفة تدفقاً هادئاً لضوء النهار.',
    description: 'ستارة من الكتان الطبيعي المنسوج بخيوط هوائية خفيفة؛ تضفي على النوافذ رحابة وأناقة دافئة دون حجب الإضاءة الطبيعية.',
    fabric: 'كتان طبيعي 100% بنسيج هوائي خفيف',
    lightBlocking: 'شفافة (ترشيح ناعم لضوء النهار بنسبة 60%)',
    colors: [
      {
        id: 'ivory',
        name: 'عاجي طبيعي',
        hex: '#F5EFE6',
        image: '/images/cat_sheer.jpg',
        gallery: ['/images/cat_sheer.jpg'],
      },
      {
        id: 'sand',
        name: 'رملي دافئ',
        hex: '#D8C6AE',
        image: '/images/linen_sheer_sand.jpg',
        gallery: ['/images/linen_sheer_sand.jpg'],
      },
      {
        id: 'pure-white',
        name: 'أبيض ناصع',
        hex: '#FFFFFF',
        image: '/images/linen_sheer_white.jpg',
        gallery: ['/images/linen_sheer_white.jpg'],
      },
    ],
    sizes: [
      { id: 's1', label: '150 × 260 سم', widthCm: 150, heightCm: 260, price: 34 },
      { id: 's2', label: '200 × 260 سم', widthCm: 200, heightCm: 260, price: 42 },
      { id: 's3', label: '250 × 280 سم', widthCm: 250, heightCm: 280, price: 52 },
    ],
    images: ['/images/cat_sheer.jpg', '/images/linen_sheer_sand.jpg', '/images/linen_sheer_white.jpg'],
    care: ['غسيل جاف أو بماء بارد', 'كي خفيف بالبخار'],
    features: ['شريط تعليق مخفي مدمج', 'حاشية سفلية مثقلة لتوازن الإسدال'],
    isFeatured: true,
  },
  {
    id: 'curtain-02',
    slug: 'imperial-velvet-blackout',
    name: 'ستارة إمبريال مخمل تعتيم',
    category: 'blackout',
    categoryName: 'ستائر تعتيم',
    shortDesc: 'مخمل ثقيل ببطانة عازلة لحجب كامل لأشعة الشمس وضمان سكينة تامة في الغرفة.',
    description: 'قماش مخملي فخم مع بطانة مدمجة عازلة لحجب الضوء الخارجي بنسبة 100% والمساعدة في تخفيف حرارة النوافذ المباشرة.',
    fabric: 'مخمل ثقيل متعدد الطبقات مع بطانة عازلة',
    lightBlocking: 'تعتيم كامل 100% (حجب تام للضوء)',
    colors: [
      {
        id: 'deep-cocoa',
        name: 'كاكاو داكن',
        hex: '#2A201A',
        image: '/images/cat_blackout.jpg',
        gallery: ['/images/cat_blackout.jpg'],
      },
      {
        id: 'charcoal',
        name: 'فحمي ملكي',
        hex: '#232220',
        image: '/images/velvet_charcoal.jpg',
        gallery: ['/images/velvet_charcoal.jpg'],
      },
      {
        id: 'champagne-sand',
        name: 'رملي شامبين',
        hex: '#D1BEA8',
        image: '/images/velvet_champagne.jpg',
        gallery: ['/images/velvet_champagne.jpg'],
      },
    ],
    sizes: [
      { id: 'v1', label: '140 × 260 سم', widthCm: 140, heightCm: 260, price: 48 },
      { id: 'v2', label: '200 × 260 سم', widthCm: 200, heightCm: 260, price: 64 },
      { id: 'v3', label: '280 × 280 سم', widthCm: 280, heightCm: 280, price: 85 },
    ],
    images: ['/images/cat_blackout.jpg', '/images/velvet_charcoal.jpg', '/images/velvet_champagne.jpg'],
    care: ['تنظيف جاف حصراً لحماية وبر المخمل', 'شفط دوري للغبار بفرشاة ناعمة'],
    features: ['عزل ضوئي وحراري عالي', 'ثنيات منتظمة تدوم طويلاً'],
    isFeatured: true,
  },
  {
    id: 'curtain-03',
    slug: 'zebra-duo-roller',
    name: 'ستارة رول زيبرا مزدوجة',
    category: 'roller',
    categoryName: 'ستائر رول',
    shortDesc: 'شرائح متناوبة ذكية تتيح التحكم الفوري في مستوى الخصوصية والضوء بسلاسة.',
    description: 'تصميم عملي وعصري للنوافذ، يجمع بين طبقات قماشية شفافة وشبه معتمة لتعديل الإضاءة بحركة سحب ميكانيكية دقيقة.',
    fabric: 'بوليستر تقني مقاوم للأتربة مع قضيب سحب صلب',
    lightBlocking: 'تحكم متدرج من شفاف إلى تعتيم 85%',
    colors: [
      {
        id: 'slate',
        name: 'رمادي حجري',
        hex: '#4A4846',
        image: '/images/cat_roller.jpg',
        gallery: ['/images/cat_roller.jpg'],
      },
      {
        id: 'mocha',
        name: 'موكا هادئ',
        hex: '#736153',
        image: '/images/curtain_mocha_roller.jpg',
        gallery: ['/images/curtain_mocha_roller.jpg'],
      },
      {
        id: 'cream',
        name: 'عاجي بيج',
        hex: '#F0E8DC',
        image: '/images/roller_zebra_cream.jpg',
        gallery: ['/images/roller_zebra_cream.jpg'],
      },
    ],
    sizes: [
      { id: 'r1', label: '120 × 200 سم', widthCm: 120, heightCm: 200, price: 39 },
      { id: 'r2', label: '160 × 220 سم', widthCm: 160, heightCm: 220, price: 49 },
      { id: 'r3', label: '200 × 250 سم', widthCm: 200, heightCm: 250, price: 65 },
    ],
    images: ['/images/cat_roller.jpg', '/images/curtain_mocha_roller.jpg', '/images/roller_zebra_cream.jpg'],
    care: ['مسح بإسفنجة رطبة خفيفة', 'تجنب الغسيل بالماء الجاري'],
    features: ['آلية رفع هادئة وسلسة', 'تثبيت سقفي أو جداري مباشر'],
    isFeatured: true,
  },
  {
    id: 'curtain-04',
    slug: 'andalusian-chiffon-voile',
    name: 'ستارة شيفون أندلسي انسيابي',
    category: 'sheer',
    categoryName: 'ستائر شفافة',
    shortDesc: 'شيفون ناعم خفيف الوزن ينسدل برقة فوق النوافذ ويمنح المكان لمسة هادئة ومريحة.',
    description: 'قماش شيفون فرنسي بملمس كريمي مطفأ؛ يتميز بتموجات خفيفة تعكس الضوء بلطف وتمنح المساحة إحساساً بالنقاء.',
    fabric: 'شيفون كريب معالج',
    lightBlocking: 'شفافة (مرشحة للضوء بنسبة 70%)',
    colors: [
      {
        id: 'offwhite',
        name: 'أوف وايت لؤلؤي',
        hex: '#FAF8F5',
        image: '/images/prod_andalusian.jpg',
        gallery: ['/images/prod_andalusian.jpg'],
      },
      {
        id: 'champagne',
        name: 'شامبين خفيف',
        hex: '#EAE0D3',
        image: '/images/chiffon_champagne.jpg',
        gallery: ['/images/chiffon_champagne.jpg'],
      },
    ],
    sizes: [
      { id: 'a1', label: '150 × 260 سم', widthCm: 150, heightCm: 260, price: 36 },
      { id: 'a2', label: '220 × 270 سم', widthCm: 220, heightCm: 270, price: 46 },
      { id: 'a3', label: '300 × 280 سم', widthCm: 300, heightCm: 280, price: 58 },
    ],
    images: ['/images/prod_andalusian.jpg', '/images/chiffon_champagne.jpg'],
    care: ['غسيل يدوي أو دورة أقمشة رقيقة', 'تعلق رطبة لتجف بانسيابية'],
    features: ['حواشي جانبية محبوكة بدقة', 'مقاومة للتجعد والبهتان'],
    isFeatured: false,
  },
  {
    id: 'curtain-05',
    slug: 'nordic-thermal-blackout',
    name: 'ستارة نورديك عازل حراري',
    category: 'blackout',
    categoryName: 'ستائر تعتيم',
    shortDesc: 'نسيج ثلاثي الأبعاد محبوك بكثافة لحجب الأشعة القوية والمساعدة في عزل حرارة النوافذ.',
    description: 'ستارة عملية بتشطيب مات حديث لا يحتوي على طبقات بلاستيكية لاصقة، توفر نوماً هادئاً وتخفف من وهج الشمس الصباحي.',
    fabric: 'نسيج محبوك ثلاثي الطبقات بملمس كتاني',
    lightBlocking: 'تعتيم بنسبة 95%',
    colors: [
      {
        id: 'earth-grey',
        name: 'ترابي رمادي',
        hex: '#3F3B37',
        image: '/images/prod_nordic.jpg',
        gallery: ['/images/prod_nordic.jpg'],
      },
      {
        id: 'olive-muted',
        name: 'زيتي هادئ',
        hex: '#343831',
        image: '/images/curtain_olive.jpg',
        gallery: ['/images/curtain_olive.jpg'],
      },
      {
        id: 'warm-sand',
        name: 'بيج رملي',
        hex: '#C7B8A1',
        image: '/images/nordic_sand.jpg',
        gallery: ['/images/nordic_sand.jpg'],
      },
    ],
    sizes: [
      { id: 'n1', label: '150 × 260 سم', widthCm: 150, heightCm: 260, price: 44 },
      { id: 'n2', label: '200 × 260 سم', widthCm: 200, heightCm: 260, price: 56 },
      { id: 'n3', label: '260 × 280 سم', widthCm: 260, heightCm: 280, price: 72 },
    ],
    images: ['/images/prod_nordic.jpg', '/images/curtain_olive.jpg', '/images/nordic_sand.jpg'],
    care: ['غسيل آلي على الدورة اللطيفة', 'كي على درجة حرارة منخفضة'],
    features: ['تخفيف فعال لوهج الشمس', 'ملمس نسيجي مات وأنيق'],
    isFeatured: false,
  },
  {
    id: 'curtain-06',
    slug: 'solar-screen-roller',
    name: 'ستارة رول سولار واقية من الوهج',
    category: 'roller',
    categoryName: 'ستائر رول',
    shortDesc: 'نسيج شبكي ميكروي يكسر حرارة الشمس والوهج مع الحفاظ على وضوح الإطلالة الخارجية.',
    description: 'الخيار المثالي للمكاتب وواجهات الصالونات الكبيرة؛ نسيج شبكي هندسي يمنع دخول الأشعة فوق البنفسجية ويحافظ على رؤية الخارج نهاراً.',
    fabric: 'ألياف مقاومة للشمس (Solar Mesh 5%)',
    lightBlocking: 'ترشيح الوهج مع وضوح الرؤية للخارج',
    colors: [
      {
        id: 'charcoal-dark',
        name: 'فحمي مطفأ',
        hex: '#2A2928',
        image: '/images/curtain_charcoal_roller.jpg',
        gallery: ['/images/curtain_charcoal_roller.jpg'],
      },
      {
        id: 'silver-sand',
        name: 'رملي فضي',
        hex: '#C4BCB1',
        image: '/images/prod_solar.jpg',
        gallery: ['/images/prod_solar.jpg'],
      },
      {
        id: 'pure-offwhite',
        name: 'أوف وايت',
        hex: '#ECE8DF',
        image: '/images/solar_offwhite.jpg',
        gallery: ['/images/solar_offwhite.jpg'],
      },
    ],
    sizes: [
      { id: 'sr1', label: '100 × 180 سم', widthCm: 100, heightCm: 180, price: 32 },
      { id: 'sr2', label: '140 × 200 سم', widthCm: 140, heightCm: 200, price: 42 },
      { id: 'sr3', label: '180 × 240 سم', widthCm: 180, heightCm: 240, price: 54 },
    ],
    images: ['/images/curtain_charcoal_roller.jpg', '/images/prod_solar.jpg', '/images/solar_offwhite.jpg'],
    care: ['مسح مباشر بإسفنجة رطبة', 'مقاوم للرطوبة والبقع'],
    features: ['كسر وهج الشاشات ونوافذ العمل', 'سهولة فائقة في التنظيف'],
    isFeatured: false,
  },
  {
    id: 'curtain-07',
    slug: 'velvet-lustre-drape',
    name: 'ستارة فيلفت ساتان هادئ',
    category: 'blackout',
    categoryName: 'ستائر تعتيم',
    shortDesc: 'مخمل إيطالي ناعم بلمعان حريري مطفأ يمنح الغرف لمسة دافئة وفخامة كلاسيكية.',
    description: 'تتميز هذه الستارة بسماكة متوازنة وانسيابية ثقيلة تسقط عمودياً بأناقة كاملة، ما يجعلها مناسبة لغرف الضيوف وغرف النوم الرئيسية.',
    fabric: 'مخمل ساتان ناعم مبطن',
    lightBlocking: 'تعتيم بنسبة 85%',
    colors: [
      {
        id: 'champagne-gold',
        name: 'شامبين دافئ',
        hex: '#C8AA78',
        image: '/images/craft_textures.jpg',
        gallery: ['/images/craft_textures.jpg'],
      },
      {
        id: 'cocoa-rich',
        name: 'بني شوكولاتة',
        hex: '#3B2D26',
        image: '/images/lustre_cocoa.jpg',
        gallery: ['/images/lustre_cocoa.jpg'],
      },
      {
        id: 'warm-grey',
        name: 'رمادي دافئ',
        hex: '#58534E',
        image: '/images/lustre_warmgrey.jpg',
        gallery: ['/images/lustre_warmgrey.jpg'],
      },
    ],
    sizes: [
      { id: 'vl1', label: '140 × 260 سم', widthCm: 140, heightCm: 260, price: 45 },
      { id: 'vl2', label: '200 × 260 سم', widthCm: 200, heightCm: 260, price: 59 },
      { id: 'vl3', label: '260 × 275 سم', widthCm: 260, heightCm: 275, price: 76 },
    ],
    images: ['/images/craft_textures.jpg', '/images/lustre_cocoa.jpg', '/images/lustre_warmgrey.jpg'],
    care: ['تنظيف جاف احترافي', 'تجنب الفرك بالماء الساخن'],
    features: ['ملمس فائق النعومة', 'بطانة تحمي ثبات اللون من الشمس'],
    isFeatured: true,
  },
  {
    id: 'curtain-08',
    slug: 'raw-linen-breeze',
    name: 'ستارة بريز كتان خام طبيعي',
    category: 'sheer',
    categoryName: 'ستائر شفافة',
    shortDesc: 'شاش كتان نقي غير معالج بتموجات عضوية خفيفة تعكس بساطة الديكور المعاصر.',
    description: 'قماش كتان عضوي غير مخلوط بألياف صناعية؛ نسيجه الطبيعي يضفي إحساساً مريحاً بالسكينة ويلتقط نسمات الهواء بلطف.',
    fabric: 'كتان خام طبيعي 100%',
    lightBlocking: 'شفافة بخصوصية نهارية ناعمة',
    colors: [
      {
        id: 'raw-beige',
        name: 'بيج خام طبيعي',
        hex: '#DFD4C3',
        image: '/images/prod_raw_linen.jpg',
        gallery: ['/images/prod_raw_linen.jpg'],
      },
      {
        id: 'snow-white',
        name: 'أبيض ثلجي',
        hex: '#F9F8F6',
        image: '/images/raw_linen_white.jpg',
        gallery: ['/images/raw_linen_white.jpg'],
      },
    ],
    sizes: [
      { id: 'rb1', label: '150 × 250 سم', widthCm: 150, heightCm: 250, price: 29 },
      { id: 'rb2', label: '200 × 260 سم', widthCm: 200, heightCm: 260, price: 38 },
      { id: 'rb3', label: '280 × 280 سم', widthCm: 280, heightCm: 280, price: 49 },
    ],
    images: ['/images/prod_raw_linen.jpg', '/images/raw_linen_white.jpg'],
    care: ['غسيل بماء بارد', 'تجفيف معلق للمحافظة على التموج الطبيعي'],
    features: ['ألياف طبيعية خالية من المعالجات الكيميائية', 'تزداد نعومة مع الاستخدام'],
    isFeatured: false,
  },
];

// Ensure fallback demo products have variants array populated
PRODUCTS.forEach((prod) => {
  if (!prod.variants || prod.variants.length === 0) {
    prod.variants = [];
    prod.colors.forEach((c) => {
      prod.sizes.forEach((s) => {
        prod.variants!.push({
          id: `var_${prod.id}_${c.id}_${s.id}`,
          productId: prod.id,
          colorId: c.id,
          sizeId: s.id,
          price: s.price,
          stockQuantity: 10,
          isAvailable: true,
        });
      });
    });
  }
});

// ----------------------------------------------------------------------------
// 4. Custom Quote Configurations (Curtain types, fabrics, colors)
// ----------------------------------------------------------------------------
export const CUSTOM_CURTAIN_TYPES = [
  'ستارة سحب جانبي انسيابية (ثنيات أمريكية / ويف)',
  'ستارة تعتيم بلاك آوت عازلة للحرارة',
  'ستارة شيفون طبقات خفيفة',
  'ستارة رول زيبرا مزدوجة',
  'ستارة رول سادة معتمة كاملة',
  'ستارة رول سولار واقية من الشمس والوهج',
];

export const CUSTOM_FABRIC_OPTIONS = [
  { id: 'belgian-linen', name: 'كتان طبيعي منسوج (شفاف مريح)' },
  { id: 'french-voile', name: 'شيفون انسيابي فائق النعومة (شفاف)' },
  { id: 'imperial-velvet', name: 'مخمل مبطن عازل للضوء (تعتيم 100%)' },
  { id: 'nordic-thermal', name: 'نسيج ثلاثي الطبقات عازل حراري (تعتيم 95%)' },
  { id: 'roller-sunscreen', name: 'نسيج رول سولار واقي من الأشعة والحرارة' },
  { id: 'roller-blackout', name: 'نسيج رول معتم كامل ومقاوم للرطوبة' },
];

export const CUSTOM_COLOR_PRESETS = [
  'عاجي طبيعي / أوف وايت',
  'رملي دافئ / بيج',
  'كاكاو داكن / بني قهوة',
  'فحمي ملكي / رمادي داكن',
  'شامبين ذهبي هادئ',
  'أبيض ناصع كلاسيكي',
  'درجة أخرى (تُحدد في ملاحظات القطعة)',
];

export interface CustomCurtainItem {
  id: string;
  curtainType: string;
  fabric: string;
  color: string;
  customColorNote: string;
  widthCm: string;
  heightCm: string;
  quantity: number;
  roomLocation: string;
  itemNotes: string;
}
