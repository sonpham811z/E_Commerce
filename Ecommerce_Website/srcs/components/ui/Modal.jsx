import { useEffect } from 'react';
import { AiOutlineClose } from 'react-icons/ai';

function Modal({ children, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white rounded-xl shadow-lg w-full max-w-3xl p-6 relative'>
        <button
          className='absolute top-2 right-2 text-gray-600 hover:text-black text-2xl font-bold'
          onClick={onClose}
        >
          <AiOutlineClose className='w-6 h-6' />
        </button>

        {children}
      </div>
    </div>
  );
}

export default Modal;
