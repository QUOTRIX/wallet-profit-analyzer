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