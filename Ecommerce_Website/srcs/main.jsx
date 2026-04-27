import './styles/index.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './components/features/auth/AuthContext';
import { UserProvider } from './components/features/user/UserContext';
import { NotificationProvider } from './components/features/notify/NotificationContext';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartProvider } from './utils/CartContext';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProvider>
          <NotificationProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </NotificationProvider>
        </UserProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
