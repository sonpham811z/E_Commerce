import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/components/services/supabase";

const AuthContext = createContext();

// Separate hook into its own named function declaration
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Convert to named function declaration
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to clear all auth data
  const clearAuthData = async () => {
    try {
      // Force sign out from Supabase
      await supabase.auth.signOut({ scope: "global" });

      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();

      // Clear session cookies if any
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Reset state
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
  };

  // Expose signOut function that uses clearAuthData
  const signOut = async () => {
    try {
      console.log("Signing out...");
      await clearAuthData();
      console.log("Sign out successful");

      // Clear any additional application state
      localStorage.removeItem("user");
      localStorage.removeItem("cart");
      localStorage.removeItem("userInfo");

      // Get current URL
      const currentPath = window.location.pathname;

      // If we're on a protected route, redirect to home with login modal
      if (currentPath.startsWith("/user") || currentPath.startsWith("/admin")) {
        window.location.replace("/home?modal=login");
      } else {
        // Otherwise, just show the login modal
        window.location.href = window.location.pathname + "?modal=login";
      }
    } catch (error) {
      console.error("Sign out error:", error);
      // Force reload even on error to ensure clean state
      window.location.replace("/home?modal=login");
    }
  };

  // Check if we're on a password reset related path
  const isPasswordResetPath = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash;
    return (
      path.includes("reset-password") ||
      path.includes("recovery") ||
      hash.includes("type=recovery") ||
      hash.includes("access_token")
    );
  };

  useEffect(() => {
    const setupAuth = async () => {
      try {
        // Always check if we're on password reset flow first
        if (isPasswordResetPath()) {
          console.log("Password reset path detected, clearing auth data");
          await clearAuthData();
          setLoading(false);
          return;
        }

        // Get initial session
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        // Double check we're not on reset path with a session
        if (initialSession && isPasswordResetPath()) {
          console.log(
            "Session found on password reset path, clearing auth data"
          );
          await clearAuthData();
        } else {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
        }

        setLoading(false);

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          console.log("Auth state change:", event);

          // Handle password reset related events
          if (
            event === "PASSWORD_RECOVERY" ||
            event === "TOKEN_REFRESHED" ||
            isPasswordResetPath()
          ) {
            console.log(
              "Password recovery or token refresh detected, clearing auth data"
            );
            await clearAuthData();
            return;
          }

          // Handle normal auth state changes
          setSession(newSession);
          setUser(newSession?.user ?? null);
        });

        return () => {
          subscription?.unsubscribe();
        };
      } catch (error) {
        console.error("Auth setup error:", error);
        setLoading(false);
      }
    };

    setupAuth();
  }, []);

  const value = {
    user,
    session,
    loading,
    signOut,
    clearAuthData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Export both as named exports
export { AuthProvider, useAuth };
