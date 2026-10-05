'use client';

import React from 'react';
import Image from 'next/image';
import { Product, SHOP_CONFIG, getWhatsAppUrl } from '@/lib/shop-data';
import { useCart } from '@/lib/cart-context';
import { SlidersHorizontal, MessageCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { setOpenProductModal } = useCart();

  // Determine pricing display
  const isUnpriced = Boolean(product.isUnpriced);
  const fixedPrice = product.sizes && product.sizes.length > 0 ? product.sizes[0].price : null;

  return (
    <article
      onClick={() => setOpenProductModal(product)}
      className="group bg-[#FFFFFF] rounded-lg overflow-hidden border border-[#D8C6AE]/60 hover:border-[#8C6D3F] transition-all duration-300 flex flex-col justify-between cursor-pointer shadow-xs hover:shadow-md text-right"
    >
      <div>
        {/* Product Image Area with Consistent 4:3 Ratio */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EFE9DF]">
          <Image
            src={product.mainImage || product.images[0] || '/images/hero.jpg'}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-center group-hover:scale-103 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />

          {/* Category Tag */}
          <div className="absolute bottom-2.5 right-2.5">
            <span className="px-2 py-0.5 text-[11px] font-semibold text-[#171513] bg-[#FAF6F0]/95 rounded-xs shadow-2xs">
              {product.categoryName}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5">
          {/* Simplified Color Dots & Count */}
          <div className="flex items-center gap-1.5 mb-2.5">
            <div className="flex items-center gap-1">
              {product.colors.map((c) => (
                <span
                  key={c.id}
                  title={c.name}
                  className="w-3 h-3 rounded-full border border-black/20"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
            <span className="text-[11px] text-[#63574D]">
              {product.colors.length} ألوان
            </span>
          </div>

          {/* 1. Clearest Element: Product Name */}
          <h3 className="text-base sm:text-lg font-bold text-[#171513] group-hover:text-[#8C6D3F] transition-colors leading-snug">
            {product.name}
          </h3>

          {/* 2. Limited to Exactly 2 Lines Description */}
          <p className="mt-1.5 text-xs text-[#4A423A] line-clamp-2 leading-relaxed">
            {product.shortDesc}
          </p>

          {/* 3. Price Display */}
          <div className="mt-3.5 pt-3 border-t border-[#EFE9DF] flex items-baseline justify-between">
            <span className="text-xs text-[#63574D]">السعر:</span>
            {isUnpriced ? (
              <span className="text-xs sm:text-sm font-bold text-[#7C5E2D]">
                السعر عند الاستفسار
              </span>
            ) : (
              <div className="flex items-baseline gap-1 text-[#171513]">
                <span className="text-lg sm:text-xl font-extrabold tabular-nums text-[#171513]">
                  {fixedPrice}
                </span>
                <span className="text-xs font-bold text-[#8C6D3F]">
                  {SHOP_CONFIG.currencySymbol}
                </span>
                <span className="text-[10px] text-[#63574D] mr-1">/ للستارة</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Action Button */}
      <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1">
        {isUnpriced ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenProductModal(product);
            }}
            className="w-full py-2.5 px-4 rounded-md bg-[#1B382A] hover:bg-[#142B20] text-[#E2F7EB] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-[0.99]"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>استفسر عبر واتساب</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenProductModal(product);
            }}
            className="w-full py-2.5 px-4 rounded-md bg-[#211B17] hover:bg-[#8C6D3F] text-[#F5EFE6] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-[0.99]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#C8AA78]" />
            <span>تحديد المواصفات والطلب</span>
          </button>
        )}
      </div>
    </article>
  );
}
