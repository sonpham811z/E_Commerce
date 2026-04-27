import { useEffect, useState } from 'react';
import { countProduct } from '../../../services/apiProduct';

export function useCountProduct() {
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      const count = await countProduct();
      setTotalProducts(count);
      setIsLoading(false);
    };

    fetchCount();
  }, []);

  return { totalProducts, isLoading };
}
