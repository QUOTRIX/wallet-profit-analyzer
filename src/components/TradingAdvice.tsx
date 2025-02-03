interface TradingAdviceProps {
  analysis: {
    totalTrades: number;
    averageFee: number;
    tradingFrequency: number;
    quickTrades: number;
    profitableTradesRatio: number;
    totalProfit: number;
    averageProfit: number;
    copyTradingScore: {
      total: number;
      components: {
        profitScore: number;
        consistencyScore: number;
        frequencyScore: number;
        riskScore: number;
      };
      breakdown: string[];
      recommendations: string[];
    };
  };
}

export default function TradingAdvice({ analysis }: TradingAdviceProps) {
  const getAdviceColor = () => {
    if (analysis.copyTradingScore.total >= 80) return 'bg-green-50 border-green-200';
    if (analysis.copyTradingScore.total >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getTradingStyle = () => {
    if (analysis.quickTrades / analysis.totalTrades > 0.5) return 'High-frequency bot trading';
    if (analysis.tradingFrequency < 24) return 'Day trading';
    return 'Swing trading';
  };

  const getExpectedReturn = () => {
    const monthlyProfit = (analysis.totalProfit / 30) * 30; // Monthly estimate
    const monthlyRoi = (monthlyProfit / (analysis.totalTrades * analysis.averageFee)) * 100;
    return monthlyRoi;
  };

  return (
    <div className={`p-6 rounded-lg border ${getAdviceColor()} mb-6`}>
      <h2 className="text-2xl font-bold mb-4">Trading Analysis</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Trading Style</h3>
          <p>{getTradingStyle()}</p>
          <p className="mt-1 text-sm text-gray-600">
            {analysis.quickTrades} quick trades out of {analysis.totalTrades} total trades
            ({((analysis.quickTrades / analysis.totalTrades) * 100).toFixed(1)}%)
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Risk Assessment</h3>
          <p>
            {analysis.copyTradingScore.components.riskScore >= 80 ? 'Low risk' :
             analysis.copyTradingScore.components.riskScore >= 60 ? 'Moderate risk' : 'High risk'}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Win rate: {analysis.profitableTradesRatio.toFixed(1)}% with average profit of {analysis.averageProfit.toFixed(2)} SOL
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Expected Returns</h3>
          <p>{getExpectedReturn().toFixed(1)}% monthly ROI (estimated)</p>
          <p className="mt-1 text-sm text-gray-600">
            Based on {analysis.totalTrades} trades over 30 days
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Copytrading Recommendation</h3>
          <div className="space-y-2">
            {analysis.copyTradingScore.recommendations.map((rec, index) => (
              <p key={index} className="text-sm">
                {rec}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-4 p-4 bg-white bg-opacity-50 rounded">
          <h3 className="font-semibold mb-2">Key Considerations</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>
              {analysis.tradingFrequency < 1 ? 
                'Very active trading - requires quick execution and high attention' :
                `Average ${analysis.tradingFrequency.toFixed(1)} hours between trades - manageable for copytrading`}
            </li>
            <li>
              {analysis.profitableTradesRatio >= 60 ?
                `Strong win rate of ${analysis.profitableTradesRatio.toFixed(1)}% indicates consistent strategy` :
                `Win rate of ${analysis.profitableTradesRatio.toFixed(1)}% suggests high-risk strategy`}
            </li>
            <li>
              {analysis.averageFee < 0.01 ?
                'Low fees indicate efficient trading' :
                'Higher fees may impact overall profitability'}
            </li>
            {analysis.quickTrades > 0 && (
              <li>
                {`${analysis.quickTrades} quick trades (under 5 minutes) may be difficult to copy manually`}
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}