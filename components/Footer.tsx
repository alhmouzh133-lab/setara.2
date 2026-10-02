'use client';

import React from 'react';
import Image from 'next/image';
import { SHOP_CONFIG } from '@/lib/shop-data';
import { useCart } from '@/lib/cart-context';
import { MapPin, MessageSquare, AlertCircle } from 'lucide-react';

export default function Footer() {
  const { setIsCustomQuoteOpen, setIsOrdersOpen } = useCart();

  const handleScrollToTop = () => {
    if (typeof window !== 'undefined') {
      if (window.location.hash) {
        const cleanUrl = window.location.pathname + window.location.search;
        window.history.replaceState(window.history.state, '', cleanUrl);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer id="contact-footer" className="w-full bg-[#131110] text-[#D8C6AE] border-t border-white/10 pt-12 pb-8 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 text-right">
          {/* Col 1: Brand & Confirmed Location */}
          <div className="space-y-3">
            <div className="relative h-14 w-14 shrink-0 rounded-full overflow-hidden shadow-xs ring-1 ring-white/10">
              <Image
                src="/images/setara-logo.png"
                alt="سيتارة"
                fill
                sizes="56px"
                className="object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-xs text-[#D8C6AE]/80 font-normal leading-relaxed">
              متجر متخصص في ستائر النوافذ الجاهزة والتفصيل المخصص في الأردن.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#C8AA78]">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{SHOP_CONFIG.locationConfirmed}</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5EFE6] pb-1 border-b border-white/10">
              أقسام الموقع
            </h4>
            <ul className="space-y-1.5 text-xs font-normal">
              <li>
                <button
                  onClick={handleScrollToTop}
                  className="hover:text-[#F5EFE6] transition-colors cursor-pointer"
                >
                  الرئيسية
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('categories-section')}
                  className="hover:text-[#F5EFE6] transition-colors"
                >
                  أقسام وتصنيفات الستائر
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('ready-made-shop')}
                  className="hover:text-[#F5EFE6] transition-colors"
                >
                  الستائر الجاهزة
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsCustomQuoteOpen(true)}
                  className="hover:text-[#C8AA78] transition-colors text-[#C8AA78] font-medium"
                >
                  طلب تسعير تفصيل خاص
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsOrdersOpen(true)}
                  className="hover:text-[#F5EFE6] transition-colors"
                >
                  طلباتي ومتابعة السجل
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Confirmed Contact & Phase 1 Scope (No invented phone, hours, or email) */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5EFE6] pb-1 border-b border-white/10">
              التواصل ونطاق الخدمة
            </h4>
            <div className="space-y-2 text-xs text-[#D8C6AE]">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-[#C8AA78] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {SHOP_CONFIG.contactConfirmed}
                </span>
              </div>
              <div className="p-3 bg-[#1C1714] rounded-md border border-[#C8AA78]/20 space-y-1.5 text-[11px]">
                <div className="flex items-center gap-1.5 text-[#C8AA78] font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>تنويه المرحلة الأولى (Phase 1)</span>
                </div>
                <p className="text-[#D8C6AE]/75 font-normal leading-relaxed">
                  {SHOP_CONFIG.demoNotice}
                </p>
                <p className="text-[#C8AA78] font-medium pt-1 border-t border-white/5">
                  رسوم التوصيل: {SHOP_CONFIG.deliveryPricingNote}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#D8C6AE]/60">
          <p>© {new Date().getFullYear()} {SHOP_CONFIG.brandName} · الأردن</p>
          <p className="text-[11px] font-normal">
            المتجر في مرحلته التمهيدية الأولى
          </p>
        </div>
      </div>
    </footer>
  );
}
