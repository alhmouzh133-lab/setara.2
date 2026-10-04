import { createClient } from '@/lib/supabase/server';
import { User } from '@supabase/supabase-js';
import { headers } from 'next/headers';

export interface AdminUserRecord {
  id: string;
  user_id: string;
  email: string;
  role: 'admin' | 'super_admin';
  created_at: string;
}

export type AdminAuthResult =
  | {
      authorized: true;
      user: User;
      admin: AdminUserRecord;
    }
  | {
      authorized: false;
      error: 'NOT_AUTHENTICATED' | 'NOT_AUTHORIZED' | 'DATABASE_ERROR' | 'CONFIGURATION_MISSING';
      message: string;
    };

/**
 * Server-side authorization check for all admin routes, API endpoints, and actions.
 * Guarantees that:
 * 1. Supabase environment credentials exist.
 * 2. User identity is validated via Supabase Auth (via cookie session or Bearer token header).
 * 3. The Supabase client is authenticated for database queries so PostgREST enforces authenticated RLS.
 * 4. User's UUID is explicitly matched in public.admin_users.
 * 5. User holds a recognized admin role ('admin' | 'super_admin').
 * 6. Distinguishes authentication, missing membership, database failure, and config errors.
 * 7. Logs sanitized diagnostic details server-side only in a clean single-line format without exposing sensitive credentials.
 */
export async function verifyAdminSession(explicitToken?: string): Promise<AdminAuthResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[AdminAuth] Configuration missing: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined.');
    return {
      authorized: false,
      error: 'CONFIGURATION_MISSING',
      message: 'إعدادات الاتصال بـ Supabase غير مهيأة بعد.',
    };
  }

  // Determine token from explicit parameter or incoming request headers
  let bearerToken = explicitToken;
  if (!bearerToken) {
    try {
      const headerStore = await headers();
      const authHeader = headerStore.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        bearerToken = authHeader.substring(7).trim();
      }
    } catch {
      // Ignored if headers() is invoked in a context without request headers
    }
  }

  // Create client with token support so both auth and database queries are authenticated
  const supabase = await createClient(bearerToken);
  let user: User | null = null;
  let authFailureCode: string | null = null;
  let authFailureMessage: string | null = null;

  // 1. If bearer token is present, validate identity directly with token
  if (bearerToken) {
    try {
      const { data: tokenAuthData, error: tokenAuthError } = await supabase.auth.getUser(bearerToken);
      if (tokenAuthData?.user) {
        user = tokenAuthData.user;
      } else if (tokenAuthError) {
        authFailureCode = tokenAuthError.code || tokenAuthError.name || 'TOKEN_AUTH_FAILED';
        authFailureMessage = tokenAuthError.message;
      }
    } catch (err: any) {
      authFailureCode = 'TOKEN_VERIFY_EXCEPTION';
      authFailureMessage = err?.message || 'Exception during token verification';
    }
  }

  // 2. If no user yet, validate identity via cookie session
  if (!user) {
    try {
      const { data: cookieAuthData, error: cookieAuthError } = await supabase.auth.getUser();
      if (cookieAuthData?.user) {
        user = cookieAuthData.user;
      } else if (cookieAuthError) {
        authFailureCode = cookieAuthError.code || cookieAuthError.name || 'COOKIE_AUTH_FAILED';
        authFailureMessage = cookieAuthError.message;
      }
    } catch (err: any) {
      authFailureCode = 'COOKIE_READ_EXCEPTION';
      authFailureMessage = err?.message || 'Error reading session cookie';
    }
  }

  // 3. Fail closed if user is unauthenticated
  if (!user) {
    if (authFailureCode) {
      console.warn(`[AdminAuth] Authentication unverified: code=${authFailureCode} message="${authFailureMessage || ''}"`);
    }
    return {
      authorized: false,
      error: 'NOT_AUTHENTICATED',
      message: 'يرجى تسجيل الدخول إلى لوحة التحكم للمتابعة.',
    };
  }

  // 4. Query public.admin_users using maybeSingle() to differentiate DB errors from 0 rows
  const { data: adminRecord, error: adminError } = await supabase
    .from('admin_users')
    .select('id, user_id, email, role, created_at')
    .eq('user_id', user.id)
    .maybeSingle();

  // 5. Explicitly handle and log database query failures with single-line sanitized log
  if (adminError) {
    console.error(`[AdminAuth] Database lookup error on admin_users: code=${adminError.code} message="${adminError.message}" details="${adminError.details || ''}" hint="${adminError.hint || ''}" userId=${user.id}`);
    return {
      authorized: false,
      error: 'DATABASE_ERROR',
      message: `حدث خطأ في قاعدة البيانات أثناء التحقق من صلاحيات الحساب (${adminError.code || 'DB_ERR'}): ${adminError.message || ''}`,
    };
  }

  // 6. Handle missing admin record
  if (!adminRecord) {
    console.warn(`[AdminAuth] User authenticated but not present in admin_users: userId=${user.id}`);
    return {
      authorized: false,
      error: 'NOT_AUTHORIZED',
      message: 'هذا الحساب ليس لديه صلاحيات الإدارة في متجر سيتارة.',
    };
  }

  // 7. Authorize 'admin' and 'super_admin' roles only
  const role = adminRecord.role;
  if (role !== 'admin' && role !== 'super_admin') {
    console.warn(`[AdminAuth] User has unrecognized role in admin_users: userId=${user.id} role=${role}`);
    return {
      authorized: false,
      error: 'NOT_AUTHORIZED',
      message: 'صلاحية هذا الحساب غير كافية للوصول إلى لوحة التحكم.',
    };
  }

  return {
    authorized: true,
    user,
    admin: adminRecord as AdminUserRecord,
  };
}
