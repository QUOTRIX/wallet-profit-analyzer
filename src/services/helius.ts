import axios from 'axios';

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const BASE_URL = `https://api.helius.xyz/v0`;

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
}

export const getWalletTransactions = async (address: string): Promise<Transaction[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/addresses/${address}/transactions`, {
      params: {
        'api-key': HELIUS_API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    throw error;
  }
};

export const analyzeTradingPattern = (transactions: Transaction[]) => {
  const trades = transactions.map(tx => ({
    timestamp: tx.timestamp,
    fee: tx.fee,
    type: tx.type,
    // Add more analysis metrics here
  }));

  return {
    totalTrades: trades.length,
    averageFee: trades.reduce((acc, trade) => acc + trade.fee, 0) / trades.length,
    tradingFrequency: calculateTradingFrequency(trades),
    profitableTradesRatio: calculateProfitableTradesRatio(trades),
  };
};

const calculateTradingFrequency = (trades: any[]) => {
  if (trades.length < 2) return 0;
  
  const timeGaps = trades
    .slice(1)
    .map((trade, i) => trade.timestamp - trades[i].timestamp);
  
  return timeGaps.reduce((acc, gap) => acc + gap, 0) / timeGaps.length;
};

const calculateProfitableTradesRatio = (trades: any[]) => {
  // Implement profit calculation logic
  return 0;
};
