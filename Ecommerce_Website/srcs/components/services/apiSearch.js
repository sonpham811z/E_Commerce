import { coreApi } from './api';

export const fetchProductsByTitle = async (title, filters = {}) => {
  if (!title) return [];

  try {
    const hasFilters = filters.category || filters.min_price || filters.max_price || filters.color || filters.specs?.length;

    if (hasFilters) {
      const params = { search: title, limit: 10 };
      if (filters.category) params.category = filters.category;
      if (filters.min_price) params.min_price = filters.min_price;
      if (filters.max_price) params.max_price = filters.max_price;
      if (filters.color) params.color = filters.color;
      if (filters.specs?.length) params.specs = filters.specs.join(',');

      const { data } = await coreApi.get('/products', { params });
      return data.data?.products || data.data || [];
    }

    const { data } = await coreApi.get('/products/suggestions', {
      params: { q: title, limit: 10 },
    });
    return data.data || [];
  } catch (error) {
    console.error('Lỗi khi tìm kiếm sản phẩm:', error.message);
    return [];
  }
};
