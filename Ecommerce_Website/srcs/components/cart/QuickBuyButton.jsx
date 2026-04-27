import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiShoppingBag } from 'react-icons/fi';
import { useUser } from '@/components/features/user/UserContext';

const QuickBuyButton = ({ 
  product, 
  size = "md", 
  showIcon = true,
  className = "",
  buttonText = "Mua ngay"
}) => {
  const navigate = useNavigate();
  const { userInfo } = useUser();
  
  // Format price for consistent display
  const formatPrice = (price) => {
    if (!price && price !== 0) return "0 ₫";
    
    if (typeof price === 'string') {
      // If it's already formatted with VND symbol, return as is
      if (price.includes('₫')) return price;
      // If it's a string number, format it
      return parseInt(price.replace(/[^\d]/g, '')).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫';
    }
    // If it's a number
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫';
  };

  const handleQuickBuy = () => {
    // Check if user is logged in
    if (!userInfo) {
      toast.error('Vui lòng đăng nhập để mua hàng');
      navigate('/home', { state: { modal: 'login' } });
      return;
    }
    
    // Check if the product has all required information
    if (!product || !product.id) {
      toast.error('Không thể mua sản phẩm này');
      return;
    }
    
    // Prepare product data for order page
    const orderProduct = {
      id: product.id,
      title: product.name || product.title,
      brand: product.brand || 'Unknown',
      image: product.image,
      originalPrice: product.originalPrice ? formatPrice(product.originalPrice) : null,
      salePrice: formatPrice(product.price || product.salePrice || 0),
      quantity: product.quantity || 1,
    };
    
    // Navigate to order page with product data
    navigate('/order', {
      state: { product: orderProduct }
    });
    
    // Show success notification
    toast.success('Đang tiến hành đặt hàng...', {
      icon: '🛒',
      duration: 2000,
    });
  };

  // Button size styles
  const sizeStyles = {
    sm: "text-xs px-2 py-1 rounded-full",
    md: "text-sm px-3 py-1.5 rounded-full",
    lg: "text-base px-4 py-2 rounded-lg"
  };
  
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleQuickBuy}
      className={`bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm ${sizeStyles[size]} ${className}`}
    >
      <span className="flex items-center justify-center gap-1">
        {showIcon && <FiShoppingBag className="text-white" />}
        <span>{buttonText}</span>
      </span>
    </motion.button>
  );
};

export default QuickBuyButton; 