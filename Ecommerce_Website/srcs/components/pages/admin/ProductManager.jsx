import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AiOutlinePlus, AiOutlineBarChart } from 'react-icons/ai';
import { MdInventory, MdTrendingUp, MdCategory } from 'react-icons/md';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import ProductRow from '../../features/admin/product/ProductRow';
import ProductForm from '../../features/admin/product/ProductForm';
import { useProduct } from '../../features/admin/product/useProduct';
import {
  getProductCount,
  getTopProductPerformance,
} from '../../services/apiDashboard';
import Pagination from '../../features/admin/product/Pagination';

const pageSize = 5;
const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};

const StatCard = ({ title, value, icon, change }) => {
  return (
    <motion.div
      variants={itemVariants}
      className='bg-white p-5 rounded-xl shadow-sm border border-gray-100'
      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
    >
      <div className='flex items-start justify-between'>
        <div>
          <p className='text-sm font-semibold text-gray-500 uppercase tracking-wider'>
            {title}
          </p>
          <h3 className='text-2xl font-bold text-gray-800 mt-2'>{value}</h3>
          {change && (
            <p className='text-xs text-green-600 mt-1 flex items-center'>
              <span>▲</span> {change}
            </p>
          )}
        </div>
        <div className='p-3 bg-red-50 rounded-lg text-red-600 text-xl'>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

const ProductManager = () => {
  const { isLoading, products } = useProduct();
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [productStats, setProductStats] = useState({
    totalProducts: 0,
    topProducts: [],
    categoryData: [],
  });

  const totalPages = Math.ceil(products.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentProducts = products.slice(startIndex, startIndex + pageSize);

  // Fetch product statistics
  useEffect(() => {
    const fetchProductStats = async () => {
      try {
        const count = await getProductCount();
        const topProducts = await getTopProductPerformance();

        // Create category distribution from products
        const categories = {};
        products.forEach((product) => {
          const category = product.category || 'other';
          if (!categories[category]) {
            categories[category] = 0;
          }
          categories[category]++;
        });

        const categoryData = Object.entries(categories)
          .map(([name, value]) => ({
            name:
              name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' '),
            value,
          }))
          .slice(0, 5);

        setProductStats({
          totalProducts: count,
          topProducts,
          categoryData,
        });
      } catch (error) {
        console.error('Error fetching product stats:', error);
      }
    };

    if (products.length > 0) {
      fetchProductStats();
    }
  }, [products]);

  if (isLoading || !products)
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600'></div>
      </div>
    );

  return (
    <div className='h-full flex flex-col'>
      {/* Fixed Header */}
      <div className='flex-shrink-0 p-4 bg-white border-b border-gray-200'>
        <div className='flex justify-between items-center'>
          <div>
            <h2 className='text-2xl font-bold text-gray-800'>
              Quản lý sản phẩm
            </h2>
            <p className='text-gray-500 mt-1'>
              Tổng cộng: {products.length} sản phẩm
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowStats(!showStats)}
              className='flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded hover:bg-gray-50 transition'
            >
              <AiOutlineBarChart className='w-5 h-5' />
              {showStats ? 'Ẩn thống kê' : 'Xem thống kê'}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm((prev) => !prev)}
              className='flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition'
            >
              <AiOutlinePlus className='w-5 h-5' />
              {showForm ? 'Ẩn form' : 'Thêm sản phẩm'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className='flex-1 overflow-y-auto'>
        <div className='p-4 space-y-6'>
          {/* Statistics Section */}
          {showStats && (
            <motion.div
              variants={containerVariants}
              initial='hidden'
              animate='show'
            >
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <StatCard
                  title='Tổng sản phẩm'
                  value={productStats.totalProducts.toLocaleString()}
                  icon={<MdInventory />}
                  change='8.3% so với tháng trước'
                />
                <StatCard
                  title='Sản phẩm bán chạy'
                  value={productStats.topProducts[0]?.name || 'Chưa có dữ liệu'}
                  icon={<MdTrendingUp />}
                  change={`${productStats.topProducts[0]?.growth}% tăng trưởng`}
                />
                <StatCard
                  title='Danh mục phổ biến'
                  value={
                    productStats.categoryData[0]?.name || 'Chưa có dữ liệu'
                  }
                  icon={<MdCategory />}
                  change={`${productStats.categoryData[0]?.value} sản phẩm`}
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                {/* Top Products Chart */}
                <div className='bg-white p-4 rounded-xl shadow-sm border border-gray-100'>
                  <h3 className='text-lg font-semibold mb-4'>
                    Top 5 sản phẩm bán chạy
                  </h3>
                  <div className='h-64'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <BarChart
                        data={productStats.topProducts.slice(0, 5)}
                        layout='vertical'
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray='3 3'
                          horizontal={false}
                        />
                        <XAxis type='number' />
                        <YAxis
                          dataKey='name'
                          type='category'
                          scale='band'
                          width={150}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                          formatter={(value) => [
                            `${value} đơn hàng`,
                            'Số lượng bán',
                          ]}
                          contentStyle={{
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            border: 'none',
                          }}
                        />
                        <Bar
                          dataKey='sales'
                          fill='#ef4444'
                          radius={[0, 4, 4, 0]}
                          name='Số lượng bán'
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Category Distribution Chart */}
                <div className='bg-white p-4 rounded-xl shadow-sm border border-gray-100'>
                  <h3 className='text-lg font-semibold mb-4'>
                    Phân bố danh mục
                  </h3>
                  <div className='h-64'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <PieChart>
                        <Pie
                          data={productStats.categoryData}
                          cx='50%'
                          cy='50%'
                          labelLine={false}
                          outerRadius={80}
                          fill='#8884d8'
                          dataKey='value'
                          nameKey='name'
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {productStats.categoryData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value} sản phẩm`, '']}
                          contentStyle={{
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            border: 'none',
                          }}
                        />
                        <Legend
                          layout='vertical'
                          align='right'
                          verticalAlign='middle'
                          wrapperStyle={{ fontSize: 12 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Form */}
          {showForm && <ProductForm onCancel={() => setShowForm(false)} />}

          {/* Product Table Section */}
          <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
            {/* Table header */}
            <div className='grid grid-cols-[0.6fr_0.5fr_1.2fr_2fr_1fr_1fr_1fr] gap-x-6 px-6 py-3 bg-red-50 text-base font-bold text-gray-800 border-b border-red-200 sticky top-0'>
              <div></div>
              <div>ID</div>
              <div>Category</div>
              <div>Name</div>
              <div>Price</div>
              <div>Discount</div>
              <div></div>
            </div>

            <div className='divide-y divide-gray-200'>
              {currentProducts.map((product) => (
                <ProductRow key={product.id} product={product} />
              ))}
            </div>
          </div>

          {/* Pagination */}
          <div className='flex justify-center mt-6'>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductManager;
