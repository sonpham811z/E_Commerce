import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import AnimatedDiv from '@/components/ui/AnimatedDiv';

const ChartOrderTrend = ({ data }) => {
  return (
    <AnimatedDiv className='bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300'>
      <h3 className='text-lg font-semibold text-gray-800 mb-4 font-sans'>
        Xu hướng đơn hàng
      </h3>
      <div className='h-80'>
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray='3 3' strokeOpacity={0.3} />
            <XAxis
              dataKey='name'
              tick={{ fontFamily: 'sans-serif', fontSize: 12 }}
            />
            <YAxis tick={{ fontFamily: 'sans-serif', fontSize: 12 }} />
            <Tooltip
              formatter={(value) => [value, '']}
              contentStyle={{
                fontFamily: 'sans-serif',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                border: 'none',
              }}
            />
            <Legend wrapperStyle={{ fontFamily: 'sans-serif', fontSize: 12 }} />
            <Line
              type='monotone'
              dataKey='orders'
              name='Số đơn hàng'
              stroke='#3b82f6'
              strokeWidth={3}
              dot={{ r: 4, fill: 'white', stroke: '#3b82f6', strokeWidth: 2 }}
              activeDot={{
                r: 8,
                fill: '#3b82f6',
                stroke: 'white',
                strokeWidth: 2,
              }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </AnimatedDiv>
  );
};

export default ChartOrderTrend;
