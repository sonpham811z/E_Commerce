const WarrantyPolicy = () => {
  return (
    <div className='max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 font-sans text-sm sm:text-base'>
      <h1 className='text-xl sm:text-2xl font-bold mb-4 sm:mb-6'>
        Chính sách bảo hành cho khách hàng HAADTech
      </h1>

      <div className='flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6'>
        <button className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm sm:text-base'>
          Tra cứu phiếu bảo hành
        </button>
        <button className='px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-sm sm:text-base'>
          Tra cứu IMEI
        </button>
      </div>

      <p className='mb-3 sm:mb-4'>
        Quý khách vui lòng nhập cả 2 trường thông tin (bắt buộc) để tra cứu
        trạng thái của phiếu bảo hành.
      </p>

      <div className='bg-gray-50 p-4 sm:p-6 rounded-lg'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4'>
          <div>
            <label className='block mb-1 sm:mb-2 font-medium text-sm'>
              Số điện thoại
            </label>
            <input
              type='tel'
              className='w-full p-2 border rounded-md text-sm'
              placeholder='Nhập số điện thoại'
            />
          </div>
          <div>
            <label className='block mb-1 sm:mb-2 font-medium text-sm'>
              Mã phiếu bảo hành
            </label>
            <input
              type='text'
              className='w-full p-2 border rounded-md text-sm'
              placeholder='Nhập mã phiếu bảo hành'
            />
          </div>
        </div>
        <button className='w-full sm:w-auto bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 text-sm sm:text-base'>
          Tra cứu
        </button>
      </div>
    </div>
  );
};

export default WarrantyPolicy;
