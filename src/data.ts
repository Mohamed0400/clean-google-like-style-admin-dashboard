import { GoldItem, ActivityLog, ChannelStats, BankReserve, LiveGoldRates } from './types';

export const INITIAL_GOLD_PRICE = 78.50; // USD per Gram for 24K

export const SEED_LATEST_RATES: LiveGoldRates = {
  '24K': 78.50,
  '22K': 71.95,
  '21K': 68.70,
  '18K': 58.85,
  scrapRateRate: 74.20, // Buy spot for scrap-24k equivalency
  lastUpdated: new Date().toLocaleTimeString(),
};

export const SEED_INVENTORY: GoldItem[] = [
  { id: 'inv-1', name: 'Cast Gold Bar (24K)', category: 'bar', purity: '24K', weightGrams: 1000, qty: 5, avgCostPerGram: 72.10 },
  { id: 'inv-2', name: 'Minted Gold Bullion (24K)', category: 'bullion', purity: '24K', weightGrams: 100, qty: 25, avgCostPerGram: 73.50 },
  { id: 'inv-3', name: 'Sovereign Liras (22K)', category: 'lira', purity: '22K', weightGrams: 7.32, qty: 120, avgCostPerGram: 67.80 },
  { id: 'inv-4', name: 'Quarter Lira Coins (22K)', category: 'lira', purity: '22K', weightGrams: 1.75, qty: 350, avgCostPerGram: 68.10 },
  { id: 'inv-5', name: 'Refinery Scrap Gold (Mixed)', category: 'scrap', purity: 'Scrap', weightGrams: 4250, qty: 1, avgCostPerGram: 64.20 },
  { id: 'inv-6', name: 'Investment Liras (24K)', category: 'lira', purity: '24K', weightGrams: 31.10, qty: 15, avgCostPerGram: 74.80 },
];

export const SEED_BANK: BankReserve = {
  cashBalance: 1452900,
  goldReserveGrams: 15309.8, // total weight in vaults
  totalLiabilities: 620400, // customer web fund vaults
  equityValue: 2652130, // calculated from assets
};

export const SEED_STATS: ChannelStats = {
  website: { activeSessions: 412, todayVolumeGrams: 1850.5, todayTransactions: 34, pendingTrades: 12 },
  mobile_app: { activeSessions: 856, todayVolumeGrams: 920.0, todayTransactions: 28, registeredBiometrics: 4910 },
  pos: { activeTerminals: 5, todayVolumeGrams: 3145.2, todayTransactions: 42, scrapBoughtGrams: 1450.0 },
};

export const SEED_LOGS: ActivityLog[] = [
  {
    id: 'tx-101',
    timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    type: 'purchase',
    category: 'Gold Bars',
    purity: '24K',
    weightGrams: 500,
    ratePerGram: 78.45,
    totalAmount: 39225,
    source: 'pos',
    reference: 'POS-TX-9821'
  },
  {
    id: 'tx-102',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    type: 'scrap_buy',
    category: 'Estate Jewelry',
    purity: '18K',
    weightGrams: 45.5,
    ratePerGram: 58.85,
    totalAmount: 2677.68,
    source: 'pos',
    reference: 'POS-SCRAP-401'
  },
  {
    id: 'tx-103',
    timestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    type: 'trade_sell',
    category: 'Spot Web Gold',
    purity: '24K',
    weightGrams: 31.1, // 1 oz
    ratePerGram: 78.55,
    totalAmount: 2442.91,
    source: 'website',
    reference: 'WEB-ORDER-551'
  },
  {
    id: 'tx-104',
    timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    type: 'trade_buy',
    category: 'Limit Web Gold',
    purity: '24K',
    weightGrams: 50,
    ratePerGram: 78.20,
    totalAmount: 3910,
    source: 'website',
    reference: 'WEB-ORDER-549'
  },
  {
    id: 'tx-105',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    type: 'sale',
    category: 'Investment Liras',
    purity: '22K',
    weightGrams: 73.2,
    ratePerGram: 71.95,
    totalAmount: 5266.74,
    source: 'mobile_app',
    reference: 'MOB-TX-8801'
  },
  {
    id: 'tx-106',
    timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    type: 'scrap_buy',
    category: 'Broken Chains',
    purity: '21K',
    weightGrams: 120.0,
    ratePerGram: 68.70,
    totalAmount: 8244,
    source: 'pos',
    reference: 'POS-SCRAP-399'
  },
];

export const SEED_PRICE_HISTORY = [
  { date: '05-15', rate: 76.40 },
  { date: '05-16', rate: 76.90 },
  { date: '05-17', rate: 77.25 },
  { date: '05-18', rate: 77.05 },
  { date: '05-19', rate: 77.80 },
  { date: '05-20', rate: 78.15 },
  { date: '05-21', rate: 78.50 },
];
