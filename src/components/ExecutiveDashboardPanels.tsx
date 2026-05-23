import React from 'react';
import {
  Wallet,
  DollarSign,
  Layers,
  Globe,
  Smartphone,
  Calculator,
  TrendingUp,
} from 'lucide-react';
import { GoldItem, ActivityLog, ChannelStats, BankReserve, LiveGoldRates } from '../types';
import { useI18n } from '../i18n';
import { translateCategory, translateSource } from '../i18n/helpers';

interface ExecutiveDashboardPanelsProps {
  rates: LiveGoldRates;
  inventory: GoldItem[];
  bank: BankReserve;
  stats: ChannelStats;
  logs: ActivityLog[];
  priceHistory: { date: string; rate: number }[];
  inventoryValue: number;
  totalAssets: number;
}

function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const w = 120;
  const h = 32;
  const coords = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-8 text-amber-500">
      <polyline fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" points={coords} />
    </svg>
  );
}

function ProgressBar({ pct, label, value }: { pct: number; label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="text-amber-400 font-mono font-semibold">{value}</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all"
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}

function DonutChart({ segments }: { segments: { label: string; pct: number; color: string }[] }) {
  const r = 40;
  const cx = 48;
  const cy = 48;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 96 96" className="w-28 h-28 shrink-0">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth="14" />
        {segments.map((s) => {
          const dash = (s.pct / 100) * circumference;
          const gap = circumference - dash;
          const el = (
            <circle
              key={s.label}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="14"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
      <ul className="text-xs space-y-1 text-slate-400">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            {s.label} <span className="text-slate-500 font-mono">{s.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function IncomeLineChart({ history }: { history: { date: string; rate: number }[] }) {
  const padding = 8;
  const w = 320;
  const h = 100;
  const rates = history.map((h) => h.rate);
  const min = Math.min(...rates) - 0.5;
  const max = Math.max(...rates) + 0.5;
  const range = max - min || 1;

  const toPath = (multiplier: number) => {
    const pts = history.map((pt, i) => {
      const x = padding + (i / Math.max(1, history.length - 1)) * (w - padding * 2);
      const y = h - padding - ((pt.rate * multiplier - min) / range) * (h - padding * 2);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    });
    return pts.join(' ');
  };

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-28">
      <line x1={padding} y1={h - padding} x2={w - padding} y2={h - padding} stroke="#334155" strokeWidth="1" />
      <path d={toPath(0.97)} fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="5 4" />
      <path d={toPath(1)} fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function formatCompact(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function categoryValue(items: GoldItem[], rates: LiveGoldRates, filter: (i: GoldItem) => boolean) {
  return items.filter(filter).reduce((sum, item) => {
    let rate = rates['24K'];
    if (item.purity === '22K') rate = rates['22K'];
    if (item.purity === '21K') rate = rates['21K'];
    if (item.purity === '18K') rate = rates['18K'];
    if (item.purity === 'Scrap') rate = rates.scrapRateRate;
    return sum + item.weightGrams * item.qty * rate;
  }, 0);
}

function categoryOz(items: GoldItem[], filter: (i: GoldItem) => boolean) {
  const g = items.filter(filter).reduce((s, i) => s + i.weightGrams * i.qty, 0);
  return (g / 31.103).toFixed(0);
}

export default function ExecutiveDashboardPanels({
  rates,
  inventory,
  bank,
  stats,
  logs,
  priceHistory,
  inventoryValue,
  totalAssets,
}: ExecutiveDashboardPanelsProps) {
  const { t, locale } = useI18n();
  const dateLoc = locale === 'ar' ? 'ar-KW' : 'en-US';
  const spotOz = rates['24K'] * 31.1034768;
  const dailyIncome =
    stats.website.todayVolumeGrams * rates['24K'] +
    stats.mobile_app.todayVolumeGrams * rates['24K'] +
    stats.pos.todayVolumeGrams * rates['24K'];

  const webRev = stats.website.todayVolumeGrams * rates['24K'];
  const mobileRev = stats.mobile_app.todayVolumeGrams * rates['24K'];
  const posRev = stats.pos.todayVolumeGrams * rates['24K'];
  const totalRev = webRev + mobileRev + posRev || 1;

  const bullionsVal = categoryValue(
    inventory,
    rates,
    (i) => i.category === 'bullion' || i.category === 'bar'
  );
  const barsVal = categoryValue(inventory, rates, (i) => i.category === 'bar');
  const lira24Val = categoryValue(inventory, rates, (i) => i.purity === '24K' && i.category === 'lira');
  const lira22Val = categoryValue(inventory, rates, (i) => i.purity === '22K' && i.category === 'lira');
  const invTotal = bullionsVal + barsVal + lira24Val + lira22Val || 1;

  const bullionsOz = categoryOz(inventory, (i) => i.category === 'bullion' || i.category === 'bar');
  const barsOz = categoryOz(inventory, (i) => i.category === 'bar');
  const lira24Oz = categoryOz(inventory, (i) => i.purity === '24K' && i.category === 'lira');
  const lira22Oz = categoryOz(inventory, (i) => i.purity === '22K' && i.category === 'lira');

  const scrapLogs = logs.filter((l) => l.type === 'scrap_buy').slice(0, 4);

  const totalVol =
    stats.website.todayVolumeGrams + stats.mobile_app.todayVolumeGrams + stats.pos.todayVolumeGrams || 1;

  const donutSegments = [
    {
      label: t('executive.donutBullions'),
      pct: Math.round((bullionsVal / inventoryValue) * 100) || 38,
      color: '#d97706',
    },
    {
      label: t('executive.donutBars'),
      pct: Math.round((barsVal / inventoryValue) * 100) || 22,
      color: '#b45309',
    },
    {
      label: t('executive.donut24k'),
      pct: Math.round((lira24Val / inventoryValue) * 100) || 15,
      color: '#f59e0b',
    },
    {
      label: t('executive.donut22k'),
      pct: Math.round((lira22Val / inventoryValue) * 100) || 6,
      color: '#fcd34d',
    },
    {
      label: t('executive.donutOther'),
      pct: Math.max(
        0,
        100 -
          Math.round((bullionsVal / inventoryValue) * 100) -
          Math.round((barsVal / inventoryValue) * 100) -
          Math.round((lira24Val / inventoryValue) * 100) -
          Math.round((lira22Val / inventoryValue) * 100)
      ) || 19,
      color: '#78716c',
    },
  ];

  const cardClass =
    'bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700/80 transition-colors';

  return (
    <section className="space-y-4" id="executive-dashboard-panels">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">
          {t('common.executiveDashboard')}
        </h2>
        <span className="text-[10px] text-slate-500 font-mono">
          {new Date().toLocaleDateString(dateLoc, { month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      {/* Top KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <div className={cardClass}>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">{t('executive.liveSpot')}</p>
          <div className="flex items-end justify-between mt-2 gap-2">
            <div>
              <p className="text-xl font-bold text-white font-mono">${spotOz.toFixed(2)}/oz</p>
              <p className="text-xs text-emerald-400 flex items-center gap-0.5 mt-0.5">
                <TrendingUp className="w-3 h-3" /> {t('common.spotUp')}
              </p>
            </div>
            <div className="w-20">
              <Sparkline points={priceHistory.map((p) => p.rate)} />
              <p className="text-[9px] text-slate-600 text-end">{t('common.last24h')}</p>
            </div>
          </div>
          <p className="text-[10px] text-amber-600/80 font-mono mt-2">${rates['24K'].toFixed(2)}/g spot</p>
        </div>

        <div className={cardClass}>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">{t('executive.portfolio')}</p>
          <div className="flex items-end justify-between mt-2">
            <div>
              <p className="text-xl font-bold text-white font-mono">
                ${totalAssets.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-emerald-400 mt-0.5">{t('common.vsPortfolio')}</p>
              <p className="text-[10px] text-slate-500 font-mono mt-1" dir="ltr">
                {t('executive.cashLine', { amount: `$${bank.cashBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}` })}
              </p>
            </div>
            <Wallet className="w-6 h-6 text-amber-600/50" />
          </div>
        </div>

        <div className={cardClass}>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">{t('executive.liveIncome')}</p>
          <div className="flex items-end justify-between mt-2">
            <div>
              <p className="text-xl font-bold text-white font-mono">
                ${dailyIncome.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">{t('common.daily')}</p>
            </div>
            <DollarSign className="w-6 h-6 text-amber-600/50" />
          </div>
        </div>

        <div className={cardClass}>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">{t('executive.activeChannels')}</p>
          <div className="flex items-end justify-between mt-2">
            <p className="text-xl font-bold text-white font-mono">3</p>
            <Layers className="w-6 h-6 text-amber-600/50" />
          </div>
          <p className="text-[10px] text-slate-500 mt-1">{t('channels.threeChannels')}</p>
        </div>
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className={cardClass}>
          <p className="text-sm font-bold text-white mb-3">{t('executive.inventoryBreakdown')}</p>
          <div className="h-2.5 rounded-full overflow-hidden flex mb-4">
            <div className="bg-amber-600" style={{ width: `${(bullionsVal / invTotal) * 100}%` }} />
            <div className="bg-amber-700" style={{ width: `${(barsVal / invTotal) * 100}%` }} />
            <div className="bg-amber-500" style={{ width: `${(lira24Val / invTotal) * 100}%` }} />
            <div className="bg-amber-400" style={{ width: `${(lira22Val / invTotal) * 100}%` }} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              [t('executive.bullions'), formatCompact(bullionsVal), `${bullionsOz}${t('common.oz')}`],
              [t('executive.bars'), formatCompact(barsVal), `${barsOz}${t('common.oz')}`],
              [t('executive.liras24'), formatCompact(lira24Val), `${lira24Oz}${t('common.oz')}`],
              [t('executive.liras22'), formatCompact(lira22Val), `${lira22Oz}${t('common.oz')}`],
            ].map(([name, val, oz]) => (
              <div key={name} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5">
                <p className="text-[10px] text-slate-500 leading-tight">{name}</p>
                <p className="text-sm font-bold text-amber-400 font-mono mt-1">{val}</p>
                <p className="text-[10px] text-slate-600 font-mono">{oz}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={cardClass}>
          <p className="text-sm font-bold text-white">{t('executive.incomePerf')}</p>
          <p className="text-[10px] text-slate-500 mb-2">{t('executive.revenueTrend')}</p>
          <div className="flex gap-4 text-[10px] mb-2">
            <span className="flex items-center gap-1.5 text-amber-500">
              <span className="w-4 h-0.5 bg-amber-500 inline-block rounded" /> {t('common.actual')}
            </span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-4 border-t border-dashed border-slate-500 inline-block" /> {t('common.target')}
            </span>
          </div>
          <IncomeLineChart history={priceHistory} />
          <div className="flex justify-between text-[10px] text-slate-600 mt-2 font-mono">
            {priceHistory.slice(0, 5).map((p) => (
              <span key={p.date}>{p.date}</span>
            ))}
          </div>
        </div>

        <div className={cardClass}>
          <p className="text-sm font-bold text-white mb-3">{t('executive.revenueByChannel')}</p>
          <div className="space-y-3">
            <ProgressBar label={t('channels.website')} value={formatCompact(webRev)} pct={(webRev / totalRev) * 100} />
            <ProgressBar label={t('channels.mobile')} value={formatCompact(mobileRev)} pct={(mobileRev / totalRev) * 100} />
            <ProgressBar label={t('channels.pos')} value={formatCompact(posRev)} pct={(posRev / totalRev) * 100} />
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className={cardClass}>
          <p className="text-sm font-bold text-white mb-3">{t('executive.physicalStatus')}</p>
          <DonutChart segments={donutSegments} />
        </div>

        <div className={cardClass}>
          <p className="text-sm font-bold text-white">{t('executive.scrapPurchases')}</p>
          <p className="text-[10px] text-slate-500 mb-3">{t('executive.recentTx')}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-600 border-b border-slate-800">
                  <th className="text-start py-2 font-medium">{t('common.source')}</th>
                  <th className="text-start">{t('common.item')}</th>
                  <th className="text-end">{t('common.weight')}</th>
                  <th className="text-end">{t('common.value')}</th>
                  <th className="text-end">{t('common.date')}</th>
                </tr>
              </thead>
              <tbody className="text-slate-400 divide-y divide-slate-800/60">
                {scrapLogs.length > 0 ? (
                  scrapLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="py-2">{translateSource(t, log.source)}</td>
                      <td>{translateCategory(t, log.category)}</td>
                      <td className="text-end font-mono" dir="ltr">{log.weightGrams.toFixed(1)}g</td>
                      <td className="text-end font-mono text-amber-400" dir="ltr">
                        ${log.totalAmount.toLocaleString()}
                      </td>
                      <td className="text-end font-mono text-slate-500">
                        {new Date(log.timestamp).toLocaleDateString(dateLoc)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-600">
                      {t('executive.noScrap')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={cardClass}>
          <p className="text-sm font-bold text-white">{t('executive.channelTracking')}</p>
          <p className="text-[10px] text-slate-500 mb-3">{t('executive.activityBreakdown')}</p>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-600 border-b border-slate-800">
                <th className="text-start py-2">{t('common.channel')}</th>
                <th className="text-end">{t('common.pct')}</th>
                <th className="text-end">{t('common.users')}</th>
                <th className="text-end">{t('common.txns')}</th>
              </tr>
            </thead>
            <tbody className="text-slate-400 divide-y divide-slate-800/60">
              <tr>
                <td className="py-2 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-amber-600" /> {t('channels.website')}
                </td>
                <td className="text-right font-mono">
                  {((stats.website.todayVolumeGrams / totalVol) * 100).toFixed(0)}%
                </td>
                <td className="text-right font-mono">{stats.website.activeSessions}</td>
                <td className="text-right font-mono">{stats.website.todayTransactions}</td>
              </tr>
              <tr>
                <td className="py-2 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-amber-600" /> {t('channels.mobile')}
                </td>
                <td className="text-right font-mono">
                  {((stats.mobile_app.todayVolumeGrams / totalVol) * 100).toFixed(0)}%
                </td>
                <td className="text-right font-mono">{stats.mobile_app.activeSessions}</td>
                <td className="text-right font-mono">{stats.mobile_app.todayTransactions}</td>
              </tr>
              <tr>
                <td className="py-2 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-amber-600" /> {t('channels.pos')}
                </td>
                <td className="text-right font-mono">
                  {((stats.pos.todayVolumeGrams / totalVol) * 100).toFixed(0)}%
                </td>
                <td className="text-right font-mono">{stats.pos.activeTerminals}</td>
                <td className="text-right font-mono">{stats.pos.todayTransactions}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
