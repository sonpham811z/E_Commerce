import { FaTicketAlt as TicketIcon } from "react-icons/fa";
import { FiTag, FiShoppingBag, FiTruck, FiCreditCard } from "react-icons/fi";
import { motion } from "framer-motion";
import SubmitOrderButton from "./SubmitOrderButton";

function OrderSummary({ 
  subtotal, 
  shipping = 0, 
  discount = 0, 
  total, 
  formatPrice: externalFormatPrice,
  addressData,
  product,
  paymentMethod,
  discountInfo,
  onOrderSuccess,
  onOrderError,
  showSubmitButton = false
}) {
  const formatPrice = (price) => {
    if (externalFormatPrice) return externalFormatPrice(price);
    
    if (!price && price !== 0) return "0₫";
    try {
      return price.toLocaleString('vi-VN') + '₫';
    } catch (error) {
      return price + '₫';
    }
  };

  const calculateDiscountPercentage = () => {
    if (!subtotal || subtotal === 0 || !discount || discount === 0) return 0;
    return Math.round((discount / subtotal) * 100);
  };

  const discountPercentage = calculateDiscountPercentage();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const handleOrderSuccess = (data) => {
    if (onOrderSuccess) {
      onOrderSuccess(data);
    }
  };

  const handleOrderError = (error) => {
    if (onOrderError) {
      onOrderError(error);
    } else {
      console.error('Lỗi đặt hàng:', error);
      alert(`Đặt hàng thất bại: ${error}`);
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden" 
      animate="visible"
      className="flex flex-col gap-4 w-full bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl"
    >
      <div className="flex items-center justify-between border-b pb-3">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FiCreditCard className="text-blue-500" /> Chi tiết đơn hàng
        </h3>
        <div className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
          {total > 0 ? 'Đủ điều kiện đặt hàng' : 'Vui lòng chọn sản phẩm'}
        </div>
      </div>
      
      {/* Tạm tính */}
      <motion.div variants={itemVariants} className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-2 text-gray-700">
          <FiShoppingBag className="text-gray-500" />
          <span>Tạm tính</span>
        </div>
        <span className="font-medium">{formatPrice(subtotal)}</span>
      </motion.div>

      {/* Phí vận chuyển */}
      <motion.div variants={itemVariants} className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-2 text-gray-700">
          <FiTruck className="text-gray-500" />
          <span>Phí vận chuyển</span>
        </div>
        {shipping === 0 ? (
          <span className="font-medium text-green-600">Miễn phí</span>
        ) : (
          <span className="font-medium">{formatPrice(shipping)}</span>
        )}
      </motion.div>

      {/* Giảm giá */}
      {discount > 0 && (
        <motion.div variants={itemVariants} className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2 text-green-600">
            <FiTag className="text-green-500" />
            <span>Giảm giá {discountPercentage > 0 ? `(${discountPercentage}%)` : ''}</span>
          </div>
          <span className="font-medium text-green-600">-{formatPrice(discount)}</span>
        </motion.div>
      )}

      {/* Đường kẻ */}
      <div className="border-t border-dashed border-gray-200 my-2"></div>

      {/* Tổng tiền */}
      <motion.div 
        variants={itemVariants}
        className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl"
      >
        <span className="text-base font-semibold">Tổng cộng</span>
        <div className="text-right">
          <span className="text-lg font-bold bg-gradient-to-r from-red-500 to-pink-600 bg-clip-text text-transparent">
            {formatPrice(total)}
          </span>
          <p className="text-xs text-gray-500 mt-1">(Đã bao gồm VAT nếu có)</p>
        </div>
      </motion.div>

      {/* Submit button */}
      {showSubmitButton && (
        <motion.div variants={itemVariants} className="mt-4">
          <SubmitOrderButton
            addressData={addressData}
            product={product}
            paymentMethod={paymentMethod}
            discount={discountInfo}
            onSuccess={handleOrderSuccess}
            onError={handleOrderError}
          />
        </motion.div>
      )}

      {/* Extra Info */}
      <motion.div variants={itemVariants} className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg mt-1">
        <div className="flex items-center gap-1 mb-0.5">
          <TicketIcon className="text-blue-400" size={10} />
          <span>Sử dụng mã WELCOME để được giảm 10% cho đơn hàng đầu tiên</span>
        </div>
        <div className="flex items-center gap-1">
          <TicketIcon className="text-blue-400" size={10} />
          <span>Miễn phí vận chuyển cho đơn hàng từ 500.000₫</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default OrderSummary;
