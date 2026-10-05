'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SHOP_CONFIG, getWhatsAppUrl } from '@/lib/shop-data';
import { useCart } from '@/lib/cart-context';
import { ShoppingBag, Menu, X, Scissors, Layers, Home, MessageCircle } from 'lucide-react';

export default function Header() {
  const { totalItems, setIsCartOpen, setIsCustomQuoteOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      if (window.location.hash) {
        const cleanUrl = window.location.pathname + window.location.search;
        window.history.replaceState(window.history.state, '', cleanUrl);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled
          ? 'bg-[#171513]/95 backdrop-blur-md border-b border-[#C8AA78]/25 shadow-md shadow-black/25'
          : 'bg-[#171513]/90 backdrop-blur-sm border-b border-white/10'
      }`}
    >
      {/* Reduced balanced height: h-16 (64px) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand Logo Emblem (links to homepage, accessible name سيتارة) */}
        <div className="flex items-center">
          <Link
            href="/"
            onClick={handleScrollToTop}
            aria-label="سيتارة"
            className="group flex items-center focus:outline-none cursor-pointer"
          >
            <div className="relative h-11 w-11 sm:h-12 sm:w-12 shrink-0 rounded-full overflow-hidden shadow-xs ring-1 ring-white/10 group-hover:ring-[#C8AA78]/50 transition-all">
              <Image
                src="/images/setara-logo.png"
                alt="سيتارة"
                fill
                priority
                sizes="(max-width: 640px) 44px, 48px"
                className="object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </Link>
        </div>

        {/* Zone 2: Navigation Links (Text with hover underlines) */}
        <nav className="hidden md:flex items-center gap-7 text-xs sm:text-sm font-medium text-[#D8C6AE]">
          <button
            onClick={handleScrollToTop}
            className="hover:text-[#F5EFE6] transition-colors py-1 cursor-pointer"
          >
            الرئيسية
          </button>
          <button
            onClick={() => scrollToSection('ready-made-shop')}
            className="hover:text-[#F5EFE6] transition-colors py-1 cursor-pointer"
          >
            الستائر الجاهزة
          </button>
          <button
            onClick={() => scrollToSection('categories-section')}
            className="hover:text-[#F5EFE6] transition-colors py-1 cursor-pointer"
          >
            التصنيفات
          </button>
          <button
            onClick={() => setIsCustomQuoteOpen(true)}
            className="text-[#C8AA78] hover:text-[#d8be8f] transition-colors py-1 cursor-pointer font-semibold"
          >
            تفصيل حسب الطلب
          </button>
          <button
            onClick={() => scrollToSection('contact-footer')}
            className="hover:text-[#F5EFE6] transition-colors py-1 cursor-pointer"
          >
            عن المتجر
          </button>
        </nav>

        {/* Zone 3: Actions (Cart icon with badge & CTA button) */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <a
            href={getWhatsAppUrl('مرحباً متجر سيتارة، أود الاستفسار عن الستائر المتاحة لديكم.')}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="محادثة واتساب"
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 transition-all rounded-md shadow-xs whitespace-nowrap"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>واتساب</span>
          </a>

          <button
            onClick={() => setIsCustomQuoteOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#171513] bg-[#C8AA78] hover:bg-[#d8be8f] transition-all rounded-md shadow-xs whitespace-nowrap active:scale-[0.98]"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>طلب تفصيل</span>
          </button>

          {/* Cart Icon Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="سلة التسوق"
            className="relative p-2 rounded-md text-[#F5EFE6] hover:text-[#C8AA78] bg-[#211B17] hover:bg-[#2A231E] border border-white/10 transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-[#171513] bg-[#C8AA78] rounded-full tabular-nums shadow-xs">
                {totalItems}
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="القائمة"
            className="md:hidden p-2 rounded-md text-[#F5EFE6] hover:text-[#C8AA78] bg-[#211B17] border border-white/10 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1D1815] border-b border-[#C8AA78]/25 px-5 py-4 space-y-3 animate-in slide-in-from-top-1 duration-150">
          <div className="flex flex-col gap-2 text-sm font-medium text-[#F5EFE6]">
            <button
              onClick={() => handleScrollToTop()}
              className="flex items-center gap-2.5 py-2 text-right hover:text-[#C8AA78] transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4 text-[#C8AA78]" />
              <span>الرئيسية</span>
            </button>
            <button
              onClick={() => scrollToSection('categories-section')}
              className="flex items-center gap-2.5 py-2 text-right hover:text-[#C8AA78] transition-colors"
            >
              <Layers className="w-4 h-4 text-[#C8AA78]" />
              <span>أقسام الستائر</span>
            </button>
            <button
              onClick={() => scrollToSection('ready-made-shop')}
              className="flex items-center gap-2.5 py-2 text-right hover:text-[#C8AA78] transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-[#C8AA78]" />
              <span>الستائر الجاهزة</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsCustomQuoteOpen(true);
              }}
              className="flex items-center gap-2.5 py-2 text-right text-[#C8AA78] font-bold"
            >
              <Scissors className="w-4 h-4" />
              <span>تفصيل حسب الطلب (عرض سعر)</span>
            </button>
            <a
              href={getWhatsAppUrl('مرحباً متجر سيتارة، أود الاستفسار عن الستائر المتاحة لديكم.')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 py-2 text-right text-emerald-400 font-semibold"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>محادثة واتساب مباشرة (0798187000)</span>
            </a>
          </div>

          <div className="pt-2 border-t border-white/10">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsCustomQuoteOpen(true);
              }}
              className="w-full py-2.5 bg-[#C8AA78] text-[#171513] font-bold rounded-md text-xs text-center"
            >
              طلب تسعير تفصيل خاص
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
