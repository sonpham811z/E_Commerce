import { Outlet, useLocation } from 'react-router-dom';
import Footer from './Footer';
import Header from './Header';
import ChatBotContainer from '../features/chatBot/ChatBotContainer';

function Layout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className='min-h-screen flex flex-col bg-gray-50'>
      <Header />
      <main className='flex-1'>
        <Outlet key={location.pathname} />
      </main>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <ChatBotContainer />}
    </div>
  );
}

export default Layout;
