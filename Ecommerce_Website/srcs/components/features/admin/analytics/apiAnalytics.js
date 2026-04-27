import { coreApi, authApi } from '@/components/services/api';

async function fetchAllOrders(limit = 1000) {
  const { data } = await coreApi.get('/orders/admin', { params: { limit } });
  return data.data?.orders || [];
}

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

export async function getProfitByMonth(year = new Date().getFullYear()) {
  const rev = await getRevenueByMonth(year);
  return rev.map(r => Math.round(r * 0.3));
}

export async function getTotalRevenue() {
  try {
    const orders = await fetchAllOrders();
    return orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  } catch { return 0; }
}

export async function getOrderCount() {
  try {
    const { data } = await coreApi.get('/orders/admin', { params: { limit: 1 } });
    return data.data?.total || 0;
  } catch { return 0; }
}

export async function getOrderStatsByStatus() {
  try {
    const orders = await fetchAllOrders();
    const statusNames = {
      pending:    'Chờ xác nhận',
      processing: 'Đang xử lý',
      shipped:    'Đang giao hàng',
      delivered:  'Hoàn thành',
      cancelled:  'Đã hủy',
    };
    const counts = {};
    orders.forEach(({ status }) => {
      counts[status] = (counts[status] || 0) + 1;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return Object.entries(counts).map(([status, count]) => ({
      name:  statusNames[status] || status,
      value: total > 0 ? Math.round((count / total) * 100) : 0,
    })).sort((a, b) => b.value - a.value);
  } catch { return []; }
}

export async function getRevenueByRecentDays(days = 7) {
  try {
    const today     = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    const orders = await fetchAllOrders();

    const daily = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const key = d.toISOString().split('T')[0];
      daily[key] = { day: d.toLocaleDateString('vi-VN'), revenue: 0, orders: 0 };
    }

    orders.forEach(o => {
      if (o.status === 'cancelled') return;
      const key = new Date(o.order_date || o.created_at).toISOString().split('T')[0];
      if (daily[key]) {
        daily[key].revenue += Number(o.total) || 0;
        daily[key].orders++;
      }
    });

    return Object.values(daily);
  } catch { return []; }
}

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
