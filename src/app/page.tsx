'use client';

import { useState } from 'react';
import { getWalletTransactions, analyzeTradingPattern } from '../services/helius';
import CopyTradeScore from '../components/CopyTradeScore';

export default function Home() {
  // Previous state declarations...
  
  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Wallet Profit Analyzer</h1>
        
        {/* Input section remains the same */}
        
        {analysis && (
          <div className="space-y-6">
            <CopyTradeScore 
              score={analysis.copyTradingScore}
              recommendations={analysis.recommendations}
            />
            
            {/* Rest of the analysis sections remain the same */}
          </div>
        )}
      </div>
    </main>
  );
}