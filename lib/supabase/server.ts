import { createServerClient } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';

export async function createClient(customToken?: string) {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Extract Bearer token if provided explicitly or available in incoming request headers
  let authHeader: string | undefined = customToken ? `Bearer ${customToken}` : undefined;
  if (!authHeader) {
    try {
      const headerStore = await headers();
      const reqAuth = headerStore.get('authorization');
      if (reqAuth && reqAuth.startsWith('Bearer ')) {
        authHeader = reqAuth;
      }
    } catch {
      // Ignored if headers() is invoked in a context without request headers
    }
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: authHeader ? { Authorization: authHeader } : {},
    },
    cookieOptions: {
      sameSite: 'none',
      secure: true,
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, {
              ...options,
              sameSite: 'none',
              secure: true,
            })
          );
        } catch {
          // Ignored when invoked from read-only Server Component context
        }
      },
    },
  });
}
