import NotificationItem from '../components/NotificationItem';
import TrianglePointer from '../components/TrianglePointer';

function NotificationsPage() {
  return (
    <section className='w-full min-h-screen bg-gray-100 flex justify-center p-3 sm:p-5'>
      <div className='relative w-full max-w-sm sm:w-[424px]'>
        <div className='hidden sm:block'>
          <TrianglePointer />
        </div>
        <section className='bg-white shadow-lg mt-0 sm:mt-7 p-4 sm:p-5 rounded-xl'>
          <h1 className='text-lg sm:text-xl font-bold font-sans mb-4 sm:mb-6 text-gray-900'>
            Thông báo mới nhất
          </h1>
          <div className='space-y-0 divide-y divide-gray-100'>
            <NotificationItem
              title='Cảnh báo: Tài khoản đăng nhập ở thiết bị khác'
              description={
                <>
                  Tài khoản của bạn vừa được đăng nhập ở{' '}
                  <strong>TP.Hồ Chí Minh, lúc 6:00 ngày 01/01/2025.</strong> Vui
                  lòng xác thực việc đăng nhập hoặc liên hệ bộ phận tư vấn để
                  được hỗ trợ.
                </>
              }
              color='bg-red-600'
              icon={
                <svg
                  width='36'
                  height='36'
                  className='w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11'
                  viewBox='0 0 44 44'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M22 42C33.0457 42 42 33.0457 42 22C42 10.9543 33.0457 2 22 2C10.9543 2 2 10.9543 2 22C2 33.0457 10.9543 42 22 42Z'
                    fill='white'
                  />
                  <path
                    d='M22 9L22.02 18.5V26.5M22 30H22.02M42 22C42 33.0457 33.0457 42 22 42C10.9543 42 2 33.0457 2 22C2 10.9543 10.9543 2 22 2C33.0457 2 42 10.9543 42 22Z'
                    stroke='#EA1A1A'
                    strokeWidth='2.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              }
            />
            <NotificationItem
              title='Khuyến mãi: Voucher và khuyến mãi hè siêu hấp dẫn'
              description='Mùa hè đã tới cùng nhiều ưu đãi và khuyến mãi siêu hấp dẫn, hãy nhanh tay đăng nhập và bóc cho mình những voucher xịn xò!!!'
              color='bg-orange-400'
              icon={
                <svg
                  width='38'
                  height='28'
                  className='w-8 h-6 sm:w-9 sm:h-7 md:w-12 md:h-9'
                  viewBox='0 0 46 34'
                  fill='white'
                >
                  <circle cx='23' cy='17' r='15' />
                </svg>
              }
            />
            <NotificationItem
              title='Freeship: Miễn phí giao hàng toàn quốc'
              description='Miễn phí giao hàng những đơn hàng có giá từ 300K trong phạm vi toàn quốc.'
              color='bg-emerald-500'
              icon={
                <svg
                  width='36'
                  height='28'
                  className='w-8 h-6 sm:w-9 sm:h-7 md:w-11 md:h-8'
                  viewBox='0 0 42 32'
                  fill='white'
                >
                  <rect width='42' height='32' />
                </svg>
              }
            />
            <NotificationItem
              title='Thông báo: Lịch nghỉ lễ 30/04 - 01/05'
              description={
                <>
                  <strong>Từ ngày 30/04 đến hết 02/05</strong> Cửa hàng xin trân
                  trọng thông báo lịch nghỉ lễ. Chúc quý khách hàng sẽ có một kỳ
                  nghỉ lễ thật tuyệt vời!
                </>
              }
              color='bg-blue-500'
              icon={
                <svg
                  width='32'
                  height='24'
                  className='w-7 h-5 sm:w-8 sm:h-6 md:w-10 md:h-7'
                  viewBox='0 0 38 28'
                  fill='white'
                >
                  <polygon points='0,0 38,0 38,28 0,28' />
                </svg>
              }
            />
            <NotificationItem
              title='Nhắc nhở: Cập nhật địa chỉ Email'
              description='Nhằm gia tăng tính bảo mật, quý khách vui lòng cập nhật địa chỉ Email để nhận thông báo và tình trạng đơn hàng.'
              color='bg-yellow-400'
              icon={
                <svg
                  width='32'
                  height='24'
                  className='w-7 h-5 sm:w-8 sm:h-6 md:w-10 md:h-7'
                  viewBox='0 0 38 28'
                  fill='white'
                >
                  <rect width='38' height='28' />
                </svg>
              }
            />
          </div>
        </section>
      </div>
    </section>
  );
}

export default NotificationsPage;
