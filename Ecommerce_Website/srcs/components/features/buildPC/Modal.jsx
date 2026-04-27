import { MdOutlineClose } from 'react-icons/md';
import ModalPortal from '../../ui/ModalPortal';

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  const handleClickOutside = (e) => {
    if (e.target.id === 'modal-overlay') {
      onClose();
    }
  };

  return (
    <ModalPortal>
      <div
        id='modal-overlay'
        onClick={handleClickOutside}
        className='fixed inset-0 bg-black/30 z-50 flex items-center justify-center'
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className='bg-white w-[1000px] h-[670px] rounded shadow-lg border border-gray-200 flex flex-col overflow-hidden relative'
        >
          <button
            onClick={onClose}
            className='absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl z-10'
          >
            <MdOutlineClose size={35} />
          </button>

          <div className='flex flex-col h-full pt-10 px-6 pb-4'>
            <div className='text-2xl font-bold text-center text-gray-800 mb-2 shrink-0'>
              {title}
            </div>

            <div className='flex-1 overflow-y-auto'>{children}</div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

export default Modal;
