import { Transaction } from './helius';

const calculateTransactionProfit = (tx: Transaction, walletAddress: string) => {
  const incoming = tx.nativeTransfers
    .filter(t => t.toUserAccount.toLowerCase() === walletAddress.toLowerCase())
    .reduce((sum, t) => sum + t.amount, 0);

  const outgoing = tx.nativeTransfers
    .filter(t => t.fromUserAccount.toLowerCase() === walletAddress.toLowerCase())
    .reduce((sum, t) => sum + t.amount, 0);

  return (incoming - outgoing) / 1000000000;
};

const calculateTradingScore = (trades: any[]) => {
  const averageProfitPerTrade = trades.reduce((acc, t) => acc + t.profit, 0) / trades.length;
  const profitableTradesRatio = trades.filter(t => t.profit > 0).length / trades.length;
  const tradesPerDay = trades.length / Math.max(1, Math.ceil((trades[0].timestamp - trades[trades.length - 1].timestamp) / (24 * 3600)));

  // Maximum drawdown calculation
  let maxDrawdown = 0;
  let peak = 0;
  let cumulativeProfit = 0;
  trades.forEach(trade => {
    cumulativeProfit += trade.profit;
    if (cumulativeProfit > peak) peak = cumulativeProfit;
    const drawdown = peak - cumulativeProfit;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  });

  // Score components (0-100)
  const profitScore = Math.min(100, (averageProfitPerTrade * 20)); // Scale profit for scoring
  const consistencyScore = Math.min(100, profitableTradesRatio * 100);
  const frequencyScore = Math.min(100, 
    tradesPerDay <= 5 ? 100 :  // Ideal frequency
    tradesPerDay <= 10 ? 80 :  // Good frequency
    tradesPerDay <= 20 ? 50 :  // Moderate frequency
    20                         // Too frequent
  );
  const riskScore = Math.min(100, 
    maxDrawdown === 0 ? 100 :
    maxDrawdown < 0.1 ? 90 :   // < 10% drawdown
    maxDrawdown < 0.2 ? 70 :   // < 20% drawdown
    maxDrawdown < 0.3 ? 50 :   // < 30% drawdown
    30                         // High drawdown
  );

  // Weighted total score
  const total = Math.round(
    (profitScore * 0.35) +     // Profit is most important
    (consistencyScore * 0.25) + // Followed by consistency
    (frequencyScore * 0.20) +   // Trading frequency
    (riskScore * 0.20)         // Risk management
  );

  return {
    total,
    components: {
      profitScore,
      consistencyScore,
      frequencyScore,
      riskScore
    },
    breakdown: [
      `Average profit per trade: ${averageProfitPerTrade.toFixed(2)} SOL`,
      `Trades per day: ${tradesPerDay.toFixed(1)}`,
      `Win rate: ${(profitableTradesRatio * 100).toFixed(1)}%`,
      `Maximum drawdown: ${(maxDrawdown * 100).toFixed(1)}%`
    ],
    recommendations: [
      total >= 80 ? "✅ Highly suitable for copytrading" :
      total >= 60 ? "⚠️ Moderately suitable for copytrading" :
      "❌ Not recommended for copytrading",
      profitScore < 50 && "⚠️ Low profit margins",
      frequencyScore < 50 && "⚠️ Trading frequency too high for safe copytrading",
      riskScore < 50 && "⚠️ High risk level due to significant drawdowns"
    ].filter(Boolean)
  };
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
  const tradingScore = calculateTradingScore(trades);

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
    })),
    copyTradingScore: tradingScore
  };
};