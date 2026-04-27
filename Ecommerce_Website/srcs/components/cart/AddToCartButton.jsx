import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiCheck, FiShoppingBag } from 'react-icons/fi';
import QuickBuyButton from './QuickBuyButton';

/**
 * AddToCartButton - A reusable button component for adding products to cart
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onAddToCart - Function to call when adding to cart
 * @param {number} props.quantity - Quantity to add (default: 1)
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {boolean} props.small - Whether to use a smaller button size
 * @param {boolean} props.outline - Whether to use outline style instead of filled
 * @param {string} props.customText - Custom text for the button
 * @param {boolean} props.showQuickBuy - Whether to show the quick buy button
 * @param {Object} props.product - Product data for quick buy
 */
function AddToCartButton({ 
  onAddToCart, 
  quantity = 1,
  disabled = false, 
  small = false,
  outline = false,
  customText = null,
  showQuickBuy = false,
  product = null
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  
  const handleClick = () => {
    if (disabled || isAdding) return;
    
    setIsAdding(true);
    
    // Call the provided action
    if (onAddToCart) {
      onAddToCart(quantity);
    }
    
    // Show success state
    setTimeout(() => {
      setIsAdding(false);
      setIsAdded(true);
      
      // Reset after animation
      setTimeout(() => {
        setIsAdded(false);
      }, 1500);
    }, 600);
  };
  
  // Button text based on state
  const buttonText = () => {
    if (customText) return customText;
    if (isAdding) return "Đang thêm...";
    if (isAdded) return "Đã thêm vào giỏ";
    return "Thêm vào giỏ hàng";
  };
  
  return (
    <div className={`${showQuickBuy ? 'flex gap-2' : ''}`}>
      <motion.button
        onClick={handleClick}
        disabled={disabled || isAdding}
        whileHover={!disabled && !isAdding ? { scale: 1.02 } : {}}
        whileTap={!disabled && !isAdding ? { scale: 0.98 } : {}}
        className={`
          ${small ? 'px-3 py-2 text-sm' : 'px-5 py-3 text-base'} 
          ${outline 
            ? 'bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50' 
            : isAdded 
              ? 'bg-green-500 text-white' 
              : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
          }
          ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
          ${showQuickBuy ? 'flex-1' : 'w-full'}
          flex items-center justify-center gap-2 rounded-xl font-medium 
          transition-all duration-300 shadow-sm hover:shadow
        `}
      >
        <span className="flex items-center gap-2">
          {isAdded ? (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex items-center gap-2"
            >
              <FiCheck className="text-white" />
              {buttonText()}
            </motion.span>
          ) : (
            <>
              <FiShoppingCart className={outline ? 'text-blue-600' : 'text-white'} size={small ? 16 : 20} />
              <span>{buttonText()}</span>
            </>
          )}
        </span>
        
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-blue-600 rounded-xl"
          >
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
          </motion.div>
        )}
      </motion.button>
      
      {showQuickBuy && product && (
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`${small ? 'py-2' : 'py-3'} px-4 bg-gradient-to-r from-red-500 to-red-600 
            text-white rounded-xl font-medium shadow-sm hover:shadow flex items-center justify-center`}
        >
          <QuickBuyButton
            product={{...product, quantity}}
            buttonText="Mua ngay"
            showIcon={true}
            className="bg-transparent shadow-none hover:bg-transparent p-0 flex items-center gap-1"
          />
        </motion.div>
      )}
    </div>
  );
}

export default AddToCartButton; 