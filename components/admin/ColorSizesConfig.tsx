'use client';

import React, { useState } from 'react';
import { Plus, Check, Trash2, SlidersHorizontal, AlertCircle } from 'lucide-react';

interface ColorSizesConfigProps {
  color: any;
  allSizes: any[];
  variants: any[];
  onChangeVariants: (updatedVariants: any[]) => void;
  onAddSizeDefinition: (newSize: any) => void;
}

export default function ColorSizesConfig({
  color,
  allSizes,
  variants,
  onChangeVariants,
  onAddSizeDefinition,
}: ColorSizesConfigProps) {
  const [isAddingCustomSize, setIsAddingCustomSize] = useState(false);
  const [customWidth, setCustomWidth] = useState<string>('');
  const [customHeight, setCustomHeight] = useState<string>('');
  const [customPrice, setCustomPrice] = useState<string>('25');
  const [customStock, setCustomStock] = useState<string>('10');
  const [customError, setCustomError] = useState<string | null>(null);

  const isVariantForThisColorAndSize = (v: any, sizeId: string, sizeLabel?: string) => {
    const colorMatch = v.color_id === color.id || (Boolean(color.name) && v.color_name === color.name);
    const sizeMatch = v.size_id === sizeId || (Boolean(sizeLabel) && v.size_label === sizeLabel);
    return colorMatch && sizeMatch;
  };

  // Active variants specifically configured for this color
  const colorVariants = variants.filter(
    (v) =>
      (v.color_id === color.id || (Boolean(color.name) && v.color_name === color.name)) &&
      v.is_available !== false
  );

  const isSizeEnabled = (sizeId: string, sizeLabel?: string) => {
    return colorVariants.some((v) => isVariantForThisColorAndSize(v, sizeId, sizeLabel));
  };

  const getVariantForSize = (sizeId: string, sizeLabel?: string) => {
    return variants.find((v) => isVariantForThisColorAndSize(v, sizeId, sizeLabel));
  };

  const handleToggleSize = (size: any) => {
    const existing = getVariantForSize(size.id, size.label);

    if (existing && existing.is_available !== false) {
      // Disable / remove this size for this color
      // Removing it from variants ensures unselected combinations remain completely absent
      const updated = variants.filter((v) => v !== existing);
      onChangeVariants(updated);
    } else if (existing) {
      // Re-enable existing
      const updated = variants.map((v) =>
        v === existing ? { ...v, is_available: true } : v
      );
      onChangeVariants(updated);
    } else {
      // Add new variant for this color and size
      const defaultPrice = Number(size.price) > 0 ? Number(size.price) : 25.0;
      const newVar = {
        id: `temp_var_${color.id}_${size.id}`,
        color_id: color.id,
        color_name: color.name,
        size_id: size.id,
        size_label: size.label,
        price: defaultPrice,
        stock_quantity: 10,
        is_available: true,
      };
      onChangeVariants([...variants, newVar]);
    }
  };

  const handlePriceChange = (sizeId: string, sizeLabel: string, price: number) => {
    const updated = variants.map((v) => {
      const match = isVariantForThisColorAndSize(v, sizeId, sizeLabel);
      return match ? { ...v, price: Math.max(0, price) } : v;
    });
    onChangeVariants(updated);
  };

  const handleStockChange = (sizeId: string, sizeLabel: string, stock: number) => {
    const updated = variants.map((v) => {
      const match = isVariantForThisColorAndSize(v, sizeId, sizeLabel);
      return match ? { ...v, stock_quantity: Math.max(0, stock) } : v;
    });
    onChangeVariants(updated);
  };

  const handleCreateCustomSize = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);

    const width = parseFloat(customWidth);
    const height = parseFloat(customHeight);
    const price = parseFloat(customPrice);
    const stock = parseInt(customStock, 10);

    if (isNaN(width) || width <= 0) {
      setCustomError('يرجى إدخال عرض صحيح بالسنتيمتر.');
      return;
    }
    if (isNaN(height) || height <= 0) {
      setCustomError('يرجى إدخال ارتفاع صحيح بالسنتيمتر.');
      return;
    }

    const label = `${width} × ${height} سم`;

    // Check if this size definition already exists
    let existingSize = allSizes.find(
      (s) => (s.width_cm === width && s.height_cm === height) || s.label === label
    );

    let sizeId = existingSize?.id;

    if (!existingSize) {
      const newSizeDef = {
        id: `temp_sz_${Date.now()}`,
        size_key: `sz_${width}x${height}_${Date.now().toString(36)}`,
        label,
        width_cm: width,
        height_cm: height,
        display_order: allSizes.length + 1,
      };
      onAddSizeDefinition(newSizeDef);
      sizeId = newSizeDef.id;
    }

    // Enable variant for this color immediately
    const newVariant = {
      id: `temp_var_${color.id}_${sizeId}`,
      color_id: color.id,
      color_name: color.name,
      size_id: sizeId,
      size_label: label,
      price: !isNaN(price) && price >= 0 ? price : 25.0,
      stock_quantity: !isNaN(stock) && stock >= 0 ? stock : 10,
      is_available: true,
    };

    // Filter out if already in variants to avoid duplicate
    const updatedVariants = variants.filter(
      (v) =>
        !(
          (v.color_id === color.id || v.color_name === color.name) &&
          (v.size_id === sizeId || v.size_label === label)
        )
    );

    onChangeVariants([...updatedVariants, newVariant]);

    // Reset form
    setCustomWidth('');
    setCustomHeight('');
    setIsAddingCustomSize(false);
  };

  return (
    <div className="mt-3 pt-3 border-t border-white/10 space-y-2 text-right">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-[#C8AA78] flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#C8AA78]" />
          <span>المقاسات المتاحة لهذا اللون ({colorVariants.length})</span>
        </label>
        <button
          type="button"
          onClick={() => setIsAddingCustomSize((prev) => !prev)}
          className="text-[11px] text-[#C8AA78] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>إضافة مقاس بالأبعاد (سم)</span>
        </button>
      </div>

      <p className="text-[11px] text-[#D8C6AE]/70">
        حدد المقاسات المعيارية التي يتوفر بها لون <strong className="text-[#F5EFE6]">&ldquo;{color.name}&rdquo;</strong> مع ضبط سعر وكمية كل مقاس.
      </p>

      {/* Available sizes selection grid */}
      <div className="space-y-2 mt-2">
        {allSizes.length === 0 ? (
          <div className="p-3 bg-[#211B17] rounded-md border border-white/10 text-xs text-[#D8C6AE]/60 text-center">
            لا توجد مقاسات معرّفة بعد. اضغط &ldquo;إضافة مقاس بالأبعاد&rdquo; لتعريف أول مقاس لهذا اللون.
          </div>
        ) : (
          allSizes.map((size) => {
            const enabled = isSizeEnabled(size.id, size.label);
            const variant = getVariantForSize(size.id, size.label);

            return (
              <div
                key={size.id}
                className={`p-2.5 rounded-lg border transition-all ${
                  enabled
                    ? 'bg-[#211B17] border-[#C8AA78]/50 shadow-xs'
                    : 'bg-[#171513] border-white/5 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  {/* Checkbox and Size Label */}
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold select-none">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={() => handleToggleSize(size)}
                      className="w-4 h-4 rounded border-white/20 bg-[#171513] text-[#C8AA78] focus:ring-0 cursor-pointer"
                    />
                    <span className={enabled ? 'text-[#F5EFE6]' : 'text-[#D8C6AE]/70'}>
                      {size.label}
                    </span>
                    <span className="text-[10px] text-[#D8C6AE]/50 font-normal">
                      ({size.width_cm} × {size.height_cm} سم)
                    </span>
                  </label>

                  {/* Inline Price and Stock when Enabled */}
                  {enabled && variant && (
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-[10px] text-[#D8C6AE]/70">السعر:</span>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={variant.price}
                          onChange={(e) =>
                            handlePriceChange(size.id, size.label, parseFloat(e.target.value) || 0)
                          }
                          className="w-20 px-2 py-1 bg-[#171513] border border-white/15 rounded text-xs text-[#F5EFE6] font-bold text-center"
                        />
                        <span className="text-[10px] text-[#C8AA78]">د.أ</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-[10px] text-[#D8C6AE]/70">المخزون:</span>
                        <input
                          type="number"
                          min="0"
                          value={variant.stock_quantity ?? 10}
                          onChange={(e) =>
                            handleStockChange(size.id, size.label, parseInt(e.target.value, 10) || 0)
                          }
                          className="w-16 px-2 py-1 bg-[#171513] border border-white/15 rounded text-xs text-[#F5EFE6] font-mono text-center"
                        />
                        <span className="text-[10px] text-[#D8C6AE]/60">قطعة</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Custom Size Inline Form */}
      {isAddingCustomSize && (
        <form
          onSubmit={handleCreateCustomSize}
          className="mt-3 p-3 bg-[#211B17] border border-[#C8AA78]/30 rounded-lg space-y-2.5"
        >
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold text-[#F5EFE6]">
              إضافة مقاس جديد وتفعيله للون &ldquo;{color.name}&rdquo;
            </h5>
            <button
              type="button"
              onClick={() => setIsAddingCustomSize(false)}
              className="text-[11px] text-[#D8C6AE]/60 hover:text-white"
            >
              إلغاء
            </button>
          </div>

          {customError && (
            <div className="p-2 bg-red-950/60 border border-red-500/30 rounded text-[11px] text-red-200 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>{customError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="block text-[10px] text-[#D8C6AE]/70 mb-0.5">العرض (سم) *</label>
              <input
                type="number"
                required
                min="30"
                max="600"
                placeholder="مثال: 150"
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
                className="w-full px-2 py-1 bg-[#171513] border border-white/15 rounded text-xs text-[#F5EFE6] font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#D8C6AE]/70 mb-0.5">الارتفاع (سم) *</label>
              <input
                type="number"
                required
                min="50"
                max="600"
                placeholder="مثال: 260"
                value={customHeight}
                onChange={(e) => setCustomHeight(e.target.value)}
                className="w-full px-2 py-1 bg-[#171513] border border-white/15 rounded text-xs text-[#F5EFE6] font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#D8C6AE]/70 mb-0.5">السعر (د.أ) *</label>
              <input
                type="number"
                step="0.5"
                min="1"
                placeholder="25.0"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                className="w-full px-2 py-1 bg-[#171513] border border-white/15 rounded text-xs text-[#F5EFE6] font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#D8C6AE]/70 mb-0.5">الكمية بالمخزن</label>
              <input
                type="number"
                min="0"
                placeholder="10"
                value={customStock}
                onChange={(e) => setCustomStock(e.target.value)}
                className="w-full px-2 py-1 bg-[#171513] border border-white/15 rounded text-xs text-[#F5EFE6] font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C8AA78] hover:bg-[#d5ba8c] text-[#171513] text-xs font-bold rounded-md transition-colors cursor-pointer shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>إضافة وتفعيل المقاس</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
