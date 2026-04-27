import { motion } from 'framer-motion';

const animationProps = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30, position: 'absolute' },
  transition: { duration: 0.6, ease: 'easeInOut' },
};

const AnimatedPage = ({ children }) => {
  return (
    <motion.div {...animationProps} className='w-full'>
      {children}
    </motion.div>
  );
};

export default AnimatedPage;
