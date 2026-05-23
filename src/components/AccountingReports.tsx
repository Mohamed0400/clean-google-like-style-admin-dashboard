import React, { useState } from 'react';
import { FileText, Download, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { ActivityLog, ChannelSource, LiveGoldRates } from '../types';
import { useI18n } from '../i18n';
import { translateLogType } from '../i18n/helpers';

interface AccountingReportsProps {
  rates: LiveGoldRates;
  logs: ActivityLog[];
}

export default function AccountingReports({ rates, logs }: AccountingReportsProps) {
  const { t, locale } = useI18n();
  const dateLoc = locale === 'ar' ? 'ar-KW' : 'en-US';
  const [filterSource, setFilterSource] = useState<'all' | ChannelSource>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState('');

  const calculateFinancials = () => {
    let salesUSD = 0;
    let purchaseUSD = 0;
    let scrapCostUSD = 0;

    logs.forEach((log) => {
      const isSales = log.type === 'trade_sell' || log.type === 'sale';
      const isPurchase = log.type === 'purchase' || log.type === 'trade_buy';
      const isScrap = log.type === 'scrap_buy';

      if (isSales) salesUSD += log.totalAmount;
      if (isPurchase) purchaseUSD += log.totalAmount;
      if (isScrap) scrapCostUSD += log.totalAmount;
    });

    const netEarnings = salesUSD - (purchaseUSD + scrapCostUSD) * 0.95;
    const taxReserves = netEarnings > 0 ? netEarnings * 0.15 : 0;

    return {
      grossSales: salesUSD,
      costOfAcquisitions: purchaseUSD,
      scrapCosts: scrapCostUSD,
      netEarnings,
      taxReserves,
    };
  };

  const financials = calculateFinancials();

  const filteredLogs = logs.filter((log) => {
    if (filterSource === 'all') return true;
    return log.source === filterSource;
  });

  const handleExport = (format: 'xlsx' | 'pdf' | 'csv') => {
    setIsExporting(true);
    setExportNotice('');

    setTimeout(() => {
      setIsExporting(false);
      setExportNotice(
        t('reporting.exportSuccess', {
          year: String(new Date().getFullYear()),
          format,
          rate: rates['24K'].toFixed(2),
        })
      );
    }, 1200);
  };

  const purityLabel = (purity: string) => (purity === 'Scrap' ? t('purity.scrap') : t(`purity.${purity}`));

  return (
    <div className="space-y-6 animate-fade-in" id="accounting-reports-section">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="accounting-header">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-950 tracking-tight">{t('accounting.title')}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{t('accounting.subtitle')}</p>
        </div>

        <div className="flex gap-2 text-xs" id="accounting-export-actions">
          <button
            id="export-csv-btn"
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            className="flex items-center gap-1.5 py-2 px-3 bg-white border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50 rounded-lg cursor-pointer font-sans disabled:opacity-50 font-bold shadow-xs transition-all duration-100"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            {t('accounting.csv')}
          </button>
          <button
            id="export-excel-btn"
            onClick={() => handleExport('xlsx')}
            disabled={isExporting}
            className="flex items-center gap-1.5 py-2 px-3 bg-white border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50 rounded-lg cursor-pointer font-sans disabled:opacity-50 font-bold shadow-xs transition-all duration-100"
          >
            <Download className="w-3.5 h-3.5 text-amber-700" />
            {t('accounting.excel')}
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="bg-emerald-50 border-s-4 border-emerald-500 p-3 rounded text-emerald-900 font-bold font-sans flex items-center gap-3 text-xs shadow-xs animate-slide-in" id="reports-export-notice">
          <Calendar className="w-5 h-5 shrink-0 text-emerald-600" />
          <p>{exportNotice}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="accounting-kpi-grid">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <p className="text-[10px] text-slate-400 font-sans font-bold uppercase tracking-wider">{t('accounting.grossSales')}</p>
          <h3 className="text-2xl font-black text-slate-950 mt-1 font-sans" dir="ltr">
            ${financials.grossSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">{t('accounting.grossSub')}</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <p className="text-[10px] text-slate-400 font-sans font-bold uppercase tracking-wider">{t('accounting.sourcing')}</p>
          <h3 className="text-2xl font-black text-slate-800 mt-1 font-sans" dir="ltr">
            ${(financials.costOfAcquisitions + financials.scrapCosts).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">{t('accounting.sourcingSub')}</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm border-s-4 border-s-amber-600">
          <p className="text-[10px] text-amber-800 font-sans font-bold uppercase tracking-wider">{t('accounting.profit')}</p>
          <h3 className="text-2xl font-black text-emerald-700 mt-1 font-mono" dir="ltr">
            ${Math.max(0, financials.netEarnings).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-[10px] text-slate-500 mt-2 font-sans font-medium">{t('accounting.profitSub')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="reports-split-grid">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm" id="audit-ledger-panel">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4" id="accounting-ledger-header">
            <h3 className="text-sm font-bold text-slate-950 flex items-center gap-2 font-sans">
              <FileText className="w-4.5 h-4.5 text-amber-700" />
              {t('accounting.auditTrail')}
            </h3>

            <div className="flex bg-slate-100 p-1 border border-slate-200 rounded-lg text-[10px]" id="ledger-channel-filter">
              <button
                onClick={() => setFilterSource('all')}
                className={`px-2.5 py-1 rounded cursor-pointer duration-75 text-xs font-semibold ${filterSource === 'all' ? 'bg-amber-700 text-white font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {t('accounting.allSources')}
              </button>
              <button
                onClick={() => setFilterSource('website')}
                className={`px-2.5 py-1 rounded cursor-pointer duration-75 text-xs font-semibold ${filterSource === 'website' ? 'bg-amber-700 text-white font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {t('channels.webSite')}
              </button>
              <button
                onClick={() => setFilterSource('mobile_app')}
                className={`px-2.5 py-1 rounded cursor-pointer duration-75 text-xs font-semibold ${filterSource === 'mobile_app' ? 'bg-amber-700 text-white font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {t('accounting.app')}
              </button>
              <button
                onClick={() => setFilterSource('pos')}
                className={`px-2.5 py-1 rounded cursor-pointer duration-75 text-xs font-semibold ${filterSource === 'pos' ? 'bg-amber-700 text-white font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {t('channels.pos')}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto" id="audit-table-wrapper">
            <table className="w-full text-start font-sans text-xs" id="audit-table">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 pb-2 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 font-sans">{t('accounting.referenceId')}</th>
                  <th className="py-2.5 font-sans text-center">{t('inventory.purity')}</th>
                  <th className="py-2.5 font-sans text-end">{t('accounting.mass')}</th>
                  <th className="py-2.5 font-sans text-end">{t('accounting.gramValue')}</th>
                  <th className="py-2.5 font-sans text-end">{t('accounting.logAmount')}</th>
                  <th className="py-2.5 font-sans text-end">{t('accounting.actionType')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  const isEarnings = log.type === 'trade_sell' || log.type === 'sale';
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70" id={`audit-row-${log.id}`}>
                      <td className="py-3">
                        <span className="font-mono text-slate-950 font-bold block">{log.reference}</span>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          {new Date(log.timestamp).toLocaleDateString(dateLoc)} ·{' '}
                          {new Date(log.timestamp).toLocaleTimeString(dateLoc)}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span className="font-mono bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded border border-slate-200 font-bold text-[11px]">
                          {purityLabel(log.purity)}
                        </span>
                      </td>
                      <td className="py-3 text-end font-mono text-slate-700 font-semibold" dir="ltr">
                        {log.weightGrams.toFixed(2)}g
                      </td>
                      <td className="py-3 text-end font-mono text-slate-700 font-semibold" dir="ltr">
                        ${log.ratePerGram.toFixed(2)}
                      </td>
                      <td className="py-3 text-end font-mono font-extrabold text-slate-900" dir="ltr">
                        <span className={isEarnings ? 'text-emerald-700' : 'text-slate-800'}>
                          ${log.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-3 text-end">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wide ${
                            log.type === 'scrap_buy'
                              ? 'bg-orange-50 text-orange-850 border border-orange-200'
                              : log.type === 'purchase'
                                ? 'bg-emerald-50 text-emerald-850 border border-emerald-250'
                                : log.type === 'trade_buy'
                                  ? 'bg-sky-50 text-sky-850 border border-sky-250'
                                  : 'bg-amber-50 text-amber-850 border border-amber-200'
                          }`}
                        >
                          {translateLogType(t, log.type)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between" id="platform-splits-charts-panel">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-sans mb-1">
              <TrendingUp className="w-4.5 h-4.5 text-amber-700 animate-pulse" />
              {t('accounting.platformSplits')}
            </h3>
            <p className="text-xs text-slate-500 font-sans pb-3 border-b border-slate-100">{t('accounting.splitsSub')}</p>

            <div className="space-y-5 pt-5" id="volume-split-graph-bars">
              <div className="space-y-1.5" id="web-split-bar-group">
                <div className="flex justify-between text-xs font-sans">
                  <span className="text-slate-700 font-bold">{t('accounting.webCheckout')}</span>
                  <span className="font-mono text-slate-950 font-bold">35.4%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden" id="web-progress-wrapper">
                  <div className="bg-gradient-to-r from-amber-600 to-amber-700 h-full rounded-full" style={{ width: '35.4%' }} />
                </div>
              </div>

              <div className="space-y-1.5" id="mobile-split-bar-group">
                <div className="flex justify-between text-xs font-sans">
                  <span className="text-slate-700 font-bold">{t('accounting.mobileApi')}</span>
                  <span className="font-mono text-slate-950 font-bold">24.1%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden" id="mobile-progress-wrapper">
                  <div className="bg-amber-700 h-full rounded-full" style={{ width: '24.1%' }} />
                </div>
              </div>

              <div className="space-y-1.5" id="pos-split-bar-group">
                <div className="flex justify-between text-xs font-sans">
                  <span className="text-slate-700 font-bold">{t('accounting.posRetail')}</span>
                  <span className="font-mono text-slate-950 font-bold">40.5%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden" id="pos-progress-wrapper">
                  <div className="bg-emerald-700 h-full rounded-full" style={{ width: '40.5%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl flex items-start gap-2.5 mt-6" id="reports-compliance-box">
            <AlertCircle className="w-4.5 h-4.5 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-500 font-sans leading-normal">{t('accounting.compliance')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
