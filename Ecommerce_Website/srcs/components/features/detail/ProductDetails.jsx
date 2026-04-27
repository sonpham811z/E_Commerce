const ProductDetails = ({ product }) => {
  if (!product) return null;

  return (
    <section className='mt-10'>
      <h2 className='text-2xl font-bold mb-4'>Thông tin chi tiết sản phẩm</h2>
      <h3 className='text-lg font-semibold mb-2'>Mô tả chung</h3>

      {/* Mô tả chung */}
      {product.description && (
        <>
          <p className='text-gray-700 leading-relaxed mb-4'>
            {product.description}
          </p>
        </>
      )}

      {/* Hình minh hoạ */}
      {product.detailImage && (
        <div className='w-full my-6 rounded-xl overflow-hidden'>
          <img
            src={product.detailImage}
            alt={product.title}
            className='w-full object-cover rounded-md shadow-md'
          />
        </div>
      )}

      {/* Trải nghiệm */}
      {product.performance && (
        <>
          <h3 className='text-lg font-semibold mb-2'>
            Hiệu suất và trải nghiệm
          </h3>
          <p className='text-gray-700 leading-relaxed'>{product.performance}</p>
        </>
      )}
    </section>
  );
};

export default ProductDetails;
