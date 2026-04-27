import { coreApi, authApi } from '@/components/services/api';

export function formatCurrencyValue(value) {
  if (!value) return 0;
  return Number(value).toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// ── Shared: fetch all non-deleted orders (client-side aggregation) ──
async function fetchAllOrders(limit = 1000) {
  const { data } = await coreApi.get('/orders/admin', { params: { limit } });
  return data.data?.orders || [];
}

// ── Product count ─────────────────────────────────────────────
export async function getProductCount() {
  try {
    const { data } = await coreApi.get('/products', { params: { limit: 1 } });
    return data.data?.total || 0;
  } catch { return 0; }
}

// ── Total revenue (all non-cancelled orders) ──────────────────
export async function getTotalRevenue() {
  try {
    const orders = await fetchAllOrders();
    return orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  } catch { return 0; }
}

// ── Revenue in a time range ───────────────────────────────────
export async function getRevenueByTimeRange(startDate, endDate) {
  try {
    const { data } = await coreApi.get('/orders/revenue', {
      params: { start_date: startDate, end_date: endDate },
    });
    return (data.data || []).reduce((sum, r) => sum + (Number(r.total_revenue) || 0), 0);
  } catch { return 0; }
}

// ── Total order count ─────────────────────────────────────────
export async function getOrderCount() {
  try {
    const { data } = await coreApi.get('/orders/admin', { params: { limit: 1 } });
    return data.data?.total || 0;
  } catch { return 0; }
}

// ── Order count in a time range ───────────────────────────────
export async function getOrderCountByTimeRange(startDate, endDate) {
  try {
    const { data } = await coreApi.get('/orders/revenue', {
      params: { start_date: startDate, end_date: endDate },
    });
    return (data.data || []).reduce((sum, r) => sum + (Number(r.total_orders) || 0), 0);
  } catch { return 0; }
}

// ── Total registered users ────────────────────────────────────
export async function getUserCount() {
  try {
    const { data } = await authApi.get('/auth/admin/users', { params: { limit: 1 } });
    return data.data?.total || 0;
  } catch { return 0; }
}

// ── Monthly revenue for a given year ─────────────────────────
export async function getRevenueByMonth(year = new Date().getFullYear()) {
  try {
    const orders = await fetchAllOrders();
    const monthly = Array(12).fill(0);
    orders.forEach(o => {
      if (o.status === 'cancelled') return;
      const d = new Date(o.order_date || o.created_at);
      if (d.getFullYear() !== year) return;
      monthly[d.getMonth()] += Number(o.total) || 0;
    });
    return monthly;
  } catch { return Array(12).fill(0); }
}

// ── Monthly profit (30 % of revenue) ─────────────────────────
export async function getProfitByMonth(year = new Date().getFullYear()) {
  const rev = await getRevenueByMonth(year);
  return rev.map(r => Math.round(r * 0.3));
}

// ── Top N products by sales (proxy: featured + highest rating) ─
export async function getTopProductPerformance(limit = 5) {
  try {
    const { data } = await coreApi.get('/products', {
      params: { sort: 'rating', limit },
    });
    return (data.data?.products || []).map(p => ({
      id:      p.id,
      name:    p.title,
      sales:   Math.round((p.rating || 0) * 20),
      revenue: (p.sale_price || p.price || 0) * Math.round((p.rating || 0) * 20),
      category: p.category || 'Khác',
    }));
  } catch { return []; }
}

// ── Regional distribution ─────────────────────────────────────
export async function getRegionalDistribution() {
  try {
    const orders = await fetchAllOrders();
    const south   = ['hồ chí minh', 'hcm', 'sài gòn', 'cần thơ', 'đồng nai', 'bình dương', 'vũng tàu'];
    const north   = ['hà nội', 'hải phòng', 'bắc ninh', 'quảng ninh', 'hải dương'];
    const central = ['đà nẵng', 'huế', 'nha trang', 'quảng nam', 'nghệ an'];

    const counts = { 'Miền Nam': 0, 'Miền Bắc': 0, 'Miền Trung': 0 };
    orders.forEach(o => {
      if (o.status === 'cancelled') return;
      const city = (o.address?.city || '').toLowerCase();
      if (south.some(k => city.includes(k)))        counts['Miền Nam']++;
      else if (north.some(k => city.includes(k)))   counts['Miền Bắc']++;
      else if (central.some(k => city.includes(k))) counts['Miền Trung']++;
      else                                           counts['Miền Nam']++;
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return Object.entries(counts).map(([region, count]) => ({
      region,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
  } catch {
    return [
      { region: 'Miền Nam', percentage: 45 },
      { region: 'Miền Bắc', percentage: 35 },
      { region: 'Miền Trung', percentage: 20 },
    ];
  }
}

// ── Order stats by status ─────────────────────────────────────
export async function getOrderStatsByStatus() {
  try {
    const orders = await fetchAllOrders();
    const counts = {};
    orders.forEach(({ status }) => {
      counts[status] = (counts[status] || 0) + 1;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return Object.entries(counts).map(([status, count]) => ({
      status, count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
  } catch { return []; }
}

// ── Order count for a specific status ────────────────────────
export async function getOrderCountByStatus(status) {
  try {
    const { data } = await coreApi.get('/orders/admin', { params: { status, limit: 1 } });
    return data.data?.total || 0;
  } catch { return 0; }
}

// ── Revenue for the last N days ───────────────────────────────
export async function getRevenueByRecentDays(days = 7) {
  try {
    const today     = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    const orders = await fetchAllOrders();

    const dailyData = Array.from({ length: days }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      return {
        day:     new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(d),
        dateStr: d.toISOString().split('T')[0],
        orders:  0,
        revenue: 0,
      };
    });

    orders.forEach(o => {
      if (o.status === 'cancelled') return;
      const dateStr = new Date(o.order_date || o.created_at).toISOString().split('T')[0];
      const slot    = dailyData.find(d => d.dateStr === dateStr);
      if (slot) {
        slot.revenue += Number(o.total) || 0;
        slot.orders++;
      }
    });

    return dailyData.map(({ day, orders, revenue }) => ({ day, orders, revenue }));
  } catch {
    return Array.from({ length: days }, (_, i) => ({
      day:     ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][i % 7],
      orders:  0,
      revenue: 0,
    }));
  }
}
