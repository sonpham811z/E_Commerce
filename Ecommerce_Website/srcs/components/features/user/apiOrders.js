// Re-export everything from the canonical service file
// to keep a single source of truth
export {
  insertOrder,
  getOrdersByPhone,
  getAdminOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getOrderStatsByStatus,
  getCurrentWeekRevenue,
  getRecentOrders,
} from '@/components/services/apiOrders';
