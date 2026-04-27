import Sidebar from '../features/user/SideBar';
import { Outlet, Routes, Route } from 'react-router-dom';
import UserOrders from '../features/user/UserOrders';
import UserHistory from '../features/user/UserHistory';
import UserPage from '../features/user/UserPage';
import FormAccount from '../features/user/FormAccount';
import UserAddress from '../features/user/UserAddress';

function User() {
  return (
    <main className='main-content p-6 bg-gray-50 min-h-screen'>
      <div className='max-w-7xl mx-auto flex flex-col md:flex-row gap-10'>
        <div className='w-full md:w-72'>
          <Sidebar />
        </div>
        <div className='w-full flex-1'>
          <Routes>
            <Route index element={<UserPage />} />
            <Route path='orders' element={<UserOrders />} />
            <Route path='history' element={<UserHistory />} />
            <Route path='update' element={<FormAccount />} />
            <Route path='address' element={<UserAddress />} />
            <Route path='*' element={<Outlet />} />
          </Routes>
        </div>
      </div>
    </main>
  );
}

export default User;
