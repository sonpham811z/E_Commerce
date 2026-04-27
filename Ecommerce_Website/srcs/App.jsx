import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './components/features/auth/AuthContext';
import { UserProvider } from './components/features/user/UserContext';
import { NotificationProvider } from './components/features/notify/NotificationContext';
import { ProtectedRoute } from './components/features/auth/ProtectedRoute';

// import các thành phần cần thiết từ framer-motion
import Layout from './components/ui/Layout';
import HomePage from './components/pages/HomePage';
import ProductPage from './components/pages/ProductPage';
import CheckoutPage from './components/pages/CheckoutPage';
import CompleteOrderPage from './components/pages/CompleteOrderPage';
import PaymentPage from './components/pages/PaymentPage';
import ShippingInfoPage from './components/pages/ShippingInfoPage';
import BuildPCPage from './components/pages/BuildPCPage';
import OrderPage from './components/pages/OrderPage';
import User from './components/pages/User';
import UserPage from './components/features/user/UserPage';
import UserAddress from './components/features/user/UserAddress';
import UserOrders from './components/features/user/UserOrders';
import AccountForm from './components/features/user/FormAccount';
import ShoppingCartPage from './components/pages/ShoppingCartPage';
import ProductDetailPage from './components/pages/ProductDetailPage';
import AnimatedPage from './components/ui/AnimatedPage';
import JobPage from './components/features/footer-components/JobPage';
import CustomerSupportForm from './components/features/footer-components/CustomerSupportForm';
import InstallmentPlan from './components/features/footer-components/InstallmentPlan';
import PaymentGuide from './components/features/footer-components/PaymentGuide';
import PrivacyPolicy from './components/features/footer-components/PrivacyPolicy';
import ShippingPolicy from './components/features/footer-components/ShippingPolicy';
import ShoppingGuide from './components/features/footer-components/ShoppingGuide';
import ShowroomSystem from './components/features/footer-components/ShowroomSystem';
import WarrantyLookup from './components/features/footer-components/WarrantyLookup';
import WarrantyPolicy from './components/features/footer-components/WarrantyPolicy';
import adminRoute from './adminRoute';
import { Toaster } from 'react-hot-toast';
import ForgotPasswordPage from './components/pages/ForgotPasswordPage';
import ScrollToTop from './utils/ScrollToTop';
import ResetPasswordNotice from './components/pages/ResetPasswordNotice';
import ResetPassword from './components/pages/ResetPassword';
import LoginModal from './components/pages/LoginModal';
import AboutHAADTech from './components/features/footer-components/AboutHAADTech';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <NotificationProvider>
            <main className='flex-1'>
              <AnimatePresence mode='wait'>
                <div>
                  <ScrollToTop />
                  <Routes>
                    <Route path='/' element={<Layout />}>
                      <Route index element={<Navigate replace to='home' />} />
                      {adminRoute}

                      {/* Public routes */}
                      <Route
                        path='home'
                        element={
                          <AnimatedPage>
                            <HomePage />
                          </AnimatedPage>
                        }
                      />
                      <Route
                        path='san-pham'
                        element={
                          <AnimatedPage>
                            <ProductPage />
                          </AnimatedPage>
                        }
                      />
                      <Route
                        path='shopping-cart'
                        element={
                          <AnimatedPage>
                            <ShoppingCartPage />
                          </AnimatedPage>
                        }
                      />
                      <Route
                        path='/product/:id'
                        element={
                          <AnimatedPage>
                            <ProductDetailPage />
                          </AnimatedPage>
                        }
                      />
                      <Route
                        path='login'
                        element={
                          <AnimatedPage>
                            <LoginModal />
                          </AnimatedPage>
                        }
                      />

                      <Route
                        path='reset-password'
                        element={
                          <AnimatedPage>
                            <ResetPassword />
                          </AnimatedPage>
                        }
                      />

                      {/* Protected routes */}
                      <Route
                        path='user/*'
                        element={
                          <ProtectedRoute>
                            <User />
                          </ProtectedRoute>
                        }
                      >
                        <Route
                          index
                          element={
                            <AnimatedPage>
                              <UserPage />
                            </AnimatedPage>
                          }
                        />
                        <Route
                          path='address'
                          element={
                            <AnimatedPage>
                              <UserAddress />
                            </AnimatedPage>
                          }
                        />
                        <Route
                          path='orders'
                          element={
                            <AnimatedPage>
                              <UserOrders />
                            </AnimatedPage>
                          }
                        />
                        <Route
                          path='update'
                          element={
                            <AnimatedPage>
                              <AccountForm />
                            </AnimatedPage>
                          }
                        />
                      </Route>

                      <Route
                        path='checkout'
                        element={
                          <ProtectedRoute>
                            <AnimatedPage>
                              <CheckoutPage />
                            </AnimatedPage>
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path='complete'
                        element={
                          <ProtectedRoute>
                            <AnimatedPage>
                              <CompleteOrderPage />
                            </AnimatedPage>
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path='payment-page'
                        element={
                          <ProtectedRoute>
                            <AnimatedPage>
                              <PaymentPage />
                            </AnimatedPage>
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path='ship-info'
                        element={
                          <ProtectedRoute>
                            <AnimatedPage>
                              <ShippingInfoPage />
                            </AnimatedPage>
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path='build-pc'
                        element={
                          <ProtectedRoute>
                            <AnimatedPage>
                              <BuildPCPage />
                            </AnimatedPage>
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path='order'
                        element={
                          <ProtectedRoute>
                            <AnimatedPage>
                              <OrderPage />
                            </AnimatedPage>
                          </ProtectedRoute>
                        }
                      />
                      {/* Other */}
                      <Route
                        path='about'
                        element={
                          <AnimatedPage>
                            <AboutHAADTech />
                          </AnimatedPage>
                        }
                      />
                      <Route
                        path='jobs'
                        element={
                          <AnimatedPage>
                            <JobPage />
                          </AnimatedPage>
                        }
                      />
                      <Route
                        path='contact'
                        element={
                          <AnimatedPage>
                            <CustomerSupportForm />
                          </AnimatedPage>
                        }
                      />
                      <Route
                        path='warranty-policy'
                        element={
                          <AnimatedPage>
                            <WarrantyPolicy />
                          </AnimatedPage>
                        }
                      />
                      <Route
                        path='shipping-policy'
                        element={
                          <AnimatedPage>
                            <ShippingPolicy />
                          </AnimatedPage>
                        }
                      />
                      <Route
                        path='privacy-policy'
                        element={
                          <AnimatedPage>
                            <PrivacyPolicy />
                          </AnimatedPage>
                        }
                      />
                      <Route
                        path='showrooms'
                        element={
                          <AnimatedPage>
                            <ShowroomSystem />
                          </AnimatedPage>
                        }
                      />
                      <Route
                        path='shopping-guide'
                        element={
                          <AnimatedPage>
                            <ShoppingGuide />
                          </AnimatedPage>
                        }
                      />
                      <Route
                        path='payment-guide'
                        element={
                          <AnimatedPage>
                            <PaymentGuide />
                          </AnimatedPage>
                        }
                      />
                      <Route
                        path='installment'
                        element={
                          <AnimatedPage>
                            <InstallmentPlan />
                          </AnimatedPage>
                        }
                      />
                      <Route
                        path='warranty-lookup'
                        element={
                          <AnimatedPage>
                            <WarrantyLookup />
                          </AnimatedPage>
                        }
                      />
                      <Route
                        path='forgot-password'
                        element={
                          <AnimatedPage>
                            <ForgotPasswordPage />
                          </AnimatedPage>
                        }
                      />
                      <Route
                        path='reset-password-notice'
                        element={
                          <AnimatedPage>
                            <ResetPasswordNotice />
                          </AnimatedPage>
                        }
                      />
                    </Route>
                  </Routes>
                </div>
              </AnimatePresence>
              <Toaster
                position='top-center'
                gutter={12}
                containerStyle={{ margin: '8px' }}
                toastOptions={{
                  success: { duration: 3000 },
                  error: { duration: 5000 },
                  style: {
                    fontSize: '16px',
                    maxWidth: '500px',
                    padding: '16px 24px',
                    backgroundColor: 'var(--color-grey-0)',
                    color: 'var(--color-grey-700)',
                  },
                }}
              />
            </main>
          </NotificationProvider>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
