import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import AnimatedDiv from '@/components/ui/AnimatedDiv';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6'];

const ChartOrderStatus = ({ data }) => {
  return (
    <div className='bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8'>
      <h3 className='text-lg font-semibold text-gray-800 mb-4 font-sans'>
        Tỷ lệ trạng thái đơn hàng
      </h3>
      <ResponsiveContainer width='100%' height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey='count'
            nameKey='status'
            cx='50%'
            cy='50%'
            outerRadius={100}
            labelLine={false}
            label={false}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-status-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend layout='vertical' verticalAlign='middle' align='right' />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartOrderStatus;
