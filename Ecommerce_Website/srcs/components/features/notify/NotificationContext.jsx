import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  IoTimeOutline,
  IoCartOutline,
  IoBagCheckOutline,
} from 'react-icons/io5';

// Tạo context cho thông báo
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]); // Bắt đầu với mảng rỗng
  const [newCount, setNewCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState({});

  // Chuẩn hóa nội dung thông báo để dễ so sánh
  const normalizeNotificationContent = useCallback((notification) => {
    const title = notification.title || '';
    const description = notification.description || '';
    const shortDesc = description.split(' ').slice(0, 5).join(' ');
    return `${title}:${shortDesc}`;
  }, []);

  // Kiểm tra trùng lặp thông báo
  const isDuplicateNotification = useCallback(
    (notification) => {
      const now = Date.now();
      const key = normalizeNotificationContent(notification);

      if (recentNotifications[key] && now - recentNotifications[key] < 10000) {
        console.log('Duplicate notification prevented:', key);
        return true;
      }

      setRecentNotifications((prev) => ({
        ...prev,
        [key]: now,
      }));

      return false;
    },
    [normalizeNotificationContent, recentNotifications]
  );

  // Thêm thông báo mới
  const addNotification = useCallback(
    (notification) => {
      if (isDuplicateNotification(notification)) {
        return;
      }

      const newNotification = {
        id: Date.now(),
        ...notification,
        isNew: true,
        time: 'Vừa xong',
      };

      setNotifications((prev) => [newNotification, ...prev]);
      setNewCount((prev) => prev + 1);

      // Tự động đánh dấu là đã đọc sau 1 phút
      const timeoutId = setTimeout(() => {
        markAsRead(newNotification.id);
      }, 60000);

      // Cleanup timeout nếu component unmount
      return () => clearTimeout(timeoutId);
    },
    [isDuplicateNotification]
  );

  // Đánh dấu thông báo đã đọc
  const markAsRead = useCallback((id) => {
    setNotifications((prev) => {
      const updated = prev.map((notification) =>
        notification.id === id && notification.isNew
          ? { ...notification, isNew: false }
          : notification
      );

      // Cập nhật newCount ngay lập tức
      const newCountValue = updated.filter((n) => n.isNew).length;
      setNewCount(newCountValue);

      return updated;
    });
  }, []);

  // Đánh dấu tất cả thông báo đã đọc
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isNew: false }))
    );
    setNewCount(0);
  }, []);

  // Thêm sản phẩm vào giỏ hàng và tạo thông báo
  const addToCart = useCallback(
    (product) => {
      addNotification({
        title: 'Đã thêm sản phẩm vào giỏ hàng',
        description: `${product.name || 'Sản phẩm'} đã được thêm vào giỏ hàng.`,
        icon: <IoCartOutline className='text-xl' />,
        color: 'text-blue-500',
      });
    },
    [addNotification]
  );

  // Tạo thông báo đặt hàng thành công
  const orderSuccess = useCallback(
    (orderNumber) => {
      const cleanOrderNumber =
        orderNumber?.toString().replace(/^Thanh toán #/, '') || '';

      addNotification({
        title: 'Đặt hàng thành công',
        description: `Đơn hàng ${
          cleanOrderNumber || 'của bạn'
        } đã được đặt thành công.`,
        icon: <IoBagCheckOutline className='text-xl' />,
        color: 'text-green-600',
      });
    },
    [addNotification]
  );

  // Tạo thông báo đang xử lý đơn hàng
  const orderProcessing = useCallback(
    (orderNumber) => {
      const cleanOrderNumber =
        orderNumber?.toString().replace(/^Thanh toán #/, '') || '';

      addNotification({
        title: 'Đơn hàng đang xử lý',
        description: `Đơn hàng ${
          cleanOrderNumber || 'của bạn'
        } đang được xử lý.`,
        icon: <IoTimeOutline className='text-xl' />,
        color: 'text-yellow-500',
      });
    },
    [addNotification]
  );

  // Xóa các thông báo cũ hơn 7 ngày
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      setRecentNotifications((prev) => {
        const updated = {};
        for (const [key, timestamp] of Object.entries(prev)) {
          if (timestamp > sevenDaysAgo) {
            updated[key] = timestamp;
          }
        }
        return updated;
      });
    }, 86400000); // Một ngày

    return () => clearInterval(cleanupInterval);
  }, []);

  const value = {
    notifications,
    newCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    addToCart,
    orderSuccess,
    orderProcessing,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook để sử dụng context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    );
  }
  return context;
};

export default NotificationContext;
