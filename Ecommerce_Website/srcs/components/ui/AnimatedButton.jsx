import { motion } from 'framer-motion';

const AnimatedButton = ({ children, delay = 0, className = '', ...rest }) => {
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay }}
      className={className}
      {...rest}
    >
      {children}
    </motion.button>
  );
};

export default AnimatedButton;
