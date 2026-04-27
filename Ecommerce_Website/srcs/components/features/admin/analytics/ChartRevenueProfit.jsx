import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import AnimatedDiv from '@/components/ui/AnimatedDiv';

const ChartRevenueProfit = ({ data }) => {
  return (
    <AnimatedDiv className='bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300'>
      <h3 className='text-lg font-semibold text-gray-800 mb-4 font-sans'>
        Doanh thu & lợi nhuận
      </h3>
      <div className='h-80'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray='3 3' strokeOpacity={0.3} />
            <XAxis
              dataKey='name'
              tick={{ fontFamily: 'sans-serif', fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(value) => `${value / 1000}k`}
              tick={{ fontFamily: 'sans-serif', fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) => [`₫${value.toLocaleString()}`, '']}
              contentStyle={{
                fontFamily: 'sans-serif',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: 'none',
              }}
            />
            <Legend wrapperStyle={{ fontFamily: 'sans-serif', fontSize: 12 }} />
            <Bar
              dataKey='revenue'
              name='Doanh thu'
              fill='#ef4444'
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            />
            <Bar
              dataKey='profit'
              name='Lợi nhuận'
              fill='#10b981'
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AnimatedDiv>
  );
};

export default ChartRevenueProfit;
