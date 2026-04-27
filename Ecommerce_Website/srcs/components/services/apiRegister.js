import { authApi } from './api';

// Same signature as before: registerUser({ userData })
export async function registerUser({ userData }) {
  try {
    const { data } = await authApi.post('/auth/register', {
      email:     userData.email,
      password:  userData.password,
      full_name: userData.fullName || userData.full_name || '',
      phone:     userData.phone    || '',
    });

    return { user: data.data.user };
  } catch (error) {
    const msg = error.response?.data?.error || error.message;
    if (msg.includes('already') || msg.includes('exists')) {
      throw new Error('Email này đã được đăng ký');
    }
    throw new Error(msg);
  }
}
