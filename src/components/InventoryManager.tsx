import React, { useState } from 'react';
import { Database, Plus, AlertTriangle, ClipboardList } from 'lucide-react';
import { GoldItem, GoldPurity, BankReserve, LiveGoldRates } from '../types';
import { useI18n } from '../i18n';

interface InventoryManagerProps {
  rates: LiveGoldRates;
  inventory: GoldItem[];
  bank: BankReserve;
  onAddStock: (item: Omit<GoldItem, 'id'>) => void;
  onUpdateRates: (rates: LiveGoldRates) => void;
}

function purityLabel(t: (k: string) => string, purity: GoldPurity) {
  return purity === 'Scrap' ? t('purity.scrap') : t(`purity.${purity}`);
}

function categoryLabel(t: (k: string) => string, category: GoldItem['category']) {
  const keys: Record<GoldItem['category'], string> = {
    bar: 'inventory.barAsset',
    bullion: 'inventory.bullionSpec',
    lira: 'inventory.liraCoin',
    scrap: 'inventory.scrapRec',
  };
  return t(keys[category]);
}

export default function InventoryManager({ rates, inventory, bank, onAddStock }: InventoryManagerProps) {
  const { t } = useI18n();
  const [activeFilter, setActiveFilter] = useState<'all' | 'bar' | 'lira' | 'scrap'>('all');

  const [name, setName] = useState('');
  const [category, setCategory] = useState<'bar' | 'bullion' | 'lira' | 'scrap'>('bar');
  const [purity, setPurity] = useState<GoldPurity>('24K');
  const [weightGrams, setWeightGrams] = useState<number | ''>('');
  const [qty, setQty] = useState<number | ''>('');
  const [totalCost, setTotalCost] = useState<number | ''>('');
  const [avgCostPerGram, setAvgCostPerGram] = useState<number | ''>('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handlePurityOrWeightChange = (pur: GoldPurity, wt: number, quantity: number) => {
    let baseRate = rates['24K'];
    if (pur === '22K') baseRate = rates['22K'];
    if (pur === '21K') baseRate = rates['21K'];
    if (pur === '18K') baseRate = rates['18K'];
    if (pur === 'Scrap') baseRate = rates.scrapRateRate;

    const calculatedAvgCost = Number((baseRate * 0.985).toFixed(2));
    setAvgCostPerGram(calculatedAvgCost);

    if (wt && quantity) {
      setTotalCost(Number((calculatedAvgCost * wt * quantity).toFixed(2)));
    }
  };

  const getPurityColor = (p: GoldPurity) => {
    switch (p) {
      case '24K':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case '22K':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case '21K':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case '18K':
        return 'bg-slate-50 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const filteredInventory = inventory.filter((item) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'bar') return item.category === 'bar' || item.category === 'bullion';
    return item.category === activeFilter;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) return setErrorMsg(t('inventory.errName'));
    if (!weightGrams || weightGrams <= 0) return setErrorMsg(t('inventory.errWeight'));
    if (!qty || qty <= 0) return setErrorMsg(t('inventory.errQty'));
    if (!avgCostPerGram || avgCostPerGram <= 0) return setErrorMsg(t('inventory.errCost'));

    const price = Number(avgCostPerGram) * Number(weightGrams) * Number(qty);

    if (bank.cashBalance < price) {
      return setErrorMsg(
        t('inventory.errCash', {
          req: `$${price.toLocaleString()}`,
          avail: `$${bank.cashBalance.toLocaleString()}`,
        })
      );
    }

    onAddStock({
      name,
      category,
      purity,
      weightGrams: Number(weightGrams),
      qty: Number(qty),
      avgCostPerGram: Number(avgCostPerGram),
    });

    setSuccessMsg(t('inventory.success', { price: `$${price.toLocaleString()}` }));

    setName('');
    setWeightGrams('');
    setQty('');
    setTotalCost('');
    setAvgCostPerGram('');
  };

  const currentItemValue = (item: GoldItem) => {
    let rate = rates['24K'];
    if (item.purity === '22K') rate = rates['22K'];
    if (item.purity === '21K') rate = rates['21K'];
    if (item.purity === '18K') rate = rates['18K'];
    if (item.purity === 'Scrap') rate = rates.scrapRateRate;
    return item.weightGrams * item.qty * rate;
  };

  return (
    <div className="space-y-6 animate-fade-in" id="inventory-manager-section">
      <div>
        <h2 className="text-xl font-bold font-sans text-slate-950 tracking-tight" id="inv-page-heading">
          {t('inventory.title')}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">{t('inventory.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="inventory-stats-row">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
          <p className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider">{t('inventory.bullion24')}</p>
          <div className="flex justify-between items-baseline mt-2">
            <p className="text-lg font-bold text-slate-950 font-mono" dir="ltr">
              {inventory.filter((i) => i.purity === '24K').reduce((acc, i) => acc + i.weightGrams * i.qty, 0).toFixed(2)} g
            </p>
            <span className="text-[10px] text-amber-800 bg-amber-50 font-semibold px-2 py-0.5 rounded font-mono">{t('inventory.pureVault')}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
          <p className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider">{t('inventory.liras22')}</p>
          <div className="flex justify-between items-baseline mt-2">
            <p className="text-lg font-bold text-slate-950 font-mono" dir="ltr">
              {inventory.filter((i) => i.purity === '22K').reduce((acc, i) => acc + i.weightGrams * i.qty, 0).toFixed(2)} g
            </p>
            <span className="text-[10px] text-yellow-800 bg-yellow-50 font-semibold px-2 py-0.5 rounded font-mono">{t('inventory.carat22')}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
          <p className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider">{t('inventory.lirasCount')}</p>
          <div className="flex justify-between items-baseline mt-2">
            <p className="text-lg font-bold text-slate-950 font-mono" dir="ltr">
              {inventory.filter((i) => i.category === 'lira').reduce((acc, i) => acc + i.qty, 0).toLocaleString()} pc
            </p>
            <span className="text-[10px] text-amber-850 bg-amber-50 font-semibold px-2 py-0.5 rounded font-mono">{t('inventory.sovereigns')}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
          <p className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider">{t('inventory.scrapInfill')}</p>
          <div className="flex justify-between items-baseline mt-2">
            <p className="text-lg font-bold text-slate-950 font-mono" dir="ltr">
              {inventory.filter((i) => i.purity === 'Scrap').reduce((acc, i) => acc + i.weightGrams * i.qty, 0).toFixed(2)} g
            </p>
            <span className="text-[10px] text-orange-850 bg-orange-50 font-semibold px-2 py-0.5 rounded font-mono">{t('inventory.unrefined')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="inventory-split-grid">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between" id="inventory-list-panel">
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-slate-100 mb-4 gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-sans">
                <ClipboardList className="w-4 h-4 text-amber-700" id="clipboard-icon" />
                {t('inventory.stockRegisters')}
              </h3>

              <div className="flex bg-slate-104 p-0.5 border border-slate-200 rounded-lg text-[11px] font-mono" id="inv-filters">
                <button
                  id="filter-all-btn"
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1.5 rounded transition-all cursor-pointer font-bold duration-150 ${activeFilter === 'all' ? 'bg-amber-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {t('common.all')}
                </button>
                <button
                  id="filter-bar-btn"
                  onClick={() => setActiveFilter('bar')}
                  className={`px-3 py-1.5 rounded transition-all cursor-pointer font-bold duration-150 ${activeFilter === 'bar' ? 'bg-amber-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {t('inventory.barsBullion')}
                </button>
                <button
                  id="filter-lira-btn"
                  onClick={() => setActiveFilter('lira')}
                  className={`px-3 py-1.5 rounded transition-all cursor-pointer font-bold duration-150 ${activeFilter === 'lira' ? 'bg-amber-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {t('inventory.lirasCoins')}
                </button>
                <button
                  id="filter-scrap-btn"
                  onClick={() => setActiveFilter('scrap')}
                  className={`px-3 py-1.5 rounded transition-all cursor-pointer font-bold duration-150 ${activeFilter === 'scrap' ? 'bg-amber-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {t('purity.scrap')}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto" id="inventory-table-wrapper">
              <table className="w-full text-start font-sans text-xs" id="inventory-table">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 pb-2">
                    <th className="py-2.5 font-bold uppercase tracking-wider text-[10px]">{t('inventory.assetDetails')}</th>
                    <th className="py-2.5 font-bold uppercase tracking-wider text-[10px]">{t('inventory.purity')}</th>
                    <th className="py-2.5 font-bold uppercase tracking-wider text-[10px] text-end">{t('inventory.unitWeight')}</th>
                    <th className="py-2.5 font-bold uppercase tracking-wider text-[10px] text-end">{t('inventory.qty')}</th>
                    <th className="py-2.5 font-bold uppercase tracking-wider text-[10px] text-end">{t('inventory.totalWeight')}</th>
                    <th className="py-2.5 font-bold uppercase tracking-wider text-[10px] text-end">{t('inventory.bookCost')}</th>
                    <th className="py-2.5 font-bold uppercase tracking-wider text-[10px] text-end">{t('inventory.marketValue')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.map((item) => {
                    const totalWeight = item.weightGrams * item.qty;
                    const val = currentItemValue(item);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors duration-100" id={`inventory-item-row-${item.id}`}>
                        <td className="py-3 pe-2">
                          <span className="font-bold text-slate-900 block">{item.name}</span>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mt-0.5">{categoryLabel(t, item.category)}</span>
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-mono border font-bold ${getPurityColor(item.purity)}`}>
                            {purityLabel(t, item.purity)}
                          </span>
                        </td>
                        <td className="py-3 text-end font-mono text-slate-600 font-semibold" dir="ltr">
                          {item.weightGrams.toFixed(2)}g
                        </td>
                        <td className="py-3 text-end font-mono text-slate-600 font-semibold" dir="ltr">
                          {item.qty} {t('common.units')}
                        </td>
                        <td className="py-3 text-end font-mono text-slate-900 font-bold" dir="ltr">
                          {totalWeight.toLocaleString(undefined, { maximumFractionDigits: 2 })} g
                        </td>
                        <td className="py-3 text-end font-mono text-slate-500" dir="ltr">
                          ${item.avgCostPerGram.toFixed(2)}
                        </td>
                        <td className="py-3 text-end text-amber-805 font-mono font-bold" dir="ltr">
                          ${val.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/50 mt-4 flex items-start gap-3 animate-slide-in" id="inventory-notice">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-600 font-sans leading-normal">{t('inventory.notice')}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between animate-fade-in" id="add-inventory-form-wrapper">
          <form onSubmit={handleSubmit} className="space-y-4" id="restock-form">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-sans mb-1">
                <Plus className="w-4.5 h-4.5 text-amber-700" id="plus-ledger-icon" />
                {t('inventory.purchaseLedger')}
              </h3>
              <p className="text-xs text-slate-500 font-sans pb-3 border-b border-slate-100">{t('inventory.purchaseSub')}</p>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">{t('inventory.assetDesc')}</label>
                <input
                  id="form-item-name"
                  type="text"
                  placeholder={t('inventory.descPh')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">{t('inventory.purityCarat')}</label>
                  <select
                    id="form-item-purity"
                    value={purity}
                    onChange={(e) => {
                      const pur = e.target.value as GoldPurity;
                      setPurity(pur);
                      handlePurityOrWeightChange(pur, Number(weightGrams), Number(qty));
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500/20"
                  >
                    <option value="24K">{t('inventory.p24')}</option>
                    <option value="22K">{t('inventory.p22')}</option>
                    <option value="21K">{t('inventory.p21')}</option>
                    <option value="18K">{t('inventory.p18')}</option>
                    <option value="Scrap">{t('inventory.scrapEq')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">{t('inventory.classType')}</label>
                  <select
                    id="form-item-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as GoldItem['category'])}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500/20"
                  >
                    <option value="bar">{t('inventory.barAsset')}</option>
                    <option value="bullion">{t('inventory.bullionSpec')}</option>
                    <option value="lira">{t('inventory.liraCoin')}</option>
                    <option value="scrap">{t('inventory.scrapRec')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">{t('inventory.unitWeightG')}</label>
                  <input
                    id="form-item-weight"
                    type="number"
                    step="0.01"
                    placeholder={t('inventory.weightPh')}
                    value={weightGrams}
                    onChange={(e) => {
                      const wt = e.target.value === '' ? '' : Number(e.target.value);
                      setWeightGrams(wt);
                      handlePurityOrWeightChange(purity, Number(wt), Number(qty));
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">{t('inventory.quantity')}</label>
                  <input
                    id="form-item-qty"
                    type="number"
                    placeholder={t('inventory.qtyPh')}
                    value={qty}
                    onChange={(e) => {
                      const quantity = e.target.value === '' ? '' : Number(e.target.value);
                      setQty(quantity);
                      handlePurityOrWeightChange(purity, Number(weightGrams), Number(quantity));
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-600 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">{t('inventory.wholesaleCost')}</label>
                  <div className="relative">
                    <span className="absolute start-2.5 top-2 text-slate-500 font-mono" dir="ltr">
                      $
                    </span>
                    <input
                      id="form-item-rate"
                      type="number"
                      step="0.01"
                      placeholder={t('inventory.spotPh')}
                      value={avgCostPerGram}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : Number(e.target.value);
                        setAvgCostPerGram(val);
                        if (val && weightGrams && qty) {
                          setTotalCost(Number((Number(val) * Number(weightGrams) * Number(qty)).toFixed(2)));
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 ps-6 pe-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-600 font-mono font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">{t('inventory.totalCash')}</label>
                  <div className="relative">
                    <span className="absolute start-2.5 top-2 text-slate-400 font-mono" dir="ltr">
                      $
                    </span>
                    <input
                      id="form-item-total"
                      type="number"
                      disabled
                      placeholder={t('inventory.autoTotal')}
                      value={totalCost}
                      className="w-full bg-slate-100 border border-slate-200 rounded-lg py-2 ps-6 pe-2.5 text-slate-500 font-mono focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {errorMsg && (
              <p className="p-2.5 text-xs bg-red-55 text-red-800 border-s-4 border-red-500 rounded font-medium shadow-xs" id="restock-error">
                {errorMsg}
              </p>
            )}

            {successMsg && (
              <p className="p-2.5 text-xs bg-emerald-50 text-emerald-800 border-s-4 border-emerald-500 rounded font-medium shadow-xs animate-slide-in" id="restock-success">
                {successMsg}
              </p>
            )}

            <button
              id="confirm-restock-btn"
              type="submit"
              className="w-full py-3 text-xs font-bold bg-amber-700 hover:bg-amber-800 border border-amber-700 hover:border-amber-805 rounded-lg text-white cursor-pointer font-sans transition-all duration-150 flex items-center justify-center gap-2 shadow-sm"
            >
              <Database className="w-4 h-4 text-white" />
              {t('inventory.approveBuy')}
            </button>
          </form>

          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-[10px] font-mono mt-4" id="bank-reserve-info">
            <div className="flex justify-between text-slate-500">
              <span className="font-bold">{t('inventory.bankDeposits')}</span>
              <span className="text-slate-950 font-bold" dir="ltr">
                ${bank.cashBalance.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-slate-500 mt-1.5">
              <span className="font-bold">{t('inventory.vaultWeight')}</span>
              <span className="text-slate-950 font-bold" dir="ltr">
                {bank.goldReserveGrams.toLocaleString()} g
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
