import { useState, useEffect } from 'react';
import ProductRow from '../products/ProductRow';
import { fetchProducts } from '../products/apiProduct';
import Spinner from '@/components/ui/Spinner';

const RelatedProducts = ({ currentProductId, category }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRelated = async () => {
      setLoading(true);
      try {
        const data = await fetchProducts(category);
        // Lọc ra sản phẩm hiện tại để không bị trùng
        const filtered = data.filter((p) => p.id !== currentProductId);
        // Lấy 10 sản phẩm
        setRelatedProducts(filtered.slice(0, 10));
      } catch (error) {
        console.error('Lỗi khi lấy sản phẩm liên quan:', error);
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      getRelated();
    }
  }, [category, currentProductId]);

  if (loading) {
    return (
      <div className='flex justify-center py-8'>
        <Spinner className='w-8 h-8 text-red-500' />
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className='mt-12 mb-8'>
      <h2 className='text-2xl font-bold mb-6 text-gray-800 border-b pb-2'>
        Sản phẩm có liên quan
      </h2>
      <ProductRow
        products={relatedProducts}
        isCategoryPage={false}
        hideTitle={true}
      />
    </div>
  );
};

export default RelatedProducts;
