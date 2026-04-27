import { useState } from 'react';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import AnimatedDiv from '@/components/ui/AnimatedDiv';
import AnimatedButton from '@/components/ui/AnimatedButton';
import SocialLogin from '@/components/ui/SocialLogin';
import { useLoginFormLogic } from './useFormLogic';

function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, errors, onSubmit, isLoading, loginError } =
    useLoginFormLogic();

  return (
    <AnimatedDiv className='max-w-4xl w-full bg-white rounded-xl overflow-hidden'>
      <div className='text-2xl sm:text-3xl font-bold text-center py-4 bg-red-500 border-b border-red-800 text-white'>
        Đăng Nhập
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 min-h-[400px]'>
        {/* Left: Form */}
        <div className='flex flex-col justify-center px-8 py-8 bg-white order-1 lg:order-1'>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='w-full max-w-[320px] mx-auto space-y-5'
          >
            <AnimatedDiv>
              <input
                type='text'
                placeholder='Email hoặc Số điện thoại'
                className='w-full px-4 py-2.5 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-red-500'
                {...register('username', {
                  required: 'Vui lòng nhập email hoặc số điện thoại',
                })}
              />
              {errors.username && (
                <p className='text-red-500 text-sm mt-1'>
                  {errors.username.message}
                </p>
              )}
            </AnimatedDiv>

            <AnimatedDiv className='relative'>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder='Mật khẩu'
                className='w-full px-4 py-2.5 border border-gray-300 rounded-md text-base pr-12 focus:outline-none focus:ring-2 focus:ring-red-500'
                {...register('password', {
                  required: 'Vui lòng nhập mật khẩu',
                })}
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-2.5 text-sm text-gray-600'
              >
                {showPassword ? (
                  <HiEyeOff className='w-5 h-5 text-gray-600' />
                ) : (
                  <HiEye className='w-5 h-5 text-gray-600' />
                )}
              </button>
              {errors.password && (
                <p className='text-red-500 text-sm mt-1'>
                  {errors.password.message}
                </p>
              )}
            </AnimatedDiv>

            {loginError && (
              <p className='text-red-600 text-sm font-medium text-center'>
                {loginError}
              </p>
            )}

            <div className='flex justify-between text-sm text-red-600'>
              <span
                onClick={() =>
                  navigate('/home', { state: { modal: 'forgot-password' } })
                }
                className='hover:underline cursor-pointer'
              >
                Quên mật khẩu?
              </span>
              <span
                onClick={() =>
                  navigate('/home', {
                    state: { modal: 'register' },
                    replace: true,
                  })
                }
                className='hover:underline cursor-pointer'
              >
                Đăng ký
              </span>
            </div>

            <AnimatedButton
              type='submit'
              className='w-full py-2.5 bg-red-600 text-white text-base font-semibold rounded-md hover:bg-red-700 hover:scale-103'
              disabled={isLoading}
            >
              {isLoading ? (
                <div className='w-5 h-5 border-4 border-white rounded-full animate-spin mx-auto'></div>
              ) : (
                'Đăng nhập'
              )}
            </AnimatedButton>
          </form>
        </div>

        {/* Right: Social login */}

        <div className='flex flex-col justify-center px-8 py-8 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200 order-2 lg:order-2'>
          <div className='w-full max-w-[320px] mx-auto flex flex-col justify-center h-full'>
            <p className='text-gray-600 text-base text-center mb-4'>
              Hoặc đăng nhập bằng
            </p>

            <SocialLogin actionType='login' />
          </div>
        </div>
      </div>
    </AnimatedDiv>
  );
}

export default LoginForm;
