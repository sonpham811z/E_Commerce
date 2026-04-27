import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import AnimatedDiv from '@/components/ui/AnimatedDiv';

const ChartRevenueGrowth = ({ data }) => {
  return (
    <AnimatedDiv className='bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300'>
      <h3 className='text-lg font-semibold text-gray-800 mb-4 font-sans'>
        Phát triển doanh thu
      </h3>
      <div className='h-80'>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
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
              formatter={(value) => [`₫${value.toLocaleString()}`, 'Doanh thu']}
              contentStyle={{
                fontFamily: 'sans-serif',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                border: 'none',
              }}
            />
            <Area
              type='monotone'
              dataKey='revenue'
              stroke='#ef4444'
              fill='#fee2e2'
              strokeWidth={2}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </AnimatedDiv>
  );
};

export default ChartRevenueGrowth;
