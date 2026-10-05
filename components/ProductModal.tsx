'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import {
  ColorOption,
  FabricOption,
  Product,
  SHOP_CONFIG,
  SizeOption,
  CENTRAL_FABRICS,
  CENTRAL_COLORS,
  resolveCurtainImage,
  getWhatsAppUrl,
} from '@/lib/shop-data';
import { useCart } from '@/lib/cart-context';
import {
  X,
  Check,
  ShoppingBag,
  AlertCircle,
  Plus,
  Minus,
  MessageCircle,
  ExternalLink,
  Ruler,
  Layers,
} from 'lucide-react';

interface ProductModalContentProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    color: ColorOption,
    size: SizeOption,
    quantity: number,
    options?: {
      curtainType?: string;
      curtainTypeName?: string;
      fabricId?: string;
      fabricName?: string;
      curtainStyle?: string;
      liningOption?: string;
      resolvedImage?: string;
    }
  ) => void;
}

function ProductModalContent({ product, onClose, onAddToCart }: ProductModalContentProps) {
  const isElectricProduct = product.id === 'curtain-electric' || product.curtainType === 'electric';

  // 1. Curtain Type Selection (electric / manual / roller)
  // Electric product is fixed to 'electric' and cannot be switched
  const [curtainType, setCurtainType] = useState<'electric' | 'manual' | 'roller'>(
    isElectricProduct ? 'electric' : (product.curtainType as any) || (product.category === 'roller' ? 'roller' : 'electric')
  );

  // Available fabric choices: Electric product uses ELECTRIC_FABRICS (with "لينين"), others use CENTRAL_FABRICS
  const availableFabrics = useMemo(() => {
    return product.fabricOptions || CENTRAL_FABRICS;
  }, [product.fabricOptions]);

  // 2. Central Fabric Selection
  const initialFabricId = useMemo(() => {
    if (product.defaultFabricId) return product.defaultFabricId;
    if (product.slug.includes('zebra')) return 'zebra';
    if (product.slug.includes('screen')) return 'screen';
    if (product.slug.includes('blackout')) return 'blackout';
    return 'linen';
  }, [product]);

  const [fabricId, setFabricId] = useState<string>(initialFabricId);

  // 3. Color Selection
  const [selectedColor, setSelectedColor] = useState<ColorOption>(
    CENTRAL_COLORS[0]
  );

  // 4. Style & Lining (for electric and manual curtains)
  const [selectedStyle, setSelectedStyle] = useState<string>('ويفي');
  const [selectedLining, setSelectedLining] = useState<string>('بطانة 50%');

  // 5. Quantity & Errors
  const [quantity, setQuantity] = useState<number>(1);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Current fabric details object
  const currentFabric = useMemo(() => {
    return availableFabrics.find((f) => f.id === fabricId) || availableFabrics[0];
  }, [availableFabrics, fabricId]);

  // Pricing calculation according to strict rules:
  // Electric: 120 JOD
  // Manual: 70 JOD
  // Roller: unpriced (quote required)
  // Fabric and color changes NEVER alter these prices!
  const isRoller = !isElectricProduct && curtainType === 'roller';
  const unitPrice = isRoller ? null : (isElectricProduct || curtainType === 'electric') ? 120 : 70;
  const totalPrice = unitPrice ? unitPrice * quantity : null;

  const curtainTypeName = isElectricProduct
    ? 'ستائر كهربائية'
    : curtainType === 'electric'
    ? 'ستائر كهربائية'
    : curtainType === 'manual'
    ? 'ستارة عادية'
    : 'ستارة رول';

  // 6. Stable Image Resolution Engine
  // Resolves displayed image from: curtainType + fabricId + color.id + style + lining
  const targetImageUrl = useMemo(() => {
    return resolveCurtainImage(
      curtainType,
      fabricId,
      selectedColor.id,
      !isRoller ? selectedStyle : undefined,
      !isRoller ? selectedLining : undefined
    );
  }, [curtainType, fabricId, selectedColor.id, isRoller, selectedStyle, selectedLining]);

  // Active committed display state (strictly in sync with the image actually shown)
  const [displayed, setDisplayed] = useState({
    curtainType,
    curtainTypeName,
    fabricId,
    fabricName: currentFabric.name,
    colorId: selectedColor.id,
    colorName: selectedColor.name,
    colorHex: selectedColor.hex,
    style: !isRoller ? selectedStyle : undefined,
    lining: !isRoller ? selectedLining : undefined,
    imageUrl: targetImageUrl,
  });

  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const isLoading = displayed.imageUrl !== targetImageUrl && failedUrl !== targetImageUrl;
  const loadError = failedUrl === targetImageUrl;

  const activeRequestIdRef = useRef<number>(0);

  // Trigger smooth, stable image switch whenever targetImageUrl changes
  useEffect(() => {
    if (displayed.imageUrl === targetImageUrl) {
      return;
    }

    const reqId = ++activeRequestIdRef.current;

    if (typeof window !== 'undefined') {
      const img = new window.Image();
      img.src = targetImageUrl;

      const commitSuccess = () => {
        // Discard stale older requests during rapid clicking
        if (activeRequestIdRef.current === reqId) {
          setDisplayed({
            curtainType,
            curtainTypeName,
            fabricId,
            fabricName: currentFabric.name,
            colorId: selectedColor.id,
            colorName: selectedColor.name,
            colorHex: selectedColor.hex,
            style: !isRoller ? selectedStyle : undefined,
            lining: !isRoller ? selectedLining : undefined,
            imageUrl: targetImageUrl,
          });
          setFailedUrl(null);
        }
      };

      const commitError = () => {
        if (activeRequestIdRef.current === reqId) {
          setFailedUrl(targetImageUrl);
        }
      };

      if ('decode' in img && typeof img.decode === 'function') {
        img
          .decode()
          .then(commitSuccess)
          .catch(() => {
            img.onload = commitSuccess;
            img.onerror = commitError;
          });
      } else {
        img.onload = commitSuccess;
        img.onerror = commitError;
      }
    }
  }, [
    targetImageUrl,
    curtainType,
    curtainTypeName,
    fabricId,
    currentFabric.name,
    selectedColor.id,
    selectedColor.name,
    selectedColor.hex,
    isRoller,
    selectedStyle,
    selectedLining,
    displayed.imageUrl,
  ]);

  // Handlers for switching
  const handleSelectType = (type: 'electric' | 'manual' | 'roller') => {
    if (isElectricProduct) return; // Prevent switching electric product
    setCurtainType(type);
    setValidationError(null);
  };

  const handleSelectFabric = (fId: string) => {
    setFabricId(fId);
    setValidationError(null);
  };

  const handleSelectColor = (color: ColorOption) => {
    setSelectedColor(color);
    setValidationError(null);
  };

  // WhatsApp direct inquiry action
  const handleWhatsAppInquiry = () => {
    const heightStr = 'ارتفاع 300 سم';
    const message = `مرحباً متجر سيتارة، أود الاستفسار عن ${curtainTypeName} (القماش: ${currentFabric.name}، اللون: ${selectedColor.name}، ${heightStr}، عدد: ${quantity} قطعة).`;
    const targetUrl = getWhatsAppUrl(message);
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  // Add to cart action
  const handleAdd = () => {
    setValidationError(null);

    const sizeToUse: SizeOption = isRoller
      ? {
          id: `roller-size-300`,
          label: 'ارتفاع 300 سم (العرض حسب الطلب)',
          widthCm: 250,
          heightCm: 300,
          price: 0,
        }
      : {
          id: `${curtainType}-std-250-300`,
          label: '250 × 300 سم (مقاس معياري)',
          widthCm: 250,
          heightCm: 300,
          price: unitPrice || 120,
        };

    onAddToCart(
      product,
      selectedColor,
      sizeToUse,
      quantity,
      {
        curtainType,
        curtainTypeName,
        fabricId,
        fabricName: currentFabric.name,
        curtainStyle: !isRoller ? selectedStyle : undefined,
        liningOption: !isRoller ? selectedLining : undefined,
        resolvedImage: displayed.imageUrl,
      }
    );
    onClose();
  };

  return (
    <div
      className="relative w-full max-w-4xl bg-[#211B17] text-[#F5EFE6] border border-[#C8AA78]/30 rounded-xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col md:flex-row"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        aria-label="إغلاق"
        className="absolute top-3 left-3 sm:top-4 sm:left-4 z-40 p-2 rounded-full bg-[#171513]/90 hover:bg-[#171513] text-[#F5EFE6] hover:text-[#C8AA78] border border-white/10 transition-colors cursor-pointer shadow-md"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Visual Gallery Column (Sticky / Anchored preview on desktop) */}
      <div className="w-full md:w-[48%] lg:w-[46%] p-5 sm:p-6 md:p-7 bg-[#1B1613] flex flex-col justify-between border-b md:border-b-0 md:border-l border-white/10 shrink-0 md:overflow-y-auto">
        <div>
          {/* Main Image Container */}
          <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-[#2A231E] border border-white/10 shadow-inner">
            {/* Currently Committed Visible Image */}
            <Image
              src={displayed.imageUrl}
              alt={`${displayed.curtainTypeName} - ${displayed.fabricName} - ${displayed.colorName}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center select-none"
              priority
              referrerPolicy="no-referrer"
            />

            {/* Badges strictly matching the displayed image */}
            <div className="absolute top-3 right-3 flex flex-wrap gap-1.5 max-w-[85%]">
              <span className="px-2.5 py-1 text-[11px] font-bold text-[#171513] bg-[#C8AA78] rounded-md shadow-xs">
                {displayed.curtainTypeName}
              </span>
              <span className="px-2 py-1 text-[11px] font-semibold text-[#F5EFE6] bg-[#171513]/85 backdrop-blur-xs rounded-md border border-white/10">
                {displayed.fabricName}
              </span>
              {displayed.style && (
                <span className="px-2 py-1 text-[11px] font-medium text-[#D8C6AE] bg-[#171513]/85 backdrop-blur-xs rounded-md border border-white/10">
                  {displayed.style}
                </span>
              )}
              {displayed.lining && (
                <span className="px-2 py-1 text-[11px] font-medium text-[#C8AA78] bg-[#171513]/85 backdrop-blur-xs rounded-md border border-white/10">
                  {displayed.lining}
                </span>
              )}
            </div>

            {/* Subtle Loading Indicator during fetch & decode */}
            {isLoading && (
              <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/75 backdrop-blur-xs rounded-md border border-white/10 text-[10px] text-white/90 flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8AA78] animate-ping" />
                <span>جاري تحديث المعاينة...</span>
              </div>
            )}

            {/* Explicit Error State */}
            {loadError && (
              <div className="absolute inset-0 bg-[#2A231E]/95 flex flex-col items-center justify-center p-4 text-center">
                <AlertCircle className="w-7 h-7 text-[#C8AA78] mb-2" />
                <p className="text-xs font-semibold text-[#F5EFE6]">تعذر تحميل صورة هذه التشكيلة</p>
                <p className="text-[10px] text-[#D8C6AE]/70 mt-0.5">يمكنك إتمام الطلب بالمواصفات المختارة وسنوافيكم بكافة التفاصيل</p>
              </div>
            )}
          </div>

          {/* Live Visual Indicators strictly matching displayed image */}
          <div className="mt-3 flex items-center justify-between text-[11px] text-[#D8C6AE]/75 px-1">
            <span className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full border border-black/40"
                style={{ backgroundColor: displayed.colorHex }}
              />
              <span>معاينة اللون: <strong className="text-[#F5EFE6]">{displayed.colorName}</strong></span>
            </span>
            <span>
              الخامة: <strong className="text-[#C8AA78]">{displayed.fabricName}</strong>
              {displayed.style && <span className="text-[#D8C6AE]/70"> ({displayed.style})</span>}
            </span>
          </div>
        </div>

        {/* Specifications Summary */}
        <div className="mt-4 p-3.5 bg-[#171513] rounded-lg border border-white/5 space-y-2 text-xs text-[#D8C6AE]">
          <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
            <span className="text-[#D8C6AE]/70">المقاس المعياري:</span>
            <span className="font-semibold text-[#F5EFE6]">
              {isRoller ? 'ارتفاع 300 سم (العرض حسب الطلب)' : '250 سم عرض × 300 سم ارتفاع'}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
            <span className="text-[#D8C6AE]/70">طبيعة القماش:</span>
            <span className="font-semibold text-[#C8AA78]">{currentFabric.description}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#D8C6AE]/70">حياكة الحاشية:</span>
            <span className="font-semibold text-emerald-400">مشمولة في السعر</span>
          </div>
        </div>
      </div>

      {/* Options & Configuration Column (Independently scrolling on desktop) */}
      <div className="w-full md:w-[52%] lg:w-[54%] p-5 sm:p-6 md:p-8 flex flex-col justify-between text-right overflow-y-auto max-h-[52vh] md:max-h-[92vh]">
          <div>
            {/* Header & Title */}
            <span className="text-xs uppercase tracking-wider text-[#C8AA78] font-bold block mb-1">
              تحديد مواصفات الستارة
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F5EFE6]">
              {curtainTypeName} — {currentFabric.name}
            </h2>

            {/* Price Box */}
            <div className="mt-3.5 p-3.5 bg-[#171513] rounded-lg border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#D8C6AE]/70 block">
                  {isRoller ? 'حالة السعر:' : 'سعر الستارة المعيارية (250 × 300 سم):'}
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  {isRoller ? (
                    <span className="text-lg sm:text-xl font-bold text-[#C8AA78]">
                      السعر عند الاستفسار
                    </span>
                  ) : (
                    <>
                      <span className="text-2xl font-extrabold text-[#C8AA78] tabular-nums">
                        {unitPrice}
                      </span>
                      <span className="text-xs text-[#D8C6AE]">{SHOP_CONFIG.currencySymbol}</span>
                      {quantity > 1 && (
                        <span className="text-xs text-[#D8C6AE]/70 mr-2 tabular-nums">
                          (الإجمالي: {totalPrice} {SHOP_CONFIG.currencySymbol})
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              <span className="text-[11px] text-[#D8C6AE]/60">
                {isRoller ? 'سحب بحبل' : 'سعر ثابت لكافة الأقمشة'}
              </span>
            </div>

            {/* 1. SELECTION: CURTAIN TYPE (Shown only for non-electric cards) */}
            {!isElectricProduct && (
              <div className="mt-5">
                <label className="text-xs font-bold text-[#F5EFE6] block mb-1.5">
                  1. نوع الستارة وآلية التشغيل
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectType('electric')}
                    className={`p-2 rounded-lg border text-xs text-center transition-all cursor-pointer ${
                      curtainType === 'electric'
                        ? 'bg-[#2E251F] border-[#C8AA78] text-[#F5EFE6] font-bold shadow-xs'
                        : 'bg-[#171513] border-white/10 text-[#D8C6AE] hover:border-white/30'
                    }`}
                  >
                    <span className="block font-bold">كهربائية</span>
                    <span className="text-[10px] text-[#C8AA78] block mt-0.5">120 د.أ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectType('manual')}
                    className={`p-2 rounded-lg border text-xs text-center transition-all cursor-pointer ${
                      curtainType === 'manual'
                        ? 'bg-[#2E251F] border-[#C8AA78] text-[#F5EFE6] font-bold shadow-xs'
                        : 'bg-[#171513] border-white/10 text-[#D8C6AE] hover:border-white/30'
                    }`}
                  >
                    <span className="block font-bold">عادية</span>
                    <span className="text-[10px] text-[#C8AA78] block mt-0.5">70 د.أ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectType('roller')}
                    className={`p-2 rounded-lg border text-xs text-center transition-all cursor-pointer ${
                      curtainType === 'roller'
                        ? 'bg-[#2E251F] border-[#C8AA78] text-[#F5EFE6] font-bold shadow-xs'
                        : 'bg-[#171513] border-white/10 text-[#D8C6AE] hover:border-white/30'
                    }`}
                  >
                    <span className="block font-bold">ستارة رول</span>
                    <span className="text-[10px] text-[#D8C6AE]/70 block mt-0.5">عند الاستفسار</span>
                  </button>
                </div>
              </div>
            )}

            {/* SELECTION: FABRIC (Numbered 1 for electric, 2 for others) */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#F5EFE6] flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-[#C8AA78]" />
                  <span>
                    {isElectricProduct ? '1. خامة القماش' : '2. خامة القماش (مشتركة لكافة الأنواع)'}
                  </span>
                </label>
                <span className="text-xs text-[#C8AA78] font-semibold">{currentFabric.name}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableFabrics.map((fabric) => {
                  const isSelected = fabricId === fabric.id;
                  return (
                    <button
                      key={fabric.id}
                      type="button"
                      onClick={() => handleSelectFabric(fabric.id)}
                      className={`p-2.5 rounded-lg border text-right transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#2E251F] border-[#C8AA78] text-[#F5EFE6] font-bold shadow-xs ring-1 ring-[#C8AA78]/50'
                          : 'bg-[#171513] border-white/10 text-[#D8C6AE] hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{fabric.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#C8AA78] shrink-0" />}
                      </div>
                      <span className="text-[10px] text-[#D8C6AE]/60 block mt-0.5 line-clamp-1">
                        {fabric.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SELECTION: COLOR (Numbered 2 for electric, 3 for others) */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#F5EFE6] flex items-center gap-1.5">
                  <span>{isElectricProduct ? '2. اختر اللون' : '3. اختر اللون'}</span>
                  <span className="text-red-400">*</span>
                </label>
                <span className="text-xs text-[#C8AA78] font-semibold">
                  {selectedColor.name}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {CENTRAL_COLORS.map((color) => {
                  const isSelected = selectedColor.id === color.id;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => handleSelectColor(color)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#2E251F] border-[#C8AA78] text-[#F5EFE6] shadow-sm ring-1 ring-[#C8AA78]'
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

            {/* SELECTION: STYLE & LINING (For Fabric Curtains) */}
            {!isRoller && (
              <div className="space-y-4 mt-5 pt-3 border-t border-white/5">
                {/* Style: Wave vs American */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#F5EFE6]">
                      {isElectricProduct ? '3. طريقة التفصيل (الموديل)' : '4. طريقة التفصيل (الموديل)'}
                    </label>
                    <span className="text-xs text-[#C8AA78] font-semibold">{selectedStyle}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {['ويفي', 'أمريكي'].map((style) => {
                      const isSelected = selectedStyle === style;
                      return (
                        <button
                          key={style}
                          type="button"
                          onClick={() => setSelectedStyle(style)}
                          className={`p-2 rounded-lg border text-xs text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#2E251F] border-[#C8AA78] text-[#F5EFE6] font-bold shadow-xs'
                              : 'bg-[#171513] border-white/10 text-[#D8C6AE] hover:border-white/30'
                          }`}
                        >
                          <span className="font-bold">{style}</span>
                          <span className="text-[10px] text-[#D8C6AE]/60 block mt-0.5">
                            {style === 'ويفي' ? 'ثنيات انسيابية متوازنة' : 'طيات أمريكية كلاسيكية'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Lining: 50%, 80%, 100% */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#F5EFE6]">
                      {isElectricProduct ? '4. خيار البطانة والعزل' : '5. خيار البطانة والعزل'}
                    </label>
                    <span className="text-xs text-[#C8AA78] font-semibold">{selectedLining}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['بطانة 50%', 'بطانة 80%', 'تعتيم 100% — Blackout'].map((lining) => {
                      const isSelected = selectedLining === lining;
                      return (
                        <button
                          key={lining}
                          type="button"
                          onClick={() => setSelectedLining(lining)}
                          className={`p-2 rounded-lg border text-[11px] text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#2E251F] border-[#C8AA78] text-[#F5EFE6] font-bold shadow-xs'
                              : 'bg-[#171513] border-white/10 text-[#D8C6AE] hover:border-white/30'
                          }`}
                        >
                          <span>{lining}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Standard Dimensions Info */}
            <div className="mt-5 p-3 rounded-lg bg-[#171513] border border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-[#C8AA78]" />
                <span className="text-[#D8C6AE]/75">المقاس المعروض:</span>
              </div>
              <span className="font-bold text-[#F5EFE6]">
                {isRoller ? 'ارتفاع 300 سم (العرض حسب مساحة نافذتك)' : '250 سم عرض × 300 سم ارتفاع'}
              </span>
            </div>

            {/* Quantity Counter */}
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

            {validationError && (
              <div className="mt-4 p-3 bg-red-950/40 border border-red-800/60 rounded-lg flex items-center gap-2.5 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{validationError}</span>
              </div>
            )}
          </div>

          {/* Modal Bottom CTA */}
          <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
            {isRoller ? (
              <>
                {/* Primary WhatsApp Action for Roller */}
                <button
                  type="button"
                  onClick={handleWhatsAppInquiry}
                  className="w-full py-3.5 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.99] cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 shrink-0" />
                  <span>استفسر عبر واتساب</span>
                  <ExternalLink className="w-4 h-4 shrink-0 opacity-80" />
                </button>

                {/* Secondary Option: Add to Cart as Unpriced Item */}
                <button
                  type="button"
                  onClick={handleAdd}
                  className="w-full py-2.5 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#D8C6AE] hover:text-[#F5EFE6] border border-white/10 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-[#C8AA78]" />
                  <span>إضافة لاستفسار السلة (بدون سعر فوري)</span>
                </button>
              </>
            ) : (
              /* Add to Cart Action for Fabric Curtains */
              <button
                type="button"
                onClick={handleAdd}
                className="w-full py-3.5 px-6 rounded-lg bg-[#C8AA78] hover:bg-[#d5ba8c] text-[#171513] font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>إضافة إلى السلة · {totalPrice} {SHOP_CONFIG.currencySymbol}</span>
              </button>
            )}

            <p className="text-[11px] text-center text-[#D8C6AE]/60 mt-1.5">
              {SHOP_CONFIG.deliveryPricingNote}
            </p>
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
