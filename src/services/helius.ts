import axios from 'axios';
import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || '');
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
        'until': Date.now(),
        'before': Date.now() - (30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    throw error;
  }
};

export const getTokenBalances = async (address: string) => {
  try {
    const pubKey = new PublicKey(address);
    const tokens = await connection.getParsedTokenAccountsByOwner(pubKey, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    });
    
    return tokens.value.map(token => ({
      mint: token.account.data.parsed.info.mint,
      amount: token.account.data.parsed.info.tokenAmount.uiAmount,
      decimals: token.account.data.parsed.info.tokenAmount.decimals,
    }));
  } catch (error) {
    console.error('Error fetching token balances:', error);
    throw error;
  }
};

export const analyzeTradingPattern = (transactions: Transaction[]) => {
  if (!transactions.length) return null;

  const trades = transactions.map(tx => ({
    timestamp: tx.timestamp,
    fee: tx.fee,
    type: tx.type,
    transfers: tx.tokenTransfers,
  }));

  const timeGaps = trades
    .slice(1)
    .map((trade, i) => trade.timestamp - trades[i].timestamp);

  const avgTimeGap = timeGaps.length 
    ? timeGaps.reduce((acc, gap) => acc + gap, 0) / timeGaps.length
    : 0;

  return {
    totalTrades: trades.length,
    averageFee: trades.reduce((acc, trade) => acc + trade.fee, 0) / trades.length,
    tradingFrequency: avgTimeGap,
    quickTrades: timeGaps.filter(gap => gap < 300).length, // Trades within 5 minutes
    patterns: analyzeTradingPatterns(trades),
  };
};

const analyzeTradingPatterns = (trades: any[]) => {
  return {
    morningTrades: trades.filter(t => new Date(t.timestamp).getHours() < 12).length,
    eveningTrades: trades.filter(t => new Date(t.timestamp).getHours() >= 12).length,
    weekendTrades: trades.filter(t => [0, 6].includes(new Date(t.timestamp).getDay())).length,
  };
};