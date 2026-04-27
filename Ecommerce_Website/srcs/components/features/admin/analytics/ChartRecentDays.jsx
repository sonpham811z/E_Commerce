import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const ChartRecentDays = ({ data }) => {
  return (
    <div className='bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8'>
      <h3 className='text-lg font-semibold text-gray-800 mb-4 font-sans'>
        Doanh thu & Đơn hàng 7 ngày gần nhất
      </h3>
      <ResponsiveContainer width='100%' height={300}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='day' />
          <YAxis
            yAxisId='left'
            orientation='left'
            tickFormatter={(v) => `${v / 1000}k`}
          />
          <YAxis yAxisId='right' orientation='right' />
          <Tooltip />
          <Legend />
          <Bar
            yAxisId='right'
            dataKey='orders'
            name='Đơn hàng'
            fill='#3b82f6'
          />
          <Line
            yAxisId='left'
            type='monotone'
            dataKey='revenue'
            name='Doanh thu'
            stroke='#ef4444'
            strokeWidth={2}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartRecentDays;
