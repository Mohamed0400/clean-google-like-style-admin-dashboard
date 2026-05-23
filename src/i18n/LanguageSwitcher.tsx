import { Languages } from 'lucide-react';
import { useI18n } from './context';
import type { Locale } from './types';

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();

  const btn = (l: Locale, label: string) => (
    <button
      type="button"
      onClick={() => setLocale(l)}
      className={`px-2.5 py-1 rounded-md text-[10px] font-bold font-sans transition-all cursor-pointer ${
        locale === l
          ? 'bg-amber-600 text-white'
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
      aria-pressed={locale === l}
    >
      {label}
    </button>
  );

  if (compact) {
    return (
      <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
        {btn('en', 'EN')}
        {btn('ar', 'ع')}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2" id="language-switcher">
      <Languages className="w-4 h-4 text-amber-500 shrink-0" />
      <span className="text-[10px] text-slate-500 uppercase tracking-wider hidden sm:inline">
        {t('lang.switchLabel')}
      </span>
      <div className="flex gap-0.5 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
        {btn('en', t('lang.en'))}
        {btn('ar', t('lang.ar'))}
      </div>
    </div>
  );
}
