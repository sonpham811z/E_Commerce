import { coreApi } from '@/components/services/api';

function formatCurrency(value) {
  if (!value) return '0₫';
  return `${Number(value).toLocaleString('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}₫`;
}

export function formatCurrencyValue(value) {
  if (!value) return 0;
  return Number(value).toLocaleString('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export async function fetchProducts(category = 'laptop') {
  try {
    const params = { limit: 100, sort: 'rating' };
    if (category) params.category = category;
    const { data } = await coreApi.get('/products', { params });
    const items = data.data?.products || [];

    return items.map((item) => {
      const salePrice     = item.sale_price     || item.price || 0;
      const originalPrice = item.original_price || Math.round(salePrice * 1.2);
      const discount =
        originalPrice && salePrice
          ? `${Math.round(((originalPrice - salePrice) / originalPrice) * 100)}%`
          : '0%';

      return {
        id:           item.id            || '',
        title:        (item.title || '').replace(/-/g, ' ') || 'No Title',
        brand:        item.brand         || 'Unknown',
        image:        item.image         || '',
        salePrice:    formatCurrency(salePrice),
        originalPrice: formatCurrency(originalPrice),
        discount,
        rating:       item.rating        || 0,
        reviewCount:  item.review_count  || 0,
        thumbnail:    item.thumbnails    || '',
        description:  item.description   || '',
        detailImage:  item.detail_image  || '',
        performance:  item.performance   || '',
        extends:      item.extends       || '',
        category:     item.category      || category,
      };
    });
  } catch (err) {
    console.error(`Error fetching products (category=${category}):`, err.message);
    return [];
  }
}

export async function getProductCount() {
  try {
    const { data } = await coreApi.get('/products', { params: { limit: 1 } });
    return data.data?.total || 0;
  } catch { return 0; }
}

export async function getTotalRevenue() { return 0; }
export async function getOrderCount() { return 0; }
export async function getRevenueByMonth() { return Array(12).fill(0); }
export async function getProfitByMonth() { return Array(12).fill(0); }
export async function getTopProductPerformance() { return []; }
export async function getRegionalDistribution() { return []; }
export async function getUserId() { return null; }
