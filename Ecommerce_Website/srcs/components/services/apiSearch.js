import { coreApi } from './api';

// Same signature as before: fetchProductsByTitle(title)
export const fetchProductsByTitle = async (title) => {
  if (!title) return [];

  try {
    const { data } = await coreApi.get('/products/suggestions', {
      params: { q: title, limit: 10 },
    });
    return data.data || [];
  } catch (error) {
    console.error('Lỗi khi tìm kiếm sản phẩm:', error.message);
    return [];
  }
};
