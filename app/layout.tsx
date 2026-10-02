import type { Metadata } from 'next';
import { Tajawal } from 'next/font/google';
import './globals.css';

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-tajawal',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'سيتارة | متجر ستائر فاخرة وتفصيل حسب الطلب',
  description: 'سيتارة في الأردن - ستائر جاهزة فاخرة وتفصيل حسب الطلب بجودة عالية وتصاميم عصرية تناسب كل مساحة.',
  openGraph: {
    title: 'سيتارة | متجر ستائر فاخرة وتفصيل حسب الطلب',
    description: 'سيتارة في الأردن - ستائر جاهزة فاخرة وتفصيل حسب الطلب بجودة عالية وتصاميم عصرية تناسب كل مساحة.',
    type: 'website',
    locale: 'ar_JO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'سيتارة | متجر ستائر فاخرة وتفصيل حسب الطلب',
    description: 'سيتارة في الأردن - ستائر جاهزة فاخرة وتفصيل حسب الطلب بجودة عالية وتصاميم عصرية تناسب كل مساحة.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} font-sans`}>
      <body className="bg-[#171513] text-[#F5EFE6] antialiased selection:bg-[#C8AA78]/30 selection:text-[#F5EFE6]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
