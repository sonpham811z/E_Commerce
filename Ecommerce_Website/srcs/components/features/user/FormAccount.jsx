import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { useAuth } from '../auth/AuthContext';
import { authApi } from '@/components/services/api';
import { toast } from 'react-hot-toast';
import {
  FaUser,
  FaVenusMars,
  FaPhoneAlt,
  FaCalendarDay,
  FaEnvelope,
  FaTimes,
  FaSave,
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import Spinner from '../../ui/Spinner';

function FormField({ icon, label, required, children }) {
  return (
    <div className='mb-5'>
      <label className='flex items-center gap-2 text-gray-700 font-medium mb-2'>
        <span className='text-red-500'>{icon}</span>
        {label} {required && <span className='text-red-500'>*</span>}
      </label>
      {children}
    </div>
  );
}

function FormAccount() {
  const navigate = useNavigate();
  const { userInfo, setUserInfo, userId } = useUser();
  const { updateAuthUser } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    gender: '',
    phone: '',
    dob: { day: '', month: '', year: '' },
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userInfo) {
      setForm({
        fullName: userInfo.fullName || '',
        gender: userInfo.gender || '',
        phone: userInfo.phone || '',
        dob: userInfo.dob || { day: '', month: '', year: '' },
      });
    }
  }, [userInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['day', 'month', 'year'].includes(name)) {
      setForm((prev) => ({
        ...prev,
        dob: { ...prev.dob, [name]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate
    if (!form.fullName || !form.phone || !form.gender) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc.');
      setLoading(false);
      return;
    }

    try {
      await authApi.patch('/auth/profile', {
        full_name: form.fullName,
        phone:     form.phone,
      });
    } catch (err) {
      toast.error('Cập nhật thất bại: ' + (err.response?.data?.error || err.message));
      setLoading(false);
      return;
    }

    // gender and dob are not in the backend — persist locally
    if (userId) {
      const extra = { gender: form.gender, dob: form.dob };
      localStorage.setItem(`userExtra_${userId}`, JSON.stringify(extra));
    }

    updateAuthUser({ full_name: form.fullName, phone: form.phone });
    setUserInfo((prev) => ({ ...prev, ...form }));
    toast.success('Thông tin tài khoản đã được cập nhật thành công!');
    setTimeout(() => { navigate('/user'); }, 1000);
    setLoading(false);
  };

  const handleCancel = () => {
    navigate('/user');
  };

  return (
    <div className='flex-1 bg-white rounded-2xl shadow-lg overflow-hidden'>
      {/* Header with gradient background */}
      <div className='bg-gradient-to-r from-red-500 to-red-600 px-8 py-6 text-white'>
        <h2 className='text-2xl font-bold'>Cập nhật thông tin tài khoản</h2>
        <p className='text-red-100 mt-1'>
          Điền thông tin cá nhân của bạn bên dưới
        </p>
      </div>

      {/* Form content */}
      <div className='p-8'>
        <form onSubmit={handleSubmit} className='space-y-5'>
          <FormField icon={<FaUser />} label='Họ tên' required>
            <input
              type='text'
              name='fullName'
              value={form.fullName}
              onChange={handleChange}
              className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all'
              placeholder='Nhập họ tên của bạn'
              required
            />
          </FormField>

          <FormField icon={<FaVenusMars />} label='Giới tính' required>
            <div className='grid grid-cols-3 gap-3'>
              {['Nam', 'Nữ', 'Khác'].map((gender) => (
                <label
                  key={gender}
                  className={`flex items-center justify-center px-4 py-3 border rounded-lg cursor-pointer transition-all ${
                    form.gender === gender
                      ? 'bg-red-50 border-red-500 text-red-600 font-medium shadow-sm'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type='radio'
                    name='gender'
                    value={gender}
                    checked={form.gender === gender}
                    onChange={handleChange}
                    className='hidden'
                  />
                  <span>{gender}</span>
                </label>
              ))}
            </div>
          </FormField>

          <FormField icon={<FaPhoneAlt />} label='Số điện thoại' required>
            <input
              type='tel'
              name='phone'
              value={form.phone}
              onChange={handleChange}
              className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all'
              placeholder='Nhập số điện thoại của bạn'
              required
            />
          </FormField>

          <FormField icon={<FaEnvelope />} label='Email'>
            <input
              type='email'
              value={userInfo?.email || ''}
              disabled
              className='w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed'
            />
            <p className='text-xs text-gray-500 mt-1'>
              Email không thể thay đổi
            </p>
          </FormField>

          <FormField icon={<FaCalendarDay />} label='Ngày sinh'>
            <div className='grid grid-cols-3 gap-3'>
              <div>
                <input
                  type='number'
                  name='day'
                  value={form.dob.day}
                  onChange={handleChange}
                  placeholder='Ngày'
                  min='1'
                  max='31'
                  className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all'
                />
              </div>
              <div>
                <input
                  type='number'
                  name='month'
                  value={form.dob.month}
                  onChange={handleChange}
                  placeholder='Tháng'
                  min='1'
                  max='12'
                  className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all'
                />
              </div>
              <div>
                <input
                  type='number'
                  name='year'
                  value={form.dob.year}
                  onChange={handleChange}
                  placeholder='Năm'
                  min='1900'
                  max={new Date().getFullYear()}
                  className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all'
                />
              </div>
            </div>
          </FormField>

          {/* Buttons */}
          <div className='flex justify-end gap-4 mt-8'>
            <button
              type='button'
              onClick={handleCancel}
              className='px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-300 flex items-center gap-2'
            >
              <FaTimes className='h-5 w-5' />
              Hủy
            </button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type='submit'
              className='bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 flex items-center gap-2'
              disabled={loading}
            >
              {loading ? (
                <Spinner className='w-5 h-5' />
              ) : (
                <>
                  <FaSave className='h-5 w-5' />
                  Lưu thông tin
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormAccount;
