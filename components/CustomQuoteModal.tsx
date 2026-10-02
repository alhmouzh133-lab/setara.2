'use client';

import React, { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import {
  CUSTOM_CURTAIN_TYPES,
  CUSTOM_FABRIC_OPTIONS,
  CUSTOM_COLOR_PRESETS,
  CustomCurtainItem,
  SHOP_CONFIG,
} from '@/lib/shop-data';
import { orderStorage } from '@/lib/order-storage';
import {
  X,
  Scissors,
  CheckCircle2,
  AlertCircle,
  Ruler,
  Info,
  Copy,
  Check,
  Plus,
  Trash2,
  Layers,
  MapPin,
  ShoppingBag,
  ListOrdered,
} from 'lucide-react';

interface ItemErrorMap {
  [itemId: string]: {
    width?: string;
    height?: string;
    quantity?: string;
    curtainType?: string;
    fabric?: string;
    color?: string;
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
    setIsOrdersOpen,
    openOrderDetails,
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

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    quoteRef: string;
    items: CustomCurtainItem[];
    customer: typeof customer;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isCustomQuoteOpen) return null;

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
    items.forEach((item, index) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const ref = `QUOTE-${Math.floor(100000 + Math.random() * 900000)}`;

    // Save order snapshot locally before showing completion screen
    const savedRecord = orderStorage.createCustomQuoteOrder({
      orderRef: ref,
      items: [...items],
      customer: {
        fullName: customer.fullName.trim(),
        phone: customer.phone.trim(),
        city: customer.city,
        notes: customer.generalNotes.trim() || undefined,
      },
    });

    setSubmittedData({
      quoteRef: savedRecord.orderRef,
      items: [...items],
      customer: { ...customer },
    });
    setIsSubmitted(true);
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setIsCustomQuoteOpen(false);
  };

  const handleViewOrders = () => {
    const ref = submittedData?.quoteRef;
    handleClose();
    if (ref) {
      openOrderDetails(ref);
    } else {
      setIsOrdersOpen(true);
    }
  };

  const copyRef = () => {
    if (!submittedData) return;
    navigator.clipboard?.writeText(submittedData.quoteRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-[#211B17] text-[#F5EFE6] border border-[#C8AA78]/40 rounded-xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C8AA78]/15 border border-[#C8AA78]/30 flex items-center justify-center text-[#C8AA78]">
              <Scissors className="w-4 h-4" />
            </div>
            <div className="text-right">
              <h3 className="text-base sm:text-lg font-bold text-[#F5EFE6]">
                {isSubmitted ? 'تم حفظ تفاصيل طلبك' : 'طلب تسعير تفصيل ستائر مخصصة'}
              </h3>
              <p className="text-[11px] sm:text-xs text-[#D8C6AE]">
                أدخل مقاسات ستارة واحدة أو عدة ستائر في طلب تسعير موحد
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-[#D8C6AE] hover:text-[#F5EFE6] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted && submittedData ? (
          /* Submission Screen */
          <div className="p-5 sm:p-8 text-right space-y-6 max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col items-center justify-center text-center py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl sm:text-2xl font-bold text-[#F5EFE6]">
                تمت العملية بنجاح
              </h4>
              <p className="mt-1 text-xs text-emerald-300 font-medium">
                تم حفظ تفاصيل طلبك
              </p>
            </div>

            {/* Reference Box */}
            <div className="p-4 bg-[#171513] rounded-lg border border-white/10 flex items-center justify-between">
              <div className="text-right">
                <span className="text-[11px] text-[#D8C6AE]/70 block">
                  رقم المرجع الموحد لطلبك:
                </span>
                <span className="text-lg font-mono font-bold text-[#C8AA78] tracking-wider">
                  {submittedData.quoteRef}
                </span>
              </div>
              <button
                type="button"
                onClick={copyRef}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-xs text-[#D8C6AE] transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
              </button>
            </div>

            {/* Customer Details Summary */}
            <div className="p-3.5 bg-[#1B1613] rounded-lg border border-white/5 text-xs text-[#D8C6AE] flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[#D8C6AE]/70">مقدم الطلب:</span>{' '}
                <strong className="text-[#F5EFE6]">{submittedData.customer.fullName}</strong>
              </div>
              <div>
                <span className="text-[#D8C6AE]/70">رقم الهاتف:</span>{' '}
                <strong className="text-[#F5EFE6]" dir="ltr">{submittedData.customer.phone}</strong>
              </div>
              <div>
                <span className="text-[#D8C6AE]/70">المدينة:</span>{' '}
                <strong className="text-[#F5EFE6]">{submittedData.customer.city}</strong>
              </div>
            </div>

            {/* Itemized Curtains Breakdown */}
            <div className="space-y-3">
              <h5 className="font-bold text-[#F5EFE6] text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#C8AA78]" />
                <span>تفاصيل الستائر المطلوبة ({submittedData.items.length}):</span>
              </h5>

              <div className="space-y-2.5">
                {submittedData.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-[#171513] rounded-lg border border-white/10 text-xs space-y-1.5 text-right"
                  >
                    <div className="flex items-center justify-between font-bold text-[#F5EFE6] border-b border-white/5 pb-1.5">
                      <span>الستارة {idx + 1} {item.roomLocation ? `· ${item.roomLocation}` : ''}</span>
                      <span className="text-[#C8AA78]">{item.quantity} قطعة</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[#D8C6AE]">
                      <div>
                        <span className="text-[#D8C6AE]/70">الموديل:</span> {item.curtainType}
                      </div>
                      <div>
                        <span className="text-[#D8C6AE]/70">القماش:</span> {item.fabric}
                      </div>
                      <div>
                        <span className="text-[#D8C6AE]/70">اللون:</span> {item.color} {item.customColorNote && `(${item.customColorNote})`}
                      </div>
                      <div>
                        <span className="text-[#D8C6AE]/70">المقاس:</span>{' '}
                        <strong className="text-[#F5EFE6]">{item.widthCm} سم عرض × {item.heightCm} سم ارتفاع</strong>
                      </div>
                    </div>
                    {item.itemNotes && (
                      <p className="text-[11px] text-[#D8C6AE]/70 pt-1 border-t border-white/5">
                        ملاحظات خاصة: {item.itemNotes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions: عرض طلباتي & متابعة التسوق */}
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
          /* Multi-Curtain Form */
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 text-right space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Mandatory Instruction Banner */}
            <div className="p-3.5 bg-[#2A231E] border border-[#C8AA78]/30 rounded-lg flex items-start gap-2.5 text-xs text-[#F5EFE6] leading-relaxed">
              <Info className="w-4 h-4 text-[#C8AA78] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#C8AA78] block mb-0.5">
                  يؤكّد المحل السعر النهائي بعد مراجعة المقاسات والخامة.
                </strong>
                <span>
                  يمكنك إضافة عدة ستائر لمختلف الغرف وحساب أبعاد كل نافذة بصورة مستقلة، ليقوم المتجر بدراسة كمية القماش وإرسال عرض سعر متكامل.
                </span>
              </div>
            </div>

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
                          placeholder="مثال: صالون الضيوف، غرفة المعيشة"
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

                    {/* Dimensions & Quantity (Validated positive values) */}
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
                        placeholder="ملاحظات لهذه الستارة (مثال: سكة تعليق يدوية، تثبيت بالسقف)"
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

            {/* Pre-Submission Itemized Summary */}
            <div className="p-3.5 bg-[#171513] rounded-lg border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#F5EFE6] border-b border-white/5 pb-1.5">
                <span>ملخص الستائر الجاهزة للتسعير:</span>
                <span className="text-[#C8AA78]">{items.length} ستائر</span>
              </div>
              <div className="space-y-1 text-xs text-[#D8C6AE]">
                {items.map((it, i) => (
                  <div key={it.id} className="flex items-center justify-between py-0.5">
                    <span>
                      الستارة {i + 1} {it.roomLocation && `(${it.roomLocation})`}: {it.fabric} - {it.color}
                    </span>
                    <span className="tabular-nums font-mono text-[11px]">
                      {it.widthCm || '...'} × {it.heightCm || '...'} سم ({it.quantity} قطعة)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Details (Entered Once) */}
            <div className="pt-2 border-t border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-[#F5EFE6]">
                معلومات التواصل لإرسال عرض السعر الموحد
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
                  placeholder="مثال: عمّان - خلدا"
                  className="w-full px-3 py-2 rounded-lg bg-[#171513] border border-white/15 focus:border-[#C8AA78] text-[#F5EFE6] text-xs placeholder:text-[#D8C6AE]/40 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#D8C6AE] block mb-1">
                  ملاحظات عامة للطلب (اختياري)
                </label>
                <textarea
                  rows={2}
                  value={customer.generalNotes}
                  onChange={(e) => setCustomer({ ...customer, generalNotes: e.target.value })}
                  placeholder="أي متطلبات عامة تخص موعد المعاينة أو تفضيلات مجاري الستائر"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#171513] border border-white/15 focus:border-[#C8AA78] text-[#F5EFE6] text-xs placeholder:text-[#D8C6AE]/40 focus:outline-none transition-colors resize-none"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                className="w-full sm:flex-1 py-3.5 rounded-lg bg-[#C8AA78] hover:bg-[#d5ba8c] text-[#171513] font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
              >
                إرسال طلب التسعير الموحد ({items.length} ستائر)
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto px-5 py-3.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#D8C6AE] transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
