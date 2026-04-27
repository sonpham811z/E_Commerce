import { useNavigate } from 'react-router-dom';

function ModalWrapper({ children }) {
  const navigate = useNavigate();
  return (
    <div className='fixed inset-0 z-50 flex justify-center items-center p-4 sm:p-6 lg:p-8 bg-black/20'>
      <div className='bg-white rounded-xl relative max-w-4xl w-full max-h-[90vh] overflow-y-auto p-0 shadow-2xl'>
        <button
          onClick={() => navigate('/home', { replace: true })}
          className='absolute top-3 right-4 text-gray-600 text-3xl font-bold hover:text-red-500 z-10 transition-colors duration-200'
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

export default ModalWrapper;
