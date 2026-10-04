import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/admin-auth';
import AdminDashboard from '@/components/admin/AdminDashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'لوحة التحكم | سيتارة',
  description: 'لوحة إدارة الكتالوج والمنتجات والأقسام لمتجر سيتارة',
};

export default async function AdminPage() {
  // 1. Strict Server-Side Identity and Role Verification
  const auth = await verifyAdminSession();

  if (!auth.authorized) {
    redirect('/admin/login');
  }

  // 2. Render Protected Dashboard with Authorized Admin Context
  return <AdminDashboard admin={auth.admin} />;
}
