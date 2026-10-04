'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AlertCircle, Trash2, X, Loader2, Archive } from 'lucide-react';

interface DeleteProductModalProps {
  product: any | null;
  onClose: () => void;
  onSuccess: (archivedProduct: any) => void;
}

export default function DeleteProductModal({
  product,
  onClose,
  onSuccess,
}: DeleteProductModalProps) {
  const [confirmName, setConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!product) return null;

  const targetName = product.name?.trim() || '';
  const isMatch = confirmName.trim() === targetName;

  const handleConfirmDelete = async () => {
    if (!isMatch || isDeleting) return;

    setError(null);
    setIsDeleting(true);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
        headers,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onSuccess(product);
      } else {
        setError(data.error || 'فشل تنفيذ أرشفة المنتج في الخادم.');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع أثناء إرسال طلب الأرشفة.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs text-right">
      <div className="w-full max-w-md bg-[#211B17] border border-red-500/40 rounded-xl p-6 shadow-2xl relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-red-400 font-bold text-base">
            <Archive className="w-5 h-5" />
            <span>أرشفة المنتج من المتجر</span>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 hover:bg-white/10 rounded cursor-pointer text-[#D8C6AE]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Body */}
        <div className="space-y-3 text-xs text-[#D8C6AE] leading-relaxed">
          <p>
            أنت على وشك أرشفة منتج <strong className="text-[#F5EFE6] text-sm">&ldquo;{product.name}&rdquo;</strong>.
          </p>
          <p className="p-3 bg-red-950/40 border border-red-500/30 rounded-lg text-red-200">
            سيتم إخفاء المنتج فوراً من واجهة المتجر ولن يتمكن الزبائن من تصفحه أو طلبه.
            تبقى بيانات المنتج والطلبات السابقة محفوظة بأمان في الأرشيف دون حذف الملفات المشتركة.
          </p>

          <div>
            <label className="block text-[11px] font-medium text-[#D8C6AE] mb-1.5">
              لتأكيد الأرشفة، يرجى كتابة اسم المنتج تماماً:
            </label>
            <div className="p-2 bg-[#171513] border border-white/10 rounded font-bold text-[#C8AA78] text-center select-all mb-2">
              {targetName}
            </div>
            <input
              type="text"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder="اكتب اسم المنتج هنا..."
              dir="rtl"
              disabled={isDeleting}
              className="w-full px-3 py-2 bg-[#171513] border border-white/20 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded text-sm text-[#F5EFE6] text-right"
            />
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-lg text-xs text-red-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-xs text-[#D8C6AE] rounded-md transition-colors cursor-pointer"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleConfirmDelete}
            disabled={!isMatch || isDeleting}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:hover:bg-red-600 text-white text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>جارٍ تنفيذ الأرشفة...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>تأكيد أرشفة المنتج</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
