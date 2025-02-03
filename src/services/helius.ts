import axios from 'axios';

const API_KEY = '9d607023-6ec7-42a2-b69c-7aab10a5ef38';
const BASE_URL = 'https://api.helius.xyz/v0';

export interface Transaction {
  signature: string;
  timestamp: number;
  fee: number;
  status: string;
  type: string;
  tokenTransfers: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    amount: number;
    mint: string;
  }>;
  nativeTransfers: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    amount: number;
  }>;
}

export const getWalletTransactions = async (address: string): Promise<Transaction[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/addresses/${address}/transactions`, {
      params: {
        'api-key': API_KEY
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }
};

const isOutgoingTransfer = (transfer: any, walletAddress: string) => {
  return transfer.fromUserAccount.toLowerCase() === walletAddress.toLowerCase();
};

const calculateTransactionProfit = (tx: Transaction, walletAddress: string) => {
  const incomingAmount = tx.nativeTransfers
    .filter(t => !isOutgoingTransfer(t, walletAddress))
    .reduce((sum, t) => sum + t.amount, 0);

  const outgoingAmount = tx.nativeTransfers
    .filter(t => isOutgoingTransfer(t, walletAddress))
    .reduce((sum, t) => sum + t.amount, 0);

  return (incomingAmount - outgoingAmount) / 1000000000; // Convert to SOL
};

export const analyzeTradingPattern = (transactions: Transaction[], walletAddress: string) => {
  if (!transactions.length) return null;

  const trades = transactions.map(tx => {
    const solanaPriceInLamports = 1000000000;
    const profit = calculateTransactionProfit(tx, walletAddress);
    
    return {
      timestamp: tx.timestamp,
      fee: tx.fee / solanaPriceInLamports,
      type: tx.type,
      profit: profit,
      transfers: tx.tokenTransfers || [],
      nativeTransfers: tx.nativeTransfers || []
    };
  }).sort((a, b) => b.timestamp - a.timestamp);

  const profitableTrades = trades.filter(trade => trade.profit > 0);
  const timeGaps = trades.slice(1).map((trade, i) => Math.abs(trade.timestamp - trades[i].timestamp));
  const avgTimeGap = timeGaps.length ? timeGaps.reduce((acc, gap) => acc + gap, 0) / timeGaps.length : 0;

  const recentTrades = trades.slice(0, 30);
  const tradeVolume = recentTrades.reduce((acc, trade) => acc + Math.abs(trade.profit), 0);

  return {
    totalTrades: trades.length,
    averageFee: trades.reduce((acc, trade) => acc + trade.fee, 0) / trades.length,
    tradingFrequency: avgTimeGap / 3600,
    quickTrades: timeGaps.filter(gap => gap < 300).length,
    profitableTradesRatio: (profitableTrades.length / trades.length) * 100,
    totalProfit: trades.reduce((acc, trade) => acc + trade.profit, 0),
    averageProfit: trades.reduce((acc, trade) => acc + trade.profit, 0) / trades.length,
    volumeLast30Trades: tradeVolume,
    averageVolume: tradeVolume / Math.min(trades.length, 30),
    tradingTimes: analyzeTradingTimes(trades),
    recentActivity: trades.slice(0, 10).map(t => ({
      time: new Date(t.timestamp * 1000).toLocaleString(),
      type: t.type,
      fee: t.fee.toFixed(4),
      profit: t.profit.toFixed(4)
    }))
  };
};

const analyzeTradingTimes = (trades: any[]) => {
  return {
    morningTrades: trades.filter(t => {
      const hour = new Date(t.timestamp * 1000).getHours();
      return hour >= 6 && hour < 12;
    }).length,
    afternoonTrades: trades.filter(t => {
      const hour = new Date(t.timestamp * 1000).getHours();
      return hour >= 12 && hour < 18;
    }).length,
    eveningTrades: trades.filter(t => {
      const hour = new Date(t.timestamp * 1000).getHours();
      return hour >= 18 || hour < 6;
    }).length,
    weekendTrades: trades.filter(t => {
      const day = new Date(t.timestamp * 1000).getDay();
      return day === 0 || day === 6;
    }).length
  };
};