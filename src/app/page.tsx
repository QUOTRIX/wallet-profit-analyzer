'use client';

import { useState } from 'react';
import { getWalletTransactions, analyzeTradingPattern } from '../services/helius';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Home() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyzeWallet = async () => {
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
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Wallet Profit Analyzer</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Enter Solana wallet address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={analyzeWallet}
              disabled={loading || !address}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>

          {analysis && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="text-lg font-semibold mb-2">Trading Overview</h3>
                  <p>Total Trades: {analysis.totalTrades}</p>
                  <p>Average Fee: {analysis.averageFee} SOL</p>
                  <p>Trading Frequency: {analysis.tradingFrequency} hours</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="text-lg font-semibold mb-2">Profitability</h3>
                  <p>Profitable Trades: {analysis.profitableTradesRatio}%</p>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analysis.priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#2563eb" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}