import { useEffect, useState } from 'react';
import { getFeaturedProducts } from '../services/apiProduct';
import { convertKeysToCamelCase } from '@/utils/caseConverter';

export function useGetFeaturedProducts(category) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    getFeaturedProducts(category)
      .then((data) => {
        const converted = convertKeysToCamelCase(data);

        const sorted = [...converted]
          .sort((a, b) => {
            if ((b.rating || 0) !== (a.rating || 0)) {
              return (b.rating || 0) - (a.rating || 0);
            } else {
              return (b.reviewCount || 0) - (a.reviewCount || 0);
            }
          })
          .slice(0, 15);

        setProducts(sorted);
      })
      .catch((err) => {
        console.error('Lỗi khi lấy featured products:', err);
        setError('Không thể tải sản phẩm nổi bật.');
      })
      .finally(() => setLoading(false));
  }, [category]);

  return { products, loading, error };
}
