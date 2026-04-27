import { authApi } from '@/components/services/api';

export async function getAllUsers({ page = 1, limit = 50, role } = {}) {
  const params = { page, limit };
  if (role && role !== 'all') params.role = role;
  const { data } = await authApi.get('/auth/admin/users', { params });
  return data.data?.data || [];
}

export async function getUserById(userId) {
  const { data } = await authApi.get(`/auth/admin/users`, { params: { limit: 200 } });
  const users = data.data?.data || [];
  const user  = users.find(u => u.id === userId);
  if (!user) throw new Error('Không tìm thấy người dùng');
  return user;
}

export async function updateUser(id, updates) {
  await authApi.patch(`/auth/admin/users/${id}`, updates);
  return true;
}

export async function deleteUserById(userId) {
  await authApi.delete(`/auth/admin/users/${userId}`);
  return true;
}

export async function countUsersByRole() {
  const users = await getAllUsers({ limit: 500 });
  return {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    user:  users.filter(u => u.role === 'user').length,
    recent: users.filter(u => {
      const d = new Date(u.created_at);
      const ago = new Date();
      ago.setDate(ago.getDate() - 30);
      return d > ago;
    }).length,
  };
}
