import { aiApi } from './api';

export const fetchAISuggestions = async (q, limit = 10) => {
  if (!q) return [];

  try {
    const { data } = await aiApi.get('/suggest/search', {
      params: { q, limit },
    });
    return data.data || [];
  } catch (error) {
    console.error('Lỗi khi lấy gợi ý AI:', error.message);
    return [];
  }
};

export const fetchCrossSell = async (category) => {
  try {
    const { data } = await aiApi.post('/suggest/cross-sell', { category });
    return data.data || [];
  } catch (error) {
    console.error('Lỗi khi lấy cross-sell:', error.message);
    return [];
  }
};

export const fetchSimilarProducts = async (productId, priceMargin = 0.2) => {
  try {
    const { data } = await aiApi.post('/suggest/similar', {
      product_id: productId,
      price_margin: priceMargin,
    });
    return data.data || [];
  } catch (error) {
    console.error('Lỗi khi lấy sản phẩm tương tự:', error.message);
    return [];
  }
};

export const fetchCartSuggestions = async (items) => {
  try {
    const { data } = await aiApi.post('/suggest/cart', { items });
    return data.data || {};
  } catch (error) {
    console.error('Lỗi khi lấy gợi ý giỏ hàng:', error.message);
    return {};
  }
};
