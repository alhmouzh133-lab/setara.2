'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // 1. Authenticate with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('بيانات الدخول غير صحيحة. يرجى التحقق من البريد الإلكتروني وكلمة المرور.');
        } else {
          setErrorMessage(`فشل تسجيل الدخول: ${error.message}`);
        }
        setLoading(false);
        return;
      }

      // 2. Verify server-side admin privileges via auth/me endpoint
      const headers: Record<string, string> = {};
      if (data.session?.access_token) {
        headers['Authorization'] = `Bearer ${data.session.access_token}`;
      }

      const res = await fetch('/api/auth/me', { headers });
      const authCheck = await res.json();

      if (!res.ok || !authCheck.isAdmin) {
        // Sign out unauthorized users so unprivileged sessions don't linger
        if (authCheck.error === 'NOT_AUTHORIZED') {
          await supabase.auth.signOut();
        }
        setErrorMessage(
          authCheck.message || 'هذا الحساب ليس لديه صلاحيات الإدارة في متجر سيتارة.'
        );
        setLoading(false);
        return;
      }

      // 3. Authorized admin: redirect to admin dashboard
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setErrorMessage(`حدث خطأ غير متوقع: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#171513] text-[#F5EFE6] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-radial from-[#C8AA78]/5 via-transparent to-transparent pointer-events-none" />

      {/* Brand Header */}
      <div className="w-full max-w-md mx-auto text-center mb-8 relative z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#211B17] border border-[#C8AA78]/40 mb-4 shadow-lg">
          <Image
            src="/images/setara-logo.png"
            alt="سيتارة"
            width={44}
            height={44}
            className="object-contain"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5EFE6]">
          لوحة تحكم سيتارة
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#D8C6AE]/80 font-normal">
          نظام إدارة الكتالوج والمنتجات والستائر الفاخرة
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md mx-auto bg-[#211B17] border border-[#C8AA78]/30 rounded-xl p-6 sm:p-8 shadow-2xl relative z-10 text-right">
        <div className="flex items-center gap-2 pb-4 mb-6 border-b border-white/10 text-xs text-[#C8AA78] font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>منطقة الإدارة المحمية (Phase 1)</span>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 bg-red-950/60 border border-red-500/40 rounded-lg flex items-start gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#D8C6AE] mb-1.5">
              البريد الإلكتروني للإدارة
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@setara.jo"
                required
                dir="ltr"
                className="w-full px-3.5 py-2.5 bg-[#171513] border border-white/15 focus:border-[#C8AA78] focus:ring-1 focus:ring-[#C8AA78] rounded-md text-sm text-[#F5EFE6] placeholder:text-neutral-500 transition-colors pl-10 text-left"
              />
              <Mail className="w-4 h-4 text-[#D8C6AE]/60 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#D8C6AE] mb-1.5">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                dir="ltr"
                className="w-full px-3.5 py-2.5 bg-[#171513] border border-white/15 focus:border-[#C8AA78] focus:ring-1 focus:ring-[#C8AA78] rounded-md text-sm text-[#F5EFE6] placeholder:text-neutral-500 transition-colors pl-10 text-left"
              />
              <Lock className="w-4 h-4 text-[#D8C6AE]/60 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-[#C8AA78] hover:bg-[#d5ba8c] active:bg-[#b89a68] disabled:opacity-50 text-[#171513] font-bold text-sm rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#171513]" />
                <span>جارٍ التحقق والمصادقة...</span>
              </>
            ) : (
              <span>دخول لوحة التحكم</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#D8C6AE]/70">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[#C8AA78] hover:text-[#e2d0b2] transition-colors"
          >
            <span>العودة إلى المتجر</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </Link>
          <span>نظام المصادقة الآمن عبر Supabase</span>
        </div>
      </div>
    </div>
  );
}
