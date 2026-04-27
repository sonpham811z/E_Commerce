import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import ProductFilters from '@/components/features/products/ProductFilters';
import ProductRow from '@/components/features/products/ProductRow';
import { fetchProducts } from '@/components/features/products/apiProduct';
import { parsePrice } from '@/utils/parsePrice';
import { ActiveFilters } from '../features/products/ProductFilters';
import Spinner from '../ui/Spinner';

function ProductPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get('category');

  const [selectedBrand, setSelectedBrand] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    priceRange: null,
    cpu: null,
    socket: null,
    category: categoryParam || null,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchProducts(categoryParam || 'product');
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryParam]);

  const processedProducts = useMemo(() => {
    let filtered = products;

    if (selectedBrand !== 'all') {
      filtered = filtered.filter(
        (p) => (p.brand || '').toLowerCase() === selectedBrand.toLowerCase()
      );
    }

    if (filters.priceRange) {
      filtered = filtered.filter((p) => {
        const price = p.salePriceRaw || parsePrice(p.salePrice);
        switch (filters.priceRange) {
          case '5-9 triệu':
            return price >= 5_000_000 && price <= 9_000_000;
          case '9-15 triệu':
            return price >= 9_000_000 && price <= 15_000_000;
          case 'trên 15 triệu':
            return price > 15_000_000;
          default:
            return true;
        }
      });
    }

    if (filters.cpu) {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(filters.cpu.toLowerCase())
      );
    }

    if (filters.socket) {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(filters.socket.toLowerCase())
      );
    }

    return [...filtered].sort((a, b) => {
      const priceA = a.salePriceRaw || parsePrice(a.salePrice);
      const priceB = b.salePriceRaw || parsePrice(b.salePrice);
      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      return 0;
    });
  }, [products, selectedBrand, filters, sortBy]);

  useEffect(() => {
    setVisibleProducts(processedProducts.slice(0, 10));
  }, [processedProducts]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const currentLength = visibleProducts.length;
      const nextProducts = processedProducts.slice(
        currentLength,
        currentLength + 10
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      setVisibleProducts((prev) => [...prev, ...nextProducts]);
    } finally {
      setLoadingMore(false);
    }
  };

  const getCategoryLabel = (slug) => {
    const map = {
      product: 'Tất cả sản phẩm',
      keyboard: 'Bàn phím',
      mouse: 'Chuột máy tính',
      ssd: 'Ổ cứng SSD',
      headphone: 'Tai nghe',
      pccooling: 'Tản nhiệt PC',
      'laptop-van-phong': 'Laptop Văn phòng',
      'laptop-gaming': 'Laptop Gaming',
      'laptop-doanh-nhan': 'Laptop Doanh nhân',
      'laptop-do-hoa': 'Laptop Đồ họa',
      'laptop-chay-ai': 'Laptop chạy AI',
      'laptop-asus-oled': 'Laptop ASUS OLED',
      'laptop-asus-vivobook': 'Laptop ASUS Vivobook',
      'laptop-asus-zenbook': 'Laptop ASUS Zenbook',
      'laptop-asus-tuf': 'Laptop ASUS TUF Gaming',
      'laptop-rog-strix': 'Laptop ROG Strix',
      'laptop-rog-zephyrus': 'Laptop ROG Zephyrus',
      'laptop-acer-aspire': 'Laptop Acer Aspire',
      'laptop-acer-swift': 'Laptop Acer Swift',
      'laptop-acer-predator-helios': 'Laptop Acer Predator Helios',
      'laptop-acer-nitro': 'Laptop Acer Nitro',
      'laptop-msi-cyborg': 'Laptop MSI Cyborg',
      'laptop-msi-katana': 'Laptop MSI Katana',
      'laptop-msi-modern': 'Laptop MSI Modern',
      'laptop-msi-prestige': 'Laptop MSI Prestige',
      'laptop-msi-raider': 'Laptop MSI Raider',
      'laptop-lenovo-ideapad': 'Laptop Lenovo IdeaPad',
      'laptop-lenovo-thinkbook': 'Laptop Lenovo ThinkBook',
      'laptop-lenovo-thinkpad': 'Laptop Lenovo ThinkPad',
      'laptop-lenovo-legion': 'Laptop Lenovo Legion',
      'laptop-lenovo-yoga': 'Laptop Lenovo Yoga',
      'laptop-dell-inspiron': 'Laptop Dell Inspiron',
      'laptop-dell-xps': 'Laptop Dell XPS',
      'laptop-dell-g15': 'Laptop Dell G15',
      'laptop-dell-alienware': 'Laptop Dell Alienware',
      'laptop-dell-latitude': 'Laptop Dell Latitude',
      'laptop-dell-vostro': 'Laptop Dell Vostro',
      'laptop-hp-victus': 'Laptop HP Victus',
      'laptop-hp-omen': 'Laptop HP Omen',
      'laptop-duoi-15-trieu': 'Laptop dưới 15 triệu',
      'laptop-tu-15-den-20-trieu': 'Laptop 15–20 triệu',
      'laptop-tren-20-trieu': 'Laptop trên 20 triệu',
      'cpu-intel-i3': 'CPU Intel Core i3',
      'cpu-intel-i5': 'CPU Intel Core i5',
      'cpu-intel-i7': 'CPU Intel Core i7',
      'cpu-intel-i9': 'CPU Intel Core i9',
      'cpu-amd-r3': 'CPU AMD Ryzen 3',
      'cpu-amd-r5': 'CPU AMD Ryzen 5',
      'cpu-amd-r7': 'CPU AMD Ryzen 7',
      'cpu-amd-r9': 'CPU AMD Ryzen 9',
    };
    return (
      map[slug] ||
      slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    );
  };

  return (
    <main className='bg-gray-200 w-full min-h-screen p-6 flex justify-center'>
      <div className='max-w-[1200px] w-full'>
        <div className='bg-white rounded-2xl shadow-xl p-6 mb-6'>
          <ProductFilters
            selectedBrand={selectedBrand}
            onBrandChange={setSelectedBrand}
            sortBy={sortBy}
            onSortChange={setSortBy}
            filters={filters}
            onFilterChange={(key, value) =>
              setFilters((prev) => ({ ...prev, [key]: value }))
            }
          />
        </div>

        <ActiveFilters
          selectedBrand={selectedBrand}
          filters={filters}
          onClearBrand={() => setSelectedBrand('all')}
          onClearFilter={(key) => {
            setFilters((prev) => ({ ...prev, [key]: null }));
          }}
          onClearAll={() => {
            setSelectedBrand('all');
            setFilters({
              priceRange: null,
              cpu: null,
              socket: null,
              category: null,
            });
          }}
        />

        {loading ? (
          <div className='flex justify-center py-12'>
            <Spinner className='w-12 h-12 text-red-500' />
          </div>
        ) : error ? (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative'>
            {error}
          </div>
        ) : (
          <>
            <h2 className='text-2xl font-bold mb-4'>
              {getCategoryLabel(categoryParam || 'product')}
            </h2>
            <ProductRow
              products={visibleProducts}
              isCategoryPage={true}
              hideTitle={true}
              onLoadMore={loadMore}
              hasMore={visibleProducts.length < processedProducts.length}
              loadingMore={loadingMore}
            />
          </>
        )}
      </div>
    </main>
  );
}

export default ProductPage;
