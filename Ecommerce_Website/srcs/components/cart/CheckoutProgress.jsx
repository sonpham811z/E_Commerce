import { motion } from "framer-motion";
import { FiShoppingCart, FiClipboard, FiCreditCard, FiCheck } from "react-icons/fi";

const steps = [
  { 
    label: "Giỏ hàng",
    icon: <FiShoppingCart className="text-xl" />,
    description: "Xem giỏ hàng"
  },
  { 
    label: "Thông tin giao hàng", 
    icon: <FiClipboard className="text-xl" />,
    description: "Địa chỉ nhận hàng"
  },
  { 
    label: "Thanh toán", 
    icon: <FiCreditCard className="text-xl" />,
    description: "Chọn phương thức"
  },
  { 
    label: "Hoàn tất", 
    icon: <FiCheck className="text-xl" />,
    description: "Xác nhận đơn hàng"
  },
];

function CheckoutProgress({ currentStep = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md"
    >
      <div className="flex justify-between relative">
        {/* Progress bar background */}
        <div className="absolute h-1 bg-gray-200 top-7 left-[10%] right-[10%] z-0" />
        
        {/* Active progress bar */}
        <motion.div 
          className="absolute h-1 bg-gradient-to-r from-blue-500 to-blue-600 top-7 left-[10%] z-0"
          initial={{ width: "0%" }}
          animate={{ 
            width: `${Math.min(100, (currentStep / (steps.length - 1)) * 100)}%` 
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />

        {steps.map((step, index) => {
          const isActive = index <= currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <motion.div 
              key={index} 
              className="flex flex-col items-center z-10 relative"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300
                  ${isActive 
                    ? isCompleted 
                      ? "bg-green-500 text-white shadow-md" 
                      : "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md" 
                    : "bg-gray-100 text-gray-400 border border-gray-200"
                  }
                `}
              >
                {isCompleted ? <FiCheck className="text-2xl" /> : step.icon}
              </motion.div>
              
              <div className="mt-2 text-center">
                <span className={`text-sm font-medium ${isActive ? "text-blue-600" : "text-gray-500"}`}>
                  {step.label}
                </span>
                <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                  {step.description}
                </p>
              </div>
              
              {isCompleted && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center"
                >
                  <FiCheck className="text-white text-xs" />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default CheckoutProgress;
