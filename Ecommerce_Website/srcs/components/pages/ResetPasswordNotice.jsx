import AnimatedPage from '@/components/ui/AnimatedPage';
import { Link } from 'react-router-dom';
import { FaEnvelope } from 'react-icons/fa';

export default function ResetPasswordNotice() {
  return (
    <AnimatedPage>
      <div className='max-w-xl w-full bg-white rounded-xl overflow-hidden'>
        <div className='text-3xl font-bold text-center py-4 bg-red-500 border-b border-red-800 text-white'>
          Kiểm tra email của bạn
        </div>

        <div className='px-12 py-8'>
          <div className='mb-6 flex justify-center'>
            <FaEnvelope className='w-16 h-16 text-red-600' />
          </div>
          <p className='text-base text-gray-600 mb-4 text-center'>
            Chúng tôi đã gửi email hướng dẫn đặt lại mật khẩu đến địa chỉ email
            của bạn.
          </p>
          <p className='text-sm text-gray-500 mb-6 text-center'>
            Vui lòng kiểm tra hộp thư đến và làm theo hướng dẫn để đặt lại mật
            khẩu. Nếu bạn không thấy email trong hộp thư đến, hãy kiểm tra thư
            mục spam.
          </p>
          <div className='space-y-4 max-w-sm mx-auto'>
            <Link
              to='/home'
              className='block w-full py-2.5 bg-red-600 text-white rounded-md text-base font-semibold text-center hover:bg-red-700 transition'
            >
              Về trang chủ
            </Link>
            <Link
              to='/forgot-password'
              className='block w-full py-2.5 border border-gray-300 text-gray-700 rounded-md text-base font-semibold text-center hover:bg-gray-50 transition'
            >
              Gửi lại email
            </Link>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
