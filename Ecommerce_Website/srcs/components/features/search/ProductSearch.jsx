import { Link } from 'react-router-dom';

const ProductSearch = ({ product }) => {
  return (
    <Link
      to={`/product/${product.id}`}
      className='flex justify-between items-center gap-3 p-2 hover:bg-gray-100 transition'
    >
      <img
        src={product.image}
        alt={product.title}
        className='w-12 h-12 object-cover rounded'
      />
      <div className='flex-1 flex flex-col'>
        <p className='text-sm font-medium text-gray-800 line-clamp-1'>
          {product.title}
        </p>
        <p className='text-xs text-gray-500'>{product.brand}</p>
      </div>
      <p className='text-sm text-red-600 font-semibold'>
        {Number(product.sale_price).toLocaleString('vi-VN')}₫
      </p>
    </Link>
  );
};

export default ProductSearch;
