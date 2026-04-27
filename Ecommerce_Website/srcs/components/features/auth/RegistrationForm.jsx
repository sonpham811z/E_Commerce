import { useState } from 'react';
import { HiEye, HiEyeOff, HiUser, HiMail, HiPhone, HiLockClosed } from 'react-icons/hi';
import Spinner from '@/components/ui/Spinner';
import AnimatedDiv from '@/components/ui/AnimatedDiv';
import { useRegisterFormLogic } from './useRegisterFormLogic';

function InputField({ icon: Icon, error, children }) {
  return (
    <div>
      <div className={`flex items-center border rounded-lg overflow-hidden transition-colors ${error ? 'border-red-400' : 'border-gray-300 focus-within:border-red-500'}`}>
        <span className='pl-3 pr-2 text-gray-400'>
          <Icon className='w-4 h-4' />
        </span>
        {children}
      </div>
      {error && <p className='mt-1 text-xs text-red-500'>{error.message}</p>}
    </div>
  );
}

function RegistrationForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const {
    register,
    handleSubmit,
    errors,
    watch,
    onSubmit,
    loading,
    error,
    success,
  } = useRegisterFormLogic();

  return (
    <AnimatedDiv className='w-full'>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='space-y-3 w-full max-w-[340px] mx-auto'
      >
        {error && (
          <div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
            <p className='text-xs text-red-600'>{error}</p>
          </div>
        )}
        {success && (
          <div className='p-3 bg-green-50 border border-green-200 rounded-lg'>
            <p className='text-xs text-green-600'>{success}</p>
          </div>
        )}

        <InputField icon={HiUser} error={errors.fullName}>
          <input
            type='text'
            placeholder='Họ và tên'
            className='w-full py-2.5 pr-3 text-sm bg-transparent focus:outline-none text-gray-800 placeholder-gray-400'
            {...register('fullName', {
              required: 'Vui lòng nhập họ và tên',
              minLength: { value: 2, message: 'Tên phải có ít nhất 2 ký tự' },
            })}
          />
        </InputField>

        <InputField icon={HiMail} error={errors.email}>
          <input
            type='email'
            placeholder='Email'
            className='w-full py-2.5 pr-3 text-sm bg-transparent focus:outline-none text-gray-800 placeholder-gray-400'
            {...register('email', {
              required: 'Vui lòng nhập email',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Email không hợp lệ',
              },
            })}
          />
        </InputField>

        <InputField icon={HiPhone} error={errors.phone}>
          <input
            type='tel'
            placeholder='Số điện thoại'
            className='w-full py-2.5 pr-3 text-sm bg-transparent focus:outline-none text-gray-800 placeholder-gray-400'
            {...register('phone', {
              required: 'Vui lòng nhập số điện thoại',
              pattern: {
                value: /^[0-9+\-\s()]{7,20}$/,
                message: 'Số điện thoại không hợp lệ',
              },
            })}
          />
        </InputField>

        <InputField icon={HiLockClosed} error={errors.password}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder='Mật khẩu (ít nhất 8 ký tự)'
            className='w-full py-2.5 text-sm bg-transparent focus:outline-none text-gray-800 placeholder-gray-400'
            {...register('password', {
              required: 'Vui lòng nhập mật khẩu',
              minLength: { value: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
            })}
          />
          <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            className='pr-3 text-gray-400 hover:text-gray-600'
          >
            {showPassword ? <HiEyeOff className='w-4 h-4' /> : <HiEye className='w-4 h-4' />}
          </button>
        </InputField>

        <InputField icon={HiLockClosed} error={errors.confirmPassword}>
          <input
            type={showConfirm ? 'text' : 'password'}
            placeholder='Xác nhận mật khẩu'
            className='w-full py-2.5 text-sm bg-transparent focus:outline-none text-gray-800 placeholder-gray-400'
            {...register('confirmPassword', {
              required: 'Vui lòng xác nhận mật khẩu',
              validate: (value) =>
                value === watch('password') || 'Mật khẩu không khớp',
            })}
          />
          <button
            type='button'
            onClick={() => setShowConfirm(!showConfirm)}
            className='pr-3 text-gray-400 hover:text-gray-600'
          >
            {showConfirm ? <HiEyeOff className='w-4 h-4' /> : <HiEye className='w-4 h-4' />}
          </button>
        </InputField>

        <button
          type='submit'
          disabled={loading || !!success}
          className={`w-full py-2.5 mt-1 bg-red-600 text-white text-sm font-semibold rounded-lg transition-all ${
            loading || success
              ? 'opacity-70 cursor-not-allowed'
              : 'hover:bg-red-700 active:scale-95'
          }`}
        >
          {loading ? (
            <span className='flex items-center justify-center gap-2'>
              <Spinner className='w-4 h-4' /> Đang đăng ký...
            </span>
          ) : success ? (
            'Đăng ký thành công!'
          ) : (
            'Đăng ký'
          )}
        </button>
      </form>
    </AnimatedDiv>
  );
}

export default RegistrationForm;
