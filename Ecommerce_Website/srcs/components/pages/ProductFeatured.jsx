import ProductRow from '@/components/features/products/ProductRow';
import Spinner from '../ui/Spinner';
import { useGetFeaturedProducts } from '../hooks/useGetFeatureProducts';

const CATEGORY_LABELS = {
  Laptop: 'Laptop nổi bật',
  'Bàn phím': 'Bàn phím nổi bật',
  'Tai nghe': 'Tai nghe nổi bật',
  'Màn hình': 'Màn hình nổi bật',
  'PC Gaming': 'PC Gaming nổi bật',
  'Chuột': 'Chuột nổi bật',
};

function ProductFeatured() {
  const laptopData    = useGetFeaturedProducts('Laptop');
  const keyboardData  = useGetFeaturedProducts('Bàn phím');
  const headsetData   = useGetFeaturedProducts('Tai nghe');
  const monitorData   = useGetFeaturedProducts('Màn hình');
  const pcData        = useGetFeaturedProducts('PC Gaming');
  const mouseData     = useGetFeaturedProducts('Chuột');

  const categoryList = [
    { key: 'Laptop',     label: CATEGORY_LABELS['Laptop'],     ...laptopData },
    { key: 'PC Gaming',  label: CATEGORY_LABELS['PC Gaming'],  ...pcData },
    { key: 'Màn hình',  label: CATEGORY_LABELS['Màn hình'],  ...monitorData },
    { key: 'Bàn phím',  label: CATEGORY_LABELS['Bàn phím'],  ...keyboardData },
    { key: 'Chuột',     label: CATEGORY_LABELS['Chuột'],     ...mouseData },
    { key: 'Tai nghe',  label: CATEGORY_LABELS['Tai nghe'],  ...headsetData },
  ];

  return (
    <main className='bg-gray-200 w-full min-h-screen p-3 sm:p-4 lg:p-6 flex justify-center'>
      <div className='max-w-[1200px] w-full'>
        <h1 className='text-2xl sm:text-3xl lg:text-4xl font-extrabold text-center text-red-600 mb-1 sm:mb-2 px-2'>
          Sản Phẩm Nổi Bật
        </h1>
        <p className='text-center text-gray-600 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 px-4 sm:px-2'>
          Khám phá những thiết bị công nghệ hot nhất được đánh giá cao bởi khách
          hàng
        </p>

        {categoryList.map(({ key, label, products, loading, error }) => {
          if (loading) {
            return (
              <div
                key={key}
                className='flex justify-center items-center py-8 sm:py-12'
              >
                <Spinner className='w-5 sm:w-6 h-5 sm:h-6 text-red-500' />
              </div>
            );
          }

          if (error || !products || !products.length) return null;

          return (
            <section key={key} className='mb-6 sm:mb-8 overflow-visible'>
              <h2 className='text-lg sm:text-xl font-bold mb-3 sm:mb-4 px-2 sm:px-0'>
                {label}
              </h2>
              <ProductRow
                products={products}
                isCategoryPage={false}
                hideTitle={true}
              />
            </section>
          );
        })}
      </div>
    </main>
  );
}

export default ProductFeatured;
