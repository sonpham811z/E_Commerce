import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import {
  HiMiniSquares2X2,
  HiOutlineCube,
  HiOutlineClipboardDocumentList,
  HiOutlineUsers,
} from 'react-icons/hi2';

const NavList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StyledNavLink = styled(NavLink)`
  &:link,
  &:visited {
    display: flex;
    align-items: center;
    gap: 10px;

    color: var(--color-grey-600);
    font-size: 14px;
    font-weight: 500;
    padding: 10px 20px;
    transition: all 0.3s;
  }

  &:hover,
  &:active,
  &.active:link,
  &.active:visited {
    color: var(--color-grey-800);
    background-color: var(--color-grey-50);
    border-radius: var(--border-radius-sm);
  }

  & svg {
    width: 2rem;
    height: 2rem;
    color: var(--color-grey-400);
    transition: all 0.3s;
  }

  &:hover svg,
  &:active svg,
  &.active:link svg,
  &.active:visited svg {
    color: var(--color-brand-600);
  }
`;

function AdminNav() {
  return (
    <nav>
      <NavList>
        <li>
          <StyledNavLink to='/admin' end>
            <HiMiniSquares2X2 />
            <span>Dashboard</span>
          </StyledNavLink>
        </li>
        <li>
          <StyledNavLink to='/admin/products'>
            <HiOutlineCube />
            <span>Sản phẩm</span>
          </StyledNavLink>
        </li>
        <li>
          <StyledNavLink to='/admin/order'>
            <HiOutlineClipboardDocumentList />
            <span>Đơn hàng</span>
          </StyledNavLink>
        </li>
        <li>
          <StyledNavLink to='/admin/user'>
            <HiOutlineUsers />
            <span>Người dùng</span>
          </StyledNavLink>
        </li>
      </NavList>
    </nav>
  );
}

export default AdminNav;
