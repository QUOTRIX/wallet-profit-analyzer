'use client';

import { useState } from 'react';
import { getWalletTransactions, analyzeTradingPattern } from '../services/helius';
import CopyTradeScore from '../components/CopyTradeScore';

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
      const transactions = await getWalletTransactions(address);
      
      if (!transactions || transactions.length === 0) {
        setError('No transactions found for this wallet');
        return;
      }

      const results = analyzeTradingPattern(transactions, address);
      console.log('Analysis results:', results);
      setAnalysis(results);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-6xl mx-auto">
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
          <div className="space-y-6">
            {analysis.copyTradingScore && (
              <CopyTradeScore 
                score={analysis.copyTradingScore}
                recommendations={analysis.recommendations || []}
              />
            )}
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600">Total Trades</p>
                  <p className="text-2xl font-bold">{analysis.totalTrades}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">Average Fee</p>
                  <p className="text-2xl font-bold">{analysis.averageFee.toFixed(4)} SOL</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600">Trading Frequency</p>
                  <p className="text-2xl font-bold">{analysis.tradingFrequency.toFixed(1)} hrs</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-600">Profitable Trades</p>
                  <p className="text-2xl font-bold">{analysis.profitableTradesRatio?.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            {analysis.tradingTimes && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Trading Times</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Morning (6-12)</p>
                    <p className="text-2xl font-bold">{analysis.tradingTimes.morningTrades}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Afternoon (12-18)</p>
                    <p className="text-2xl font-bold">{analysis.tradingTimes.afternoonTrades}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Evening (18-6)</p>
                    <p className="text-2xl font-bold">{analysis.tradingTimes.eveningTrades}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Weekend Trading</p>
                    <p className="text-2xl font-bold">{analysis.tradingTimes.weekendTrades}</p>
                  </div>
                </div>
              </div>
            )}

            {analysis.recentActivity && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="text-left p-2">Time</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-right p-2">Fee (SOL)</th>
                        <th className="text-right p-2">Profit (SOL)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.recentActivity.map((activity, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">{activity.time}</td>
                          <td className="p-2">{activity.type}</td>
                          <td className="p-2 text-right">{activity.fee}</td>
                          <td className="p-2 text-right">
                            <span className={activity.profit > 0 ? 'text-green-600' : 'text-red-600'}>
                              {activity.profit}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}