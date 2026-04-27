import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import ModalWrapper from '../ui/ModalWrapper';
import { toast } from 'react-hot-toast';
import { supabase } from '../services/supabase';
import SocialLogin from '../ui/SocialLogin';
import { useNavigate } from 'react-router-dom';

export default function ForgotPasswordModal({ onClose }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const { mutate: sendResetLink, isLoading: isEmailLoading } = useMutation({
    mutationFn: async ({ email }) => {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password#access_token=`,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Link đặt lại mật khẩu đã được gửi đến email của bạn!');
      onClose();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    sendResetLink({ email });
  };

  return (
    <ModalWrapper onClose={onClose}>
      <div className='max-w-4xl w-full bg-white rounded-xl overflow-hidden'>
        <div className='text-3xl font-bold text-center py-4 bg-red-500 border-b border-red-800 text-white'>
          Quên mật khẩu?
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2'>
          {/* Left - Form nội dung */}
          <div className='flex flex-col justify-center px-12 py-8'>
            <p className='text-base text-gray-600 mb-6 text-center'>
              Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu
            </p>

            <form
              onSubmit={handleEmailSubmit}
              className='space-y-5 max-w-sm mx-auto'
            >
              <input
                type='email'
                name='email'
                placeholder='Nhập email của bạn'
                className='w-full px-4 py-2.5 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-red-500'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type='submit'
                disabled={isEmailLoading}
                className='w-full py-2.5 bg-red-600 text-white text-base font-semibold rounded-md hover:bg-red-700 transition disabled:opacity-50'
              >
                {isEmailLoading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
              </button>
            </form>

            <div className='text-sm text-center mt-6'>
              <span className='text-gray-600'>Bạn đã nhớ mật khẩu? </span>
              <button
                onClick={() => navigate('/home', { state: { modal: 'login' } })}
                className='text-red-600 hover:underline font-medium'
              >
                Đăng nhập
              </button>
            </div>
          </div>

          {/* Right - Social login */}
          <div className='flex flex-col justify-center px-12 py-8 bg-gray-50 border-l border-gray-200'>
            <div className='w-full max-w-[320px] mx-auto flex flex-col justify-center h-full'>
              <p className='text-gray-600 text-base text-center mb-4'>
                Hoặc đăng nhập bằng
              </p>
              <SocialLogin />
            </div>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
