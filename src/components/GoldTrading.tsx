import React, { useState } from 'react';
import {
  TrendingUp,
  Wallet,
  Lock,
  ShoppingBag,
  ArrowRight,
  Server,
  CircleDollarSign,
  RefreshCw,
} from 'lucide-react';
import { LiveGoldRates } from '../types';
import { useI18n } from '../i18n';

const CARATS = [18, 21, 22, 24] as const;

interface GoldTradingProps {
  rates: LiveGoldRates;
  onPlaceTrade: (order: {
    type: 'trade_buy' | 'trade_sell';
    purity: '24K' | '22K';
    weightGrams: number;
    customAmount: number;
  }) => void;
}

function LaneCard({
  icon: Icon,
  title,
  desc,
  steps,
  accent,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  steps: string[];
  accent: string;
}) {
  return (
    <div className={`rounded-xl border p-4 bg-white shadow-sm ${accent}`}>
      <div className="flex items-start gap-3 mb-3">
        <span className="p-2 rounded-lg bg-amber-50 text-amber-700">
          <Icon className="w-5 h-5" />
        </span>
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
        </div>
      </div>
      <ol className="space-y-1.5 text-xs text-slate-600">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-2">
            <span className="font-mono text-amber-700 shrink-0">{i + 1}.</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function GoldTrading({ rates, onPlaceTrade }: GoldTradingProps) {
  const { t } = useI18n();
  const [demoSide, setDemoSide] = useState<'buy' | 'sell'>('buy');
  const [demoCarat, setDemoCarat] = useState<number>(21);
  const [demoGrams, setDemoGrams] = useState<number | ''>('');
  const [demoMsg, setDemoMsg] = useState('');
  const [demoErr, setDemoErr] = useState('');

  const rateForCarat = (c: number) => {
    if (c === 24) return rates['24K'];
    if (c === 22) return rates['22K'];
    if (c === 21) return rates['21K'];
    return rates['18K'];
  };

  const sellRateSample = rateForCarat(demoCarat);
  const buyRateSample = Number((sellRateSample * 1.018).toFixed(3));

  const recordHubDemo = () => {
    setDemoErr('');
    setDemoMsg('');
    if (!demoGrams || Number(demoGrams) <= 0) {
      setDemoErr(t('trading.errWeight'));
      return;
    }
    const g = Number(demoGrams);
    const kwd = Number((g * sellRateSample).toFixed(3));
    const purity: '24K' | '22K' =
      demoCarat >= 22 ? '22K' : '24K';
    onPlaceTrade({
      type: demoSide === 'buy' ? 'trade_buy' : 'trade_sell',
      purity,
      weightGrams: g,
      customAmount: kwd,
    });
    setDemoMsg(
      t('trading.success', {
        action: demoSide === 'buy' ? t('trading.purchased') : t('trading.sold'),
        weight: String(g),
        carat: String(demoCarat),
        amount: String(kwd),
      })
    );
    setDemoGrams('');
  };

  return (
    <div className="space-y-6 animate-fade-in" id="gold-trading-section">
      <header className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950 tracking-tight" id="trade-heading">
              {t('trading.title')}
            </h2>
            <p className="text-xs text-slate-500 mt-2 max-w-3xl leading-relaxed">{t('trading.subtitle')}</p>
          </div>
          <div className="flex flex-col gap-1 text-[10px] font-mono text-slate-500 shrink-0">
            <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200">
              <Server className="w-3 h-3" />
              {t('trading.sourceApp')}
            </span>
            <span dir="ltr">{t('trading.sourceApi')}</span>
          </div>
        </div>
      </header>

      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('trading.threeLanes')}</h3>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LaneCard
          icon={Wallet}
          title={t('trading.laneVirtualTitle')}
          desc={t('trading.laneVirtualDesc')}
          accent="border-emerald-200/80"
          steps={[
            t('trading.laneVirtualStep1'),
            t('trading.laneVirtualStep2'),
            t('trading.laneVirtualStep3'),
            t('trading.laneVirtualStep4'),
          ]}
        />
        <LaneCard
          icon={Lock}
          title={t('trading.laneLockedTitle')}
          desc={t('trading.laneLockedDesc')}
          accent="border-amber-200/80"
          steps={[
            t('trading.laneLockedStep1'),
            t('trading.laneLockedStep2'),
            t('trading.laneLockedStep3'),
          ]}
        />
        <LaneCard
          icon={ShoppingBag}
          title={t('trading.laneCheckoutTitle')}
          desc={t('trading.laneCheckoutDesc')}
          accent="border-slate-300"
          steps={[]}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <CircleDollarSign className="w-4 h-4 text-amber-400" />
            {t('trading.ratesPanel')}
          </h3>
          <p className="text-[10px] text-slate-400 mt-1 mb-4">{t('trading.ratesPanelSub')}</p>
          <div className="space-y-3">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
              <p className="text-xs font-bold text-emerald-400">{t('trading.customerBuyRate')}</p>
              <p className="text-[10px] text-slate-500 mt-1">{t('trading.customerBuyRateHint')}</p>
              <p className="font-mono text-lg mt-2" dir="ltr">
                {buyRateSample.toFixed(3)} {t('trading.kwd')}/g
              </p>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
              <p className="text-xs font-bold text-amber-400">{t('trading.customerSellRate')}</p>
              <p className="text-[10px] text-slate-500 mt-1">{t('trading.customerSellRateHint')}</p>
              <p className="font-mono text-lg mt-2" dir="ltr">
                {sellRateSample.toFixed(3)} {t('trading.kwd')}/g
              </p>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-4 border-t border-slate-800 pt-3">{t('trading.spreadNote')}</p>
          <div className="grid grid-cols-4 gap-2 mt-3">
            {CARATS.map((c) => (
              <div key={c} className="text-center bg-slate-950 rounded p-2 border border-slate-800">
                <p className="text-[9px] text-slate-500">{t('trading.sampleCarat', { carat: c })}</p>
                <p className="font-mono text-xs text-amber-300 mt-1" dir="ltr">
                  {rateForCarat(c).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-700" />
            {t('trading.flowTitle')}
          </h3>
          <p className="text-xs text-slate-500 mb-4">{t('trading.flowSubtitle')}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              {t('trading.iWantBuy')}
            </span>
            <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
              {t('trading.iWantSell')}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mb-4">
            <span className="font-bold">{t('trading.carat')}:</span>
            {CARATS.map((c) => (
              <span key={c} className="font-mono bg-slate-100 px-2 py-0.5 rounded">
                {c}K
              </span>
            ))}
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="font-bold">{t('trading.inputMode')}:</span>
            <span>{t('trading.byGrams')}</span>
            <span className="text-slate-400">|</span>
            <span>{t('trading.byKwd')}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
            {[
              t('trading.getQuote'),
              demoSide === 'buy' ? t('trading.confirmBuy') : t('trading.confirmSell'),
              t('trading.walletBalance'),
              t('trading.availableToSell'),
            ].map((label) => (
              <div key={label} className="border border-slate-100 rounded-lg p-2 text-center text-slate-600 bg-slate-50">
                {label}
              </div>
            ))}
          </div>

          <ul className="mt-4 space-y-1 text-[10px] text-slate-500 font-mono" dir="ltr">
            <li className="flex items-center gap-2">
              <RefreshCw className="w-3 h-3 text-amber-600 shrink-0" />
              {t('trading.optionalAuto')}
            </li>
            <li>{t('trading.optionalAlerts')}</li>
          </ul>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Server className="w-4 h-4 text-slate-600" />
          {t('trading.endpoints')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[10px] font-mono text-slate-600" dir="ltr">
          {[
            t('trading.epPositions'),
            t('trading.epTrades'),
            t('trading.epQuoteBuy'),
            t('trading.epQuoteSell'),
            t('trading.epBuy'),
            t('trading.epSell'),
            t('trading.epWallet'),
            t('trading.epBuybackQuote'),
            t('trading.epBuybackPlace'),
          ].map((ep) => (
            <div key={ep} className="bg-slate-50 border border-slate-200 rounded px-2 py-1.5">
              {ep}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-5">
        <h3 className="text-sm font-bold text-amber-900">{t('trading.hubDemo')}</h3>
        <p className="text-xs text-amber-800/80 mt-1 mb-4">{t('trading.hubDemoSub')}</p>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDemoSide('buy')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer ${demoSide === 'buy' ? 'bg-emerald-700 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
            >
              {t('trading.hubDemoBuy')}
            </button>
            <button
              type="button"
              onClick={() => setDemoSide('sell')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer ${demoSide === 'sell' ? 'bg-amber-700 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
            >
              {t('trading.hubDemoSell')}
            </button>
          </div>
          <select
            value={demoCarat}
            onChange={(e) => setDemoCarat(Number(e.target.value))}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
          >
            {CARATS.map((c) => (
              <option key={c} value={c}>
                {c}K
              </option>
            ))}
          </select>
          <input
            type="number"
            step="0.01"
            placeholder={t('trading.gramsPh')}
            value={demoGrams}
            onChange={(e) => setDemoGrams(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-28 text-xs font-mono border border-slate-200 rounded-lg px-2 py-1.5"
            dir="ltr"
          />
          <button
            type="button"
            onClick={recordHubDemo}
            className="px-4 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-lg cursor-pointer hover:bg-slate-800"
          >
            {t('trading.recordDemo')}
          </button>
        </div>
        {demoErr && <p className="text-xs text-red-700 mt-2 font-bold">{demoErr}</p>}
        {demoMsg && <p className="text-xs text-emerald-800 mt-2 font-bold">{demoMsg}</p>}
      </div>
    </div>
  );
}
