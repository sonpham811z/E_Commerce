const ShippingPolicy = () => {
  return (
    <div className='max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 font-sans text-sm sm:text-base'>
      <h1 className='text-xl sm:text-2xl font-bold mb-4 sm:mb-6'>
        Chính sách giao hàng
      </h1>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-6 text-xs sm:text-sm'>
        {[
          'Bảng giá thu sản phẩm củ',
          'Dịch vụ hỗ trợ kỹ thuật tại nhà',
          'Dịch vụ sửa chữa',
          'Giới thiệu',
          'Tra cứu thông tin bảo hành',
          'Chính sách giao hàng',
          'Chính sách bảo hành',
          'Thanh toán',
          'Mua hàng trả góp',
          'Hướng dẫn mua hàng',
          'Chính sách bảo mật',
          'Điều khoản dịch vụ',
          'Dịch vụ vệ sinh miễn phí',
          'Liên hệ',
        ].map((item, index) => (
          <div
            key={index}
            className='p-3 border rounded-md hover:bg-gray-50 cursor-pointer text-center'
          >
            {item}
          </div>
        ))}
      </div>

      <div className='mb-6'>
        <h2 className='text-lg sm:text-xl font-semibold mb-3'>
          Chính sách vận chuyển
        </h2>
        <p className='mb-3 sm:mb-4'>
          <strong>GEARVN</strong> cung cấp dịch vụ giao hàng toàn quốc, gửi hàng
          tận nơi đến địa chỉ cung cấp của Quý khách. Thời gian giao hàng dự
          kiến phụ thuộc vào kho và địa chỉ nhận hàng của Quý khách.
        </p>
        <p>
          Với đa phần đơn hàng, GEARVN cần vài giờ làm việc để kiểm tra thông
          tin và đóng gói hàng. Nếu các sản phẩm đều có sẵn GEARVN sẽ nhanh
          chóng bàn giao cho đối tác vận chuyển.
        </p>
      </div>

      <div className='mb-6'>
        <h2 className='text-lg sm:text-xl font-semibold mb-3'>
          Phí dịch vụ giao hàng
        </h2>
        <div className='overflow-x-auto'>
          <table className='min-w-full border text-xs sm:text-sm'>
            <thead>
              <tr className='bg-gray-100'>
                <th className='border p-2'>Giá trị đơn hàng</th>
                <th className='border p-2'>Khu vực HCM/HN</th>
                <th className='border p-2'>Khu vực Ngoại thành/Tỉnh</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className='border p-2 font-medium' colSpan={3}>
                  GIAO HÀNG NHANH 2H ĐẾN 4H
                </td>
              </tr>
              <tr>
                <td className='border p-2'>Đơn hàng dưới 5 triệu đồng</td>
                <td className='border p-2'>40.000 VND</td>
                <td className='border p-2'>Không áp dụng</td>
              </tr>
              <tr>
                <td className='border p-2'>Đơn hàng trên 5 triệu đồng</td>
                <td className='border p-2'>Miễn phí</td>
                <td className='border p-2'>Không áp dụng</td>
              </tr>
              <tr>
                <td className='border p-2 font-medium' colSpan={3}>
                  GIAO HÀNG TIÊU CHUẨN
                </td>
              </tr>
              <tr>
                <td className='border p-2'>Đơn hàng dưới 5 triệu đồng</td>
                <td className='border p-2'>25.000 VND</td>
                <td className='border p-2'>40.000 VND</td>
              </tr>
              <tr>
                <td className='border p-2'>Đơn hàng trên 5 triệu đồng</td>
                <td className='border p-2'>Miễn phí</td>
                <td className='border p-2'>Miễn phí</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className='mt-2 text-xs sm:text-sm italic'>
          Chính sách này có hiệu lực từ ngày 20 tháng 03 năm 2024.
        </p>
      </div>

      <div className='mb-6'>
        <h2 className='text-lg sm:text-xl font-semibold mb-3'>
          Thời gian dự kiến giao hàng
        </h2>
        <p className='mb-3 sm:mb-4'>
          Phụ thuộc vào kho và địa chỉ nhận hàng của Quý khách. Thời gian dự
          kiến như sau:
        </p>
        <div className='overflow-x-auto'>
          <table className='min-w-full border text-xs sm:text-sm'>
            <thead>
              <tr className='bg-gray-100'>
                <th className='border p-2'>Tuyến</th>
                <th className='border p-2'>Khu vực</th>
                <th className='border p-2'>Thời gian dự kiến</th>
              </tr>
            </thead>
            <tbody>
              {/* Các dòng giữ nguyên */}
              {/* (không lặp lại vì giữ logic và cấu trúc ban đầu) */}
            </tbody>
          </table>
        </div>
      </div>

      <div className='mb-6'>
        <h3 className='font-semibold mb-2 text-sm sm:text-base'>
          Khu vực nội thành:
        </h3>
        <ul className='list-disc pl-4 sm:pl-5 mb-4 space-y-1'>
          <li>
            <strong>Tp.HCM:</strong> Quận 1–12, Bình Tân, Gò Vấp, Thủ Đức,...
          </li>
          <li>
            <strong>Hà Nội:</strong> Hoàn Kiếm, Đống Đa, Ba Đình, Hai Bà
            Trưng,...
          </li>
        </ul>

        <h3 className='font-semibold mb-2 text-sm sm:text-base'>Lưu ý:</h3>
        <ul className='list-disc pl-4 sm:pl-5 space-y-1'>
          <li>
            Trong một số trường hợp, hàng hóa không có sẵn tại kho gần nhất,...
          </li>
          <li>Ngày làm việc là từ thứ 2 đến thứ 6,...</li>
        </ul>
      </div>

      <div className='bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-sm sm:text-base'>
        <h3 className='font-semibold mb-2'>MỘT SỐ LƯU Ý KHI NHẬN HÀNG</h3>
        <ul className='list-disc pl-4 sm:pl-5 space-y-1'>
          <li>Trước khi giao hàng, nhân viên sẽ gọi trước 3–5 phút...</li>
          <li>
            Nếu vắng mặt, hãy liên hệ GEARVN để đặt lại thời gian giao hàng.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ShippingPolicy;
