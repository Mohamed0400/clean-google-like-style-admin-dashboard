import React, { useState } from 'react';
import {
  TrendingUp,
  Database,
  FileText,
  Globe,
  Smartphone,
  Monitor,
  Plus,
  Coins,
  Calculator,
  ArrowUpRight,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { GoldItem, ActivityLog, ChannelStats, BankReserve, LiveGoldRates } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import ExecutiveDashboardPanels from './ExecutiveDashboardPanels';
import { useI18n } from '../i18n';
import { translateLogType, translateSource } from '../i18n/helpers';

interface DashboardHomeProps {
  rates: LiveGoldRates;
  inventory: GoldItem[];
  bank: BankReserve;
  stats: ChannelStats;
  logs: ActivityLog[];
  priceHistory: { date: string; rate: number }[];
  onNavigate: (tab: string) => void;
  triggerLivePriceUpdate: () => void;
}

function purityLabel(t: (k: string) => string, purity: string) {
  return purity === 'Scrap' ? t('purity.scrap') : t(`purity.${purity}`);
}

export default function DashboardHome({
  rates,
  inventory,
  bank,
  stats,
  logs,
  priceHistory,
  onNavigate,
  triggerLivePriceUpdate,
}: DashboardHomeProps) {
  const { t, locale } = useI18n();
  const dateLoc = locale === 'ar' ? 'ar-KW' : 'en-US';
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [activeChartSource, setActiveChartSource] = useState<'spot' | 'volume'>('spot');

  const calculateInventoryValue = () => {
    return inventory.reduce((total, item) => {
      let rate = rates['24K'];
      if (item.purity === '22K') rate = rates['22K'];
      if (item.purity === '21K') rate = rates['21K'];
      if (item.purity === '18K') rate = rates['18K'];
      if (item.purity === 'Scrap') rate = rates.scrapRateRate;
      return total + item.weightGrams * item.qty * rate;
    }, 0);
  };

  const inventoryValue = calculateInventoryValue();
  const totalAssets = bank.cashBalance + inventoryValue;

  const totalVol =
    stats.pos.todayVolumeGrams + stats.website.todayVolumeGrams + stats.mobile_app.todayVolumeGrams || 1;
  const posPct = ((stats.pos.todayVolumeGrams / totalVol) * 100).toFixed(0);
  const webPct = ((stats.website.todayVolumeGrams / totalVol) * 100).toFixed(0);
  const mobilePct = ((stats.mobile_app.todayVolumeGrams / totalVol) * 100).toFixed(0);

  const padding = 40;
  const chartHeight = 180;
  const chartWidth = 500;
  const ratesArray = priceHistory.map((h) => h.rate);
  const minRate = Math.min(...ratesArray) - 0.8;
  const maxRate = Math.max(...ratesArray) + 0.8;
  const rateRange = maxRate - minRate;

  const getCoordinates = () => {
    return priceHistory.map((pt, index) => {
      const x = padding + (index * (chartWidth - padding * 2)) / (priceHistory.length - 1);
      const ratio = (pt.rate - minRate) / rateRange;
      const y = chartHeight - padding - ratio * (chartHeight - padding * 2);
      return { x, y, ...pt };
    });
  };

  const points = getCoordinates();
  const pathD =
    points.length > 0 ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ') : '';

  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`
      : '';

  return (
    <div className="space-y-6 animate-fade-in" id="dashboard-home-section">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-200 rounded-xl p-5 gap-4 shadow-sm" id="upper-bar">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" id="status-pulse" />
            <h1 className="text-xl font-bold text-slate-950 font-sans tracking-tight" id="hub-title">
              {t('dashboard.title')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{t('dashboard.subtitle')}</p>
        </div>

        <div className="flex items-center gap-4 flex-wrap w-full sm:w-auto">
          <div className="bg-amber-50/60 px-4 py-2 rounded-lg border border-amber-200/60 flex items-center gap-2.5 grow sm:grow-0" id="live-rate-badge">
            <Coins className="w-5 h-5 text-amber-700 animate-spin-slow" />
            <div>
              <p className="text-[10px] text-amber-800 uppercase font-mono tracking-wider">{t('dashboard.spot24k')}</p>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-sm font-bold text-amber-800" dir="ltr">
                  ${rates['24K'].toFixed(2)}
                </span>
                <span className="text-[10px] text-emerald-600 flex items-center font-mono" dir="ltr">
                  <TrendingUp className="w-2.5 h-2.5 me-0.5" />
                  {t('common.spotBadge')}
                </span>
              </div>
            </div>
          </div>

          <button
            id="refresh-feed-btn"
            onClick={triggerLivePriceUpdate}
            className="px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all cursor-pointer font-sans duration-150"
          >
            <Clock className="w-4 h-4" />
            {t('dashboard.tickRates')}
          </button>
        </div>
      </div>

      <ExecutiveDashboardPanels
        rates={rates}
        inventory={inventory}
        bank={bank}
        stats={stats}
        logs={logs}
        priceHistory={priceHistory}
        inventoryValue={inventoryValue}
        totalAssets={totalAssets}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="chart-sources-panel">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between" id="chart-container-card">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100" id="chart-header">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-sans">
                <TrendingUp className="w-4 h-4 text-amber-700" id="chart-title-icon" />
                {t('dashboard.chartTitle')}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-sans">{t('dashboard.chartSub')}</p>
            </div>

            <div className="flex bg-slate-100 p-0.5 border border-slate-200 rounded-lg text-xs" id="chart-toggle-tabs">
              <button
                id="chart-spot-tab-btn"
                onClick={() => setActiveChartSource('spot')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer font-sans font-bold ${activeChartSource === 'spot' ? 'bg-amber-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {t('dashboard.spotPrice')}
              </button>
              <button
                id="chart-volume-tab-btn"
                onClick={() => setActiveChartSource('volume')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer font-sans font-bold ${activeChartSource === 'volume' ? 'bg-amber-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {t('dashboard.channelVolume')}
              </button>
            </div>
          </div>

          <div className="relative pt-6 h-[200px]" id="spot-price-svg-wrapper">
            {activeChartSource === 'spot' ? (
              <div className="w-full h-full">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible" id="chart-svg">
                  <defs>
                    <linearGradient id="goldAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#B45309" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#B45309" stopOpacity="0.00" />
                    </linearGradient>
                    <linearGradient id="goldLineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#B45309" />
                      <stop offset="50%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#D97706" />
                    </linearGradient>
                  </defs>

                  {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
                    const y = padding + r * (chartHeight - padding * 2);
                    const labelVal = maxRate - r * rateRange;
                    return (
                      <g key={i} className="opacity-90">
                        <line x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                        <text x={padding - 8} y={y + 3} fill="#475569" fontSize="8.5" className="font-mono text-end font-medium" textAnchor="end">
                          ${labelVal.toFixed(2)}
                        </text>
                      </g>
                    );
                  })}

                  <path d={areaD} fill="url(#goldAreaGrad)" />
                  <path d={pathD} fill="none" stroke="url(#goldLineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                  {points.map((pt, i) => (
                    <g
                      key={i}
                      onMouseEnter={() => setHoverIndex(i)}
                      onMouseLeave={() => setHoverIndex(null)}
                      className="cursor-pointer"
                      id={`chart-dot-group-${i}`}
                    >
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={hoverIndex === i ? 6 : 4}
                        fill={hoverIndex === i ? '#ffffff' : '#B45309'}
                        stroke={hoverIndex === i ? '#B45309' : '#ffffff'}
                        strokeWidth={2}
                        className="transition-all duration-150"
                      />
                    </g>
                  ))}
                </svg>

                <AnimatePresence>
                  {hoverIndex !== null && (
                    <motion.div
                      id="chart-tooltip"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-[10px] text-slate-300 font-mono pointer-events-none shadow-lg"
                      style={{
                        left: `${(points[hoverIndex].x / chartWidth) * 90}%`,
                        top: '10px',
                      }}
                    >
                      <p className="font-sans font-bold text-amber-500">{t('dashboard.chartDate', { date: points[hoverIndex].date })}</p>
                      <p className="mt-0.5" dir="ltr">
                        {t('dashboard.chartSpot', { rate: points[hoverIndex].rate.toFixed(2) })}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex flex-col justify-center h-full space-y-4" id="volume-breakdown-subsystem">
                <div className="grid grid-cols-3 gap-4" id="volume-grid">
                  <div className="text-center p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-mono uppercase">{t('channels.website')}</p>
                    <p className="text-lg font-bold text-slate-800 font-mono mt-1" dir="ltr">
                      {stats.website.todayVolumeGrams.toLocaleString()}g
                    </p>
                    <p className="text-[10px] text-amber-700 font-bold mt-1">
                      {t('dashboard.trxToday', { n: String(stats.website.todayTransactions) })}
                    </p>
                  </div>
                  <div className="text-center p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-mono uppercase">{t('channels.mobile')}</p>
                    <p className="text-lg font-bold text-slate-800 font-mono mt-1" dir="ltr">
                      {stats.mobile_app.todayVolumeGrams.toLocaleString()}g
                    </p>
                    <p className="text-[10px] text-amber-700 font-bold mt-1">
                      {t('dashboard.trxToday', { n: String(stats.mobile_app.todayTransactions) })}
                    </p>
                  </div>
                  <div className="text-center p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-mono uppercase">{t('channels.posRetail')}</p>
                    <p className="text-lg font-bold text-slate-800 font-mono mt-1" dir="ltr">
                      {stats.pos.todayVolumeGrams.toLocaleString()}g
                    </p>
                    <p className="text-[10px] text-amber-700 font-bold mt-1">
                      {t('dashboard.trxToday', { n: String(stats.pos.todayTransactions) })}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 font-mono text-[10px]" id="volume-bars">
                  <div className="flex justify-between text-slate-500 font-medium">
                    <span>{t('dashboard.retailPos', { pct: posPct })}</span>
                    <span>{t('dashboard.webEngine', { pct: webPct })}</span>
                    <span>{t('dashboard.mobileApi', { pct: mobilePct })}</span>
                  </div>
                  <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200" id="volume-ratio-bar">
                    <div className="bg-amber-600 h-full" style={{ width: `${(stats.pos.todayVolumeGrams / totalVol) * 100}%` }} />
                    <div className="bg-slate-300 h-full" style={{ width: `${(stats.website.todayVolumeGrams / totalVol) * 100}%` }} />
                    <div className="bg-amber-700 h-full" style={{ width: `${(stats.mobile_app.todayVolumeGrams / totalVol) * 100}%` }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 mt-2" id="quick-links">
            <button
              id="quick-restock-btn"
              onClick={() => onNavigate('inventory')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs text-amber-800 hover:text-amber-900 font-bold cursor-pointer transition-all duration-150"
            >
              <Plus className="w-4 h-4" />
              {t('dashboard.restock')}
            </button>
            <button
              id="quick-pos-buy-btn"
              onClick={() => onNavigate('pos')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700 hover:text-slate-900 font-bold cursor-pointer transition-all duration-150"
            >
              <Calculator className="w-4 h-4 text-emerald-600" />
              {t('dashboard.posBuyScrap')}
            </button>
            <button
              id="quick-web-trade-btn"
              onClick={() => onNavigate('trading')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700 hover:text-slate-900 font-bold cursor-pointer transition-all duration-150"
            >
              <TrendingUp className="w-4 h-4 text-amber-500" />
              {t('dashboard.instantTrade')}
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between" id="channels-feed-card">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-sans mb-1">
              <Database className="w-4 h-4 text-amber-700" />
              {t('dashboard.feedsTitle')}
            </h2>
            <p className="text-xs text-slate-500 font-sans pb-3 border-b border-slate-100 animate-slide-in">{t('dashboard.feedsSub')}</p>

            <div className="space-y-4 pt-4" id="channels-list">
              <div className="flex items-start justify-between bg-slate-50 p-3 rounded-lg border border-slate-200" id="website-feed-item">
                <div className="flex gap-2.5 animate-slide-in">
                  <span className="p-2 bg-slate-100 rounded-lg text-amber-700 shadow-xs">
                    <Globe className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 font-sans">{t('channels.website')}</h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {t('dashboard.webSessions', { n: String(stats.website.activeSessions) })}
                    </p>
                  </div>
                </div>
                <div className="text-end">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {t('common.collecting')}
                  </span>
                  <p className="text-[10px] font-mono text-slate-700 mt-1 font-semibold" dir="ltr">
                    ${(stats.website.todayVolumeGrams * rates['24K']).toLocaleString(undefined, { maximumFractionDigits: 0 })} {t('common.today')}
                  </p>
                </div>
              </div>

              <div className="flex items-start justify-between bg-slate-50 p-3 rounded-lg border border-slate-200" id="mobile-feed-item">
                <div className="flex gap-2.5 animate-slide-in">
                  <span className="p-2 bg-slate-100 rounded-lg text-amber-700 shadow-xs">
                    <Smartphone className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 font-sans">{t('channels.mobile')}</h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {t('dashboard.mobileUsers', { n: String(stats.mobile_app.activeSessions) })}
                    </p>
                  </div>
                </div>
                <div className="text-end">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {t('common.collecting')}
                  </span>
                  <p className="text-[10px] font-mono text-slate-700 mt-1 font-semibold" dir="ltr">
                    ${(stats.mobile_app.todayVolumeGrams * rates['24K']).toLocaleString(undefined, { maximumFractionDigits: 0 })} {t('common.today')}
                  </p>
                </div>
              </div>

              <div className="flex items-start justify-between bg-slate-50 p-3 rounded-lg border border-slate-200" id="pos-feed-item">
                <div className="flex gap-2.5 animate-slide-in">
                  <span className="p-2 bg-slate-100 rounded-lg text-amber-700 shadow-xs">
                    <Monitor className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 font-sans">{t('channels.posStore')}</h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {t('dashboard.posRegisters', { n: String(stats.pos.activeTerminals) })}
                    </p>
                  </div>
                </div>
                <div className="text-end">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {t('common.collecting')}
                  </span>
                  <p className="text-[10px] font-mono text-slate-700 mt-1 font-semibold" dir="ltr">
                    ${(stats.pos.todayVolumeGrams * rates['24K']).toLocaleString(undefined, { maximumFractionDigits: 0 })} {t('common.today')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center gap-3 mt-4" id="channel-diagnostics">
            <ShieldCheck className="w-7 h-7 text-emerald-600 shrink-0" />
            <div className="font-mono text-[10px]">
              <p className="text-slate-800 font-bold uppercase">{t('dashboard.securityTitle')}</p>
              <p className="text-slate-500 mt-0.5">{t('dashboard.securitySub')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm" id="live-ledger-feed-section">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-slate-100 mb-4 gap-2" id="ledger-header">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-sans">
              <FileText className="w-4 h-4 text-amber-700" />
              {t('dashboard.ledgerTitle')}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{t('dashboard.ledgerSub')}</p>
          </div>

          <button
            id="view-all-reports-btn"
            onClick={() => onNavigate('reports')}
            className="text-amber-800 hover:text-amber-900 text-xs font-bold font-sans flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-lg cursor-pointer transition-all duration-150 shadow-xs"
          >
            {t('dashboard.openReports')}
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto" id="recent-transactions-table-wrapper">
          <table className="w-full text-start font-sans text-xs" id="recent-transactions-table">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100 pb-2">
                <th className="py-2.5 font-bold uppercase tracking-wider text-[10px]">{t('dashboard.txRef')}</th>
                <th className="py-2.5 font-bold uppercase tracking-wider text-[10px]">{t('dashboard.channelSource')}</th>
                <th className="py-2.5 font-bold uppercase tracking-wider text-[10px]">{t('dashboard.type')}</th>
                <th className="py-2.5 font-bold uppercase tracking-wider text-[10px] text-end">{t('common.weight')}</th>
                <th className="py-2.5 font-bold uppercase tracking-wider text-[10px] text-end">{t('dashboard.karatPurity')}</th>
                <th className="py-2.5 font-bold uppercase tracking-wider text-[10px] text-end">{t('dashboard.pricePerGram')}</th>
                <th className="py-2.5 font-bold uppercase tracking-wider text-[10px] text-end">{t('dashboard.totalValue')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence initial={false}>
                {logs.slice(0, 5).map((log) => {
                  const isIncomingFlow = log.type === 'scrap_buy' || log.type === 'trade_buy' || log.type === 'purchase';
                  return (
                    <motion.tr
                      id={`ledger-row-${log.id}`}
                      key={log.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-50 transition-colors duration-100"
                    >
                      <td className="py-3">
                        <span className="font-mono text-slate-905 font-bold block">{log.reference}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {new Date(log.timestamp).toLocaleTimeString(dateLoc)}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-700 font-mono bg-slate-50 px-2 py-1 rounded border border-slate-200">
                          {log.source === 'website' && <Globe className="w-3 h-3 text-amber-705" />}
                          {log.source === 'mobile_app' && <Smartphone className="w-3 h-3 text-amber-600" />}
                          {log.source === 'pos' && <Monitor className="w-3 h-3 text-slate-500" />}
                          {translateSource(t, log.source)}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center font-bold rounded-full px-2 py-0.5 text-[9px] uppercase ${
                            log.type === 'scrap_buy'
                              ? 'bg-orange-50 text-orange-700 border border-orange-200'
                              : log.type === 'trade_buy'
                                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                : log.type === 'trade_sell'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : log.type === 'purchase'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-250'
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {translateLogType(t, log.type)}
                        </span>
                      </td>
                      <td className="py-3 text-end font-mono text-slate-600 font-medium" dir="ltr">
                        {log.weightGrams.toFixed(2)} g
                      </td>
                      <td className="py-3 text-end font-mono text-slate-600 font-medium uppercase">
                        {purityLabel(t, log.purity)}
                      </td>
                      <td className="py-3 text-end font-mono text-slate-600 font-medium" dir="ltr">
                        ${log.ratePerGram.toFixed(2)}
                      </td>
                      <td className="py-3 text-end font-mono font-bold" dir="ltr">
                        <span className={isIncomingFlow ? 'text-emerald-700' : 'text-amber-800'}>
                          {isIncomingFlow ? '+' : '-'}$
                          {log.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
