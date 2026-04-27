import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiPackage,
  FiTruck,
  FiCheckSquare,
  FiAlertCircle,
  FiClock,
  FiPrinter,
} from 'react-icons/fi';
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
import {
  getAdminOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStatsByStatus,
  getCurrentWeekRevenue,
  deleteOrder,
} from '@/components/features/orders/apiOrders';
import { generateInvoice } from '@/components/features/orders/apiInvoice';
import { formatCurrency } from '@/utils/format';
import Spinner from '@/components/ui/Spinner';
import { toast } from 'react-hot-toast';

import {
  MdEdit,
  MdShoppingBag,
  MdLocalShipping,
  MdDone,
  MdCancel,
} from 'react-icons/md';

// Status badges
const StatusBadge = ({ status }) => {
  let bgColor = 'bg-gray-100 text-gray-800';
  let icon = null;

  if (status === 'pending') {
    bgColor = 'bg-yellow-100 text-yellow-800';
    icon = <MdShoppingBag className='mr-1' />;
  } else if (status === 'processing') {
    bgColor = 'bg-blue-100 text-blue-800';
    icon = <MdEdit className='mr-1' />;
  } else if (status === 'shipping') {
    bgColor = 'bg-indigo-100 text-indigo-800';
    icon = <MdLocalShipping className='mr-1' />;
  } else if (status === 'completed') {
    bgColor = 'bg-green-100 text-green-800';
    icon = <MdDone className='mr-1' />;
  } else if (status === 'cancelled') {
    bgColor = 'bg-red-100 text-red-800';
    icon = <MdCancel className='mr-1' />;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}
    >
      {icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const OrderStatCard = ({ title, value, icon, change }) => {
  return (
    <motion.div
      variants={{
        hidden: { y: 20, opacity: 0 },
        show: {
          y: 0,
          opacity: 1,
          transition: {
            type: 'spring',
            stiffness: 260,
            damping: 20,
          },
        },
      }}
      className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'
      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
    >
      <div className='flex items-start justify-between'>
        <div>
          <p className='text-sm font-medium text-gray-500 uppercase tracking-wider'>
            {title}
          </p>
          <h3 className='text-2xl font-bold text-gray-800 mt-2'>{value}</h3>
          {change && (
            <p className='text-xs text-green-600 mt-1 flex items-center'>
              <span>▲</span> {change}
            </p>
          )}
        </div>
        <div className='p-3 bg-red-50 rounded-lg text-red-600'>{icon}</div>
      </div>
    </motion.div>
  );
};

// Empty states and error handler components
const EmptyState = ({ message }) => (
  <div className='flex flex-col items-center justify-center py-12'>
    <FiPackage className='w-16 h-16 text-gray-300 mb-4' />
    <p className='text-lg text-gray-500'>{message}</p>
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className='flex flex-col items-center justify-center py-12'>
    <FiAlertCircle className='w-16 h-16 text-red-400 mb-4' />
    <p className='text-lg text-gray-700 mb-4'>{message}</p>
    <button
      onClick={onRetry}
      className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition'
    >
      Thử lại
    </button>
  </div>
);

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    revenue: 0,
    regional: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    total: 0,
  });
  const [weeklyData, setWeeklyData] = useState([]);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  // Fetch orders with pagination
  const fetchOrders = useCallback(
    async (page = currentPage) => {
      setIsLoading(true);
      setError(null);
      try {
        const { orders: fetchedOrders, pageCount } = await getAdminOrders({
          page,
          pageSize: 10,
          status: statusFilter !== 'all' ? statusFilter : null,
          searchTerm: searchTerm,
          sortBy: 'order_date',
          ascending: false,
        });

        setOrders(fetchedOrders);
        setFilteredOrders(fetchedOrders);
        setTotalPages(pageCount);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
        toast.error('Lỗi kết nối dữ liệu!');
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, statusFilter, searchTerm]
  );

  // Fetch order statistics
  const fetchOrderStats = useCallback(async () => {
    try {
      const stats = await getOrderStatsByStatus();
      const statsObject = {};

      // Check if stats is an array before using forEach
      if (Array.isArray(stats)) {
        stats.forEach((item) => {
          statsObject[item.status] = item.count;
        });
      } else if (stats && typeof stats === 'object') {
        // If stats is an object, use it directly
        Object.keys(stats).forEach((status) => {
          statsObject[status] = stats[status];
        });
      }

      setStatusCounts(statsObject);
      setOrderStats((prev) => ({
        ...prev,
        total: statsObject.total || 0,
      }));

      // Fetch weekly revenue data
      const weeklyRevenueData = await getCurrentWeekRevenue();
      setWeeklyData(weeklyRevenueData);
    } catch (error) {
      console.error('Error fetching order stats:', error);
      toast.error('Không thể tải thông tin thống kê.');
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
    fetchOrderStats();
  }, [fetchOrders, fetchOrderStats]);

  // Fetch order details when an order is selected
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!selectedOrder) return;

      try {
        const orderDetails = await getOrderById(selectedOrder.id);
        setSelectedOrder(orderDetails);
      } catch (error) {
        console.error('Error fetching order details:', error);
        toast.error('Không thể tải chi tiết đơn hàng.');
        setSelectedOrder(null);
      }
    };

    if (selectedOrder && !selectedOrder.address) {
      fetchOrderDetails();
    }
  }, [selectedOrder]);

  // Handle status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);

      // Update the order in the list
      const updatedOrders = orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );

      setOrders(updatedOrders);
      setFilteredOrders(updatedOrders);

      // Update selected order if it's the one being updated
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      // Refresh order stats
      fetchOrderStats();

      toast.success('Cập nhật trạng thái thành công!');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Không thể cập nhật trạng thái đơn hàng.');
    }
  };

  // Handle order deletion
  const handleDeleteOrder = async (orderId) => {
    const confirmation = window.confirm(
      'Bạn có chắc chắn muốn xóa đơn hàng này?'
    );
    if (!confirmation) return;

    try {
      await deleteOrder(orderId);
      toast.success(`Đơn hàng #${orderId} đã được xóa thành công`);

      // Update local state
      setOrders(orders.filter((order) => order.id !== orderId));

      // Refresh statistics
      fetchOrderStats();

      // Close modal if open
      if (selectedOrder && selectedOrder.id === orderId) {
        setShowOrderDetail(false);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Không thể xóa đơn hàng. Vui lòng thử lại sau.');
    }
  };

  // View order details
  const viewOrderDetails = async (orderId) => {
    try {
      const order = await getOrderById(orderId);
      setSelectedOrder(order);
      setShowOrderDetail(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Không thể tải chi tiết đơn hàng. Vui lòng thử lại sau.');
    }
  };

  // Handle invoice generation
  const handleGenerateInvoice = async (order) => {
    if (!order) return;

    try {
      setIsGeneratingInvoice(true);
      toast.loading('Đang tạo hóa đơn PDF...');

      const success = await generateInvoice(order);

      toast.dismiss();
      if (success) {
        toast.success('Hóa đơn đã được tạo thành công!');
      } else {
        toast.error('Không thể tạo hóa đơn. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.dismiss();
      toast.error(
        'Lỗi khi tạo hóa đơn: ' + (error.message || 'Lỗi không xác định')
      );
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          setError(null);
          setIsLoading(true);
          setCurrentPage(1);
          setStatusFilter('all');
          setSearchTerm('');
          fetchOrders();
        }}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className='space-y-6'
    >
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>Quản lý đơn hàng</h1>
          <p className='text-gray-500 mt-1'>
            Tổng cộng {statusCounts.total || 0} đơn hàng | Doanh thu{' '}
            {formatCurrency(orderStats.revenue || 0)}
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-3'>
          <div className='relative'>
            <input
              type='text'
              placeholder='Tìm đơn hàng...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
            />
            <FiSearch className='absolute left-3 top-2.5 text-gray-400' />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className='px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
          >
            <option value='all'>Tất cả trạng thái</option>
            <option value='pending'>Đang xử lý</option>
            <option value='processing'>Đang xử lý</option>
            <option value='shipped'>Đang vận chuyển</option>
            <option value='delivered'>Đã giao</option>
            <option value='cancelled'>Đã hủy</option>
          </select>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className='px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 flex items-center'
          >
            <FiFilter className='mr-2' />
            Bộ lọc
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className='px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg flex items-center shadow-md'
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => {
                // Refresh data
                setCurrentPage(1);
                setStatusFilter('all');
                setSearchTerm('');
                setIsLoading(false);
              }, 700);
            }}
          >
            <FiRefreshCw className='mr-2' />
            Làm mới
          </motion.button>
        </div>
      </div>

      {/* Order Statistics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <OrderStatCard
          title='Tổng đơn hàng'
          value={statusCounts.total || 0}
          icon={<FiPackage className='text-xl' />}
          change='Tất cả đơn hàng'
        />
        <OrderStatCard
          title='Đơn chờ xử lý'
          value={(statusCounts.pending || 0) + (statusCounts.processing || 0)}
          icon={<FiClock className='text-xl' />}
          change='Cần xử lý'
        />
        <OrderStatCard
          title='Đơn đang giao'
          value={statusCounts.shipped || 0}
          icon={<FiTruck className='text-xl' />}
          change='Đang vận chuyển'
        />
        <OrderStatCard
          title='Đơn hoàn thành'
          value={statusCounts.delivered || 0}
          icon={<FiCheckSquare className='text-xl' />}
          change='Đã giao hàng'
        />
      </div>

      {/* Weekly Revenue Chart */}
      {weeklyData.length > 0 && (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6'>
          <h2 className='text-lg font-semibold mb-4'>
            Doanh thu theo ngày trong tuần
          </h2>
          <div className='h-72'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart
                data={weeklyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray='3 3' strokeOpacity={0.3} />
                <XAxis dataKey='day' />
                <YAxis
                  yAxisId='revenue'
                  tickFormatter={(value) => `${value / 1000000}M`}
                  orientation='left'
                />
                <YAxis
                  yAxisId='orders'
                  orientation='right'
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'Doanh thu' ? formatCurrency(value) : value,
                    name,
                  ]}
                />
                <Legend />
                <Line
                  type='monotone'
                  dataKey='revenue'
                  name='Doanh thu'
                  stroke='#ef4444'
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                  yAxisId='revenue'
                />
                <Line
                  type='monotone'
                  dataKey='orders'
                  name='Số đơn hàng'
                  stroke='#3b82f6'
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                  yAxisId='orders'
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Đơn hàng
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Khách hàng
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Ngày đặt
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Sản phẩm
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Tổng tiền
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Trạng thái
                </th>
                <th className='px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right'>
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ backgroundColor: '#f9fafb' }}
                    onClick={() => viewOrderDetails(order.id)}
                    className='cursor-pointer'
                  >
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='font-medium text-gray-900'>
                        ORD-{order.id.toString().substring(0, 8)}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-gray-900'>
                        {order.customer_name}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {new Date(order.order_date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {order.product_info ? order.product_info.quantity : 1} sản
                      phẩm
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      {formatCurrency(order.total)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <StatusBadge status={order.status} />
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <div className='flex justify-end space-x-2'>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            viewOrderDetails(order.id);
                          }}
                          className='text-indigo-600 hover:text-indigo-900'
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteOrder(order.id);
                          }}
                          className='text-red-600 hover:text-red-900'
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan='7' className='px-6 py-4'>
                    <EmptyState message='Không tìm thấy đơn hàng phù hợp' />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='px-6 py-3 flex items-center justify-between border-t border-gray-200'>
            <div className='flex-1 flex justify-between sm:hidden'>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Trước
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Sau
              </button>
            </div>
            <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
              <div>
                <p className='text-sm text-gray-700'>
                  Hiển thị{' '}
                  <span className='font-medium'>{filteredOrders.length}</span>{' '}
                  đơn hàng
                </p>
              </div>
              <div>
                <nav
                  className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'
                  aria-label='Pagination'
                >
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    &laquo;
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-red-50 border-red-500 text-red-600'
                            : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    &raquo;
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {showOrderDetail && selectedOrder && (
          <motion.div
            className='fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowOrderDetail(false)}
          >
            <motion.div
              className='bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto'
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className='p-6 border-b border-gray-100'>
                <div className='flex justify-between items-start'>
                  <div>
                    <h2 className='text-xl font-bold text-gray-800'>
                      Chi tiết đơn hàng #
                      {selectedOrder.id.toString().substring(0, 8)}
                    </h2>
                    <p className='text-sm text-gray-500 mt-1'>
                      Ngày đặt:{' '}
                      {new Date(selectedOrder.order_date).toLocaleDateString(
                        'vi-VN'
                      )}
                    </p>
                  </div>
                  <StatusBadge status={selectedOrder.status} />
                </div>
              </div>

              <div className='p-6 space-y-6'>
                <div>
                  <h3 className='text-base font-medium text-gray-800 mb-2'>
                    Thông tin khách hàng
                  </h3>
                  <div className='bg-gray-50 p-4 rounded-lg'>
                    <p>
                      <span className='font-medium'>Họ tên:</span>{' '}
                      {selectedOrder.customer_name}
                    </p>
                    <p>
                      <span className='font-medium'>Giới tính:</span>{' '}
                      {selectedOrder.gender === 'male'
                        ? 'Nam'
                        : selectedOrder.gender === 'female'
                        ? 'Nữ'
                        : 'Khác'}
                    </p>
                    <p>
                      <span className='font-medium'>Số điện thoại:</span>{' '}
                      {selectedOrder.phone}
                    </p>
                    {selectedOrder.address && (
                      <p>
                        <span className='font-medium'>Địa chỉ:</span>{' '}
                        {selectedOrder.address.street},{' '}
                        {selectedOrder.address.ward},{' '}
                        {selectedOrder.address.district},{' '}
                        {selectedOrder.address.city}
                      </p>
                    )}
                    {selectedOrder.address?.note && (
                      <p>
                        <span className='font-medium'>Ghi chú:</span>{' '}
                        {selectedOrder.address.note}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className='text-base font-medium text-gray-800 mb-2'>
                    Sản phẩm
                  </h3>
                  <div className='bg-gray-50 p-4 rounded-lg space-y-3'>
                    {selectedOrder.product_info && (
                      <div className='flex justify-between items-center border-b border-gray-200 pb-2'>
                        <div className='flex items-center'>
                          {selectedOrder.product_info.image && (
                            <img
                              src={selectedOrder.product_info.image}
                              alt={selectedOrder.product_info.title}
                              className='w-16 h-16 object-cover rounded mr-3'
                            />
                          )}
                          <div>
                            <p className='font-medium'>
                              {selectedOrder.product_info.title}
                            </p>
                            <p className='text-sm text-gray-500'>
                              Số lượng:{' '}
                              {selectedOrder.product_info.quantity || 1}
                            </p>
                          </div>
                        </div>
                        <p className='font-medium'>
                          {formatCurrency(selectedOrder.product_info.price)}
                        </p>
                      </div>
                    )}

                    <div className='flex justify-between items-center pt-2'>
                      <p className='text-sm'>Tổng tiền sản phẩm:</p>
                      <p className='font-medium'>
                        {formatCurrency(selectedOrder.product_price)}
                      </p>
                    </div>

                    <div className='flex justify-between items-center'>
                      <p className='text-sm'>Phí vận chuyển:</p>
                      <p className='font-medium'>
                        {formatCurrency(selectedOrder.shipping_fee)}
                      </p>
                    </div>

                    {selectedOrder.discount > 0 && (
                      <div className='flex justify-between items-center'>
                        <p className='text-sm'>Giảm giá:</p>
                        <p className='font-medium text-red-600'>
                          -{formatCurrency(selectedOrder.discount)}
                        </p>
                      </div>
                    )}

                    <div className='flex justify-between items-center pt-2 border-t border-gray-200'>
                      <p className='font-bold'>Tổng cộng:</p>
                      <p className='font-bold text-red-600'>
                        {formatCurrency(selectedOrder.total)}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className='text-base font-medium text-gray-800 mb-2'>
                    Thông tin vận chuyển
                  </h3>
                  <div className='bg-gray-50 p-4 rounded-lg'>
                    <p>
                      <span className='font-medium'>
                        Phương thức vận chuyển:
                      </span>{' '}
                      {selectedOrder.shipping_method === 'standard'
                        ? 'Tiêu chuẩn'
                        : 'Nhanh'}
                    </p>
                    <p>
                      <span className='font-medium'>
                        Phương thức thanh toán:
                      </span>{' '}
                      {selectedOrder.payment_method === 'cod'
                        ? 'Thanh toán khi nhận hàng'
                        : 'Chuyển khoản ngân hàng'}
                    </p>
                  </div>
                </div>

                <div className='flex justify-between pt-4'>
                  <button
                    className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50'
                    onClick={() => setShowOrderDetail(false)}
                  >
                    Đóng
                  </button>

                  <div className='space-x-3'>
                    <button
                      className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateInvoice(selectedOrder);
                      }}
                      disabled={isGeneratingInvoice}
                    >
                      <FiPrinter className='mr-2' />
                      {isGeneratingInvoice ? 'Đang tạo...' : 'Xuất hóa đơn PDF'}
                    </button>
                    <select
                      className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700'
                      value={selectedOrder.status}
                      onChange={(e) =>
                        handleStatusUpdate(selectedOrder.id, e.target.value)
                      }
                    >
                      <option value='pending'>Chờ xử lý</option>
                      <option value='processing'>Đang xử lý</option>
                      <option value='shipped'>Đang vận chuyển</option>
                      <option value='delivered'>Đã giao hàng</option>
                      <option value='cancelled'>Đã hủy</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OrderManager;
