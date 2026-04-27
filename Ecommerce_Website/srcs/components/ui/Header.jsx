import {
  IoChevronDownOutline,
  IoNotificationsOutline,
  IoCartOutline,
  IoPersonOutline,
} from 'react-icons/io5';
import { LiaPuzzlePieceSolid } from 'react-icons/lia';
import { FaUserShield } from 'react-icons/fa';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LaptopCategories from '../features/categories/LaptopCategories';
import NotificationList from '../features/notify/NotificationList';
import { useNotifications } from '../features/notify/NotificationContext';
import { useAuth } from '../features/auth/AuthContext';
import { useUser } from '../features/user/UserContext';
import { useCart } from '@/utils/CartContext';
import { useAdmin } from '../hooks/useAdmin'; // Import hook mới
import UserDropdownMenu from './UserDropdownMenu';
import Search from '../features/search/Search';

function Header() {
  const [showCategories, setShowCategories] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const { newCount: notificationCount } = useNotifications();
  const { user, signOut } = useAuth();
  const { userInfo } = useUser();
  const { cart } = useCart();
  const { isAdmin, loading: adminLoading } = useAdmin(); // Sử dụng hook mới

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const handleLoginClick = () => {
    navigate('/home', { state: { modal: 'login' } });
  };

  const handleShoppingClick = () => {
    navigate('/shopping-cart');
  };

  const handleUserMenuClick = () => {
    setShowUserMenu((prev) => !prev);
  };

  const handleGoToUser = () => {
    navigate('/user');
    setShowUserMenu(false);
  };

  const handleGoToOrders = () => {
    navigate('/user/orders');
    setShowUserMenu(false);
  };

  const handleGoToAdmin = () => {
    navigate('/admin');
    setShowUserMenu(false);
  };

  const handleSignOut = () => {
    signOut();
    setShowUserMenu(false);
    navigate('/home');
  };

  const handleGoToBuilPC = () => {
    navigate('/build-PC');
  };

  return (
    <header className='bg-red-600 text-white py-2 sm:py-3 px-3 sm:px-4 lg:px-6 shadow-lg sticky top-0 z-50 font-sans'>
      <div className='flex flex-col lg:flex-row lg:flex-wrap items-center justify-between gap-2 sm:gap-3 lg:gap-4'>
        <div className='flex items-center gap-2 sm:gap-3 lg:gap-4 flex-grow relative w-full lg:w-auto'>
          {/* LOGO */}
          <div
            className='flex items-center gap-1 sm:gap-2 cursor-pointer flex-shrink-0'
            onClick={() => navigate('/home')}
          >
            <img
              src='/srcs/assets/logo/Logo-1.png'
              alt='GearVN Logo'
              className='w-20 sm:w-24 md:w-28 lg:w-30 h-8 sm:h-10 md:h-11 lg:h-12 object-contain'
            />
          </div>

          {/* DANH MỤC */}
          <div
            className='group relative hidden md:block'
            onMouseEnter={() => {
              clearTimeout(hideTimeoutRef.current);
              setShowCategories(true);
            }}
            onMouseLeave={() => {
              hideTimeoutRef.current = setTimeout(() => {
                setShowCategories(false);
              }, 200);
            }}
          >
            <div
              className='flex items-center gap-1 sm:gap-2 bg-red-700 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg cursor-pointer hover:bg-red-800 hover:scale-105 hover:shadow-lg transition-all duration-300 ease-in-out'
              onClick={() => setShowCategories(!showCategories)}
            >
              <span className='text-sm sm:text-base font-semibold tracking-wide whitespace-nowrap'>
                Danh mục
              </span>
              <IoChevronDownOutline
                className={`text-lg sm:text-xl transition-transform ${
                  showCategories ? 'rotate-180' : ''
                }`}
              />
            </div>
            {showCategories && (
              <LaptopCategories onClose={() => setShowCategories(false)} />
            )}
          </div>

          <div className='relative flex-grow max-w-xl w-full lg:w-auto'>
            <Search />
          </div>
        </div>

        <div className='flex items-center gap-1 sm:gap-2 lg:gap-4 w-full lg:w-auto justify-center lg:justify-end flex-wrap'>
          <div
            className='flex items-center gap-1 sm:gap-2 cursor-pointer hover:bg-red-700 hover:scale-105 hover:shadow-lg px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-300 ease-in-out'
            onClick={handleGoToBuilPC}
          >
            <LiaPuzzlePieceSolid className='text-lg sm:text-xl' />
            <span className='text-xs sm:text-sm lg:text-base font-medium hidden sm:inline whitespace-nowrap'>
              Build PC
            </span>
          </div>

          {/* Chỉ hiển thị nút Quản lý khi đã load xong và user là admin */}
          {!adminLoading && isAdmin && (
            <div
              className='flex items-center gap-1 sm:gap-2 cursor-pointer hover:bg-red-700 hover:scale-105 hover:shadow-lg px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-300 ease-in-out'
              onClick={handleGoToAdmin}
            >
              <FaUserShield className='text-lg sm:text-xl' />
              <span className='text-xs sm:text-sm lg:text-base font-medium hidden sm:inline whitespace-nowrap'>
                Quản lý
              </span>
            </div>
          )}

          <div className='relative' ref={notificationRef}>
            <div
              className='flex items-center gap-1 sm:gap-2 cursor-pointer hover:bg-red-700 hover:scale-105 hover:shadow-lg px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-300 ease-in-out'
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <div className='relative'>
                <IoNotificationsOutline className='text-lg sm:text-xl' />
                {notificationCount > 0 && (
                  <span className='absolute -top-2 -right-2 bg-yellow-400 text-red-700 text-xs font-bold rounded-full w-4 sm:w-5 h-4 sm:h-5 flex items-center justify-center'>
                    {notificationCount}
                  </span>
                )}
              </div>
              <span className='text-xs sm:text-sm lg:text-base font-medium hidden sm:inline whitespace-nowrap'>
                Thông báo
              </span>
            </div>
            {showNotifications && <NotificationList />}
          </div>

          <div
            className='relative flex items-center gap-1 sm:gap-2 cursor-pointer hover:bg-red-700 hover:scale-105 hover:shadow-lg px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-300 ease-in-out'
            onClick={handleShoppingClick}
          >
            <div className='relative'>
              <IoCartOutline className='text-lg sm:text-xl' />
              {cart.length > 0 && (
                <span className='absolute -top-2 -right-2 bg-yellow-400 text-red-700 text-xs font-bold rounded-full w-4 sm:w-5 h-4 sm:h-5 flex items-center justify-center'>
                  {cart.length > 9 ? '9+' : cart.length}
                </span>
              )}
            </div>
            <span className='text-xs sm:text-sm lg:text-base font-medium hidden sm:inline whitespace-nowrap'>
              Giỏ hàng
            </span>
          </div>

          {user ? (
            <div className='relative' ref={userMenuRef}>
              <div
                className='flex items-center gap-1 sm:gap-2 bg-orange-500 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-full cursor-pointer hover:bg-orange-600 hover:scale-105 hover:shadow-lg transition-all duration-300 ease-in-out'
                onClick={handleUserMenuClick}
              >
                <img
                  src={'/default-user.jpg'}
                  alt='avatar'
                  className='w-6 sm:w-7 lg:w-8 h-6 sm:h-7 lg:h-8 rounded-full object-cover border-2 border-white flex-shrink-0'
                />
                <span className='text-xs sm:text-sm lg:text-base font-semibold hidden sm:inline truncate max-w-20 sm:max-w-24 lg:max-w-none'>
                  {userInfo?.fullName || userInfo?.email || 'User'}
                </span>
                <IoChevronDownOutline className='text-sm sm:text-lg flex-shrink-0' />
              </div>
              {showUserMenu && (
                <UserDropdownMenu
                  isAdmin={isAdmin}
                  onClose={() => setShowUserMenu(false)}
                  onGoToUser={handleGoToUser}
                  onGoToOrders={handleGoToOrders}
                  onGoToAdmin={handleGoToAdmin}
                  onSignOut={handleSignOut}
                />
              )}
            </div>
          ) : (
            <div
              className='flex items-center gap-1 sm:gap-2 bg-orange-500 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-full cursor-pointer hover:bg-orange-600 hover:scale-105 hover:shadow-lg transition-all duration-300 ease-in-out'
              onClick={handleLoginClick}
            >
              <IoPersonOutline className='text-lg sm:text-xl' />
              <span className='text-xs sm:text-sm lg:text-base font-semibold whitespace-nowrap'>
                Đăng nhập
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
