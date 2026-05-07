import { Link } from 'react-router-dom';

const formatPrice = (value) => {
  const num = Number(value);
  if (!value || isNaN(num) || num === 0) return '';
  return num.toLocaleString('vi-VN') + '₫';
};

const ProductSearch = ({ product }) => {
  const displayPrice = formatPrice(product.sale_price || product.price);
  const originalPrice = formatPrice(product.original_price);
  const hasDiscount = originalPrice && displayPrice && originalPrice !== displayPrice;

  return (
    <Link
      to={`/product/${product.id}`}
      className='flex justify-between items-center gap-3 p-2 hover:bg-gray-100 transition'
    >
      <img
        src={product.image}
        alt={product.title || product.name}
        className='w-12 h-12 object-cover rounded'
      />
      <div className='flex-1 flex flex-col'>
        <p className='text-sm font-medium text-gray-800 line-clamp-1'>
          {product.title || product.name}
        </p>
        <p className='text-xs text-gray-500'>{product.brand}</p>
      </div>
      <div className='text-right'>
        {hasDiscount && (
          <p className='text-xs text-gray-400 line-through'>{originalPrice}</p>
        )}
        {displayPrice && (
          <p className='text-sm text-red-600 font-semibold'>{displayPrice}</p>
        )}
      </div>
    </Link>
  );
};

export default ProductSearch;
