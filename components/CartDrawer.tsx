'use client';

import React from 'react';
import Image from 'next/image';
import { useCart } from '@/lib/cart-context';
import { SHOP_CONFIG } from '@/lib/shop-data';
import { X, Trash2, Plus, Minus, ShoppingBag, MessageCircle, Truck } from 'lucide-react';

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    totalItems,
    setIsCheckoutOpen,
  } = useCart();

  if (!isCartOpen) return null;

  const handleProceedToWhatsApp = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 rtl:pl-0 rtl:pr-0">
        {/* Drawer Panel */}
        <div className="w-screen max-w-md bg-[#211B17] text-[#F5EFE6] border-r border-white/10 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#C8AA78]" />
              <h2 className="text-lg font-bold text-[#F5EFE6]">
                سلة المشتريات ({totalItems})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              aria-label="إغلاق السلة"
              className="p-1.5 rounded-lg text-[#D8C6AE] hover:text-[#F5EFE6] hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-white/5">
            {items.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-[#D8C6AE]/50 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-[#F5EFE6]">
                  سلتك فارغة حالياً
                </h3>
                <p className="mt-1 text-xs text-[#D8C6AE]/80 max-w-xs">
                  تصفح مجموعتنا من الستائر الجاهزة أو أضف ستائر مفصلة بالمقاسات المناسبة لمنزلك.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-6 px-5 py-2.5 rounded-md bg-[#C8AA78] text-[#171513] text-xs font-bold hover:bg-[#d5ba8c] transition-all cursor-pointer"
                >
                  استكشاف الستائر الجاهزة
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-4 flex gap-4 text-right">
                  {/* Item Image */}
                  <div className="relative w-20 h-20 rounded-md overflow-hidden bg-[#2A231E] border border-white/10 shrink-0">
                    <Image
                      src={item.image}
                      alt={item.productName}
                      fill
                      sizes="80px"
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-[#F5EFE6] leading-snug">
                            {item.productName}
                          </h4>
                          {item.isCustom && (
                            <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-[#C8AA78]/20 text-[#C8AA78] text-[10px] rounded font-medium">
                              تفصيل حسب الطلب
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          aria-label="حذف القطعة"
                          className="text-[#D8C6AE]/50 hover:text-red-400 transition-colors p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Attributes */}
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#D8C6AE]">
                        <span className="flex items-center gap-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/30"
                            style={{ backgroundColor: item.color.hex }}
                          />
                          <span>{item.color.name}</span>
                        </span>
                        <span>·</span>
                        <span>{item.size.label}</span>
                      </div>

                      {/* Selected Curtain Options */}
                      {(item.curtainStyle || item.fabricChoice || item.liningOption) && (
                        <div className="mt-1 text-[11px] text-[#C8AA78]">
                          {[item.curtainStyle, item.fabricChoice, item.liningOption].filter(Boolean).join(' · ')}
                        </div>
                      )}
                    </div>

                    {/* Quantity & Price */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-[#171513] border border-white/10 rounded p-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 text-xs text-[#F5EFE6] cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 text-xs text-[#F5EFE6] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-left rtl:text-left">
                        {item.isCustom ? (
                          <span className="text-xs font-medium text-[#C8AA78]">
                            السعر بعد مراجعة المقاسات والخامة
                          </span>
                        ) : item.isUnpriced ? (
                          <span className="text-xs font-bold text-[#C8AA78]">
                            السعر عند الاستفسار
                          </span>
                        ) : (
                          <>
                            <span className="text-[11px] text-[#D8C6AE]/70 block">
                              {item.unitPrice} {SHOP_CONFIG.currencySymbol} / قطعة
                            </span>
                            <span className="text-sm font-bold text-[#C8AA78] tabular-nums">
                              {item.unitPrice * item.quantity} {SHOP_CONFIG.currencySymbol}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & WhatsApp Action */}
          {items.length > 0 && (
            <div className="p-5 bg-[#1B1613] border-t border-white/10 space-y-4">
              {/* Delivery Note */}
              <div className="p-3 bg-[#241E1A] rounded-lg border border-white/5 flex items-start gap-2.5 text-xs text-[#D8C6AE]">
                <Truck className="w-4 h-4 text-[#C8AA78] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold text-[#F5EFE6] block">
                    رسوم التوصيل: {SHOP_CONFIG.deliveryPricingNote}
                  </span>
                  <p className="text-[11px] text-[#D8C6AE]/80">
                    سيتم تأكيد رسوم الشحن بالتواصل المباشر بناءً على عنوانك في الأردن.
                  </p>
                </div>
              </div>

              {/* Subtotal */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#D8C6AE]">مجموع الستائر الجاهزة:</span>
                <span className="text-xl font-bold text-[#F5EFE6] tabular-nums">
                  {subtotal}{' '}
                  <span className="text-xs font-normal text-[#C8AA78]">
                    {SHOP_CONFIG.currencySymbol}
                  </span>
                </span>
              </div>

              {/* Send Order via WhatsApp Button */}
              <button
                type="button"
                onClick={handleProceedToWhatsApp}
                className="w-full py-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>تأكيد الطلب عبر واتساب</span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-[#D8C6AE]/60 pt-1">
                <span>تواصل مباشر مع المتجر</span>
                <button
                  type="button"
                  onClick={clearCart}
                  className="hover:text-red-400 transition-colors cursor-pointer"
                >
                  إفراغ السلة
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
