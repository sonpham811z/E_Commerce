import { supabase } from '@/components/services/supabase';

// ─── Helpers ────────────────────────────────────────────────

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

// ─── Insert order ────────────────────────────────────────────

export async function insertOrder({ addressData, paymentMethod, product, discount = null, userId = null }) {
  const customerName = addressData.recipient || addressData.fullName || addressData.name || '';
  if (!customerName) throw new Error('Tên người nhận không hợp lệ');

  const phoneNumber = addressData.phone || '';
  if (!phoneNumber) throw new Error('Số điện thoại không hợp lệ');

  const addressParts = [];
  if (addressData.street || addressData.address)   addressParts.push(addressData.street || addressData.address);
  if (addressData.ward   || addressData.wardName)   addressParts.push(addressData.ward   || addressData.wardName);
  if (addressData.district || addressData.districtName) addressParts.push(addressData.district || addressData.districtName);
  if (addressData.city   || addressData.cityName)   addressParts.push(addressData.city   || addressData.cityName);
  const fullAddressString = addressData.fullAddress || addressParts.join(', ');

  const unitPrice  = parsePrice(product.salePrice);
  const qty        = product.quantity || 1;
  const productPrice = unitPrice * qty;
  const shippingFee  = calculateShippingFee(addressData.shippingMethod || 'standard', unitPrice);
  const discountAmt  = discount ? discount.amount : 0;

  const orderData = {
    ...(userId ? { user_id: userId } : {}),
    customer_name:   customerName,
    gender:          addressData.gender || 'unknown',
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
    product_info: {
      id:             product.id,
      title:          product.title,
      image:          product.image,
      price:          product.salePrice,
      original_price: product.originalPrice || '',
      quantity:       qty,
    },
    product_price: productPrice,
    shipping_fee:  shippingFee,
    discount:      discountAmt,
    discount_code: discount ? discount.code : '',
    total:         productPrice + shippingFee - discountAmt,
    status:        'pending',
    order_date:    new Date().toISOString(),
  };

  const { data, error } = await supabase.from('orders').insert([orderData]).select();
  if (error) throw error;

  // Insert into order_items as well
  if (data && data[0]) {
    await supabase.from('order_items').insert([{
      order_id:      data[0].id,
      product_id:    String(product.id),
      product_name:  product.title,
      product_image: product.image,
      quantity:      qty,
      price:         unitPrice,
      image_url:     product.image,
    }]);
  }

  return data;
}

// ─── Customer: get orders by phone ──────────────────────────

export async function getOrdersByPhone(phoneNumber) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('phone', phoneNumber)
    .is('deleted_at', null)
    .order('order_date', { ascending: false });

  if (error) throw error;
  return data;
}

// ─── Admin: get paginated orders ────────────────────────────

export async function getAdminOrders({
  page      = 1,
  pageSize  = 10,
  status    = null,
  searchTerm = '',
  sortBy    = 'order_date',
  ascending = false,
} = {}) {
  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .is('deleted_at', null);

  if (status) query = query.eq('status', status);
  if (searchTerm) query = query.or(`customer_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);

  query = query.order(sortBy, { ascending });

  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    orders:    data || [],
    pageCount: Math.ceil((count || 0) / pageSize),
    total:     count || 0,
  };
}

// ─── Get single order by ID ──────────────────────────────────

export async function getOrderById(orderId) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) throw error;
  return data;
}

// ─── Update order status ─────────────────────────────────────

export async function updateOrderStatus(orderId, status) {
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId);

  if (error) throw error;
  return true;
}

// ─── Soft-delete order ───────────────────────────────────────

export async function deleteOrder(orderId) {
  const { error } = await supabase
    .from('orders')
    .update({ status: 'deleted', deleted_at: new Date().toISOString() })
    .eq('id', orderId);

  if (error) throw error;
  return true;
}

// ─── Order stats by status ───────────────────────────────────

export async function getOrderStatsByStatus() {
  const { data, error } = await supabase
    .from('orders')
    .select('status')
    .is('deleted_at', null);

  if (error) throw error;

  const stats = { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0, total: 0 };
  (data || []).forEach(({ status }) => {
    if (stats[status] !== undefined) stats[status]++;
    stats.total++;
  });
  return stats;
}

// ─── Weekly revenue ──────────────────────────────────────────

export async function getCurrentWeekRevenue() {
  const today    = new Date();
  const firstDay = new Date(today);
  firstDay.setDate(today.getDate() - today.getDay());
  firstDay.setHours(0, 0, 0, 0);
  const lastDay  = new Date(firstDay);
  lastDay.setDate(firstDay.getDate() + 6);
  lastDay.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from('orders')
    .select('order_date, total')
    .gte('order_date', firstDay.toISOString())
    .lte('order_date', lastDay.toISOString())
    .neq('status', 'cancelled')
    .is('deleted_at', null);

  if (error) throw error;

  const dailyRevenue = Array(7).fill(0);
  const dailyOrders  = Array(7).fill(0);
  (data || []).forEach(order => {
    const idx = new Date(order.order_date).getDay();
    dailyRevenue[idx] += Number(order.total) || 0;
    dailyOrders[idx]++;
  });

  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return dayNames.map((day, i) => ({ day, orders: dailyOrders[i], revenue: dailyRevenue[i] }));
}

// ─── Recent orders (for dashboard) ──────────────────────────

export async function getRecentOrders(limit = 5) {
  const { data, error } = await supabase
    .from('orders')
    .select('id, customer_name, order_date, total, status')
    .is('deleted_at', null)
    .order('order_date', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map((order, i) => ({
    id:           order.id,
    orderNumber:  `ORD-${String(i + 1).padStart(4, '0')}`,
    customerName: order.customer_name,
    value:        order.total,
    time:         getTimeAgo(new Date(order.order_date)),
    status:       order.status,
  }));
}
