'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { useCart } from '@/lib/cart-context';
import {
  ArrowDown,
  Scissors,
  ShoppingBag,
  Sparkles,
  Pause,
  Play,
} from 'lucide-react';

export default function HeroSection() {
  const { setIsCustomQuoteOpen } = useCart();
  const prefersReducedMotion = useReducedMotion();

  // User explicit toggle state (null means inherit from prefersReducedMotion)
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const [isOffScreen, setIsOffScreen] = useState<boolean>(false);
  const [isTabHidden, setIsTabHidden] = useState<boolean>(false);

  // Effective paused state: respects user toggle, OS preference, viewport visibility, and tab focus
  const isPaused =
    (userPaused !== null ? userPaused : Boolean(prefersReducedMotion)) ||
    isOffScreen ||
    isTabHidden;

  const heroRef = useRef<HTMLElement>(null);

  // Viewport Intersection & Document Visibility
  useEffect(() => {
    const currentHero = heroRef.current;
    if (!currentHero) return;

    // 1. Intersection Observer: pauses image animation when hero is offscreen
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsOffScreen(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(currentHero);

    // 2. Visibility change: pauses animation when tab is inactive
    const handleVisibilityChange = () => {
      setIsTabHidden(document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Toggle Pause / Resume
  const togglePlayPause = () => {
    setUserPaused((prev) => {
      const current = prev !== null ? prev : Boolean(prefersReducedMotion);
      return !current;
    });
  };

  const scrollToShop = () => {
    const el = document.getElementById('ready-made-shop');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={heroRef}
      className="relative w-full min-h-[78vh] sm:min-h-[82vh] flex items-center justify-center overflow-hidden bg-[#171513]"
    >
      {/* Background Visual Layer: Fixed frame clipping, forward-only slow zoom-in with 2-layer crossfade */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {prefersReducedMotion ? (
          /* Static image for users with reduced-motion preferences */
          <div className="relative w-full h-full">
            <Image
              src="/images/hero.jpg"
              alt="ستائر فاخرة ممتدة من السقف إلى الأرض في غرفة معيشة راقية"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center filter brightness-90"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          /* Continuous forward-only zoom-in: Layer 1 and Layer 2 crossfade over 2.5s, each zooming scale 1.00 -> 1.036 over 36s */
          <div className="relative w-full h-full">
            {/* Layer 1 */}
            <div
              className="hero-zoom-layer-1 absolute inset-0 w-full h-full"
              style={{
                animationPlayState: isPaused ? 'paused' : 'running',
              }}
            >
              <Image
                src="/images/hero.jpg"
                alt="ستائر فاخرة ممتدة من السقف إلى الأرض في غرفة معيشة راقية"
                fill
                priority
                sizes="100vw"
                className="object-cover object-center filter brightness-90"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Layer 2 (Identical overlapping image with 33.5s phase offset) */}
            <div
              className="hero-zoom-layer-2 absolute inset-0 w-full h-full"
              style={{
                animationPlayState: isPaused ? 'paused' : 'running',
              }}
            >
              <Image
                src="/images/hero.jpg"
                alt="ستائر فاخرة ممتدة من السقف إلى الأرض في غرفة معيشة راقية"
                fill
                priority
                sizes="100vw"
                className="object-cover object-center filter brightness-90"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        )}

        {/* High-Contrast Legibility Scrims (Stationary) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#171513] via-[#171513]/75 to-[#171513]/40 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#171513]/95 via-[#171513]/60 to-transparent rtl:bg-gradient-to-l pointer-events-none" />
      </div>

      {/* Hero Foreground Content: Headline, Description & Buttons (Stationary container) */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-right">
        {/* Subtle Kicker (<=8px upward entrance, runs once) */}
        <motion.div
          initial={!prefersReducedMotion ? { opacity: 0, y: 6 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-[#C8AA78]/15 border border-[#C8AA78]/30 text-[#C8AA78] text-xs font-medium mb-5 backdrop-blur-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>سيتارة · الأردن</span>
        </motion.div>

        {/* Primary Headline (<=8px upward entrance, runs once) */}
        <motion.h1
          initial={!prefersReducedMotion ? { opacity: 0, y: 8 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: 'easeOut' }}
          className="text-3xl sm:text-5xl md:text-6xl font-bold text-[#F5EFE6] leading-[1.2] tracking-tight max-w-3xl text-balance"
        >
          تفاصيل تُكمّل <br className="hidden sm:inline" />
          <span className="text-[#C8AA78] font-extrabold">جمال بيتك</span>
        </motion.h1>

        {/* Supporting Copy (<=8px upward entrance, runs once) */}
        <motion.p
          initial={!prefersReducedMotion ? { opacity: 0, y: 8 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16, ease: 'easeOut' }}
          className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg text-[#E2D6C5] max-w-2xl font-normal leading-relaxed"
        >
          اكتشف الستائر الجاهزة، أو اختر تفصيلًا يناسب مساحتك.
        </motion.p>

        {/* Action Buttons (<=8px upward entrance, runs once, restrained hover) */}
        <motion.div
          initial={!prefersReducedMotion ? { opacity: 0, y: 8 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.24, ease: 'easeOut' }}
          className="mt-8 flex flex-wrap items-center gap-3.5 sm:gap-4"
        >
          <button
            onClick={scrollToShop}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-[#C8AA78] hover:bg-[#d5ba8c] text-[#171513] text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>تسوّق الستائر</span>
          </button>

          <button
            onClick={() => setIsCustomQuoteOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-[#211B17]/90 hover:bg-[#2A231E] border border-[#C8AA78]/40 hover:border-[#C8AA78] text-[#F5EFE6] text-xs sm:text-sm font-medium transition-colors backdrop-blur-xs cursor-pointer"
          >
            <Scissors className="w-4 h-4 text-[#C8AA78]" />
            <span>اطلب تفصيل</span>
          </button>
        </motion.div>

        {/* Confirmed Details Strip */}
        <motion.div
          initial={!prefersReducedMotion ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.32, ease: 'easeOut' }}
          className="mt-12 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-[#D8C6AE] max-w-3xl"
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C8AA78]" />
            <span>خامات كتان ومخمل وشيفون</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C8AA78]" />
            <span>تحديد المقاسات بالسنتيمتر</span>
          </div>
          <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C8AA78]" />
            <span>تأكيد عروض الأسعار مباشرة</span>
          </div>
        </motion.div>
      </div>

      {/* Accessible Motion Pause / Resume Control */}
      <div className="absolute bottom-4 left-4 sm:left-6 z-20">
        <button
          type="button"
          onClick={togglePlayPause}
          aria-label={isPaused ? 'تشغيل حركة الخلفية الهادئة' : 'إيقاف حركة الخلفية الهادئة'}
          title={isPaused ? 'تشغيل الحركة' : 'إيقاف الحركة'}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#171513]/80 hover:bg-[#171513] text-[#D8C6AE] hover:text-[#C8AA78] border border-white/10 backdrop-blur-xs transition-colors text-[11px] cursor-pointer"
        >
          {isPaused ? (
            <>
              <Play className="w-3.5 h-3.5 text-[#C8AA78]" />
              <span className="hidden sm:inline">تشغيل الحركة</span>
            </>
          ) : (
            <>
              <Pause className="w-3.5 h-3.5 text-[#C8AA78]" />
              <span className="hidden sm:inline">إيقاف الحركة</span>
            </>
          )}
        </button>
      </div>

      {/* Down indicator */}
      <button
        onClick={scrollToShop}
        aria-label="الانتقال إلى المعروضات"
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-[#D8C6AE]/60 hover:text-[#C8AA78] transition-colors p-2 cursor-pointer"
      >
        <ArrowDown className="w-4 h-4 animate-bounce" />
      </button>
    </section>
  );
}
