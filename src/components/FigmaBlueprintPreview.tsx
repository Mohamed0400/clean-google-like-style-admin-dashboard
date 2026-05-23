import React, { useState } from 'react';
import {
  Monitor,
  Database,
  Calculator,
  TrendingUp,
  FileText,
  Coins,
  DollarSign,
  Layers,
  Wallet,
  Globe,
  Smartphone,
  LayoutGrid,
  Settings,
  ChevronDown,
  Radio,
  BarChart3,
} from 'lucide-react';
import { useI18n } from '../i18n';

type PreviewTab =
  | 'dashboard'
  | 'inventory'
  | 'income'
  | 'channels'
  | 'pos'
  | 'trading'
  | 'reporting'
  | 'reports'
  | 'settings';

const NAV: { id: PreviewTab; labelKey: string; icon: React.ElementType }[] = [
  { id: 'dashboard', labelKey: 'nav.hubOverview', icon: Monitor },
  { id: 'inventory', labelKey: 'nav.vaultInventory', icon: Database },
  { id: 'income', labelKey: 'nav.income', icon: DollarSign },
  { id: 'channels', labelKey: 'nav.channels', icon: Radio },
  { id: 'pos', labelKey: 'nav.pos', icon: Calculator },
  { id: 'trading', labelKey: 'nav.trading', icon: TrendingUp },
  { id: 'reporting', labelKey: 'nav.reporting', icon: BarChart3 },
  { id: 'reports', labelKey: 'nav.ledger', icon: FileText },
  { id: 'settings', labelKey: 'nav.settings', icon: Settings },
];

const TAB_LABEL_KEYS: Record<PreviewTab, string> = {
  dashboard: 'nav.hubOverview',
  inventory: 'nav.vaultInventory',
  income: 'nav.income',
  channels: 'nav.channels',
  pos: 'nav.pos',
  trading: 'nav.trading',
  reporting: 'nav.reporting',
  reports: 'nav.ledger',
  settings: 'nav.settings',
};

function Sparkline({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 32" className={`w-full h-8 ${className}`} preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points="0,24 15,20 30,22 45,14 60,16 75,8 90,12 105,6 120,4"
        className="text-amber-500/80"
      />
    </svg>
  );
}

function LineChartPlaceholder() {
  const actual = 'M0,80 L40,65 L80,70 L120,45 L160,50 L200,30 L240,35 L280,20 L320,25';
  const target = 'M0,75 L40,68 L80,62 L120,55 L160,48 L200,42 L240,38 L280,32 L320,28';
  return (
    <svg viewBox="0 0 320 90" className="w-full h-28">
      <line x1="0" y1="88" x2="320" y2="88" stroke="#334155" strokeWidth="1" />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={i * 80} y1="0" x2={i * 80} y2="88" stroke="#1e293b" strokeWidth="1" />
      ))}
      <path d={target} fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 3" />
      <path d={actual} fill="none" stroke="#d97706" strokeWidth="2" />
    </svg>
  );
}

function DonutPlaceholder() {
  const segments = [
    { pct: 38, color: '#d97706' },
    { pct: 22, color: '#b45309' },
    { pct: 15, color: '#f59e0b' },
    { pct: 6, color: '#fcd34d' },
    { pct: 19, color: '#78716c' },
  ];
  let offset = 0;
  const r = 36;
  const cx = 44;
  const cy = 44;
  const circumference = 2 * Math.PI * r;

  return (
    <svg viewBox="0 0 88 88" className="w-24 h-24 shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth="12" />
      {segments.map((s, i) => {
        const dash = (s.pct / 100) * circumference;
        const gap = circumference - dash;
        const el = (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="12"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
}

function ProgressBar({ pct, label, value }: { pct: number; label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px]">
        <span className="text-stone-400">{label}</span>
        <span className="text-amber-400 font-mono" dir="ltr">
          {value}
        </span>
      </div>
      <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function DashboardBlueprint() {
  const { t } = useI18n();

  return (
    <div className="space-y-3 p-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {[
          { title: t('executive.liveSpot'), value: '$1,985.40/oz', sub: t('common.spotUp'), subColor: 'text-emerald-400', chart: true },
          { title: t('executive.portfolio'), value: '$4,876,321.50', sub: t('common.vsPortfolio'), subColor: 'text-emerald-400', icon: Wallet },
          { title: t('executive.liveIncome'), value: '$12,450.80', sub: t('common.daily'), subColor: 'text-stone-500', icon: DollarSign },
          { title: t('executive.activeChannels'), value: '3', sub: t('common.connected'), subColor: 'text-stone-500', icon: Layers },
        ].map((card) => (
          <div key={card.title} className="bg-stone-900/80 border border-stone-800 rounded-lg p-2.5">
            <p className="text-[9px] text-stone-500 uppercase tracking-wider">{card.title}</p>
            <div className="flex items-end justify-between mt-1 gap-1">
              <div>
                <p className="text-sm font-bold text-white font-mono" dir="ltr">
                  {card.value}
                </p>
                <p className={`text-[9px] ${card.subColor}`}>{card.sub}</p>
              </div>
              {card.chart ? (
                <div className="w-16 text-amber-500">
                  <Sparkline />
                  <p className="text-[8px] text-stone-600 text-end">{t('common.last24h')}</p>
                </div>
              ) : card.icon ? (
                <card.icon className="w-4 h-4 text-amber-600/60" />
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        <div className="lg:col-span-1 bg-stone-900/80 border border-stone-800 rounded-lg p-2.5">
          <p className="text-[10px] font-bold text-white mb-2">{t('executive.inventoryBreakdown')}</p>
          <div className="h-2 rounded-full overflow-hidden flex mb-2">
            <div className="bg-amber-600" style={{ width: '38%' }} />
            <div className="bg-amber-700" style={{ width: '22%' }} />
            <div className="bg-amber-500" style={{ width: '15%' }} />
            <div className="bg-amber-400" style={{ width: '6%' }} />
            <div className="bg-stone-600" style={{ width: '19%' }} />
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[9px]">
            {[
              [t('executive.bullions'), '$1.8M', '906oz'],
              [t('executive.bars'), '$1.1M', '554oz'],
              [t('executive.liras24'), '$742K', '373oz'],
              [t('executive.liras22'), '$315K', '158oz'],
            ].map(([name, val, oz]) => (
              <div key={name} className="bg-stone-950 border border-stone-800 rounded p-1.5">
                <p className="text-stone-500 truncate">{name}</p>
                <p className="text-amber-400 font-mono" dir="ltr">
                  {val}
                </p>
                <p className="text-stone-600 font-mono" dir="ltr">
                  {oz}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 bg-stone-900/80 border border-stone-800 rounded-lg p-2.5">
          <p className="text-[10px] font-bold text-white mb-1">{t('executive.incomePerf')}</p>
          <p className="text-[8px] text-stone-500 mb-2">{t('executive.revenueTrend')}</p>
          <div className="flex gap-3 text-[8px] mb-1">
            <span className="flex items-center gap-1 text-amber-500">
              <span className="w-3 h-0.5 bg-amber-500 inline-block" /> {t('common.actual')}
            </span>
            <span className="flex items-center gap-1 text-stone-500">
              <span className="w-3 border-t border-dashed border-stone-500 inline-block" /> {t('common.target')}
            </span>
          </div>
          <LineChartPlaceholder />
          <div className="flex justify-between text-[8px] text-stone-600 mt-1 font-mono">
            <span>{t('figma.monthSept')}</span>
            <span>{t('figma.monthOct')}</span>
            <span>{t('figma.monthNov')}</span>
          </div>
        </div>

        <div className="lg:col-span-1 bg-stone-900/80 border border-stone-800 rounded-lg p-2.5">
          <p className="text-[10px] font-bold text-white mb-2">{t('executive.revenueByChannel')}</p>
          <ProgressBar label={t('channels.website')} value="455K" pct={45} />
          <ProgressBar label={t('channels.mobile')} value="355K" pct={35} />
          <ProgressBar label={t('channels.pos')} value="200K" pct={20} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        <div className="bg-stone-900/80 border border-stone-800 rounded-lg p-2.5 flex gap-3">
          <DonutPlaceholder />
          <div>
            <p className="text-[10px] font-bold text-white mb-2">{t('executive.physicalStatus')}</p>
            <ul className="text-[9px] space-y-0.5 text-stone-400">
              <li>
                <span className="text-amber-600">●</span> {t('executive.donutBullions')} 38%
              </li>
              <li>
                <span className="text-amber-700">●</span> {t('executive.donutBars')} 22%
              </li>
              <li>
                <span className="text-amber-500">●</span> {t('executive.donut24k')} 15%
              </li>
              <li>
                <span className="text-amber-400">●</span> {t('executive.donut22k')} 6%
              </li>
              <li>
                <span className="text-stone-500">●</span> {t('executive.donutOther')} 19%
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-stone-900/80 border border-stone-800 rounded-lg p-2.5">
          <p className="text-[10px] font-bold text-white mb-2">{t('executive.scrapPurchases')}</p>
          <p className="text-[8px] text-stone-500 mb-1.5">{t('executive.recentTx')}</p>
          <table className="w-full text-[8px]">
            <thead>
              <tr className="text-stone-600 border-b border-stone-800">
                <th className="text-start py-1">{t('common.source')}</th>
                <th className="text-start">{t('common.item')}</th>
                <th className="text-end">{t('common.value')}</th>
              </tr>
            </thead>
            <tbody className="text-stone-400 font-mono">
              <tr className="border-b border-stone-800/50">
                <td className="py-1">{t('figma.samplePos')}</td>
                <td>{t('figma.sample18k')}</td>
                <td className="text-end text-amber-400" dir="ltr">
                  $4.2K
                </td>
              </tr>
              <tr className="border-b border-stone-800/50">
                <td className="py-1">{t('figma.sampleHub')}</td>
                <td>{t('figma.sample22k')}</td>
                <td className="text-end text-amber-400" dir="ltr">
                  $12.1K
                </td>
              </tr>
              <tr>
                <td className="py-1">{t('figma.sampleWeb')}</td>
                <td>{t('figma.sampleMixed')}</td>
                <td className="text-end text-amber-400" dir="ltr">
                  $8.5K
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-stone-900/80 border border-stone-800 rounded-lg p-2.5">
          <p className="text-[10px] font-bold text-white mb-2">{t('executive.channelTracking')}</p>
          <p className="text-[8px] text-stone-500 mb-1.5">{t('executive.activityBreakdown')}</p>
          <table className="w-full text-[8px]">
            <thead>
              <tr className="text-stone-600 border-b border-stone-800">
                <th className="text-start py-1">{t('common.channel')}</th>
                <th className="text-end">{t('common.pct')}</th>
                <th className="text-end">{t('common.txns')}</th>
              </tr>
            </thead>
            <tbody className="text-stone-400">
              <tr className="border-b border-stone-800/50">
                <td className="py-1 flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5 text-amber-600" /> {t('channels.website')}
                </td>
                <td className="text-end font-mono">45%</td>
                <td className="text-end font-mono">128</td>
              </tr>
              <tr className="border-b border-stone-800/50">
                <td className="py-1 flex items-center gap-1">
                  <Smartphone className="w-2.5 h-2.5 text-amber-600" /> {t('channels.mobile')}
                </td>
                <td className="text-end font-mono">35%</td>
                <td className="text-end font-mono">94</td>
              </tr>
              <tr>
                <td className="py-1 flex items-center gap-1">
                  <Calculator className="w-2.5 h-2.5 text-amber-600" /> {t('channels.pos')}
                </td>
                <td className="text-end font-mono">20%</td>
                <td className="text-end font-mono">56</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TabPlaceholder({ tab }: { tab: PreviewTab }) {
  const { t } = useI18n();
  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-stone-950/50 border border-dashed border-stone-800 rounded-lg m-3 min-h-[200px]">
      <div className="text-center">
        <LayoutGrid className="w-8 h-8 text-amber-600/40 mx-auto mb-2" />
        <p className="text-xs text-stone-400">{t('figma.tabPlaceholder', { tab: t(TAB_LABEL_KEYS[tab]) })}</p>
        <p className="text-[10px] text-stone-600 mt-1">{t('figma.tabPlaceholderSub')}</p>
      </div>
    </div>
  );
}

export default function FigmaBlueprintPreview() {
  const { t } = useI18n();
  const [previewTab, setPreviewTab] = useState<PreviewTab>('dashboard');

  const headerTitle =
    previewTab === 'dashboard' ? t('common.executiveDashboard') : t(TAB_LABEL_KEYS[previewTab]);

  return (
    <div className="rounded-xl border border-stone-800 overflow-hidden bg-stone-950 shadow-inner" id="figma-blueprint-preview">
      <div className="flex min-h-[420px]">
        <aside className="w-36 shrink-0 bg-stone-950 border-e border-stone-800 flex flex-col">
          <div className="p-3 border-b border-stone-800 flex items-center gap-2">
            <span className="p-1.5 bg-amber-700 rounded-md">
              <Coins className="w-3 h-3 text-white" />
            </span>
            <div>
              <p className="text-[9px] font-black text-white uppercase tracking-wider leading-tight">{t('brand.hub')}</p>
              <p className="text-[8px] text-amber-500 uppercase">{t('brand.desk')}</p>
            </div>
          </div>
          <nav className="p-2 space-y-0.5 flex-1">
            {NAV.map(({ id, labelKey, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setPreviewTab(id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[9px] font-bold text-start transition-all cursor-pointer ${
                  previewTab === id
                    ? 'bg-stone-800 text-white border-s-2 border-amber-600 ps-1.5'
                    : 'text-stone-500 hover:text-stone-300 hover:bg-stone-900'
                }`}
              >
                <Icon className="w-3 h-3 shrink-0" />
                <span className="truncate">{t(labelKey)}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-stone-950 to-stone-900">
          <header className="px-3 py-2 border-b border-stone-800 flex items-center justify-between shrink-0">
            <h4 className="text-[10px] font-bold text-white tracking-widest uppercase">{headerTitle}</h4>
            <div className="flex items-center gap-2 text-[9px] text-stone-500">
              <span className="font-mono">{t('figma.sampleDate')}</span>
              <span className="w-px h-3 bg-stone-700" />
              <span className="flex items-center gap-1 text-stone-400">
                <span className="w-5 h-5 rounded-full bg-amber-900/50 border border-amber-700/50" />
                {t('figma.user')}
                <ChevronDown className="w-2.5 h-2.5" />
              </span>
            </div>
          </header>

          {previewTab === 'dashboard' ? <DashboardBlueprint /> : <TabPlaceholder tab={previewTab} />}
        </div>
      </div>
    </div>
  );
}
