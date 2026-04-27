import { supabase } from './supabase';

// ── Admin: CRUD ──────────────────────────────────────────────

export async function getProduct() {
  const { data, error } = await supabase
    .from('product')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    throw new Error('Không tìm thấy dữ liệu');
  }
  return data;
}

export async function createProduct(newProduct) {
  const { data, error } = await supabase
    .from('product')
    .insert([newProduct])
    .select();

  if (error) {
    console.error(error);
    throw new Error('Không thể thêm sản phẩm');
  }
  return data;
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('product').delete().eq('id', id);
  if (error) {
    console.error(error);
    throw new Error('Không thể xoá sản phẩm');
  }
  return true;
}

export async function countProduct() {
  const { count, error } = await supabase
    .from('product')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  if (error) return 0;
  return count || 0;
}

// ── Featured / category ─────────────────────────────────────

export const getFeaturedProducts = async (category) => {
  let query = supabase
    .from('product')
    .select('*')
    .eq('is_active', true)
    .order('rating', { ascending: false })
    .limit(20);

  if (category && category !== 'product') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Lỗi get featured:', error);
    throw new Error('Không thể tải sản phẩm nổi bật');
  }
  return data;
};

// ── Product detail ──────────────────────────────────────────

export async function getProductById(id) {
  const { data, error } = await supabase
    .from('product')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Lỗi khi lấy chi tiết sản phẩm:', error.message);
    throw new Error('Không tìm thấy sản phẩm');
  }
  return data;
}

// ── Dashboard stats ─────────────────────────────────────────

export async function getTotalRevenue() {
  const { data, error } = await supabase
    .from('orders')
    .select('total')
    .neq('status', 'cancelled')
    .is('deleted_at', null);

  if (error) return 0;
  return (data || []).reduce((sum, o) => sum + (o.total || 0), 0);
}

export async function countOrders() {
  const { count, error } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null);

  if (error) return 0;
  return count || 0;
}

export async function countCustomers() {
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  if (error) return 0;
  return count || 0;
}

export async function getRevenueByMonth(year = new Date().getFullYear()) {
  const monthly = Array(12).fill(0);
  const { data, error } = await supabase
    .from('orders')
    .select('order_date, total')
    .gte('order_date', `${year}-01-01`)
    .lte('order_date', `${year}-12-31`)
    .neq('status', 'cancelled')
    .is('deleted_at', null);

  if (error) return monthly;
  (data || []).forEach(o => {
    monthly[new Date(o.order_date).getMonth()] += o.total || 0;
  });
  return monthly;
}

export async function getProductPerformance() {
  const { data, error } = await supabase
    .from('order_items')
    .select('quantity, product_id, product_name, price');

  if (error) return [];

  const map = new Map();
  (data || []).forEach(item => {
    const cur = map.get(item.product_id) || { name: item.product_name, sales: 0, revenue: 0 };
    cur.sales   += item.quantity || 0;
    cur.revenue += (item.quantity || 0) * (item.price || 0);
    map.set(item.product_id, cur);
  });

  return Array.from(map.values())
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);
}

export async function getRevenueByRegion() {
  const { data, error } = await supabase
    .from('orders')
    .select('total, address')
    .neq('status', 'cancelled')
    .is('deleted_at', null);

  if (error) return [];

  const regions = { Bắc: 0, Trung: 0, Nam: 0, Tây: 0 };
  const northCities  = ['Hà Nội', 'Hải Phòng', 'Quảng Ninh', 'Bắc Ninh', 'Hải Dương'];
  const centralCities = ['Đà Nẵng', 'Huế', 'Quảng Nam', 'Nghệ An', 'Hà Tĩnh'];
  const westCities   = ['Cần Thơ', 'Kiên Giang', 'An Giang', 'Đồng Tháp'];

  (data || []).forEach(o => {
    const city = o.address?.city || '';
    if (northCities.some(c => city.includes(c)))   regions.Bắc  += o.total || 0;
    else if (centralCities.some(c => city.includes(c))) regions.Trung += o.total || 0;
    else if (westCities.some(c => city.includes(c)))    regions.Tây  += o.total || 0;
    else                                                 regions.Nam  += o.total || 0;
  });

  const total = Object.values(regions).reduce((s, v) => s + v, 0);
  return Object.entries(regions).map(([region, amount]) => ({
    region,
    amount,
    percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
  }));
}
