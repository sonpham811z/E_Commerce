import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6'];

const ChartRegionalDistribution = ({ data }) => {
  return (
    <div className='bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8'>
      <h3 className='text-lg font-semibold text-gray-800 mb-4 font-sans'>
        Phân bố đơn hàng theo khu vực
      </h3>
      <ResponsiveContainer width='100%' height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey='percentage'
            nameKey='region'
            cx='50%'
            cy='50%'
            outerRadius={100}
            labelLine={false}
            label={false}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-region-${index}`}
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

export default ChartRegionalDistribution;
