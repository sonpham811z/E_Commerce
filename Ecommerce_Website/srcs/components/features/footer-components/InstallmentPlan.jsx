const InstallmentPlan = () => {
  return (
    <div className='max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md'>
      <h1 className='text-xl sm:text-2xl font-bold text-blue-800 mb-4 sm:mb-6 leading-tight'>
        1. Trả góp qua công ty tài chính HD SAISON
      </h1>

      <section className='mb-6 sm:mb-8'>
        <h2 className='text-lg sm:text-xl font-semibold text-blue-700 mb-3 sm:mb-4'>
          A. Điều kiện
        </h2>
        <p className='mb-2 text-sm sm:text-base'>
          Công dân Việt Nam từ 18 đến 70 tuổi
        </p>
        <ul className='list-disc pl-4 sm:pl-6 mb-3 sm:mb-4 text-sm sm:text-base space-y-1'>
          <li>
            Chứng minh nhân dân (CMND) hoặc Căn cước công dân (CCCD) còn giá trị
          </li>
          <li>Hộ khẩu tại TP. Hồ Chí Minh và Hà Nội</li>
        </ul>
      </section>

      <section className='mb-6 sm:mb-8'>
        <h2 className='text-lg sm:text-xl font-semibold text-blue-700 mb-3 sm:mb-4'>
          B. Hình thức đăng ký
        </h2>

        <div className='mb-4 sm:mb-6'>
          <h3 className='text-base sm:text-lg font-medium text-blue-600 mb-2 sm:mb-3'>
            Cách 1: Duyệt hồ sơ tại Showroom GEARVN
          </h3>
          <p className='mb-3 sm:mb-4 italic text-sm sm:text-base'>
            Khách hàng mang đầy đủ hồ sơ đến Showroom GEARVN để được tư vấn sản
            phẩm và thẩm định hồ sơ trực tiếp.
          </p>

          <div className='overflow-x-auto'>
            <table className='min-w-full border border-gray-300 text-sm'>
              <thead>
                <tr className='bg-gray-100'>
                  <th className='border p-2 sm:p-3 text-xs sm:text-sm font-medium'>
                    Khoản vay dưới 20 triệu
                  </th>
                  <th className='border p-2 sm:p-3 text-xs sm:text-sm font-medium'>
                    Khoản vay từ 20 - 40 triệu
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className='border p-2 sm:p-3 text-xs sm:text-sm'>
                    <ul className='list-disc pl-3 sm:pl-5'>
                      <li>CMND/CCCD còn hiệu lực (15 năm kể từ ngày cấp)</li>
                    </ul>
                  </td>
                  <td className='border p-2 sm:p-3 text-xs sm:text-sm'>
                    <p className='mb-2'>
                      Bao gồm tất cả các điều kiện của các khoản vay thấp hơn
                      và:
                    </p>
                    <ul className='list-disc pl-3 sm:pl-5 space-y-1'>
                      <li>Hóa đơn điện nước/internet/điện thoại</li>
                      <li>Hợp đồng lao động hoặc bảng lương công ty cấp</li>
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className='bg-yellow-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6'>
          <h4 className='font-medium text-yellow-800 mb-2 text-sm sm:text-base'>
            Lưu ý:
          </h4>
          <ul className='list-disc pl-4 sm:pl-6 text-yellow-800 text-sm space-y-1'>
            <li>Thời gian duyệt hồ sơ từ 10 - 30 phút</li>
            <li>Hồ sơ cần bản gốc để đối chiếu</li>
          </ul>
        </div>

        <div className='mb-4 sm:mb-6'>
          <h3 className='text-base sm:text-lg font-medium text-blue-600 mb-2 sm:mb-3'>
            Vay từ 40 - 60 triệu
          </h3>
          <p className='text-sm sm:text-base mb-2'>
            Bao gồm tất cả các điều kiện của các khoản vay thấp hơn và:
          </p>
          <ul className='list-disc pl-4 sm:pl-6 text-sm sm:text-base space-y-1'>
            <li>Hợp đồng lao động còn hiệu lực</li>
            <li>Bảng lương 3 tháng gần nhất/bảo hiểm y tế</li>
            <li>
              Giấy phép kinh doanh và hóa đơn thuế 3 tháng gần nhất (đối với
              doanh nghiệp)
            </li>
          </ul>
        </div>

        <div className='mb-4 sm:mb-6'>
          <h3 className='text-base sm:text-lg font-medium text-blue-600 mb-2 sm:mb-3'>
            Cách 2: Duyệt hồ sơ thông qua điện thoại
          </h3>
          <p className='mb-3 sm:mb-4 text-sm sm:text-base'>
            Đăng ký và duyệt hồ sơ nhanh chóng qua điện thoại.
          </p>

          <div className='space-y-3 sm:space-y-4'>
            <div className='bg-gray-50 p-3 rounded-md'>
              <h4 className='font-medium mb-1 sm:mb-2 text-sm sm:text-base'>
                Bước 1
              </h4>
              <p className='text-sm sm:text-base'>
                Khách hàng gửi hồ sơ đến GEARVN
              </p>
            </div>
            <div className='bg-gray-50 p-3 rounded-md'>
              <h4 className='font-medium mb-1 sm:mb-2 text-sm sm:text-base'>
                Bước 2
              </h4>
              <p className='text-sm sm:text-base'>
                Nhận cuộc gọi từ HD SAISON trong vòng 15 phút để xác minh thông
                tin
              </p>
            </div>
            <div className='bg-gray-50 p-3 rounded-md'>
              <h4 className='font-medium mb-1 sm:mb-2 text-sm sm:text-base'>
                Bước 3
              </h4>
              <p className='text-sm sm:text-base'>
                Khách hàng mang giấy tờ đến GEARVN để hoàn tất thủ tục
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className='text-lg sm:text-xl font-semibold text-blue-700 mb-3 sm:mb-4'>
          C. Phương thức thanh toán khoản vay hàng tháng
        </h2>
        <div className='space-y-2 sm:space-y-3'>
          <p className='text-sm sm:text-base'>
            <strong>Bước 1:</strong> Tra cứu khoản vay hàng tháng tại HD SAISON
          </p>
          <p className='text-sm sm:text-base'>
            <strong>Bước 2:</strong> Thanh toán khoản vay theo các phương thức
            hỗ trợ
          </p>
        </div>
      </section>
    </div>
  );
};

export default InstallmentPlan;
