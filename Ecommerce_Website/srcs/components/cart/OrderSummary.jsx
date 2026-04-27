import { useState } from "react";
import { motion } from "framer-motion";
import { FiShoppingBag, FiTag, FiArrowRight, FiShield, FiTruck, FiCheckCircle, FiMapPin, FiEdit2 } from "react-icons/fi";

function OrderSummary({ cart = [], onCheckout, address = null, onEditAddress = null }) {
  const [discountCode, setDiscountCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  
  // Mã giảm giá mẫu
  const availableDiscounts = {
    "WELCOME10": { percent: 10, maxAmount: 100000 },
    "SUMMER15": { percent: 15, maxAmount: 150000 },
    "SPECIAL20": { percent: 20, maxAmount: 200000 }
  };
  
  // Tính tổng tiền sản phẩm
  const calculateSubtotal = () => {
    if (!cart || cart.length === 0) return 0;
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };
  
  // Tính số tiền giảm giá
  const calculateDiscount = () => {
    if (!appliedDiscount) return 0;
    const subtotal = calculateSubtotal();
    const discountAmount = Math.min(
      (subtotal * appliedDiscount.percent) / 100,
      appliedDiscount.maxAmount
    );
    return discountAmount;
  };
  
  // Tính tổng tiền cuối cùng
  const calculateTotal = () => {
    return Math.max(0, calculateSubtotal() - calculateDiscount());
  };
  
  // Format giá theo định dạng VND
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "₫";
  };
  
  // Xử lý áp dụng mã giảm giá
  const handleApplyDiscount = () => {
    if (!discountCode || isApplying) return;
    
    setIsApplying(true);
    // Simulating API call with timeout
    setTimeout(() => {
      const discount = availableDiscounts[discountCode.toUpperCase()];
      if (discount) {
        setAppliedDiscount({
          code: discountCode.toUpperCase(),
          ...discount
        });
      } else {
        setAppliedDiscount(null);
      }
      setIsApplying(false);
    }, 500);
  };
  
  const subtotal = calculateSubtotal();
  const discount = calculateDiscount();
  const total = calculateTotal();
  const shippingFee = total >= 500000 ? 0 : 30000; // Miễn phí vận chuyển cho đơn hàng từ 500.000đ
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="bg-white p-6 rounded-2xl shadow-lg"
    >
      <motion.h2 variants={item} className="text-xl font-bold mb-6 flex items-center gap-2">
        <FiShoppingBag className="text-blue-600" />
        <span>Tóm tắt đơn hàng</span>
      </motion.h2>

      {/* Address Section */}
      {address && (
        <motion.div 
          variants={item} 
          className="mb-5 p-3 bg-blue-50 rounded-lg border border-blue-100"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-blue-800 flex items-center gap-1">
              <FiMapPin className="text-blue-600" />
              Địa chỉ giao hàng
            </h3>
            {onEditAddress && (
              <button 
                onClick={onEditAddress}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
              >
                <FiEdit2 size={14} />
                Thay đổi
              </button>
            )}
          </div>
          <div className="text-sm text-gray-700">
            <p className="font-medium">{address.recipient} | {address.phone}</p>
            <p>{address.address}, {address.ward}, {address.district}, {address.city}</p>
          </div>
        </motion.div>
      )}

      <div className="space-y-4 mb-6">
        <motion.div variants={item} className="flex justify-between items-center">
          <span className="text-gray-600">Tạm tính:</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </motion.div>
        
        <motion.div variants={item} className="flex justify-between items-center">
          <span className="text-gray-600">Phí vận chuyển:</span>
          {shippingFee === 0 ? (
            <span className="text-green-600 font-medium">Miễn phí</span>
          ) : (
            <span className="font-medium">{formatPrice(shippingFee)}</span>
          )}
        </motion.div>

        {appliedDiscount && (
          <motion.div 
            variants={item}
            className="flex justify-between items-center text-green-600"
          >
            <div className="flex items-center gap-2">
              <FiTag />
              <span>Giảm giá ({appliedDiscount.percent}%):</span>
            </div>
            <span className="font-medium">-{formatPrice(discount)}</span>
          </motion.div>
        )}

        <motion.div variants={item} className="flex gap-2">
          <div className="relative flex-grow">
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              placeholder="Nhập mã giảm giá"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            {appliedDiscount && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <FiCheckCircle className="text-green-500" />
              </div>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleApplyDiscount}
            disabled={!discountCode || isApplying}
            className={`px-4 py-2 rounded-lg transition-colors flex-shrink-0 font-medium ${
              !discountCode || isApplying
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {isApplying ? "Đang áp dụng..." : "Áp dụng"}
          </motion.button>
        </motion.div>

        <motion.div variants={item} className="flex justify-between font-bold text-lg border-t pt-4 border-gray-200">
          <span>Tổng tiền:</span>
          <span className="text-red-600">{formatPrice(total + shippingFee)}</span>
        </motion.div>
      </div>

      <motion.button
        variants={item}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onCheckout && onCheckout()}
        disabled={subtotal === 0 || !address}
        className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${
          subtotal === 0 || !address
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md hover:shadow-lg"
        }`}
      >
        <span>{!address ? "Vui lòng chọn địa chỉ" : "Đặt hàng ngay"}</span>
        <FiArrowRight />
      </motion.button>
      
      <motion.div 
        variants={item}
        className="mt-4 text-xs text-gray-500"
      >
        <div className="flex items-center gap-1 mb-1">
          <FiShield className="text-blue-500" />
          <span>Giao dịch an toàn & bảo mật</span>
        </div>
        <div className="flex items-center gap-1">
          <FiTruck className="text-blue-500" /> 
          <span>Miễn phí vận chuyển cho đơn hàng từ 500.000đ</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default OrderSummary;
