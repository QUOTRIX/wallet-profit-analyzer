import axios from 'axios';

const API_KEY = '9d607023-6ec7-42a2-b69c-7aab10a5ef38';
const BASE_URL = 'https://api.helius.xyz/v1';

export const getWalletTransactions = async (address: string): Promise<Transaction[]> => {
  try {
    console.log('Requesting transactions for:', address);
    
    const response = await axios.post(`${BASE_URL}/addresses/${address}/transactions`, {
      apiKey: API_KEY,
      query: {
        limit: 100
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

// Rest of the code remains the same
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