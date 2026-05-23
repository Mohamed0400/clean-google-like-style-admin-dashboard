import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Calculator,
  Receipt,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  UserPlus,
  Printer,
} from 'lucide-react';
import { GoldItem, GoldPurity, LiveGoldRates, BankReserve } from '../types';
import { useI18n } from '../i18n';

interface POSTerminalProps {
  rates: LiveGoldRates;
  inventory: GoldItem[];
  bank: BankReserve;
  onRecordPOSBuy: (payload: { karat: GoldPurity; weight: number; payout: number; ref: string }) => void;
  onRecordPOSSell: (payload: { itemId: string; qty: number; totalReceived: number; ref: string }) => void;
}

function purityLabel(t: (k: string) => string, purity: GoldPurity) {
  return purity === 'Scrap' ? t('purity.scrap') : t(`purity.${purity}`);
}

export default function POSTerminal({ rates, inventory, bank, onRecordPOSBuy, onRecordPOSSell }: POSTerminalProps) {
  const { t, locale } = useI18n();
  const dateLoc = locale === 'ar' ? 'ar-KW' : 'en-US';
  const [activeMode, setActiveMode] = useState<'buy' | 'sell'>('buy');

  const [payoutMultiplier, setPayoutMultiplier] = useState(0.95);
  const [retailPremiumG, setRetailPremiumG] = useState(1.85);

  const [buyKarat, setBuyKarat] = useState<GoldPurity>('18K');
  const [buyWeight, setBuyWeight] = useState<number | ''>('');
  const [customerName, setCustomerName] = useState('');
  const [buyInvoice, setBuyInvoice] = useState<{
    refNo: string;
    date: string;
    customerName: string;
    karat: GoldPurity;
    weightGrams: number;
    ratePerGram: number;
    totalPayout: number;
  } | null>(null);

  const [selectedItemIdx, setSelectedItemIdx] = useState<number>(0);
  const [sellQty, setSellQty] = useState<number>(1);
  const [sellInvoice, setSellInvoice] = useState<{
    refNo: string;
    date: string;
    customerName: string;
    itemId: string;
    itemName: string;
    purity: GoldPurity;
    weightGrams: number;
    qty: number;
    pricePerUnit: number;
    grossTotal: number;
  } | null>(null);

  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  useEffect(() => {
    setCustomerName(t('pos.defaultCustomer'));
  }, [locale, t]);

  const getScrapKaratRate = (karat: GoldPurity) => {
    let rate = rates['24K'];
    if (karat === '22K') rate = rates['22K'];
    if (karat === '21K') rate = rates['21K'];
    if (karat === '18K') rate = rates['18K'];
    return Number((rate * payoutMultiplier).toFixed(2));
  };

  const handleCalculateBuy = () => {
    setFeedbackError('');
    setFeedbackSuccess('');

    if (!buyWeight || Number(buyWeight) <= 0) {
      setFeedbackError(t('pos.errWeight'));
      return;
    }

    const currentKaratSpot = getScrapKaratRate(buyKarat);
    const weightVal = Number(buyWeight);
    const calculatedPayout = Number((currentKaratSpot * weightVal).toFixed(2));

    if (bank.cashBalance < calculatedPayout) {
      setFeedbackError(t('pos.errLiquidity', { amount: `$${calculatedPayout.toLocaleString()}` }));
      return;
    }

    const refNo = `POS-SCRAP-${Math.floor(100 + Math.random() * 900)}`;
    setBuyInvoice({
      refNo,
      date: new Date().toLocaleString(dateLoc),
      customerName,
      karat: buyKarat,
      weightGrams: weightVal,
      ratePerGram: currentKaratSpot,
      totalPayout: calculatedPayout,
    });
  };

  const handleFinalizeBuy = () => {
    if (!buyInvoice) return;
    onRecordPOSBuy({
      karat: buyInvoice.karat,
      weight: buyInvoice.weightGrams,
      payout: buyInvoice.totalPayout,
      ref: buyInvoice.refNo,
    });
    setFeedbackSuccess(t('pos.buySuccess', { amount: `$${buyInvoice.totalPayout.toLocaleString()}` }));
    setBuyInvoice(null);
    setBuyWeight('');
  };

  const computeSellItemPrice = (item: GoldItem) => {
    let baseSpot = rates['24K'];
    if (item.purity === '22K') baseSpot = rates['22K'];
    if (item.purity === '21K') baseSpot = rates['21K'];
    if (item.purity === '18K') baseSpot = rates['18K'];

    const retailCostPerGram = baseSpot + retailPremiumG;
    return Number((retailCostPerGram * item.weightGrams).toFixed(2));
  };

  const handleCalculateSell = () => {
    setFeedbackError('');
    setFeedbackSuccess('');

    const targetItem = inventory[selectedItemIdx];
    if (!targetItem) {
      setFeedbackError(t('pos.errSelect'));
      return;
    }

    if (sellQty <= 0 || sellQty > targetItem.qty) {
      setFeedbackError(t('pos.errStock', { qty: String(targetItem.qty) }));
      return;
    }

    const pricePerUnit = computeSellItemPrice(targetItem);
    const grossTotal = Number((pricePerUnit * sellQty).toFixed(2));

    const refNo = `POS-RETAIL-${Math.floor(100 + Math.random() * 900)}`;
    setSellInvoice({
      refNo,
      date: new Date().toLocaleString(dateLoc),
      customerName,
      itemId: targetItem.id,
      itemName: targetItem.name,
      purity: targetItem.purity,
      weightGrams: targetItem.weightGrams,
      qty: sellQty,
      pricePerUnit,
      grossTotal,
    });
  };

  const handleFinalizeSell = () => {
    if (!sellInvoice) return;
    onRecordPOSSell({
      itemId: sellInvoice.itemId,
      qty: sellInvoice.qty,
      totalReceived: sellInvoice.grossTotal,
      ref: sellInvoice.refNo,
    });
    setFeedbackSuccess(t('pos.sellSuccess', { amount: `$${sellInvoice.grossTotal.toLocaleString()}` }));
    setSellInvoice(null);
    setSellQty(1);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="pos-terminal-section">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-200 p-5 rounded-xl gap-4 shadow-sm" id="pos-header">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-900 tracking-tight flex items-center gap-2">
            <Monitor className="text-amber-705 w-5 h-5" id="monitor-icon" />
            {t('pos.title')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">{t('pos.subtitle')}</p>
        </div>

        <div className="flex bg-slate-100 p-1 border border-slate-200 rounded-lg text-xs font-sans font-medium" id="pos-workflow-tabs">
          <button
            id="pos-buy-tab-btn"
            onClick={() => {
              setActiveMode('buy');
              setFeedbackError('');
              setFeedbackSuccess('');
              setBuyInvoice(null);
              setSellInvoice(null);
            }}
            className={`px-4 py-2 rounded-md transition-all cursor-pointer flex items-center gap-1.5 font-bold duration-150 ${activeMode === 'buy' ? 'bg-amber-700 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <ArrowDown className="w-3.5 h-3.5" />
            {t('pos.buyScrap')}
          </button>
          <button
            id="pos-sell-tab-btn"
            onClick={() => {
              setActiveMode('sell');
              setFeedbackError('');
              setFeedbackSuccess('');
              setBuyInvoice(null);
              setSellInvoice(null);
            }}
            className={`px-4 py-2 rounded-md transition-all cursor-pointer flex items-center gap-1.5 font-bold duration-150 ${activeMode === 'sell' ? 'bg-amber-700 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <ArrowUp className="w-3.5 h-3.5" />
            {t('pos.sellGold')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6" id="pos-split-grid">
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between animate-fade-in" id="pos-controls-panel">
          <div className="space-y-5" id="pos-controls-form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs" id="pos-common-fields">
              <div>
                <label className="block text-slate-600 mb-1 font-bold">{t('pos.attendant')}</label>
                <div className="relative">
                  <input
                    id="pos-customer-input"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={t('pos.shopperPh')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500/10"
                  />
                  <span className="absolute end-2.5 top-2.5 text-slate-400">
                    <UserPlus className="w-4 h-4" />
                  </span>
                </div>
              </div>

              <div>
                {activeMode === 'buy' ? (
                  <div>
                    <label className="block text-slate-600 mb-1 font-bold">
                      {t('pos.marginSpread', { pct: String(payoutMultiplier * 100) })}
                    </label>
                    <select
                      id="pos-buy-margin-select"
                      value={payoutMultiplier}
                      onChange={(e) => setPayoutMultiplier(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-amber-600"
                    >
                      <option value="0.92">{t('pos.lowScrap')}</option>
                      <option value="0.95">{t('pos.stdScrap')}</option>
                      <option value="0.97">{t('pos.premiumCast')}</option>
                      <option value="0.99">{t('pos.pureCoins')}</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-slate-600 mb-1 font-bold">{t('pos.retailPremium')}</label>
                    <input
                      id="pos-sell-premium-input"
                      type="number"
                      step="0.05"
                      value={retailPremiumG}
                      onChange={(e) => setRetailPremiumG(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-amber-600 font-mono font-bold"
                    />
                  </div>
                )}
              </div>
            </div>

            {activeMode === 'buy' ? (
              <div className="p-4 bg-slate-55 border border-slate-200 rounded-xl space-y-4 font-sans" id="pos-buy-logic-panel">
                <div className="flex gap-2 items-center text-amber-800 text-xs font-bold">
                  <Calculator className="w-4 h-4 text-amber-700" />
                  {t('pos.appraiser')}
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">{t('pos.oldGold')}</label>
                    <select
                      id="pos-scrap-purities"
                      value={buyKarat}
                      onChange={(e) => setBuyKarat(e.target.value as GoldPurity)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900"
                    >
                      <option value="24K">{t('pos.fine24', { rate: rates['24K'].toFixed(2) })}</option>
                      <option value="22K">{t('pos.lira22', { rate: rates['22K'].toFixed(2) })}</option>
                      <option value="21K">{t('pos.jewelry21', { rate: rates['21K'].toFixed(2) })}</option>
                      <option value="18K">{t('pos.std18', { rate: rates['18K'].toFixed(2) })}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">{t('pos.scaleWeight')}</label>
                    <input
                      id="pos-scrap-weight"
                      type="number"
                      step="0.01"
                      placeholder={t('pos.weightPh')}
                      value={buyWeight}
                      onChange={(e) => setBuyWeight(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs font-sans pt-3 border-t border-slate-100" id="pos-buy-results">
                  <span className="text-slate-500">
                    {t('pos.payoutRate', { rate: `$${getScrapKaratRate(buyKarat)}` })}
                  </span>
                  <button
                    id="pos-calc-buy-btn"
                    onClick={handleCalculateBuy}
                    className="py-2 px-5 bg-amber-700 text-white font-bold rounded-lg cursor-pointer hover:bg-amber-800 transition-all text-xs shadow-xs"
                  >
                    {t('pos.assess')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-55 border border-slate-200 rounded-xl space-y-4 font-sans" id="pos-sell-logic-panel">
                <div className="flex gap-2 items-center text-amber-800 text-xs font-bold">
                  <Receipt className="w-4 h-4 text-amber-700" id="receipt-badge-icon" />
                  {t('pos.selectStock')}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">{t('pos.selectAsset')}</label>
                    <select
                      id="pos-sell-source-select"
                      value={selectedItemIdx}
                      onChange={(e) => setSelectedItemIdx(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900"
                    >
                      {inventory.map((item, idx) => (
                        <option key={item.id} value={idx}>
                          {item.name} ({purityLabel(t, item.purity)}) — {item.qty} [{`$${computeSellItemPrice(item)}`}/u]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">{t('pos.quantity')}</label>
                    <div className="flex gap-2 items-center h-10">
                      <button
                        id="pos-sell-qty-dec"
                        type="button"
                        onClick={() => setSellQty((prev) => Math.max(1, prev - 1))}
                        className="bg-white border border-slate-200 text-slate-500 hover:text-slate-900 px-3 py-2 rounded shadow-xs cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold text-slate-900 text-sm px-4 min-w-8 text-center">{sellQty}</span>
                      <button
                        id="pos-sell-qty-inc"
                        type="button"
                        onClick={() => setSellQty((prev) => prev + 1)}
                        className="bg-white border border-slate-200 text-slate-500 hover:text-slate-900 px-3 py-2 rounded shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs font-sans pt-3 border-t border-slate-100" id="pos-sell-results">
                  <span className="text-slate-500">
                    {t('pos.unitInfo', {
                      g: String(inventory[selectedItemIdx]?.weightGrams ?? ''),
                      rate: String(retailPremiumG),
                    })}
                  </span>
                  <button
                    id="pos-calc-sell-btn"
                    onClick={handleCalculateSell}
                    className="py-2 px-5 bg-amber-700 text-white font-bold rounded-lg cursor-pointer hover:bg-amber-800 transition-all text-xs shadow-xs"
                  >
                    {t('pos.buildInvoice')}
                  </button>
                </div>
              </div>
            )}

            {feedbackError && (
              <p className="p-2.5 text-xs bg-red-55 border-s-4 border-red-500 text-red-800 rounded font-bold shadow-xs" id="pos-error">
                {feedbackError}
              </p>
            )}
            {feedbackSuccess && (
              <p className="p-2.5 text-xs bg-emerald-55 border-s-4 border-emerald-500 text-emerald-800 rounded font-bold shadow-xs animate-slide-in" id="pos-success">
                {feedbackSuccess}
              </p>
            )}
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-mono mt-4" id="pos-status-info">
            <span className="text-slate-500 uppercase font-bold">
              {t('pos.networkStatus')} • {t('common.online')}
            </span>
            <div className="flex justify-between text-slate-600 mt-1.5 font-bold">
              <span>{t('pos.drawerBalance')}</span>
              <span className="text-slate-950 font-extrabold" dir="ltr">
                ${bank.cashBalance.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col justify-between bg-white border border-slate-200 rounded-xl p-5 shadow-sm min-h-[400px]" id="pos-receipt-preview">
          <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 font-mono text-[11px] text-slate-705 relative shadow-inner overflow-hidden" id="pos-receipt-body">
            <div className="absolute top-0 inset-x-0 h-1.5 flex justify-between px-2 text-slate-400 scale-150 rotate-180" id="thermal-notches">
              <span>^^^^^^^^^^^^^^^^^^^^^^^^^^^</span>
            </div>

            <div className="text-center mt-3" id="receipt-hotel">
              <span className="text-amber-800 font-extrabold uppercase tracking-wider text-xs block">{t('pos.company')}</span>
              <p className="text-[9px] text-slate-400 mt-1">{t('pos.terminalId')}</p>
              <p className="text-[9px] text-slate-400">{t('pos.market')}</p>
            </div>

            {buyInvoice || sellInvoice ? (
              <div className="mt-6 space-y-4 animate-fade-in" id="active-invoice">
                <div className="border-t border-b border-dashed border-slate-200 py-2.5 space-y-1 text-slate-500 text-[10px]" id="invoice-meta-block">
                  <div className="flex justify-between">
                    <span>{t('pos.refTicket')}</span>
                    <span className="text-slate-900 font-bold">{buyInvoice?.refNo || sellInvoice?.refNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('pos.timestamp')}</span>
                    <span className="font-bold">{buyInvoice?.date || sellInvoice?.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('pos.customer')}</span>
                    <span className="text-slate-900 uppercase font-sans font-bold">{buyInvoice?.customerName || sellInvoice?.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('pos.txChannel')}</span>
                    <span className="text-amber-800 font-bold">{t('pos.register')}</span>
                  </div>
                </div>

                {buyInvoice && (
                  <div className="space-y-2" id="buy-receipt-calc">
                    <p className="font-bold text-slate-900 uppercase text-center border-b border-slate-200 pb-1.5 font-sans">{t('pos.scrapReceipt')}</p>
                    <div className="flex justify-between">
                      <span>{t('pos.karatClass')}</span>
                      <span className="text-amber-800 font-bold">{t('pos.oldScrap', { karat: purityLabel(t, buyInvoice.karat) })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('pos.weightMeasured')}</span>
                      <span className="text-slate-905 font-bold" dir="ltr">
                        {buyInvoice.weightGrams} {t('common.grams')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('pos.spotAppraised')}</span>
                      <span className="font-mono" dir="ltr">
                        ${rates['24K']}/g
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('pos.payoutPaid')}</span>
                      <span className="font-mono" dir="ltr">
                        ${buyInvoice.ratePerGram}/g
                      </span>
                    </div>
                    <div className="border-t border-dotted border-slate-300 pt-2 flex justify-between font-bold text-slate-900 text-[12px]">
                      <span>{t('pos.cashPaid')}</span>
                      <span className="text-emerald-800 font-extrabold" dir="ltr">
                        ${buyInvoice.totalPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}

                {sellInvoice && (
                  <div className="space-y-2" id="sell-receipt-calc">
                    <p className="font-bold text-slate-900 uppercase text-center border-b border-slate-200 pb-1.5 font-sans">{t('pos.retailInvoice')}</p>
                    <div className="flex justify-between">
                      <span>{t('pos.productSku')}</span>
                      <span className="text-slate-900 font-bold">{sellInvoice.itemName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('pos.goldPurity')}</span>
                      <span className="text-amber-800 font-bold">{purityLabel(t, sellInvoice.purity)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('pos.goldWeight')}</span>
                      <span className="font-mono text-slate-900 font-bold" dir="ltr">
                        {sellInvoice.weightGrams}g
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('pos.qtySelected')}</span>
                      <span className="font-bold text-slate-900">
                        {sellInvoice.qty} {t('common.unit')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('pos.premiumSpot')}</span>
                      <span className="font-mono text-amber-800 font-bold" dir="ltr">
                        +${retailPremiumG}/g
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('pos.unitSale')}</span>
                      <span className="font-mono text-slate-900 font-bold" dir="ltr">
                        ${sellInvoice.pricePerUnit}
                      </span>
                    </div>
                    <div className="border-t border-dotted border-slate-300 pt-2 flex justify-between font-bold text-slate-900 text-[12px]">
                      <span>{t('pos.grandTotal')}</span>
                      <span className="text-amber-800 font-extrabold" dir="ltr">
                        ${sellInvoice.grossTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}

                <div className="text-[8px] text-slate-400 text-center uppercase tracking-wide pt-4 border-t border-dashed border-slate-200" id="thankyou">
                  {t('pos.legal')}
                  <p className="mt-1 font-sans normal-case">{t('pos.thanks')}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400 text-center" id="receipt-empty">
                <Printer className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-[10px] font-sans text-slate-500 max-w-[180px] leading-normal">{t('pos.receiptEmpty')}</p>
              </div>
            )}
          </div>

          <div className="mt-4" id="finalize-pos-action">
            {buyInvoice ? (
              <button
                id="pos-finalize-buy-btn"
                onClick={handleFinalizeBuy}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-sans font-bold text-xs rounded-lg shadow-sm cursor-pointer flex items-center justify-center gap-2 transition-all duration-100"
              >
                {t('pos.approvePay')}
              </button>
            ) : sellInvoice ? (
              <button
                id="pos-finalize-sell-btn"
                onClick={handleFinalizeSell}
                className="w-full py-3 bg-gradient-to-r from-amber-700 to-yellow-805 hover:from-amber-800 hover:to-yellow-900 text-white font-sans font-bold text-xs rounded-lg shadow-sm cursor-pointer flex items-center justify-center gap-2 transition-all duration-100"
              >
                {t('pos.approveInvoice')}
              </button>
            ) : (
              <button disabled className="w-full py-3 bg-slate-100 border border-slate-200 text-slate-400 font-sans text-xs rounded-lg cursor-not-allowed text-center font-semibold">
                {t('pos.printerOffline')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
