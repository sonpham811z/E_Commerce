export const getRoleDisplayName = (role) => {
  switch (role) {
    case 'admin':
      return 'Quản trị viên';
    case 'user':
      return 'Người dùng';
    default:
      return role;
  }
};
