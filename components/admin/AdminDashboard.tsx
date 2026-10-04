'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AdminUserRecord } from '@/lib/auth/admin-auth';
import AdminImageUploader from './AdminImageUploader';
import DeleteProductModal from './DeleteProductModal';
import ColorSizesConfig from './ColorSizesConfig';
import {
  Package,
  Layers,
  UploadCloud,
  LogOut,
  ExternalLink,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  SlidersHorizontal,
  Info,
} from 'lucide-react';

interface AdminDashboardProps {
  admin: AdminUserRecord;
}

export default function AdminDashboard({ admin }: AdminDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'media' | 'status'>('products');

  // Products state
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Status/Feedback alerts
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Product Modal (Add / Edit)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);

  // Delete Confirmation Modal
  const [productToDelete, setProductToDelete] = useState<any | null>(null);

  // Category Modal (Add / Edit)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);

  // Media Upload State
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Fetch initial catalog data from server API
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/products?admin=true'),
          fetch('/api/categories?admin=true'),
        ]);

        const prodData = await prodRes.json();
        const catData = await catRes.json();

        if (isMounted) {
          if (prodRes.ok && prodData.products) {
            setProducts(prodData.products);
          }
          if (catRes.ok && catData.categories) {
            setCategories(catData.categories);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setFeedback({ type: 'error', message: `فشل تحميل البيانات: ${err.message}` });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  const notify = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  // Toggle Product Active/Archived
  const toggleProductActive = async (product: any) => {
    const newStatus = !product.is_active;
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newStatus }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, is_active: newStatus } : p))
        );
        notify('success', `تم ${newStatus ? 'تفعيل' : 'إلغاء تفعيل'} المنتج بنجاح.`);
      } else {
        const data = await res.json();
        notify('error', data.error || 'فشل تحديث حالة المنتج.');
      }
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  // Delete / Archive Product: opens accessible modal requiring product name confirmation
  const handleDeleteProduct = (product: any) => {
    setProductToDelete(product);
  };

  // Delete Category
  const handleDeleteCategory = async (category: any) => {
    if (!confirm(`هل أنت متأكد من حذف أو أرشفة قسم "${category.name}"؟`)) return;

    try {
      const res = await fetch(`/api/categories/${category.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== category.id));
        notify('success', data.message || 'تم حذف القسم بنجاح.');
      } else {
        notify('error', data.error || 'فشل حذف القسم.');
      }
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  // Handle Image Upload
  const handleFileUpload = async (file: File) => {
    setUploadingFile(true);
    setUploadError(null);
    setUploadedUrl(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setUploadedUrl(data.url);
        notify('success', 'تم رفع الصورة بنجاح إلى Supabase Storage.');
      } else {
        setUploadError(data.error || 'فشل رفع الصورة.');
      }
    } catch (err: any) {
      setUploadError(err.message || 'حدث خطأ أثناء رفع الصورة.');
    } finally {
      setUploadingFile(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#171513] text-[#F5EFE6]">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 bg-[#211B17]/95 border-b border-[#C8AA78]/30 backdrop-blur-md px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Info */}
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#C8AA78]/50 shadow-xs">
              <Image
                src="/images/setara-logo.png"
                alt="سيتارة"
                fill
                sizes="36px"
                className="object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-[#F5EFE6]">سيتارة</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#C8AA78]/20 text-[#C8AA78] border border-[#C8AA78]/30">
                  لوحة الإدارة
                </span>
              </div>
              <p className="text-[11px] text-[#D8C6AE]/75 font-normal">
                {admin.email} ({admin.role === 'super_admin' ? 'مدير رئيسي' : 'مدير'})
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs text-[#D8C6AE] border border-white/10 transition-colors"
            >
              <span>معاينة المتجر</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#C8AA78]" />
            </a>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-950/40 hover:bg-red-900/60 text-xs text-red-300 border border-red-500/30 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Toast Feedback */}
        {feedback && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center justify-between gap-3 text-xs sm:text-sm border shadow-lg ${
              feedback.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                : 'bg-red-950/80 border-red-500/50 text-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="p-1 hover:bg-white/10 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Phase 1 Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="p-4 rounded-xl bg-[#211B17] border border-white/10 text-right">
            <span className="text-[11px] text-[#D8C6AE]/75 font-medium block">إجمالي المنتجات</span>
            <span className="text-xl sm:text-2xl font-extrabold text-[#F5EFE6] mt-1 block">
              {products.length}
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">
              {products.filter((p) => p.is_active).length} مفعّل في المتجر
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#211B17] border border-white/10 text-right">
            <span className="text-[11px] text-[#D8C6AE]/75 font-medium block">أقسام الستائر</span>
            <span className="text-xl sm:text-2xl font-extrabold text-[#F5EFE6] mt-1 block">
              {categories.length}
            </span>
            <span className="text-[10px] text-[#C8AA78] font-medium">
              شفافة، تعتيم، رول
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#211B17] border border-white/10 text-right">
            <span className="text-[11px] text-[#D8C6AE]/75 font-medium block">أصناف القياسات (Variants)</span>
            <span className="text-xl sm:text-2xl font-extrabold text-[#F5EFE6] mt-1 block">
              {products.reduce((acc, p) => acc + (p.variants?.length || 0), 0)}
            </span>
            <span className="text-[10px] text-[#D8C6AE]/60 font-medium">
              مصفوفة (لون × مقاس)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#211B17] border border-[#C8AA78]/30 text-right">
            <span className="text-[11px] text-[#C8AA78] font-medium block">حالة النظام</span>
            <span className="text-base sm:text-lg font-bold text-[#F5EFE6] mt-1 block">
              Phase 1 نشط
            </span>
            <span className="text-[10px] text-[#D8C6AE]/75 font-medium">
              الكتالوج حيّ، الطلبات Demo
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-6 overflow-x-auto text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeTab === 'products'
                ? 'bg-[#C8AA78] text-[#171513] font-bold shadow-xs'
                : 'text-[#D8C6AE] hover:bg-white/5 hover:text-[#F5EFE6]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>المنتجات والستائر ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeTab === 'categories'
                ? 'bg-[#C8AA78] text-[#171513] font-bold shadow-xs'
                : 'text-[#D8C6AE] hover:bg-white/5 hover:text-[#F5EFE6]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>الأقسام الرئيسية ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeTab === 'media'
                ? 'bg-[#C8AA78] text-[#171513] font-bold shadow-xs'
                : 'text-[#D8C6AE] hover:bg-white/5 hover:text-[#F5EFE6]'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>مركز رفع الوسائط (Supabase Storage)</span>
          </button>

          <button
            onClick={() => setActiveTab('status')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeTab === 'status'
                ? 'bg-[#C8AA78] text-[#171513] font-bold shadow-xs'
                : 'text-[#D8C6AE] hover:bg-white/5 hover:text-[#F5EFE6]'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>تنبيه نطاق المرحلة الأولى</span>
          </button>
        </div>

        {/* TAB 1: PRODUCTS LIST */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#211B17] p-4 rounded-xl border border-white/10">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#F5EFE6]">
                  كتالوج الستائر والمنتجات الجاهزة
                </h2>
                <p className="text-xs text-[#D8C6AE]/75 mt-0.5">
                  إدارة الموديلات، الخامات، الألوان، المقاسات بالسنتيمتر، والأسعار الدقيقة بالدينار الأردني.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => setRefreshKey((k) => k + 1)}
                  className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#D8C6AE] border border-white/10 transition-colors cursor-pointer"
                  title="تحديث البيانات"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#C8AA78] hover:bg-[#d5ba8c] text-[#171513] text-xs sm:text-sm font-bold shadow-md transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة منتج جديد</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-center text-[#D8C6AE]">
                <Loader2 className="w-8 h-8 animate-spin text-[#C8AA78] mb-3" />
                <p className="text-sm font-medium">جارٍ تحميل المنتجات من قاعدة البيانات...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="py-16 text-center bg-[#211B17] rounded-xl border border-white/10 p-8">
                <Package className="w-12 h-12 text-[#C8AA78]/50 mx-auto mb-3" />
                <h3 className="text-base font-bold text-[#F5EFE6]">لا توجد منتجات حالياً</h3>
                <p className="text-xs text-[#D8C6AE]/70 mt-1 max-w-sm mx-auto">
                  قم بإضافة أول منتج لمتجر سيتارة أو قم بتطبيق ملف الترحيل (SQL Migration) لإدراج الكتالوج النموذجي.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => {
                  const activeVariants = product.variants?.filter((v: any) => v.is_available) || [];
                  const minPrice = activeVariants.length > 0
                    ? Math.min(...activeVariants.map((v: any) => Number(v.price)))
                    : 0;

                  return (
                    <div
                      key={product.id}
                      className={`bg-[#211B17] rounded-xl border transition-all flex flex-col justify-between overflow-hidden ${
                        product.is_active
                          ? 'border-white/10 hover:border-[#C8AA78]/60 shadow-xs'
                          : 'border-red-500/20 opacity-75'
                      }`}
                    >
                      <div>
                        {/* Thumbnail & Badges */}
                        <div className="relative aspect-[16/10] w-full bg-[#171513] overflow-hidden">
                          <Image
                            src={product.main_image || product.colors?.[0]?.image || '/images/hero.jpg'}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-xs bg-[#171513]/85 text-[#F5EFE6] backdrop-blur-xs border border-white/10">
                              {product.category?.name || product.category_id}
                            </span>
                            {product.is_featured && (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded-xs bg-[#C8AA78] text-[#171513] shadow-xs flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                <span>مميز</span>
                              </span>
                            )}
                          </div>

                          <div className="absolute top-2.5 left-2.5">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-xs backdrop-blur-xs flex items-center gap-1 ${
                                product.is_active
                                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-red-950/80 text-red-300 border border-red-500/40'
                              }`}
                            >
                              {product.is_active ? 'معروض بالمتجر' : 'مؤرشف / غير مرئي'}
                            </span>
                          </div>
                        </div>

                        {/* Product Body */}
                        <div className="p-4 text-right">
                          <h3 className="text-base font-bold text-[#F5EFE6] leading-snug">
                            {product.name}
                          </h3>
                          <p className="text-xs text-[#D8C6AE]/75 mt-1 line-clamp-2 leading-relaxed">
                            {product.short_desc}
                          </p>

                          <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-[#D8C6AE]/60">الألوان:</span>
                              <div className="flex items-center gap-1">
                                {(product.colors || []).map((c: any) => (
                                  <span
                                    key={c.id}
                                    title={c.name}
                                    className="w-3.5 h-3.5 rounded-full border border-white/20"
                                    style={{ backgroundColor: c.hex }}
                                  />
                                ))}
                              </div>
                            </div>

                            <div className="flex items-baseline gap-1 text-[#F5EFE6]">
                              <span className="text-[11px] text-[#D8C6AE]/60">يبدأ من</span>
                              <span className="text-base font-extrabold text-[#C8AA78]">
                                {minPrice}
                              </span>
                              <span className="text-[11px] font-bold text-[#D8C6AE]">د.أ</span>
                            </div>
                          </div>

                          <div className="mt-2 text-[11px] text-[#D8C6AE]/60 flex items-center gap-3">
                            <span>{product.sizes?.length || 0} مقاسات معيارية</span>
                            <span>•</span>
                            <span>{product.variants?.length || 0} أصناف مسجلة</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-3 bg-[#1A1614] border-t border-white/5 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => toggleProductActive(product)}
                          className={`p-2 rounded-md transition-colors cursor-pointer text-xs flex items-center gap-1.5 ${
                            product.is_active
                              ? 'text-[#D8C6AE] hover:text-amber-300'
                              : 'text-emerald-400 hover:text-emerald-300'
                          }`}
                          title={product.is_active ? 'إلغاء التفعيل' : 'تفعيل المنتج'}
                        >
                          {product.is_active ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>إخفاء</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>إظهار</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(product);
                              setIsProductModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-xs text-[#F5EFE6] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Edit className="w-3 h-3 text-[#C8AA78]" />
                            <span>تعديل</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product)}
                            className="p-1.5 rounded-md text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors cursor-pointer"
                            title="أرشفة المنتج"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CATEGORIES LIST */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#211B17] p-4 rounded-xl border border-white/10">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#F5EFE6]">
                  أقسام وتصنيفات الستائر
                </h2>
                <p className="text-xs text-[#D8C6AE]/75 mt-0.5">
                  تحديد الأقسام الرئيسية (ستائر شفافة، تعتيم، رول) وصور الواجهة وترتيب العرض.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingCategory(null);
                  setIsCategoryModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#C8AA78] hover:bg-[#d5ba8c] text-[#171513] text-xs sm:text-sm font-bold shadow-md transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة قسم جديد</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-[#211B17] rounded-xl border border-white/10 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[16/10] w-full bg-[#171513] overflow-hidden">
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2.5 right-2.5">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-xs bg-[#171513]/85 text-[#C8AA78] border border-white/10">
                          ترتيب: {cat.display_order}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 text-right">
                      <h3 className="text-base font-bold text-[#F5EFE6]">{cat.name}</h3>
                      <p className="text-xs text-[#C8AA78] mt-0.5 font-medium">{cat.subtitle}</p>
                      <p className="text-xs text-[#D8C6AE]/75 mt-2 leading-relaxed">
                        {cat.description}
                      </p>
                      <div className="mt-3 text-[11px] text-[#D8C6AE]/50">
                        معرّف القسم (ID): <span className="font-mono text-neutral-300">{cat.id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#1A1614] border-t border-white/5 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(cat);
                        setIsCategoryModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-xs text-[#F5EFE6] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit className="w-3 h-3 text-[#C8AA78]" />
                      <span>تعديل</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-1.5 rounded-md text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors cursor-pointer"
                      title="حذف القسم"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: MEDIA UPLOADER */}
        {activeTab === 'media' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-[#211B17] p-6 rounded-xl border border-white/10 text-right">
              <h2 className="text-base sm:text-lg font-bold text-[#F5EFE6] flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#C8AA78]" />
                <span>مركز رفع الوسائط إلى Supabase Storage</span>
              </h2>
              <p className="text-xs text-[#D8C6AE]/80 mt-1 leading-relaxed">
                يتم رفع الصور مباشرة إلى حزمة التخزين الآمنة <code className="text-[#C8AA78]">product-media</code>.
                الصور المرفوعة تحظى بروابط عامة ثابتة يمكن استخدامها لألوان المنتجات أو واجهات الأقسام.
              </p>

              {/* Upload Dropzone */}
              <div className="mt-6 border-2 border-dashed border-[#C8AA78]/40 hover:border-[#C8AA78] rounded-xl p-8 text-center bg-[#171513]/50 transition-colors">
                <ImageIcon className="w-10 h-10 text-[#C8AA78] mx-auto mb-3" />
                <h4 className="text-sm font-bold text-[#F5EFE6]">
                  اسحب الصورة وأفلتها هنا أو اضغط للاختيار
                </h4>
                <p className="text-xs text-[#D8C6AE]/60 mt-1">
                  الأنواع المدعومة: JPEG, PNG, WebP • الحجم الأقصى: 5 ميغابايت
                </p>

                <label className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#C8AA78] hover:bg-[#d5ba8c] text-[#171513] text-xs font-bold transition-colors cursor-pointer shadow-xs">
                  {uploadingFile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#171513]" />
                      <span>جارٍ الرفع والمعالجة...</span>
                    </>
                  ) : (
                    <span>اختيار ملف من جهازك</span>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={uploadingFile}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              {uploadError && (
                <div className="mt-4 p-3 bg-red-950/60 border border-red-500/40 rounded-lg text-xs text-red-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadedUrl && (
                <div className="mt-6 p-4 rounded-xl bg-[#171513] border border-emerald-500/40 text-right space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تم رفع الصورة بنجاح!</span>
                  </div>

                  <div className="relative aspect-[16/9] w-full max-w-sm mx-auto rounded-lg overflow-hidden border border-white/10">
                    <Image
                      src={uploadedUrl}
                      alt="Uploaded preview"
                      fill
                      className="object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#D8C6AE] mb-1">
                      الرابط العام للصورة (Public URL):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={uploadedUrl}
                        dir="ltr"
                        className="w-full px-3 py-1.5 bg-[#211B17] border border-white/10 rounded text-xs text-[#F5EFE6] font-mono select-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(uploadedUrl);
                          notify('success', 'تم نسخ رابط الصورة إلى الحافظة.');
                        }}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs text-[#C8AA78] rounded cursor-pointer whitespace-nowrap"
                      >
                        نسخ
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: PHASE 1 DEMO SCOPE NOTICE */}
        {activeTab === 'status' && (
          <div className="max-w-3xl mx-auto bg-[#211B17] p-6 sm:p-8 rounded-xl border border-[#C8AA78]/30 text-right space-y-4">
            <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-[#C8AA78]">
              <Info className="w-5 h-5 shrink-0" />
              <span>نطاق العمل المؤكد في المرحلة الأولى (Phase 1)</span>
            </div>

            <p className="text-xs sm:text-sm text-[#D8C6AE] leading-relaxed">
              وفقاً للتصميم المعتمد، تم إنجاز الجزء الإنتاجي الأول بالكامل مع ربط قاعدة بيانات PostgreSQL عبر Supabase:
            </p>

            <ul className="space-y-2.5 text-xs text-[#F5EFE6] list-disc list-inside">
              <li>
                <strong className="text-[#C8AA78]">المصادقة والإدارة:</strong> التحقق من هوية المدير عبر السيرفر لكل صفحة وعملية كتابة في الكتالوج.
              </li>
              <li>
                <strong className="text-[#C8AA78]">إدارة الكتالوج:</strong> المنتجات، الأقسام، خامات الستائر، الألوان، المقاسات بالسنتيمتر، والأسعار الدقيقة بالدينار الأردني مربوطة بالكامل مع قاعدة البيانات.
              </li>
              <li>
                <strong className="text-[#C8AA78]">تخزين الصور:</strong> رفع وتخزين الصور في حزمة <code className="text-[#C8AA78]">product-media</code> بحد 5 ميغابايت.
              </li>
              <li>
                <strong className="text-[#C8AA78]">نظام الطلبات والشراء:</strong> يبقى صراحة في النمط التجريبي التوضيحي (Demo Mode) في المتجر، ولا يتم تنفيذ مدفوعات إلكترونية أو اعتباره جاهزاً للشحن التجاري حتى المرحلة الثانية (Phase 2).
              </li>
            </ul>
          </div>
        )}
      </main>

      {/* MODAL 1: ADD/EDIT CATEGORY */}
      {isCategoryModalOpen && (
        <CategoryEditModal
          category={editingCategory}
          onClose={() => setIsCategoryModalOpen(false)}
          onSaved={() => {
            setIsCategoryModalOpen(false);
            setRefreshKey((k) => k + 1);
            notify('success', 'تم حفظ القسم بنجاح.');
          }}
        />
      )}

      {/* MODAL 2: ADD/EDIT PRODUCT */}
      {isProductModalOpen && (
        <ProductEditModal
          product={editingProduct}
          categories={categories}
          onClose={() => setIsProductModalOpen(false)}
          onSaved={() => {
            setIsProductModalOpen(false);
            setRefreshKey((k) => k + 1);
            notify('success', 'تم حفظ المنتج بنجاح.');
          }}
        />
      )}

      {/* MODAL 3: DELETE PRODUCT CONFIRMATION */}
      {productToDelete && (
        <DeleteProductModal
          product={productToDelete}
          onClose={() => setProductToDelete(null)}
          onSuccess={(archived) => {
            setProducts((prev) =>
              prev.map((p) => (p.id === archived.id ? { ...p, is_active: false } : p))
            );
            notify('success', `تم أرشفة منتج "${archived.name}" بنجاح وإخفاؤه من المتجر.`);
            setProductToDelete(null);
          }}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Subcomponent: Category Edit Modal
// ----------------------------------------------------------------------------
function CategoryEditModal({
  category,
  onClose,
  onSaved,
}: {
  category: any | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(category?.name || '');
  const [subtitle, setSubtitle] = useState(category?.subtitle || '');
  const [description, setDescription] = useState(category?.description || '');
  const [image, setImage] = useState(category?.image || '/images/cat_sheer.jpg');
  const [displayOrder, setDisplayOrder] = useState(category?.display_order || 1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const url = category ? `/api/categories/${category.id}` : '/api/categories';
      const method = category ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          subtitle,
          description,
          image,
          display_order: Number(displayOrder),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        onSaved();
      } else {
        setError(data.error || 'فشل حفظ القسم.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs text-right">
      <div className="w-full max-w-lg bg-[#211B17] border border-white/10 rounded-xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <h3 className="text-base font-bold text-[#F5EFE6]">
            {category ? 'تعديل قسم ستائر' : 'إضافة قسم ستائر جديد'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded cursor-pointer">
            <X className="w-4 h-4 text-[#D8C6AE]" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-500/40 rounded-lg text-xs text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#D8C6AE] mb-1">اسم القسم *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: ستائر شفافة"
              className="w-full px-3 py-2 bg-[#171513] border border-white/15 rounded text-sm text-[#F5EFE6]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#D8C6AE] mb-1">العنوان الفرعي</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="مثال: ترشيح لطيف لضوء النهار"
              className="w-full px-3 py-2 bg-[#171513] border border-white/15 rounded text-sm text-[#F5EFE6]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#D8C6AE] mb-1">الوصف</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف خامات القسم ومميزاته..."
              className="w-full px-3 py-2 bg-[#171513] border border-white/15 rounded text-sm text-[#F5EFE6]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#D8C6AE] mb-1">مسار أو رابط الصورة</label>
              <input
                type="text"
                required
                value={image}
                onChange={(e) => setImage(e.target.value)}
                dir="ltr"
                placeholder="/images/cat_sheer.jpg"
                className="w-full px-3 py-2 bg-[#171513] border border-white/15 rounded text-xs text-[#F5EFE6]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#D8C6AE] mb-1">ترتيب العرض</label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#171513] border border-white/15 rounded text-xs text-[#F5EFE6]"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-xs text-[#D8C6AE] rounded cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-[#C8AA78] hover:bg-[#d5ba8c] disabled:opacity-50 text-[#171513] text-xs font-bold rounded cursor-pointer flex items-center gap-1.5"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>حفظ القسم</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Subcomponent: Product Edit Modal (With Color-Specific Sizes & Variants Pricing)
// ----------------------------------------------------------------------------
function ProductEditModal({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: any | null;
  categories: any[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(product?.name || '');
  const [categoryId, setCategoryId] = useState(product?.category_id || categories[0]?.id || 'sheer');
  const [shortDesc, setShortDesc] = useState(product?.short_desc || '');
  const [description, setDescription] = useState(product?.description || '');
  const [fabric, setFabric] = useState(product?.fabric || '');
  const [lightBlocking, setLightBlocking] = useState(product?.light_blocking || '');
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [displayOrder, setDisplayOrder] = useState(product?.display_order || 1);

  // Main Product Image
  const [mainImage, setMainImage] = useState<string>(
    product?.main_image || product?.images?.[0] || product?.colors?.[0]?.image || '/images/cat_sheer.jpg'
  );

  // Active Uploads Tracker (ensures we never submit with pending uploads)
  const [pendingUploads, setPendingUploads] = useState<number>(0);

  // Colors list
  const [colors, setColors] = useState<any[]>(() =>
    product?.colors?.length > 0
      ? product.colors
      : [{ id: 'temp_c1', name: 'بيج رملي', hex: '#D4C4A8', image: '/images/prod_andalusian.jpg' }]
  );

  // Sizes definitions pool
  const [sizes, setSizes] = useState<any[]>(() =>
    product?.sizes?.length > 0
      ? product.sizes
      : [
          { id: 'temp_s1', label: '150 × 260 سم', width_cm: 150, height_cm: 260 },
          { id: 'temp_s2', label: '200 × 260 سم', width_cm: 200, height_cm: 260 },
        ]
  );

  // Variants matrix explicitly storing enabled (color_id, size_id) combinations
  const [variants, setVariants] = useState<any[]>(() => {
    if (product?.variants && product.variants.length > 0) {
      return product.variants.map((v: any) => ({
        id: v.id,
        color_id: v.color_id || v.colorId,
        color_name: product.colors?.find((c: any) => c.id === (v.color_id || v.colorId))?.name,
        size_id: v.size_id || v.sizeId,
        size_label: product.sizes?.find((s: any) => s.id === (v.size_id || v.sizeId))?.label,
        price: Number(v.price) >= 0 ? Number(v.price) : 25.0,
        stock_quantity: Number(v.stock_quantity ?? v.stockQuantity ?? 10),
        is_available: v.is_available !== false,
      }));
    }
    // New product initial state: only enable first size for first color
    return [
      {
        id: 'temp_var_c1_s1',
        color_id: 'temp_c1',
        color_name: 'بيج رملي',
        size_id: 'temp_s1',
        size_label: '150 × 260 سم',
        price: 25.0,
        stock_quantity: 10,
        is_available: true,
      },
    ];
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add new color: does NOT inherit any sizes automatically
  const handleAddColor = () => {
    const newColorId = `temp_c_${Date.now()}`;
    const newColor = {
      id: newColorId,
      name: `لون جديد ${colors.length + 1}`,
      hex: '#E5DACB',
      image: mainImage || '/images/craft_textures.jpg',
    };
    setColors((prev) => [...prev, newColor]);
    // NOTE: newly added color has 0 enabled sizes until explicitly checked or defined by admin
  };

  const handleDeleteColor = (idx: number) => {
    const colorToDelete = colors[idx];
    setColors((prev) => prev.filter((_, i) => i !== idx));
    if (colorToDelete) {
      setVariants((prev) =>
        prev.filter((v) => v.color_id !== colorToDelete.id && v.color_name !== colorToDelete.name)
      );
    }
  };

  const handleAddSize = () => {
    const newSize = {
      id: `temp_s_${Date.now()}`,
      label: '250 × 260 سم',
      width_cm: 250,
      height_cm: 260,
      display_order: sizes.length + 1,
    };
    setSizes((prev) => [...prev, newSize]);
  };

  const handleDeleteSize = (idx: number) => {
    const sizeToDelete = sizes[idx];
    setSizes((prev) => prev.filter((_, i) => i !== idx));
    if (sizeToDelete) {
      setVariants((prev) =>
        prev.filter((v) => v.size_id !== sizeToDelete.id && v.size_label !== sizeToDelete.label)
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Guard against incomplete uploads
    if (pendingUploads > 0) {
      setError('يرجى الانتظار حتى يكتمل رفع كافة الصور قبل الحفظ.');
      return;
    }

    // 2. Validate images
    const resolvedMainImage = mainImage || colors[0]?.image || '';
    if (!resolvedMainImage) {
      setError('يرجى رفع الصورة الرئيسية للمنتج أو اختيار صورة للون الأول.');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name,
        category_id: categoryId,
        short_desc: shortDesc,
        description,
        fabric,
        light_blocking: lightBlocking,
        main_image: resolvedMainImage,
        is_featured: isFeatured,
        display_order: Number(displayOrder),
        colors: colors.map((c) => ({
          ...c,
          image: c.image || resolvedMainImage,
          gallery: Array.isArray(c.gallery) && c.gallery.length > 0 ? c.gallery : [c.image || resolvedMainImage],
        })),
        sizes,
        variants,
      };

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

      const url = product ? `/api/products/${product.id}` : '/api/products';
      const method = product ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onSaved();
      } else {
        setError(data.error || 'فشل حفظ المنتج في قاعدة البيانات.');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع أثناء حفظ المنتج.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs text-right overflow-y-auto">
      <div className="w-full max-w-3xl my-8 bg-[#211B17] border border-white/10 rounded-xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 sticky top-0 bg-[#211B17] z-10">
          <h3 className="text-base font-bold text-[#F5EFE6]">
            {product ? `تعديل منتج: ${product.name}` : 'إضافة منتج ستائر جديد'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded cursor-pointer">
            <X className="w-4 h-4 text-[#D8C6AE]" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-500/40 rounded-lg text-xs text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: Basic Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#C8AA78] uppercase tracking-wider pb-1 border-b border-white/5">
              1. البيانات الأساسية
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#D8C6AE] mb-1">اسم الموديل *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: ستائر فوال أندلسي"
                  className="w-full px-3 py-2 bg-[#171513] border border-white/15 rounded text-sm text-[#F5EFE6]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#D8C6AE] mb-1">القسم الرئيسي *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#171513] border border-white/15 rounded text-sm text-[#F5EFE6]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#D8C6AE] mb-1">وصف مختصر (يظهر على البطاقة) *</label>
              <input
                type="text"
                required
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="سطر واحد إلى سطرين يوضح الغرض من الستارة..."
                className="w-full px-3 py-2 bg-[#171513] border border-white/15 rounded text-xs text-[#F5EFE6]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#D8C6AE] mb-1">الوصف التفصيلي</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="مواصفات الخياطة، انسيابية الأقمشة، والاستخدام الموصى به..."
                className="w-full px-3 py-2 bg-[#171513] border border-white/15 rounded text-xs text-[#F5EFE6]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#D8C6AE] mb-1">نوع القماش / النسيج *</label>
                <input
                  type="text"
                  required
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                  placeholder="مثال: بوليستر فوال معالج بنسبة 100%"
                  className="w-full px-3 py-2 bg-[#171513] border border-white/15 rounded text-xs text-[#F5EFE6]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#D8C6AE] mb-1">درجة حجب الضوء *</label>
                <input
                  type="text"
                  required
                  value={lightBlocking}
                  onChange={(e) => setLightBlocking(e.target.value)}
                  placeholder="مثال: شفافية 30% أو تعتيم 95%"
                  className="w-full px-3 py-2 bg-[#171513] border border-white/15 rounded text-xs text-[#F5EFE6]"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#F5EFE6]">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-white/20 bg-[#171513] text-[#C8AA78]"
                />
                <span>تمييز هذا المنتج في الواجهة (Featured)</span>
              </label>
            </div>

            {/* Main Product Image Upload Field */}
            <div className="pt-2">
              <AdminImageUploader
                label="الصورة الرئيسية"
                helperText="الصورة الأساسية المعروضة على بطاقة المنتج في المتجر وقائمة الستائر."
                value={mainImage}
                onChange={setMainImage}
                required
                aspectRatio="4/3"
                fallbackImage="/images/cat_sheer.jpg"
                onUploadStateChange={(uploading) => {
                  setPendingUploads((prev) => Math.max(0, prev + (uploading ? 1 : -1)));
                }}
              />
            </div>
          </div>

          {/* Section 2: Colors Management */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#C8AA78] uppercase tracking-wider">
                2. خيارات الألوان والصور ({colors.length})
              </h4>
              <button
                type="button"
                onClick={handleAddColor}
                className="text-[11px] text-[#C8AA78] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>إضافة لون</span>
              </button>
            </div>

            <div className="space-y-3">
              {colors.map((c, idx) => (
                <div
                  key={c.id || idx}
                  className="p-3.5 bg-[#171513] border border-white/10 rounded-lg space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div>
                      <label className="block text-[10px] font-medium text-[#D8C6AE]/80 mb-1">اسم اللون *</label>
                      <input
                        type="text"
                        required
                        value={c.name}
                        onChange={(e) => {
                          const updated = [...colors];
                          updated[idx].name = e.target.value;
                          setColors(updated);
                        }}
                        className="w-full px-2.5 py-1.5 bg-[#211B17] border border-white/10 rounded text-xs text-[#F5EFE6]"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <label className="block text-[10px] font-medium text-[#D8C6AE]/80 mb-1">رمز اللون (HEX)</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={c.hex && c.hex.length === 7 ? c.hex : '#D4C4A8'}
                            onChange={(e) => {
                              const updated = [...colors];
                              updated[idx].hex = e.target.value;
                              setColors(updated);
                            }}
                            className="w-7 h-7 p-0 rounded border border-white/20 bg-transparent cursor-pointer"
                          />
                          <input
                            type="text"
                            value={c.hex}
                            onChange={(e) => {
                              const updated = [...colors];
                              updated[idx].hex = e.target.value;
                              setColors(updated);
                            }}
                            dir="ltr"
                            className="w-full px-2.5 py-1.5 bg-[#211B17] border border-white/10 rounded text-xs text-[#F5EFE6] font-mono"
                          />
                        </div>
                      </div>

                      {colors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteColor(idx)}
                          className="p-1.5 text-red-400 hover:bg-red-950/40 rounded cursor-pointer shrink-0 mt-3"
                          title="حذف هذا اللون"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Independent Color Image Upload */}
                  <AdminImageUploader
                    label="صورة هذا اللون"
                    helperText={`الصورة المعروضة عند اختيار لون "${c.name || 'هذا اللون'}" في المتجر.`}
                    value={c.image}
                    onChange={(url) => {
                      const updated = [...colors];
                      updated[idx].image = url;
                      updated[idx].gallery = [url];
                      setColors(updated);
                      // If mainImage was empty or default, update it
                      if (!mainImage || mainImage === '/images/cat_sheer.jpg') {
                        setMainImage(url);
                      }
                    }}
                    required
                    aspectRatio="4/3"
                    fallbackImage={mainImage || '/images/craft_textures.jpg'}
                    onUploadStateChange={(uploading) => {
                      setPendingUploads((prev) => Math.max(0, prev + (uploading ? 1 : -1)));
                    }}
                  />

                  {/* Color-Specific Sizes Availability & Configuration */}
                  <ColorSizesConfig
                    color={c}
                    allSizes={sizes}
                    variants={variants}
                    onChangeVariants={setVariants}
                    onAddSizeDefinition={(newSizeDef) => {
                      setSizes((prev) => [...prev, newSizeDef]);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Sizes Management */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#C8AA78] uppercase tracking-wider">
                3. دليل مقاسات المنتج المعيارية بالسنتيمتر ({sizes.length})
              </h4>
              <button
                type="button"
                onClick={handleAddSize}
                className="text-[11px] text-[#C8AA78] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>إضافة مقاس للمنتج</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {sizes.map((s, idx) => (
                <div
                  key={s.id || idx}
                  className="p-3 bg-[#171513] border border-white/10 rounded-lg flex items-center justify-between gap-2"
                >
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      value={s.label}
                      onChange={(e) => {
                        const updated = [...sizes];
                        updated[idx].label = e.target.value;
                        setSizes(updated);
                      }}
                      className="w-full px-2 py-1 bg-[#211B17] border border-white/10 rounded text-xs text-[#F5EFE6] font-bold"
                    />
                    <div className="flex items-center gap-2 text-[10px] text-[#D8C6AE]/70">
                      <span>العرض: {s.width_cm} سم</span>
                      <span>•</span>
                      <span>الارتفاع: {s.height_cm} سم</span>
                    </div>
                  </div>

                  {sizes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteSize(idx)}
                      className="p-1.5 text-red-400 hover:bg-red-950/40 rounded cursor-pointer"
                      title="حذف المقاس"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Summary of explicitly configured variants */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#C8AA78] uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#C8AA78]" />
                <span>4. ملخص المقاسات المفعلة للألوان ({variants.filter((v) => v.is_available !== false).length})</span>
              </h4>
            </div>

            {variants.filter((v) => v.is_available !== false).length === 0 ? (
              <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-lg text-xs text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>تنبيه: لم يتم تفعيل أي مقاس للألوان حتى الآن. يرجى تفعيل المقاسات في قسم الألوان أعلاه ليتمكن العملاء من الشراء.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {colors.map((c) => {
                  const activeForColor = variants.filter(
                    (v) => (v.color_id === c.id || v.color_name === c.name) && v.is_available !== false
                  );

                  return (
                    <div
                      key={c.id}
                      className="p-3 bg-[#171513] border border-white/10 rounded-lg space-y-1.5"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-[#F5EFE6]">
                        <span
                          className="w-3 h-3 rounded-full border border-black/30 shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name}</span>
                        <span className="text-[10px] text-[#C8AA78] mr-auto font-normal">
                          ({activeForColor.length} مقاسات مفعلة)
                        </span>
                      </div>

                      {activeForColor.length === 0 ? (
                        <span className="text-[10px] text-amber-400/80 block">
                          لا توجد مقاسات مفعلة لهذا اللون
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {activeForColor.map((v, vIdx) => {
                            const sizeDef = sizes.find((s) => s.id === v.size_id) || { label: v.size_label || 'مقاس' };
                            return (
                              <span
                                key={v.id || vIdx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-[#D8C6AE]"
                              >
                                <span>{sizeDef.label}</span>
                                <span className="text-[#C8AA78] font-bold">({v.price} د.أ)</span>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions Bar */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-white/10 sticky bottom-0 bg-[#211B17] py-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-xs text-[#D8C6AE] rounded cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving || pendingUploads > 0}
              className="px-6 py-2 bg-[#C8AA78] hover:bg-[#d5ba8c] disabled:opacity-50 text-[#171513] text-xs font-bold rounded cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جارٍ الحفظ في قاعدة البيانات...</span>
                </>
              ) : pendingUploads > 0 ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>يرجى الانتظار، جارٍ رفع الصور ({pendingUploads})...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{product ? 'حفظ وتحديث المنتج' : 'إضافة المنتج إلى المتجر'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
