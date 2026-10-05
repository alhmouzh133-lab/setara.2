'use client';

import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';

export default function CheckoutModal() {
  const {
    items,
    subtotal,
    isCheckoutOpen,
    setIsCheckoutOpen,
    clearCart,
  } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: 'عمّان',
    address: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [hasClickedWhatsApp, setHasClickedWhatsApp] = useState(false);

  // Check if business WhatsApp number is configured
  const isWhatsAppConfigured = Boolean(BUSINESS_WHATSAPP_NUMBER && BUSINESS_WHATSAPP_NUMBER.length >= 7);

  // Generate formatted message (compact format)
  const generatedMessage = useMemo(() => {
    const readyMadeItems = items.filter((i) => !i.isCustom);
    const customItems = items.filter((i) => i.isCustom);

    const lines: string[] = [];
    lines.push(`طلب جديد — سيتارة 🪟`);
    lines.push(``);

    // Customer line: [اسم العميل] | [رقم الهاتف]
    const customerLine = [formData.fullName.trim(), formData.phone.trim()]
      .filter(Boolean)
      .join(' | ');
    if (customerLine) {
      lines.push(customerLine);
    }

    // Address line: العنوان: [العنوان] (omit if empty)
    const addressParts = [formData.city.trim(), formData.address.trim()].filter(Boolean);
    if (addressParts.length > 0) {
      lines.push(`العنوان: ${addressParts.join(' - ')}`);
    }

    // Optional notes (omit if empty)
    if (formData.notes.trim()) {
      lines.push(`ملاحظات: ${formData.notes.trim()}`);
    }

    // Product lines: • [المنتج] — [اللون] — [المقاس] — عدد [الكمية] — [مجموع الصنف] د.أ
    const productLines: string[] = [];

    const pricedReadyMadeItems = readyMadeItems.filter((i) => !i.isUnpriced);

    readyMadeItems.forEach((item) => {
      const lineTotal = item.unitPrice * item.quantity;
      const opts = [item.curtainStyle, item.fabricChoice, item.liningOption].filter(Boolean).join('، ');
      const nameWithOpts = opts ? `${item.productName} (${opts})` : item.productName;

      if (item.productId === 'roller-screen') {
        productLines.push(
          `• رول سكرين — ${item.color.name} — ${item.size.widthCm}×${item.size.heightCm} سم — عدد ${item.quantity} — ${lineTotal} د.أ`
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

    // Subtotal (only if priced ready-made items exist) & Delivery
    lines.push(``);
    if (pricedReadyMadeItems.length > 0) {
      lines.push(`مجموع المنتجات: ${subtotal} د.أ`);
    }
    lines.push(`التوصيل: يُحدد بالتواصل.`);

    return lines.join('\n');
  }, [items, subtotal, formData]);

  if (!isCheckoutOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'يرجى إدخال الاسم الكريم.';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'يرجى إدخال رقم الهاتف للتواصل عبر واتساب.';
    } else if (formData.phone.trim().length < 8) {
      newErrors.phone = 'يرجى إدخال رقم هاتف صحيح (مثال: 0791234567).';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendViaWhatsApp = (e: React.MouseEvent) => {
    if (!validate()) {
      e.preventDefault();
      return;
    }

    if (!isWhatsAppConfigured) {
      e.preventDefault();
      return;
    }

    // Set indication that WhatsApp was opened directly on user click
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
        className="relative w-full max-w-2xl bg-[#211B17] text-[#F5EFE6] border border-[#C8AA78]/40 rounded-xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-right">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#F5EFE6]">
                إرسال الطلب عبر واتساب
              </h3>
              <p className="text-xs text-[#D8C6AE]">
                {SHOP_CONFIG.brandName} · التواصل والمتابعة المباشرة مع المحل
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

        {/* Informational Guidance Banner */}
        <div className="bg-[#2A231E] border-b border-[#C8AA78]/25 px-4 sm:px-5 py-3 flex items-start gap-2.5 text-xs text-[#F5EFE6] text-right">
          <Info className="w-4 h-4 text-[#C8AA78] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#C8AA78]">سيفتح واتساب برسالة جاهزة؛ اضغط إرسال لإكمال طلبك.</strong>{' '}
            تتم مراجعة الطلب وحساب كلفة التوصيل مباشرة بالتنسيق معك.
          </p>
        </div>

        {/* WhatsApp Number Unconfigured Alert */}
        {!isWhatsAppConfigured && (
          <div className="bg-amber-950/70 border-b border-amber-500/40 px-4 sm:px-5 py-3 flex items-start gap-2.5 text-xs text-amber-200 text-right">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="text-amber-300 block">
                تنبيه للمتجر: رقم واتساب غير مهيأ (BUSINESS_WHATSAPP_NUMBER)
              </strong>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                يرجى إضافة رقم واتساب المتجر المعتمد في ملف الإعدادات أو المتغير البيئي NEXT_PUBLIC_WHATSAPP_NUMBER.
                في هذه الأثناء، يمكن للعميل استخدام زر &quot;نسخ تفاصيل الطلب&quot; لإرسالها لأي رقم يدوي.
              </p>
            </div>
          </div>
        )}

        {/* Notice after clicking WhatsApp */}
        {hasClickedWhatsApp && (
          <div className="bg-emerald-950/60 border-b border-emerald-500/40 px-4 sm:px-5 py-3 flex items-start gap-2.5 text-xs text-emerald-200 text-right">
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

        {/* Main Content Area */}
        <div className="p-4 sm:p-6 text-right space-y-5 max-h-[75vh] overflow-y-auto">
          {/* 1. Itemized Order Summary */}
          <div className="bg-[#171513] p-4 rounded-xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs text-[#D8C6AE] border-b border-white/5 pb-2">
              <span className="font-bold text-[#F5EFE6]">
                ملخص الستائر في السلة ({items.length} أصناف):
              </span>
              <span>المجموع الفرعي: {subtotal} {SHOP_CONFIG.currencySymbol}</span>
            </div>

            <div className="divide-y divide-white/5 max-h-40 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
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
                      {(item.curtainStyle || item.fabricChoice || item.liningOption) && (
                        <span className="text-[10px] text-[#C8AA78] block">
                          {[item.curtainStyle, item.fabricChoice, item.liningOption].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-left rtl:text-left shrink-0">
                    {item.isCustom ? (
                      <span className="text-[11px] text-[#C8AA78] font-medium">
                        السعر بعد مراجعة المقاسات والخامة
                      </span>
                    ) : item.isUnpriced ? (
                      <span className="text-[11px] text-[#C8AA78] font-medium">
                        السعر عند الاستفسار
                      </span>
                    ) : (
                      <span className="font-bold text-[#C8AA78] tabular-nums">
                        {item.unitPrice * item.quantity} {SHOP_CONFIG.currencySymbol}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Subtotal & Delivery note */}
            <div className="pt-2 border-t border-white/10 space-y-1.5 text-xs">
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

          {/* 2. Customer Contact Form */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C8AA78]">
              بيانات التواصل لإرسالها بالرسالة
            </h4>

            {/* Name */}
            <div>
              <label className="text-xs font-medium text-[#D8C6AE] block mb-1">
                الاسم الكامل <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="مثال: يوسف الأحمد"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#171513] border border-white/15 focus:border-[#C8AA78] text-[#F5EFE6] text-xs placeholder:text-[#D8C6AE]/40 focus:outline-none transition-colors"
              />
              {errors.fullName && (
                <p className="text-red-400 text-[11px] mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-medium text-[#D8C6AE] block mb-1">
                رقم الهاتف (للتواصل عبر واتساب) <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                dir="ltr"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="079 000 0000"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#171513] border border-white/15 focus:border-[#C8AA78] text-[#F5EFE6] text-xs text-right placeholder:text-[#D8C6AE]/40 focus:outline-none transition-colors"
              />
              {errors.phone && (
                <p className="text-red-400 text-[11px] mt-1">{errors.phone}</p>
              )}
            </div>

            {/* City & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-[#D8C6AE] block mb-1">
                  المحافظة
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#171513] border border-white/15 focus:border-[#C8AA78] text-[#F5EFE6] text-xs focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="عمّان">عمّان</option>
                  <option value="إربد">إربد</option>
                  <option value="الزرقاء">الزرقاء</option>
                  <option value="العقبة">العقبة</option>
                  <option value="السلط">السلط / البلقاء</option>
                  <option value="مأدبا">مأدبا</option>
                  <option value="جرش">جرش</option>
                  <option value="عجلون">عجلون</option>
                  <option value="الكرك">الكرك</option>
                  <option value="معان">معان</option>
                  <option value="الطفيلة">الطفيلة</option>
                  <option value="المفرق">المفرق</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-[#D8C6AE] block mb-1">
                  العنوان للتوصيل (اختياري)
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="المنطقة، الشارع، أو معلم قريب"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#171513] border border-white/15 focus:border-[#C8AA78] text-[#F5EFE6] text-xs placeholder:text-[#D8C6AE]/40 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-medium text-[#D8C6AE] block mb-1">
                ملاحظات إضافية (اختياري)
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="أي استفسار عن مواعيد التوصيل أو طريقة التركيب"
                className="w-full px-3.5 py-2 rounded-lg bg-[#171513] border border-white/15 focus:border-[#C8AA78] text-[#F5EFE6] text-xs placeholder:text-[#D8C6AE]/40 focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>

          {/* 3. Action Buttons & WhatsApp Ordering Link */}
          <div className="pt-3 border-t border-white/10 space-y-2.5">
            {/* Primary WhatsApp Action */}
            <button
              type="button"
              onClick={handleSendViaWhatsApp}
              disabled={!isWhatsAppConfigured}
              className="w-full py-3.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.99] cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 shrink-0" />
              <span>تأكيد الطلب وإرساله عبر واتساب</span>
              <ExternalLink className="w-4 h-4 shrink-0" />
            </button>

            {/* Explanation beside the button */}
            <p className="text-xs text-[#D8C6AE] text-center flex items-center justify-center gap-1.5 py-1">
              <Info className="w-3.5 h-3.5 text-[#C8AA78] shrink-0" />
              <span>سيفتح واتساب برسالة جاهزة؛ اضغط إرسال لإكمال طلبك.</span>
            </p>

            {/* Fallback & Clear Cart Action Row */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={handleCopy}
                className="w-full sm:flex-1 py-2.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#D8C6AE] hover:text-[#F5EFE6] border border-white/10 flex items-center justify-center gap-2 transition-colors cursor-pointer"
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
                className="w-full sm:w-auto py-2.5 px-3 rounded-lg bg-red-950/30 hover:bg-red-900/40 text-xs text-red-300 border border-red-500/20 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
