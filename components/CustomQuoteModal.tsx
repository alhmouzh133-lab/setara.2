'use client';

import React, { useState, useMemo } from 'react';
import { useCart } from '@/lib/cart-context';
import {
  CUSTOM_CURTAIN_TYPES,
  CUSTOM_FABRIC_OPTIONS,
  CUSTOM_COLOR_PRESETS,
  CustomCurtainItem,
  SHOP_CONFIG,
  BUSINESS_WHATSAPP_NUMBER,
  getWhatsAppUrl,
} from '@/lib/shop-data';
import {
  X,
  Scissors,
  Ruler,
  Info,
  Copy,
  Check,
  Plus,
  Trash2,
  Layers,
  MessageCircle,
  ExternalLink,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';

interface ItemErrorMap {
  [itemId: string]: {
    width?: string;
    height?: string;
    quantity?: string;
  };
}

const createNewCurtainItem = (): CustomCurtainItem => ({
  id: `curtain_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  curtainType: CUSTOM_CURTAIN_TYPES[0],
  fabric: CUSTOM_FABRIC_OPTIONS[0].name,
  color: CUSTOM_COLOR_PRESETS[0],
  customColorNote: '',
  widthCm: '',
  heightCm: '',
  quantity: 1,
  roomLocation: '',
  itemNotes: '',
});

export default function CustomQuoteModal() {
  const {
    isCustomQuoteOpen,
    setIsCustomQuoteOpen,
    addCustomItem,
    setIsCartOpen,
  } = useCart();

  // List of independent curtain items
  const [items, setItems] = useState<CustomCurtainItem[]>([createNewCurtainItem()]);
  const [itemErrors, setItemErrors] = useState<ItemErrorMap>({});

  // Overall customer details (entered once)
  const [customer, setCustomer] = useState({
    fullName: '',
    phone: '',
    city: 'عمّان',
    generalNotes: '',
  });
  const [customerErrors, setCustomerErrors] = useState<Record<string, string>>({});

  const [copied, setCopied] = useState(false);
  const [hasOpenedWhatsApp, setHasOpenedWhatsApp] = useState(false);
  const [addedToCartFeedback, setAddedToCartFeedback] = useState(false);

  const isWhatsAppConfigured = Boolean(BUSINESS_WHATSAPP_NUMBER && BUSINESS_WHATSAPP_NUMBER.length >= 7);

  // Add a new independent curtain
  const handleAddItem = () => {
    setItems((prev) => [...prev, createNewCurtainItem()]);
  };

  // Remove an independent curtain (minimum 1 item)
  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
    setItemErrors((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  // Update specific field on specific item without touching others
  const handleUpdateItem = <K extends keyof CustomCurtainItem>(
    id: string,
    field: K,
    value: CustomCurtainItem[K]
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );

    // Clear error for that field
    if (itemErrors[id]?.[field as keyof ItemErrorMap[string]]) {
      setItemErrors((prev) => {
        const itemErr = { ...prev[id] };
        delete itemErr[field as keyof ItemErrorMap[string]];
        return { ...prev, [id]: itemErr };
      });
    }
  };

  const validate = () => {
    const newItemErrors: ItemErrorMap = {};
    let hasItemErrors = false;

    // Validate each item individually
    items.forEach((item) => {
      const currentErrors: ItemErrorMap[string] = {};
      const numWidth = parseFloat(item.widthCm);
      const numHeight = parseFloat(item.heightCm);

      if (!item.widthCm || isNaN(numWidth) || numWidth <= 0) {
        currentErrors.width = 'يرجى إدخال عرض صحيح وموجب بالسنتيمتر (مثال: 220).';
        hasItemErrors = true;
      } else if (numWidth < 20 || numWidth > 2000) {
        currentErrors.width = 'يرجى إدخال عرض بين 20 سم و 2000 سم.';
        hasItemErrors = true;
      }

      if (!item.heightCm || isNaN(numHeight) || numHeight <= 0) {
        currentErrors.height = 'يرجى إدخال ارتفاع صحيح وموجب بالسنتيمتر (مثال: 260).';
        hasItemErrors = true;
      } else if (numHeight < 20 || numHeight > 1500) {
        currentErrors.height = 'يرجى إدخال ارتفاع بين 20 سم و 1500 سم.';
        hasItemErrors = true;
      }

      if (!item.quantity || item.quantity < 1 || !Number.isInteger(Number(item.quantity))) {
        currentErrors.quantity = 'يرجى تحديد عدد صحيح موجب للقطع (على الأقل 1).';
        hasItemErrors = true;
      }

      if (Object.keys(currentErrors).length > 0) {
        newItemErrors[item.id] = currentErrors;
      }
    });

    setItemErrors(newItemErrors);

    // Validate customer details
    const newCustomerErrors: Record<string, string> = {};
    if (!customer.fullName.trim()) {
      newCustomerErrors.fullName = 'يرجى إدخال اسمك الكريم للتواصل.';
    }
    if (!customer.phone.trim()) {
      newCustomerErrors.phone = 'يرجى إدخال رقم الهاتف لاستلام عرض السعر.';
    } else if (customer.phone.trim().length < 8) {
      newCustomerErrors.phone = 'يرجى إدخال رقم هاتف صحيح (مثال: 0791234567).';
    }

    setCustomerErrors(newCustomerErrors);

    return !hasItemErrors && Object.keys(newCustomerErrors).length === 0;
  };

  // Formatted Arabic WhatsApp message for Custom Quote
  const generatedMessage = useMemo(() => {
    const lines: string[] = [];
    lines.push(`مرحباً متجر ${SHOP_CONFIG.brandName} (${SHOP_CONFIG.brandTagline})،`);
    lines.push(`أود طلب عرض سعر لتفصيل ستائر بالمقاسات والمواصفات التالية:`);
    lines.push(``);
    lines.push(`📋 *بيانات العميل:*`);
    lines.push(`• الاسم: ${customer.fullName.trim() || '[الاسم الكريم]'}`);
    lines.push(`• رقم الهاتف: ${customer.phone.trim() || '[رقم الهاتف]'}`);
    if (customer.city) {
      lines.push(`• المدينة / المحافظة: ${customer.city}`);
    }
    if (customer.generalNotes.trim()) {
      lines.push(`• ملاحظات عامة: ${customer.generalNotes.trim()}`);
    }

    lines.push(``);
    lines.push(`✂️ *تفاصيل الستائر المطلوبة (${items.length} قطع/ستائر):*`);

    items.forEach((item, idx) => {
      lines.push(
        `${idx + 1}. *الستارة ${idx + 1}*` + (item.roomLocation ? ` (${item.roomLocation})` : '') + `\n` +
        `   - الموديل: ${item.curtainType}\n` +
        `   - نوع القماش: ${item.fabric}\n` +
        `   - اللون: ${item.color}` + (item.customColorNote ? ` (${item.customColorNote})` : '') + `\n` +
        `   - الأبعاد: ${item.widthCm || '...'} سم عرض × ${item.heightCm || '...'} سم ارتفاع\n` +
        `   - الكمية: ${item.quantity} قطعة\n` +
        (item.itemNotes ? `   - ملاحظات خاصة: ${item.itemNotes}\n` : '') +
        `   - التسعير: حسب عرض السعر من المحل`
      );
    });

    lines.push(``);
    lines.push(`📌 *ملاحظة:* أدرك أن السعر النهائي يُحدده المحل بعد تدقيق المقاسات وتوفر القماش.`);
    lines.push(`أرجو تزويدي بعرض السعر في أقرب وقت. شكراً لكم!`);

    return lines.join('\n');
  }, [items, customer]);

  if (!isCustomQuoteOpen) return null;

  const handleSendViaWhatsApp = (e: React.MouseEvent) => {
    if (!validate()) {
      e.preventDefault();
      return;
    }

    if (!isWhatsAppConfigured) {
      e.preventDefault();
      return;
    }

    setHasOpenedWhatsApp(true);
    const targetUrl = getWhatsAppUrl(generatedMessage);
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = () => {
    if (!validate()) return;
    navigator.clipboard?.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAddToCart = () => {
    if (!validate()) return;
    items.forEach((it) => {
      addCustomItem(it);
    });
    setAddedToCartFeedback(true);
    setTimeout(() => {
      setIsCustomQuoteOpen(false);
      setIsCartOpen(true);
    }, 1000);
  };

  const handleClose = () => {
    setHasOpenedWhatsApp(false);
    setAddedToCartFeedback(false);
    setIsCustomQuoteOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-[#211B17] text-[#F5EFE6] border border-[#C8AA78]/40 rounded-xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-right">
            <div className="w-8 h-8 rounded-lg bg-[#C8AA78]/15 border border-[#C8AA78]/30 flex items-center justify-center text-[#C8AA78]">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#F5EFE6]">
                طلب تفصيل ستائر حسب الطلب
              </h3>
              <p className="text-[11px] sm:text-xs text-[#D8C6AE]">
                أدخل مقاسات ستارة واحدة أو عدة ستائر في طلب عرض سعر موحد عبر واتساب
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            aria-label="إغلاق"
            className="p-1.5 rounded-lg text-[#D8C6AE] hover:text-[#F5EFE6] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guidance Banner */}
        <div className="bg-[#2A231E] border-b border-[#C8AA78]/25 px-4 sm:px-5 py-3 flex items-start gap-2.5 text-xs text-[#F5EFE6] text-right">
          <Info className="w-4 h-4 text-[#C8AA78] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#C8AA78]">سيفتح واتساب برسالة جاهزة؛ اضغط إرسال لإكمال طلبك.</strong>{' '}
            يؤكّد المحل السعر النهائي بعد مراجعة المقاسات ونوع القماش المختار.
          </p>
        </div>

        {/* WhatsApp Config Warning */}
        {!isWhatsAppConfigured && (
          <div className="bg-amber-950/70 border-b border-amber-500/40 px-4 sm:px-5 py-3 flex items-start gap-2.5 text-xs text-amber-200 text-right">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="text-amber-300 block">
                تنبيه: رقم واتساب غير مهيأ (BUSINESS_WHATSAPP_NUMBER)
              </strong>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                يرجى إضافة رقم واتساب المتجر في المتغير البيئي NEXT_PUBLIC_WHATSAPP_NUMBER.
                يمكن استخدام خيار &quot;نسخ تفاصيل طلب التفصيل&quot; لإرسالها يدوياً.
              </p>
            </div>
          </div>
        )}

        {/* WhatsApp Opened Notification */}
        {hasOpenedWhatsApp && (
          <div className="bg-emerald-950/60 border-b border-emerald-500/40 px-4 sm:px-5 py-3 flex items-start gap-2.5 text-xs text-emerald-200 text-right">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="text-emerald-300 block">
                تم توجيهك إلى واتساب برسالة تفاصيل الستائر
              </strong>
              <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                اضغط إرسال داخل المحادثة ليقوم فريق سيتارة بدراسة الأبعاد وتزويدك بعرض السعر.
              </p>
            </div>
          </div>
        )}

        {/* Added to Cart Feedback */}
        {addedToCartFeedback && (
          <div className="bg-emerald-950/60 border-b border-emerald-500/40 px-4 sm:px-5 py-3 flex items-center gap-2.5 text-xs text-emerald-200 text-right">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>تمت إضافة الستائر المفصلة إلى سلة التسوق! جارٍ فتح السلة...</span>
          </div>
        )}

        {/* Form Body */}
        <div className="p-4 sm:p-6 text-right space-y-5 max-h-[75vh] overflow-y-auto">
          {/* List of Curtain Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C8AA78]">
                قائمة الستائر المطلوبة ({items.length})
              </span>
              <span className="text-[11px] text-[#D8C6AE]/70">
                جميع المقاسات بالسنتيمتر (cm)
              </span>
            </div>

            {items.map((item, index) => {
              const err = itemErrors[item.id] || {};
              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 rounded-xl bg-[#1B1613] border border-white/10 hover:border-[#C8AA78]/30 transition-colors space-y-4 text-right"
                >
                  {/* Card Header with Title and Remove Button */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-[#C8AA78]/20 text-[#C8AA78] flex items-center justify-center font-bold text-xs">
                        {index + 1}
                      </span>
                      <h4 className="text-sm font-bold text-[#F5EFE6]">
                        الستارة {index + 1}
                      </h4>
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف هذه الستارة</span>
                      </button>
                    )}
                  </div>

                  {/* Room Name & Design Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-[#D8C6AE] block mb-1">
                        اسم الغرفة / مكان التركيب (اختياري)
                      </label>
                      <input
                        type="text"
                        value={item.roomLocation}
                        onChange={(e) => handleUpdateItem(item.id, 'roomLocation', e.target.value)}
                        placeholder="مثال: صالون الضيوف، غرفة النوم"
                        className="w-full px-3 py-2 rounded-lg bg-[#171513] border border-white/15 focus:border-[#C8AA78] text-[#F5EFE6] text-xs placeholder:text-[#D8C6AE]/40 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#F5EFE6] block mb-1">
                        نوع الستارة / الموديل <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={item.curtainType}
                        onChange={(e) => handleUpdateItem(item.id, 'curtainType', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#171513] border border-white/15 focus:border-[#C8AA78] text-[#F5EFE6] text-xs focus:outline-none transition-colors cursor-pointer"
                      >
                        {CUSTOM_CURTAIN_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Fabric & Color */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[#F5EFE6] block mb-1">
                        نوع القماش <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={item.fabric}
                        onChange={(e) => handleUpdateItem(item.id, 'fabric', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#171513] border border-white/15 focus:border-[#C8AA78] text-[#F5EFE6] text-xs focus:outline-none transition-colors cursor-pointer"
                      >
                        {CUSTOM_FABRIC_OPTIONS.map((f) => (
                          <option key={f.id} value={f.name}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#F5EFE6] block mb-1">
                        الدرجة اللونية <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={item.color}
                        onChange={(e) => handleUpdateItem(item.id, 'color', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#171513] border border-white/15 focus:border-[#C8AA78] text-[#F5EFE6] text-xs focus:outline-none transition-colors cursor-pointer"
                      >
                        {CUSTOM_COLOR_PRESETS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Dimensions & Quantity */}
                  <div className="p-3 bg-[#171513] rounded-lg border border-white/5 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F5EFE6]">
                      <Ruler className="w-3.5 h-3.5 text-[#C8AA78]" />
                      <span>أبعاد هذه الستارة (بالسنتيمتر):</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-[#D8C6AE] block mb-1">
                          العرض (سم) <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.widthCm}
                          onChange={(e) => handleUpdateItem(item.id, 'widthCm', e.target.value)}
                          placeholder="مثال: 220"
                          className="w-full px-3 py-1.5 rounded-lg bg-[#211B17] border border-white/15 focus:border-[#C8AA78] text-[#F5EFE6] text-xs text-center font-bold tabular-nums focus:outline-none"
                        />
                        {err.width && (
                          <p className="text-red-400 text-[10px] mt-1">{err.width}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-[#D8C6AE] block mb-1">
                          الارتفاع (سم) <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.heightCm}
                          onChange={(e) => handleUpdateItem(item.id, 'heightCm', e.target.value)}
                          placeholder="مثال: 270"
                          className="w-full px-3 py-1.5 rounded-lg bg-[#211B17] border border-white/15 focus:border-[#C8AA78] text-[#F5EFE6] text-xs text-center font-bold tabular-nums focus:outline-none"
                        />
                        {err.height && (
                          <p className="text-red-400 text-[10px] mt-1">{err.height}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-[#D8C6AE] block mb-1">
                          الكمية (قطع) <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#211B17] border border-white/15 focus:border-[#C8AA78] text-[#F5EFE6] text-xs text-center font-bold tabular-nums focus:outline-none"
                        />
                        {err.quantity && (
                          <p className="text-red-400 text-[10px] mt-1">{err.quantity}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Item Notes */}
                  <div>
                    <input
                      type="text"
                      value={item.itemNotes}
                      onChange={(e) => handleUpdateItem(item.id, 'itemNotes', e.target.value)}
                      placeholder="ملاحظات خاصة لهذه الستارة (مثال: سكة تعليق يدوية، تثبيت بالسقف)"
                      className="w-full px-3 py-1.5 rounded-lg bg-[#171513] border border-white/10 text-[#F5EFE6] text-[11px] placeholder:text-[#D8C6AE]/40 focus:outline-none focus:border-[#C8AA78]"
                    />
                  </div>
                </div>
              );
            })}

            {/* Add Another Curtain Button */}
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full py-3 rounded-lg border-2 border-dashed border-[#C8AA78]/40 hover:border-[#C8AA78] bg-[#C8AA78]/5 hover:bg-[#C8AA78]/10 text-[#C8AA78] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ إضافة ستارة أخرى لهذا الطلب</span>
            </button>
          </div>

          {/* Customer Details Form */}
          <div className="pt-3 border-t border-white/10 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C8AA78]">
              معلومات التواصل مع المحل
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[#D8C6AE] block mb-1">
                  الاسم الكامل <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={customer.fullName}
                  onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                  placeholder="الاسم الأول والعائلة"
                  className="w-full px-3 py-2 rounded-lg bg-[#171513] border border-white/15 focus:border-[#C8AA78] text-[#F5EFE6] text-xs placeholder:text-[#D8C6AE]/40 focus:outline-none transition-colors"
                />
                {customerErrors.fullName && (
                  <p className="text-red-400 text-[10px] mt-1">{customerErrors.fullName}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-[#D8C6AE] block mb-1">
                  رقم الهاتف / واتساب <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  placeholder="079 000 0000"
                  className="w-full px-3 py-2 rounded-lg bg-[#171513] border border-white/15 focus:border-[#C8AA78] text-[#F5EFE6] text-xs text-right placeholder:text-[#D8C6AE]/40 focus:outline-none transition-colors"
                />
                {customerErrors.phone && (
                  <p className="text-red-400 text-[10px] mt-1">{customerErrors.phone}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[#D8C6AE] block mb-1">
                المدينة / المحافظة في الأردن
              </label>
              <input
                type="text"
                value={customer.city}
                onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                placeholder="مثال: عمّان - دابوق"
                className="w-full px-3 py-2 rounded-lg bg-[#171513] border border-white/15 focus:border-[#C8AA78] text-[#F5EFE6] text-xs placeholder:text-[#D8C6AE]/40 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#D8C6AE] block mb-1">
                ملاحظات عامة (اختياري)
              </label>
              <textarea
                rows={2}
                value={customer.generalNotes}
                onChange={(e) => setCustomer({ ...customer, generalNotes: e.target.value })}
                placeholder="أي متطلبات عامة تخص المعاينة المنزلية أو خيارات التركيب"
                className="w-full px-3 py-1.5 rounded-lg bg-[#171513] border border-white/15 focus:border-[#C8AA78] text-[#F5EFE6] text-xs placeholder:text-[#D8C6AE]/40 focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="pt-3 border-t border-white/10 space-y-2.5">
            {/* Primary: Send via WhatsApp */}
            <button
              type="button"
              onClick={handleSendViaWhatsApp}
              disabled={!isWhatsAppConfigured}
              className="w-full py-3.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.99] cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 shrink-0" />
              <span>إرسال طلب التفصيل عبر واتساب ({items.length} ستائر)</span>
              <ExternalLink className="w-4 h-4 shrink-0" />
            </button>

            {/* Options Row: Copy fallback & Add to Cart */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={handleCopy}
                className="w-full sm:flex-1 py-2.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#D8C6AE] hover:text-[#F5EFE6] border border-white/10 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">تم نسخ تفاصيل طلب التفصيل!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#C8AA78]" />
                    <span>نسخ تفاصيل طلب التفصيل</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full sm:flex-1 py-2.5 px-3 rounded-lg bg-[#C8AA78]/15 hover:bg-[#C8AA78]/25 text-xs text-[#C8AA78] border border-[#C8AA78]/30 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>إضافة القطع إلى السلة للمتابعة لاحقاً</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
