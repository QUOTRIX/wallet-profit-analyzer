import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TradingChartProps {
  data: {
    timestamp: number;
    profit: number;
    cumulativeProfit: number;
  }[];
}

const TradingChart = ({ data }: TradingChartProps) => {
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.timestamp * 1000).toLocaleDateString(),
  }));

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="profit"
            stroke="#8884d8"
            name="Trade Profit"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cumulativeProfit"
            stroke="#82ca9d"
            name="Cumulative Profit"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TradingChart;