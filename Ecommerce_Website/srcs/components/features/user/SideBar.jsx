import { Link, useLocation } from 'react-router-dom';
import { useUser } from './UserContext';
import { FaRegUser, FaBoxOpen } from 'react-icons/fa';
import { HiOutlineLocationMarker } from 'react-icons/hi';
import { BiTime } from 'react-icons/bi';
import { FiLogOut } from 'react-icons/fi';
import { useAuth } from '../auth/AuthContext';

function SidebarItem({ to, icon, label, active, onClick }) {
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`flex items-center gap-3 px-5 py-3 w-full text-left rounded-lg transition-all duration-200 ${
          active
            ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-600 font-medium shadow-sm'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <span
          className={`text-lg ${active ? 'text-red-500' : 'text-gray-500'}`}
        >
          {icon}
        </span>
        <span className='transition-all duration-200'>{label}</span>
      </button>
    );
  }

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-5 py-3 rounded-lg transition-all duration-200 ${
        active
          ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-600 font-medium shadow-sm'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span className={`text-lg ${active ? 'text-red-500' : 'text-gray-500'}`}>
        {icon}
      </span>
      <span className='transition-all duration-200'>{label}</span>
    </Link>
  );
}

function Sidebar() {
  const { userInfo } = useUser();
  const location = useLocation();
  const path = location.pathname;
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      // No need to navigate here since signOut function handles it
    } catch (error) {
      console.error('Error signing out:', error);
      // Force reload on error
      window.location.href = '/home';
    }
  };

  return (
    <div className='bg-white border-0 rounded-2xl w-full shadow-lg p-5 transition-all duration-300 hover:shadow-xl'>
      <div className='text-center mb-6'>
        <div className='w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-red-100 shadow-md transform hover:scale-105 transition-transform duration-300'>
          <img
            src='/default-user.jpg'
            alt='avatar'
            className='w-full h-full object-cover'
          />
        </div>

        <h2 className='font-bold text-xl text-gray-800'>
          {userInfo?.fullName || 'Người dùng'}
        </h2>
        <p className='text-gray-500 text-sm mt-1'>
          {userInfo?.email || 'Chưa có email'}
        </p>
      </div>

      <div className='h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4'></div>

      <nav className='flex flex-col gap-2'>
        <SidebarItem
          to='/user'
          icon={<FaRegUser />}
          label='Thông tin tài khoản'
          active={path === '/user'}
        />
        <SidebarItem
          to='/user/address'
          icon={<HiOutlineLocationMarker />}
          label='Địa chỉ'
          active={path === '/user/address'}
        />
        <SidebarItem
          to='/user/orders'
          icon={<FaBoxOpen />}
          label='Quản lý đơn hàng'
          active={path === '/user/orders'}
        />
        <SidebarItem
          to='/user/history'
          icon={<BiTime />}
          label='Lịch sử mua hàng'
          active={path === '/user/history'}
        />

        <div className='h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-2'></div>

        <SidebarItem
          icon={<FiLogOut />}
          label='Đăng xuất'
          onClick={handleSignOut}
        />
      </nav>
    </div>
  );
}

export default Sidebar;
