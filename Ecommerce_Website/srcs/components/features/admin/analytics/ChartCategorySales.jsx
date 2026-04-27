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

const ChartCategorySales = ({ data }) => {
  return (
    <AnimatedDiv className='bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300'>
      <h3 className='text-lg font-semibold text-gray-800 mb-4 font-sans'>
        Danh mục sản phẩm bán chạy
      </h3>
      <div className='h-80'>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            <Pie
              data={data}
              cx='50%'
              cy='50%'
              outerRadius={80}
              dataKey='value'
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              labelLine={false}
              animationDuration={1500}
              animationBegin={200}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value}%`, '']} />
            <Legend
              wrapperStyle={{ fontFamily: 'sans-serif', fontSize: 12 }}
              formatter={(value) => (
                <span style={{ color: '#333', fontFamily: 'sans-serif' }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </AnimatedDiv>
  );
};

export default ChartCategorySales;
