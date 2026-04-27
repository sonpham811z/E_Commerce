import { useRef } from 'react';
import ProductCard from '@/components/features/products/ProductCard';
import { AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';
import Spinner from '../../ui/Spinner';

const CATEGORY_LABELS = {
  laptop: 'Laptop',
  keyboard: 'Bàn phím',
  headset: 'Tai nghe',
  ssd: 'Ổ cứng SSD',
  other: 'Linh kiện khác',
};

function ProductRow({
  products,
  isCategoryPage = false,
  onLoadMore,
  hasMore,
  loadingMore,
  hideTitle = false,
}) {
  const scrollRefs = useRef({});

  const grouped = products.reduce((acc, product) => {
    const category = product.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(product);
    return acc;
  }, {});

  const scroll = (category, direction) => {
    const ref = scrollRefs.current[category];
    if (ref) {
      const scrollAmount =
        window.innerWidth < 640 ? 280 : window.innerWidth < 1024 ? 800 : 1500;
      ref.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className='space-y-8 sm:space-y-10 lg:space-y-12'>
      {Object.entries(grouped).map(([category, items]) => (
        <section key={category} className='relative overflow-visible z-10'>
          {!hideTitle && (
            <h2 className='text-lg sm:text-xl font-bold mb-3 sm:mb-4 px-2 sm:px-0'>
              {CATEGORY_LABELS[category] || category}
            </h2>
          )}

          {isCategoryPage ? (
            <>
              <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 px-2 sm:px-0'>
                {items.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
              {hasMore && (
                <div className='flex justify-center mt-6 sm:mt-8 px-2 sm:px-0'>
                  <button
                    onClick={onLoadMore}
                    disabled={loadingMore}
                    className='bg-red-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-lg transition-all duration-300 hover:bg-red-600 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                  >
                    {loadingMore ? (
                      <>
                        <Spinner className='w-4 sm:w-5 h-4 sm:h-5 text-white' />
                      </>
                    ) : (
                      'Xem thêm'
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Nút scroll trái/phải - ẩn trên mobile */}
              <button
                onClick={() => scroll(category, 'left')}
                className='absolute -left-6 sm:-left-9 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 p-1.5 sm:p-2 rounded-full shadow-md hover:bg-gray-100 transition hidden sm:block'
              >
                <AiOutlineLeft size={16} className='sm:w-[18px] sm:h-[18px]' />
              </button>
              <button
                onClick={() => scroll(category, 'right')}
                className='absolute -right-6 sm:-right-9 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 p-1.5 sm:p-2 rounded-full shadow-md hover:bg-gray-100 transition hidden sm:block'
              >
                <AiOutlineRight size={16} className='sm:w-[18px] sm:h-[18px]' />
              </button>

              {/* Dòng sản phẩm dạng slider */}
              <div
                ref={(el) => (scrollRefs.current[category] = el)}
                className='flex gap-2 sm:gap-3 overflow-x-auto overflow-y-hidden scroll-smooth scroll-hidden pr-3 sm:pr-6 px-2 py-[2px]'
              >
                {items.map((product, index) => (
                  <div
                    key={product.id || `${category}-${index}`}
                    className='min-w-[180px] max-w-[180px] sm:min-w-[220px] sm:max-w-[220px] lg:min-w-[250px] lg:max-w-[250px] flex-shrink-0'
                  >
                    <ProductCard {...product} />
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      ))}
    </div>
  );
}

export default ProductRow;
