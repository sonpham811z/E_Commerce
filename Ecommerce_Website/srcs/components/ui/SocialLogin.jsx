import AnimatedDiv from './AnimatedDiv';
import AnimatedButton from './AnimatedButton';

function SocialLogin({ actionType }) {
  return (
    <AnimatedDiv
      className='w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg space-y-3 sm:space-y-4 px-4 sm:px-0'
      delay={0.5}
    >
      <AnimatedButton
        className='w-full flex items-center justify-center gap-2 sm:gap-3 py-2 sm:py-3 px-3 sm:px-5 border rounded-lg sm:rounded-xl bg-white hover:bg-gray-100 hover:scale-105 transition-all duration-200'
        delay={0.5}
      >
        <img
          src='/google.svg'
          className='w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0'
          alt='Google'
        />
        <span className='text-sm sm:text-base lg:text-lg font-medium sm:font-semibold text-gray-800 truncate'>
          {actionType === 'register'
            ? 'Đăng ký bằng Google'
            : 'Đăng nhập bằng Google'}
        </span>
      </AnimatedButton>

      <AnimatedButton
        className='w-full flex items-center justify-center gap-2 sm:gap-3 py-2 sm:py-3 px-3 sm:px-5 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 hover:scale-105 transition-all duration-200'
        delay={0.6}
      >
        <img
          src='/facebook.svg'
          className='w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0'
          alt='Facebook'
        />
        <span className='text-sm sm:text-base lg:text-lg font-medium sm:font-semibold truncate'>
          {actionType === 'register'
            ? 'Đăng ký bằng Facebook'
            : 'Đăng nhập bằng Facebook'}
        </span>
      </AnimatedButton>

      <AnimatedButton
        className='w-full flex items-center justify-center gap-2 sm:gap-3 py-2 sm:py-3 px-3 sm:px-5 border border-black rounded-lg bg-white hover:bg-gray-100 hover:scale-105 transition-all duration-200'
        delay={0.7}
      >
        <img
          src='/github.svg'
          className='w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0'
          alt='Github'
        />
        <span className='text-sm sm:text-base lg:text-lg font-medium sm:font-semibold text-black truncate'>
          {actionType === 'register'
            ? 'Đăng ký bằng Github'
            : 'Đăng nhập bằng Github'}
        </span>
      </AnimatedButton>
    </AnimatedDiv>
  );
}

export default SocialLogin;
