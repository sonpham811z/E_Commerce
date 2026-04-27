import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Spinner from '@/components/ui/Spinner';
import {
  getAllUsers,
  updateUser,
  deleteUserById,
} from '@/components/features/auth/apiUsers';
import {
  FiUserCheck,
  FiUsers,
  FiUser,
  FiUserX,
  FiSearch,
  FiAlertCircle,
} from 'react-icons/fi';
import UserStatCard from '../../features/admin/user/UserStatCard';
import AnimatedDiv from '../../ui/AnimatedDiv';
import UserRow from '../../features/admin/user/UserRow';

const UserManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  const [errorMessage, setErrorMessage] = useState(null);

  const {
    data: users,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const data = await getAllUsers();
        if (!data.length) {
          setErrorMessage('Không có người dùng nào');
          return [];
        }
        setErrorMessage(null);
        return data;
      } catch (err) {
        setErrorMessage('Không thể tải dữ liệu người dùng');
        return [];
      }
    },
  });

  const handleSaveUserUpdate = async (id, updates) => {
    try {
      await updateUser(id, updates);
      toast.success('Cập nhật thông tin người dùng thành công');
      await refetch();
    } catch (err) {
      toast.error('Không thể cập nhật thông tin người dùng');
    }
  };

  const handleDeleteUser = async (id) => {
    const confirm = window.confirm('Bạn chắc chắn muốn xoá người dùng này?');
    if (!confirm) return;
    try {
      await deleteUserById(id);
      toast.success('Đã xoá người dùng');
      await refetch();
    } catch (err) {
      toast.error('Không thể xoá người dùng');
    }
  };

  const filteredUsers = (users || []).filter((user) => {
    const name = user.full_name || '';
    const email = user.email || '';
    const searchLower = searchTerm.toLowerCase();

    const searchMatch =
      name.toLowerCase().includes(searchLower) ||
      email.toLowerCase().includes(searchLower);

    const roleMatch = roleFilter === 'all' || user.role === roleFilter;

    return searchMatch && roleMatch;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortOption === 'newest')
      return new Date(b.created_at) - new Date(a.created_at);
    if (sortOption === 'oldest')
      return new Date(a.created_at) - new Date(b.created_at);
    if (sortOption === 'a-z')
      return (a.full_name || a.email).localeCompare(b.full_name || b.email);
    if (sortOption === 'z-a')
      return (b.full_name || b.email).localeCompare(a.full_name || a.email);
    return 0;
  });

  const totalUsers = filteredUsers.length;
  const adminCount = filteredUsers.filter((u) => u.role === 'admin').length;
  const userCount = filteredUsers.filter((u) => u.role === 'user').length;
  const recentUsers = filteredUsers.filter((u) => {
    const d = new Date(u.created_at);
    const recent = new Date();
    recent.setDate(recent.getDate() - 30);
    return d > recent;
  }).length;

  if (isLoading) return <Spinner />;

  return (
    <AnimatedDiv className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>
            Quản lý người dùng
          </h1>
          <p className='text-gray-600 mt-1'>
            Quản lý tất cả người dùng trong hệ thống
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className='bg-yellow-50 border-l-4 border-yellow-400 p-4'>
          <div className='flex'>
            <FiAlertCircle className='h-6 w-6 text-yellow-400 mr-3' />
            <p className='text-sm text-yellow-700'>{errorMessage}</p>
          </div>
        </div>
      )}

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        <UserStatCard
          title='Tổng người dùng'
          value={totalUsers}
          icon={<FiUsers className='w-5 h-5 text-blue-600' />}
          color='bg-blue-50'
        />
        <UserStatCard
          title='Quản trị viên'
          value={adminCount}
          icon={<FiUserCheck className='w-5 h-5 text-purple-600' />}
          color='bg-purple-50'
        />
        <UserStatCard
          title='Người dùng thường'
          value={userCount}
          icon={<FiUser className='w-5 h-5 text-green-600' />}
          color='bg-green-50'
        />
        <UserStatCard
          title='Người dùng mới'
          value={recentUsers}
          icon={<FiUserX className='w-5 h-5 text-red-600' />}
          color='bg-red-50'
        />
      </div>

      <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-200'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
          <div className='relative w-full sm:w-64'>
            <input
              type='text'
              placeholder='Tìm kiếm người dùng...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-full'
            />
            <FiSearch className='absolute left-3 top-2.5 h-5 w-5 text-gray-400' />
          </div>
          <div className='flex items-center gap-2 w-full sm:w-auto'>
            <select
              className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm'
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value='all'>Tất cả vai trò</option>
              <option value='admin'>Quản trị viên</option>
              <option value='user'>Người dùng thường</option>
            </select>
            <select
              className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm'
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value='newest'>Mới nhất</option>
              <option value='oldest'>Cũ nhất</option>
              <option value='a-z'>A-Z</option>
              <option value='z-a'>Z-A</option>
            </select>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <div className='min-w-full'>
            <div className='grid grid-cols-[2fr_2.5fr_1.5fr_1.2fr_1fr] gap-4 bg-gray-100 px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider'>
              <div>Người dùng</div>
              <div>Email</div>
              <div>Vai trò</div>
              <div>Ngày tạo</div>
              <div>Thao tác</div>
            </div>

            {sortedUsers.length === 0 ? (
              <div className='px-6 py-4 text-gray-500'>
                Không tìm thấy người dùng nào
              </div>
            ) : (
              sortedUsers.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  handleDeleteUser={handleDeleteUser}
                  handleSaveUserUpdate={handleSaveUserUpdate}
                />
              ))
            )}
          </div>
        </div>

        <div className='mt-5 flex items-center justify-between'>
          <div className='text-sm text-gray-500'>
            Hiển thị {sortedUsers.length} người dùng
          </div>
        </div>
      </div>
    </AnimatedDiv>
  );
};

export default UserManager;
