import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/components/services/supabase";
import Spinner from "@/components/ui/Spinner";
import { formatCurrency } from "@/utils/format";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaHistory, FaShoppingBag, FaBoxOpen, FaCheckCircle, FaMapMarkerAlt, FaTruck, FaCalendarAlt, FaReceipt, FaInfoCircle, FaTimes, FaExchangeAlt, FaChevronLeft, FaChevronRight, FaSearch, FaShippingFast, FaMoneyBill } from "react-icons/fa";
import { toast } from "react-hot-toast";

const HISTORY_STATUS_FILTERS = {
  all: "Tất cả",
  completed: "Đã hoàn thành",
  cancelled: "Đã hủy",
  refunded: "Đã hoàn tiền"
};

const DELIVERY_STATUS = {
  pending: "Đang chuẩn bị",
  shipping: "Đang vận chuyển",
  delivered: "Đã giao hàng thành công",
  returned: "Đã hoàn trả",
  cancelled: "Đã hủy"
};

const STATUS_COLORS = {
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-200 text-gray-600",
  refunded: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
  shipping: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  returned: "bg-amber-100 text-amber-800"
};

const STATUS_ICONS = {
  completed: <FaCheckCircle className="mr-2" />,
  cancelled: <FaTimes className="mr-2" />,
  refunded: <FaExchangeAlt className="mr-2" />,
  pending: <FaShoppingBag className="mr-2" />,
  shipping: <FaTruck className="mr-2" />,
  delivered: <FaCheckCircle className="mr-2" />,
  returned: <FaExchangeAlt className="mr-2" />
};

function UserHistory() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;
  const [searchTerm, setSearchTerm] = useState("");
  const [productDetails, setProductDetails] = useState({});
  const [statusUpdates, setStatusUpdates] = useState({});
  
  const { data: orders, isLoading } = useQuery({
    queryKey: ["user-history"],
    queryFn: async () => {
      try {
        // Get completed, cancelled, or refunded orders without filtering by user_id
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select("*")
          .in("status", ["completed", "cancelled", "refunded"])
          .order("order_date", { ascending: false });
          
        if (ordersError) {
          console.error("Error fetching history orders:", ordersError);
          return [];
        }
        
        if (!ordersData || ordersData.length === 0) {
          return [];
        }
        
        // For each order, get its items from order_items table
        const ordersWithItems = await Promise.all(ordersData.map(async (order) => {
          const { data: itemsData, error: itemsError } = await supabase
            .from("order_items")
            .select("*, products(*)")
            .eq("order_id", order.id);
            
          if (itemsError) {
            console.error("Error fetching order items:", itemsError);
            return {
              ...order,
              items: order.product_info ? [order.product_info] : [],
              subtotal: order.product_price || 0,
              total_amount: order.total || 0
            };
          }
          
          // Map order items with product details
          let items = [];
          if (itemsData && itemsData.length > 0) {
            items = itemsData.map(item => {
              // Use product info from products table if available
              const product = item.products || {};
              return {
                id: item.id,
                product_id: item.product_id,
                product_name: item.product_name || product.name || product.title || "Sản phẩm",
                price: item.price,
                quantity: item.quantity || 1,
                image_url: item.image_url || product.image_url || product.image,
                description: product.description || "",
                brand: product.brand || "",
                category: product.category || "",
                specs: product.specs || {}
              };
            });
          } else if (order.product_info) {
            // If no items found but order has product_info, use that
            items = [{
              id: order.product_info.id || 'default-id',
              product_id: order.product_info.id || 'default-id',
              product_name: order.product_info.title || "Sản phẩm",
              price: typeof order.product_info.price === 'string' ? 
                parseInt(order.product_info.price.replace(/[^\d]/g, '')) : order.product_info.price,
              quantity: order.product_info.quantity || 1,
              image_url: order.product_info.image || null,
              description: "",
              brand: "",
              category: "",
              specs: {}
            }];
          }
          
          return {
            ...order,
            items: items,
            subtotal: order.product_price || 0,
            total_amount: order.total || 0
          };
        }));
        
        return ordersWithItems;
      } catch (error) {
        console.error("Error fetching history orders:", error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Fetch additional product details when an order is selected
  useEffect(() => {
    if (selectedOrderId && orders) {
      const selectedOrder = orders.find(order => order.id === selectedOrderId);
      console.log('Selected order (history):', selectedOrder);
      if (selectedOrder && selectedOrder.items && selectedOrder.items.length > 0) {
        // Fetch detailed product information for each product in the order
        selectedOrder.items.forEach(async (item) => {
          console.log('Item details (history):', item);
          console.log('Image URL sources (history):', {
            itemImageUrl: item.image_url,
            productInfoImage: selectedOrder.product_info?.image,
          });
          
          if (item.product_id && !productDetails[item.product_id]) {
            try {
              // Try to get product details from various product tables
              const { data, error } = await supabase
                .from("products")
                .select("*")
                .eq("id", item.product_id)
                .single();
                
              if (!error && data) {
                console.log('Found product in products table (history):', data);
                setProductDetails(prev => ({
                  ...prev,
                  [item.product_id]: data
                }));
              } else {
                console.log("Product not found in main products table (history), trying other tables");
                // Try laptop table as fallback
                const { data: laptopData, error: laptopError } = await supabase
                  .from("laptop")
                  .select("*")
                  .eq("id", item.product_id)
                  .single();
                  
                if (!laptopError && laptopData) {
                  console.log('Found product in laptop table (history):', laptopData);
                  setProductDetails(prev => ({
                    ...prev,
                    [item.product_id]: {
                      ...laptopData,
                      image: laptopData.image || laptopData.image_url
                    }
                  }));
                }
              }
            } catch (err) {
              console.error("Error fetching product details (history):", err);
            }
          }
        });
      }
    }
  }, [selectedOrderId, orders]);

  // Add special case for direct product info
  useEffect(() => {
    if (orders && orders.length > 0) {
      // Check all orders for direct product_info
      orders.forEach(order => {
        if (order.product_info && order.product_info.id && !productDetails[order.product_info.id]) {
          console.log('Found direct product_info (history):', order.product_info);
          setProductDetails(prev => ({
            ...prev,
            [order.product_info.id]: {
              id: order.product_info.id,
              name: order.product_info.title,
              title: order.product_info.title,
              image: order.product_info.image,
              price: order.product_info.price,
              description: order.product_info.description || ""
            }
          }));
        }
      });
    }
  }, [orders]);

  // Filter orders based on selected status and search term
  const filteredOrders = orders
    ? orders
        .filter(order => statusFilter === "all" || order.status === statusFilter)
        .filter(order => {
          const searchLowerCase = searchTerm.toLowerCase().trim();
          if (!searchLowerCase) return true;
          
          // Search by order ID
          return order.id.toString().toLowerCase().includes(searchLowerCase);
        })
    : [];

  // Get current orders for pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders?.slice(indexOfFirstOrder, indexOfLastOrder) || [];
  const totalPages = filteredOrders ? Math.ceil(filteredOrders.length / ordersPerPage) : 0;

  // Change page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Reset to first page when changing filter
  const handleFilterChange = (newFilter) => {
    setStatusFilter(newFilter);
    setCurrentPage(1);
  };

  // Handle order selection for details view
  const handleViewOrderDetails = (orderId) => {
    setSelectedOrderId(orderId === selectedOrderId ? null : orderId);
  };

  // Handle search change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Mutation for updating order status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }) => {
      try {
        // Update order status in database
        const { error } = await supabase
          .from("orders")
          .update({ 
            status: newStatus, 
            created_at: new Date().toISOString() 
          })
          .eq("id", orderId);
        
        if (error) {
          console.error("Error updating order status:", error);
          throw error;
        }
        return { orderId, newStatus };
      } catch (err) {
        console.error("Error in update status mutation:", err);
        throw err;
      }
    },
    onSuccess: ({ orderId, newStatus }) => {
      // Update local cache
      queryClient.setQueryData(["user-history"], (oldData) => {
        if (!oldData) return [];
        return oldData.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus } 
            : order
        );
      });
      
      toast.success(`Trạng thái đơn hàng đã được cập nhật thành ${HISTORY_STATUS_FILTERS[newStatus] || newStatus}!`);
    },
    onError: (error) => {
      console.error("Error updating order status:", error);
      toast.error("Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau.");
    },
  });

  // Handle order status update
  const handleUpdateStatus = (orderId, newStatus) => {
    updateStatusMutation.mutate({ orderId, newStatus });
  };

  // Handle status change in dropdown
  const handleStatusChange = (orderId, newStatus) => {
    setStatusUpdates(prev => ({
      ...prev,
      [orderId]: newStatus
    }));
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6 text-white">
        <h2 className="text-2xl font-bold flex items-center">
          <FaHistory className="mr-3" /> Lịch sử mua hàng
        </h2>
        <p className="text-red-100 mt-1">Các đơn hàng đã hoàn thành, hủy hoặc hoàn tiền</p>
      </div>
      
      <div className="p-8">
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
          {Object.entries(HISTORY_STATUS_FILTERS).map(([key, label]) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-5 py-2.5 rounded-full border-2 text-sm font-medium transition-all duration-200 ${
                statusFilter === key
                  ? "bg-red-600 text-white border-red-600 shadow-md"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
              onClick={() => handleFilterChange(key)}
            >
              {label}
            </motion.button>
          ))}
        </div>
        
        {!filteredOrders || filteredOrders.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-20 h-20 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center text-red-400 text-3xl">
              <FaBoxOpen />
            </div>
            <h3 className="text-gray-500 text-lg font-medium">
              {searchTerm ? "Không tìm thấy đơn hàng phù hợp" : "Bạn chưa có đơn hàng nào trong mục này"}
            </h3>
            <p className="text-gray-400 mt-2">
              {searchTerm 
                ? "Vui lòng thử lại với từ khóa khác" 
                : "Đơn hàng khi hoàn thành hoặc hủy sẽ được hiển thị ở đây"}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {currentOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.3 }}
                  className={`border ${order.status === 'completed' ? 'border-green-200' : 
                               order.status === 'cancelled' ? 'border-gray-200' : 
                               'border-red-200'} rounded-xl p-5 hover:shadow-md transition-all duration-300`}
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="text-gray-400 text-sm mr-2">Mã đơn hàng:</span>
                        <span className="font-semibold text-gray-700">#{order.id}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <FaCalendarAlt className="mr-2 text-gray-400" />
                        <span>
                          Ngày mua: {new Date(order.order_date).toLocaleDateString("vi-VN", {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {order.created_at && (
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <FaHistory className="mr-2 text-gray-400" />
                          <span>
                            Cập nhật: {new Date(order.created_at).toLocaleDateString("vi-VN", {
                              year: 'numeric',
                              month: 'numeric',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="md:text-right">
                      <span
                        className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-medium ${
                          STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {STATUS_ICONS[order.status] || <FaInfoCircle className="mr-2" />}
                        {HISTORY_STATUS_FILTERS[order.status] || order.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Product preview - improved display */}
                  {(order.items?.length > 0 || order.product_info) && (
                    <div className="mt-6 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-red-50 opacity-50 rounded-2xl"></div>
                      <div className="relative p-5 rounded-2xl border border-gray-200 shadow-lg backdrop-blur-sm">
                        <h4 className="text-base font-semibold text-gray-800 mb-5 flex items-center">
                          <span className="bg-red-500 w-6 h-6 rounded-full flex items-center justify-center mr-3 shadow-md">
                            <FaShoppingBag className="text-white text-xs" />
                          </span>
                          Sản phẩm đã mua
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          {order.items && order.items.length > 0 ? (
                            // Map items if they exist
                            order.items.slice(0, 3).map((item, i) => {
                              // Get image URL from multiple possible sources
                              const imageUrl = item.image_url || 
                                            (productDetails[item.product_id] && productDetails[item.product_id].image) || 
                                            (order.product_info && order.product_info.image) || 
                                            null;
                              
                              return (
                                <div key={i} className="group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white border border-gray-100 transform hover:-translate-y-1">
                                  {/* Product image - much larger */}
                                  <div className="relative w-full h-44 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                                    {imageUrl ? (
                                      <img 
                                        src={imageUrl} 
                                        alt={item.product_name} 
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
                                  
                                  {/* Product info */}
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
                            })
                          ) : order.product_info ? (
                            // If no items but has product_info, show that directly
                            <div className="group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white border border-gray-100 transform hover:-translate-y-1">
                              {/* Product image - much larger */}
                              <div className="relative w-full h-44 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                                {order.product_info.image ? (
                                  <img 
                                    src={order.product_info.image} 
                                    alt={order.product_info.title} 
                                    className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110" 
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <FaShoppingBag className="text-gray-300 text-4xl" />
                                  </div>
                                )}
                                <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                  SL: {order.product_info.quantity || 1}
                                </div>
                              </div>
                              
                              {/* Product info */}
                              <div className="p-4">
                                <h5 className="font-medium text-gray-900 text-base mb-1 line-clamp-1 group-hover:text-red-600 transition-colors duration-300">
                                  {order.product_info.title || "Sản phẩm"}
                                </h5>
                                <div className="flex justify-between items-center mt-2">
                                  <div className="text-xs text-gray-500">
                                    Đơn giá: {formatCurrency(order.product_info.price || 0)}
                                  </div>
                                  <div className="text-sm font-bold text-red-600">
                                    {formatCurrency((order.product_info.price || 0) * (order.product_info.quantity || 1))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : null}
                          
                          {order.items && order.items.length > 3 && (
                            <div className="flex flex-col items-center justify-center rounded-xl shadow-inner bg-gradient-to-br from-purple-50 to-red-50 border border-gray-200 hover:shadow-md transition-all duration-300 p-5">
                              <span className="text-2xl font-bold text-red-500 mb-2">+{order.items.length - 3}</span>
                              <span className="text-sm text-gray-600">sản phẩm khác</span>
                              <div className="mt-3">
                                <button className="bg-white text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
                                  Xem tất cả
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Order details (when expanded) */}
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
                          Mua ngày: {new Date(order.order_date).toLocaleDateString("vi-VN", { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      
                      <div className="p-6">
                        {/* Products detail - improved display */}
                        <div className="space-y-6">
                          {order.items && order.items.length > 0 ? (
                            // Map items if they exist
                            order.items.map((item, index) => {
                              // Get additional product details if available
                              const productDetail = productDetails[item.product_id] || {};
                              
                              // Get image URL from multiple possible sources
                              const imageUrl = item.image_url || 
                                             (productDetail && productDetail.image) || 
                                             (order.product_info && order.product_info.image) || 
                                             null;
                              
                              return (
                                <div key={index} className="flex flex-col sm:flex-row gap-5 bg-white rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
                                  {/* Product Image - Left Side */}
                                  <div className="sm:w-1/4">
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl h-48 flex items-center justify-center p-4 overflow-hidden shadow-inner">
                                      {imageUrl ? (
                                        <img src={imageUrl} alt={item.product_name} className="max-w-full max-h-full object-contain" />
                                      ) : (
                                        <FaShoppingBag className="text-gray-300 text-5xl" />
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Product Details - Middle */}
                                  <div className="sm:w-2/4">
                                    <h5 className="text-lg font-bold text-gray-900 mb-3">{item.product_name}</h5>
                                    
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                      {/* Product details with colored badges */}
                                      {productDetail.brand && (
                                        <div className="flex items-center">
                                          <span className="font-medium text-gray-700 mr-1">Thương hiệu:</span>
                                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">{productDetail.brand}</span>
                                        </div>
                                      )}
                                      
                                      {productDetail.category && (
                                        <div className="flex items-center">
                                          <span className="font-medium text-gray-700 mr-1">Danh mục:</span>
                                          <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs">{productDetail.category}</span>
                                        </div>
                                      )}
                                      
                                      {/* Additional product details */}
                                      {productDetail.cpu && (
                                        <div className="flex items-center">
                                          <span className="font-medium text-gray-700 mr-1">CPU:</span>
                                          <span className="text-gray-600">{productDetail.cpu}</span>
                                        </div>
                                      )}
                                      
                                      {productDetail.ram && (
                                        <div className="flex items-center">
                                          <span className="font-medium text-gray-700 mr-1">RAM:</span>
                                          <span className="text-gray-600">{productDetail.ram}</span>
                                        </div>
                                      )}
                                      
                                      {productDetail.storage && (
                                        <div className="flex items-center">
                                          <span className="font-medium text-gray-700 mr-1">Lưu trữ:</span>
                                          <span className="text-gray-600">{productDetail.storage}</span>
                                        </div>
                                      )}
                                      
                                      {productDetail.screen && (
                                        <div className="flex items-center">
                                          <span className="font-medium text-gray-700 mr-1">Màn hình:</span>
                                          <span className="text-gray-600">{productDetail.screen}</span>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Product specs if available */}
                                    {productDetail.specs && Object.keys(productDetail.specs).length > 0 && (
                                      <div className="mt-4 bg-gray-50 p-3 rounded-lg">
                                        <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Thông số kỹ thuật</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-700">
                                          {Object.entries(productDetail.specs).slice(0, 6).map(([key, value]) => (
                                            <div key={key} className="flex items-center py-1 border-b border-gray-100">
                                              <span className="text-red-500 mr-1">•</span> 
                                              <span className="font-medium">{key}:</span>
                                              <span className="ml-1">{value}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {item.description && (
                                      <div className="mt-3 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400">
                                        <p className="line-clamp-2">{item.description}</p>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Price Info - Right Side */}
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
                            })
                          ) : order.product_info ? (
                            // If no items but has product_info, show that directly
                            <div className="flex flex-col sm:flex-row gap-5 bg-white rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
                              {/* Product Image - Left Side */}
                              <div className="sm:w-1/4">
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl h-48 flex items-center justify-center p-4 overflow-hidden shadow-inner">
                                  {order.product_info.image ? (
                                    <img src={order.product_info.image} alt={order.product_info.title} className="max-w-full max-h-full object-contain" />
                                  ) : (
                                    <FaShoppingBag className="text-gray-300 text-5xl" />
                                  )}
                                </div>
                              </div>
                              
                              {/* Product Details - Middle */}
                              <div className="sm:w-2/4">
                                <h5 className="text-lg font-bold text-gray-900 mb-3">{order.product_info.title || "Sản phẩm"}</h5>
                                
                                {/* Additional product info if available */}
                                {order.product_info.description && (
                                  <div className="mt-3 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400">
                                    <p className="line-clamp-2">{order.product_info.description}</p>
                                  </div>
                                )}
                              </div>
                              
                              {/* Price Info - Right Side */}
                              <div className="sm:w-1/4 bg-gray-50 rounded-xl p-4 flex flex-col justify-between">
                                <div>
                                  <div className="text-sm font-medium text-gray-500 mb-1">Đơn giá:</div>
                                  <div className="text-base font-bold text-gray-800">{formatCurrency(order.product_info.price || 0)}</div>
                                  
                                  <div className="text-sm font-medium text-gray-500 mt-3 mb-1">Số lượng:</div>
                                  <div className="text-base font-bold text-gray-800">{order.product_info.quantity || 1}</div>
                                </div>
                                
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <div className="text-sm font-medium text-gray-500 mb-1">Thành tiền:</div>
                                  <div className="text-2xl font-bold text-red-600">
                                    {formatCurrency((order.product_info.price || 0) * (order.product_info.quantity || 1))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                        
                        {/* Info Boxes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                          {/* Customer & Shipping Information */}
                          <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3 text-white">
                              <h5 className="font-semibold flex items-center">
                                <FaMapMarkerAlt className="mr-2" /> Thông tin giao hàng
                              </h5>
                            </div>
                            <div className="p-4">
                              <div className="grid grid-cols-1 gap-4">
                                <div className="bg-purple-50 rounded-lg p-3">
                                  <div className="text-xs text-purple-600 font-medium uppercase tracking-wide mb-1">Người nhận:</div>
                                  <div className="text-base font-semibold text-gray-800">{order.customer_name}</div>
                                </div>
                                
                                <div className="bg-purple-50 rounded-lg p-3">
                                  <div className="text-xs text-purple-600 font-medium uppercase tracking-wide mb-1">Số điện thoại:</div>
                                  <div className="text-base font-semibold text-gray-800">{order.phone}</div>
                                </div>
                                
                                {order.address && (
                                  <div className="bg-purple-50 rounded-lg p-3">
                                    <div className="text-xs text-purple-600 font-medium uppercase tracking-wide mb-1">Địa chỉ giao hàng:</div>
                                    <div className="text-sm text-gray-700 whitespace-pre-line">
                                      {typeof order.address === 'string' ? order.address : 
                                        order.address.full_address ? order.address.full_address :
                                          JSON.stringify(order.address, null, 2)}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Payment & Shipping Method */}
                          <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
                            <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 text-white">
                              <h5 className="font-semibold flex items-center">
                                <FaReceipt className="mr-2" /> Thông tin thanh toán
                              </h5>
                            </div>
                            <div className="p-4">
                              <div className="grid grid-cols-1 gap-4">
                                <div className="bg-red-50 rounded-lg p-3">
                                  <div className="text-xs text-red-600 font-medium uppercase tracking-wide mb-1">Phương thức vận chuyển:</div>
                                  <div className="text-base font-semibold text-gray-800 flex items-center">
                                    <FaShippingFast className="mr-2 text-red-500" /> {order.shipping_method}
                                  </div>
                                </div>
                                
                                <div className="bg-red-50 rounded-lg p-3">
                                  <div className="text-xs text-red-600 font-medium uppercase tracking-wide mb-1">Phương thức thanh toán:</div>
                                  <div className="text-base font-semibold text-gray-800 flex items-center">
                                    <FaMoneyBill className="mr-2 text-red-500" /> {order.payment_method}
                                  </div>
                                </div>
                                
                                <div className="bg-red-50 rounded-lg p-3">
                                  <div className="text-xs text-red-600 font-medium uppercase tracking-wide mb-1">Trạng thái đơn hàng:</div>
                                  <div className="mt-1">
                                    <span
                                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                        STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {STATUS_ICONS[order.status] || <FaInfoCircle className="mr-2" />}
                                      {HISTORY_STATUS_FILTERS[order.status] || order.status}
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
                            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-3 text-white">
                              <h5 className="font-semibold flex items-center">
                                <FaReceipt className="mr-2" /> Chi tiết hóa đơn
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
                  
                  <div className="h-px bg-gray-100 my-4"></div>
                  
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
                  
                  <div className="mt-5 flex justify-end">
                    {/* Status update dropdown and button */}
                    <div className="flex items-center gap-2 mr-auto">
                      <select
                        value={statusUpdates[order.id] || order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="px-3 py-2.5 rounded-lg text-sm border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                      >
                        {Object.entries(HISTORY_STATUS_FILTERS)
                          .filter(([key]) => key !== 'all') // Exclude "all" option
                          .map(([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          ))}
                      </select>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`${
                          statusUpdates[order.id] && statusUpdates[order.id] !== order.status
                            ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        } px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm`}
                        onClick={() => {
                          if (statusUpdates[order.id] && statusUpdates[order.id] !== order.status) {
                            handleUpdateStatus(order.id, statusUpdates[order.id]);
                          }
                        }}
                        disabled={!statusUpdates[order.id] || statusUpdates[order.id] === order.status || updateStatusMutation.isLoading}
                      >
                        {updateStatusMutation.isLoading && updateStatusMutation.variables?.orderId === order.id ? (
                          <span className="flex items-center">
                            <div className="w-3 h-3 border-t-2 border-white border-r-2 rounded-full animate-spin mr-2"></div>
                            Đang cập nhật...
                          </span>
                        ) : (
                          "Cập nhật trạng thái"
                        )}
                      </motion.button>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                      whileTap={{ scale: 0.95 }}
                      className={`${
                        selectedOrderId === order.id
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow hover:shadow-lg"
                      } px-6 py-2.5 rounded-lg text-sm font-medium transition-all`}
                      onClick={() => handleViewOrderDetails(order.id)}
                    >
                      {selectedOrderId === order.id ? "Ẩn chi tiết" : "Xem chi tiết"}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <button 
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`flex items-center px-4 py-2 rounded-md ${
                    currentPage === 1 
                      ? "text-gray-400 cursor-not-allowed" 
                      : "text-red-600 hover:bg-red-50"
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
                    currentPage === totalPages 
                      ? "text-gray-400 cursor-not-allowed" 
                      : "text-red-600 hover:bg-red-50"
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

export default UserHistory;
