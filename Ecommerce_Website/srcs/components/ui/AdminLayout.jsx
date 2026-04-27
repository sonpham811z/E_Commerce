import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = ({ routes }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className='flex min-h-screen bg-gray-100 font-sans'>
      {isMobileSidebarOpen && (
        <div
          className='fixed inset-0 bg-gray-900 bg-opacity-50 z-20 lg:hidden'
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      <aside
        className={`
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transition duration-300 transform lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Sidebar Navigation */}
        <nav className='mt-4 px-4'>
          <ul className='space-y-1'>
            {routes?.map((route) => (
              <li key={route.path}>
                <Link
                  to={`/admin/${route.path}`}
                  className={`
                    flex items-center px-4 py-3 text-gray-700 rounded-lg transition-colors
                    ${
                      location.pathname === `/admin/${route.path}` ||
                      (location.pathname === '/admin' && route.path === '')
                        ? 'bg-red-50 text-red-600'
                        : 'hover:bg-gray-100'
                    }
                  `}
                >
                  <span className='text-xl mr-3'>{route.icon}</span>
                  <span>{route.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      {/* Main Content */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        {/* Content */}
        <main className='flex-1 p-6 bg-gray-100'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
