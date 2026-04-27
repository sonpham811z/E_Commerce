import LoginForm from '@/components/features/auth/LoginForm';
import ModalWrapper from '../ui/ModalWrapper';
import { useNavigate } from 'react-router-dom';

function LoginModal() {
  const navigate = useNavigate();
  const handleClose = () => {
    navigate('/home', { replace: true });
  };

  return (
    <ModalWrapper onClose={handleClose}>
      <LoginForm />
    </ModalWrapper>
  );
}

export default LoginModal;
