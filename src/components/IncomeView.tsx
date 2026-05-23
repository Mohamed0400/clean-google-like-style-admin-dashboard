import { DollarSign, TrendingUp } from 'lucide-react';
import { ChannelStats, LiveGoldRates } from '../types';
import { useI18n } from '../i18n';

interface IncomeViewProps {
  rates: LiveGoldRates;
  stats: ChannelStats;
  priceHistory: { date: string; rate: number }[];
}

export default function IncomeView({ rates, stats, priceHistory }: IncomeViewProps) {
  const { t } = useI18n();
  const web = stats.website.todayVolumeGrams * rates['24K'];
  const mobile = stats.mobile_app.todayVolumeGrams * rates['24K'];
  const pos = stats.pos.todayVolumeGrams * rates['24K'];
  const daily = web + mobile + pos;
  const total = daily || 1;

  return (
    <div className="space-y-6 animate-fade-in" id="income-view">
      <header className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-amber-700" />
          <div>
            <h1 className="text-xl font-bold text-slate-950">{t('income.title')}</h1>
            <p className="text-xs text-slate-500 mt-0.5">{t('income.subtitle')}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">{t('income.daily')}</p>
          <p className="text-2xl font-bold text-white font-mono mt-2">${daily.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> {t('common.vsYesterday')}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">{t('income.weeklyTarget')}</p>
          <p className="text-2xl font-bold text-white font-mono mt-2">${(daily * 7 * 1.05).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          <p className="text-xs text-slate-500 mt-1">{t('income.targetNote')}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">{t('income.mtd')}</p>
          <p className="text-2xl font-bold text-white font-mono mt-2">${(daily * 22).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          <p className="text-xs text-slate-500 mt-1">{t('income.mtdNote')}</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 className="text-sm font-bold text-white mb-4">{t('income.byChannel')}</h2>
        <div className="space-y-4">
          {[
            { label: t('channels.website'), amount: web, pct: (web / total) * 100 },
            { label: t('channels.mobile'), amount: mobile, pct: (mobile / total) * 100 },
            { label: t('channels.pos'), amount: pos, pct: (pos / total) * 100 },
          ].map((row) => (
            <div key={row.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">{row.label}</span>
                <span className="text-amber-400 font-mono">${row.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-600 rounded-full" style={{ width: `${row.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 mb-2">{t('income.spotTrend')}</h2>
        <p className="text-xs text-slate-500 mb-4">{t('income.spotTrendSub', { n: priceHistory.length })}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          {priceHistory.slice(-4).map((p) => (
            <div key={p.date} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-[10px] text-slate-500">{p.date}</p>
              <p className="font-mono font-bold text-amber-800 mt-1" dir="ltr">${(p.rate * 1200).toFixed(0)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
