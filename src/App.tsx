import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Database, 
  FileText, 
  Globe, 
  Smartphone, 
  Monitor, 
  Coins, 
  Calculator, 
  Settings,
  DollarSign,
  Radio,
  BarChart3,
  HelpCircle, 
  AlertCircle, 
  Sparkles, 
  Eye, 
  X,
  Bell,
  Clock
} from 'lucide-react';
import { GoldItem, ActivityLog, ChannelStats, BankReserve, LiveGoldRates, GoldPurity } from './types';
import { 
  SEED_LATEST_RATES, 
  SEED_INVENTORY, 
  SEED_BANK, 
  SEED_STATS, 
  SEED_LOGS, 
  SEED_PRICE_HISTORY 
} from './data';
import DashboardHome from './components/DashboardHome';
import InventoryManager from './components/InventoryManager';
import POSTerminal from './components/POSTerminal';
import GoldTrading from './components/GoldTrading';
import AccountingReports from './components/AccountingReports';
import FigmaBlueprintPreview from './components/FigmaBlueprintPreview';
import IncomeView from './components/IncomeView';
import ChannelsView from './components/ChannelsView';
import ReportingView from './components/ReportingView';
import SettingsView from './components/SettingsView';
import { LanguageSwitcher, useI18n } from './i18n';
import { motion, AnimatePresence } from 'motion/react';

export type AppTab =
  | 'dashboard'
  | 'inventory'
  | 'pos'
  | 'trading'
  | 'income'
  | 'channels'
  | 'reporting'
  | 'reports'
  | 'settings';

export default function App() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');

  const navBtn = (tab: AppTab, labelKey: string, Icon: React.ElementType) => (
    <button
      id={`nav-${tab}-btn`}
      onClick={() => setActiveTab(tab)}
      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold font-sans cursor-pointer transition-all ${
        activeTab === tab
          ? 'bg-slate-800 text-white border-s-4 border-amber-600 ps-2.5'
          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
      }`}
    >
      <Icon className="w-4 h-4 text-slate-400 shrink-0" />
      {t(labelKey)}
    </button>
  );
  
  // Real-time Database Stores
  const [rates, setRates] = useState<LiveGoldRates>(SEED_LATEST_RATES);
  const [inventory, setInventory] = useState<GoldItem[]>(SEED_INVENTORY);
  const [bank, setBank] = useState<BankReserve>(SEED_BANK);
  const [stats, setStats] = useState<ChannelStats>(SEED_STATS);
  const [logs, setLogs] = useState<ActivityLog[]>(SEED_LOGS);
  const [priceHistory, setPriceHistory] = useState(SEED_PRICE_HISTORY);

  // Figma Inspired View Modal
  const [showFigmaModal, setShowFigmaModal] = useState(false);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  // Live Auto-tick Simulation
  useEffect(() => {
    const notifyTimer = setTimeout(() => {
      triggerLiveNotice(t('notify.hedge'));
    }, 4000);

    const checkInterval = setInterval(() => {
      // Simulate slight fluctuations in gold spot
      setRates(prev => {
        const delta = (Math.random() - 0.48) * 0.45; // slightly upward bias
        const next24 = Number((prev['24K'] + delta).toFixed(2));
        const next22 = Number((next24 * 0.916).toFixed(2));
        const next21 = Number((next24 * 0.875).toFixed(2));
        const next18 = Number((next24 * 0.75).toFixed(2));
        const nextScrap = Number((next24 * 0.945).toFixed(2));
        
        return {
          '24K': next24,
          '22K': next22,
          '21K': next21,
          '18K': next18,
          scrapRateRate: nextScrap,
          lastUpdated: new Date().toLocaleTimeString(),
        };
      });

      // Fluctuate metrics of channel sessions
      setStats(prev => ({
        website: {
          ...prev.website,
          activeSessions: Math.max(10, prev.website.activeSessions + Math.floor((Math.random() - 0.5) * 8))
        },
        mobile_app: {
          ...prev.mobile_app,
          activeSessions: Math.max(10, prev.mobile_app.activeSessions + Math.floor((Math.random() - 0.5) * 12))
        },
        pos: {
          ...prev.pos,
          activeTerminals: 5
        }
      }));

    }, 15000);

    return () => {
      clearTimeout(notifyTimer);
      clearInterval(checkInterval);
    };
  }, [t]);

  const triggerLiveNotice = (msg: string) => {
    setActiveNotification(msg);
    setTimeout(() => {
      setActiveNotification(null);
    }, 4500);
  };

  // Trigger Manual Spot Price Increments
  const triggerLivePriceUpdate = () => {
    const delta = (Math.random() - 0.3) * 0.75; // favorable uptick
    const next24 = Number((rates['24K'] + delta).toFixed(2));
    const next22 = Number((next24 * 0.916).toFixed(2));
    const next21 = Number((next24 * 0.875).toFixed(2));
    const next18 = Number((next24 * 0.75).toFixed(2));
    const nextScrap = Number((next24 * 0.945).toFixed(2));

    setRates({
      '24K': next24,
      '22K': next22,
      '21K': next21,
      '18K': next18,
      scrapRateRate: nextScrap,
      lastUpdated: new Date().toLocaleTimeString(),
    });

    // append new point to price graph
    const todayStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setPriceHistory(prev => {
      const nextPoints = [...prev.slice(1), { date: todayStr, rate: next24 }];
      return nextPoints;
    });

    triggerLiveNotice(t('notify.spotTick', { rate: `$${next24}` }));
  };

  // 1. ADD NEW PHYSICAL STOCK
  const handleAddStock = (newItem: Omit<GoldItem, 'id'>) => {
    const rawCost = newItem.qty * newItem.weightGrams * newItem.avgCostPerGram;
    
    // update inventory
    setInventory(prev => {
      const targetIndex = prev.findIndex(item => item.name === newItem.name && item.purity === newItem.purity);
      if (targetIndex !== -1) {
        // combine
        const updated = [...prev];
        const prevItem = updated[targetIndex];
        updated[targetIndex] = {
          ...prevItem,
          qty: prevItem.qty + newItem.qty,
          avgCostPerGram: Number(((prevItem.avgCostPerGram + newItem.avgCostPerGram) / 2).toFixed(2))
        };
        return updated;
      } else {
        const id = 'inv-' + Date.now();
        return [...prev, { ...newItem, id }];
      }
    });

    // subtract from bank cash
    setBank(prev => ({
      ...prev,
      cashBalance: prev.cashBalance - rawCost,
      goldReserveGrams: prev.goldReserveGrams + (newItem.qty * newItem.weightGrams)
    }));

    // log log
    const txLog: ActivityLog = {
      id: 'tx-' + Date.now(),
      timestamp: new Date().toISOString(),
      type: 'purchase',
      category: newItem.category === 'bar' ? 'Gold Bars' : newItem.category === 'lira' ? 'Liras & Coins' : 'Bullions Specimen',
      purity: newItem.purity,
      weightGrams: newItem.qty * newItem.weightGrams,
      ratePerGram: newItem.avgCostPerGram,
      totalAmount: rawCost,
      source: 'pos', // acquired physically
      reference: `RESTOCK-VAULT-${Math.floor(100 + Math.random() * 900)}`
    };

    setLogs(prev => [txLog, ...prev]);
    triggerLiveNotice(t('notify.stock', { qty: newItem.qty }));
  };

  // 2. RECORD POS BUY SCRAP FROM CLIENT
  const handleRecordPOSBuy = (payload: { karat: GoldPurity; weight: number; payout: number; ref: string }) => {
    // subtract payout from in-shop bank
    setBank(prev => ({
      ...prev,
      cashBalance: prev.cashBalance - payload.payout,
      goldReserveGrams: prev.goldReserveGrams + payload.weight
    }));

    // Add to Scrap inventory row
    setInventory(prev => {
      return prev.map(item => {
        if (item.category === 'scrap') {
          return {
            ...item,
            weightGrams: item.weightGrams + payload.weight,
          };
        }
        return item;
      });
    });

    // log log
    const scrapLog: ActivityLog = {
      id: 'tx-' + Date.now(),
      timestamp: new Date().toISOString(),
      type: 'scrap_buy',
      category: 'Estate Scrap Metal',
      purity: payload.karat,
      weightGrams: payload.weight,
      ratePerGram: Number((payload.payout / payload.weight).toFixed(2)),
      totalAmount: payload.payout,
      source: 'pos',
      reference: payload.ref
    };

    setLogs(prev => [scrapLog, ...prev]);
    
    // adjust today stats
    setStats(prev => ({
      ...prev,
      pos: {
        ...prev.pos,
        todayVolumeGrams: prev.pos.todayVolumeGrams + payload.weight,
        todayTransactions: prev.pos.todayTransactions + 1,
        scrapBoughtGrams: prev.pos.scrapBoughtGrams + payload.weight
      }
    }));

    triggerLiveNotice(t('notify.scrap', { weight: payload.weight, karat: payload.karat }));
  };

  // 3. RECORD POS SELL PHYSICAL METALS TO CLIENT
  const handleRecordPOSSell = (payload: { itemId: string; qty: number; totalReceived: number; ref: string }) => {
    const targetItem = inventory.find(i => i.id === payload.itemId);
    if (!targetItem) return;

    // adjust quantities
    setInventory(prev => {
      return prev.map(item => {
        if (item.id === payload.itemId) {
          return {
            ...item,
            qty: Math.max(0, item.qty - payload.qty)
          };
        }
        return item;
      });
    });

    // edit cash vaults
    setBank(prev => ({
      ...prev,
      cashBalance: prev.cashBalance + payload.totalReceived,
      goldReserveGrams: Math.max(0, prev.goldReserveGrams - (targetItem.weightGrams * payload.qty))
    }));

    // log log
    const sellLog: ActivityLog = {
      id: 'tx-' + Date.now(),
      timestamp: new Date().toISOString(),
      type: 'sale',
      category: targetItem.name,
      purity: targetItem.purity,
      weightGrams: targetItem.weightGrams * payload.qty,
      ratePerGram: Number((payload.totalReceived / (targetItem.weightGrams * payload.qty)).toFixed(2)),
      totalAmount: payload.totalReceived,
      source: 'pos',
      reference: payload.ref
    };

    setLogs(prev => [sellLog, ...prev]);

    // stats
    setStats(prev => ({
      ...prev,
      pos: {
        ...prev.pos,
        todayVolumeGrams: prev.pos.todayVolumeGrams + (targetItem.weightGrams * payload.qty),
        todayTransactions: prev.pos.todayTransactions + 1,
      }
    }));

    triggerLiveNotice(t('notify.posSale', { item: targetItem.name }));
  };

  // 4. RECORD DIGITAL ONLINE MARKET TRADE (WEBSITE HEDGES)
  const handlePlaceTrade = (order: { type: 'trade_buy' | 'trade_sell'; purity: '24K' | '22K'; weightGrams: number; customAmount: number }) => {
    const isBuy = order.type === 'trade_buy';
    
    setBank(prev => ({
      ...prev,
      cashBalance: isBuy ? prev.cashBalance - order.customAmount : prev.cashBalance + order.customAmount,
      goldReserveGrams: isBuy ? prev.goldReserveGrams + order.weightGrams : prev.goldReserveGrams - order.weightGrams
    }));

    const tradeLog: ActivityLog = {
      id: 'tx-' + Date.now(),
      timestamp: new Date().toISOString(),
      type: order.type,
      category: 'Digi Gold Spot Spec',
      purity: order.purity,
      weightGrams: order.weightGrams,
      ratePerGram: rates[order.purity],
      totalAmount: order.customAmount,
      source: 'website',
      reference: `WEB-SPOT-${Math.floor(1000 + Math.random() * 9000)}`
    };

    setLogs(prev => [tradeLog, ...prev]);

    // adjust Website Metrics stats
    setStats(prev => ({
      ...prev,
      website: {
        ...prev.website,
        todayVolumeGrams: prev.website.todayVolumeGrams + order.weightGrams,
        todayTransactions: prev.website.todayTransactions + 1
      }
    }));

    triggerLiveNotice(t('notify.webTrade', { weight: order.weightGrams, purity: order.purity }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row font-sans selection:bg-amber-100 selection:text-amber-800" id="main-applet-root">
      
      {/* Lateral navigation Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 border-b md:border-b-0 md:border-r border-slate-800 shrink-0 flex flex-col justify-between animate-fade-in" id="applet-sidebar">
        
        <div>
          {/* Logo / Title lockup */}
          <div className="p-6 border-b border-slate-800 flex flex-col gap-3" id="sidebar-logo-lockup">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 bg-amber-700 rounded-lg text-white shadow-md shadow-amber-500/10">
                <Coins className="w-4 h-4" />
              </span>
              <div>
                <span className="text-sm font-black text-white tracking-widest uppercase">{t('brand.hub')}</span>
                <p className="text-[10px] text-amber-500 mt-0.5 tracking-wider font-mono uppercase">{t('brand.desk')}</p>
              </div>
            </div>
            <LanguageSwitcher compact />
          </div>

          {/* Nav pills */}
          <nav className="p-4 space-y-1.5" id="sidebar-nav">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block px-3 mb-2 font-mono">{t('nav.section')}</span>
            
            {navBtn('dashboard', 'nav.hubOverview', Monitor)}
            {navBtn('inventory', 'nav.vaultInventory', Database)}
            {navBtn('income', 'nav.income', DollarSign)}
            {navBtn('channels', 'nav.channels', Radio)}
            {navBtn('pos', 'nav.pos', Calculator)}
            {navBtn('trading', 'nav.trading', TrendingUp)}
            {navBtn('reporting', 'nav.reporting', BarChart3)}
            {navBtn('reports', 'nav.ledger', FileText)}
            {navBtn('settings', 'nav.settings', Settings)}

          </nav>
        </div>

        {/* Floating Figma Design Trigger & Help block in sidebar */}
        <div className="p-4 space-y-2 border-t border-slate-800 bg-slate-900/40" id="sidebar-footer">
          
          <button 
            id="open-figma-mockup-btn"
            onClick={() => setShowFigmaModal(true)}
            className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-850 border border-amber-500/20 text-xs text-amber-500 hover:text-amber-400 rounded-lg flex items-center justify-center gap-2 cursor-pointer font-sans transition-all"
          >
            <Eye className="w-4 h-4 text-amber-500" />
            {t('nav.figma')}
          </button>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-2 text-[10px] text-slate-500" id="support-credits">
            <HelpCircle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
            <p className="font-sans leading-normal">{t('nav.sidebarBlurb')}</p>
          </div>

        </div>

      </aside>

      {/* Main Workspace Frame container */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 bg-slate-50" id="applet-workspace-pannel">
        
        {/* Dynamic sliding Live feeds notification bar */}
        <AnimatePresence>
          {activeNotification && (
            <motion.div 
              id="sliding-toast-alert"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-md"
            >
              <div className="flex items-center gap-2.5 text-xs font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-slate-500">{t('notify.signal')}</span> 
                <span className="text-slate-800 font-sans font-medium">{activeNotification}</span>
              </div>
              <button onClick={() => setActiveNotification(null)} className="text-slate-400 hover:text-slate-800 cursor-pointer ml-3">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Content rendering based on current selected tab */}
        <div id="tab-outlet">
          {activeTab === 'dashboard' && (
            <DashboardHome 
              rates={rates}
              inventory={inventory}
              bank={bank}
              stats={stats}
              logs={logs}
              priceHistory={priceHistory}
              onNavigate={(tab) => {
                const allowed: AppTab[] = [
                  'inventory',
                  'pos',
                  'trading',
                  'reports',
                  'income',
                  'channels',
                  'reporting',
                  'settings',
                ];
                if (allowed.includes(tab as AppTab)) {
                  setActiveTab(tab as AppTab);
                }
              }}
              triggerLivePriceUpdate={triggerLivePriceUpdate}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryManager 
              rates={rates}
              inventory={inventory}
              bank={bank}
              onAddStock={handleAddStock}
              onUpdateRates={setRates}
            />
          )}

          {activeTab === 'pos' && (
            <POSTerminal 
              rates={rates}
              inventory={inventory}
              bank={bank}
              onRecordPOSBuy={handleRecordPOSBuy}
              onRecordPOSSell={handleRecordPOSSell}
            />
          )}

          {activeTab === 'trading' && (
            <GoldTrading rates={rates} onPlaceTrade={handlePlaceTrade} />
          )}

          {activeTab === 'income' && (
            <IncomeView rates={rates} stats={stats} priceHistory={priceHistory} />
          )}

          {activeTab === 'channels' && (
            <ChannelsView rates={rates} stats={stats} />
          )}

          {activeTab === 'reporting' && (
            <ReportingView
              rates={rates}
              logs={logs}
              onOpenLedger={() => setActiveTab('reports')}
            />
          )}

          {activeTab === 'settings' && <SettingsView />}

          {activeTab === 'reports' && (
            <AccountingReports 
              rates={rates}
              logs={logs}
            />
          )}
        </div>

      </main>

      {/* Figma Designed Mockup Overlay Modal window */}
      <AnimatePresence>
        {showFigmaModal && (
          <motion.div 
            id="figma-overlay-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-stone-900 border border-stone-800 rounded-2xl max-w-6xl w-full overflow-hidden flex flex-col justify-between max-h-[95vh] shadow-2xl"
              id="figma-modal-content"
            >
              
              {/* Modal Header */}
              <div className="p-4 border-b border-stone-800 flex items-center justify-between" id="figma-modal-header">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                    <h3 className="text-sm font-bold text-white font-sans">{t('figma.title')}</h3>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5">{t('figma.subtitle')}</p>
                </div>
                
                <button 
                  id="close-figma-modal-btn"
                  onClick={() => setShowFigmaModal(false)}
                  className="p-1 text-stone-400 hover:text-white bg-stone-950 hover:bg-stone-850 rounded-lg cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Interactive blueprint — charts & nav tabs (placeholder) */}
              <div className="px-4 pt-4 pb-2 shrink-0" id="figma-blueprint-section">
                <p className="text-[10px] text-stone-500 uppercase tracking-widest font-mono mb-2 px-1">
                  {t('figma.blueprintLabel')}
                </p>
                <FigmaBlueprintPreview />
              </div>

              {/* Figma Canvas body — reference image + specs */}
              <div className="p-4 pt-2 overflow-y-auto space-y-4 flex-1 bg-gradient-to-b from-stone-950 to-stone-900 flex flex-col md:flex-row gap-4 items-start" id="figma-modal-body">
                
                {/* Embedded generated image with proper requirements */}
                <div className="w-full md:w-3/5 border border-stone-800 rounded-xl overflow-hidden shadow-2xl bg-stone-950 shrink-0" id="figma-image-container">
                  <img 
                    src="/src/assets/images/gold_hub_mockup_1779364405794.png" 
                    alt={t('figma.alt')} 
                    referrerPolicy="no-referrer"
                    className="w-full object-cover"
                  />
                </div>

                {/* Sidebar details / Figma Comments logs */}
                <div className="w-full md:w-2/5 flex flex-col justify-between text-xs space-y-4" id="figma-design-specs">
                  <div>
                    <h4 className="text-white font-bold tracking-tight uppercase border-b border-stone-850 pb-2">{t('figma.directives')}</h4>
                    <p className="text-stone-400 mt-2 leading-relaxed">{t('figma.intro')}</p>
                    <ul className="list-disc ps-4 space-y-2 mt-3 text-stone-400 leading-normal">
                      <li><strong className="text-amber-500">{t('figma.goldAccent')}</strong> {t('figma.goldAccentDesc')}</li>
                      <li><strong className="text-stone-300">{t('figma.grid')}</strong> {t('figma.gridDesc')}</li>
                      <li><strong className="text-stone-300">{t('figma.mono')}</strong> {t('figma.monoDesc')}</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-stone-950 border border-stone-850 rounded-lg space-y-2 font-mono text-[10px]" id="figma-metadata">
                    <div className="flex justify-between text-stone-500"><span>{t('figma.artboard')}</span><span className="text-stone-300">{t('figma.artboardVal')}</span></div>
                    <div className="flex justify-between text-stone-500"><span>{t('figma.display')}</span><span className="text-stone-300">{t('figma.displayVal')}</span></div>
                    <div className="flex justify-between text-stone-500"><span>{t('figma.theme')}</span><span className="text-amber-400">{t('figma.themeVal')}</span></div>
                    <div className="flex justify-between text-stone-500"><span>{t('figma.status')}</span><span className="text-emerald-400">{t('common.approved')}</span></div>
                  </div>

                  <button 
                    id="close-overlay-btn"
                    onClick={() => setShowFigmaModal(false)}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-stone-950 text-xs font-bold font-sans rounded-xl cursor-pointer"
                  >
                    {t('common.returnWorkspace')}
                  </button>
                </div>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

