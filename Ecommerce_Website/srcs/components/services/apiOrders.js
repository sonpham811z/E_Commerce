import { coreApi } from '@/components/services/api';

// ─── Helpers ─────────────────────────────────────────────────

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  if (typeof priceStr === 'number') return priceStr;
  return parseInt(priceStr.replace(/[^\d]/g, ''), 10) || 0;
}

function calculateShippingFee(shippingMethod, productPrice) {
  if (productPrice >= 500000) return 0;
  return shippingMethod === 'express' ? 50000 : 30000;
}

function getTimeAgo(date) {
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return `${Math.floor(diffHours / 24)} ngày trước`;
}

// ─── Insert order ─────────────────────────────────────────────
// Same signature as before

export async function insertOrder({ addressData, paymentMethod, product, discount = null, userId = null }) {
  const customerName = addressData.recipient || addressData.fullName || addressData.name || '';
  if (!customerName) throw new Error('Tên người nhận không hợp lệ');

  const phoneNumber = addressData.phone || '';
  if (!phoneNumber) throw new Error('Số điện thoại không hợp lệ');

  const addressParts = [];
  if (addressData.street   || addressData.address)      addressParts.push(addressData.street   || addressData.address);
  if (addressData.ward     || addressData.wardName)     addressParts.push(addressData.ward     || addressData.wardName);
  if (addressData.district || addressData.districtName) addressParts.push(addressData.district || addressData.districtName);
  if (addressData.city     || addressData.cityName)     addressParts.push(addressData.city     || addressData.cityName);
  const fullAddressString = addressData.fullAddress || addressParts.join(', ');

  const unitPrice    = parsePrice(product.salePrice);
  const qty          = product.quantity || 1;
  const shippingFee  = calculateShippingFee(addressData.shippingMethod || 'standard', unitPrice);
  const discountAmt  = discount ? discount.amount : 0;

  const orderPayload = {
    ...(userId ? { user_id: userId } : {}),
    customer_name:   customerName,
    phone:           phoneNumber,
    address: {
      full_address: fullAddressString,
      city:         addressData.city     || addressData.cityName     || '',
      district:     addressData.district || addressData.districtName || '',
      ward:         addressData.ward     || addressData.wardName     || '',
      street:       addressData.street   || addressData.address      || '',
      note:         addressData.note     || '',
    },
    shipping_method: addressData.shippingMethod || 'standard',
    payment_method:  paymentMethod,
    items: [{
      product_id:    String(product.id),
      product_name:  product.title,
      product_image: product.image,
      quantity:      qty,
      price:         unitPrice,
    }],
    shipping_fee:  shippingFee,
    discount:      discountAmt,
    discount_code: discount ? discount.code : null,
  };

  const { data } = await coreApi.post('/orders', orderPayload);
  return [data.data];
}

// ─── Customer: get orders by phone ───────────────────────────

export async function getOrdersByPhone(phoneNumber) {
  const { data } = await coreApi.get('/orders/admin', {
    params: { search: phoneNumber, limit: 50 },
  });
  return data.data?.orders || [];
}

// ─── Admin: get paginated orders ─────────────────────────────

export async function getAdminOrders({
  page      = 1,
  pageSize  = 10,
  status    = null,
  searchTerm = '',
} = {}) {
  const params = { page, limit: pageSize };
  if (status)     params.status = status;
  if (searchTerm) params.search = searchTerm;

  const { data } = await coreApi.get('/orders/admin', { params });
  const { orders = [], total = 0 } = data.data || {};

  return {
    orders,
    pageCount: Math.ceil(total / pageSize),
    total,
  };
}

// ─── Get single order by ID ───────────────────────────────────

export async function getOrderById(orderId) {
  const { data } = await coreApi.get(`/orders/${orderId}`);
  return data.data;
}

// ─── Update order status ──────────────────────────────────────

export async function updateOrderStatus(orderId, status) {
  await coreApi.patch(`/orders/${orderId}/status`, { status });
  return true;
}

// ─── Soft-delete order ────────────────────────────────────────

export async function deleteOrder(orderId) {
  await coreApi.delete(`/orders/${orderId}`);
  return true;
}

// ─── Order stats by status ────────────────────────────────────

export async function getOrderStatsByStatus() {
  const { data } = await coreApi.get('/orders/admin', { params: { limit: 500 } });
  const orders = data.data?.orders || [];

  const stats = { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0, total: 0 };
  orders.forEach(({ status }) => {
    if (stats[status] !== undefined) stats[status]++;
    stats.total++;
  });
  return stats;
}

// ─── Weekly revenue ───────────────────────────────────────────

export async function getCurrentWeekRevenue() {
  const today    = new Date();
  const firstDay = new Date(today);
  firstDay.setDate(today.getDate() - today.getDay());
  firstDay.setHours(0, 0, 0, 0);
  const lastDay = new Date(firstDay);
  lastDay.setDate(firstDay.getDate() + 6);
  lastDay.setHours(23, 59, 59, 999);

  const { data } = await coreApi.get('/orders/revenue', {
    params: {
      start_date: firstDay.toISOString(),
      end_date:   lastDay.toISOString(),
    },
  });

  const rows = data.data || [];
  const dailyRevenue = Array(7).fill(0);
  const dailyOrders  = Array(7).fill(0);

  rows.forEach(({ date, total_orders, total_revenue }) => {
    const idx = new Date(date).getDay();
    dailyRevenue[idx] += Number(total_revenue) || 0;
    dailyOrders[idx]  += Number(total_orders)  || 0;
  });

  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return dayNames.map((day, i) => ({ day, orders: dailyOrders[i], revenue: dailyRevenue[i] }));
}

// ─── Recent orders (for dashboard) ───────────────────────────

export async function getRecentOrders(limit = 5) {
  const { data } = await coreApi.get('/orders/admin', { params: { limit } });
  const orders = data.data?.orders || [];

  return orders.map((order, i) => ({
    id:           order.id,
    orderNumber:  `ORD-${String(i + 1).padStart(4, '0')}`,
    customerName: order.customer_name,
    value:        order.total,
    time:         getTimeAgo(new Date(order.order_date || order.created_at)),
    status:       order.status,
  }));
}
