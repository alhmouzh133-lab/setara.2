'use client';

import React from 'react';
import Image from 'next/image';
import { SHOP_CONFIG, getWhatsAppUrl } from '@/lib/shop-data';
import { useCart } from '@/lib/cart-context';
import {
  MapPin,
  MessageSquare,
  AlertCircle,
  MessageCircle,
  ExternalLink,
  Facebook,
  Instagram,
  ArrowUpLeft,
} from 'lucide-react';

export default function Footer() {
  const { setIsCustomQuoteOpen } = useCart();

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
    <footer
      id="contact-footer"
      className="w-full bg-[#12100E] text-[#D8C6AE] border-t border-[#C8AA78]/20 pt-14 pb-9 scroll-mt-20 selection:bg-[#C8AA78]/30 selection:text-[#F5EFE6]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 text-right">
          
          {/* Column 1: Brand Identity, About & Location (5 cols on md/lg) */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Brand Header: Logo + Title */}
              <div className="flex items-center gap-3.5">
                <div className="relative h-13 w-13 shrink-0 rounded-full overflow-hidden bg-[#1C1714] ring-1 ring-[#C8AA78]/30 shadow-md">
                  <Image
                    src="/images/setara-logo.png"
                    alt="سيتارة"
                    fill
                    sizes="52px"
                    className="object-contain p-1"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#F5EFE6] tracking-tight">
                    {SHOP_CONFIG.brandName}
                  </h3>
                  <span className="text-[11px] font-medium text-[#C8AA78] block">
                    {SHOP_CONFIG.brandTagline}
                  </span>
                </div>
              </div>

              {/* Brand Description */}
              <p className="text-xs sm:text-sm text-[#D8C6AE]/85 font-normal leading-relaxed max-w-sm">
                متجر متخصص في ستائر النوافذ الجاهزة والتفصيل المخصص في الأردن.
              </p>

              {/* Confirmed Location Link */}
              <div className="pt-1">
                <a
                  href={SHOP_CONFIG.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#1B1613] hover:bg-[#231D18] border border-[#C8AA78]/25 hover:border-[#C8AA78]/50 text-xs text-[#C8AA78] hover:text-[#F5EFE6] transition-all duration-200 group shadow-2xs"
                  title="عرض موقع المتجر على خرائط جوجل — عمان شارع الحرية"
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-[#C8AA78] group-hover:scale-110 transition-transform" />
                  <span className="font-semibold underline underline-offset-4 decoration-[#C8AA78]/40 group-hover:decoration-[#C8AA78]">
                    {SHOP_CONFIG.locationConfirmed}
                  </span>
                  <ExternalLink className="w-3 h-3 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>
            </div>

            {/* Social Media Circular Icons */}
            <div className="pt-2 border-t border-white/5">
              <span className="text-[11px] font-semibold text-[#F5EFE6]/90 block mb-2.5">
                تابعنا على وسائل التواصل:
              </span>
              <div className="flex items-center gap-2.5">
                {/* Facebook Circular Icon */}
                <a
                  href={SHOP_CONFIG.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="صفحة فيسبوك سيتارة"
                  className="w-9 h-9 rounded-full bg-[#1C1714] border border-[#C8AA78]/30 hover:border-[#C8AA78] text-[#C8AA78] hover:text-[#F5EFE6] hover:bg-[#C8AA78]/15 flex items-center justify-center transition-all duration-300 shadow-2xs hover:shadow-md hover:scale-105 cursor-pointer"
                  title="صفحة فيسبوك سيتارة"
                >
                  <Facebook className="w-4 h-4 transition-transform duration-300" />
                </a>

                {/* Instagram Circular Icon */}
                <a
                  href={SHOP_CONFIG.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="حساب إنستغرام سيتارة"
                  className="w-9 h-9 rounded-full bg-[#1C1714] border border-[#C8AA78]/30 hover:border-[#C8AA78] text-[#C8AA78] hover:text-[#F5EFE6] hover:bg-[#C8AA78]/15 flex items-center justify-center transition-all duration-300 shadow-2xs hover:shadow-md hover:scale-105 cursor-pointer"
                  title="حساب إنستغرام سيتارة"
                >
                  <Instagram className="w-4 h-4 transition-transform duration-300" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Navigation Links (3 cols on md/lg) */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5EFE6] pb-2 border-b border-[#C8AA78]/20 flex items-center justify-between">
              <span>أقسام الموقع</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C8AA78]" />
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <button
                  type="button"
                  onClick={handleScrollToTop}
                  className="w-full text-right py-1 text-[#D8C6AE]/85 hover:text-[#F5EFE6] hover:translate-x-[-3px] transition-all duration-200 cursor-pointer flex items-center justify-between group"
                >
                  <span>الرئيسية</span>
                  <ArrowUpLeft className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[#C8AA78] transition-opacity" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('categories-section')}
                  className="w-full text-right py-1 text-[#D8C6AE]/85 hover:text-[#F5EFE6] hover:translate-x-[-3px] transition-all duration-200 cursor-pointer flex items-center justify-between group"
                >
                  <span>أقسام وتصنيفات الستائر</span>
                  <ArrowUpLeft className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[#C8AA78] transition-opacity" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('ready-made-shop')}
                  className="w-full text-right py-1 text-[#D8C6AE]/85 hover:text-[#F5EFE6] hover:translate-x-[-3px] transition-all duration-200 cursor-pointer flex items-center justify-between group"
                >
                  <span>الستائر الجاهزة</span>
                  <ArrowUpLeft className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[#C8AA78] transition-opacity" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsCustomQuoteOpen(true)}
                  className="w-full text-right py-1 text-[#C8AA78] hover:text-[#F5EFE6] hover:translate-x-[-3px] transition-all duration-200 font-semibold cursor-pointer flex items-center justify-between group"
                >
                  <span>طلب تسعير تفصيل خاص</span>
                  <ArrowUpLeft className="w-3 h-3 opacity-70 group-hover:opacity-100 text-[#C8AA78] transition-opacity" />
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Service Scope (4 cols on md/lg) */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5EFE6] pb-2 border-b border-[#C8AA78]/20 flex items-center justify-between">
              <span>التواصل ونطاق الخدمة</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C8AA78]" />
            </h4>
            
            <div className="space-y-3.5 text-xs text-[#D8C6AE]">
              {/* Contact Notice */}
              <div className="flex items-start gap-2.5 leading-relaxed text-[#D8C6AE]/90">
                <MessageSquare className="w-3.5 h-3.5 text-[#C8AA78] shrink-0 mt-0.5" />
                <span>{SHOP_CONFIG.contactConfirmed}</span>
              </div>

              {/* Direct WhatsApp Action Link */}
              <div>
                <a
                  href={getWhatsAppUrl('مرحباً متجر سيتارة، أود الاستفسار عن الستائر المتاحة لديكم.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/35 hover:border-emerald-500/60 text-emerald-300 text-xs font-semibold transition-all duration-200 shadow-2xs hover:shadow-xs group cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="truncate">محادثة واتساب: 0798187000 (962798187000+)</span>
                </a>
              </div>

              {/* Phase 1 Notice Box */}
              <div className="p-3.5 bg-[#171311] rounded-lg border border-[#C8AA78]/20 space-y-1.5 text-[11px] shadow-inner">
                <div className="flex items-center gap-1.5 text-[#C8AA78] font-bold">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>تنويه المرحلة الأولى (Phase 1)</span>
                </div>
                <p className="text-[#D8C6AE]/75 font-normal leading-relaxed">
                  {SHOP_CONFIG.demoNotice}
                </p>
                <p className="text-[#C8AA78] font-medium pt-1.5 border-t border-white/5">
                  رسوم التوصيل: {SHOP_CONFIG.deliveryPricingNote}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright */}
        <div className="mt-12 pt-6 border-t border-white/10 flex items-center justify-center sm:justify-start text-xs text-[#D8C6AE]/65">
          <p className="font-normal text-center sm:text-right">
            © {new Date().getFullYear()} {SHOP_CONFIG.brandName} · الأردن
          </p>
        </div>
      </div>
    </footer>
  );
}
