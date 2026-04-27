import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createProduct as apiCreateProduct } from '@/components/services/apiProduct';

export function useCreateProduct() {
  const queryClient = useQueryClient();

  const { mutate: createProduct, isLoading: isCreating } = useMutation({
    mutationFn: apiCreateProduct,
    onSuccess: () => {
      toast.success('Đã thêm sản phẩm mới!');
      queryClient.invalidateQueries({
        queryKey: ['products'],
      });
    },
    onError: (err) => toast.error(err.message),
  });

  return { createProduct, isCreating };
}
