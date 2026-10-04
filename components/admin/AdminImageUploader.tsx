'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { UploadCloud, Loader2, AlertCircle, RefreshCw, Trash2, CheckCircle2, Image as ImageIcon } from 'lucide-react';

interface AdminImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
  helperText?: string;
  required?: boolean;
  aspectRatio?: '4/3' | '1/1' | '16/9';
  fallbackImage?: string;
  onUploadStateChange?: (isUploading: boolean) => void;
}

export default function AdminImageUploader({
  value,
  onChange,
  label,
  helperText,
  required = false,
  aspectRatio = '4/3',
  fallbackImage = '/images/craft_textures.jpg',
  onUploadStateChange,
}: AdminImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewOverride, setPreviewOverride] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentImageUrl = previewOverride || value || fallbackImage;
  const hasValidValue = Boolean(value && value.trim());

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size client-side (5 MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('حجم الصورة كبير جداً. الحد الأقصى المسموح به هو 5 ميغابايت.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate type client-side
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('نوع الملف غير مدعوم. يرجى اختيار صورة بصيغة JPG أو PNG أو WebP.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Immediate local preview for responsive UX
    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewOverride(localPreviewUrl);
    setUploadError(null);
    setIsUploading(true);
    onUploadStateChange?.(true);

    try {
      // Obtain session token for authenticated storage upload
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        onChange(data.url);
        setPreviewOverride(null);
      } else {
        setUploadError(data.error || 'فشل رفع الصورة إلى التخزين السحابي.');
        setPreviewOverride(null);
      }
    } catch (err: any) {
      setUploadError(err.message || 'حدث خطأ أثناء الاتصال بخادم الرفع.');
      setPreviewOverride(null);
    } finally {
      setIsUploading(false);
      onUploadStateChange?.(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleTriggerFile = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setPreviewOverride(null);
    setUploadError(null);
  };

  const aspectClass =
    aspectRatio === '1/1'
      ? 'aspect-square'
      : aspectRatio === '16/9'
      ? 'aspect-[16/9]'
      : 'aspect-[4/3]';

  return (
    <div className="space-y-1.5 text-right">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-[#D8C6AE]">
          {label} {required && <span className="text-[#C8AA78]">*</span>}
        </label>
        {isUploading && (
          <span className="inline-flex items-center gap-1 text-[11px] text-[#C8AA78] font-medium">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>جارٍ الرفع...</span>
          </span>
        )}
      </div>

      {helperText && <p className="text-[11px] text-[#D8C6AE]/60">{helperText}</p>}

      {/* Image Preview & Upload Controls Container */}
      <div className="bg-[#171513] border border-white/10 rounded-lg p-2.5 space-y-2">
        <div className="flex items-center gap-3">
          {/* Thumbnail Preview Area */}
          <div
            className={`relative ${aspectClass} w-24 sm:w-28 rounded-md overflow-hidden bg-[#211B17] border border-white/15 shrink-0 group shadow-xs`}
          >
            {currentImageUrl ? (
              <Image
                src={currentImageUrl}
                alt={label}
                fill
                sizes="120px"
                className="object-cover object-center"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#D8C6AE]/40">
                <ImageIcon className="w-6 h-6" />
                <span className="text-[9px] mt-1">بدون صورة</span>
              </div>
            )}

            {isUploading && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-[#C8AA78] gap-1 z-10">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-[9px] font-bold">جارٍ الرفع</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={handleTriggerFile}
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C8AA78] hover:bg-[#d5ba8c] disabled:opacity-50 text-[#171513] text-xs font-bold rounded-md transition-colors cursor-pointer shadow-xs"
              >
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : hasValidValue ? (
                  <RefreshCw className="w-3.5 h-3.5" />
                ) : (
                  <UploadCloud className="w-3.5 h-3.5" />
                )}
                <span>{hasValidValue ? 'استبدال الصورة' : 'رفع من جهازك'}</span>
              </button>

              {hasValidValue && (
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isUploading}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-xs text-red-300 rounded-md border border-red-500/20 transition-colors cursor-pointer"
                  title="إزالة الصورة"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>إزالة</span>
                </button>
              )}
            </div>

            {/* Direct URL input fallback */}
            <div>
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="/images/... أو رابط صورة عام"
                dir="ltr"
                className="w-full px-2.5 py-1 bg-[#211B17] border border-white/10 rounded text-[11px] text-[#F5EFE6] font-mono focus:border-[#C8AA78] focus:ring-1 focus:ring-[#C8AA78]"
              />
            </div>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />

        {/* Error Feedback */}
        {uploadError && (
          <div className="p-2 bg-red-950/60 border border-red-500/30 rounded text-[11px] text-red-200 flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>
    </div>
  );
}
