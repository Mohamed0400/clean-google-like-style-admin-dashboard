import { BarChart3, Download, FileSpreadsheet } from 'lucide-react';
import { ActivityLog, LiveGoldRates } from '../types';
import { useI18n } from '../i18n';

interface ReportingViewProps {
  rates: LiveGoldRates;
  logs: ActivityLog[];
  onOpenLedger: () => void;
}

export default function ReportingView({ rates, logs, onOpenLedger }: ReportingViewProps) {
  const { t } = useI18n();
  const totalVolume = logs.reduce((s, l) => s + l.totalAmount, 0);
  const buyCount = logs.filter((l) => l.type === 'scrap_buy' || l.type === 'trade_buy' || l.type === 'purchase').length;
  const sellCount = logs.filter((l) => l.type === 'trade_sell').length;

  const packages = ['pkgDaily', 'pkgInventory', 'pkgScrap', 'pkgCapital'] as const;

  return (
    <div className="space-y-6 animate-fade-in" id="reporting-view">
      <header className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-amber-700" />
          <div>
            <h1 className="text-xl font-bold text-slate-950">{t('reporting.title')}</h1>
            <p className="text-xs text-slate-500 mt-0.5">{t('reporting.subtitle')}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenLedger}
          className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-4 py-2 rounded-lg hover:bg-amber-100 cursor-pointer"
        >
          {t('common.openLedger')}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: t('reporting.ledgerEntries'), value: String(logs.length) },
          { label: t('reporting.buyFlows'), value: String(buyCount) },
          { label: t('reporting.sellFlows'), value: String(sellCount) },
          { label: t('reporting.spotAnchor'), value: `$${rates['24K'].toFixed(2)}/g` },
        ].map((m) => (
          <div key={m.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-[10px] text-slate-500 uppercase">{m.label}</p>
            <p className="text-xl font-bold text-white font-mono mt-2" dir="ltr">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-bold text-white mb-3">{t('reporting.packages')}</h2>
          <ul className="space-y-2">
            {packages.map((key) => (
              <li
                key={key}
                className="flex items-center justify-between bg-stone-950 border border-stone-800 rounded-lg px-3 py-2.5 text-xs text-slate-400"
              >
                <span>{t(`reporting.${key}`)}</span>
                <button type="button" className="flex items-center gap-1 text-amber-500 hover:text-amber-400 cursor-pointer font-bold">
                  <Download className="w-3.5 h-3.5" />
                  {t('common.export')}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-amber-700" />
            {t('reporting.sampleSummary')}
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            {t('reporting.ledgerNotional', { amount: `$${totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}` })}
          </p>
          <div className="h-32 flex items-end gap-2">
            {[40, 65, 55, 80, 70, 90, 75].map((h, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-amber-800 to-amber-500 rounded-t opacity-80" style={{ height: `${h}%` }} />
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-mono">{t('reporting.weeklyChart')}</p>
        </div>
      </div>
    </div>
  );
}
