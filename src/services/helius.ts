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