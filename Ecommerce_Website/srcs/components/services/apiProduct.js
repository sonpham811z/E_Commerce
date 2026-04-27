import { coreApi } from './api';

// ── Admin: CRUD ──────────────────────────────────────────────

export async function getProduct() {
  try {
    const { data } = await coreApi.get('/products', { params: { limit: 200 } });
    return data.data?.products || [];
  } catch (error) {
    console.error(error);
    throw new Error('Không tìm thấy dữ liệu');
  }
}

export async function createProduct(newProduct) {
  try {
    const { data } = await coreApi.post('/products', newProduct);
    return [data.data];
  } catch (error) {
    console.error(error);
    throw new Error('Không thể thêm sản phẩm');
  }
}

export async function deleteProduct(id) {
  try {
    await coreApi.delete(`/products/${id}`);
    return true;
  } catch (error) {
    console.error(error);
    throw new Error('Không thể xoá sản phẩm');
  }
}

export async function countProduct() {
  try {
    const { data } = await coreApi.get('/products', { params: { limit: 1 } });
    return data.data?.total || 0;
  } catch { return 0; }
}

// ── Featured / category ─────────────────────────────────────

export const getFeaturedProducts = async (category) => {
  try {
    const params = { sort: 'rating', limit: 20 };
    if (category && category !== 'product') params.category = category;
    const { data } = await coreApi.get('/products', { params });
    return data.data?.products || [];
  } catch (error) {
    console.error('Lỗi get featured:', error);
    throw new Error('Không thể tải sản phẩm nổi bật');
  }
};

// ── Product detail ──────────────────────────────────────────

export async function getProductById(id) {
  try {
    const { data } = await coreApi.get(`/products/${id}`);
    return data.data;
  } catch (error) {
    if (error.response?.status === 404) throw new Error('Không tìm thấy sản phẩm');
    throw error;
  }
}

// ── Update product ──────────────────────────────────────────

export async function updateProduct(id, updates) {
  try {
    const { data } = await coreApi.patch(`/products/${id}`, updates);
    return [data.data];
  } catch (error) {
    console.error(error);
    throw new Error('Không thể cập nhật sản phẩm');
  }
}

// ── Dashboard stats ─────────────────────────────────────────

export async function getProductStats() {
  try {
    const { data } = await coreApi.get('/products', { params: { limit: 1 } });
    return { total: data.data?.total || 0 };
  } catch { return { total: 0 }; }
}
