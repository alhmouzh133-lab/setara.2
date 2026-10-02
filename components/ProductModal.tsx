'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ColorOption, Product, SHOP_CONFIG, SizeOption } from '@/lib/shop-data';
import { useCart } from '@/lib/cart-context';
import {
  X,
  Check,
  ShoppingBag,
  Sparkles,
  AlertCircle,
  Plus,
  Minus,
  Info,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface ProductModalContentProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, color: ColorOption, size: SizeOption, quantity: number) => void;
}

interface PendingTarget {
  reqId: number;
  url: string;
  color: ColorOption;
  thumbIndex: number;
}

function ProductModalContent({ product, onClose, onAddToCart }: ProductModalContentProps) {
  // Initial state: first color variant
  const initialColor = product.colors[0] || null;
  const initialImage = initialColor?.image || product.images[0];

  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(initialColor);
  const [selectedSize, setSelectedSize] = useState<SizeOption | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Stable Image Switcher State:
  // displayedImage is the currently committed, visible photograph.
  // When a new color/thumbnail is requested, displayedImage remains completely visible until the new one finishes decoding.
  const [displayedImage, setDisplayedImage] = useState<string>(initialImage);
  const [activeThumbnailIndex, setActiveThumbnailIndex] = useState<number>(0);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);
  const [pendingTarget, setPendingTarget] = useState<PendingTarget | null>(null);

  // Monotonic request ID counter to ensure only the LAST rapid selection resolves
  const requestIdRef = useRef<number>(0);

  // Gallery photographs genuinely belonging to the selected variant only
  const currentGallery = React.useMemo(() => {
    if (selectedColor?.gallery && selectedColor.gallery.length > 0) {
      return selectedColor.gallery;
    }
    if (selectedColor?.image) {
      return [selectedColor.image];
    }
    return product.images;
  }, [selectedColor, product.images]);

  // Handle color selection
  const handleSelectColor = (color: ColorOption) => {
    // 1. Clicking already selected color does not reload or reset gallery
    if (selectedColor?.id === color.id && displayedImage === color.image) {
      return;
    }

    setValidationError(null);
    setImageLoadError(false);

    // Preserve selectedSize if it is available in this product
    if (selectedSize && !product.sizes.some((s) => s.id === selectedSize.id)) {
      setSelectedSize(null);
    }

    const targetUrl = color.image;
    const reqId = ++requestIdRef.current;

    // Check if target image is already currently displayed
    if (targetUrl === displayedImage) {
      setSelectedColor(color);
      setActiveThumbnailIndex(0);
      setPendingTarget(null);
      setIsImageLoading(false);
      return;
    }

    // Keep the previous photograph 100% visible while the next loads and decodes
    setIsImageLoading(true);

    const newTarget: PendingTarget = {
      reqId,
      url: targetUrl,
      color,
      thumbIndex: 0,
    };
    setPendingTarget(newTarget);

    // Browser-side decoding check
    if (typeof window !== 'undefined') {
      const img = new window.Image();
      img.src = targetUrl;

      const commit = () => {
        if (requestIdRef.current === reqId) {
          setSelectedColor(color);
          setDisplayedImage(targetUrl);
          setActiveThumbnailIndex(0);
          setPendingTarget(null);
          setIsImageLoading(false);
          setImageLoadError(false);
        }
      };

      if ('decode' in img && typeof img.decode === 'function') {
        img
          .decode()
          .then(commit)
          .catch(() => {
            img.onload = commit;
            img.onerror = () => {
              if (requestIdRef.current === reqId) {
                setIsImageLoading(false);
                setImageLoadError(true);
                setPendingTarget(null);
              }
            };
          });
      } else {
        img.onload = commit;
        img.onerror = () => {
          if (requestIdRef.current === reqId) {
            setIsImageLoading(false);
            setImageLoadError(true);
            setPendingTarget(null);
          }
        };
      }
    } else {
      setSelectedColor(color);
      setDisplayedImage(targetUrl);
      setActiveThumbnailIndex(0);
      setPendingTarget(null);
      setIsImageLoading(false);
    }
  };

  // Handle individual thumbnail selection within the current variant's genuine gallery
  const handleSelectThumbnail = (imgUrl: string, index: number) => {
    if (displayedImage === imgUrl && activeThumbnailIndex === index) {
      return;
    }

    const reqId = ++requestIdRef.current;
    setIsImageLoading(true);
    setImageLoadError(false);

    if (selectedColor) {
      setPendingTarget({
        reqId,
        url: imgUrl,
        color: selectedColor,
        thumbIndex: index,
      });
    }

    if (typeof window !== 'undefined') {
      const img = new window.Image();
      img.src = imgUrl;

      const commitThumb = () => {
        if (requestIdRef.current === reqId) {
          setDisplayedImage(imgUrl);
          setActiveThumbnailIndex(index);
          setPendingTarget(null);
          setIsImageLoading(false);
        }
      };

      if ('decode' in img && typeof img.decode === 'function') {
        img.decode().then(commitThumb).catch(commitThumb);
      } else {
        img.onload = commitThumb;
        img.onerror = () => {
          if (requestIdRef.current === reqId) {
            setIsImageLoading(false);
            setImageLoadError(true);
            setPendingTarget(null);
          }
        };
      }
    } else {
      setDisplayedImage(imgUrl);
      setActiveThumbnailIndex(index);
      setPendingTarget(null);
      setIsImageLoading(false);
    }
  };

  const handlePendingLoaded = (reqId: number) => {
    if (requestIdRef.current === reqId && pendingTarget && pendingTarget.reqId === reqId) {
      setSelectedColor(pendingTarget.color);
      setDisplayedImage(pendingTarget.url);
      setActiveThumbnailIndex(pendingTarget.thumbIndex);
      setPendingTarget(null);
      setIsImageLoading(false);
      setImageLoadError(false);
    }
  };

  const handlePendingError = (reqId: number) => {
    if (requestIdRef.current === reqId) {
      setIsImageLoading(false);
      setImageLoadError(true);
      setPendingTarget(null);
    }
  };

  // Handle size selection (preserves selected color & image)
  const handleSelectSize = (size: SizeOption) => {
    setSelectedSize(size);
    setValidationError(null);
  };

  const currentUnitPrice = selectedSize ? selectedSize.price : null;
  const currentTotalPrice = currentUnitPrice ? currentUnitPrice * quantity : null;

  const handleAdd = () => {
    setValidationError(null);

    if (!selectedColor && !selectedSize) {
      setValidationError('يرجى تحديد اللون والمقاس المطلوبين قبل الإضافة إلى السلة.');
      return;
    }
    if (!selectedColor) {
      setValidationError('يرجى اختيار لون الستارة المناسب.');
      return;
    }
    if (!selectedSize) {
      setValidationError('يرجى اختيار مقاس الستارة المطلوب.');
      return;
    }

    onAddToCart(product, selectedColor, selectedSize, quantity);
    onClose();
  };

  const retryImageLoad = () => {
    setImageLoadError(false);
    if (selectedColor?.image) {
      handleSelectColor(selectedColor);
    }
  };

  return (
    <div
      className="relative w-full max-w-4xl bg-[#211B17] text-[#F5EFE6] border border-[#C8AA78]/30 rounded-xl shadow-2xl overflow-hidden my-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        aria-label="إغلاق"
        className="absolute top-4 left-4 z-30 p-2 rounded-full bg-[#171513]/80 hover:bg-[#171513] text-[#F5EFE6] hover:text-[#C8AA78] border border-white/10 transition-colors cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 max-h-[85vh] overflow-y-auto">
        {/* Gallery Column */}
        <div className="p-6 md:p-8 bg-[#1B1613] flex flex-col justify-between border-b md:border-b-0 md:border-l border-white/10">
          <div>
            {/* Primary Image View with Strict Dimensions & Stability */}
            <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-[#2A231E] border border-white/10 shadow-inner">
              {/* Main Visible Photograph (Keeps previous image visible without ever blanking) */}
              <Image
                src={displayedImage}
                alt={`${product.name} - ${selectedColor ? selectedColor.name : ''}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center select-none"
                priority
                referrerPolicy="no-referrer"
                onError={() => setImageLoadError(true)}
              />

              {/* Incoming Preload Layer: Loads Next.js optimized photo seamlessly while previous photo remains 100% visible beneath */}
              {pendingTarget && (
                <Image
                  key={`pending_${pendingTarget.reqId}_${pendingTarget.url}`}
                  src={pendingTarget.url}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center select-none opacity-0 pointer-events-none"
                  priority
                  referrerPolicy="no-referrer"
                  onLoad={() => handlePendingLoaded(pendingTarget.reqId)}
                  onError={() => handlePendingError(pendingTarget.reqId)}
                />
              )}

              {/* Discreet Loading Indicator in Corner without blanking */}
              {isImageLoading && (
                <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#171513]/85 text-[#C8AA78] text-[11px] backdrop-blur-xs border border-white/10 shadow-xs">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>جارٍ التحديث...</span>
                </div>
              )}

              {/* Explicit Color Badge */}
              <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5">
                <span className="px-2.5 py-0.5 text-[10px] font-semibold bg-[#171513]/85 text-[#F5EFE6] rounded-xs backdrop-blur-xs border border-white/10 shadow-xs flex items-center gap-1.5">
                  {selectedColor && (
                    <span
                      className="w-2 h-2 rounded-full border border-black/30"
                      style={{ backgroundColor: selectedColor.hex }}
                    />
                  )}
                  <span>
                    {selectedColor ? `معاينة: ${selectedColor.name}` : 'صورة تمثيلية للعرض'}
                  </span>
                </span>
              </div>

              {/* Graceful Error Handling Overlay if image fails to load */}
              {imageLoadError && (
                <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center">
                  <AlertCircle className="w-7 h-7 text-amber-400 mb-1.5" />
                  <p className="text-xs font-bold text-[#F5EFE6]">
                    تعذر تحميل صورة اللون المختار مؤقتاً
                  </p>
                  <p className="text-[11px] text-[#D8C6AE]/75 mt-0.5">
                    الخامة متاحة ومؤكدة بالمواصفات الموضحة
                  </p>
                  <button
                    type="button"
                    onClick={retryImageLoad}
                    className="mt-2.5 px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-[#C8AA78] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>إعادة المحاولة</span>
                  </button>
                </div>
              )}
            </div>

            {/* Stable Thumbnail Selector (Genuinely belongs to selected color) */}
            <div className="mt-4">
              <span className="text-[10px] text-[#D8C6AE]/70 block mb-1.5 font-medium">
                معرض لقطات {selectedColor ? selectedColor.name : 'المنتج'} ({currentGallery.length === 1 ? 'صورة واحدة' : `${currentGallery.length} لقطات`}):
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {currentGallery.map((img, idx) => {
                  const isActive = activeThumbnailIndex === idx && displayedImage === img;
                  return (
                    <button
                      key={`${selectedColor?.id || 'base'}_${img}_${idx}`}
                      type="button"
                      onClick={() => handleSelectThumbnail(img, idx)}
                      className={`relative w-14 h-14 rounded-md overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        isActive
                          ? 'border-[#C8AA78] scale-105 shadow-sm ring-1 ring-[#C8AA78]/30'
                          : 'border-white/10 opacity-75 hover:opacity-100 hover:border-white/30'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} لقطة ${idx + 1}`}
                        fill
                        sizes="56px"
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Fabric Specifications */}
          <div className="mt-6 pt-5 border-t border-white/10 space-y-2 text-xs text-[#D8C6AE]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C8AA78]" />
              <span className="font-semibold text-[#F5EFE6]">نوع القماش:</span>
              <span>{product.fabric}</span>
            </div>
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-[#C8AA78]" />
              <span className="font-semibold text-[#F5EFE6]">مستوى حجب الضوء:</span>
              <span>{product.lightBlocking}</span>
            </div>
          </div>
        </div>

        {/* Purchase Module & Variant Selection */}
        <div className="p-6 md:p-8 flex flex-col justify-between text-right">
          <div>
            {/* Category & Title */}
            <span className="text-xs uppercase tracking-wider text-[#C8AA78] font-bold block mb-1">
              {product.categoryName}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F5EFE6]">
              {product.name}
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-[#D8C6AE] leading-relaxed">
              {product.description}
            </p>

            {/* Dynamic Live Price Display */}
            <div className="mt-4 p-3.5 bg-[#171513] rounded-lg border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#D8C6AE]/70 block">
                  {selectedSize ? 'سعر المقاس المختار:' : 'سعر الستارة:'}
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  {currentUnitPrice ? (
                    <>
                      <span className="text-2xl font-bold text-[#C8AA78] tabular-nums">
                        {currentUnitPrice}
                      </span>
                      <span className="text-xs text-[#D8C6AE]">{SHOP_CONFIG.currencySymbol}</span>
                      {quantity > 1 && (
                        <span className="text-xs text-[#D8C6AE]/70 mr-2 tabular-nums">
                          (الإجمالي: {currentTotalPrice} {SHOP_CONFIG.currencySymbol})
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-[#D8C6AE]/80 font-medium">
                      اختر المقاس لعرض السعر الدقيق
                    </span>
                  )}
                </div>
              </div>

              <span className="text-[11px] text-[#D8C6AE]/60">
                جاهزة للتعليق
              </span>
            </div>

            {/* 1. REQUIRED Color Selection (Preserves size and quantity) */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#F5EFE6] flex items-center gap-1.5">
                  <span>1. اختر اللون</span>
                  <span className="text-red-400">*</span>
                </label>
                <span className="text-xs text-[#C8AA78] font-semibold">
                  {selectedColor ? selectedColor.name : 'لم يتم الاختيار'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => {
                  const isSelected = selectedColor?.id === color.id;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => handleSelectColor(color)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#2E251F] border-[#C8AA78] text-[#F5EFE6] shadow-sm'
                          : 'bg-[#171513] border-white/10 text-[#D8C6AE] hover:border-white/30'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/30 shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#C8AA78]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. REQUIRED Size Variant Selection (Retains Selected Color & Image) */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#F5EFE6] flex items-center gap-1.5">
                  <span>2. اختر المقاس</span>
                  <span className="text-red-400">*</span>
                </label>
                <span className="text-xs text-[#C8AA78] font-semibold">
                  {selectedSize ? `${selectedSize.label} (${selectedSize.price} ${SHOP_CONFIG.currencySymbol})` : 'لم يتم الاختيار'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize?.id === size.id;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => handleSelectSize(size)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-right transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#2E251F] border-[#C8AA78] text-[#F5EFE6] shadow-sm'
                          : 'bg-[#171513] border-white/10 text-[#D8C6AE] hover:border-white/30'
                      }`}
                    >
                      <span className="text-xs font-bold">{size.label}</span>
                      <span className="text-xs font-semibold text-[#C8AA78] mt-0.5 tabular-nums">
                        {size.price} {SHOP_CONFIG.currencySymbol}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Quantity Counter */}
            <div className="mt-5 flex items-center justify-between">
              <label className="text-xs font-bold text-[#F5EFE6]">
                الكمية (عدد القطع)
              </label>
              <div className="flex items-center gap-3 bg-[#171513] border border-white/10 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-7 h-7 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 text-[#F5EFE6] transition-colors cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-bold tabular-nums text-[#F5EFE6]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                  className="w-7 h-7 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-[#F5EFE6] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Validation Error Message */}
            {validationError && (
              <div className="mt-4 p-3 bg-red-950/40 border border-red-800/60 rounded-lg flex items-center gap-2.5 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{validationError}</span>
              </div>
            )}
          </div>

          {/* Modal Bottom CTA */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={handleAdd}
              className="w-full py-3.5 px-6 rounded-lg bg-[#C8AA78] hover:bg-[#d5ba8c] text-[#171513] font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>
                {currentUnitPrice
                  ? `إضافة إلى السلة · ${currentTotalPrice} ${SHOP_CONFIG.currencySymbol}`
                  : 'حدد اللون والمقاس للإضافة'}
              </span>
            </button>
            <p className="text-[11px] text-center text-[#D8C6AE]/60 mt-1.5">
              {SHOP_CONFIG.deliveryPricingNote}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductModal() {
  const { openProductModal, setOpenProductModal, addItem } = useCart();
  const product = openProductModal;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenProductModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setOpenProductModal]);

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <ProductModalContent
        key={product.id}
        product={product}
        onClose={() => setOpenProductModal(null)}
        onAddToCart={addItem}
      />
    </div>
  );
}
