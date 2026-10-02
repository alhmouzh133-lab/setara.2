'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/lib/cart-context';
import { orderStorage, OrderRecord, OrderType, OrderStatus } from '@/lib/order-storage';
import { SHOP_CONFIG } from '@/lib/shop-data';
import {
  X,
  ArrowRight,
  ShoppingBag,
  Scissors,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Copy,
  Check,
  ChevronLeft,
  Calendar,
  Phone,
  User,
  MapPin,
  Layers,
  FileText,
  Truck,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';

export default function OrdersModal() {
  const {
    isOrdersOpen,
    setIsOrdersOpen,
    selectedOrderRef,
    setSelectedOrderRef,
  } = useCart();

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | OrderType | OrderStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [cancellingOrderRef, setCancellingOrderRef] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  // Sync orders from storage and subscribe to real-time changes
  useEffect(() => {
    if (!isOrdersOpen) return;

    const load = () => {
      const data = orderStorage.getOrders();
      setOrders(data);

      // If a specific order was requested to view
      if (selectedOrderRef) {
        const found = data.find(
          (o) => o.orderRef === selectedOrderRef || o.id === selectedOrderRef
        );
        if (found) {
          setSelectedOrder(found);
        }
      }
    };

    load();
    const unsubscribe = orderStorage.subscribe(load);
    return () => unsubscribe();
  }, [isOrdersOpen, selectedOrderRef]);

  if (!isOrdersOpen) return null;

  const handleClose = () => {
    setSelectedOrder(null);
    setSelectedOrderRef(null);
    setCancellingOrderRef(null);
    setIsOrdersOpen(false);
  };

  const handleCopy = (ref: string) => {
    navigator.clipboard?.writeText(ref);
    setCopiedRef(ref);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const handleConfirmCancel = (orderRef: string) => {
    const res = orderStorage.cancelOrder(orderRef);
    if (res.success && res.order) {
      if (selectedOrder && (selectedOrder.orderRef === orderRef || selectedOrder.id === orderRef)) {
        setSelectedOrder(res.order);
      }
    }
    setCancellingOrderRef(null);
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'ready_made' || activeFilter === 'custom_quote') {
      return o.type === activeFilter;
    }
    if (activeFilter === 'pending' || activeFilter === 'cancelled') {
      return o.status === activeFilter;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-[#211B17] text-[#F5EFE6] border border-[#C8AA78]/40 rounded-xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#1B1613]">
          <div className="flex items-center gap-3">
            {selectedOrder && (
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                aria-label="العودة للقائمة"
                className="p-1.5 rounded-lg text-[#D8C6AE] hover:text-[#F5EFE6] hover:bg-white/5 transition-colors cursor-pointer"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
            <div className="text-right">
              <h3 className="text-lg sm:text-xl font-bold text-[#F5EFE6] flex items-center gap-2">
                <span>{selectedOrder ? `تفاصيل الطلب: ${selectedOrder.orderRef}` : 'طلباتي'}</span>
                {!selectedOrder && orders.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#C8AA78]/20 text-[#C8AA78] font-bold">
                    {orders.length}
                  </span>
                )}
              </h3>
              <p className="text-[11px] sm:text-xs text-[#D8C6AE]/75 mt-0.5">
                {selectedOrder
                  ? `تاريخ التسجيل: ${selectedOrder.createdFormatted}`
                  : 'سجل المشتريات الجاهزة وطلبات التفصيل المخصصة'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="إغلاق النافذة"
            className="p-1.5 rounded-lg text-[#D8C6AE] hover:text-[#F5EFE6] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prototype Local Persistence Banner */}
        <div className="bg-[#C8AA78]/10 border-b border-[#C8AA78]/20 px-4 sm:px-6 py-2 flex items-center justify-between text-[11px] text-[#D8C6AE] shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span>يتم حفظ السجل تلقائياً ومحلياً على هذا المتصفح (Local Storage Persistence)</span>
          </span>
          <span className="text-[#C8AA78] hidden sm:inline font-mono">
            {SHOP_CONFIG.brandName}
          </span>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-right space-y-5">
          {selectedOrder ? (
            /* ========================================================================= */
            /* VIEW B: ORDER DETAILS                                                     */
            /* ========================================================================= */
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Top Summary Card */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#171513] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#D8C6AE]/70 font-medium">الرقم المرجعي:</span>
                    <span className="text-base sm:text-lg font-mono font-bold text-[#C8AA78] tracking-wider">
                      {selectedOrder.orderRef}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedOrder.orderRef)}
                      className="p-1 text-[#D8C6AE] hover:text-[#C8AA78] transition-colors cursor-pointer"
                      title="نسخ الرقم"
                    >
                      {copiedRef === selectedOrder.orderRef ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#D8C6AE]/80">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#C8AA78]" />
                      <span>{selectedOrder.createdFormatted}</span>
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      {selectedOrder.type === 'ready_made' ? (
                        <ShoppingBag className="w-3.5 h-3.5 text-[#C8AA78]" />
                      ) : (
                        <Scissors className="w-3.5 h-3.5 text-[#C8AA78]" />
                      )}
                      <span>{selectedOrder.typeLabel}</span>
                    </span>
                  </div>
                </div>

                {/* Status Badge & Cancel Action */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                      selectedOrder.status === 'pending'
                        ? 'bg-amber-950/40 text-amber-300 border-amber-800/40'
                        : 'bg-red-950/30 text-red-300 border-red-800/40'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        selectedOrder.status === 'pending' ? 'bg-amber-400 animate-pulse' : 'bg-red-400'
                      }`}
                    />
                    <span>{selectedOrder.statusLabel}</span>
                  </span>

                  {selectedOrder.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => setCancellingOrderRef(selectedOrder.orderRef)}
                      className="px-3 py-1.5 rounded-lg border border-red-800/40 hover:bg-red-950/30 text-red-300 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      إلغاء الطلب
                    </button>
                  )}
                </div>
              </div>

              {/* Cancellation Notice if Cancelled */}
              {selectedOrder.status === 'cancelled' && (
                <div className="p-4 rounded-xl bg-red-950/20 border border-red-800/30 flex items-start gap-3 text-xs text-red-200">
                  <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <strong className="text-red-300 block">تم إلغاء هذا الطلب</strong>
                    <p className="text-red-200/80">
                      تم توثيق إلغاء الطلب في: {selectedOrder.cancelledFormatted || 'سجل النظام'}. السجل محفوظ كمرجع تاريخي.
                    </p>
                  </div>
                </div>
              )}

              {/* Items Breakdown */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[#F5EFE6] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#C8AA78]" />
                  <span>
                    {selectedOrder.type === 'ready_made'
                      ? `الأصناف المطلوبة (${selectedOrder.readyMadeItems?.length || 0})`
                      : `مواصفات الستائر المفصلة (${selectedOrder.customItems?.length || 0})`}
                  </span>
                </h4>

                {/* Ready Made Items */}
                {selectedOrder.type === 'ready_made' && selectedOrder.readyMadeItems && (
                  <div className="divide-y divide-white/10 rounded-xl bg-[#171513] border border-white/10 overflow-hidden">
                    {selectedOrder.readyMadeItems.map((item) => (
                      <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#2A231E] border border-white/10 shrink-0">
                            <Image
                              src={item.image}
                              alt={item.productName}
                              fill
                              sizes="56px"
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <h5 className="text-sm font-bold text-[#F5EFE6] truncate">
                              {item.productName}
                            </h5>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-[#D8C6AE]/75">
                              <span className="flex items-center gap-1">
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-black/30"
                                  style={{ backgroundColor: item.colorHex }}
                                />
                                <span>{item.colorName}</span>
                              </span>
                              <span>·</span>
                              <span>{item.sizeLabel}</span>
                              <span>·</span>
                              <span>الكمية: {item.quantity}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-left shrink-0">
                          <span className="text-sm font-bold text-[#C8AA78] tabular-nums">
                            {item.itemTotal} {SHOP_CONFIG.currencySymbol}
                          </span>
                          <span className="block text-[10px] text-[#D8C6AE]/60 tabular-nums">
                            ({item.unitPrice} × {item.quantity})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Custom Quote Items */}
                {selectedOrder.type === 'custom_quote' && selectedOrder.customItems && (
                  <div className="space-y-3">
                    {selectedOrder.customItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl bg-[#171513] border border-white/10 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="font-bold text-[#F5EFE6]">
                            ستارة {idx + 1} {item.roomLocation ? `· ${item.roomLocation}` : ''}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[#C8AA78]/15 text-[#C8AA78] font-bold">
                            {item.quantity} قطعة
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#D8C6AE]">
                          <div>
                            <span className="text-[#D8C6AE]/60">نوع الموديل:</span>{' '}
                            <span className="font-medium text-[#F5EFE6]">{item.curtainType}</span>
                          </div>
                          <div>
                            <span className="text-[#D8C6AE]/60">خامة القماش:</span>{' '}
                            <span className="font-medium text-[#F5EFE6]">{item.fabric}</span>
                          </div>
                          <div>
                            <span className="text-[#D8C6AE]/60">درجة اللون:</span>{' '}
                            <span className="font-medium text-[#F5EFE6]">
                              {item.color} {item.customColorNote && `(${item.customColorNote})`}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#D8C6AE]/60">المقاسات المحددة:</span>{' '}
                            <strong className="text-[#C8AA78]">
                              {item.widthCm} سم عرض × {item.heightCm} سم ارتفاع
                            </strong>
                          </div>
                        </div>

                        {item.itemNotes && (
                          <div className="pt-2 border-t border-white/5 text-[11px] text-[#D8C6AE]/75">
                            <span className="font-semibold text-[#D8C6AE]">ملاحظات خاصة:</span> {item.itemNotes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Delivery and Financial Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Details */}
                <div className="p-4 rounded-xl bg-[#171513] border border-white/10 space-y-2 text-xs">
                  <h4 className="font-bold text-[#F5EFE6] border-b border-white/10 pb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#C8AA78]" />
                    <span>بيانات العميل وموقع الاستلام</span>
                  </h4>
                  <div className="space-y-1.5 text-[#D8C6AE]">
                    <div>
                      <span className="text-[#D8C6AE]/60">الاسم الكامل:</span>{' '}
                      <strong className="text-[#F5EFE6]">{selectedOrder.customer.fullName}</strong>
                    </div>
                    <div>
                      <span className="text-[#D8C6AE]/60">رقم الهاتف:</span>{' '}
                      <strong className="text-[#F5EFE6]" dir="ltr">{selectedOrder.customer.phone}</strong>
                    </div>
                    <div>
                      <span className="text-[#D8C6AE]/60">المحافظة:</span>{' '}
                      <span className="text-[#F5EFE6]">{selectedOrder.customer.city}</span>
                    </div>
                    {selectedOrder.customer.address && (
                      <div>
                        <span className="text-[#D8C6AE]/60">العنوان التفصيلي:</span>{' '}
                        <span className="text-[#F5EFE6]">{selectedOrder.customer.address}</span>
                      </div>
                    )}
                    {selectedOrder.customer.notes && (
                      <div className="pt-1.5 border-t border-white/5 text-[11px]">
                        <span className="text-[#D8C6AE]/60">ملاحظات التوصيل:</span>{' '}
                        <span className="text-[#F5EFE6]">{selectedOrder.customer.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial / Cost Details */}
                <div className="p-4 rounded-xl bg-[#171513] border border-white/10 space-y-2 text-xs">
                  <h4 className="font-bold text-[#F5EFE6] border-b border-white/10 pb-2 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-[#C8AA78]" />
                    <span>الملخص المالي وطريقة الدفع</span>
                  </h4>

                  {selectedOrder.type === 'ready_made' ? (
                    <div className="space-y-2 text-[#D8C6AE]">
                      <div className="flex items-center justify-between">
                        <span className="text-[#D8C6AE]/75">المجموع الفرعي للستائر:</span>
                        <span className="font-bold text-[#F5EFE6] tabular-nums">
                          {selectedOrder.subtotal} {SHOP_CONFIG.currencySymbol}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#D8C6AE]/75">رسوم التوصيل:</span>
                        <span className="text-[#C8AA78] text-[11px] font-medium">
                          {selectedOrder.deliveryPricingNote}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-white/10 pt-2 font-bold text-sm text-[#F5EFE6]">
                        <span>الإجمالي المبدئي:</span>
                        <span className="text-[#C8AA78] text-base tabular-nums">
                          {selectedOrder.total} {SHOP_CONFIG.currencySymbol}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-white/5 space-y-1 text-[11px] text-[#D8C6AE]/75">
                        <div>
                          <span className="text-[#D8C6AE]/60">طريقة الدفع:</span>{' '}
                          <span className="text-[#F5EFE6]">{selectedOrder.paymentMethod}</span>
                        </div>
                        <div>
                          <span className="text-[#D8C6AE]/60">حالة الدفع:</span>{' '}
                          <span className="text-amber-300">{selectedOrder.paymentStatus}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-[#D8C6AE]">
                      <div className="p-3 rounded-lg bg-[#2A231E] border border-[#C8AA78]/30 text-xs">
                        <strong className="text-[#C8AA78] block mb-1">
                          التسعير: {selectedOrder.totalNote}
                        </strong>
                        <p className="text-[#D8C6AE]/80 leading-relaxed text-[11px]">
                          يقوم المتجر بحساب التكلفة وفقاً لمجموع الأمتار ونوع القماش المختار لكل نافذة، وسيتم إبلاغك بالسعر النهائي قبل بدء التفصيل.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Compact Timeline (Events that have actually occurred) */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#171513] border border-white/10 space-y-3">
                <h4 className="text-sm font-bold text-[#F5EFE6] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#C8AA78]" />
                  <span>سجل الإجراءات الفعلي (Timeline)</span>
                </h4>

                <div className="relative pr-4 border-r-2 border-white/15 space-y-4">
                  {selectedOrder.timeline.map((evt, idx) => (
                    <div key={evt.id || idx} className="relative">
                      {/* Event Dot */}
                      <span
                        className={`absolute -right-[21px] top-1 w-2.5 h-2.5 rounded-full ${
                          evt.type === 'cancellation'
                            ? 'bg-red-400 ring-4 ring-red-950'
                            : evt.type === 'creation'
                            ? 'bg-emerald-400 ring-4 ring-emerald-950'
                            : 'bg-[#C8AA78] ring-4 ring-amber-950'
                        }`}
                      />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#F5EFE6]">{evt.title}</span>
                          <span className="text-[10px] text-[#D8C6AE]/60 tabular-nums">
                            ({evt.time})
                          </span>
                        </div>
                        {evt.description && (
                          <p className="text-xs text-[#D8C6AE]/75 leading-relaxed">
                            {evt.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* VIEW A: ORDERS LIST                                                       */
            /* ========================================================================= */
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Filters */}
              {orders.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-white/10">
                  <span className="text-xs text-[#D8C6AE]/70 ml-2 font-medium">تصفية:</span>
                  {[
                    { id: 'all', label: 'الكل' },
                    { id: 'ready_made', label: 'ستائر جاهزة' },
                    { id: 'custom_quote', label: 'طلبات تفصيل' },
                    { id: 'pending', label: 'قيد المراجعة' },
                    { id: 'cancelled', label: 'ملغي' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setActiveFilter(filter.id as typeof activeFilter)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                        activeFilter === filter.id
                          ? 'bg-[#C8AA78] text-[#171513] font-bold'
                          : 'bg-white/5 hover:bg-white/10 text-[#D8C6AE]'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {orders.length === 0 ? (
                <div className="py-12 px-4 text-center space-y-4 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#C8AA78]">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div className="space-y-1 max-w-md">
                    <h4 className="text-lg font-bold text-[#F5EFE6]">
                      لا توجد طلبات مسجلة حتى الآن
                    </h4>
                    <p className="text-xs text-[#D8C6AE]/75 leading-relaxed">
                      عند إتمام شراء ستائر جاهزة أو إرسال طلب تفصيل مخصص، ستظهر تفاصيلها وحالتها في هذا السجل فوراً.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      const el = document.getElementById('ready-made-shop');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="mt-2 px-6 py-3 rounded-lg bg-[#C8AA78] hover:bg-[#d5ba8c] text-[#171513] font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-md"
                  >
                    تصفح الستائر والتسوق
                  </button>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#D8C6AE]/70">
                  لا توجد طلبات تطابق التصفية المختارة.
                </div>
              ) : (
                /* Orders Grid / Cards */
                <div className="space-y-3.5">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 sm:p-5 rounded-xl bg-[#171513] border border-white/10 hover:border-[#C8AA78]/30 transition-all space-y-3"
                    >
                      {/* Top Header of Card */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#C8AA78] text-sm tracking-wider">
                            {order.orderRef}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(order.orderRef)}
                            className="p-1 text-[#D8C6AE]/60 hover:text-[#C8AA78] transition-colors cursor-pointer"
                            title="نسخ الرقم المرجعي"
                          >
                            {copiedRef === order.orderRef ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-[#D8C6AE]/60">
                            {order.createdFormatted}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              order.status === 'pending'
                                ? 'bg-amber-950/40 text-amber-300 border-amber-800/40'
                                : 'bg-red-950/30 text-red-300 border-red-800/40'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                order.status === 'pending' ? 'bg-amber-400' : 'bg-red-400'
                              }`}
                            />
                            <span>{order.statusLabel}</span>
                          </span>
                        </div>
                      </div>

                      {/* Middle Body: Thumbnails & Summary */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Thumbnails preview */}
                          {order.type === 'ready_made' && order.readyMadeItems && (
                            <div className="flex -space-x-2 space-x-reverse shrink-0">
                              {order.readyMadeItems.slice(0, 3).map((item, idx) => (
                                <div
                                  key={idx}
                                  className="relative w-11 h-11 rounded-lg overflow-hidden border-2 border-[#171513] bg-[#2A231E]"
                                >
                                  <Image
                                    src={item.image}
                                    alt={item.productName}
                                    fill
                                    sizes="44px"
                                    className="object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              ))}
                              {order.readyMadeItems.length > 3 && (
                                <div className="w-11 h-11 rounded-lg bg-white/10 border-2 border-[#171513] flex items-center justify-center text-[10px] font-bold text-[#F5EFE6]">
                                  +{order.readyMadeItems.length - 3}
                                </div>
                              )}
                            </div>
                          )}

                          {order.type === 'custom_quote' && (
                            <div className="w-11 h-11 rounded-lg bg-[#C8AA78]/15 border border-[#C8AA78]/30 flex items-center justify-center text-[#C8AA78] shrink-0">
                              <Scissors className="w-5 h-5" />
                            </div>
                          )}

                          <div className="space-y-0.5 min-w-0">
                            <span className="text-xs font-bold text-[#F5EFE6] block truncate">
                              {order.type === 'ready_made'
                                ? order.readyMadeItems?.map((it) => it.productName).join('، ')
                                : `طلب تفصيل ${order.customItems?.length || 1} ستائر مخصصة`}
                            </span>
                            <span className="text-[11px] text-[#D8C6AE]/70 block">
                              {order.type === 'ready_made'
                                ? `${order.readyMadeItems?.length} أصناف جاهزة للتعليق`
                                : `المحافظة: ${order.customer.city} · مقاسات محددة بالـ cm`}
                            </span>
                          </div>
                        </div>

                        {/* Cost Tag */}
                        <div className="text-right sm:text-left shrink-0">
                          {order.type === 'ready_made' ? (
                            <>
                              <span className="text-base font-bold text-[#C8AA78] tabular-nums">
                                {order.total} {SHOP_CONFIG.currencySymbol}
                              </span>
                              <span className="block text-[10px] text-[#D8C6AE]/60">
                                رسوم التوصيل تُحدّد لاحقاً
                              </span>
                            </>
                          ) : (
                            <span className="text-xs font-bold px-2 py-1 rounded bg-[#2A231E] text-[#C8AA78] border border-[#C8AA78]/30">
                              {order.totalNote}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Actions */}
                      <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#C8AA78] hover:bg-[#d5ba8c] text-[#171513] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>عرض التفاصيل</span>
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>

                        {order.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => setCancellingOrderRef(order.orderRef)}
                            className="px-3 py-1.5 rounded-lg text-red-300 hover:text-red-200 hover:bg-red-950/20 text-xs transition-colors cursor-pointer"
                          >
                            إلغاء
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cancellation Confirmation Dialog */}
        {cancellingOrderRef && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="max-w-md w-full bg-[#1F1916] border border-red-800/40 rounded-xl p-5 text-right space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-red-950/40 border border-red-800/40 flex items-center justify-center text-red-400 mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h4 className="text-base sm:text-lg font-bold text-[#F5EFE6]">
                  هل تريد إلغاء هذا الطلب؟
                </h4>
                <p className="text-xs text-[#D8C6AE]/75 leading-relaxed">
                  سيتم تغيير حالة الطلب المرجعي <span className="font-mono text-[#C8AA78]">{cancellingOrderRef}</span> إلى ملغي وتحديث السجل.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleConfirmCancel(cancellingOrderRef)}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  تأكيد الإلغاء
                </button>
                <button
                  type="button"
                  onClick={() => setCancellingOrderRef(null)}
                  className="flex-1 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-[#F5EFE6] text-xs font-semibold transition-colors cursor-pointer"
                >
                  الاحتفاظ بالطلب
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
