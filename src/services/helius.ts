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
      params: { 'api-key': API_KEY }
    });
    return response.data;
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }
};

const calculateCopyTradingScore = (trades: any[]) => {
  const tradesPerDay = trades.length / 30;
  const averageProfitPerTrade = trades.reduce((acc, t) => acc + t.profit, 0) / trades.length;
  const profitableTradesRatio = trades.filter(t => t.profit > 0).length / trades.length;
  
  let maxDrawdown = 0;
  let peak = 0;
  let cumulativeProfit = 0;
  trades.forEach(trade => {
    cumulativeProfit += trade.profit;
    if (cumulativeProfit > peak) {
      peak = cumulativeProfit;
    }
    const drawdown = peak - cumulativeProfit;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });

  const profitScore = Math.min(100, (averageProfitPerTrade * 100));
  const consistencyScore = Math.min(100, profitableTradesRatio * 100);
  const frequencyScore = Math.min(100, 
    tradesPerDay <= 5 ? 100 : 
    tradesPerDay <= 10 ? 80 : 
    tradesPerDay <= 20 ? 50 : 
    20
  );
  const riskScore = Math.min(100, 
    maxDrawdown === 0 ? 100 :
    maxDrawdown < 0.1 ? 90 : 
    maxDrawdown < 0.2 ? 70 : 
    maxDrawdown < 0.3 ? 50 : 
    30
  );

  const total = Math.round(
    (profitScore * 0.35) + 
    (consistencyScore * 0.25) + 
    (frequencyScore * 0.2) + 
    (riskScore * 0.2)
  );

  const breakdown = [
    `Average profit per trade: ${averageProfitPerTrade.toFixed(2)} SOL`,
    `Trades per day: ${tradesPerDay.toFixed(1)}`,
    `Win rate: ${(profitableTradesRatio * 100).toFixed(1)}%`,
    `Maximum drawdown: ${(maxDrawdown * 100).toFixed(1)}%`
  ];

  return {
    total,
    components: {
      profitScore,
      consistencyScore,
      frequencyScore,
      riskScore
    },
    breakdown
  };
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

  const copyTradingScore = calculateCopyTradingScore(trades);

  return {
    totalTrades: trades.length,
    averageFee: trades.reduce((acc, trade) => acc + trade.fee, 0) / trades.length,
    tradingFrequency: calculateTradingFrequency(trades),
    quickTrades: calculateQuickTrades(trades),
    profitableTradesRatio: (trades.filter(t => t.profit > 0).length / trades.length) * 100,
    volumeLast30Trades: trades.slice(0, 30).reduce((acc, trade) => acc + Math.abs(trade.profit), 0),
    tradingTimes: analyzeTradingTimes(trades),
    recentActivity: trades.slice(0, 10).map(t => ({
      time: new Date(t.timestamp * 1000).toLocaleString(),
      type: t.type,
      fee: t.fee.toFixed(4),
      profit: t.profit.toFixed(4)
    })),
    copyTradingScore,
    recommendations: getRecommendations(copyTradingScore)
  };
};

const calculateTradingFrequency = (trades: any[]) => {
  if (trades.length < 2) return 0;
  const timeGaps = trades.slice(1).map((trade, i) => Math.abs(trade.timestamp - trades[i].timestamp));
  return timeGaps.reduce((acc, gap) => acc + gap, 0) / timeGaps.length / 3600;
};

const calculateQuickTrades = (trades: any[]) => {
  if (trades.length < 2) return 0;
  const timeGaps = trades.slice(1).map((trade, i) => Math.abs(trade.timestamp - trades[i].timestamp));
  return timeGaps.filter(gap => gap < 300).length;
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

const calculateTransactionProfit = (tx: Transaction, walletAddress: string) => {
  const incoming = tx.nativeTransfers
    .filter(t => t.toUserAccount.toLowerCase() === walletAddress.toLowerCase())
    .reduce((sum, t) => sum + t.amount, 0);

  const outgoing = tx.nativeTransfers
    .filter(t => t.fromUserAccount.toLowerCase() === walletAddress.toLowerCase())
    .reduce((sum, t) => sum + t.amount, 0);

  return (incoming - outgoing) / 1000000000;
};

const getRecommendations = (score: any) => {
  const recommendations = [];
  if (score.total >= 80) {
    recommendations.push("Highly suitable for copytrading");
  } else if (score.total >= 60) {
    recommendations.push("Moderately suitable for copytrading");
  } else {
    recommendations.push("Not recommended for copytrading");
  }

  if (score.components.frequencyScore < 50) {
    recommendations.push("Trading frequency too high for safe copytrading");
  }
  if (score.components.riskScore < 50) {
    recommendations.push("Risk level may be too high");
  }

  return recommendations;
};