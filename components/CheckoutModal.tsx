'use client';

import React, { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { SHOP_CONFIG } from '@/lib/shop-data';
import { orderStorage } from '@/lib/order-storage';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ShoppingBag,
  ListOrdered,
} from 'lucide-react';

export default function CheckoutModal() {
  const {
    items,
    subtotal,
    isCheckoutOpen,
    setIsCheckoutOpen,
    clearCart,
    setIsOrdersOpen,
    openOrderDetails,
  } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: 'عمّان',
    address: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [orderRef, setOrderRef] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isCheckoutOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'يرجى إدخال الاسم الكامل للتسليم.';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'يرجى إدخال رقم الهاتف للتواصل وتأكيد موعد التسليم.';
    } else if (formData.phone.trim().length < 8) {
      newErrors.phone = 'يرجى إدخال رقم هاتف صحيح (مثال: 0791234567).';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'يرجى كتابة العنوان التفصيلي (المنطقة، الشارع، أو المعلم القريب).';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const generatedRef = `SETARA-${Math.floor(100000 + Math.random() * 900000)}`;

      // Save order snapshot locally before showing completion screen or clearing cart
      const savedRecord = orderStorage.createReadyMadeOrder({
        orderRef: generatedRef,
        items: [...items],
        customer: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          city: formData.city,
          address: formData.address.trim(),
          notes: formData.notes.trim() || undefined,
        },
        subtotal,
      });

      // Clear the submitted cart items
      clearCart();

      setOrderRef(savedRecord.orderRef);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Failed to submit order:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setIsCheckoutOpen(false);
  };

  const handleViewOrders = () => {
    handleClose();
    if (orderRef) {
      openOrderDetails(orderRef);
    } else {
      setIsOrdersOpen(true);
    }
  };

  const copyRef = () => {
    navigator.clipboard?.writeText(orderRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-[#211B17] text-[#F5EFE6] border border-[#C8AA78]/40 rounded-xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="text-right">
            <h3 className="text-lg font-bold text-[#F5EFE6]">
              {isSubmitted ? 'تم حفظ تفاصيل طلبك' : 'إتمام الطلب التجريبي'}
            </h3>
            <p className="text-xs text-[#D8C6AE]">
              {SHOP_CONFIG.brandName} · المرحلة التجريبية الأولى
            </p>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-[#D8C6AE] hover:text-[#F5EFE6] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prototype Indicator Banner */}
        <div className="bg-[#C8AA78]/15 border-b border-[#C8AA78]/30 px-5 py-3 flex items-center gap-3 text-xs text-[#F5EFE6]">
          <AlertTriangle className="w-4 h-4 text-[#C8AA78] shrink-0" />
          <span>
            <strong className="text-[#C8AA78]">تنويه هام:</strong> هذا نموذج محاكاة تجريبي (Prototype) - لا يتم تحصيل مبالغ بنكية ولا شحن حقيقي.
          </span>
        </div>

        {/* Content Body */}
        {isSubmitted ? (
          /* Completion Screen */
          <div className="p-6 sm:p-8 text-right space-y-6">
            <div className="flex flex-col items-center justify-center text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              {/* Exact required headline */}
              <h4 className="text-2xl font-bold text-[#F5EFE6]">
                تمت العملية بنجاح
              </h4>
              {/* Exact required subtitle */}
              <p className="mt-1 text-sm text-emerald-300 font-medium">
                تم حفظ تفاصيل طلبك
              </p>
            </div>

            {/* Reference Box with Copy */}
            <div className="p-4 bg-[#171513] rounded-lg border border-white/10 flex items-center justify-between">
              <div className="text-right">
                <span className="text-[11px] text-[#D8C6AE]/70 block">
                  الرقم المرجعي للطلب:
                </span>
                <span className="text-lg font-mono font-bold text-[#C8AA78] tracking-wider">
                  {orderRef}
                </span>
              </div>
              <button
                type="button"
                onClick={copyRef}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-xs text-[#D8C6AE] transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ' : 'نسخ الرقم'}</span>
              </button>
            </div>

            {/* Summary of What Was Submitted */}
            <div className="space-y-3 bg-[#1B1613] p-4 rounded-lg border border-white/5 text-xs text-[#D8C6AE]">
              <h5 className="font-bold text-[#F5EFE6] text-sm border-b border-white/10 pb-2">
                ملخص بيانات الاستلام المسجلة:
              </h5>
              <div className="grid grid-cols-2 gap-2 text-right">
                <div>
                  <span className="text-[#D8C6AE]/70">الاسم:</span>{' '}
                  <strong className="text-[#F5EFE6]">{formData.fullName}</strong>
                </div>
                <div>
                  <span className="text-[#D8C6AE]/70">الهاتف:</span>{' '}
                  <strong className="text-[#F5EFE6]">{formData.phone}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-[#D8C6AE]/70">العنوان:</span>{' '}
                  <span className="text-[#F5EFE6]">{formData.city} - {formData.address}</span>
                </div>
                <div>
                  <span className="text-[#D8C6AE]/70">إجمالي الستائر:</span>{' '}
                  <strong className="text-[#C8AA78]">{subtotal} {SHOP_CONFIG.currencySymbol}</strong>
                </div>
                <div>
                  <span className="text-[#D8C6AE]/70">رسوم التوصيل:</span>{' '}
                  <span className="text-[#F5EFE6]">{SHOP_CONFIG.deliveryPricingNote}</span>
                </div>
              </div>
            </div>

            {/* Required Actions: عرض طلباتي & متابعة التسوق */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleViewOrders}
                className="w-full sm:flex-1 py-3 px-4 rounded-lg bg-[#C8AA78] hover:bg-[#d5ba8c] text-[#171513] font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ListOrdered className="w-4 h-4" />
                <span>عرض طلباتي</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:flex-1 py-3 px-4 rounded-lg bg-white/10 hover:bg-white/15 text-[#F5EFE6] font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer border border-white/10"
              >
                <ShoppingBag className="w-4 h-4 text-[#C8AA78]" />
                <span>متابعة التسوق</span>
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form & Summary */
          <form onSubmit={handleSubmit} className="p-6 text-right space-y-6 max-h-[75vh] overflow-y-auto">
            {/* 1. Itemized Summary Accordion */}
            <div className="bg-[#171513] p-4 rounded-lg border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs text-[#D8C6AE] border-b border-white/5 pb-2">
                <span className="font-bold text-[#F5EFE6]">محتويات الطلب:</span>
                <span>{items.length} أصناف</span>
              </div>

              <div className="divide-y divide-white/5 max-h-36 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color.hex }} />
                      <span className="text-[#F5EFE6] font-medium">{item.productName}</span>
                      <span className="text-[#D8C6AE]/60">({item.size.label} × {item.quantity})</span>
                    </div>
                    <span className="font-bold text-[#C8AA78] tabular-nums">
                      {item.unitPrice * item.quantity} {SHOP_CONFIG.currencySymbol}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculations */}
              <div className="pt-2 border-t border-white/10 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[#D8C6AE]">
                  <span>المجموع الفرعي للستائر:</span>
                  <span className="text-[#F5EFE6] font-bold tabular-nums">
                    {subtotal} {SHOP_CONFIG.currencySymbol}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#D8C6AE]">
                  <span>رسوم التوصيل:</span>
                  <span className="text-[#C8AA78] font-medium">
                    {SHOP_CONFIG.deliveryPricingNote}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold text-[#F5EFE6] pt-1 border-t border-white/5">
                  <span>المجموع المبدئي (قبل رسوم التوصيل):</span>
                  <span className="text-[#C8AA78] tabular-nums text-base">
                    {subtotal} {SHOP_CONFIG.currencySymbol}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Customer Delivery Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[#F5EFE6]">
                بيانات التسليم داخل الأردن
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
                  placeholder="مثال: أحمد عبد الله"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#171513] border border-white/15 focus:border-[#C8AA78] text-[#F5EFE6] text-xs placeholder:text-[#D8C6AE]/40 focus:outline-none transition-colors"
                />
                {errors.fullName && (
                  <p className="text-red-400 text-[11px] mt-1">{errors.fullName}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-medium text-[#D8C6AE] block mb-1">
                  رقم الهاتف (للتنسيق والتوصيل) <span className="text-red-400">*</span>
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
                    المحافظة <span className="text-red-400">*</span>
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
                    العنوان التفصيلي <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="الحي، اسم الشارع، رقم العمارة"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#171513] border border-white/15 focus:border-[#C8AA78] text-[#F5EFE6] text-xs placeholder:text-[#D8C6AE]/40 focus:outline-none transition-colors"
                  />
                  {errors.address && (
                    <p className="text-red-400 text-[11px] mt-1">{errors.address}</p>
                  )}
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
                  placeholder="أي تفاصيل تخص أوقات التواجد أو رغبتك بالاستفسار عن خدمة التركيب"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#171513] border border-white/15 focus:border-[#C8AA78] text-[#F5EFE6] text-xs placeholder:text-[#D8C6AE]/40 focus:outline-none transition-colors resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:flex-1 py-3.5 rounded-lg bg-[#C8AA78] hover:bg-[#d5ba8c] text-[#171513] font-bold text-sm transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'جارٍ الحفظ...' : 'تأكيد إرسال الطلب'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto px-5 py-3.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#D8C6AE] transition-colors cursor-pointer"
              >
                إلغاء والعودة
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
