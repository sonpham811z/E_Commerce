function ProductMiniCard({
  id,
  title,
  image,
  salePrice,
  originalPrice,
  onSelect,
  className,
}) {
  return (
    <div
      className={`min-w-[160px] max-w-full bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200 overflow-hidden ${className}`}
    >
      {/* Image */}
      <div className='p-3 flex items-center justify-center h-24 bg-gray-50'>
        <img
          src={image}
          alt={title}
          className='max-h-full max-w-full object-contain'
        />
      </div>

      {/* Content */}
      <div className='p-3 border-t border-gray-100'>
        {/* Title */}
        <h3 className='text-sm text-gray-700 line-clamp-2 mb-2 h-10 leading-5'>
          {title}
        </h3>

        {/* Price */}
        <div className='mb-3'>
          <div className='flex items-baseline gap-2'>
            {salePrice && (
              <span className='text-base font-semibold text-gray-900'>
                {Number(salePrice).toLocaleString('vi-VN')}đ
              </span>
            )}
            {originalPrice && originalPrice !== salePrice && (
              <span className='text-xs text-gray-400 line-through'>
                {Number(originalPrice).toLocaleString('vi-VN')}đ
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className='flex items-center justify-between'>
          <a
            href={`/product/${id}`}
            target='_blank'
            rel='noopener noreferrer'
            className='text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2'
          >
            Chi tiết
          </a>

          <button
            onClick={onSelect}
            className='bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded transition-colors'
          >
            Chọn
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductMiniCard;
