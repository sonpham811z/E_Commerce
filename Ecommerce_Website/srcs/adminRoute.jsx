import { Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import AdminRoute from './components/routes/AdminRoute';
import AdminLayout from './components/ui/AdminLayout';
import Dashboard from './components/pages/admin/Dashboard';
import ProductManager from './components/pages/admin/ProductManager';
import UserManager from './components/pages/admin/UserManager';
import OrderManager from './components/pages/admin/OrderManager';

import {
  MdDashboard,
  MdInventory,
  MdPeople,
  MdShoppingCart,
  MdInsights,
  MdSettings,
  MdFeedback,
} from 'react-icons/md';

// Lazy-loaded components for better performance
const Analytics = lazy(() => import('./components/pages/admin/Analytics'));
const Settings = lazy(() => import('./components/pages/admin/Settings'));
const CustomerFeedback = lazy(() =>
  import('./components/pages/admin/CustomerFeedback')
);

// Loading fallback component for Suspense
const LoadingFallback = () => (
  <div className='flex items-center justify-center w-full h-64'>
    <div className='flex flex-col items-center'>
      <div className='w-16 h-16 border-t-4 border-b-4 border-red-600 rounded-full animate-spin'></div>
      <p className='mt-4 text-lg font-medium text-gray-700'>Đang tải...</p>
    </div>
  </div>
);

// Admin sidebar routes definition
export const adminRoutes = [
  {
    path: '',
    name: 'Tổng quan',
    component: <Dashboard />,
    icon: <MdDashboard />,
  },
  {
    path: 'products',
    name: 'Quản lý sản phẩm',
    component: <ProductManager />,
    icon: <MdInventory />,
  },
  {
    path: 'user',
    name: 'Quản lý người dùng',
    component: <UserManager />,
    icon: <MdPeople />,
  },
  {
    path: 'order',
    name: 'Quản lý đơn hàng',
    component: <OrderManager />,
    icon: <MdShoppingCart />,
  },
  {
    path: 'analytics',
    name: 'Phân tích bán hàng',
    component: (
      <Suspense fallback={<LoadingFallback />}>
        <Analytics />
      </Suspense>
    ),
    icon: <MdInsights />,
  },
  {
    path: 'feedback',
    name: 'Phản hồi khách hàng',
    component: (
      <Suspense fallback={<LoadingFallback />}>
        <CustomerFeedback />
      </Suspense>
    ),
    icon: <MdFeedback />,
  },
  {
    path: 'settings',
    name: 'Cài đặt hệ thống',
    component: (
      <Suspense fallback={<LoadingFallback />}>
        <Settings />
      </Suspense>
    ),
    icon: <MdSettings />,
  },
];

// Main admin route with protection and nested routes
const adminRoute = (
  <Route element={<AdminRoute />}>
    <Route path='/admin' element={<AdminLayout routes={adminRoutes} />}>
      {/* Dashboard default route */}
      <Route index element={<Dashboard />} />

      {/* Map other admin routes */}
      {adminRoutes.slice(1).map(({ path, component }) => (
        <Route key={path} path={path} element={component} />
      ))}

      {/* Redirect typo 'oder' to 'order' */}
      <Route path='oder' element={<Navigate to='/admin/order' replace />} />

      {/* Catch-all 404 page within admin */}
      <Route
        path='*'
        element={
          <div className='flex flex-col items-center justify-center h-96'>
            <h2 className='text-2xl font-bold text-gray-800 mb-4'>
              Không tìm thấy trang
            </h2>
            <p className='text-gray-600 mb-6'>
              Trang bạn đang tìm kiếm không tồn tại trong hệ thống quản trị.
            </p>
            <button
              onClick={() => (window.location.href = '/admin')}
              className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
            >
              Quay lại Dashboard
            </button>
          </div>
        }
      />
    </Route>
  </Route>
);

export default adminRoute;
