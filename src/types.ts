export type GoldPurity = '24K' | '22K' | '21K' | '18K' | 'Scrap';

export interface GoldItem {
  id: string;
  name: string;
  category: 'bar' | 'bullion' | 'lira' | 'scrap';
  purity: GoldPurity;
  weightGrams: number;
  qty: number;
  avgCostPerGram: number; // in USD or preferred currency
}

export type ChannelSource = 'website' | 'mobile_app' | 'pos';

export interface ActivityLog {
  id: string;
  timestamp: string; // ISO string
  type: 'purchase' | 'sale' | 'trade_buy' | 'trade_sell' | 'scrap_buy';
  category: string;
  purity: GoldPurity;
  weightGrams: number;
  ratePerGram: number;
  totalAmount: number;
  source: ChannelSource;
  reference: string; // SKU or ticket ID
}

export interface ChannelStats {
  website: {
    activeSessions: number;
    todayVolumeGrams: number;
    todayTransactions: number;
    pendingTrades: number;
  };
  mobile_app: {
    activeSessions: number;
    todayVolumeGrams: number;
    todayTransactions: number;
    registeredBiometrics: number;
  };
  pos: {
    activeTerminals: number;
    todayVolumeGrams: number;
    todayTransactions: number;
    scrapBoughtGrams: number;
  };
}

export interface BankReserve {
  cashBalance: number;       // USD
  goldReserveGrams: number;  // Physical gram reserve in safe vaults
  totalLiabilities: number;  // Customer deposits for online trading
  equityValue: number;       // Calculated total net worth
}

export interface LiveGoldRates {
  '24K': number;
  '22K': number;
  '21K': number;
  '18K': number;
  scrapRateRate: number; // live scrap purchase rate (discounted spot)
  lastUpdated: string;
}
