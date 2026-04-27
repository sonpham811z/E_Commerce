import { Outlet } from 'react-router-dom';
import { useAdmin } from '../hooks/useAdmin';
import Spinner from '../ui/Spinner';

// DEVELOPMENT MODE - Authentication Bypass
const BYPASS_AUTH = false;

const AdminRoute = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();

  if (adminLoading) {
    return <Spinner className='w-10 h-10' />;
  }

  // Không bypass, kiểm tra quyền thực tế
  if (!isAdmin) {
    return (
      <div className='flex flex-col items-center justify-center h-96'>
        <h2 className='text-2xl font-bold text-red-600 mb-4'>
          Bạn không có quyền truy cập
        </h2>
        <p className='text-gray-600 mb-6'>
          Vui lòng đăng nhập bằng tài khoản admin để truy cập trang này.
        </p>
      </div>
    );
  }

  return <Outlet />;
};

export default AdminRoute;
