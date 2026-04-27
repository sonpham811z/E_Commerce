import { useState } from 'react';
import { FaShoppingBag, FaMapMarkerAlt, FaUserAlt, FaPhoneAlt, FaTruck } from 'react-icons/fa';
import ShippingInfo from "@/components/features/shipping/ShippingInfo";
import PaymentMethods from '@/components/features/payment/PaymentMethods';
import PaymentButton from '@/components/features/payment/PaymentButton';

function PaymentPage() {
    const [paymentMethod, setPaymentMethod] = useState('cod');

    const order = {
      customerName: "Nguyễn Văn A",
      phone: "0000000000",
      address: "Số ..., Đường..., Phường..., Quận,..., Thành phố",
      productPrice: 12000000, 
      shippingFee: 0,
      discount: 500000,
      discountCode: "GIAMGIA500",
      total: 11500000
    };

    const handlePayment = () => {
      console.log('Selected payment method:', paymentMethod);
      // Xử lý thanh toán ở đây
    };

    // Format price to VND
    const formatPrice = (price) => {
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫";
    };

  return (
    <main className='min-h-screen bg-gray-50 py-12'>
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-blue-600 text-white py-2 px-6 rounded-full text-lg font-medium flex items-center gap-2">
            <FaShoppingBag />
            <span>Thanh toán đơn hàng</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 transition-all duration-300 hover:shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3 flex items-center gap-2">
            <FaTruck className="text-blue-600" />
            Thông tin giao hàng
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FaUserAlt className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Người nhận</p>
                  <p className="font-medium">{order.customerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FaPhoneAlt className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Số điện thoại</p>
                  <p className="font-medium">{order.phone}</p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-start gap-2">
                <FaMapMarkerAlt className="text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Địa chỉ giao hàng</p>
                  <p className="font-medium">
                    {order.fullAddress || order.address}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 transition-all duration-300 hover:shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">Thông tin đơn hàng</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Tổng tiền sản phẩm</span>
              <span className="font-medium">{formatPrice(order.productPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phí vận chuyển</span>
              <span className="font-medium">{formatPrice(order.shippingFee)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá ({order.discountCode})</span>
                <span className="font-medium">-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-3 mt-3">
              <span className="text-lg font-bold">Tổng thanh toán</span>
              <span className="text-lg font-bold text-blue-600">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Payment methods */}
        <PaymentMethods
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
        />

        {/* Payment button */}
        <PaymentButton onClick={handlePayment} />
      </div>
    </main>
  );
}

export default PaymentPage;
