import Spinner from '../../../ui/Spinner';
import { motion } from 'framer-motion';

const DashboardCard = ({ title, value, icon, isLoading, color = 'blue' }) => {
  // Define gradient colors based on the color prop
  const gradients = {
    blue: 'from-blue-500 to-indigo-600',
    red: 'from-red-500 to-pink-600',
    green: 'from-emerald-500 to-teal-600',
    purple: 'from-purple-500 to-indigo-600',
    orange: 'from-orange-500 to-amber-600',
  };

  const gradient = gradients[color] || gradients.blue;

  return (
    <motion.div 
      className={`bg-gradient-to-br ${gradient} shadow-lg rounded-2xl p-6 
                text-white relative overflow-hidden backdrop-blur-sm`}
      initial={{ scale: 0.98, opacity: 0.8 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Decorative circle */}
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10 z-0"/>
      <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full bg-white/5 z-0"/>
      
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className='text-sm text-white/80 font-medium'>{title}</p>
          {isLoading ? (
            <Spinner />
          ) : (
            <h3 className='text-2xl font-bold mt-2 drop-shadow-sm'>{value}</h3>
          )}
        </div>
        <div className='text-4xl bg-white/20 p-3 rounded-xl shadow-inner backdrop-blur-sm'>{icon}</div>
      </div>
    </motion.div>
  );
};

export default DashboardCard;
