import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function AdminSideBar({ routes }) {
  const location = useLocation();
  
  return (
    <aside className="w-64 bg-white shadow-lg flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-16 px-6 bg-red-600 text-white">
        <div className="flex items-center space-x-2">
          <img src="/public/logo-1.png" alt="Logo" className="w-8 h-8" />
          <h1 className="text-xl font-bold">PC World Admin</h1>
        </div>
      </div>
      
      {/* Sidebar Navigation */}
      <nav className="mt-4 px-4 flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {routes?.map((route) => (
            <li key={route.path}>
              <Link 
                to={`/admin/${route.path}`}
                className={`
                  flex items-center px-4 py-3 text-gray-700 rounded-lg transition-colors
                  ${location.pathname === `/admin/${route.path}` || (location.pathname === '/admin' && route.path === '') 
                    ? 'bg-red-50 text-red-600' 
                    : 'hover:bg-gray-100'
                  }
                `}
              >
                <span className="text-xl mr-3">
                  {route.icon}
                </span>
                <span>{route.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default AdminSideBar;
