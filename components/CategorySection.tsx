'use client';

import React from 'react';
import Image from 'next/image';
import { CATEGORIES, CategoryInfo } from '@/lib/shop-data';
import { ArrowLeft } from 'lucide-react';

interface CategorySectionProps {
  onSelectCategory: (category: 'all' | 'sheer' | 'blackout' | 'roller') => void;
}

export default function CategorySection({ onSelectCategory }: CategorySectionProps) {
  const handleCategoryClick = (id: CategoryInfo['id']) => {
    onSelectCategory(id);
    const shopEl = document.getElementById('ready-made-shop');
    if (shopEl) {
      shopEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="categories-section" className="w-full py-14 sm:py-20 bg-[#171513] border-b border-white/5 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-5">
          <div className="text-right">
            <span className="text-xs uppercase tracking-widest text-[#C8AA78] font-bold block mb-1.5">
              تشكيلاتنا الرئيسية
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F5EFE6] tracking-tight">
              أقسام الستائر المعاصرة
            </h2>
            <p className="mt-2 text-[#D8C6AE] text-xs sm:text-sm font-normal max-w-xl leading-relaxed">
              حلول عملية وجمالية صُممت للتحكم في الضوء والخصوصية بمختلف غرف المنزل.
            </p>
          </div>

          <button
            onClick={() => {
              onSelectCategory('all');
              const shopEl = document.getElementById('ready-made-shop');
              if (shopEl) shopEl.scrollIntoView({ behavior: 'smooth' });
            }}
            className="self-start md:self-end text-xs sm:text-sm text-[#C8AA78] hover:text-[#d5ba8c] font-medium flex items-center gap-1.5 transition-colors cursor-pointer group"
          >
            <span>استعراض كافة المنتجات</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 3 Visual Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className="group relative bg-[#211B17] rounded-lg overflow-hidden border border-white/10 hover:border-[#C8AA78]/50 transition-all duration-300 flex flex-col cursor-pointer shadow-xs hover:shadow-lg"
            >
              {/* Image Container with 4:3 Aspect Ratio */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#2A231E]">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-center group-hover:scale-103 transition-transform duration-500 filter brightness-95 group-hover:brightness-100"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#211B17] via-[#211B17]/20 to-transparent" />
              </div>

              {/* Text Information */}
              <div className="p-5 text-right flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#F5EFE6] group-hover:text-[#C8AA78] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#C8AA78] mt-0.5 font-medium">
                    {cat.subtitle}
                  </p>
                  <p className="text-xs text-[#E2D6C5] mt-2 font-normal leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#F5EFE6] font-medium">
                  <span className="group-hover:text-[#C8AA78] transition-colors">تصفّح التشكيلة</span>
                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[#C8AA78] group-hover:bg-[#C8AA78] group-hover:text-[#171513] transition-all">
                    <ArrowLeft className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
