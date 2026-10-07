'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  ColorOption,
  FabricOption,
  Product,
  SHOP_CONFIG,
  SizeOption,
  CENTRAL_FABRICS,
  CENTRAL_COLORS,
  MANUAL_FABRICS,
  resolveCurtainImage,
  getWhatsAppUrl,
  SCREEN_COLORS,
  ScreenColorOption,
  BLACKOUT_COLORS,
  BlackoutColorOption,
  ZEBRA_COLORS,
  ZebraColorOption,
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
  Shield,
  Sparkles,
  Hand,
  Radio,
  Smartphone,
  MapPin,
  Wrench,
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
      serviceLocation?: string;
      isService?: boolean;
      isDryCleaning?: boolean;
    }
  ) => void;
}

function ProductModalContent({ product, onClose, onAddToCart }: ProductModalContentProps) {
  const isElectricProduct = product.id === 'curtain-electric' || product.curtainType === 'electric';
  const isMadeToMeasureScreen = Boolean(product.isMadeToMeasureScreen);
  const isMadeToMeasureBlackout = Boolean(product.isMadeToMeasureBlackout);
  const isMadeToMeasureZebra = Boolean(product.isMadeToMeasureZebra);
  const isCustomRoller = isMadeToMeasureScreen || isMadeToMeasureBlackout || isMadeToMeasureZebra;
  const isManualProduct =
    product.id === 'curtain-manual' ||
    (!isElectricProduct && !isCustomRoller && product.curtainType === 'manual');
  const isFabricCurtain = isElectricProduct || isManualProduct;

  const screenColors = product.screenColors || SCREEN_COLORS;
  const blackoutColors = product.blackoutColors || BLACKOUT_COLORS;
  const zebraColors = product.zebraColors || ZEBRA_COLORS;

  const [selectedScreenColor, setSelectedScreenColor] = useState<ScreenColorOption>(
    screenColors[0]
  );
  const [selectedBlackoutColor, setSelectedBlackoutColor] = useState<BlackoutColorOption>(
    blackoutColors[0]
  );
  const [selectedZebraColor, setSelectedZebraColor] = useState<ZebraColorOption>(
    zebraColors[0]
  );

  const activeColorOption = isMadeToMeasureZebra
    ? selectedZebraColor
    : isMadeToMeasureBlackout
    ? selectedBlackoutColor
    : selectedScreenColor;

  // Measurement states for roller curtains
  const [widthCm, setWidthCm] = useState<string>('');
  const [heightCm, setHeightCm] = useState<string>('');

  const numWidth = parseFloat(widthCm) || 0;
  const numHeight = parseFloat(heightCm) || 0;
  const hasValidDimensions =
    Number.isFinite(numWidth) &&
    Number.isFinite(numHeight) &&
    numWidth > 0 &&
    numHeight > 0;
  const areaM2 = hasValidDimensions ? (numWidth * numHeight) / 10000 : 0;
  const unitPricePerPiece = hasValidDimensions ? areaM2 * 20 : 0;

  // Measurement states for Fabric Curtains (ستائر كهربائية و ستائر عادية):
  // Two initially empty inputs: horizontal span & height
  const [curtainWidthCm, setCurtainWidthCm] = useState<string>('');
  const [curtainHeightCm, setCurtainHeightCm] = useState<string>('');

  const numCurtainWidth = parseFloat(curtainWidthCm) || 0;
  const numCurtainHeight = parseFloat(curtainHeightCm) || 0;
  const hasValidCurtainWidth = Number.isFinite(numCurtainWidth) && numCurtainWidth > 0;
  const hasValidCurtainHeight =
    Number.isFinite(numCurtainHeight) && numCurtainHeight >= 100 && numCurtainHeight <= 360;
  const hasValidCurtainDimensions = hasValidCurtainWidth && hasValidCurtainHeight;
  // Rate: 120 JOD per 250 cm => 0.48 JOD per cm. Height is NEVER multiplied into the price!
  const unitPriceCurtain = hasValidCurtainDimensions
    ? Math.round(numCurtainWidth * 0.48 * 100) / 100
    : 0;

  const formatPriceDisplay = (val: number) => (val % 1 === 0 ? val.toString() : val.toFixed(2));

  // 1. Curtain Type Selection (electric / manual / roller)
  // For fabric curtains (electric / manual), fixed to their respective type (type selector is hidden)
  const [curtainType, setCurtainType] = useState<'electric' | 'manual' | 'roller' | string>(
    isElectricProduct
      ? 'electric'
      : isManualProduct
      ? 'manual'
      : (product.curtainType as any) || (product.category === 'roller' ? 'roller' : 'electric')
  );

  // Available fabric choices: shared 8 fabrics for both electric & manual
  const availableFabrics = useMemo(() => {
    if (isFabricCurtain) {
      return product.fabricOptions || MANUAL_FABRICS;
    }
    return product.fabricOptions || CENTRAL_FABRICS;
  }, [product.fabricOptions, isFabricCurtain]);

  // 2. Fabric Selection
  const initialFabricId = useMemo(() => {
    if (product.defaultFabricId) return product.defaultFabricId;
    if (isFabricCurtain) return 'flax_linen';
    if (product.slug.includes('zebra')) return 'zebra';
    if (product.slug.includes('screen')) return 'screen';
    if (product.slug.includes('blackout')) return 'blackout';
    return 'flax_linen';
  }, [product, isFabricCurtain]);

  const [fabricId, setFabricId] = useState<string>(initialFabricId);

  // 3. Color Selection (basic colors: ivory, sand, cocoa, charcoal, white)
  const [selectedColor, setSelectedColor] = useState<ColorOption>(
    product.colors && product.colors.length > 0 ? product.colors[0] : CENTRAL_COLORS[0]
  );

  // 4. Style & Lining/Darkening
  const [selectedStyle, setSelectedStyle] = useState<string>('ويفي');
  // For fabric curtains: independent darkening choices "50%", "80%", "100%" for every fabric
  const [selectedLining, setSelectedLining] = useState<string>('50%');

  // 5. Quantity & Errors
  const [quantity, setQuantity] = useState<number>(1);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Current fabric details object
  const currentFabric = useMemo(() => {
    return availableFabrics.find((f) => f.id === fabricId) || availableFabrics[0];
  }, [availableFabrics, fabricId]);

  // Pricing calculation
  const isStandardRoller = !isFabricCurtain && !isCustomRoller && curtainType === 'roller';
  const unitPrice = isCustomRoller
    ? unitPricePerPiece
    : isFabricCurtain
    ? (hasValidCurtainDimensions ? unitPriceCurtain : null)
    : isStandardRoller
    ? null
    : 120;

  const totalPrice = isCustomRoller
    ? unitPricePerPiece * quantity
    : isFabricCurtain
    ? (hasValidCurtainDimensions ? unitPriceCurtain * quantity : null)
    : unitPrice
    ? unitPrice * quantity
    : null;

  const curtainTypeName = isElectricProduct
    ? 'ستائر كهربائية'
    : isManualProduct
    ? 'ستائر عادية'
    : isMadeToMeasureScreen
    ? 'رول سكرين'
    : isMadeToMeasureBlackout
    ? 'رول بلاك أوت'
    : isMadeToMeasureZebra
    ? 'رول زيبرا'
    : curtainType === 'electric'
    ? 'ستائر كهربائية'
    : curtainType === 'manual'
    ? 'ستائر عادية'
    : 'ستارة رول';

  const displayFabricName = isCustomRoller ? activeColorOption.name : currentFabric.name;

  // 6. Direct & Synchronous Image Resolution
  const targetImageUrl = useMemo(() => {
    if (isMadeToMeasureZebra) {
      return selectedZebraColor.installedImage || selectedZebraColor.image;
    }
    if (isMadeToMeasureBlackout) {
      return selectedBlackoutColor.installedImage || selectedBlackoutColor.image;
    }
    if (isMadeToMeasureScreen) {
      return selectedScreenColor.installedImage || selectedScreenColor.image;
    }
    return resolveCurtainImage(
      curtainType,
      fabricId,
      selectedColor.id,
      !isStandardRoller ? selectedStyle : undefined,
      !isStandardRoller ? selectedLining : undefined
    );
  }, [
    isMadeToMeasureZebra,
    isMadeToMeasureBlackout,
    isMadeToMeasureScreen,
    selectedZebraColor,
    selectedBlackoutColor,
    selectedScreenColor,
    curtainType,
    fabricId,
    selectedColor.id,
    isStandardRoller,
    selectedStyle,
    selectedLining,
  ]);

  const activeColorName = isCustomRoller ? activeColorOption.name : selectedColor.name;
  const activeColorHex = isCustomRoller ? activeColorOption.hex : selectedColor.hex;
  const activeStyleName = !isStandardRoller && !isCustomRoller ? selectedStyle : undefined;
  const activeLiningName = !isStandardRoller && !isCustomRoller
    ? (selectedLining.includes('عزل') ? selectedLining : `عزل ${selectedLining}`)
    : undefined;

  // Handlers for switching
  const handleSelectType = (type: 'electric' | 'manual' | 'roller') => {
    if (isElectricProduct || isManualProduct) return;
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
    let dimensionsStr = 'ارتفاع 300 سم';
    if (isFabricCurtain) {
      dimensionsStr = hasValidCurtainDimensions
        ? `طول ${numCurtainWidth} سم × ارتفاع ${numCurtainHeight} سم (مشمول بالسعر)`
        : 'تفصيل حسب المقاس';
    } else if (isCustomRoller) {
      dimensionsStr = hasValidDimensions
        ? `مقاس ${numWidth} × ${numHeight} سم (${areaM2.toFixed(2)} م²)`
        : 'تفصيل حسب المقاس';
    }
    const optsStr = isFabricCurtain
      ? `الموديل: ${selectedStyle}، خيار العزل: ${selectedLining}`
      : '';
    const details = [displayFabricName, optsStr].filter(Boolean).join('، ');
    const message = `مرحباً متجر سيتارة، أود الاستفسار عن ${curtainTypeName} (المواصفات: ${details}، ${dimensionsStr}، عدد: ${quantity} قطعة).`;
    const targetUrl = getWhatsAppUrl(message);
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  // Add to cart action
  const handleAdd = () => {
    setValidationError(null);

    // 1. Fabric Curtains (ستائر كهربائية و ستائر عادية) custom measurement validation & add
    if (isFabricCurtain) {
      if (!hasValidCurtainWidth) {
        setValidationError('يرجى إدخال طول البرداية / العرض (قيمة موجبة بالسنتمتر).');
        return;
      }
      if (!hasValidCurtainHeight) {
        setValidationError('الارتفاع المطلوب يجب أن يكون بين 100 سم و 360 سم (مشمول بالسعر دون تكلفة إضافية).');
        return;
      }
      if (quantity < 1) {
        setValidationError('يرجى تحديد كمية صحيحة (قطعة واحدة على الأقل).');
        return;
      }

      const itemType = isElectricProduct ? 'electric' : 'manual';
      const itemTypeName = isElectricProduct ? 'ستائر كهربائية' : 'ستائر عادية';

      onAddToCart(
        product,
        selectedColor,
        {
          id: `${itemType}_${fabricId}_${selectedColor.id}_${selectedStyle}_${selectedLining}_${numCurtainWidth}_${numCurtainHeight}`,
          label: `${numCurtainWidth} سم عرض × ${numCurtainHeight} سم ارتفاع`,
          widthCm: numCurtainWidth,
          heightCm: numCurtainHeight,
          price: unitPriceCurtain,
        },
        quantity,
        {
          curtainType: itemType,
          curtainTypeName: itemTypeName,
          fabricId: fabricId,
          fabricName: currentFabric.name,
          curtainStyle: selectedStyle,
          liningOption: selectedLining,
          resolvedImage: targetImageUrl,
        }
      );
      onClose();
      return;
    }

    // 2. Custom Roller Curtains (Zebra / Blackout / Screen)
    if (isCustomRoller) {
      if (!hasValidDimensions || numWidth <= 0 || numHeight <= 0 || quantity < 1) {
        setValidationError('يرجى إدخال قيم صحيحة وموجبة للعرض والطول قبل الإضافة للسلة.');
        return;
      }

      const prefix = isMadeToMeasureBlackout ? 'blackout' : isMadeToMeasureZebra ? 'zebra' : 'screen';
      const typeName = isMadeToMeasureBlackout ? 'رول بلاك أوت' : isMadeToMeasureZebra ? 'رول زيبرا' : 'رول سكرين';
      const fabricIdName = isMadeToMeasureBlackout ? 'blackout' : isMadeToMeasureZebra ? 'zebra' : 'screen';
      const fabricNameStr = activeColorOption.name;

      onAddToCart(
        product,
        {
          id: activeColorOption.id,
          name: activeColorOption.name,
          hex: activeColorOption.hex,
          image: targetImageUrl,
          gallery: [targetImageUrl],
        },
        {
          id: `${prefix}_${activeColorOption.id}_${numWidth}_${numHeight}`,
          label: `${numWidth} × ${numHeight} سم (${areaM2.toFixed(2)} م²)`,
          widthCm: numWidth,
          heightCm: numHeight,
          price: unitPricePerPiece,
        },
        quantity,
        {
          curtainType: 'roller',
          curtainTypeName: typeName,
          fabricId: fabricIdName,
          fabricName: fabricNameStr,
          resolvedImage: targetImageUrl,
        }
      );
      onClose();
      return;
    }

    // 3. Electric & Standard Curtains
    const sizeToUse: SizeOption = isStandardRoller
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
        curtainStyle: !isStandardRoller ? selectedStyle : undefined,
        liningOption: !isStandardRoller ? selectedLining : undefined,
        resolvedImage: targetImageUrl,
      }
    );
    onClose();
  };

  return (
    <div
      className="relative w-full max-w-4xl bg-[#211B17] text-[#F5EFE6] border border-[#C8AA78]/30 rounded-xl shadow-2xl overflow-y-auto md:overflow-hidden max-h-[88vh] sm:max-h-[90vh] md:max-h-[92vh] flex flex-col md:flex-row my-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        aria-label="إغلاق"
        className="sticky top-3 left-3 z-50 self-start float-left -mb-10 sm:-mb-12 p-2 rounded-full bg-[#171513]/90 hover:bg-[#171513] text-[#F5EFE6] hover:text-[#C8AA78] border border-white/10 transition-colors cursor-pointer shadow-md md:absolute md:top-4 md:left-4 md:mb-0"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Visual Gallery Column */}
      <div className="w-full md:w-[48%] lg:w-[46%] p-5 sm:p-6 md:p-7 bg-[#1B1613] flex flex-col justify-between border-b md:border-b-0 md:border-l border-white/10 shrink-0 md:overflow-y-auto md:max-h-[92vh]">
        <div>
          {/* Main Product Preview Container */}
          <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-[#2A231E] border border-white/10 shadow-inner">
            <Image
              key={targetImageUrl}
              src={targetImageUrl}
              alt={`${curtainTypeName} - ${displayFabricName}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center select-none"
              priority
              referrerPolicy="no-referrer"
            />

            {/* Product & Variant Badges */}
            <div className="absolute top-3 right-3 flex flex-wrap gap-1.5 max-w-[85%]">
              <span className="px-2.5 py-1 text-[11px] font-bold text-[#171513] bg-[#C8AA78] rounded-md shadow-xs">
                {curtainTypeName}
              </span>
              <span className="px-2 py-1 text-[11px] font-semibold text-[#F5EFE6] bg-[#171513]/85 backdrop-blur-xs rounded-md border border-white/10">
                {displayFabricName}
              </span>
              {activeStyleName && (
                <span className="px-2 py-1 text-[11px] font-medium text-[#D8C6AE] bg-[#171513]/85 backdrop-blur-xs rounded-md border border-white/10">
                  {activeStyleName}
                </span>
              )}
              {activeLiningName && (
                <span className="px-2 py-1 text-[11px] font-medium text-[#C8AA78] bg-[#171513]/85 backdrop-blur-xs rounded-md border border-white/10">
                  {activeLiningName}
                </span>
              )}
            </div>
          </div>

          {/* Live Color Indicator */}
          <div className="mt-3 flex items-center justify-between text-[11px] text-[#D8C6AE]/75 px-1">
            <span className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full border border-black/40"
                style={{ backgroundColor: activeColorHex }}
              />
              <span>اللون: <strong className="text-[#F5EFE6]">{activeColorName}</strong></span>
            </span>
            {isFabricCurtain ? (
              <span className="text-[#C8AA78] font-bold">48 د.أ للمتر الطولي</span>
            ) : isCustomRoller ? (
              <span className="text-[#C8AA78] font-bold">20 د.أ / م²</span>
            ) : null}
          </div>
        </div>

        {/* Specifications Summary */}
        <div className="mt-4 p-3.5 bg-[#171513] rounded-lg border border-white/5 space-y-2 text-xs text-[#D8C6AE]">
          <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
            <span className="text-[#D8C6AE]/70">المقاس:</span>
            <span className="font-semibold text-[#F5EFE6]">
              {isFabricCurtain
                ? 'تفصيل حسب المقاس (الارتفاع مشمول حتى 3.6 م)'
                : isCustomRoller
                ? 'تفصيل دقيق حسب المقاس (العرض × الطول)'
                : isStandardRoller
                ? 'ارتفاع 300 سم (العرض حسب الطلب)'
                : '250 سم عرض × 300 سم ارتفاع'}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
            <span className="text-[#D8C6AE]/70">طبيعة القماش:</span>
            <span className="font-semibold text-[#C8AA78]">{currentFabric.description}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#D8C6AE]/70">آلية التشغيل:</span>
            <span className="font-semibold text-emerald-400">
              {isElectricProduct
                ? 'تشغيل باللمس، بالريموت كنترول، وعبر تطبيق على الهاتف'
                : isManualProduct
                ? 'تشغيل يدوي كلاسيكي انسيابي بدون محرك'
                : isCustomRoller
                ? 'سحب بحبل يدوي سلس ومتين'
                : 'تشغيل يدوي كلاسيكي'}
            </span>
          </div>
        </div>
      </div>

      {/* Options & Configuration Column */}
      <div className="w-full md:w-[52%] lg:w-[54%] p-5 sm:p-6 md:p-8 flex flex-col justify-between text-right md:overflow-y-auto md:max-h-[92vh]">
        <div>
          {/* Header & Title */}
          <span className="text-xs uppercase tracking-wider text-[#C8AA78] font-bold block mb-1">
            تحديد مواصفات الستارة
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F5EFE6]">
            {isFabricCurtain || isCustomRoller ? curtainTypeName : `${curtainTypeName} — ${currentFabric.name}`}
          </h2>
          <p className="text-xs text-[#D8C6AE]/75 mt-1 leading-relaxed">
            {isElectricProduct
              ? 'ستائر كهربائية تعمل باللمس، وبالريموت كنترول، وعبر تطبيق على الهاتف.'
              : isManualProduct
              ? 'ستارة قماشية يدوية بدون محرك، تفصيل حسب المقاس والارتفاع مشمول حتى 3.6 متر.'
              : product.shortDesc}
          </p>

          {/* Electric Included Features in a small, elegant row with suitable icons */}
          {isElectricProduct && (
            <div className="mt-3.5 p-3 rounded-lg bg-[#171513] border border-[#C8AA78]/30">
              <span className="text-[11px] font-bold text-[#C8AA78] flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#C8AA78]" />
                <span>ميزات التشغيل المشمولة بالمنتج:</span>
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col items-center justify-center p-2 rounded-md bg-white/5 border border-white/5">
                  <Hand className="w-4 h-4 text-[#C8AA78] mb-1 shrink-0" />
                  <span className="text-xs font-bold text-[#F5EFE6]">باللمس</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded-md bg-white/5 border border-white/5">
                  <Radio className="w-4 h-4 text-[#C8AA78] mb-1 shrink-0" />
                  <span className="text-xs font-bold text-[#F5EFE6]">بالريموت كنترول</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded-md bg-white/5 border border-white/5">
                  <Smartphone className="w-4 h-4 text-[#C8AA78] mb-1 shrink-0" />
                  <span className="text-xs font-bold text-[#F5EFE6]">عبر تطبيق على الهاتف</span>
                </div>
              </div>
            </div>
          )}

          {/* Price Box */}
          <div className="mt-3.5 p-3.5 bg-[#171513] rounded-lg border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#D8C6AE]/70 block">
                {isFabricCurtain || isCustomRoller
                  ? 'السعر المحسوب:'
                  : isStandardRoller
                  ? 'حالة السعر:'
                  : 'سعر الستارة المعيارية (250 × 300 سم):'}
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                {isFabricCurtain ? (
                  hasValidCurtainDimensions ? (
                    <>
                      <span className="text-2xl font-extrabold text-[#C8AA78] tabular-nums">
                        {formatPriceDisplay(unitPriceCurtain)}
                      </span>
                      <span className="text-xs text-[#D8C6AE]">{SHOP_CONFIG.currencySymbol} / للقطعة</span>
                      {quantity > 1 && (
                        <span className="text-xs text-[#D8C6AE]/70 mr-2 tabular-nums">
                          (الإجمالي: {formatPriceDisplay(unitPriceCurtain * quantity)} {SHOP_CONFIG.currencySymbol})
                        </span>
                      )}
                    </>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-[#C8AA78]">
                        48 د.أ للمتر الطولي
                      </span>
                      <span className="text-xs text-[#D8C6AE]/70">
                        · أدخل المقاسات لحساب السعر
                      </span>
                    </div>
                  )
                ) : isCustomRoller ? (
                  hasValidDimensions ? (
                    <>
                      <span className="text-2xl font-extrabold text-[#C8AA78] tabular-nums">
                        {unitPricePerPiece.toFixed(2)}
                      </span>
                      <span className="text-xs text-[#D8C6AE]">{SHOP_CONFIG.currencySymbol} / للقطعة</span>
                      {quantity > 1 && (
                        <span className="text-xs text-[#D8C6AE]/70 mr-2 tabular-nums">
                          (الإجمالي: {(unitPricePerPiece * quantity).toFixed(2)} {SHOP_CONFIG.currencySymbol})
                        </span>
                      )}
                    </>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-[#C8AA78]">
                        20 د.أ / م²
                      </span>
                      <span className="text-xs text-[#D8C6AE]/70">
                        · أدخل المقاسات لحساب السعر
                      </span>
                    </div>
                  )
                ) : isStandardRoller ? (
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
              {isFabricCurtain
                ? 'تفصيل حسب المقاس'
                : isCustomRoller
                ? 'تفصيل حسب الطلب'
                : isStandardRoller
                ? 'سحب بحبل'
                : 'سعر ثابت لكافة الأقمشة'}
            </span>
          </div>

          {/* 1. FABRIC CURTAINS CONFIGURATOR (ستائر كهربائية و ستائر عادية) */}
          {isFabricCurtain ? (
            <div className="space-y-4 mt-4">
              {/* Option 1: Fabric Selection (8 fabrics) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#F5EFE6] flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-[#C8AA78]" />
                    <span>1. خامة القماش</span>
                    <span className="text-red-400">*</span>
                  </label>
                  <span className="text-xs text-[#C8AA78] font-semibold">{currentFabric.name}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {availableFabrics.map((fabric) => {
                    const isSelected = fabricId === fabric.id;
                    return (
                      <button
                        key={fabric.id}
                        type="button"
                        onClick={() => handleSelectFabric(fabric.id)}
                        className={`p-2 rounded-lg border text-right transition-all cursor-pointer ${
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

              {/* Option 2: Color Selection (basic colors preserved) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#F5EFE6] flex items-center gap-1.5">
                    <span>2. اختر اللون</span>
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

              {/* Option 3: Curtain Style (ويفي / أمريكي) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#F5EFE6]">
                    3. طريقة التفصيل (الموديل)
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
                        className={`p-2.5 rounded-lg border text-xs text-center transition-all cursor-pointer ${
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

              {/* Option 4: Independent Darkening Choices: "50%", "80%", "100%" for EVERY fabric */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#F5EFE6] flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-[#C8AA78]" />
                    <span>4. خيار العزل والتعتيم (مستقل لكافة الأقمشة)</span>
                    <span className="text-red-400">*</span>
                  </label>
                  <span className="text-xs text-[#C8AA78] font-semibold">عزل {selectedLining}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '50%', label: '50%', desc: 'عزل خفيف وتمرير لطيف للضوء' },
                    { id: '80%', label: '80%', desc: 'عزل متوسط وخصوصية عالية' },
                    { id: '100%', label: '100%', desc: 'تعتيم كامل وحجب تام للضوء' },
                  ].map((lining) => {
                    const isSelected = selectedLining === lining.id;
                    return (
                      <button
                        key={lining.id}
                        type="button"
                        onClick={() => setSelectedLining(lining.id)}
                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#2E251F] border-[#C8AA78] text-[#F5EFE6] font-bold shadow-xs ring-1 ring-[#C8AA78]/50'
                            : 'bg-[#171513] border-white/10 text-[#D8C6AE] hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-xs font-bold">عزل {lining.label}</span>
                          {isSelected && <Check className="w-3 h-3 text-[#C8AA78]" />}
                        </div>
                        <span className="text-[10px] text-[#D8C6AE]/60 block mt-0.5 line-clamp-1">
                          {lining.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Option 5: Custom Measurements (Horizontal Span & Height) */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-[#F5EFE6] block mb-1">
                    5. طول البرداية / العرض (سم) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={curtainWidthCm}
                    onChange={(e) => {
                      setCurtainWidthCm(e.target.value);
                      setValidationError(null);
                    }}
                    placeholder="مثال: 250"
                    className="w-full px-3 py-2 bg-[#171513] border border-white/10 rounded-lg text-sm text-[#F5EFE6] focus:border-[#C8AA78] outline-none tabular-nums"
                  />
                  <span className="text-[10px] text-[#D8C6AE]/60 block mt-1">
                    المسار الأفقي للستارة
                  </span>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#F5EFE6] block mb-1">
                    الارتفاع (سم) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="360"
                    value={curtainHeightCm}
                    onChange={(e) => {
                      setCurtainHeightCm(e.target.value);
                      setValidationError(null);
                    }}
                    placeholder="مثال: 260"
                    className="w-full px-3 py-2 bg-[#171513] border border-white/10 rounded-lg text-sm text-[#F5EFE6] focus:border-[#C8AA78] outline-none tabular-nums"
                  />
                  <span className="text-[10px] text-[#C8AA78] font-medium block mt-1">
                    الارتفاع من متر إلى 3.6 متر مشمول بالسعر
                  </span>
                </div>
              </div>

              {/* Calculation Summary Box for Fabric Curtains */}
              <div className="p-3.5 bg-[#171513] rounded-lg border border-white/10 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[#D8C6AE]">
                  <span>طول البرداية / العرض:</span>
                  <span className="font-bold text-[#F5EFE6] tabular-nums">
                    {hasValidCurtainWidth ? `${numCurtainWidth} سم (${(numCurtainWidth / 100).toFixed(2)} م)` : '---'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#D8C6AE]">
                  <span>الارتفاع المطلوب:</span>
                  <span className="font-bold text-[#F5EFE6] tabular-nums">
                    {hasValidCurtainHeight ? `${numCurtainHeight} سم (مشمول بالسعر)` : 'بين 100 إلى 360 سم'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#D8C6AE]">
                  <span>سعر المتر الطولي:</span>
                  <span className="font-semibold text-[#C8AA78]">48 د.أ / م (0.48 د.أ / سم)</span>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
                  <span className="font-bold text-[#F5EFE6]">سعر القطعة الواحدة:</span>
                  <span className="font-extrabold text-[#C8AA78] text-sm tabular-nums">
                    {hasValidCurtainDimensions
                      ? `${formatPriceDisplay(unitPriceCurtain)} د.أ`
                      : 'أدخل المقاسات لحساب السعر'}
                  </span>
                </div>
              </div>
            </div>
          ) : isCustomRoller ? (
            /* 2. CUSTOM ROLLER CONFIGURATOR (ZEBRA / BLACKOUT / SCREEN) */
            <div className="space-y-4 mt-4">
              {/* 1. Color / Pattern Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#F5EFE6] flex items-center gap-1.5">
                    <span>1. اختر اللون أو النقشة</span>
                    <span className="text-red-400">*</span>
                  </label>
                  <span className="text-xs text-[#C8AA78] font-semibold">{activeColorOption.name}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(isMadeToMeasureZebra
                    ? zebraColors
                    : isMadeToMeasureBlackout
                    ? blackoutColors
                    : screenColors
                  ).map((opt) => {
                    const isSelected = activeColorOption.id === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          if (isMadeToMeasureZebra) {
                            setSelectedZebraColor(opt as ZebraColorOption);
                          } else if (isMadeToMeasureBlackout) {
                            setSelectedBlackoutColor(opt as BlackoutColorOption);
                          } else {
                            setSelectedScreenColor(opt as ScreenColorOption);
                          }
                        }}
                        className={`p-2.5 rounded-lg border text-right transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#2E251F] border-[#C8AA78] text-[#F5EFE6] font-bold shadow-xs ring-1 ring-[#C8AA78]/50'
                            : 'bg-[#171513] border-white/10 text-[#D8C6AE] hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold leading-normal">{opt.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#C8AA78] shrink-0" />}
                        </div>
                        {opt.sampleCode && (
                          <span className="text-[10px] text-[#D8C6AE]/60 block mt-0.5">
                            {isMadeToMeasureZebra ? opt.sampleCode : `رمز: ${opt.sampleCode}`}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2 & 3. Width & Height Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#F5EFE6] block mb-1">
                    2. العرض (سم) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={widthCm}
                    onChange={(e) => {
                      setWidthCm(e.target.value);
                      setValidationError(null);
                    }}
                    placeholder="مثال: 150"
                    className="w-full px-3 py-2 bg-[#171513] border border-white/10 rounded-lg text-sm text-[#F5EFE6] focus:border-[#C8AA78] outline-none tabular-nums"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#F5EFE6] block mb-1">
                    3. الطول (سم) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={heightCm}
                    onChange={(e) => {
                      setHeightCm(e.target.value);
                      setValidationError(null);
                    }}
                    placeholder="مثال: 200"
                    className="w-full px-3 py-2 bg-[#171513] border border-white/10 rounded-lg text-sm text-[#F5EFE6] focus:border-[#C8AA78] outline-none tabular-nums"
                  />
                </div>
              </div>

              {/* Calculation Summary Box */}
              <div className="p-3.5 bg-[#171513] rounded-lg border border-white/10 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[#D8C6AE]">
                  <span>المساحة المحسوبة:</span>
                  <span className="font-bold text-[#F5EFE6] tabular-nums">
                    {hasValidDimensions ? `${areaM2.toFixed(2)} م²` : '---'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#D8C6AE]">
                  <span>سعر المتر المربع:</span>
                  <span className="font-semibold text-[#C8AA78]">20 د.أ / م²</span>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
                  <span className="font-bold text-[#F5EFE6]">سعر القطعة الواحدة:</span>
                  <span className="font-extrabold text-[#C8AA78] text-sm tabular-nums">
                    {hasValidDimensions ? `${unitPricePerPiece.toFixed(2)} د.أ` : 'أدخل المقاسات لحساب السعر'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* 3. ELECTRIC & STANDARD CURTAINS */
            <>
              {/* Curtain Type for non-electric and non-manual cards */}
              {!isElectricProduct && !isManualProduct && (
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

              {/* Fabric Choice */}
              <div className="mt-5">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#F5EFE6] flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-[#C8AA78]" />
                    <span>
                      {isElectricProduct ? '1. خامة القماش' : 'خامة القماش'}
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

              {/* Color Selection for Fabric Curtains */}
              <div className="mt-5">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#F5EFE6] flex items-center gap-1.5">
                    <span>{isElectricProduct ? '2. اختر اللون' : 'اختر اللون'}</span>
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

              {/* Style & Lining (For standard fabric curtains) */}
              {!isStandardRoller && (
                <div className="space-y-4 mt-5 pt-3 border-t border-white/5">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#F5EFE6]">
                        {isElectricProduct ? '3. طريقة التفصيل (الموديل)' : 'طريقة التفصيل (الموديل)'}
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

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#F5EFE6]">
                        {isElectricProduct ? '4. خيار البطانة والعزل' : 'خيار البطانة والعزل'}
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
            </>
          )}

          {/* Standard Dimensions Info for non-custom and non-fabric curtains */}
          {!isCustomRoller && !isFabricCurtain && (
            <div className="mt-5 p-3 rounded-lg bg-[#171513] border border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-[#C8AA78]" />
                <span className="text-[#D8C6AE]/75">المقاس المعروض:</span>
              </div>
              <span className="font-bold text-[#F5EFE6]">
                {isStandardRoller ? 'ارتفاع 300 سم (العرض حسب الطلب)' : '250 سم عرض × 300 سم ارتفاع'}
              </span>
            </div>
          )}

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
          {isFabricCurtain ? (
            <button
              type="button"
              onClick={handleAdd}
              disabled={!hasValidCurtainDimensions}
              className="w-full py-3.5 px-6 rounded-lg bg-[#C8AA78] hover:bg-[#d5ba8c] disabled:opacity-40 disabled:cursor-not-allowed text-[#171513] font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>
                {hasValidCurtainDimensions
                  ? `إضافة إلى السلة · ${formatPriceDisplay(unitPriceCurtain * quantity)} ${SHOP_CONFIG.currencySymbol}`
                  : 'أدخل المقاسات لحساب السعر'}
              </span>
            </button>
          ) : isCustomRoller ? (
            <button
              type="button"
              onClick={handleAdd}
              disabled={!hasValidDimensions}
              className="w-full py-3.5 px-6 rounded-lg bg-[#C8AA78] hover:bg-[#d5ba8c] disabled:opacity-40 disabled:cursor-not-allowed text-[#171513] font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>
                {hasValidDimensions
                  ? `إضافة إلى السلة · ${(unitPricePerPiece * quantity).toFixed(2)} ${SHOP_CONFIG.currencySymbol}`
                  : 'أدخل المقاسات لحساب السعر'}
              </span>
            </button>
          ) : isStandardRoller ? (
            <>
              <button
                type="button"
                onClick={handleWhatsAppInquiry}
                className="w-full py-3.5 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.99] cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 shrink-0" />
                <span>استفسر عبر واتساب</span>
                <ExternalLink className="w-4 h-4 shrink-0 opacity-80" />
              </button>

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

function TrackProductModalContent({
  product,
  onClose,
  onAddToCart,
}: ProductModalContentProps) {
  // Only ONE editable field: “طول السكة (سم)”, initially empty
  const [trackLengthCm, setTrackLengthCm] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const numLength = parseFloat(trackLengthCm) || 0;
  const hasValidLength = Number.isFinite(numLength) && numLength > 0;
  // Rate: 5 JOD per 100 cm => 0.05 JOD per cm
  // Example: 100 cm = 5.00 JOD, 250 cm = 12.50 JOD
  const unitPriceTrack = hasValidLength ? Math.round(numLength * 0.05 * 100) / 100 : 0;
  const formatPriceDisplay = (val: number) => (val % 1 === 0 ? val.toString() : val.toFixed(2));

  const trackImage = product.mainImage || '/images/aluminum_curtain_track.jpg';

  const defaultColor: ColorOption = {
    id: 'white_thermal',
    name: 'أبيض مدهون حرارياً',
    hex: '#FFFFFF',
    image: trackImage,
    gallery: [trackImage],
  };

  const handleAdd = () => {
    if (!hasValidLength) {
      setValidationError('يرجى إدخال طول السكة (قيمة موجبة بالسنتمتر) لحساب السعر.');
      return;
    }

    onAddToCart(
      product,
      defaultColor,
      {
        id: `track_${numLength}`,
        label: `${numLength} سم`,
        widthCm: numLength,
        heightCm: 0,
        price: unitPriceTrack,
      },
      1, // Add each configured track with quantity 1
      {
        curtainType: 'track',
        curtainTypeName: product.name || 'جسر سكة ألمنيوم',
        resolvedImage: trackImage,
      }
    );
    onClose();
  };

  const handleWhatsApp = () => {
    const lengthStr = hasValidLength
      ? `${numLength} سم (${formatPriceDisplay(unitPriceTrack)} د.أ)`
      : 'تفصيل حسب الطول المطلوب';
    const message = `مرحباً متجر سيتارة، أود الاستفسار عن ${product.name} (طول السكة: ${lengthStr}).`;
    const targetUrl = getWhatsAppUrl(message);
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="relative w-full max-w-4xl bg-[#211B17] text-[#F5EFE6] border border-[#C8AA78]/30 rounded-xl shadow-2xl overflow-y-auto md:overflow-hidden max-h-[88vh] sm:max-h-[90vh] md:max-h-[92vh] flex flex-col md:flex-row my-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        aria-label="إغلاق"
        className="sticky top-3 left-3 z-50 self-start float-left -mb-10 sm:-mb-12 p-2 rounded-full bg-[#171513]/90 hover:bg-[#171513] text-[#F5EFE6] hover:text-[#C8AA78] border border-white/10 transition-colors cursor-pointer shadow-md md:absolute md:top-4 md:left-4 md:mb-0"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Visual Column */}
      <div className="w-full md:w-[48%] lg:w-[46%] p-5 sm:p-6 md:p-7 bg-[#1B1613] flex flex-col justify-between border-b md:border-b-0 md:border-l border-white/10 shrink-0 md:overflow-y-auto md:max-h-[92vh]">
        <div>
          <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-[#2A231E] border border-white/10 shadow-inner">
            <Image
              src={trackImage}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center select-none"
              priority
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-3 right-3 flex flex-wrap gap-1.5 max-w-[85%]">
              <span className="px-2.5 py-1 text-[11px] font-bold text-[#171513] bg-[#C8AA78] rounded-md shadow-xs">
                {product.name}
              </span>
              <span className="px-2.5 py-1 text-[11px] font-semibold text-[#F5EFE6] bg-[#171513]/85 backdrop-blur-xs rounded-md border border-white/10">
                سكك وملحقات
              </span>
              <span className="px-2.5 py-1 text-[11px] font-medium text-emerald-400 bg-[#171513]/85 backdrop-blur-xs rounded-md border border-white/10">
                عجلات سايلنت
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-[#D8C6AE]/75 px-1">
            <span className="text-[#D8C6AE]">معدل السعر:</span>
            <span className="text-[#C8AA78] font-bold">5 د.أ للمتر الطولي</span>
          </div>
        </div>

        {/* Specifications */}
        <div className="mt-4 p-3.5 bg-[#171513] rounded-lg border border-white/5 space-y-2 text-xs text-[#D8C6AE]">
          <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
            <span className="text-[#D8C6AE]/70">النوع:</span>
            <span className="font-semibold text-[#F5EFE6]">سكة ألمنيوم مدهونة حرارياً وملبّسة بالبلاستيك</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
            <span className="text-[#D8C6AE]/70">الحركة:</span>
            <span className="font-semibold text-[#C8AA78]">انسيابية وهادئة — سايلنت</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#D8C6AE]/70">التفصيل:</span>
            <span className="font-semibold text-emerald-400">حسب الطول المطلوب بالسنتيمتر</span>
          </div>
        </div>
      </div>

      {/* Configuration Column */}
      <div className="w-full md:w-[52%] lg:w-[54%] p-5 sm:p-6 md:p-8 flex flex-col justify-between text-right md:overflow-y-auto md:max-h-[92vh]">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#C8AA78] font-bold block mb-1">
            سكك وملحقات الستائر
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F5EFE6]">
            {product.name}
          </h2>
          <p className="text-xs text-[#D8C6AE]/75 mt-1 leading-relaxed">
            {product.shortDesc || 'ألمنيوم مدهون حراريًا وملبّس بالبلاستيك لحركة هادئة — سايلنت.'}
          </p>

          {/* Rate Banner */}
          <div className="mt-3.5 p-3.5 bg-[#171513] rounded-lg border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#D8C6AE]/70 block">
                السعر المحسوب:
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                {hasValidLength ? (
                  <>
                    <span className="text-2xl font-extrabold text-[#C8AA78] tabular-nums">
                      {formatPriceDisplay(unitPriceTrack)}
                    </span>
                    <span className="text-xs text-[#D8C6AE]">{SHOP_CONFIG.currencySymbol}</span>
                  </>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-[#C8AA78]">
                      5 د.أ للمتر الطولي
                    </span>
                    <span className="text-xs text-[#D8C6AE]/70">
                      · أدخل طول السكة لحساب السعر
                    </span>
                  </div>
                )}
              </div>
            </div>
            <span className="text-[11px] text-[#D8C6AE]/60">
              0.05 د.أ لكل سم
            </span>
          </div>

          {/* SINGLE EDITABLE FIELD */}
          <div className="mt-5 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#F5EFE6] flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-[#C8AA78]" />
                  <span>طول السكة (سم)</span>
                  <span className="text-red-400">*</span>
                </label>
                {hasValidLength && (
                  <span className="text-xs text-[#C8AA78] font-semibold tabular-nums">
                    {(numLength / 100).toFixed(2)} متر
                  </span>
                )}
              </div>

              <input
                type="number"
                min="1"
                step="any"
                value={trackLengthCm}
                onChange={(e) => {
                  setTrackLengthCm(e.target.value);
                  setValidationError(null);
                }}
                placeholder="أدخل طول السكة (سم) — مثال: 250"
                className="w-full px-3.5 py-3 bg-[#171513] border border-white/15 focus:border-[#C8AA78] rounded-lg text-sm text-[#F5EFE6] outline-none transition-colors tabular-nums placeholder:text-[#D8C6AE]/40"
                autoFocus
              />
              <span className="text-[11px] text-[#D8C6AE]/60 block mt-1">
                سعر المتر الطولي 5 د.أ (مثال: 100 سم = 5 د.أ، 250 سم = 12.50 د.أ).
              </span>
            </div>

            {/* Live Calculation summary */}
            {hasValidLength && (
              <div className="p-3 bg-[#171513] rounded-lg border border-white/5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[#D8C6AE]">
                  <span>الطول المطلوب:</span>
                  <span className="font-bold text-[#F5EFE6] tabular-nums">
                    {numLength} سم ({(numLength / 100).toFixed(2)} م)
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#D8C6AE]">
                  <span>معدل السعر:</span>
                  <span className="font-semibold text-[#C8AA78]">5 د.أ / متر (0.05 د.أ / سم)</span>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
                  <span className="font-bold text-[#F5EFE6]">السعر الإجمالي:</span>
                  <span className="font-extrabold text-[#C8AA78] text-sm tabular-nums">
                    {formatPriceDisplay(unitPriceTrack)} {SHOP_CONFIG.currencySymbol}
                  </span>
                </div>
              </div>
            )}
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
          <button
            type="button"
            onClick={handleAdd}
            disabled={!hasValidLength}
            className="w-full py-3.5 px-6 rounded-lg bg-[#C8AA78] hover:bg-[#d5ba8c] disabled:opacity-40 disabled:cursor-not-allowed text-[#171513] font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              {hasValidLength
                ? `إضافة إلى السلة · ${formatPriceDisplay(unitPriceTrack)} ${SHOP_CONFIG.currencySymbol}`
                : 'أدخل طول السكة لحساب السعر'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleWhatsApp}
            className="w-full py-2.5 px-4 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>استفسار عبر واتساب</span>
          </button>

          <p className="text-[11px] text-center text-[#D8C6AE]/60 mt-1.5">
            {SHOP_CONFIG.deliveryPricingNote}
          </p>
        </div>
      </div>
    </div>
  );
}

function InstallationServiceModalContent({
  product,
  onClose,
  onAddToCart,
}: ProductModalContentProps) {
  // 1. Required location selection: "amman" (داخل عمان) or "outside" (خارج عمان)
  const [selectedLocation, setSelectedLocation] = useState<'amman' | 'outside' | null>(null);

  // 2. “عدد الستائر المطلوب تركيبها” — positive integer, default 1
  const [curtainCount, setCurtainCount] = useState<number>(1);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isValidCount = Number.isInteger(curtainCount) && curtainCount >= 1;
  const unitPrice = selectedLocation === 'amman' ? 10 : selectedLocation === 'outside' ? 25 : 0;
  const lineTotal = isValidCount && selectedLocation ? unitPrice * curtainCount : 0;
  const locationLabel = selectedLocation === 'amman' ? 'داخل عمان' : selectedLocation === 'outside' ? 'خارج عمان' : '';

  const serviceImage = product.mainImage || '/images/curtain_installation_service.png';

  const defaultColor: ColorOption = {
    id: 'service_location',
    name: locationLabel || 'خدمة تركيب ستائر',
    hex: '#C8AA78',
    image: serviceImage,
    gallery: [serviceImage],
  };

  const handleAdd = () => {
    if (!selectedLocation) {
      setValidationError('يرجى تحديد المنطقة أولاً (داخل عمان أو خارج عمان).');
      return;
    }
    if (!isValidCount) {
      setValidationError('يرجى تحديد عدد صحيح موجب للستائر (ستارة واحدة على الأقل).');
      return;
    }

    onAddToCart(
      product,
      defaultColor,
      {
        id: `service_${selectedLocation}_${curtainCount}`,
        label: `${curtainCount} ستائر (${locationLabel})`,
        widthCm: 0,
        heightCm: 0,
        price: unitPrice,
      },
      curtainCount, // Cart quantity = number of curtains requiring installation
      {
        curtainType: 'service',
        curtainTypeName: product.name || 'طلب فني تركيب',
        serviceLocation: locationLabel,
        isService: true,
        resolvedImage: serviceImage,
      }
    );
    onClose();
  };

  const handleWhatsApp = () => {
    const locStr = locationLabel ? `المنطقة: ${locationLabel}` : 'المنطقة غير محددة';
    const message = `مرحباً متجر سيتارة، أود الاستفسار عن ${product.name} (${locStr}، عدد الستائر: ${curtainCount} — التكلفة: ${lineTotal > 0 ? `${lineTotal} د.أ` : 'حسب المنطقة'}).`;
    const targetUrl = getWhatsAppUrl(message);
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="relative w-full max-w-4xl bg-[#211B17] text-[#F5EFE6] border border-[#C8AA78]/30 rounded-xl shadow-2xl overflow-y-auto md:overflow-hidden max-h-[88vh] sm:max-h-[90vh] md:max-h-[92vh] flex flex-col md:flex-row my-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        aria-label="إغلاق"
        className="sticky top-3 left-3 z-50 self-start float-left -mb-10 sm:-mb-12 p-2 rounded-full bg-[#171513]/90 hover:bg-[#171513] text-[#F5EFE6] hover:text-[#C8AA78] border border-white/10 transition-colors cursor-pointer shadow-md md:absolute md:top-4 md:left-4 md:mb-0"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Visual Column */}
      <div className="w-full md:w-[48%] lg:w-[46%] p-5 sm:p-6 md:p-7 bg-[#1B1613] flex flex-col justify-between border-b md:border-b-0 md:border-l border-white/10 shrink-0 md:overflow-y-auto md:max-h-[92vh]">
        <div>
          <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-[#2A231E] border border-white/10 shadow-inner">
            <Image
              src={serviceImage}
              alt="خدمة فني تركيب ستائر — تثبيت سكة ومسار الستائر باحترافية أعلى النافذة"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center select-none"
              priority
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-3 right-3 flex flex-wrap gap-1.5 max-w-[85%]">
              <span className="px-2.5 py-1 text-[11px] font-bold text-[#171513] bg-[#C8AA78] rounded-md shadow-xs">
                {product.name}
              </span>
              <span className="px-2.5 py-1 text-[11px] font-semibold text-[#F5EFE6] bg-[#171513]/85 backdrop-blur-xs rounded-md border border-white/10">
                خدمات التركيب
              </span>
              <span className="px-2.5 py-1 text-[11px] font-medium text-emerald-400 bg-[#171513]/85 backdrop-blur-xs rounded-md border border-white/10">
                فني معتمد
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-[#D8C6AE]/75 px-1">
            <span className="text-[#D8C6AE]">تسعيرة الخدمة:</span>
            <span className="text-[#C8AA78] font-bold">10 د.أ داخل عمان / 25 د.أ خارج عمان</span>
          </div>
        </div>

        {/* Specifications */}
        <div className="mt-4 p-3.5 bg-[#171513] rounded-lg border border-white/5 space-y-2 text-xs text-[#D8C6AE]">
          <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
            <span className="text-[#D8C6AE]/70">طبيعة الخدمة:</span>
            <span className="font-semibold text-[#F5EFE6]">فني متخصص لتركيب وتثبيت الستائر</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
            <span className="text-[#D8C6AE]/70">المنطقة المشمولة:</span>
            <span className="font-semibold text-[#C8AA78]">كافة محافظات ومناطق المملكة</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#D8C6AE]/70">طريقة الحساب:</span>
            <span className="font-semibold text-emerald-400">تكلفة محددة لكل ستارة فقط</span>
          </div>
        </div>
      </div>

      {/* Configuration Column */}
      <div className="w-full md:w-[52%] lg:w-[54%] p-5 sm:p-6 md:p-8 flex flex-col justify-between text-right md:overflow-y-auto md:max-h-[92vh]">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#C8AA78] font-bold block mb-1">
            خدمات التركيب والتثبيت
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F5EFE6]">
            {product.name}
          </h2>
          <p className="text-xs text-[#D8C6AE]/85 mt-1.5 leading-relaxed bg-[#171513] p-2.5 rounded-lg border border-white/5">
            تُحسب تكلفة التركيب لكل ستارة حسب المنطقة المختارة.
          </p>

          {/* Rate Banner */}
          <div className="mt-3.5 p-3.5 bg-[#171513] rounded-lg border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#D8C6AE]/70 block">
                التكلفة المحسوبة:
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                {selectedLocation ? (
                  <>
                    <span className="text-2xl font-extrabold text-[#C8AA78] tabular-nums">
                      {lineTotal}
                    </span>
                    <span className="text-xs text-[#D8C6AE]">{SHOP_CONFIG.currencySymbol}</span>
                    <span className="text-[11px] text-[#D8C6AE]/70 mr-1.5">
                      ({unitPrice} د.أ × {curtainCount} ستائر)
                    </span>
                  </>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm sm:text-base font-bold text-[#C8AA78]">
                      اختر المنطقة لتحديد التكلفة
                    </span>
                  </div>
                )}
              </div>
            </div>
            {selectedLocation && (
              <span className="text-[11px] text-[#D8C6AE]/60">
                {locationLabel}
              </span>
            )}
          </div>

          <div className="mt-5 space-y-4">
            {/* 1. Required location selection */}
            <div>
              <label className="text-xs font-bold text-[#F5EFE6] flex items-center gap-1.5 mb-2">
                <MapPin className="w-3.5 h-3.5 text-[#C8AA78]" />
                <span>1. تحديد المنطقة</span>
                <span className="text-red-400">*</span>
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLocation('amman');
                    setValidationError(null);
                  }}
                  className={`p-3 rounded-lg border text-right transition-all cursor-pointer ${
                    selectedLocation === 'amman'
                      ? 'bg-[#2E251F] border-[#C8AA78] text-[#F5EFE6] shadow-xs ring-1 ring-[#C8AA78]'
                      : 'bg-[#171513] border-white/10 text-[#D8C6AE] hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold">داخل عمان</span>
                    {selectedLocation === 'amman' && (
                      <Check className="w-4 h-4 text-[#C8AA78] shrink-0" />
                    )}
                  </div>
                  <span className="text-[11px] text-[#C8AA78] font-bold block mt-1 tabular-nums">
                    10 د.أ لكل ستارة
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedLocation('outside');
                    setValidationError(null);
                  }}
                  className={`p-3 rounded-lg border text-right transition-all cursor-pointer ${
                    selectedLocation === 'outside'
                      ? 'bg-[#2E251F] border-[#C8AA78] text-[#F5EFE6] shadow-xs ring-1 ring-[#C8AA78]'
                      : 'bg-[#171513] border-white/10 text-[#D8C6AE] hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold">خارج عمان</span>
                    {selectedLocation === 'outside' && (
                      <Check className="w-4 h-4 text-[#C8AA78] shrink-0" />
                    )}
                  </div>
                  <span className="text-[11px] text-[#C8AA78] font-bold block mt-1 tabular-nums">
                    25 د.أ لكل ستارة
                  </span>
                </button>
              </div>
            </div>

            {/* 2. “عدد الستائر المطلوب تركيبها” — positive integer, default 1 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#F5EFE6] flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-[#C8AA78]" />
                  <span>2. عدد الستائر المطلوب تركيبها</span>
                  <span className="text-red-400">*</span>
                </label>
                <span className="text-xs text-[#C8AA78] font-semibold tabular-nums">
                  {curtainCount} {curtainCount === 1 ? 'ستارة' : curtainCount === 2 ? 'ستارتان' : 'ستائر'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-[#171513] border border-white/10 rounded-lg">
                <span className="text-xs text-[#D8C6AE]/80">
                  عدد الستائر:
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCurtainCount((c) => Math.max(1, c - 1))}
                    disabled={curtainCount <= 1}
                    className="w-8 h-8 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 text-[#F5EFE6] transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={curtainCount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 1) {
                        setCurtainCount(val);
                      }
                      setValidationError(null);
                    }}
                    className="w-12 text-center text-sm font-bold tabular-nums text-[#F5EFE6] bg-transparent outline-none border-b border-[#C8AA78]/40 focus:border-[#C8AA78]"
                  />
                  <button
                    type="button"
                    onClick={() => setCurtainCount((c) => Math.min(100, c + 1))}
                    className="w-8 h-8 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-[#F5EFE6] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <span className="text-[11px] text-[#D8C6AE]/60 block mt-1.5">
                تُحسب التكلفة لعدد الستائر المطلوبة فقط؛ ولا تُحسب السكك أو الملحقات تلقائياً.
              </span>
            </div>

            {/* 3. Live calculated total breakdown */}
            {selectedLocation && (
              <div className="p-3 bg-[#171513] rounded-lg border border-white/5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[#D8C6AE]">
                  <span>المنطقة المحددة:</span>
                  <span className="font-bold text-[#F5EFE6]">{locationLabel}</span>
                </div>
                <div className="flex items-center justify-between text-[#D8C6AE]">
                  <span>تكلفة تركيب الستارة الواحدة:</span>
                  <span className="font-semibold text-[#C8AA78]">{unitPrice} د.أ</span>
                </div>
                <div className="flex items-center justify-between text-[#D8C6AE]">
                  <span>عدد الستائر:</span>
                  <span className="font-bold text-[#F5EFE6] tabular-nums">{curtainCount}</span>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
                  <span className="font-bold text-[#F5EFE6]">إجمالي خدمة التركيب:</span>
                  <span className="font-extrabold text-[#C8AA78] text-sm tabular-nums">
                    {lineTotal} {SHOP_CONFIG.currencySymbol}
                  </span>
                </div>
              </div>
            )}
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
          {/* 4. “إضافة خدمة التركيب للسلة” button */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={!selectedLocation || !isValidCount}
            className="w-full py-3.5 px-6 rounded-lg bg-[#C8AA78] hover:bg-[#d5ba8c] disabled:opacity-40 disabled:cursor-not-allowed text-[#171513] font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              {selectedLocation
                ? `إضافة خدمة التركيب للسلة · ${lineTotal} ${SHOP_CONFIG.currencySymbol}`
                : 'يرجى اختيار المنطقة لإضافة الخدمة'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleWhatsApp}
            className="w-full py-2.5 px-4 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>استفسار عن التركيب عبر واتساب</span>
          </button>

          <p className="text-[11px] text-center text-[#D8C6AE]/60 mt-1.5">
            {SHOP_CONFIG.deliveryPricingNote}
          </p>
        </div>
      </div>
    </div>
  );
}

function DryCleaningServiceModalContent({
  product,
  onClose,
  onAddToCart,
}: ProductModalContentProps) {
  // “عدد الستائر” input: positive integer, default 1
  const [curtainCount, setCurtainCount] = useState<number>(1);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isValidCount = Number.isInteger(curtainCount) && curtainCount >= 1;
  const unitPrice = 25; // 25 JOD per curtain
  const lineTotal = isValidCount ? unitPrice * curtainCount : 0;

  const serviceImage = product.mainImage || '/images/curtain_dry_cleaning.jpg';

  const defaultColor: ColorOption = {
    id: 'dry_cleaning_location',
    name: 'داخل عمان فقط',
    hex: '#C8AA78',
    image: serviceImage,
    gallery: [serviceImage],
  };

  const handleAdd = () => {
    if (!isValidCount) {
      setValidationError('يرجى تحديد عدد صحيح موجب للستائر (ستارة واحدة على الأقل).');
      return;
    }

    onAddToCart(
      product,
      defaultColor,
      {
        id: `dry_cleaning_${curtainCount}`,
        label: `${curtainCount} ستائر (داخل عمان فقط)`,
        widthCm: 0,
        heightCm: 0,
        price: unitPrice,
      },
      curtainCount, // Cart quantity = curtain count
      {
        curtainType: 'service',
        curtainTypeName: product.name || 'دراي كلين للستائر',
        serviceLocation: 'داخل عمان فقط',
        isService: true,
        isDryCleaning: true,
        resolvedImage: serviceImage,
      }
    );
    onClose();
  };

  const handleWhatsApp = () => {
    const message = `مرحباً متجر سيتارة، أود الاستفسار عن خدمة ${product.name} (متوفر داخل عمان فقط، عدد الستائر: ${curtainCount} — التكلفة: ${lineTotal} د.أ).`;
    const targetUrl = getWhatsAppUrl(message);
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="relative w-full max-w-4xl bg-[#211B17] text-[#F5EFE6] border border-[#C8AA78]/30 rounded-xl shadow-2xl overflow-y-auto md:overflow-hidden max-h-[88vh] sm:max-h-[90vh] md:max-h-[92vh] flex flex-col md:flex-row my-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        aria-label="إغلاق"
        className="sticky top-3 left-3 z-50 self-start float-left -mb-10 sm:-mb-12 p-2 rounded-full bg-[#171513]/90 hover:bg-[#171513] text-[#F5EFE6] hover:text-[#C8AA78] border border-white/10 transition-colors cursor-pointer shadow-md md:absolute md:top-4 md:left-4 md:mb-0"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Visual Column */}
      <div className="w-full md:w-[48%] lg:w-[46%] p-5 sm:p-6 md:p-7 bg-[#1B1613] flex flex-col justify-between border-b md:border-b-0 md:border-l border-white/10 shrink-0 md:overflow-y-auto md:max-h-[92vh]">
        <div>
          <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-[#2A231E] border border-white/10 shadow-inner">
            <Image
              src={serviceImage}
              alt="خدمة دراي كلين للستائر — فك وغسيل وكي وتعقيم أقمشة الستائر بالبخار"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center select-none"
              priority
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-3 right-3 flex flex-wrap gap-1.5 max-w-[85%]">
              <span className="px-2.5 py-1 text-[11px] font-bold text-[#171513] bg-[#C8AA78] rounded-md shadow-xs">
                {product.name}
              </span>
              <span className="px-2.5 py-1 text-[11px] font-semibold text-[#F5EFE6] bg-[#171513]/85 backdrop-blur-xs rounded-md border border-white/10">
                خدمات العناية والتركيب
              </span>
              <span className="px-2.5 py-1 text-[10px] font-bold text-amber-900 bg-amber-100/95 border border-amber-300/60 rounded-md shadow-2xs">
                متوفر داخل عمان فقط
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-[#D8C6AE]/75 px-1">
            <span className="text-[#D8C6AE]">تسعيرة الخدمة:</span>
            <span className="text-[#C8AA78] font-bold">25 د.أ لكل ستارة</span>
          </div>
        </div>

        {/* Specifications */}
        <div className="mt-4 p-3.5 bg-[#171513] rounded-lg border border-white/5 space-y-2 text-xs text-[#D8C6AE]">
          <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
            <span className="text-[#D8C6AE]/70">مراحل الخدمة:</span>
            <span className="font-semibold text-[#F5EFE6]">فك، غسيل، كوي، وإعادة تركيب</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
            <span className="text-[#D8C6AE]/70">نطاق التغطية:</span>
            <span className="font-semibold text-[#C8AA78]">متوفر داخل عمّان فقط</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#D8C6AE]/70">رسوم إضافية:</span>
            <span className="font-semibold text-emerald-400">شاملة بالكامل دون أي رسوم تركيب إضافية</span>
          </div>
        </div>
      </div>

      {/* Configuration Column */}
      <div className="w-full md:w-[52%] lg:w-[54%] p-5 sm:p-6 md:p-8 flex flex-col justify-between text-right md:overflow-y-auto md:max-h-[92vh]">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider text-[#C8AA78] font-bold">
              خدمات العناية بالستائر
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold text-amber-900 bg-amber-100/95 border border-amber-300/60 rounded-xs">
              متوفر داخل عمان فقط
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F5EFE6]">
            {product.name}
          </h2>
          <p className="text-xs text-[#D8C6AE]/85 mt-1.5 leading-relaxed bg-[#171513] p-2.5 rounded-lg border border-white/5">
            {product.shortDesc || 'خدمة متكاملة تشمل فك الستارة وغسيلها وكويها وإعادة تركيبها.'}
          </p>

          {/* Rate Banner */}
          <div className="mt-3.5 p-3.5 bg-[#171513] rounded-lg border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#D8C6AE]/70 block">
                التكلفة الإجمالية المحسوبة:
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-extrabold text-[#C8AA78] tabular-nums">
                  {lineTotal}
                </span>
                <span className="text-xs text-[#D8C6AE]">{SHOP_CONFIG.currencySymbol}</span>
                <span className="text-[11px] text-[#D8C6AE]/70 mr-1.5">
                  (25 د.أ × {curtainCount} ستائر)
                </span>
              </div>
            </div>
            <div className="text-left">
              <span className="text-[11px] text-[#C8AA78] font-bold block">
                25 د.أ / للستارة
              </span>
              <span className="text-[10px] text-[#D8C6AE]/60">
                شامل الفك والكوي والتركيب
              </span>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {/* “عدد الستائر” input: positive integer, default 1 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#F5EFE6] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C8AA78]" />
                  <span>عدد الستائر المطلوب تنظيفها</span>
                  <span className="text-red-400">*</span>
                </label>
                <span className="text-xs text-[#C8AA78] font-semibold tabular-nums">
                  {curtainCount} {curtainCount === 1 ? 'ستارة' : curtainCount === 2 ? 'ستارتان' : 'ستائر'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-[#171513] border border-white/10 rounded-lg">
                <span className="text-xs text-[#D8C6AE]/80">
                  حدد عدد الستائر:
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCurtainCount((c) => Math.max(1, c - 1))}
                    disabled={curtainCount <= 1}
                    className="w-8 h-8 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 text-[#F5EFE6] transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={curtainCount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 1) {
                        setCurtainCount(val);
                      }
                      setValidationError(null);
                    }}
                    className="w-12 text-center text-sm font-bold tabular-nums text-[#F5EFE6] bg-transparent outline-none border-b border-[#C8AA78]/40 focus:border-[#C8AA78]"
                  />
                  <button
                    type="button"
                    onClick={() => setCurtainCount((c) => Math.min(100, c + 1))}
                    className="w-8 h-8 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-[#F5EFE6] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <span className="text-[11px] text-[#D8C6AE]/60 block mt-1.5">
                يشمل السعر (25 د.أ لكل ستارة) فك الستارة ونقلها وغسيلها وكويها وإعادة تركيبها بالكامل.
              </span>
            </div>

            {/* Live calculated summary breakdown */}
            <div className="p-3 bg-[#171513] rounded-lg border border-white/5 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[#D8C6AE]">
                <span>نطاق الخدمة:</span>
                <span className="font-bold text-[#F5EFE6]">داخل عمان فقط</span>
              </div>
              <div className="flex items-center justify-between text-[#D8C6AE]">
                <span>تكلفة الخدمة لكل ستارة:</span>
                <span className="font-semibold text-[#C8AA78]">25 د.أ (شاملة الفك والغسيل والكوي والتركيب)</span>
              </div>
              <div className="flex items-center justify-between text-[#D8C6AE]">
                <span>عدد الستائر:</span>
                <span className="font-bold text-[#F5EFE6] tabular-nums">{curtainCount}</span>
              </div>
              <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
                <span className="font-bold text-[#F5EFE6]">إجمالي خدمة الدراي كلين:</span>
                <span className="font-extrabold text-[#C8AA78] text-sm tabular-nums">
                  {lineTotal} {SHOP_CONFIG.currencySymbol}
                </span>
              </div>
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
          {/* “إضافة الخدمة للسلة” button */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={!isValidCount}
            className="w-full py-3.5 px-6 rounded-lg bg-[#C8AA78] hover:bg-[#d5ba8c] disabled:opacity-40 disabled:cursor-not-allowed text-[#171513] font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              إضافة الخدمة للسلة · {lineTotal} {SHOP_CONFIG.currencySymbol}
            </span>
          </button>

          <button
            type="button"
            onClick={handleWhatsApp}
            className="w-full py-2.5 px-4 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>استفسار عن خدمة الدراي كلين عبر واتساب</span>
          </button>

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
    if (product) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenProductModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [product, setOpenProductModal]);

  if (!product) return null;

  const isTrack =
    Boolean(product.isTrackAccessory) ||
    product.id === 'curtain-track-aluminum' ||
    product.category === 'tracks';

  const isDryCleaning =
    Boolean(product.isDryCleaningService) ||
    product.id === 'service-dry-cleaning';

  const isInstallationService =
    !isDryCleaning &&
    (Boolean(product.isInstallationService) ||
      product.id === 'service-installation' ||
      (product.category === 'services' && product.id !== 'service-dry-cleaning') ||
      (product.curtainType === 'service' && product.id !== 'service-dry-cleaning'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      {isDryCleaning ? (
        <DryCleaningServiceModalContent
          key={product.id}
          product={product}
          onClose={() => setOpenProductModal(null)}
          onAddToCart={addItem}
        />
      ) : isInstallationService ? (
        <InstallationServiceModalContent
          key={product.id}
          product={product}
          onClose={() => setOpenProductModal(null)}
          onAddToCart={addItem}
        />
      ) : isTrack ? (
        <TrackProductModalContent
          key={product.id}
          product={product}
          onClose={() => setOpenProductModal(null)}
          onAddToCart={addItem}
        />
      ) : (
        <ProductModalContent
          key={product.id}
          product={product}
          onClose={() => setOpenProductModal(null)}
          onAddToCart={addItem}
        />
      )}
    </div>
  );
}
