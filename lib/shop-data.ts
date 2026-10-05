// ============================================================================
// CONFIGURATION & CENTRALIZED STORE DATA
// ============================================================================
// Re-exports the typed local catalog from ./catalog and defines shop-wide
// configuration, confirmed business location, and custom curtain options.
// ============================================================================

export * from './catalog';

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
  whatsappNumber: string;
}

// ============================================================================
// CENTRAL BUSINESS WHATSAPP CONFIGURATION
// ============================================================================
// Verified business WhatsApp number for سيتارة / SETARA:
// Exact international format without +, 00, spaces, or hyphens: 962798187000
export const BUSINESS_WHATSAPP_NUMBER: string = (
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '962798187000'
)
  .trim()
  .replace(/[^0-9]/g, '')
  .replace(/^00/, '') || '962798187000';

/**
 * Single central generator for all WhatsApp links across the application:
 * cart orders, custom-curtain quote requests, and contact links.
 * Formats as https://wa.me/962798187000?text=<encodedMessage> using encodeURIComponent.
 */
export function getWhatsAppUrl(text?: string): string {
  if (!text) {
    return `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}`;
  }
  return `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
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
  contactConfirmed: 'الاستفسارات والطلبات متاحة عبر واتساب (+962 79 818 7000) ونموذج التفصيل المخصص',
  currencySymbol: 'د.أ',
  currencyCode: 'JOD',
  deliveryPricingNote: 'تُحدّد بالتواصل مع المحل',
  demoNotice: 'متجر سيتارة للستائر الجاهزة الفاخرة والتفصيل حسب الطلب في الأردن.',
  whatsappNumber: BUSINESS_WHATSAPP_NUMBER,
};

// ----------------------------------------------------------------------------
// 2. Custom Curtain Quote Configurations (Curtain types, fabrics, colors)
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
