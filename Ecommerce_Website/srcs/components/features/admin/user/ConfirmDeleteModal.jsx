const ConfirmDeleteModal = ({ onCancel, onConfirm }) => {
  return (
    <div className='fixed inset-0 bg-black/20 bg-opacity-40 z-50 flex items-center justify-center'>
      <div className='bg-white rounded-xl p-6 shadow-lg w-80'>
        <h2 className='text-lg font-semibold text-gray-800 mb-3'>
          Bạn chắc chắn muốn xoá người dùng này?
        </h2>
        <div className='flex justify-end gap-3 mt-4'>
          <button
            className='px-4 py-2 rounded-md text-sm border border-gray-300 hover:bg-gray-100'
            onClick={onCancel}
          >
            Huỷ
          </button>
          <button
            className='px-4 py-2 rounded-md text-sm bg-red-500 text-white hover:bg-red-600'
            onClick={onConfirm}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
