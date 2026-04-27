import { motion } from "framer-motion";
import { FiShoppingCart } from "react-icons/fi";

function CartHeader({ count, selectedCount = null, onContinueShopping = null }) {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between py-6 border-b border-gray-200"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <FiShoppingCart className="w-7 h-7 text-blue-600" />
          {count > 0 && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold"
            >
              {count}
            </motion.div>
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Giỏ hàng của bạn
          </h1>
          <p className="text-sm text-gray-500">
            {count > 0 ? (
              selectedCount !== null 
                ? `${count} sản phẩm trong giỏ hàng (${selectedCount} đã chọn)`
                : `${count} sản phẩm trong giỏ hàng`
            ) : (
              "Chưa có sản phẩm nào"
            )}
          </p>
        </div>
      </div>
      
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button 
            onClick={onContinueShopping}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 font-medium hover:underline"
          >
            Tiếp tục mua sắm
          </button>
        </motion.div>
      )}
    </motion.header>
  );
}

export default CartHeader;
