const PaymentGuide = () => {
  return (
    <div className='max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md'>
      <h1 className='text-xl sm:text-2xl font-bold text-blue-800 mb-4 sm:mb-6'>
        Hướng dẫn thanh toán
      </h1>

      <div className='mb-4 sm:mb-6'>
        <p className='text-sm sm:text-base mb-2 sm:mb-4'>
          Quý khách hàng có thể thanh toán đơn hàng bằng cách chuyển khoản qua
          tài khoản của GEARVN tại ngân hàng dưới đây và liên hệ Hotline
          1900.5301 để xác nhận thông tin.
        </p>
      </div>

      <div className='mb-6 sm:mb-8 p-4 sm:p-6 bg-gray-100 rounded-lg'>
        <h2 className='text-lg sm:text-xl font-semibold mb-3 sm:mb-4'>
          Ngân hàng Thương mại Cổ phần Quân đội
        </h2>
        <div className='space-y-2 sm:space-y-3 text-sm sm:text-base'>
          <p>
            <span className='font-medium'>Chủ tài khoản:</span> Công ty TNHH
            Thương mại GEARVN
          </p>
          <p>
            <span className='font-medium'>Chi nhánh:</span> Đồng Sài Gòn - PGD:
            Quận 10
          </p>
          <p>
            <span className='font-medium'>Số tài khoản:</span> 1111126868888
          </p>
        </div>
      </div>

      <div className='flex flex-col md:flex-row gap-6 sm:gap-8 items-center'>
        <div className='w-full md:w-1/2'>
          <h3 className='text-base sm:text-lg font-medium mb-3 sm:mb-4'>
            Quét mã QR để thanh toán
          </h3>
          <div className='border-2 border-dashed border-gray-300 p-6 sm:p-8 rounded-lg flex justify-center items-center'>
            <div className='text-center'>
              <div className='w-32 h-32 sm:w-40 sm:h-40 bg-gray-200 mx-auto mb-3 sm:mb-4 flex items-center justify-center'>
                <span className='text-gray-500 text-sm'>Mã QR thanh toán</span>
              </div>
              <p className='text-xs sm:text-sm text-gray-600'>
                Sử dụng ứng dụng ngân hàng để quét mã
              </p>
            </div>
          </div>
        </div>

        <div className='w-full md:w-1/2'>
          <h3 className='text-base sm:text-lg font-medium mb-3 sm:mb-4'>
            Thông tin bổ sung
          </h3>
          <ul className='list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2 text-sm sm:text-base'>
            <li>Vui lòng ghi rõ mã đơn hàng trong nội dung chuyển khoản</li>
            <li>Thanh toán sẽ được xử lý trong vòng 1-2 giờ làm việc</li>
            <li>Liên hệ hotline nếu không nhận được xác nhận sau 2 giờ</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentGuide;
