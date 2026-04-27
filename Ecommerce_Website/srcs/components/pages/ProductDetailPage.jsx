import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ProductInfo from '@/components/features/detail/ProductInfo';
import ProductGallery from '@/components/features/detail/ProductGallery';
import ProductDetails from '@/components/features/detail/ProductDetails';
import ExpandSection from '@/components/features/detail/ExpandSection';
import Spinner from '@/components/ui/Spinner';
import { getProductById } from '../services/apiProduct';
import { convertKeysToCamelCase } from '../../utils/caseConverter';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getProductData = async () => {
      setLoading(true);
      try {
        const data = await getProductById(id); // ✅ gọi đúng 1 sản phẩm
        const camelized = convertKeysToCamelCase(data);
        setProduct(camelized);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Không tìm thấy sản phẩm.');
      } finally {
        setLoading(false);
      }
    };

    getProductData();
  }, [id]);

  if (loading) {
    return (
      <main className='min-h-screen flex items-center justify-center'>
        <Spinner className='w-12 h-12 text-blue-500' />
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className='min-h-screen flex items-center justify-center'>
        <p className='text-gray-500 text-lg'>
          {error || 'Không tìm thấy sản phẩm.'}
        </p>
      </main>
    );
  }

  return (
    <main className='bg-white w-full max-w-[1200px] mx-auto px-4 py-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        <ProductGallery
          image={product.image}
          thumbnails={
            product.thumbnails
              ? product.thumbnails.split(',').map((url) => url.trim())
              : []
          }
        />
        <ProductInfo product={product} />
      </div>

      <div className='mt-10'>
        <ProductDetails product={product} />
      </div>

      <div className='mt-8'>
        <ExpandSection product={product} />
      </div>
    </main>
  );
};

export default ProductDetailPage;
