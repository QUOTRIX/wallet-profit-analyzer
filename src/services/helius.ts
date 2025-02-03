import axios from 'axios';

const API_KEY = '9d607023-6ec7-42a2-b69c-7aab10a5ef38';
const BASE_URL = 'https://api.helius.xyz/v1';  // Changed to v1

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
    console.log('Requesting transactions for:', address);
    
    // Using the v1 transactions endpoint
    const response = await axios.post(`${BASE_URL}/addresses/${address}/transactions`, {
      api-key: API_KEY,
      query: {
        "limit": 100
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data.items || [];
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }
};

const calculateTransactionProfit = (tx: Transaction, walletAddress: string) => {
  const incoming = tx.nativeTransfers
    .filter(t => t.toUserAccount.toLowerCase() === walletAddress.toLowerCase())
    .reduce((sum, t) => sum + t.amount, 0);

  const outgoing = tx.nativeTransfers
    .filter(t => t.fromUserAccount.toLowerCase() === walletAddress.toLowerCase())
    .reduce((sum, t) => sum + t.amount, 0);

  return (incoming - outgoing) / 1000000000;
};

export const analyzeTradingPattern = (transactions: Transaction[], walletAddress: string) => {
  if (!transactions.length) return null;

  const trades = transactions.map(tx => {
    const solanaPriceInLamports = 1000000000;
    return {
      timestamp: tx.timestamp,
      fee: tx.fee / solanaPriceInLamports,
      type: tx.type,
      profit: calculateTransactionProfit(tx, walletAddress),
      transfers: tx.tokenTransfers || [],
      nativeTransfers: tx.nativeTransfers || []
    };
  }).sort((a, b) => b.timestamp - a.timestamp);

  const timeGaps = trades
    .slice(1)
    .map((trade, i) => Math.abs(trade.timestamp - trades[i].timestamp));

  const avgTimeGap = timeGaps.length 
    ? timeGaps.reduce((acc, gap) => acc + gap, 0) / timeGaps.length
    : 0;

  const profitableTrades = trades.filter(t => t.profit > 0);

  return {
    totalTrades: trades.length,
    averageFee: trades.reduce((acc, t) => acc + t.fee, 0) / trades.length,
    tradingFrequency: avgTimeGap / 3600,
    quickTrades: timeGaps.filter(gap => gap < 300).length,
    profitableTradesRatio: (profitableTrades.length / trades.length) * 100,
    totalProfit: trades.reduce((acc, t) => acc + t.profit, 0),
    averageProfit: trades.reduce((acc, t) => acc + t.profit, 0) / trades.length,
    tradingTimes: {
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
    },
    recentActivity: trades.slice(0, 10).map(t => ({
      time: new Date(t.timestamp * 1000).toLocaleString(),
      type: t.type,
      fee: t.fee.toFixed(4),
      profit: t.profit.toFixed(4)
    }))
  };
};