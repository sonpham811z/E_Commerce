const PrivacyPolicy = () => {
  return (
    <div className='max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 font-sans text-sm sm:text-base'>
      <h1 className='text-xl sm:text-2xl font-bold mb-4 sm:mb-6'>
        Chính sách bảo mật thông tin
      </h1>

      <div className='space-y-6 sm:space-y-8'>
        {/* Mục 1 */}
        <section>
          <h2 className='text-lg sm:text-xl font-semibold mb-2 sm:mb-3'>
            1. Mục đích và phạm vi thu thập thông tin
          </h2>
          <p className='mb-3 sm:mb-4'>
            GEARVN không bán, chia sẻ hay trao đổi thông tin cá nhân của khách
            hàng thu thập trên trang web cho một bên thứ ba nào khác.
          </p>
          <p className='mb-3 sm:mb-4'>
            Thông tin cá nhân thu thập được sẽ chỉ được sử dụng trong nội bộ
            công ty. Khi bạn liên hệ đăng ký dịch vụ, thông tin cá nhân mà
            GEARVN thu thập bao gồm:
          </p>

          <div className='overflow-x-auto mb-3 sm:mb-4 text-xs sm:text-sm'>
            <table className='min-w-full border'>
              <thead>
                <tr className='bg-gray-100'>
                  <th className='border p-2'>Họ và tên</th>
                  <th className='border p-2'>Địa chỉ</th>
                  <th className='border p-2'>Điện thoại</th>
                  <th className='border p-2'>Email</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className='border p-2' colSpan={4}>
                    Ngoài thông tin cá nhân là các thông tin về dịch vụ:
                  </td>
                </tr>
                <tr>
                  <td className='border p-2'>Tên sản phẩm</td>
                  <td className='border p-2'>Số lượng</td>
                  <td className='border p-2' colSpan={2}>
                    Thời gian giao nhận sản phẩm
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Mục 2 */}
        <section>
          <h2 className='text-lg sm:text-xl font-semibold mb-2 sm:mb-3'>
            2. Phạm vi sử dụng thông tin
          </h2>
          <p className='mb-3 sm:mb-4'>
            Thông tin cá nhân thu thập được sẽ chỉ được GEARVN sử dụng trong nội
            bộ công ty và cho một hoặc tất cả các mục đích sau:
          </p>
          <ul className='list-disc pl-4 sm:pl-5 mb-3 sm:mb-4 space-y-1'>
            <li>Hỗ trợ khách hàng</li>
            <li>Cung cấp thông tin liên quan đến dịch vụ</li>
            <li>
              Xử lý đơn đặt hàng và cung cấp dịch vụ và thông tin qua trang web
              của chúng tôi theo yêu cầu của bạn
            </li>
          </ul>
          <p className='mb-3 sm:mb-4'>
            Chúng tôi có thể sẽ gửi thông tin sản phẩm, dịch vụ mới, thông tin
            về các sự kiện sắp tới hoặc thông tin tuyển dụng nếu quý khách đăng
            ký nhận email thông báo.
          </p>
          <p>
            Trong trường hợp có yêu cầu của pháp luật, Công ty có trách nhiệm
            hợp tác cung cấp thông tin cá nhân khách hàng khi có yêu cầu từ cơ
            quan có thẩm quyền bao gồm việc kiểm soát, tòa án, cơ quan công an
            điều tra liên quan đến hành vi phạm pháp luật của khách hàng. Ngoài
            ra không ai có quyền xâm phạm vào thông tin cá nhân của khách hàng.
          </p>
        </section>

        {/* Mục 3 */}
        <section>
          <h2 className='text-lg sm:text-xl font-semibold mb-2 sm:mb-3'>
            3. Thời gian lưu trữ thông tin
          </h2>
          <p>
            Đối với thông tin cá nhân, GEARVN chỉ xóa đi dữ liệu này nếu khách
            hàng có yêu cầu, khách hàng yêu cầu gửi mail về cskth@gearvn.com.
          </p>
        </section>

        {/* Mục 4 */}
        <section>
          <h2 className='text-lg sm:text-xl font-semibold mb-2 sm:mb-3'>
            4. Những người hoặc tổ chức có thể được tiếp cận với thông tin cá
            nhân
          </h2>
          <p className='mb-3 sm:mb-4'>
            Đối tượng được tiếp cận với thông tin cá nhân của khách hàng thuộc
            một trong những trường hợp sau:
          </p>
          <ul className='list-disc pl-4 sm:pl-5 space-y-1'>
            <li>Công Ty TNHH Thương Mại GEARVN</li>
            <li>
              Các đối tác có ký hợp đồng thực hiện 1 phần dịch vụ do Công Ty
              TNHH Thương Mại GEARVN. Các đối tác này sẽ nhận được những thông
              tin theo thỏa thuận hợp đồng (có thể một phần hoặc toàn bộ thông
              tin tùy theo điều khoản hợp đồng) để tiến hành hỗ trợ người dùng
              sử dụng dịch vụ do Công Ty cung cấp.
            </li>
          </ul>
        </section>

        {/* Mục 5 */}
        <section>
          <h2 className='text-lg sm:text-xl font-semibold mb-2 sm:mb-3'>
            5. Địa chỉ của đơn vị thu thập và quản lý thông tin cá nhân
          </h2>
          <p className='mb-2'>
            <strong>Công Ty TNHH Thương Mại GEARVN</strong>
          </p>
          <ul className='list-disc pl-4 sm:pl-5 space-y-1'>
            <li>
              Địa chỉ: 82 Hoàng Hoa Thám, Phường 12, Quận Tân Bình, TP HCM
            </li>
            <li>Điện thoại: 1800 6175</li>
            <li>Website: www.gearvn.com</li>
            <li>Email: cskth@gearvn.com</li>
          </ul>
        </section>

        {/* Mục 6 */}
        <section>
          <h2 className='text-lg sm:text-xl font-semibold mb-2 sm:mb-3'>
            6. Phương tiện và công cụ để người dùng tiếp cận và chỉnh sửa dữ
            liệu cá nhân của mình
          </h2>
          <p className='mb-3 sm:mb-4'>
            GEARVN không thu thập thông tin khách hàng qua trang web, thông tin
            cá nhân khách hàng được thực hiện thu thập qua email liên hệ đặt mua
            sản phẩm, dịch vụ gửi về hòm email của chúng tôi: cskth@gearvn.com
            hoặc số điện thoại liên hệ đặt mua sản phẩm gọi về Hotline 1800
            6075.
          </p>
          <p>
            Bạn có thể liên hệ địa chỉ email hoặc số điện thoại trên để yêu cầu
            GEARVN chỉnh sửa dữ liệu cá nhân của mình.
          </p>
        </section>

        {/* Mục 7 */}
        <section>
          <h2 className='text-lg sm:text-xl font-semibold mb-2 sm:mb-3'>
            7. Cơ chế tiếp nhận và giải quyết khiếu nại...
          </h2>
          <p>[Nội dung về cơ chế giải quyết khiếu nại]</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
