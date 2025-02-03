'use client';

import { useState } from 'react';
import { getWalletTransactions, analyzeTradingPattern } from '../services/helius';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function Home() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  const analyzeWallet = async () => {
    if (!address) {
      setError('Please enter a wallet address');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      console.log('Starting analysis for wallet:', address);
      
      const transactions = await getWalletTransactions(address);
      console.log('Received transactions:', transactions);
      
      if (!transactions || transactions.length === 0) {
        setError('No transactions found for this wallet');
        return;
      }

      const results = analyzeTradingPattern(transactions);
      console.log('Analysis results:', results);
      setAnalysis(results);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Wallet Profit Analyzer</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter Solana wallet address"
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={analyzeWallet}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
          
          {error && (
            <div className="text-red-500 mt-2">
              {error}
            </div>
          )}
        </div>

        {analysis && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Total Trades</p>
                <p className="text-2xl font-bold">{analysis.totalTrades}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Average Fee</p>
                <p className="text-2xl font-bold">{analysis.averageFee?.toFixed(4) || 0} SOL</p>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Trading Frequency</p>
                <p className="text-2xl font-bold">{(analysis.tradingFrequency / 3600)?.toFixed(2) || 0} hrs</p>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Quick Trades</p>
                <p className="text-2xl font-bold">{analysis.quickTrades || 0}</p>
              </div>
            </div>

            <pre className="bg-gray-100 p-4 rounded">
              {JSON.stringify(analysis, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}