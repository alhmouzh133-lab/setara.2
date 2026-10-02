'use client';

import React from 'react';
import { PRODUCTS, SHOP_CONFIG } from '@/lib/shop-data';
import ProductCard from './ProductCard';
import { CheckCircle2 } from 'lucide-react';

interface ProductSectionProps {
  selectedCategory: 'all' | 'sheer' | 'blackout' | 'roller';
  onSelectCategory: (category: 'all' | 'sheer' | 'blackout' | 'roller') => void;
}

export default function ProductSection({
  selectedCategory,
  onSelectCategory,
}: ProductSectionProps) {
  const filteredProducts =
    selectedCategory === 'all'
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === selectedCategory);

  return (
    <section
      id="ready-made-shop"
      className="w-full py-14 sm:py-20 bg-[#FAF6F0] text-[#171513] transition-colors scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-right max-w-3xl mb-8">
          <span className="text-xs uppercase tracking-widest text-[#7C5E2D] font-bold block mb-1.5">
            مجموعة الستائر الجاهزة
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#171513] tracking-tight">
            ستائر مصممة بمقاسات معيارية
          </h2>
          <p className="mt-2 text-[#3D352E] text-xs sm:text-sm font-normal leading-relaxed">
            استعرض التشكيلة أدناه؛ اختر الموديل لتحديد المقاس واللون المناسبين ومعرفة السعر الدقيق بالدينار الأردني.
          </p>
        </div>

        {/* Strengthened Contrast Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-[#D8C6AE]/70">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#EAE0D2] rounded-lg border border-[#D8C6AE]">
            <button
              onClick={() => onSelectCategory('all')}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#171513] text-[#F5EFE6] font-bold shadow-xs border border-[#C8AA78]'
                  : 'text-[#241E1A] hover:text-[#000000] hover:bg-[#DDD0C0]'
              }`}
            >
              جميع الستائر ({PRODUCTS.length})
            </button>
            <button
              onClick={() => onSelectCategory('sheer')}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all cursor-pointer ${
                selectedCategory === 'sheer'
                  ? 'bg-[#171513] text-[#F5EFE6] font-bold shadow-xs border border-[#C8AA78]'
                  : 'text-[#241E1A] hover:text-[#000000] hover:bg-[#DDD0C0]'
              }`}
            >
              ستائر شفافة (3)
            </button>
            <button
              onClick={() => onSelectCategory('blackout')}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all cursor-pointer ${
                selectedCategory === 'blackout'
                  ? 'bg-[#171513] text-[#F5EFE6] font-bold shadow-xs border border-[#C8AA78]'
                  : 'text-[#241E1A] hover:text-[#000000] hover:bg-[#DDD0C0]'
              }`}
            >
              ستائر تعتيم (3)
            </button>
            <button
              onClick={() => onSelectCategory('roller')}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all cursor-pointer ${
                selectedCategory === 'roller'
                  ? 'bg-[#171513] text-[#F5EFE6] font-bold shadow-xs border border-[#C8AA78]'
                  : 'text-[#241E1A] hover:text-[#000000] hover:bg-[#DDD0C0]'
              }`}
            >
              ستائر رول (2)
            </button>
          </div>

          <div className="text-xs font-medium text-[#3D352E] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#7C5E2D]" />
            <span>الأسعار بالدينار الأردني ({SHOP_CONFIG.currencySymbol}) تشمل حياكة الحاشية</span>
          </div>
        </div>

        {/* Product Cards Grid: 1 col on small mobile, 2 col on tablet, 4 col on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Custom Order Callout Strip */}
        <div className="mt-12 p-6 sm:p-8 bg-[#EAE0D2] border border-[#D8C6AE] rounded-xl flex flex-col md:flex-row items-center justify-between gap-5 text-right">
          <div>
            <h4 className="text-base sm:text-lg font-bold text-[#171513]">
              هل تحتاج إلى مقاس خاص بنافذتك؟
            </h4>
            <p className="mt-1 text-xs sm:text-sm text-[#3D352E] font-normal leading-relaxed">
              يمكنك طلب تفصيل ستارة مخصصة باختيار الخامة والأبعاد بالسنتيمتر لنقوم بدراسة الطلب وتأكيد السعر المناسب.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('made-to-measure-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-5 py-2.5 bg-[#171513] hover:bg-[#2A231E] text-[#F5EFE6] text-xs sm:text-sm font-bold rounded-md whitespace-nowrap shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            طلب تفصيل مخصص
          </button>
        </div>
      </div>
    </section>
  );
}
