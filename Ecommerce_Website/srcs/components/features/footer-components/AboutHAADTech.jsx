function AboutHAADTech() {
  return (
    <main className='max-w-4xl mx-auto p-4 sm:p-6 md:p-8 bg-white rounded-xl shadow-lg mt-4 sm:mt-6 md:mt-8 font-sans text-gray-800 mb-12 sm:mb-16 md:mb-24 border border-gray-100'>
      <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-center text-red-600'>
        Giới thiệu về HAADTech
      </h1>

      <p className='mb-4 sm:mb-6 leading-relaxed text-justify text-sm sm:text-base'>
        <strong>HAADTech</strong> là một website thương mại điện tử mô phỏng,
        được phát triển như một phần của đồ án học phần{' '}
        <em>Phát triển ứng dụng web</em>. Đây là sản phẩm của nhóm sinh viên
        mang tên <strong>HAAD Tech</strong>, với mong muốn áp dụng kiến thức đã
        học vào việc xây dựng một nền tảng web hiện đại, thực tế và thân thiện
        với người dùng.
      </p>

      <p className='mb-4 sm:mb-6 leading-relaxed text-justify text-sm sm:text-base'>
        Website được thiết kế với giao diện lấy cảm hứng từ các trang thương mại
        điện tử chuyên về thiết bị công nghệ, cho phép người dùng trải nghiệm
        các chức năng như duyệt sản phẩm, tìm kiếm, giỏ hàng, thanh toán và quản
        lý người dùng. Toàn bộ hệ thống được xây dựng bằng{' '}
        <strong className='text-blue-600'>ReactJS</strong>, sử dụng{' '}
        <strong className='text-teal-600'>Tailwind CSS</strong> cho phần giao
        diện và <strong className='text-green-600'>Supabase</strong> để quản lý
        dữ liệu.
      </p>

      <p className='mb-6 sm:mb-8 leading-relaxed text-justify text-sm sm:text-base'>
        Mục tiêu của dự án không chỉ là hoàn thành yêu cầu môn học mà còn là cơ
        hội để nhóm rèn luyện kỹ năng làm việc nhóm, thiết kế giao diện, xây
        dựng logic front-end và kết nối với backend thực tế. Dự án cũng thể hiện
        tinh thần học tập chủ động và khả năng ứng dụng công nghệ hiện đại vào
        sản phẩm cụ thể.
      </p>

      <div className='bg-gray-50 p-4 sm:p-6 rounded-lg border-l-4 border-red-600'>
        <div className='flex flex-col text-center sm:text-right gap-1 sm:gap-2 font-semibold text-gray-700'>
          <p className='italic text-base sm:text-lg mb-2'>
            Nhóm thực hiện: HAAD Tech
          </p>
          <p className='text-sm sm:text-base'>Đặng Thiên Ân</p>
          <p className='text-sm sm:text-base'>Nguyễn Văn Ân</p>
          <p className='text-sm sm:text-base'>Nguyễn Ngọc An</p>
          <p className='text-sm sm:text-base'>Cao Nguyễn Kỳ Dỹ</p>
          <p className='text-sm sm:text-base'>Nguyễn Triệu Hoàng</p>
          <p className='text-sm sm:text-base'>Lưu Lê Ngọc Huyền</p>
        </div>
      </div>
    </main>
  );
}

export default AboutHAADTech;
