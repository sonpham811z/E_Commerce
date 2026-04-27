import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "@/components/services/api";

const AuthContext = createContext();

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const isPasswordResetPath = () => {
    const path = window.location.pathname.toLowerCase();
    return path.includes("reset-password") || path.includes("recovery");
  };

  const clearAuthData = async () => {
    try {
      // Call auth-service logout to invalidate refresh token on server
      const token = localStorage.getItem("accessToken");
      if (token) {
        await authApi.post("/auth/logout").catch(() => {});
      }
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("cart");
      localStorage.removeItem("userInfo");
      sessionStorage.clear();
      setSession(null);
      setUser(null);
    }
  };

  const signOut = async () => {
    try {
      await clearAuthData();
      const currentPath = window.location.pathname;
      if (currentPath.startsWith("/user") || currentPath.startsWith("/admin")) {
        window.location.replace("/home?modal=login");
      } else {
        window.location.href = window.location.pathname + "?modal=login";
      }
    } catch (error) {
      console.error("Sign out error:", error);
      window.location.replace("/home?modal=login");
    }
  };

  // Load user from accessToken stored in localStorage
  useEffect(() => {
    const setupAuth = async () => {
      try {
        if (isPasswordResetPath()) {
          await clearAuthData();
          setLoading(false);
          return;
        }

        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          setLoading(false);
          return;
        }

        // Verify token and load profile from auth-service
        const { data } = await authApi.get("/auth/profile");
        const profile = data.data;

        setUser(profile);
        // Build a session shape compatible with existing code that reads session.access_token
        setSession({ access_token: accessToken, user: profile });
      } catch {
        // Token invalid or expired — clear everything
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      } finally {
        setLoading(false);
      }
    };

    setupAuth();

    // Listen for forced logout events (triggered by axios interceptor on refresh failure)
    const handleLogout = () => {
      setUser(null);
      setSession(null);
    };
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  const setAuthData = (userData, accessToken) => {
    setUser(userData);
    setSession({ access_token: accessToken, user: userData });
  };

  const updateAuthUser = (updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : prev);
    setSession(prev => prev ? { ...prev, user: { ...prev.user, ...updates } } : prev);
  };

  const value = { user, session, loading, signOut, clearAuthData, setAuthData, updateAuthUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthProvider, useAuth };
