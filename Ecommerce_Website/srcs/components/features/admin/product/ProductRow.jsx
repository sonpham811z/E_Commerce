import { HiTrash } from 'react-icons/hi2';
import { useDeleteProduct } from './useDeleteProduct';

function ProductRow({ product }) {
  const { isDeleting, deleteProduct } = useDeleteProduct();
  const {
    id: productID,
    title,
    category,
    sale_price,
    discount,
    image,
  } = product;

  return (
    <div
      className='grid grid-cols-[0.6fr_0.5fr_0.8fr_2.5fr_1.2fr_1fr_1fr] gap-x-6 items-center py-4 px-6 border-b border-gray-200 justify-center'
      role='row'
    >
      {/* Hình ảnh */}
      <img
        src={image}
        alt={title}
        className='w-16 aspect-video object-cover object-center'
      />

      {/* ID */}
      <div className='text-sm text-gray-700'>{productID}</div>

      {/* Category */}
      <div className='text-sm text-gray-700'>{category}</div>

      {/* Name */}
      <div className='font-semibold text-gray-800 text-base'>{title}</div>

      {/* Price */}
      <div className='font-semibold text-sm text-gray-900'>
        {Number(sale_price).toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND',
        })}
      </div>

      {/* Discount */}
      <div className='text-sm font-medium text-green-600'>
        {discount ? `${(discount * 100).toFixed(0)}%` : <span>&mdash;</span>}
      </div>

      {/* Actions */}
      <div className='flex justify-center items-center gap-3'>
        <button
          onClick={() => deleteProduct(productID)}
          disabled={isDeleting}
          className='bg-red-600 text-white rounded p-1.5 hover:bg-red-700 transition'
        >
          <HiTrash className='w-5 h-5' />
        </button>
      </div>
    </div>
  );
}

export default ProductRow;
