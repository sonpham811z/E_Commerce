import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useCreateProduct } from './useCreateProduct';

function ProductForm({ onCancel }) {
  const { createProduct, isCreating } = useCreateProduct();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    createProduct(data, {
      onSuccess: () => {
        toast.success('Đã thêm sản phẩm thành công!');
        reset();
        onCancel();
      },
      onError: (err) => {
        toast.error(err.message || 'Thêm sản phẩm thất bại!');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      {/* 1. Thông tin chung */}
      <section className='bg-gray-50 p-4 rounded-md'>
        <h3 className='text-sm font-semibold text-gray-700 uppercase mb-4'>
          Thông tin chung
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div>
            <label className='text-sm font-medium'>ID</label>
            <input
              type='text'
              {...register('id', { required: 'Không được để trống' })}
              className='w-full border rounded px-3 py-2 mt-1'
            />
            {errors.id && (
              <p className='text-red-500 text-sm'>{errors.id.message}</p>
            )}
          </div>
          <div>
            <label className='text-sm font-medium'>Tên</label>
            <input
              type='text'
              {...register('title')}
              className='w-full border rounded px-3 py-2 mt-1'
            />
          </div>
          <div>
            <label className='text-sm font-medium'>Thương hiệu</label>
            <input
              type='text'
              {...register('brand')}
              className='w-full border rounded px-3 py-2 mt-1'
            />
          </div>
          <div>
            <label className='text-sm font-medium'>Loại</label>
            <input
              type='text'
              {...register('category', { required: 'Không được để trống' })}
              className='w-full border rounded px-3 py-2 mt-1'
            />
            {errors.category && (
              <p className='text-red-500 text-sm'>{errors.category.message}</p>
            )}
          </div>
        </div>
      </section>

      {/* 2. Giá & hình ảnh */}
      <section className='bg-gray-50 p-4 rounded-md'>
        <h3 className='text-sm font-semibold text-gray-700 uppercase mb-4'>
          Giá & ảnh
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div>
            <label className='text-sm font-medium'>Ảnh chính</label>
            <input
              type='text'
              {...register('image')}
              className='w-full border rounded px-3 py-2 mt-1'
            />
          </div>
          <div>
            <label className='text-sm font-medium'>Giá gốc</label>
            <input
              type='number'
              {...register('original_price')}
              className='w-full border rounded px-3 py-2 mt-1'
            />
          </div>
          <div>
            <label className='text-sm font-medium'>Giá sale</label>
            <input
              type='number'
              {...register('sale_price')}
              className='w-full border rounded px-3 py-2 mt-1'
            />
          </div>
          <div>
            <label className='text-sm font-medium'>Giảm giá (%)</label>
            <input
              type='number'
              {...register('discount')}
              className='w-full border rounded px-3 py-2 mt-1'
            />
          </div>
        </div>
      </section>

      {/*3. Đánh giá */}
      <section className='bg-gray-50 p-4 rounded-md'>
        <h3 className='text-sm font-semibold text-gray-700 uppercase mb-4'>
          Đánh giá
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <label className='text-sm font-medium'>Rating</label>
            <input
              type='number'
              step='0.1'
              {...register('rating')}
              className='w-full border rounded px-3 py-2 mt-1'
            />
          </div>
          <div>
            <label className='text-sm font-medium'>Số lượt đánh giá</label>
            <input
              type='number'
              {...register('review_count')}
              className='w-full border rounded px-3 py-2 mt-1'
            />
          </div>
          <div>
            <label className='text-sm font-medium'>Ảnh phụ (thumbnails)</label>
            <input
              type='text'
              {...register('thumbnails')}
              placeholder='url1, url2, url3'
              className='w-full border rounded px-3 py-2 mt-1'
            />
          </div>
        </div>
      </section>

      {/* 4. Mô tả  */}
      <section className='bg-gray-50 p-4 rounded-md'>
        <h3 className='text-sm font-semibold text-gray-700 uppercase mb-4'>
          Mô tả sản phẩm
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='text-sm font-medium'>Mô tả</label>
            <textarea
              {...register('description')}
              className='w-full border rounded px-3 py-2 mt-1 h-24'
            />
          </div>
          <div>
            <label className='text-sm font-medium'>Ảnh chi tiết</label>
            <input
              type='text'
              {...register('detail_image')}
              className='w-full border rounded px-3 py-2 mt-1'
            />
          </div>
        </div>
      </section>

      {/* 5. Hiệu năng & mở rộng  */}
      <section className='bg-gray-50 p-4 rounded-md'>
        <h3 className='text-sm font-semibold text-gray-700 uppercase mb-4'>
          Thông tin kỹ thuật
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='text-sm font-medium'>Hiệu năng</label>
            <textarea
              {...register('performance')}
              className='w-full border rounded px-3 py-2 mt-1 h-24'
            />
          </div>
          <div>
            <label className='text-sm font-medium'>Thông tin mở rộng</label>
            <textarea
              {...register('extends')}
              className='w-full border rounded px-3 py-2 mt-1 h-24'
            />
          </div>
        </div>
      </section>

      <div className='flex justify-end gap-3 pt-4'>
        <button
          type='button'
          disabled={isCreating}
          onClick={() => {
            reset();
            onCancel();
          }}
          className='px-4 py-2 rounded border border-red-600 text-red-600 bg-white hover:bg-red-50 transition'
        >
          Huỷ
        </button>
        <button
          disabled={isCreating}
          type='submit'
          className='px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition'
        >
          Thêm sản phẩm
        </button>
      </div>
    </form>
  );
}

export default ProductForm;
