// Re-export all order functions from the service layer (no mock data)
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
