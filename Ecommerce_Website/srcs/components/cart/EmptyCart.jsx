import { motion } from "framer-motion";
import { FiArrowRight, FiShoppingCart } from "react-icons/fi";
import { Link } from "react-router-dom";

function EmptyCart() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto text-center py-12 px-6 bg-white rounded-2xl shadow-md"
    >
      <motion.div 
        initial={{ y: -10 }}
        animate={{ y: 0 }}
        transition={{ 
          repeat: Infinity, 
          repeatType: "reverse", 
          duration: 1.5 
        }}
        className="w-24 h-24 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center"
      >
        <FiShoppingCart className="w-12 h-12 text-blue-500" />
      </motion.div>
      
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl md:text-3xl font-bold mb-4 text-gray-800"
      >
        Giỏ hàng của bạn đang trống!
      </motion.h2>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-500 max-w-md mx-auto mb-8"
      >
        Có vẻ như bạn chưa thêm bất kỳ sản phẩm nào vào giỏ hàng của mình.
        Hãy khám phá các sản phẩm của chúng tôi và tìm thấy những gì bạn cần.
      </motion.p>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Link to="/san-pham">
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
          >
            <span>Mua sắm ngay</span>
            <FiArrowRight className="text-lg" />
          </motion.button>
        </Link>
        
        <Link to="/">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
          >
            <span>Quay lại trang chủ</span>
          </motion.button>
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default EmptyCart;
