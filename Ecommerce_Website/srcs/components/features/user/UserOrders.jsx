import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coreApi } from "@/components/services/api";
import Spinner from "@/components/ui/Spinner";
import { formatCurrency } from "@/utils/format";
import { useState } from "react";
import { motion } from "framer-motion";
import { FaShoppingBag, FaBoxOpen, FaShippingFast, FaCheck, FaTimes, FaMoneyBill, FaHistory, FaInfoCircle, FaChevronLeft, FaChevronRight, FaSearch, FaMapMarkerAlt, FaReceipt } from "react-icons/fa";
import { toast } from "react-hot-toast";

const STATUS_LABELS = {
  all:        "Tất cả",
  pending:    "Chờ xác nhận",
  processing: "Đang xử lý",
  shipped:    "Đang giao hàng",
  delivered:  "Hoàn thành",
  cancelled:  "Đã hủy",
  refunded:   "Đã hoàn tiền",
};

const STATUS_ICONS = {
  pending:    <FaShoppingBag className="mr-2" />,
  processing: <FaMoneyBill className="mr-2" />,
  shipped:    <FaShippingFast className="mr-2" />,
  delivered:  <FaCheck className="mr-2" />,
  cancelled:  <FaTimes className="mr-2" />,
  refunded:   <FaHistory className="mr-2" />,
};

const STATUS_COLORS = {
  pending:    "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped:    "bg-indigo-100 text-indigo-800",
  delivered:  "bg-green-100 text-green-800",
  cancelled:  "bg-gray-200 text-gray-600",
  refunded:   "bg-red-100 text-red-800",
};

function UserOrders() {
  const [status, setStatus]               = useState("all");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const queryClient                       = useQueryClient();
  const [currentPage, setCurrentPage]     = useState(1);
  const ordersPerPage                     = 5;
  const [searchTerm, setSearchTerm]       = useState("");
  const [statusUpdates, setStatusUpdates] = useState({});

  const { data: orders, isLoading } = useQuery({
    queryKey: ["user-orders"],
    queryFn: async () => {
      try {
        const { data } = await coreApi.get('/orders/mine', { params: { limit: 500 } });
        return data.data?.orders || [];
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId) => {
      await coreApi.patch(`/orders/${orderId}/status`, { status: 'cancelled' });
      return orderId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-orders"] });
      toast.success("Đơn hàng đã được hủy thành công!");
      setSelectedOrderId(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Không thể hủy đơn hàng. Vui lòng thử lại sau.");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }) => {
      await coreApi.patch(`/orders/${orderId}/status`, { status: newStatus });
      return { orderId, newStatus };
    },
    onSuccess: ({ newStatus }) => {
      queryClient.invalidateQueries({ queryKey: ["user-orders"] });
      toast.success(`Trạng thái đơn hàng đã được cập nhật thành ${STATUS_LABELS[newStatus] || newStatus}!`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau.");
    },
  });

  const handleCancelOrder = (orderId) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
      cancelOrderMutation.mutate(orderId);
    }
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    updateStatusMutation.mutate({ orderId, newStatus });
  };

  const handleStatusChange = (orderId, newStatus) => {
    setStatusUpdates(prev => ({ ...prev, [orderId]: newStatus }));
  };

  const viewOrderDetails = (orderId) => {
    setSelectedOrderId(orderId === selectedOrderId ? null : orderId);
  };

  const handleFilterChange = (newStatus) => {
    setStatus(newStatus);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredOrders = orders
    ? orders
        .filter(order => status === "all" || order.status === status)
        .filter(order => {
          const q = searchTerm.toLowerCase().trim();
          if (!q) return true;
          return String(order.id).toLowerCase().includes(q);
        })
    : [];

  const indexOfLastOrder  = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders     = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages        = Math.ceil(filteredOrders.length / ordersPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(p => p + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(p => p - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6 text-white">
        <h2 className="text-2xl font-bold flex items-center">
          <FaBoxOpen className="mr-3" /> Quản lý đơn hàng
        </h2>
        <p className="text-red-100 mt-1">Theo dõi và quản lý các đơn hàng của bạn</p>
      </div>

      <div className="px-8 pt-6 pb-4">
        {/* Search bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn hàng..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 focus:border-red-400 focus:ring focus:ring-red-100 focus:outline-none transition-all"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FaSearch />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-3 mb-6">
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-5 py-2.5 rounded-full border-2 text-sm font-medium transition-all duration-200 ${
                status === key
                  ? "bg-red-600 text-white border-red-600 shadow-md"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
              onClick={() => handleFilterChange(key)}
            >
              {label}
            </motion.button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-20 h-20 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center text-red-400 text-3xl">
              <FaBoxOpen />
            </div>
            <h3 className="text-gray-500 text-lg font-medium">
              {searchTerm ? "Không tìm thấy đơn hàng phù hợp" : "Không có đơn hàng nào"}
            </h3>
            <p className="text-gray-400 mt-2">
              {searchTerm
                ? "Vui lòng thử lại với từ khóa khác"
                : "Các đơn hàng của bạn sẽ xuất hiện ở đây"}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-6 pb-4">
              {currentOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="text-gray-400 text-sm mr-2">Mã đơn hàng:</span>
                        <span className="font-semibold text-gray-700">#{order.id}</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Ngày đặt: {new Date(order.order_date || order.created_at).toLocaleDateString("vi-VN", {
                          year: 'numeric', month: 'numeric', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>

                    <div className="md:text-right">
                      <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-medium ${
                        STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"
                      }`}>
                        {STATUS_ICONS[order.status] || <FaInfoCircle className="mr-2" />}
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order timeline */}
                  {order.status !== 'cancelled' && order.status !== 'refunded' && (
                    <div className="mt-4 mb-4">
                      <div className="flex items-center w-full">
                        <div className={`h-2 flex-grow rounded-full flex ${
                          order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-200'
                        }`}>
                          <div className={`h-full rounded-full ${
                            order.status === 'pending'    ? 'w-1/4 bg-yellow-500' :
                            order.status === 'processing' ? 'w-2/4 bg-blue-500' :
                            order.status === 'shipped'    ? 'w-3/4 bg-indigo-500' :
                            ''
                          }`} />
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                        <span>Đặt hàng</span>
                        <span>Xác nhận</span>
                        <span>Giao hàng</span>
                        <span>Hoàn thành</span>
                      </div>
                    </div>
                  )}

                  {/* Product preview */}
                  {order.items?.length > 0 && (
                    <div className="mt-6 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-indigo-50 opacity-50 rounded-2xl" />
                      <div className="relative p-5 rounded-2xl border border-gray-200 shadow-lg backdrop-blur-sm">
                        <h4 className="text-base font-semibold text-gray-800 mb-5 flex items-center">
                          <span className="bg-red-500 w-6 h-6 rounded-full flex items-center justify-center mr-3 shadow-md">
                            <FaShoppingBag className="text-white text-xs" />
                          </span>
                          Sản phẩm đã mua
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          {order.items.slice(0, 3).map((item, i) => {
                            const imageUrl = item.image_url || item.product_image;
                            return (
                            <div key={i} className="group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white border border-gray-100 transform hover:-translate-y-1">
                              <div className="relative w-full h-44 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={item.product_name}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22200%22%20viewBox%3D%220%200%20300%20200%22%3E%3Crect%20width%3D%22300%22%20height%3D%22200%22%20fill%3D%22%23f3f4f6%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20fill%3D%22%239ca3af%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E';
                                    }}
                                    className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <FaShoppingBag className="text-gray-300 text-4xl" />
                                  </div>
                                )}
                                <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                  SL: {item.quantity}
                                </div>
                              </div>
                              <div className="p-4">
                                <h5 className="font-medium text-gray-900 text-base mb-1 line-clamp-1 group-hover:text-red-600 transition-colors duration-300">
                                  {item.product_name}
                                </h5>
                                <div className="flex justify-between items-center mt-2">
                                  <div className="text-xs text-gray-500">
                                    Đơn giá: {formatCurrency(item.price || 0)}
                                  </div>
                                  <div className="text-sm font-bold text-red-600">
                                    {formatCurrency((item.price || 0) * item.quantity)}
                                  </div>
                                </div>
                              </div>
                            </div>
                            );
                          })}

                          {order.items.length > 3 && (
                            <div className="flex flex-col items-center justify-center rounded-xl shadow-inner bg-gradient-to-br from-indigo-50 to-red-50 border border-gray-200 hover:shadow-md transition-all duration-300 p-5">
                              <span className="text-2xl font-bold text-red-500 mb-2">+{order.items.length - 3}</span>
                              <span className="text-sm text-gray-600">sản phẩm khác</span>
                              <div className="mt-3">
                                <button
                                  onClick={() => viewOrderDetails(order.id)}
                                  className="bg-white text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                                >
                                  Xem tất cả
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="h-px bg-gray-100 my-4" />

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="text-sm text-gray-700 mb-2 sm:mb-0">
                      <span className="bg-red-50 text-red-700 px-2.5 py-1 rounded-lg font-medium">
                        {order.items?.length || 0} sản phẩm
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500 block sm:inline">Tổng tiền:</span>
                      <span className="text-xl font-bold text-red-600 ml-2">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>

                  {/* Expanded order detail */}
                  {selectedOrderId === order.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6 rounded-2xl overflow-hidden bg-white shadow-xl border border-gray-200"
                    >
                      <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-4 text-white">
                        <h4 className="font-bold text-xl flex items-center">
                          <FaInfoCircle className="mr-3" /> Chi tiết đơn hàng #{order.id}
                        </h4>
                        <p className="text-white text-opacity-80 text-sm mt-1">
                          Đặt hàng: {new Date(order.order_date || order.created_at).toLocaleDateString("vi-VN", {
                            year: 'numeric', month: 'long', day: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>

                      <div className="p-6">
                        <div className="space-y-6">
                          {order.items?.length > 0 ? order.items.map((item, index) => {
                            const imageUrl = item.image_url || item.product_image;
                            return (
                            <div key={index} className="flex flex-col sm:flex-row gap-5 bg-white rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
                              <div className="sm:w-1/4">
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl h-48 flex items-center justify-center p-4 overflow-hidden shadow-inner">
                                  {imageUrl ? (
                                    <img 
                                      src={imageUrl} 
                                      alt={item.product_name} 
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22200%22%20viewBox%3D%220%200%20300%20200%22%3E%3Crect%20width%3D%22300%22%20height%3D%22200%22%20fill%3D%22%23f3f4f6%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20fill%3D%22%239ca3af%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E';
                                      }}
                                      className="max-w-full max-h-full object-contain" 
                                    />
                                  ) : (
                                    <FaShoppingBag className="text-gray-300 text-5xl" />
                                  )}
                                </div>
                              </div>

                              <div className="sm:w-2/4">
                                <h5 className="text-lg font-bold text-gray-900 mb-3">{item.product_name}</h5>
                              </div>

                              <div className="sm:w-1/4 bg-gray-50 rounded-xl p-4 flex flex-col justify-between">
                                <div>
                                  <div className="text-sm font-medium text-gray-500 mb-1">Đơn giá:</div>
                                  <div className="text-base font-bold text-gray-800">{formatCurrency(item.price || 0)}</div>
                                  <div className="text-sm font-medium text-gray-500 mt-3 mb-1">Số lượng:</div>
                                  <div className="text-base font-bold text-gray-800">{item.quantity}</div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <div className="text-sm font-medium text-gray-500 mb-1">Thành tiền:</div>
                                  <div className="text-2xl font-bold text-red-600">{formatCurrency((item.price || 0) * item.quantity)}</div>
                                </div>
                              </div>
                            </div>
                            );
                          }) : (
                            <p className="text-gray-400 text-center py-4">Không có thông tin sản phẩm</p>
                          )}
                        </div>

                        {/* Info Boxes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                          <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 text-white">
                              <h5 className="font-semibold flex items-center">
                                <FaMapMarkerAlt className="mr-2" /> Thông tin giao hàng
                              </h5>
                            </div>
                            <div className="p-4">
                              <div className="grid grid-cols-1 gap-4">
                                <div className="bg-blue-50 rounded-lg p-3">
                                  <div className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">Người nhận:</div>
                                  <div className="text-base font-semibold text-gray-800">{order.customer_name}</div>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-3">
                                  <div className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">Số điện thoại:</div>
                                  <div className="text-base font-semibold text-gray-800">{order.phone}</div>
                                </div>
                                {order.address && (
                                  <div className="bg-blue-50 rounded-lg p-3">
                                    <div className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">Địa chỉ giao hàng:</div>
                                    <div className="text-sm text-gray-700 whitespace-pre-line">
                                      {typeof order.address === 'string'
                                        ? order.address
                                        : order.address.full_address || JSON.stringify(order.address)}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
                            <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 text-white">
                              <h5 className="font-semibold flex items-center">
                                <FaReceipt className="mr-2" /> Thông tin thanh toán
                              </h5>
                            </div>
                            <div className="p-4">
                              <div className="grid grid-cols-1 gap-4">
                                <div className="bg-green-50 rounded-lg p-3">
                                  <div className="text-xs text-green-600 font-medium uppercase tracking-wide mb-1">Phương thức vận chuyển:</div>
                                  <div className="text-base font-semibold text-gray-800 flex items-center">
                                    <FaShippingFast className="mr-2 text-green-500" /> {order.shipping_method}
                                  </div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-3">
                                  <div className="text-xs text-green-600 font-medium uppercase tracking-wide mb-1">Phương thức thanh toán:</div>
                                  <div className="text-base font-semibold text-gray-800 flex items-center">
                                    <FaMoneyBill className="mr-2 text-green-500" /> {order.payment_method}
                                  </div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-3">
                                  <div className="text-xs text-green-600 font-medium uppercase tracking-wide mb-1">Trạng thái đơn hàng:</div>
                                  <div className="mt-1">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                      STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"
                                    }`}>
                                      {STATUS_ICONS[order.status] || <FaInfoCircle className="mr-2" />}
                                      {STATUS_LABELS[order.status] || order.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Order summary */}
                        <div className="mt-8">
                          <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3 text-white">
                              <h5 className="font-semibold flex items-center">
                                <FaReceipt className="mr-2" /> Tổng hợp đơn hàng
                              </h5>
                            </div>
                            <div className="p-4">
                              <div className="space-y-0 divide-y divide-gray-100">
                                <div className="flex justify-between py-3">
                                  <span className="text-gray-600">Tạm tính:</span>
                                  <span className="text-gray-800 font-semibold">{formatCurrency(order.product_price || 0)}</span>
                                </div>
                                <div className="flex justify-between py-3">
                                  <span className="text-gray-600">Phí vận chuyển:</span>
                                  <span className="text-gray-800 font-semibold">{formatCurrency(order.shipping_fee || 0)}</span>
                                </div>
                                {order.discount > 0 && (
                                  <div className="flex justify-between py-3">
                                    <span className="text-gray-600">Giảm giá:</span>
                                    <span className="text-green-600 font-semibold">-{formatCurrency(order.discount)}</span>
                                  </div>
                                )}
                                {order.discount_code && (
                                  <div className="flex justify-between py-3">
                                    <span className="text-gray-600">Mã giảm giá:</span>
                                    <span className="text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">{order.discount_code}</span>
                                  </div>
                                )}
                                <div className="flex justify-between py-4">
                                  <span className="text-lg font-bold text-gray-800">Tổng cộng:</span>
                                  <span className="text-2xl font-bold text-red-600">{formatCurrency(order.total)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="mt-5 flex justify-end gap-3">
                    {(order.status === 'pending' || order.status === 'processing') && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="border border-red-500 text-red-600 px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-red-50"
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancelOrderMutation.isPending}
                      >
                        {cancelOrderMutation.isPending && cancelOrderMutation.variables === order.id
                          ? <span className="flex items-center"><div className="w-3 h-3 border-t-2 border-red-500 border-r-2 rounded-full animate-spin mr-2" />Đang hủy...</span>
                          : "Hủy đơn"
                        }
                      </motion.button>
                    )}

                    <div className="flex items-center gap-2 mr-auto">
                      {/* Xoá dropdown cập nhật trạng thái vì user thường không được đổi status */}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`${
                        selectedOrderId === order.id
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow hover:shadow-lg"
                      } px-6 py-2.5 rounded-lg text-sm font-medium transition-all`}
                      onClick={() => viewOrderDetails(order.id)}
                    >
                      {selectedOrderId === order.id ? "Ẩn chi tiết" : "Xem chi tiết"}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`flex items-center px-4 py-2 rounded-md ${
                    currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-red-600 hover:bg-red-50"
                  }`}
                >
                  <FaChevronLeft className="mr-2" /> Trang trước
                </button>

                <div className="text-sm text-gray-600">
                  Trang {currentPage} / {totalPages}
                  <span className="hidden sm:inline"> ({filteredOrders.length} đơn hàng)</span>
                </div>

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`flex items-center px-4 py-2 rounded-md ${
                    currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-red-600 hover:bg-red-50"
                  }`}
                >
                  Trang tiếp <FaChevronRight className="ml-2" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default UserOrders;
