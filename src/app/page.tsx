'use client';

import { useState } from 'react';
import { getWalletTransactions, analyzeTradingPattern } from '../services/helius';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function Home() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyzeWallet = async () => {
    if (!address) return;
    
    try {
      setLoading(true);
      const transactions = await getWalletTransactions(address);
      const results = analyzeTradingPattern(transactions);
      setAnalysis(results);
    } catch (error) {
      console.error('Error analyzing wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Wallet Profit Analyzer</h1>
        
        {/* Input Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex gap-4">
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
        </div>

        {/* Results Section */}
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
                <p className="text-2xl font-bold">{analysis.averageFee.toFixed(4)} SOL</p>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Trading Frequency</p>
                <p className="text-2xl font-bold">{(analysis.tradingFrequency / 3600).toFixed(2)} hrs</p>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Profitable Trades</p>
                <p className="text-2xl font-bold">{(analysis.profitableTradesRatio * 100).toFixed(1)}%</p>
              </div>
            </div>

            {/* Chart will be added in next commit */}
          </div>
        )}
      </div>
    </main>
  );
}