'use client';

import React from 'react';
import Image from 'next/image';
import { useCart } from '@/lib/cart-context';
import { Scissors } from 'lucide-react';

export default function MadeToMeasureSection() {
  const { setIsCustomQuoteOpen } = useCart();

  return (
    <section
      id="made-to-measure-section"
      className="w-full py-14 sm:py-20 bg-[#1B1613] text-[#F5EFE6] border-t border-b border-white/5 relative overflow-hidden scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Right Column: Visual Craftsmanship Showcase */}
          <div className="lg:col-span-5 order-2 lg:order-1 text-right">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-[#C8AA78]/30 shadow-lg bg-[#211B17]">
              <Image
                src="/images/craft_textures.jpg"
                alt="أقمشة ستائر فاخرة بتطريزات وملمس ناعم للتفصيل المخصص"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-center filter brightness-95 hover:scale-103 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1B1613] via-transparent to-transparent" />

              <div className="absolute bottom-3 right-3 left-3 p-3.5 rounded-md bg-[#171513]/90 backdrop-blur-xs border border-white/10 text-right">
                <span className="text-[11px] text-[#C8AA78] font-bold block mb-0.5">
                  تفصيل متقن بالأبعاد المحددة
                </span>
                <p className="text-xs text-[#D8C6AE] font-normal leading-relaxed">
                  تُقص الأقمشة وتُحاك بحواشي متوازنة تناسب مقاس نافذتك بدقة.
                </p>
              </div>
            </div>
          </div>

          {/* Left Column: 3 Clear Steps & Action */}
          <div className="lg:col-span-7 order-1 lg:order-2 text-right space-y-5">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#C8AA78] font-bold block mb-1.5">
                خدمة التفصيل حسب الطلب
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F5EFE6] tracking-tight">
                ستائر بمقاسات مساحتك الدقيقة
              </h2>
              <p className="mt-2 text-[#D8C6AE] text-xs sm:text-sm font-normal leading-relaxed max-w-xl">
                إذا كانت نوافذك تتطلب ارتفاعات خاصة أو أقمشة محددة، نوفر خدمة التفصيل بثلاث خطوات واضحة:
              </p>
            </div>

            {/* The 3 Ordered Steps */}
            <div className="space-y-3 pt-1">
              {/* Step 1 */}
              <div className="p-3.5 rounded-lg bg-[#211B17] border border-white/10 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-md bg-[#C8AA78]/15 border border-[#C8AA78]/30 flex items-center justify-center text-[#C8AA78] shrink-0 font-bold text-xs">
                  01
                </div>
                <div className="text-right">
                  <h4 className="text-sm font-bold text-[#F5EFE6]">
                    حدد المواصفات واللون
                  </h4>
                  <p className="text-xs text-[#E2D6C5] font-normal mt-0.5 leading-relaxed">
                    اكتب يدوياً نوع الموديل، خامة القماش، والدرجة اللونية المطلوبة بدقة.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-lg bg-[#211B17] border border-white/10 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-md bg-[#C8AA78]/15 border border-[#C8AA78]/30 flex items-center justify-center text-[#C8AA78] shrink-0 font-bold text-xs">
                  02
                </div>
                <div className="text-right">
                  <h4 className="text-sm font-bold text-[#F5EFE6]">
                    زوّدنا بالمقاسات
                  </h4>
                  <p className="text-xs text-[#E2D6C5] font-normal mt-0.5 leading-relaxed">
                    أدخل العرض والارتفاع بالسنتيمتر وعدد النوافذ عبر نموذج التسعير.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-lg bg-[#211B17] border border-white/10 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-md bg-[#C8AA78]/15 border border-[#C8AA78]/30 flex items-center justify-center text-[#C8AA78] shrink-0 font-bold text-xs">
                  03
                </div>
                <div className="text-right">
                  <h4 className="text-sm font-bold text-[#F5EFE6]">
                    استلم عرض السعر المؤكد
                  </h4>
                  <p className="text-xs text-[#E2D6C5] font-normal mt-0.5 leading-relaxed">
                    يراجع المحل الأبعاد والخامة ويؤكد معك التكلفة الإجمالية والمدة المتوقعة.
                  </p>
                </div>
              </div>
            </div>

            {/* Note & CTA Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                type="button"
                onClick={() => setIsCustomQuoteOpen(true)}
                className="px-6 py-3 rounded-md bg-[#C8AA78] hover:bg-[#d5ba8c] text-[#171513] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Scissors className="w-4 h-4" />
                <span>طلب تسعير تفصيل</span>
              </button>

              <span className="text-xs text-[#D8C6AE]/75 text-center sm:text-right font-normal">
                دراسة المقاسات وتأكيد عرض السعر مجاناً
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
