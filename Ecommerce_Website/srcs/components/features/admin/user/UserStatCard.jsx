import AnimatedDiv from '../../../ui/AnimatedDiv';

const UserStatCard = ({ title, value, icon, color }) => (
  <AnimatedDiv className='bg-white p-5 rounded-xl shadow-sm border border-gray-100'>
    <div className='flex items-center'>
      <div className={`p-3 rounded-lg ${color} mr-4`}>{icon}</div>
      <div>
        <p className='text-sm font-medium text-gray-500'>{title}</p>
        <h3 className='text-2xl font-bold text-gray-800 mt-1'>{value}</h3>
      </div>
    </div>
  </AnimatedDiv>
);

export default UserStatCard;
