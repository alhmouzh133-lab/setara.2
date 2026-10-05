import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#171513] text-[#F5EFE6] flex flex-col items-center justify-center p-4 text-center">
      <h2 className="text-3xl font-bold mb-4">الصفحة غير موجودة</h2>
      <p className="text-[#D8C6AE] mb-6">عذراً، لم نتمكن من العثور على الصفحة المطلوبة.</p>
      <Link
        href="/"
        className="px-6 py-2.5 bg-[#C8AA78] text-[#171513] rounded-md font-medium hover:bg-[#d5ba8c] transition-colors"
      >
        العودة إلى الرئيسية
      </Link>
    </div>
  );
}
