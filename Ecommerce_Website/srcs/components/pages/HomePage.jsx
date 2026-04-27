import LeftColumn from '@/components/features/columns/LeftColumn';
import CenterColumn from '@/components/features/columns/CenterColumn';
import RightColumn from '@/components/features/columns/RightColumn';
import ChatBotContainer from '@/components/features/chatBot/ChatBotContainer';
import LoginModal from './LoginModal';
import RegistrationModal from './RegistrationModal';
import ForgotPasswordModal from './ForgotPasswordModal';
import ProductFeatured from './ProductFeatured';
import { useLocation, useNavigate } from 'react-router-dom';

function HomePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const modalType = location.state?.modal;

  const handleCloseModal = () => {
    navigate('/home', { replace: true });
  };

  return (
    <main className='bg-white max-w-[1200px] mx-auto px-2 sm:px-4 py-2'>
      <div
        className='grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-5'
        style={{ height: 'auto' }}
      >
        <div className='md:col-span-9 h-full mt-3 sm:mt-6'>
          <CenterColumn />
        </div>
        <div className='hidden md:block md:col-span-3 h-full mt-3 md:mt-0'>
          <RightColumn />
        </div>
      </div>

      <div className='hidden md:grid grid-cols-12 gap-3 sm:gap-5'>
        <div className='col-span-12'>
          <LeftColumn />
        </div>
      </div>

      <div className='mt-6 sm:mt-8'>
        <ProductFeatured />
      </div>

      <div className='mt-auto'>
        <ChatBotContainer />
      </div>

      {modalType === 'login' && <LoginModal />}
      {modalType === 'register' && <RegistrationModal />}
      {modalType === 'forgot-password' && (
        <ForgotPasswordModal onClose={handleCloseModal} />
      )}
    </main>
  );
}

export default HomePage;
