import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SuccessIcon from '@/components/features/icons/SuccessIcon';
import VoucherBadge from '../ui/VoucherBadge';
import {
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaBox,
  FaTruck,
  FaTag,
  FaCheckCircle,
  FaArrowLeft,
  FaCreditCard,
  FaMoneyBillWave,
  FaWallet,
  FaLock,
  FaCcVisa,
  FaCcMastercard,
  FaExclamationCircle,
} from 'react-icons/fa';
import { useNotifications } from '@/components/features/notify/NotificationContext';
import { FiMapPin, FiUser, FiPhone, FiHome, FiMessageSquare } from 'react-icons/fi';
import MapComponent from '@/components/features/map/MapComponent';

// Format price to VND
const formatPrice = (price) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' ₫';
};

// Payment Confirmation Component that shows completion for digital payments
const PaymentConfirmation = ({ orderDetails, visible }) => {
  // Don't use orderSuccess directly in this component as it's already called in the main component
  const [notificationSent, setNotificationSent] = useState(false);

  useEffect(() => {
    // Only mark notification as sent, the actual notification is handled in the main component
    if (visible && orderDetails && !notificationSent) {
      setNotificationSent(true);
    }
  }, [visible, orderDetails, notificationSent]);

  // Only show for digital payment methods
  if (!visible || !orderDetails || orderDetails.paymentIcon === 'cod') {
    return null;
  }

  // Get payment method icon based on payment type
  const getPaymentIcon = () => {
    switch (orderDetails?.paymentIcon) {
      case 'bank':
        return <FaCreditCard className='text-blue-600' />;
      case 'momo':
        return <FaWallet className='text-purple-600' />;
      case 'card':
        return <FaCcVisa className='text-indigo-600' />;
      case 'cod':
      default:
        return <FaMoneyBillWave className='text-green-600' />;
    }
  };

  return (
    <div className='mt-8 mb-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-8 shadow-lg border border-green-200 overflow-hidden transition-all duration-500'>
      <div className='text-center'>
        <div className='inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-6 shadow-inner'>
          <FaCheckCircle size={40} />
        </div>
        <h3 className='text-2xl font-bold text-green-700 mb-3'>
          Thanh toán thành công!
        </h3>
        <p className='text-sm text-gray-600 mb-5 max-w-md mx-auto'>
          Đơn hàng #{orderDetails.orderNumber} đã được xác nhận và đang được xử
          lý. Cảm ơn bạn đã sử dụng {orderDetails.paymentMethod}!
        </p>
        <div className='mt-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm max-w-sm mx-auto'>
          <h4 className='font-medium text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center justify-center gap-2'>
            <FaLock className='text-green-600' /> Thông tin thanh toán
          </h4>
          <div className='space-y-3 text-sm'>
            <div className='flex justify-between items-center border-b border-gray-50 pb-3'>
              <span className='text-gray-600'>Phương thức:</span>
              <span className='font-medium flex items-center gap-1'>
                {getPaymentIcon()} {orderDetails.paymentMethod}
              </span>
            </div>
            <div className='flex justify-between items-center border-b border-gray-50 pb-3'>
              <span className='text-gray-600'>Số tiền:</span>
              <span className='font-bold text-blue-600'>
                {formatPrice(orderDetails.total)}
              </span>
            </div>
            <div className='flex justify-between items-center border-b border-gray-50 pb-3'>
              <span className='text-gray-600'>Thời gian:</span>
              <span className='font-medium'>
                {new Date().toLocaleTimeString('vi-VN')},{' '}
                {new Date().toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div className='flex justify-between items-center pt-1'>
              <span className='text-gray-600'>Trạng thái:</span>
              <span className='font-medium px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1'>
                <FaCheckCircle /> Thành công
              </span>
            </div>
          </div>
        </div>

        {/* Thông tin bảo mật */}
        <div className='mt-5 text-xs text-gray-500 flex items-center justify-center gap-2'>
          <FaLock className='text-gray-400' />
          <span>Giao dịch của bạn được xử lý an toàn và bảo mật</span>
        </div>
      </div>
    </div>
  );
};

function CompleteOrderPage() {
  const [showConfetti, setShowConfetti] = useState(false);
  const [activePaymentDetails, setActivePaymentDetails] = useState(false);
  const [orderNotificationSent, setOrderNotificationSent] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { orderSuccess } = useNotifications();

  // Lấy thông tin đơn hàng từ location state
  const { orderInfo } = location.state || {};

  // Debug logs to check what payment method is being passed
  console.log('Order Info:', orderInfo);
  console.log('Payment Method:', orderInfo?.paymentMethod);

  // Tạo hoặc lấy mã đơn hàng từ sessionStorage
  // Sử dụng sessionKey để đảm bảo đơn hàng mới sẽ có mã khác khi quay lại trang đặt hàng
  const sessionKey = 'currentOrderNumber';
  let orderNumber = sessionStorage.getItem(sessionKey);

  if (!orderNumber && orderInfo) {
    orderNumber = orderInfo.id || 'DH' + Math.floor(Math.random() * 1000000);
    sessionStorage.setItem(sessionKey, orderNumber);
  }

  // Kiểm tra nếu không có thông tin đơn hàng, chuyển hướng về trang chủ
  useEffect(() => {
    if (!orderInfo) {
      navigate('/');
    }
  }, [orderInfo, navigate]);

  // Xây dựng đối tượng orderDetails từ orderInfo
  const orderDetails = orderInfo
    ? {
        orderNumber: orderNumber || 'Đang xử lý',
        customerName: orderInfo.addressData?.fullName || 'Khách hàng',
        phone: orderInfo.addressData?.phone || '0000000000',
        address:
          orderInfo.addressData?.fullAddress ||
          `${orderInfo.addressData?.street || ''}, ${
            orderInfo.addressData?.wardName || orderInfo.addressData?.ward || ''
          }, ${
            orderInfo.addressData?.districtName ||
            orderInfo.addressData?.district ||
            ''
          }, ${
            orderInfo.addressData?.cityName || orderInfo.addressData?.city || ''
          }`,
        note: orderInfo.addressData?.note || orderInfo.note || '',
        productPrice:
          parsePrice(orderInfo.product?.salePrice) *
          (orderInfo.product?.quantity || 1),
        shippingFee: orderInfo.addressData
          ? calculateShippingFee(
              orderInfo.addressData.shippingMethod,
              parsePrice(orderInfo.product?.salePrice)
            )
          : 0,
        discount: orderInfo.discount?.amount || 0,
        total: calculateTotal(
          parsePrice(orderInfo.product?.salePrice) *
            (orderInfo.product?.quantity || 1),
          orderInfo.addressData
            ? calculateShippingFee(
                orderInfo.addressData.shippingMethod,
                parsePrice(orderInfo.product?.salePrice)
              )
            : 0,
          orderInfo.discount?.amount || 0
        ),
        deliveryEstimate:
          orderInfo.addressData?.shippingMethod === 'express'
            ? '1 - 2 ngày'
            : '2 - 3 ngày',
        orderDate: new Date().toLocaleDateString('vi-VN'),
        paymentMethod: getPaymentMethodName(orderInfo.paymentMethod),
        // Make sure paymentIcon is correctly set here
        paymentIcon: orderInfo.paymentMethod || 'cod',
        discountCode: orderInfo.discount?.code || '',
        productInfo: orderInfo.product || {},
        addressData: orderInfo.addressData || {},
      }
    : null;

  // Debug log to check final orderDetails
  console.log('Final orderDetails:', {
    paymentMethod: orderDetails?.paymentMethod,
    paymentIcon: orderDetails?.paymentIcon,
  });

  // Hàm chuyển đổi giá sản phẩm từ chuỗi sang số
  function parsePrice(priceStr) {
    if (!priceStr) return 0;
    return parseInt(priceStr.replace(/[^\d]/g, ''));
  }

  // Hàm tính phí vận chuyển
  function calculateShippingFee(shippingMethod, productPrice) {
    if (productPrice >= 500000) return 0; // Miễn phí với đơn >= 500K
    return shippingMethod === 'express' ? 50000 : 30000;
  }

  // Hàm tính tổng tiền
  function calculateTotal(productPrice, shippingFee, discount) {
    return productPrice + shippingFee - discount;
  }

  // Hàm lấy tên phương thức thanh toán
  function getPaymentMethodName(paymentMethod) {
    switch (paymentMethod) {
      case 'bank':
        return 'Chuyển khoản ngân hàng';
      case 'momo':
        return 'Thanh toán qua ví điện tử';
      case 'card':
        return 'Thanh toán bằng thẻ ngân hàng';
      case 'cod':
      default:
        return 'Thanh toán khi nhận hàng';
    }
  }

  // Get payment method icon based on payment type
  const getPaymentIcon = () => {
    switch (orderDetails?.paymentIcon) {
      case 'bank':
        return <FaCreditCard className='text-blue-600' />;
      case 'momo':
        return <FaWallet className='text-purple-600' />;
      case 'card':
        return <FaCcVisa className='text-indigo-600' />;
      case 'cod':
      default:
        return <FaMoneyBillWave className='text-green-600' />;
    }
  };

  // Get payment method color scheme
  const getPaymentColorScheme = () => {
    switch (orderDetails?.paymentIcon) {
      case 'bank':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          border: 'border-blue-300',
          icon: 'text-blue-600',
        };
      case 'momo':
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-800',
          border: 'border-purple-300',
          icon: 'text-purple-600',
        };
      case 'card':
        return {
          bg: 'bg-indigo-100',
          text: 'text-indigo-800',
          border: 'border-indigo-300',
          icon: 'text-indigo-600',
        };
      case 'cod':
      default:
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-300',
          icon: 'text-green-600',
        };
    }
  };

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 5000);

    // Animate payment details after a delay
    const paymentTimer = setTimeout(() => {
      setActivePaymentDetails(true);
    }, 1000);

    // Thêm thông báo đặt hàng thành công nếu có thông tin đơn hàng và mã đơn hàng
    // Sử dụng một cờ trong sessionStorage để đảm bảo chỉ gửi thông báo một lần cho mỗi đơn hàng
    const notificationKey = `order_notified_${orderNumber}`;
    const notificationSent = sessionStorage.getItem(notificationKey);
    
    if (orderDetails && orderNumber && !orderNotificationSent && !notificationSent) {
      // Đánh dấu là đã gửi thông báo cả trong state và trong session
      sessionStorage.setItem(notificationKey, 'true');
      orderSuccess(orderNumber);
      setOrderNotificationSent(true);
    }

    return () => {
      clearTimeout(timer);
      clearTimeout(paymentTimer);
    };
  }, [orderDetails, orderNumber, orderNotificationSent, orderSuccess]);

  // Get color scheme
  const paymentColors = getPaymentColorScheme();

  // Check if payment is a digital payment (already completed before reaching this page)
  const isDigitalPayment =
    orderDetails?.paymentIcon === 'bank' ||
    orderDetails?.paymentIcon === 'momo' ||
    orderDetails?.paymentIcon === 'card';

  // Nếu không có thông tin đơn hàng, hiển thị màn hình loading
  if (!orderDetails) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <p className='text-gray-500'>Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-blue-50 to-white py-10 px-4'>
      {showConfetti && (
        <div className='confetti-container fixed inset-0 pointer-events-none z-50'>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className='confetti'
              style={{
                left: `${Math.random() * 100}%`,
                top: `-5%`,
                backgroundColor: [
                  '#ff0000',
                  '#00ff00',
                  '#0000ff',
                  '#ffff00',
                  '#ff00ff',
                  '#00ffff',
                ][Math.floor(Math.random() * 6)],
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                animation: `fall ${
                  Math.random() * 3 + 2
                }s linear forwards, sway ${
                  Math.random() * 2 + 3
                }s ease-in-out infinite alternate`,
              }}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh);
            opacity: 0;
          }
        }
        @keyframes sway {
          from {
            transform: translateX(-5px) rotate(-10deg);
          }
          to {
            transform: translateX(5px) rotate(10deg);
          }
        }
        .confetti {
          position: absolute;
          opacity: 0.7;
          border-radius: 50%;
        }
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse-border {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
          }
          50% {
            box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.4);
          }
        }
        .payment-method-badge {
          transition: transform 0.3s ease;
        }
        .payment-method-badge:hover {
          transform: translateY(-2px);
        }
        .payment-details {
          animation: fadeSlideIn 0.8s ease-out forwards;
        }
        .payment-card {
          perspective: 1000px;
          transition: all 0.5s ease;
        }
        .payment-card:hover {
          transform: translateY(-5px);
        }
        .payment-card-inner {
          transition: transform 0.6s;
          transform-style: preserve-3d;
          position: relative;
        }
        .payment-method-badge:hover .payment-card-inner {
          transform: rotateY(180deg);
        }
        .payment-front,
        .payment-back {
          backface-visibility: hidden;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .payment-back {
          transform: rotateY(180deg);
        }
      `}</style>

      <main className='max-w-2xl mx-auto'>
        {/* Success Section */}
        <section className='bg-white rounded-3xl shadow-2xl p-8 mb-8 transform transition-all duration-500 hover:shadow-xl border-t-4 border-green-500'>
          <div className='flex flex-col items-center gap-3 text-center'>
            <div className='relative mb-4 animate-bounce'>
              <SuccessIcon />
            </div>
            <h1 className='bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent font-bold text-2xl md:text-3xl mb-2 flex items-center gap-2'>
              Đặt hàng thành công!
            </h1>
            <div className='flex flex-col gap-1 mb-3'>
              <p className='text-sm text-gray-500'>
                Mã đơn hàng:{' '}
                <span className='font-medium text-gray-700'>
                  {orderDetails.orderNumber}
                </span>
              </p>
              <p className='text-sm text-gray-500'>
                Ngày đặt hàng:{' '}
                <span className='font-medium text-gray-700'>
                  {orderDetails.orderDate}
                </span>
              </p>
            </div>
            <div className='inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-full text-sm font-medium shadow-md'>
              <FaTruck className='animate-pulse' /> Dự kiến nhận hàng trong:{' '}
              <span className='font-bold'>{orderDetails.deliveryEstimate}</span>
            </div>
            <p className='text-xs text-gray-500 mt-4 max-w-md'>
              Chúng tôi sẽ liên hệ với bạn qua số điện thoại đã đăng ký để xác
              nhận đơn hàng. Cảm ơn bạn đã mua sắm cùng chúng tôi!
            </p>
          </div>
        </section>

        {/* Product Info Section */}
        <section className='bg-white rounded-3xl shadow-xl p-8 mb-8 transform transition-all duration-500 hover:shadow-2xl'>
          <div className='flex items-center justify-between border-b pb-4 mb-6'>
            <h2 className='text-xl font-bold text-gray-800 flex items-center gap-2'>
              <FaBox className='text-blue-600' /> Thông tin sản phẩm
            </h2>
          </div>

          <div className='flex gap-4 items-start mb-6'>
            <div className='w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 shadow-sm'>
              <img
                src={orderDetails.productInfo.image}
                alt={orderDetails.productInfo.title}
                className='w-full h-full object-cover'
              />
            </div>
            <div className='flex-1'>
              <h3 className='font-medium text-gray-800 line-clamp-2'>
                {orderDetails.productInfo.title}
              </h3>
              <div className='flex items-center gap-2 mt-2'>
                <span className='text-sm font-bold text-red-600'>
                  {orderDetails.productInfo.salePrice}
                </span>
                {orderDetails.productInfo.originalPrice && (
                  <span className='text-xs text-gray-500 line-through'>
                    {orderDetails.productInfo.originalPrice}
                  </span>
                )}
              </div>
              <div className='flex items-center gap-1 mt-2 text-sm text-gray-500'>
                <span>Số lượng: {orderDetails.productInfo.quantity || 1}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Delivery Info Section */}
        <section className='bg-white rounded-3xl shadow-xl p-8 mb-8 transform transition-all duration-500 hover:shadow-2xl'>
          <div className='flex items-center justify-between border-b pb-4 mb-6'>
            <h2 className='text-xl font-bold text-gray-800 flex items-center gap-2'>
              <FaUser className='text-blue-600' /> Thông tin khách hàng
            </h2>

            {/* Enhanced Payment Method Badge */}
            <div
              className={`payment-method-badge relative ${paymentColors.bg} ${paymentColors.text} px-3 py-2 rounded-lg shadow-md border ${paymentColors.border} cursor-pointer`}
              onClick={() => setActivePaymentDetails(!activePaymentDetails)}
            >
              <div className='payment-card'>
                <div className='flex items-center gap-2'>
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full bg-white ${paymentColors.icon}`}
                  >
                    {getPaymentIcon()}
                  </div>
                  <div>
                    <p className='text-xs font-medium'>
                      Phương thức thanh toán
                    </p>
                    <p className='text-sm font-bold'>
                      {orderDetails.paymentMethod}
                    </p>
                  </div>
                  {isDigitalPayment && (
                    <div
                      className={`absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full`}
                    ></div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details Popup */}
          {activePaymentDetails && (
            <div className='payment-details mb-6 p-6 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 shadow-md'>
              <div className='flex items-center justify-between mb-4 pb-3 border-b border-gray-200'>
                <h3 className='font-bold text-gray-800 flex items-center gap-2'>
                  <FaLock className='text-green-600' /> Chi tiết thanh toán an
                  toàn
                </h3>
                <div className='flex items-center gap-2'>
                  <FaCcVisa className='text-blue-700 text-xl' />
                  <FaCcMastercard className='text-red-500 text-xl' />
                </div>
              </div>

              <div className='flex items-center gap-4 mb-3'>
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full ${paymentColors.bg}`}
                >
                  {getPaymentIcon()}
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Phương thức</p>
                  <p className='font-medium text-base'>
                    {orderDetails.paymentMethod}
                  </p>
                </div>
              </div>

              {/* Show payment confirmation for digital payments */}
              {isDigitalPayment && (
                <div className='mt-3 p-3 bg-green-50 text-sm text-green-800 rounded-lg border border-green-100 shadow-sm'>
                  <div className='flex items-center gap-3'>
                    <FaCheckCircle className='text-green-600 text-lg' />
                    <div>
                      <p className='font-medium'>Thanh toán đã hoàn tất</p>
                      <p className='text-xs mt-1'>
                        Giao dịch đã được xác nhận thành công
                      </p>
                    </div>
                  </div>
                  <div className='border-t border-green-100 mt-3 pt-3 flex justify-between items-center'>
                    <span className='text-sm'>Số tiền đã thanh toán:</span>
                    <span className='font-bold text-green-700'>
                      {formatPrice(orderDetails.total)}
                    </span>
                  </div>
                </div>
              )}

              {/* Show COD instructions */}
              {orderDetails.paymentIcon === 'cod' && (
                <div className='mt-3 p-3 bg-amber-50 text-sm text-amber-800 rounded-lg border border-amber-100 shadow-sm'>
                  <p className='font-medium mb-2'>
                    Hướng dẫn thanh toán khi nhận hàng:
                  </p>
                  <ol className='list-decimal pl-5 space-y-1'>
                    <li>Kiểm tra đơn hàng khi nhận</li>
                    <li>Thanh toán cho nhân viên giao hàng</li>
                    <li>
                      Số tiền cần thanh toán:{' '}
                      <span className='font-bold'>
                        {formatPrice(orderDetails.total)}
                      </span>
                    </li>
                  </ol>
                </div>
              )}

              <div className='text-sm text-gray-600 italic mt-4 text-center flex items-center justify-center gap-2'>
                <FaLock className='text-gray-400' />
                {isDigitalPayment
                  ? 'Giao dịch thanh toán của bạn đã được xác nhận và bảo mật'
                  : 'Vui lòng chuẩn bị đúng số tiền khi nhận hàng'}
              </div>
            </div>
          )}

          {/* Show Payment Confirmation for digital payments */}
          <PaymentConfirmation
            orderDetails={orderDetails}
            visible={isDigitalPayment && activePaymentDetails}
          />

          <div className='space-y-5 mb-8'>
            <div className='flex items-start gap-4'>
              <div className='mt-0.5 bg-blue-100 p-2 rounded-full text-blue-600'>
                <FaUser />
              </div>
              <div className='flex-1'>
                <p className='text-xs text-gray-500'>Người nhận</p>
                <p className='text-sm font-medium text-gray-800'>
                  {orderDetails.customerName}
                </p>
              </div>
            </div>

            <div className='flex items-start gap-4'>
              <div className='mt-0.5 bg-green-100 p-2 rounded-full text-green-600'>
                <FaPhone />
              </div>
              <div className='flex-1'>
                <p className='text-xs text-gray-500'>Số điện thoại</p>
                <p className='text-sm font-medium text-gray-800'>
                  {orderDetails.phone}
                </p>
              </div>
            </div>

            <div className='flex items-start gap-4'>
              <div className='mt-0.5 bg-red-100 p-2 rounded-full text-red-600'>
                <FaMapMarkerAlt />
              </div>
              <div className='flex-1'>
                <p className='text-xs text-gray-500'>Địa chỉ nhận hàng</p>
                <p className='text-sm font-medium text-gray-800'>
                  {orderDetails.address}
                </p>
                
                {/* Hiển thị ghi chú nếu có */}
                {orderDetails.note && (
                  <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded-md">
                    <p className='text-xs text-gray-500 mb-1'>Ghi chú:</p>
                    <p className='text-sm text-gray-700'>{orderDetails.note}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Hiển thị thông tin địa chỉ */}
            <div className="border-b pb-4">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                <FiMapPin className="text-blue-500" /> Địa chỉ giao hàng:
              </h3>
              <div className="pl-6 space-y-1">
                <div className="flex items-center gap-2">
                  <FiUser className="text-gray-400" />
                  <p className="text-gray-800">{orderDetails.addressData?.fullName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <FiPhone className="text-gray-400" />
                  <p className="text-gray-800">{orderDetails.addressData?.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <FiHome className="text-gray-400" />
                  <p className="text-gray-800">
                    {orderDetails.addressData?.fullAddress || 
                     `${orderDetails.addressData?.street || ''}, ${orderDetails.addressData?.wardName || orderDetails.addressData?.ward || ''}, ${orderDetails.addressData?.districtName || orderDetails.addressData?.district || ''}, ${orderDetails.addressData?.cityName || orderDetails.addressData?.city || ''}`}
                  </p>
                </div>
                {orderDetails.addressData?.note && (
                  <div className="flex items-start gap-2 mt-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <FiMessageSquare className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Ghi chú:</p>
                      <p className="text-gray-800 text-sm">{orderDetails.addressData.note}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Map Component - Delivery location */}
            <div className="border-b pb-6 mt-4">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                <FiMapPin className="text-blue-500" /> Vị trí giao hàng:
              </h3>
              <div className="rounded-xl overflow-hidden border border-gray-200 shadow-md">
                <MapComponent height="300px" addressData={orderDetails.addressData} />
              </div>
              <p className="text-xs text-gray-500 mt-2 italic text-center">
                Bản đồ hiển thị vị trí tương đối của địa chỉ giao hàng.
              </p>
            </div>
          </div>

          <div className='flex items-center justify-between border-b pb-4 mb-6'>
            <h2 className='text-xl font-bold text-gray-800 flex items-center gap-2'>
              <FaTag className='text-purple-600' /> Chi tiết thanh toán
            </h2>
          </div>

          <div className='space-y-4 text-sm'>
            <div className='flex justify-between items-center bg-gray-50 p-3 rounded-lg'>
              <div className='flex items-center gap-3 text-gray-700'>
                <FaBox className='text-gray-500' /> Tiền sản phẩm
              </div>
              <div className='font-medium'>
                {formatPrice(orderDetails.productPrice)}
              </div>
            </div>

            <div className='flex justify-between items-center bg-gray-50 p-3 rounded-lg'>
              <div className='flex items-center gap-3 text-gray-700'>
                <FaTruck className='text-gray-500' /> Phí vận chuyển
              </div>
              <div className='font-medium'>
                {formatPrice(orderDetails.shippingFee)}
              </div>
            </div>

            {orderDetails.discount > 0 && (
              <div className='flex justify-between items-center bg-gray-50 p-3 rounded-lg'>
                <div className='flex items-center gap-3 text-gray-700'>
                  <FaTag className='text-gray-500' /> Giảm giá
                </div>
                <div className='flex items-center gap-3'>
                  <span className='font-medium text-green-600'>
                    -{formatPrice(orderDetails.discount)}
                  </span>
                  {orderDetails.discountCode && (
                    <VoucherBadge
                      code={orderDetails.discountCode}
                      color='#E1F5FE'
                    />
                  )}
                </div>
              </div>
            )}

            <div className='flex justify-between items-center p-4 mt-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100'>
              <div className='font-bold text-gray-800'>Tổng thanh toán</div>
              <div className='text-lg font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent'>
                {/* Show 0 for digital payments as they're already paid */}
                {isDigitalPayment
                  ? formatPrice(0)
                  : formatPrice(orderDetails.total)}
              </div>
            </div>

            {/* Show payment completion note for digital payments */}
            {isDigitalPayment && (
              <div className='mt-4 mb-6 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 shadow-sm transform transition hover:shadow-md'>
                <div className='flex items-center gap-3'>
                  <div className='bg-green-100 rounded-full p-2 flex-shrink-0'>
                    <FaCheckCircle className='text-green-600 text-lg' />
                  </div>
                  <div>
                    <p className='text-green-800 font-medium'>
                      Thanh toán đã hoàn tất
                    </p>
                    <p className='text-sm text-green-700 opacity-80'>
                      {orderDetails.paymentMethod} •{' '}
                      {formatPrice(orderDetails.total)} •{' '}
                      {new Date().toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Only show COD payment instructions */}
            {orderDetails.paymentIcon === 'cod' && (
              <div className='mt-4 mb-6 p-5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-100 shadow-sm transition-all hover:shadow-md'>
                <h4 className='font-bold text-gray-800 mb-3 flex items-center gap-2 pb-2 border-b border-amber-100'>
                  <FaMoneyBillWave className='text-amber-600' /> Thông tin thanh
                  toán khi nhận hàng
                </h4>
                <div className='space-y-3 text-sm'>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600 flex items-center gap-2'>
                      <FaUser className='text-amber-500' /> Người nhận:
                    </span>
                    <span className='font-medium'>
                      {orderDetails.customerName}
                    </span>
                  </div>

                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600 flex items-center gap-2'>
                      <FaPhone className='text-amber-500' /> Số điện thoại:
                    </span>
                    <span className='font-medium'>{orderDetails.phone}</span>
                  </div>

                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600 flex items-center gap-2'>
                      <FaMoneyBillWave className='text-amber-500' /> Số tiền cần
                      thanh toán:
                    </span>
                    <span className='font-bold text-red-600'>
                      {formatPrice(orderDetails.total)}
                    </span>
                  </div>
                </div>

                <div className='mt-4 p-3 bg-white rounded-lg border border-amber-200 shadow-inner'>
                  <div className='flex items-center gap-2'>
                    <FaExclamationCircle className='text-amber-500' />
                    <p className='text-sm text-amber-800 font-medium'>
                      Lưu ý khi nhận hàng:
                    </p>
                  </div>
                  <ul className='list-disc pl-8 mt-2 text-sm text-gray-700 space-y-1'>
                    <li>Kiểm tra kỹ sản phẩm trước khi thanh toán</li>
                    <li>Chuẩn bị sẵn số tiền chính xác</li>
                    <li>Giữ lại biên lai giao hàng sau khi thanh toán</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className='text-center'>
          <button
            className='bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 px-6 rounded-full transition-all shadow-md hover:shadow-lg flex items-center gap-2 mx-auto'
            onClick={() => navigate('/home')}
          >
            <FaArrowLeft size={14} /> Quay lại trang chủ
          </button>
        </div>
      </main>
    </div>
  );
}

export default CompleteOrderPage;
