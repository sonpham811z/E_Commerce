import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Spinner from '../../ui/Spinner';

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Spinner className='w-10 h-10' color='text-red-500' />;
  }

  if (!user) {
    // Redirect to login page but save the attempted url
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  return children;
}
