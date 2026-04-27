import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { deleteProduct as deleteProductApi } from '../../../services/apiProduct';

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { isLoading: isDeleting, mutate: deleteProduct } = useMutation({
    mutationFn: (id) => deleteProductApi(id),
    onSuccess: () => {
      toast.success('Sản phẩm đã được xoá!');
      queryClient.invalidateQueries({
        queryKey: ['products'],
      });
    },
    onError: (err) => toast.error(err.message),
  });
  return { isDeleting, deleteProduct };
}
