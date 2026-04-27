// Supabase is no longer used for auth or core data.
// This file is kept as a null-safe stub so any files not yet migrated won't crash.
// Migrate remaining files to use coreApi / authApi from api.js

const noop = () => Promise.resolve({ data: null, error: null });
const noopChain = () => ({
  select: noopChain, insert: noopChain, update: noopChain, delete: noopChain,
  upsert: noopChain, eq: noopChain, neq: noopChain, ilike: noopChain,
  is: noopChain, gte: noopChain, lte: noopChain, in: noopChain,
  or: noopChain, order: noopChain, limit: noopChain, range: noopChain,
  single: noop, then: (resolve) => resolve({ data: null, error: null }),
});

export const supabase = {
  from: () => noopChain(),
  auth: {
    signInWithPassword: noop,
    signUp: noop,
    signOut: noop,
    getSession: () => Promise.resolve({ data: { session: null } }),
    getUser: () => Promise.resolve({ data: { user: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    resetPasswordForEmail: noop,
    updateUser: noop,
  },
  storage: { from: () => ({ upload: noop, getPublicUrl: () => ({ data: { publicUrl: '' } }) }) },
};
