import AnimatedDiv from '../../../ui/AnimatedDiv';

const AnalyticsCard = ({ title, value, icon, change, changeType }) => {
  return (
    <AnimatedDiv className='bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all duration-300'>
      <div className='flex justify-between items-start'>
        <div>
          <p className='text-sm font-semibold text-gray-500 uppercase tracking-wider'>
            {title}
          </p>
          <h3 className='text-3xl font-bold text-gray-800 mt-2 font-sans tracking-tight'>
            {value}
          </h3>
          {change && (
            <p
              className={`text-xs font-medium ${
                changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              } mt-2 flex items-center`}
            >
              <span className='mr-1'>
                {changeType === 'increase' ? '▲' : '▼'}
              </span>{' '}
              {change}
            </p>
          )}
        </div>
        <AnimatedDiv className='p-3 bg-red-50 rounded-lg'>
          <svg
            className='w-7 h-7 text-red-600'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            {icon}
          </svg>
        </AnimatedDiv>
      </div>
    </AnimatedDiv>
  );
};

export default AnalyticsCard;
