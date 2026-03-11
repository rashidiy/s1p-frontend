import Link from 'next/link';
import { SearchCharacter } from '@/components/illustrations/SearchCharacter';
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('common');

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-[#F8F9FA]">
      <div className="crm-card px-12 py-14 text-center max-w-md w-full page-fade-in">
        <SearchCharacter width={180} height={180} className="mx-auto" />
        <h1 className="text-7xl font-extrabold text-gray-200 mt-4 leading-none tracking-tight">
          404
        </h1>
        <h2 className="text-2xl font-bold text-gray-900 mt-2">
          {t('pageNotFound')}
        </h2>
        <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed">
          {t('pageNotFoundDescription')}
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center mt-6 px-6 py-2.5 rounded-xl bg-gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          {t('goHome')}
        </Link>
      </div>
    </div>
  );
}
