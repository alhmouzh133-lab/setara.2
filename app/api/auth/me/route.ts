import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin-auth';

export async function GET() {
  const auth = await verifyAdminSession();

  if (!auth.authorized) {
    const statusCode =
      auth.error === 'CONFIGURATION_MISSING' || auth.error === 'DATABASE_ERROR'
        ? 500
        : auth.error === 'NOT_AUTHENTICATED'
        ? 401
        : 403;

    return NextResponse.json(
      {
        authenticated: auth.error !== 'NOT_AUTHENTICATED' && auth.error !== 'CONFIGURATION_MISSING',
        isAdmin: false,
        error: auth.error,
        message: auth.message,
      },
      { status: statusCode }
    );
  }

  return NextResponse.json({
    authenticated: true,
    isAdmin: true,
    user: {
      id: auth.user.id,
      email: auth.user.email,
    },
    admin: auth.admin,
  });
}
