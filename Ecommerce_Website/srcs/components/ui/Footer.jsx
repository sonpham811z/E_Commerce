import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';

function Footer() {
  return (
    <footer className='bg-gray-100 text-gray-700 py-8 sm:py-10 md:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 text-sm md:text-base'>
      <div className='max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-10'>
        {/* VỀ CHÚNG TÔI */}
        <section>
          <h3 className='font-semibold text-gray-900 mb-3 sm:mb-4 text-base sm:text-lg'>
            VỀ CHÚNG TÔI
          </h3>
          <ul className='space-y-1 sm:space-y-2'>
            <li>
              <Link
                to='/about'
                className='block px-2 sm:px-3 py-1 rounded-md transform transition duration-300 hover:scale-105 hover:bg-red-600 hover:text-white text-sm sm:text-base'
              >
                Giới thiệu
              </Link>
            </li>
            <li>
              <Link
                to='/jobs'
                className='block px-2 sm:px-3 py-1 rounded-md transform transition duration-300 hover:scale-105 hover:bg-red-600 hover:text-white text-sm sm:text-base'
              >
                Tuyển dụng
              </Link>
            </li>
            <li>
              <Link
                to='/contact'
                className='block px-2 sm:px-3 py-1 rounded-md transform transition duration-300 hover:scale-105 hover:bg-red-600 hover:text-white text-sm sm:text-base'
              >
                Liên hệ
              </Link>
            </li>
          </ul>
        </section>

        {/* CHÍNH SÁCH */}
        <section>
          <h3 className='font-semibold text-gray-900 mb-3 sm:mb-4 text-base sm:text-lg'>
            CHÍNH SÁCH
          </h3>
          <ul className='space-y-1 sm:space-y-2'>
            <li>
              <Link
                to='/warranty-policy'
                className='block px-2 sm:px-3 py-1 rounded-md transform transition duration-300 hover:scale-105 hover:bg-red-600 hover:text-white text-sm sm:text-base'
              >
                Chính sách bảo hành
              </Link>
            </li>
            <li>
              <Link
                to='/shipping-policy'
                className='block px-2 sm:px-3 py-1 rounded-md transform transition duration-300 hover:scale-105 hover:bg-red-600 hover:text-white text-sm sm:text-base'
              >
                Chính sách giao hàng
              </Link>
            </li>
            <li>
              <Link
                to='/privacy-policy'
                className='block px-2 sm:px-3 py-1 rounded-md transform transition duration-300 hover:scale-105 hover:bg-red-600 hover:text-white text-sm sm:text-base'
              >
                Chính sách bảo mật
              </Link>
            </li>
          </ul>
        </section>

        {/* THÔNG TIN */}
        <section className='md:col-span-1 lg:col-span-1'>
          <h3 className='font-semibold text-gray-900 mb-3 sm:mb-4 text-base sm:text-lg'>
            THÔNG TIN
          </h3>
          <ul className='space-y-1 sm:space-y-2'>
            <li>
              <Link
                to='/showrooms'
                className='block px-2 sm:px-3 py-1 rounded-md transform transition duration-300 hover:scale-105 hover:bg-red-600 hover:text-white text-sm sm:text-base'
              >
                Hệ thống cửa hàng
              </Link>
            </li>
            <li>
              <Link
                to='/shopping-guide'
                className='block px-2 sm:px-3 py-1 rounded-md transform transition duration-300 hover:scale-105 hover:bg-red-600 hover:text-white text-sm sm:text-base'
              >
                Hướng dẫn mua hàng
              </Link>
            </li>
            <li>
              <Link
                to='/payment-guide'
                className='block px-2 sm:px-3 py-1 rounded-md transform transition duration-300 hover:scale-105 hover:bg-red-600 hover:text-white text-sm sm:text-base'
              >
                Hướng dẫn thanh toán
              </Link>
            </li>
            <li>
              <Link
                to='/installment'
                className='block px-2 sm:px-3 py-1 rounded-md transform transition duration-300 hover:scale-105 hover:bg-red-600 hover:text-white text-sm sm:text-base'
              >
                Hướng dẫn trả góp
              </Link>
            </li>
            <li>
              <Link
                to='/warranty-lookup'
                className='block px-2 sm:px-3 py-1 rounded-md transform transition duration-300 hover:scale-105 hover:bg-red-600 hover:text-white text-sm sm:text-base'
              >
                Tra cứu địa chỉ bảo hành
              </Link>
            </li>
          </ul>
        </section>

        {/* TỔNG ĐÀI */}
        <section className='sm:col-span-2 md:col-span-1 lg:col-span-1'>
          <h3 className='font-semibold text-gray-900 mb-3 sm:mb-4 text-base sm:text-lg'>
            TỔNG ĐÀI HỖ TRỢ (8:00 - 21:00)
          </h3>
          <ul className='space-y-1 text-sm sm:text-base'>
            <li>
              <strong>Mua hàng:</strong>{' '}
              <span className='inline-block'>1900 1234</span>
            </li>
            <li>
              <strong>Bảo hành:</strong>{' '}
              <span className='inline-block'>1900 5678</span>
            </li>
            <li>
              <strong>Khiếu nại:</strong>{' '}
              <span className='inline-block'>1900 9999</span>
            </li>
            <li className='break-all sm:break-normal'>
              <strong>Email:</strong>{' '}
              <span className='inline-block'>support@gearvn.vn</span>
            </li>
          </ul>
        </section>

        {/* VẬN CHUYỂN & THANH TOÁN */}
        <section className='sm:col-span-2 md:col-span-3 lg:col-span-1'>
          <h3 className='font-semibold text-gray-900 mb-3 sm:mb-4 text-base sm:text-lg'>
            ĐƠN VỊ VẬN CHUYỂN
          </h3>
          <p className='text-gray-500 text-xs sm:text-sm mb-4 sm:mb-5'>
            Giao hàng nhanh, an toàn, đúng hẹn.
          </p>
          <h3 className='font-semibold text-gray-900 mb-2 sm:mb-3 text-base sm:text-lg'>
            CÁCH THỨC THANH TOÁN
          </h3>
          <p className='text-gray-500 text-xs sm:text-sm'>
            COD / Visa / Momo / Chuyển khoản
          </p>
        </section>
      </div>

      {/* SOCIAL */}
      <div className='mt-8 sm:mt-10 md:mt-12 border-t border-gray-300 pt-4 sm:pt-6 text-center'>
        <h3 className='font-semibold text-gray-900 mb-3 sm:mb-4 text-base sm:text-lg'>
          KẾT NỐI VỚI CHÚNG TÔI
        </h3>
        <div className='flex justify-center gap-3 sm:gap-4 lg:gap-6 text-base sm:text-lg'>
          {[
            { icon: FaFacebookF, color: 'hover:bg-[#1877F2]' },
            { icon: FaTwitter, color: 'hover:bg-[#1DA1F2]' },
            {
              icon: FaInstagram,
              color:
                'hover:bg-gradient-to-br hover:from-pink-500 hover:to-yellow-500',
            },
            { icon: FaYoutube, color: 'hover:bg-[#FF0000]' },
          ].map((item, index) => (
            <a
              key={index}
              href='#'
              className={`bg-gray-200 p-2 sm:p-3 rounded-full transform transition duration-300 hover:scale-110 hover:text-white ${item.color}`}
            >
              <item.icon />
            </a>
          ))}
        </div>

        <p className='text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4 px-4'>
          © {new Date().getFullYear()} HAAD Tech - All rights reserved
        </p>
      </div>
    </footer>
  );
}

export default Footer;
