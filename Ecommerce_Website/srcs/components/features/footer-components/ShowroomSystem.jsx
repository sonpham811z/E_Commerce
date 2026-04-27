const ShowroomSystem = () => {
  return (
    <div className='max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md text-sm sm:text-base'>
      <h1 className='text-xl sm:text-2xl font-bold text-red-800 mb-4 sm:mb-6'>
        HỆ THỐNG SHOWROOM HAADTech
      </h1>

      <div className='mb-4 sm:mb-8 p-3 sm:p-4 bg-gray-100 rounded-lg'>
        <p className='italic text-gray-700 text-xs sm:text-sm'>
          Địa chỉ nghiên cứu sau khi thiết bị chủ quyền cơ để:
        </p>
      </div>

      <div className='mb-6'>
        <h2 className='text-lg sm:text-xl font-semibold mb-3 sm:mb-4'>
          CHỌN KHU VỰC CỦA BẠN
        </h2>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
          <div className='border p-4 sm:p-6 rounded-lg hover:shadow-md cursor-pointer text-center'>
            <h3 className='text-base sm:text-lg font-medium mb-1 sm:mb-2'>
              KHU VỰC MIỀN BẮC
            </h3>
            <p className='text-xs sm:text-sm text-gray-600'>
              Các showroom tại Hà Nội và khu vực phía Bắc
            </p>
          </div>

          <div className='border p-4 sm:p-6 rounded-lg hover:shadow-md cursor-pointer text-center'>
            <h3 className='text-base sm:text-lg font-medium mb-1 sm:mb-2'>
              KHU VỰC MIỀN NAM
            </h3>
            <p className='text-xs sm:text-sm text-gray-600'>
              Các showroom tại TP.HCM và khu vực phía Nam
            </p>
          </div>
        </div>
      </div>

      <div className='text-center text-xs sm:text-sm text-gray-500'>
        <p>XEM NGAY</p>
      </div>
    </div>
  );
};

export default ShowroomSystem;
