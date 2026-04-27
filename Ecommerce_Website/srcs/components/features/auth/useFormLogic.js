import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { apiLogin } from '@/components/services/apiLogin';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/components/features/auth/AuthContext';

export function useLoginFormLogic() {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState('');
  const { setAuthData } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const mutation = useMutation({
    mutationFn: apiLogin,

    onSuccess: (userData) => {
      setLoginError('');
      setAuthData(userData.user, userData.session.access_token);
      navigate('/home', { replace: true });
    },

    onError: (error) => {
      console.error('Login error:', error);
      setLoginError(error.message || 'Đăng nhập thất bại');
    },
  });

  const onSubmit = (data) => mutation.mutate(data);

  return {
    register,
    handleSubmit,
    errors,
    onSubmit,
    isLoading: mutation.isLoading,
    loginError,
  };
}
