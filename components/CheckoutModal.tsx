'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useCart } from '@/lib/cart-context';
import { SHOP_CONFIG, BUSINESS_WHATSAPP_NUMBER, getWhatsAppUrl } from '@/lib/shop-data';
import {
  X,
  Copy,
  Check,
  MessageCircle,
  Truck,
  AlertCircle,
  Trash2,
  ExternalLink,
  Info,
  MapPin,
  User,
  Phone,
} from 'lucide-react';

export default function CheckoutModal() {
  const {
    items,
    subtotal,
    isCheckoutOpen,
    setIsCheckoutOpen,
    clearCart,
    removeItem,
  } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [hasClickedWhatsApp, setHasClickedWhatsApp] = useState(false);

  useEffect(() => {
    if (isCheckoutOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCheckoutOpen]);

  // Dry cleaning service detection
  const dryCleaningItem = items.find(
    (item) => item.isDryCleaning || item.productId === 'service-dry-cleaning'
  );
  const hasDryCleaning = Boolean(dryCleaningItem);

  // Check if business WhatsApp number is configured
  const isWhatsAppConfigured = Boolean(BUSINESS_WHATSAPP_NUMBER && BUSINESS_WHATSAPP_NUMBER.length >= 7);

  // Validate phone format (local Jordanian 077/078/079, international +962/00962, or general international)
  const validatePhone = (phoneStr: string): boolean => {
    const cleaned = phoneStr.trim().replace(/[\s\-\(\)]/g, '');
    if (!cleaned) return false;
    
    // Local Jordanian format: 077, 078, 079 + 7 digits (10 digits total)
    if (/^07[789]\d{7}$/.test(cleaned)) return true;
    
    // International Jordanian format: +96277..., 0096277..., 96277...
    if (/^(\+?962|00962)7[789]\d{7}$/.test(cleaned)) return true;
    
    // General valid international phone format: + or 00 followed by 8 to 14 digits
    if (/^(\+|\d{2})\d{8,14}$/.test(cleaned)) return true;
    
    // Standard 9-14 digit number
    if (/^\d{9,14}$/.test(cleaned)) return true;

    return false;
  };

  // Generate compact WhatsApp order message
  const generatedMessage = useMemo(() => {
    const readyMadeItems = items.filter((i) => !i.isCustom);
    const customItems = items.filter((i) => i.isCustom);

    const lines: string[] = [];
    lines.push(`طلب جديد — سيتارة`);
    lines.push(`${formData.fullName.trim()} | ${formData.phone.trim()}`);
    lines.push(`العنوان: ${formData.address.trim()}`);

    const productLines: string[] = [];
    const pricedReadyMadeItems = readyMadeItems.filter((i) => !i.isUnpriced);

    readyMadeItems.forEach((item) => {
      const lineTotal = item.unitPrice * item.quantity;
      const opts = [item.curtainStyle, item.fabricChoice, item.liningOption].filter(Boolean).join('، ');
      const nameWithOpts = opts ? `${item.productName} (${opts})` : item.productName;

      if (item.isDryCleaning || item.productId === 'service-dry-cleaning') {
        productLines.push(
          `• غسيل وكي البرادي — فك وغسيل وكوي وإعادة تركيب (داخل عمان) — عدد ${item.quantity} برداية — ${lineTotal} د.أ`
        );
      } else if (item.productId === 'service-installation' || item.curtainType === 'service' || item.isService) {
        const loc = item.serviceLocation || 'داخل عمان';
        productLines.push(
          `• تركيب — ${loc} — عدد ${item.quantity} ستائر — ${lineTotal} د.أ`
        );
      } else if (item.productId === 'curtain-track-aluminum' || item.curtainType === 'track') {
        productLines.push(
          `• ${item.productName} — طول ${item.size.widthCm} سم — عدد ${item.quantity} — ${lineTotal} د.أ`
        );
      } else if (item.productId === 'curtain-electric' || item.productId === 'curtain-manual') {
        const liningStr = item.liningOption
          ? item.liningOption.includes('عزل') || item.liningOption.includes('بطانة')
            ? item.liningOption
            : `عزل ${item.liningOption}`
          : '';
        const optsStr = [item.fabricChoice, item.curtainStyle, liningStr].filter(Boolean).join('، ');
        productLines.push(
          `• ${item.productName} (${optsStr}) — ${item.color.name} — ${item.size.widthCm}×${item.size.heightCm} سم — عدد ${item.quantity} — ${lineTotal} د.أ`
        );
      } else if (item.productId === 'roller-screen' || item.productId === 'roller-blackout' || item.productId === 'roller-zebra') {
        productLines.push(
          `• ${item.productName} — ${item.fabricChoice} — ${item.size.widthCm}×${item.size.heightCm} سم — عدد ${item.quantity} — ${lineTotal} د.أ`
        );
      } else if (item.isUnpriced) {
        productLines.push(
          `• ${nameWithOpts} — ${item.color.name} — ${item.size.label} — عدد ${item.quantity} — السعر عند الاستفسار`
        );
      } else {
        productLines.push(
          `• ${nameWithOpts} — ${item.color.name} — ${item.size.label} — عدد ${item.quantity} — ${lineTotal} د.أ`
        );
      }
    });

    customItems.forEach((item) => {
      const d = item.customDetails;
      const fabric = d?.fabric || item.productName.replace('ستارة تفصيل: ', '');
      const color = (d?.color || item.color.name) + (d?.customColorNote ? ` (${d.customColorNote})` : '');
      const dimensions = `${d?.widthCm || item.size.widthCm}×${d?.heightCm || item.size.heightCm} سم`;
      productLines.push(
        `• تفصيل: ${fabric} — ${color} — ${dimensions} — عدد ${item.quantity} — السعر بعد مراجعة الطلب`
      );
    });

    if (productLines.length > 0) {
      lines.push(``);
      lines.push(...productLines);
    }

    // Subtotal & Delivery
    lines.push(``);
    if (pricedReadyMadeItems.length > 0) {
      lines.push(`مجموع المنتجات: ${subtotal} د.أ`);
    }
    lines.push(`التوصيل: يُحدد بالتواصل.`);

    return lines.join('\n');
  }, [items, subtotal, formData]);

  if (!isCheckoutOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'يرجى إدخال الاسم الكريم.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'يرجى إدخال رقم الهاتف للتواصل عبر واتساب.';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'يرجى إدخال رقم هاتف محلي أو دولي صحيح (مثال: 0791234567 أو +962791234567).';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'يرجى إدخال عنوان السكن بالتفصيل.';
    } else if (hasDryCleaning) {
      const isAmman =
        formData.address.trim().includes('عمان') ||
        formData.address.trim().includes('عمّان');
      if (!isAmman) {
        newErrors.address = 'خدمة "غسيل وكي البرادي" متوفرة داخل محافظة عمّان فقط. يرجى التوضيح أن العنوان داخل عمّان أو إزالة الخدمة لمتابعة الطلب.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendViaWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!isWhatsAppConfigured) return;

    setHasClickedWhatsApp(true);
    const targetUrl = getWhatsAppUrl(generatedMessage);
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = () => {
    if (!validate()) return;
    navigator.clipboard?.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClose = () => {
    setHasClickedWhatsApp(false);
    setIsCheckoutOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-[#211B17] text-[#F5EFE6] border border-[#C8AA78]/40 rounded-xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 text-right">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#F5EFE6]">
                إكمال بيانات الطلب
              </h3>
              <p className="text-xs text-[#D8C6AE]">
                {SHOP_CONFIG.brandName} · يرجى إدخال معلومات التواصل لإرسال الطلب مباشرة عبر واتساب
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

        {/* WhatsApp Config Warning */}
        {!isWhatsAppConfigured && (
          <div className="bg-amber-950/70 border-b border-amber-500/40 px-4 sm:px-5 py-3 flex items-start gap-2.5 text-xs text-amber-200 text-right shrink-0">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="text-amber-300 block">
                تنبيه للمتجر: رقم واتساب غير مهيأ (BUSINESS_WHATSAPP_NUMBER)
              </strong>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                يرجى إضافة رقم واتساب المتجر المعتمد في المتغير البيئي NEXT_PUBLIC_WHATSAPP_NUMBER.
              </p>
            </div>
          </div>
        )}

        {/* Notice after clicking WhatsApp */}
        {hasClickedWhatsApp && (
          <div className="bg-emerald-950/60 border-b border-emerald-500/40 px-4 sm:px-5 py-3 flex items-start gap-2.5 text-xs text-emerald-200 text-right shrink-0">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="text-emerald-300 block">
                تم توجيهك إلى واتساب برسالة طلبك
              </strong>
              <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                تأكد من الضغط على زر &quot;إرسال&quot; داخل تطبيق واتساب. تم الاحتفاظ بمحتويات السلة لراحتك.
              </p>
            </div>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-6 text-right space-y-5 overflow-y-auto flex-1">
          {/* 1. Itemized Order Summary */}
          <div className="bg-[#171513] p-4 rounded-xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs text-[#D8C6AE] border-b border-white/5 pb-2">
              <span className="font-bold text-[#F5EFE6]">
                ملخص الستائر في السلة ({items.length} أصناف):
              </span>
              <span>المجموع الفرعي: {subtotal} {SHOP_CONFIG.currencySymbol}</span>
            </div>

            <div className="divide-y divide-white/5 max-h-36 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="py-2 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/40"
                      style={{ backgroundColor: item.color.hex }}
                    />
                    <div>
                      <span className="text-[#F5EFE6] font-medium block">
                        {item.productName}
                      </span>
                      <span className="text-[11px] text-[#D8C6AE]/70 block">
                        {item.color.name} · {item.size.label} · {item.quantity} قطعة
                      </span>
                    </div>
                  </div>

                  <div className="text-left rtl:text-left shrink-0 font-bold text-[#C8AA78]">
                    {item.isCustom ? (
                      <span className="text-[11px] font-medium">السعر بعد المراجعة</span>
                    ) : (
                      <span>{item.unitPrice * item.quantity} {SHOP_CONFIG.currencySymbol}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Subtotal & Delivery note */}
            <div className="pt-2 border-t border-white/10 space-y-1 text-xs">
              <div className="flex items-center justify-between text-[#D8C6AE]">
                <span>المجموع الفرعي للستائر:</span>
                <span className="text-[#F5EFE6] font-bold tabular-nums">
                  {subtotal} {SHOP_CONFIG.currencySymbol}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#D8C6AE]">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#C8AA78]" />
                  <span>رسوم التوصيل:</span>
                </span>
                <span className="text-[#C8AA78] font-medium">
                  {SHOP_CONFIG.deliveryPricingNote}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Customer Contact Form (Exactly 3 Required Fields) */}
          <div className="space-y-4 bg-[#1B1613] p-4 sm:p-5 rounded-xl border border-[#C8AA78]/20">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C8AA78] flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#C8AA78]" />
              <span>معلومات العميل والتوصيل</span>
            </h4>

            {/* Field 1: الاسم */}
            <div>
              <label className="text-xs font-semibold text-[#F5EFE6] block mb-1.5">
                الاسم <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value });
                    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                  }}
                  placeholder="الاسم الكامل"
                  className={`w-full px-3.5 py-2.5 rounded-lg bg-[#171513] border text-[#F5EFE6] text-xs placeholder:text-[#D8C6AE]/40 focus:outline-none transition-colors ${
                    errors.fullName
                      ? 'border-red-500 focus:border-red-400 ring-1 ring-red-500/30'
                      : 'border-white/15 focus:border-[#C8AA78]'
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className="text-red-400 text-xs mt-1 font-medium">{errors.fullName}</p>
              )}
            </div>

            {/* Field 2: رقم الهاتف */}
            <div>
              <label className="text-xs font-semibold text-[#F5EFE6] block mb-1.5">
                رقم الهاتف <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  dir="ltr"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                  }}
                  placeholder="مثال: 0791234567 أو +962791234567"
                  className={`w-full px-3.5 py-2.5 rounded-lg bg-[#171513] border text-[#F5EFE6] text-xs text-right placeholder:text-[#D8C6AE]/40 focus:outline-none transition-colors ${
                    errors.phone
                      ? 'border-red-500 focus:border-red-400 ring-1 ring-red-500/30'
                      : 'border-white/15 focus:border-[#C8AA78]'
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-red-400 text-xs mt-1 font-medium">{errors.phone}</p>
              )}
            </div>

            {/* Field 3: عنوان السكن */}
            <div>
              <label className="text-xs font-semibold text-[#F5EFE6] block mb-1.5">
                عنوان السكن <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={3}
                value={formData.address}
                onChange={(e) => {
                  setFormData({ ...formData, address: e.target.value });
                  if (errors.address) setErrors((prev) => ({ ...prev, address: '' }));
                }}
                placeholder="المدينة، المنطقة، الشارع، رقم البناية وأي تفاصيل تساعدنا بالوصول"
                className={`w-full px-3.5 py-2.5 rounded-lg bg-[#171513] border text-[#F5EFE6] text-xs placeholder:text-[#D8C6AE]/40 focus:outline-none transition-colors resize-none ${
                  errors.address
                    ? 'border-red-500 focus:border-red-400 ring-1 ring-red-500/30'
                    : 'border-white/15 focus:border-[#C8AA78]'
                }`}
              />
              {errors.address && (
                <p className="text-red-400 text-xs mt-1 font-medium">{errors.address}</p>
              )}
            </div>

            {/* Dry cleaning availability warning banner */}
            {hasDryCleaning && (
              <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-lg text-xs text-amber-200 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    ملاحظة: خدمة &quot;غسيل وكي البرادي&quot; متوفرة داخل حدود محافظة عمّان فقط.
                  </p>
                </div>
                {dryCleaningItem && (
                  <button
                    type="button"
                    onClick={() => {
                      removeItem(dryCleaningItem.id);
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.address;
                        return next;
                      });
                    }}
                    className="text-[11px] text-red-300 hover:text-red-200 underline flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>إزالة خدمة غسيل وكي البرادي من السلة</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 3. Primary Action & Explanation */}
          <div className="pt-2 space-y-3">
            <button
              type="button"
              onClick={handleSendViaWhatsApp}
              disabled={!isWhatsAppConfigured}
              className="w-full py-3.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.99] cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 shrink-0" />
              <span>تأكيد الطلب عبر واتساب</span>
              <ExternalLink className="w-4 h-4 shrink-0" />
            </button>

            {/* Explanation beside/below button */}
            <p className="text-xs text-[#D8C6AE] text-center flex items-center justify-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#C8AA78] shrink-0" />
              <span>سيفتح واتساب برسالة جاهزة؛ اضغط إرسال لإكمال طلبك.</span>
            </p>

            {/* Fallback Copy & Clear Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopy}
                className="w-full sm:flex-1 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#D8C6AE] hover:text-[#F5EFE6] border border-white/10 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">تم نسخ تفاصيل الطلب بنجاح!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#C8AA78]" />
                    <span>نسخ تفاصيل الطلب (خيار بديل)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  clearCart();
                  handleClose();
                }}
                className="w-full sm:w-auto py-2 px-3 rounded-lg bg-red-950/30 hover:bg-red-900/40 text-xs text-red-300 border border-red-500/20 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>تفريغ السلة</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
