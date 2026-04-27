import { motion } from 'framer-motion';

const AnimatedDiv = ({
  children,
  delay = 0,
  className = '',
  style = {},
  ...rest
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedDiv;
