interface CopyTradeScoreProps {
  score: {
    total: number;
    components: {
      profitScore: number;
      consistencyScore: number;
      frequencyScore: number;
      riskScore: number;
    };
    breakdown: string[];
  };
  recommendations: string[];
}

export default function CopyTradeScore({ score, recommendations }: CopyTradeScoreProps) {
  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-green-600 bg-green-50';
    if (value >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Copytrade Score</h2>
        <div className={`text-4xl font-bold p-4 rounded-full ${getScoreColor(score.total)}`}>
          {score.total}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="font-semibold mb-2">Score Components</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Profit</span>
              <span className={getScoreColor(score.components.profitScore)}>
                {score.components.profitScore.toFixed(0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Consistency</span>
              <span className={getScoreColor(score.components.consistencyScore)}>
                {score.components.consistencyScore.toFixed(0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Frequency</span>
              <span className={getScoreColor(score.components.frequencyScore)}>
                {score.components.frequencyScore.toFixed(0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Risk Level</span>
              <span className={getScoreColor(score.components.riskScore)}>
                {score.components.riskScore.toFixed(0)}
              </span>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Recommendations</h3>
          <ul className="list-disc list-inside space-y-1">
            {recommendations.map((rec, index) => (
              <li key={index} className="text-sm">{rec}</li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Analysis Breakdown</h3>
        <ul className="list-disc list-inside space-y-1">
          {score.breakdown.map((item, index) => (
            <li key={index} className="text-sm text-gray-600">{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}