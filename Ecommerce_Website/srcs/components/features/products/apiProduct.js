import { coreApi } from '@/components/services/api';

export function formatCurrency(value) {
  if (!value || isNaN(value)) return '₫0';
  return `₫${Number(value).toLocaleString('vi-VN')}`;
}

/**
 * Maps URL category slugs to DB category name + optional title search keyword.
 * DB categories: 'Laptop', 'Bàn phím', 'Linh kiện', 'Màn hình', 'Chuột', 'Tai nghe', 'PC Gaming', 'Khác'
 */
const SLUG_TO_DB = {
  // broad categories
  laptop:                    { category: 'Laptop' },
  keyboard:                  { category: 'Bàn phím' },
  mouse:                     { category: 'Chuột' },
  headphone:                 { category: 'Tai nghe' },
  headset:                   { category: 'Tai nghe' },
  monitor:                   { category: 'Màn hình' },
  'man-hinh':                { category: 'Màn hình' },
  pcgaming:                  { category: 'PC Gaming' },
  'pc-gaming':               { category: 'PC Gaming' },
  ssd:                       { category: 'Linh kiện', search: 'SSD' },
  ram:                       { category: 'Linh kiện', search: 'RAM' },
  cpu:                       { category: 'Linh kiện', search: 'CPU' },
  vga:                       { category: 'Linh kiện', search: 'RTX' },
  pccooling:                 { category: 'Linh kiện', search: 'tản nhiệt' },

  // laptop sub-categories — search by title keyword within 'Laptop' category
  'laptop-gaming':           { category: 'Laptop', search: 'gaming' },
  'laptop-van-phong':        { category: 'Laptop', search: 'văn phòng' },
  'laptop-do-hoa':           { category: 'Laptop', search: 'đồ họa' },
  'laptop-doanh-nhan':       { category: 'Laptop', search: 'thinkpad' },
  'laptop-chay-ai':          { category: 'Laptop', search: 'AI' },

  // by brand
  'laptop-asus-tuf':         { category: 'Laptop', search: 'ASUS TUF' },
  'laptop-rog-strix':        { category: 'Laptop', search: 'ROG Strix' },
  'laptop-rog-zephyrus':     { category: 'Laptop', search: 'ROG Zephyrus' },
  'laptop-asus-oled':        { category: 'Laptop', search: 'ASUS OLED' },
  'laptop-asus-vivobook':    { category: 'Laptop', search: 'VivoBook' },
  'laptop-asus-zenbook':     { category: 'Laptop', search: 'ZenBook' },
  'laptop-acer-nitro':       { category: 'Laptop', search: 'Nitro' },
  'laptop-acer-predator-helios': { category: 'Laptop', search: 'Predator' },
  'laptop-acer-aspire':      { category: 'Laptop', search: 'Aspire' },
  'laptop-acer-swift':       { category: 'Laptop', search: 'Swift' },
  'laptop-msi-cyborg':       { category: 'Laptop', search: 'Cyborg' },
  'laptop-msi-katana':       { category: 'Laptop', search: 'Katana' },
  'laptop-msi-modern':       { category: 'Laptop', search: 'Modern' },
  'laptop-msi-prestige':     { category: 'Laptop', search: 'Prestige' },
  'laptop-msi-raider':       { category: 'Laptop', search: 'Raider' },
  'laptop-lenovo-legion':    { category: 'Laptop', search: 'Legion' },
  'laptop-lenovo-thinkbook': { category: 'Laptop', search: 'ThinkBook' },
  'laptop-lenovo-thinkpad':  { category: 'Laptop', search: 'ThinkPad' },
  'laptop-lenovo-ideapad':   { category: 'Laptop', search: 'IdeaPad' },
  'laptop-lenovo-yoga':      { category: 'Laptop', search: 'Yoga' },
  'laptop-dell-alienware':   { category: 'Laptop', search: 'Alienware' },
  'laptop-dell-g15':         { category: 'Laptop', search: 'G15' },
  'laptop-dell-inspiron':    { category: 'Laptop', search: 'Inspiron' },
  'laptop-dell-xps':         { category: 'Laptop', search: 'XPS' },
  'laptop-dell-latitude':    { category: 'Laptop', search: 'Latitude' },
  'laptop-dell-vostro':      { category: 'Laptop', search: 'Vostro' },
  'laptop-hp-victus':        { category: 'Laptop', search: 'Victus' },
  'laptop-hp-omen':          { category: 'Laptop', search: 'Omen' },

  // by price — just filter all laptops (price filter done client-side in ProductPage)
  'laptop-duoi-15-trieu':      { category: 'Laptop' },
  'laptop-tu-15-den-20-trieu': { category: 'Laptop' },
  'laptop-tren-20-trieu':      { category: 'Laptop' },

  // CPU slugs
  'cpu-intel-i3': { category: 'Linh kiện', search: 'Core i3' },
  'cpu-intel-i5': { category: 'Linh kiện', search: 'Core i5' },
  'cpu-intel-i7': { category: 'Linh kiện', search: 'Core i7' },
  'cpu-intel-i9': { category: 'Linh kiện', search: 'Core i9' },
  'cpu-amd-r3':   { category: 'Linh kiện', search: 'Ryzen 3' },
  'cpu-amd-r5':   { category: 'Linh kiện', search: 'Ryzen 5' },
  'cpu-amd-r7':   { category: 'Linh kiện', search: 'Ryzen 7' },
  'cpu-amd-r9':   { category: 'Linh kiện', search: 'Ryzen 9' },
};

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

export async function fetchProducts(categorySlug = 'product') {
  try {
    const params = { limit: 100, sort: 'rating' };

    if (categorySlug && categorySlug !== 'product') {
      const mapped = SLUG_TO_DB[categorySlug];
      if (mapped) {
        params.category = mapped.category;
        if (mapped.search) params.search = mapped.search;
      } else {
        // fallback: use slug directly (works for Vietnamese category names passed directly)
        params.category = categorySlug;
      }
    }

    const { data } = await coreApi.get('/products', { params });
    return (data.data?.products || []).map(item => buildProductShape(item, categorySlug));
  } catch (err) {
    console.error(`Error fetching products (category=${categorySlug}):`, err.message);
    return [];
  }
}

export async function getUserId() {
  return null;
}
