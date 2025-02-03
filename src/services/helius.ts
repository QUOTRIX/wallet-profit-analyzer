// Previous imports remain the same...

interface CopyTradingScore {
  total: number;
  components: {
    profitScore: number;
    consistencyScore: number;
    frequencyScore: number;
    riskScore: number;
  };
  breakdown: string[];
}

const calculateCopyTradingScore = (trades: any[]): CopyTradingScore => {
  const tradesPerDay = trades.length / 30; // Assuming 30 days of data
  const averageProfitPerTrade = trades.reduce((acc, t) => acc + t.profit, 0) / trades.length;
  const profitableTradesRatio = trades.filter(t => t.profit > 0).length / trades.length;
  
  // Calculate max drawdown
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

  // Score components (0-100)
  const profitScore = Math.min(100, (averageProfitPerTrade * 100));
  const consistencyScore = Math.min(100, profitableTradesRatio * 100);
  const frequencyScore = Math.min(100, 
    tradesPerDay <= 5 ? 100 : // Ideal: 1-5 trades per day
    tradesPerDay <= 10 ? 80 : // Good: 6-10 trades per day
    tradesPerDay <= 20 ? 50 : // Fair: 11-20 trades per day
    20 // Poor: >20 trades per day
  );
  const riskScore = Math.min(100, 
    maxDrawdown === 0 ? 100 :
    maxDrawdown < 0.1 ? 90 : // Less than 10% drawdown
    maxDrawdown < 0.2 ? 70 : // Less than 20% drawdown
    maxDrawdown < 0.3 ? 50 : // Less than 30% drawdown
    30 // High drawdown
  );

  // Weighted average
  const total = Math.round(
    (profitScore * 0.35) + 
    (consistencyScore * 0.25) + 
    (frequencyScore * 0.2) + 
    (riskScore * 0.2)
  );

  const breakdown = [
    \`Average profit per trade: ${averageProfitPerTrade.toFixed(2)} SOL\`,
    \`Trades per day: ${tradesPerDay.toFixed(1)}\`,
    \`Win rate: ${(profitableTradesRatio * 100).toFixed(1)}%\`,
    \`Maximum drawdown: ${(maxDrawdown * 100).toFixed(1)}%\`
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
  // Previous analysis code remains...
  const trades = transactions.map(tx => {
    // Previous trade mapping...
  });

  const copyTradingScore = calculateCopyTradingScore(trades);

  return {
    // Previous metrics...
    copyTradingScore,
    recommendations: [
      copyTradingScore.total >= 80 ? "Highly suitable for copytrading" :
      copyTradingScore.total >= 60 ? "Moderately suitable for copytrading" :
      "Not recommended for copytrading",
      copyTradingScore.components.frequencyScore < 50 ? "Trading frequency too high for safe copytrading" : null,
      copyTradingScore.components.riskScore < 50 ? "Risk level may be too high" : null,
    ].filter(Boolean)
  };
};