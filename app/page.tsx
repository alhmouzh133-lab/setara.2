'use client';

import React, { useState, useEffect } from 'react';
import { CartProvider } from '@/lib/cart-context';
import { PRODUCTS, CATEGORIES } from '@/lib/shop-data';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import CategorySection from '@/components/CategorySection';
import ProductSection from '@/components/ProductSection';
import MadeToMeasureSection from '@/components/MadeToMeasureSection';
import Footer from '@/components/Footer';
import ProductModal from '@/components/ProductModal';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import CustomQuoteModal from '@/components/CustomQuoteModal';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Configure browser scroll restoration to prevent landing on old scroll positions
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // 2. Clear any stale internal section hash on initial entry/reload while preserving query params
    if (window.location.hash) {
      const cleanUrl = window.location.pathname + window.location.search;
      window.history.replaceState(window.history.state, '', cleanUrl);
    }

    // 3. Ensure viewport begins cleanly at the top hero section
    window.scrollTo(0, 0);
  }, []);

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-[#171513] text-[#F5EFE6]">
        {/* Navigation Top Bar */}
        <Header />

        {/* Main Content Sections */}
        <main className="flex-1">
          {/* 1. Hero Section (Cinematic warm dark aesthetic with curtain focal point) */}
          <HeroSection />

          {/* 2. Visual Category Cards (LUXINTERIORS inspired) */}
          <CategorySection
            categories={CATEGORIES}
            onSelectCategory={setSelectedCategory}
          />

          {/* 3. Ready-Made Curtains & Catalog */}
          <ProductSection
            products={PRODUCTS}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* 4. Made-to-Measure 3-Step Section & Craftsmanship */}
          <MadeToMeasureSection />
        </main>

        {/* 5. Minimal Configurable Footer */}
        <Footer />

        {/* Interactive Modals & Drawers */}
        <ProductModal />
        <CartDrawer />
        <CheckoutModal />
        <CustomQuoteModal />
      </div>
    </CartProvider>
  );
}
