import { useState } from 'react';
import { supabase } from '@/components/services/supabase';
import { toast } from 'react-hot-toast';

const SUBJECTS = [
  'Tư vấn sản phẩm',
  'Đặt hàng & Thanh toán',
  'Vận chuyển & Giao hàng',
  'Bảo hành & Đổi trả',
  'Kỹ thuật & Hỗ trợ',
  'Khiếu nại',
  'Khác',
];

const CustomerSupportForm = () => {
  const [form, setForm] = useState({
    subject:   '',
    title:     '',
    message:   '',
    full_name: '',
    email:     '',
    phone:     '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.subject || !form.message) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('customer_feedback').insert({
        user_id:   user?.id || null,
        full_name: form.full_name,
        email:     form.email,
        phone:     form.phone || null,
        subject:   `${form.subject}${form.title ? ' - ' + form.title : ''}`,
        message:   form.message,
      });

      if (error) throw error;

      toast.success('Cảm ơn quý khách! Chúng tôi sẽ liên hệ lại sớm nhất có thể.');
      setForm({ subject: '', title: '', message: '', full_name: '', email: '', phone: '' });
    } catch (err) {
      console.error('CustomerSupportForm error:', err);
      toast.error('Gửi liên hệ thất bại. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-2xl mx-auto p-4 sm:p-6 font-sans'>
      <h1 className='text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8 leading-tight'>
        HAAD Tech XIN HÂN HẠNH ĐƯỢC HỖ TRỢ QUÝ KHÁCH
      </h1>

      <form onSubmit={handleSubmit} className='space-y-4 sm:space-y-6'>
        {/* Subject */}
        <section>
          <h2 className='font-medium mb-2 sm:mb-3 text-sm sm:text-base'>
            Quý khách đang quan tâm về: <span className='text-red-500'>*</span>
          </h2>
          <select
            name='subject'
            value={form.subject}
            onChange={handleChange}
            required
            className='w-full p-2 sm:p-3 border rounded-md mb-3 sm:mb-4 text-sm sm:text-base'
          >
            <option value=''>Chọn chủ đề</option>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <div className='space-y-2'>
            <label className='block font-medium text-sm sm:text-base'>Tiêu đề:</label>
            <input
              type='text'
              name='title'
              value={form.title}
              onChange={handleChange}
              placeholder='Quý khách vui lòng nhập tiêu đề'
              className='w-full p-2 sm:p-3 border rounded-md text-sm sm:text-base'
            />
          </div>
        </section>

        {/* Message */}
        <section>
          <h2 className='font-medium mb-2 sm:mb-3 text-sm sm:text-base'>
            Nội dung: <span className='text-red-500'>*</span>
          </h2>
          <textarea
            name='message'
            value={form.message}
            onChange={handleChange}
            required
            placeholder='Xin quý khách vui lòng mô tả chi tiết'
            className='w-full p-2 sm:p-3 border rounded-md h-24 sm:h-32 text-sm sm:text-base resize-none'
          />
        </section>

        <hr className='my-4 sm:my-6' />

        {/* Contact info */}
        <section className='space-y-3 sm:space-y-4'>
          <div>
            <label className='block font-medium mb-1 sm:mb-2 text-sm sm:text-base'>
              Họ và tên: <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              name='full_name'
              value={form.full_name}
              onChange={handleChange}
              required
              placeholder='Nhập họ tên'
              className='w-full p-2 sm:p-3 border rounded-md text-sm sm:text-base'
            />
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
            <div>
              <label className='block font-medium mb-1 sm:mb-2 text-sm sm:text-base'>
                Địa chỉ Email: <span className='text-red-500'>*</span>
              </label>
              <input
                type='email'
                name='email'
                value={form.email}
                onChange={handleChange}
                required
                placeholder='Nhập Email'
                className='w-full p-2 sm:p-3 border rounded-md text-sm sm:text-base'
              />
            </div>
            <div>
              <label className='block font-medium mb-1 sm:mb-2 text-sm sm:text-base'>
                Số điện thoại:
              </label>
              <input
                type='tel'
                name='phone'
                value={form.phone}
                onChange={handleChange}
                placeholder='Nhập sđt'
                className='w-full p-2 sm:p-3 border rounded-md text-sm sm:text-base'
              />
            </div>
          </div>
        </section>

        <button
          type='submit'
          disabled={loading}
          className='w-full bg-red-600 text-white py-2 sm:py-3 rounded-md font-semibold hover:bg-red-700 transition-colors text-sm sm:text-base mt-4 sm:mt-6 disabled:opacity-60'
        >
          {loading ? 'Đang gửi...' : 'GỬI LIÊN HỆ'}
        </button>
      </form>
    </div>
  );
};

export default CustomerSupportForm;
