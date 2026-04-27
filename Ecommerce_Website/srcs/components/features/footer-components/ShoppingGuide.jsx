const ShoppingGuide = () => {
  return (
    <div className='max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md text-sm sm:text-base'>
      <h1 className='text-xl sm:text-2xl font-bold text-blue-800 mb-4 sm:mb-6'>
        Hướng dẫn mua hàng
      </h1>

      <div className='mb-6 sm:mb-8'>
        <p className='mb-2 sm:mb-4'>Cách mua hàng trên website GEARVN.COM</p>
        <p className='mb-2 sm:mb-4'>
          Không cần trực tiếp đến các cửa hàng mua hàng, bạn có thể chọn mua
          hàng online bằng những cách thức mua hàng sau:
        </p>

        <div className='space-y-3 sm:space-y-4 mb-4 sm:mb-6'>
          <div className='p-3 sm:p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r'>
            <h3 className='font-bold mb-1 sm:mb-2'>Cách 1:</h3>
            <p>
              Gọi điện thoại đến tổng đài GEARVN (1900.5301) từ (8:00 - 21:00)
              tất cả các ngày trong tuần kể cả các ngày lễ tết, nhân viên của
              GEARVN luôn sẵn sàng phục vụ, tư vấn và hỗ trợ Quý khách hàng mua
              được các sản phẩm ưng ý nhất.
            </p>
          </div>

          <div className='p-3 sm:p-4 border-l-4 border-green-500 bg-green-50 rounded-r'>
            <h3 className='font-bold mb-1 sm:mb-2'>Cách 2:</h3>
            <p>Đặt mua hàng online trên website gearvn.com</p>
          </div>
        </div>
      </div>

      <div className='mb-6 sm:mb-8'>
        <h2 className='text-lg sm:text-xl font-semibold mb-3 sm:mb-4'>
          Bước 1: Tìm sản phẩm cần mua
        </h2>
        <p className='mb-2 sm:mb-4'>
          Đầu tiên bạn có thể truy cập vào website gearvn.com để tìm và chọn sản
          phẩm muốn mua theo các cách như:
        </p>
        <ul className='list-disc pl-4 sm:pl-6 mb-3 sm:mb-4 space-y-2'>
          <li>
            Sử dụng ô tìm kiếm phía trên, nhập tên sản phẩm muốn mua (có thể tìm
            tên chính xác, tìm theo mã hoặc tìm theo hãng...) website sẽ cung
            cấp cho bạn những gợi ý chính xác để bạn lựa chọn
          </li>
        </ul>
      </div>

      <div className='p-3 sm:p-4 bg-gray-100 rounded-lg'>
        <h3 className='font-bold mb-2'>Nhập từ khóa tìm kiếm sản phẩm</h3>
        <p>
          Website luôn có sẵn những gợi ý sản phẩm nổi bật nhất, sản phẩm đang
          có các chương trình khuyến mãi hấp dẫn để bạn chọn mà không cần phải
          tìm kiếm:
        </p>
        <div className='mt-3 sm:mt-4'>
          <input
            type='text'
            placeholder='Tìm kiếm sản phẩm...'
            className='w-full p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
          />
        </div>
      </div>
    </div>
  );
};

export default ShoppingGuide;
