import { useMemo } from 'react';
import { useAuth } from '../features/auth/AuthContext';

export function useAdmin() {
  const { user, loading } = useAuth();
  const isAdmin = useMemo(() => user?.role === 'admin', [user]);
  return { isAdmin, loading };
}
