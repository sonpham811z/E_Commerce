import { authApi } from './api';

function isValidEmail(email) {
  return typeof email === 'string' && /.+@.+\..+/.test(email);
}

// Same signature as before: apiLogin({ username, password })
export async function apiLogin({ username, password }) {
  if (!username || !password) {
    throw new Error('Vui lòng nhập đầy đủ email và mật khẩu');
  }
  if (!isValidEmail(username)) {
    throw new Error('Email không hợp lệ');
  }

  try {
    const { data } = await authApi.post('/auth/login', { email: username, password });

    // Store tokens
    localStorage.setItem('accessToken',  data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);

    // Return same shape as old Supabase response
    return {
      user:    data.data.user,
      session: { access_token: data.data.accessToken },
      message: 'Đăng nhập thành công',
    };
  } catch (error) {
    const msg = error.response?.data?.error || error.message;
    if (msg.includes('Invalid') || msg.includes('password') || msg.includes('email')) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }
    if (msg.includes('deactivated')) {
      throw new Error('Tài khoản đã bị vô hiệu hóa');
    }
    throw new Error(msg);
  }
}
