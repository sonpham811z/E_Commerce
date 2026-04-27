import { coreApi } from '@/components/services/api';

export function formatCurrency(value) {
  if (!value || isNaN(value)) return '₫0';
  return `₫${Number(value).toLocaleString('vi-VN')}`;
}

function buildProductShape(item, categorySlug) {
  const salePrice     = item.sale_price     || item.price || 0;
  const originalPrice = item.original_price || Math.round(salePrice * 1.2);
  const discount =
    originalPrice && originalPrice > salePrice
      ? `${Math.round(((originalPrice - salePrice) / originalPrice) * 100)}%`
      : '0%';

  return {
    id:            item.id            || '',
    title:         (item.title || '').replace(/-/g, ' ') || 'No Title',
    brand:         item.brand         || 'Unknown',
    image:         item.image         || '',
    salePrice:     formatCurrency(salePrice),
    originalPrice: formatCurrency(originalPrice),
    salePriceRaw:  salePrice,
    discount,
    rating:        item.rating        || 0,
    reviewCount:   item.review_count  || 0,
    thumbnail:     item.thumbnails    || '',
    description:   item.description   || '',
    detailImage:   item.detail_image  || '',
    performance:   item.performance   || '',
    extends:       item.extends       || '',
    category:      item.category      || categorySlug || 'product',
  };
}

export async function fetchProducts(category = 'product') {
  try {
    const params = { limit: 100, sort: 'rating' };
    if (category && category !== 'product') params.category = category;
    const { data } = await coreApi.get('/products', { params });
    return (data.data?.products || []).map(item => buildProductShape(item, category));
  } catch (err) {
    console.error(`Error fetching products (category=${category}):`, err.message);
    return [];
  }
}

export async function getUserId() {
  return null;
}
