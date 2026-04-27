import { useState } from 'react';
import { FiEdit, FiUserX } from 'react-icons/fi';
import { FaCheck, FaTimes } from 'react-icons/fa';
import ConfirmDeleteModal from './ConfirmDeleteModal';

const UserRow = ({ user, handleDeleteUser, handleSaveUserUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user.full_name || '');
  const [editedRole, setEditedRole] = useState(user.role);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const onSave = () => {
    handleSaveUserUpdate(user.id, {
      full_name: editedName,
      role: editedRole,
    });
    setIsEditing(false);
  };

  return (
    <div className='grid grid-cols-[2fr_2.5fr_1.5fr_1.2fr_1fr] gap-4 items-center py-4 px-6 border-b border-gray-200'>
      {/* Người dùng */}
      <div className='flex items-center'>
        <div className='h-10 w-10 rounded-full bg-gradient-to-br from-red-100 to-red-200 text-red-600 flex items-center justify-center'>
          <span className='text-lg font-medium'>
            {(editedName || user.email)[0]?.toUpperCase()}
          </span>
        </div>
        <div className='ml-4'>
          {isEditing ? (
            <input
              type='text'
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className='text-sm border border-gray-300 rounded-xl px-3 py-1 focus:ring-2 focus:ring-red-500 focus:outline-none w-full bg-white shadow-sm'
            />
          ) : (
            <div className='text-sm font-medium text-gray-900'>
              {user.full_name || 'Chưa cập nhật'}
            </div>
          )}
          {user.phone && (
            <div className='text-xs text-gray-500'>{user.phone}</div>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <div className='text-sm text-gray-900'>{user.email}</div>
      </div>

      {/* Vai trò */}
      <div className='flex justify-start items-center'>
        <select
          disabled={!isEditing}
          className={`px-3 py-1.5 text-xs font-medium rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all duration-200
            ${
              editedRole === 'admin'
                ? 'bg-purple-100 text-purple-800 focus:ring-purple-300'
                : 'bg-green-100 text-green-800 focus:ring-green-300'
            } ${!isEditing && 'opacity-60 cursor-not-allowed'}`}
          value={editedRole}
          onChange={(e) => setEditedRole(e.target.value)}
        >
          <option value='user'>Người dùng</option>
          <option value='admin'>Quản trị viên</option>
        </select>
      </div>

      {/* Ngày tạo */}
      <div className='text-sm text-gray-500'>
        {new Date(user.created_at).toLocaleDateString('vi-VN')}
      </div>

      {/* Thao tác */}
      <div className='flex gap-3'>
        {isEditing ? (
          <>
            <button
              className='text-green-600 hover:text-green-800 flex items-center text-sm transition-colors duration-200'
              onClick={onSave}
            >
              <FaCheck className='w-6 h-6 mr-1' />
            </button>
            <button
              className='text-gray-500 hover:text-gray-800 flex items-center text-sm transition-colors duration-200'
              onClick={() => {
                setIsEditing(false);
                setEditedName(user.full_name || '');
                setEditedRole(user.role);
              }}
            >
              <FaTimes className='w-6 h-6 mr-1' />
            </button>
          </>
        ) : (
          <>
            <button
              className='text-blue-600 hover:text-blue-900 flex items-center text-sm transition-colors duration-200'
              onClick={() => setIsEditing(true)}
            >
              <FiEdit className='w-6 h-6 mr-1' />
            </button>
            <button
              className='text-red-600 hover:text-red-900 flex items-center text-sm transition-colors duration-200'
              onClick={() => setShowDeleteConfirm(true)}
            >
              <FiUserX className='w-6 h-6 mr-1' />
            </button>
          </>
        )}
      </div>
      {showDeleteConfirm && (
        <ConfirmDeleteModal
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={() => {
            handleDeleteUser(user.id);
            setShowDeleteConfirm(false);
          }}
        />
      )}
    </div>
  );
};

export default UserRow;
