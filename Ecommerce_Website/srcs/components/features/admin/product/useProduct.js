import { useQuery } from '@tanstack/react-query';
import { getProduct } from '../../../services/apiProduct';

export function useProduct() {
  const { isLoading, data: products } = useQuery({
    queryKey: ['products'],
    queryFn: getProduct,
  });

  return {
    isLoading,
    products: products ?? [],
  };
}
