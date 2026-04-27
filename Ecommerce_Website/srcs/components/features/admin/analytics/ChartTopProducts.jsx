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

const ChartTopProducts = ({ data }) => {
  return (
    <div className='bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8'>
      <h3 className='text-lg font-semibold text-gray-800 mb-4 font-sans'>
        Top sản phẩm bán chạy
      </h3>
      <ResponsiveContainer width='100%' height={300}>
        <BarChart data={data} layout='vertical'>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis type='number' />
          <YAxis dataKey='name' type='category' width={150} />
          <Tooltip />
          <Legend />
          <Bar dataKey='sales' name='Số lượng bán' fill='#f59e0b' />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartTopProducts;
