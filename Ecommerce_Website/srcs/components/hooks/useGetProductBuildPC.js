import { useEffect, useState } from 'react';
import { getProductsByCategory } from '../services/apiBuildPC';

export function useGetProductsByCategory(category) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!category) return;

    const fetchData = async () => {
      try {
        const data = await getProductsByCategory(category);
        setProducts(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    setError(null);
    fetchData();
  }, [category]);

  return { products, loading, error };
}
