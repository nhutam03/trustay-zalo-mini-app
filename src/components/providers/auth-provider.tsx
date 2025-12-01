import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { Spinner } from "zmp-ui";
import { useQueryClient } from "@tanstack/react-query";
import {
  isAuthenticated,
  getCurrentUser,
  logout as logoutService,
  getZaloUserInfo,
  type UserProfile,
} from "@/services/auth-service";
import { authKeys } from "@/hooks/useAuthService";
import { onAuthExpired } from "@/lib/api-client";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isLoggedIn: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider - Quản lý authentication state
 *
 * Flow (Lazy Authentication):
 * 1. App khởi động → Check có token trong LOCAL STORAGE (KHÔNG gọi API)
 * 2. Nếu có token → Set isLoggedIn = true (app render ngay lập tức)
 * 3. Khi user gọi API đầu tiên → Auto verify token via refresh interceptor
 * 4. Nếu token expired → Auto refresh → Retry
 * 5. Nếu refresh token expired → User cần login lại
 *
 * Benefits:
 * - Zero API calls on app start → Instant load
 * - Auto verify token on first API call
 * - Better UX - không bị block bởi network
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false); // No loading on init
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // React Query client for cache management
  const queryClient = useQueryClient();

  // Prevent multiple concurrent calls
  const fetchingUserRef = useRef(false);
  const initRef = useRef(false);

  useEffect(() => {
    // Only run once on mount
    if (!initRef.current) {
      initRef.current = true;
      initAuth();
    }

    // Lắng nghe event token hết hạn từ API interceptor
    const unsubscribe = onAuthExpired(() => {
      console.log("Auth expired, logging out...");
      setUser(null);
      setIsLoggedIn(false);
      // DON'T clear all cache - it will kill ongoing queries!
      // queryClient.clear();
    });

    return unsubscribe;
  }, []);

  // Auto-fetch user data when logged in but no user data yet
  useEffect(() => {
    if (isLoggedIn && !user && !fetchingUserRef.current) {
      console.log("User logged in but no data, fetching...");
      fetchUser();
    }
  }, [isLoggedIn, user]);

  /**
   * Khởi tạo authentication khi app start
   * CHỈ CHECK LOCAL STORAGE - KHÔNG GỌI API
   */
  const initAuth = () => {
    console.log("Initializing auth (local check only)...");

    // Check if token exists in local storage (sync, no API call)
    if (isAuthenticated()) {
      console.log("Token found in storage, user is logged in");
      setIsLoggedIn(true);
      // Note: We don't fetch user data here
      // First API call will auto-verify token via interceptor
    } else {
      console.log("No token found, user is not logged in");
      setIsLoggedIn(false);
    }

    // App is ready immediately (no loading needed)
    console.log("Auth initialized, app ready");
  };

  /**
   * Fetch user data from backend
   */
  const fetchUser = async () => {
    if (fetchingUserRef.current) {
      console.log("Already fetching user, skipping...");
      return;
    }

    try {
      fetchingUserRef.current = true;
      setLoading(true);

      const userData = await getCurrentUser();
      console.log("User data fetched:", userData);
      
      setUser(userData);
      // Cache user data in React Query
      queryClient.setQueryData(authKeys.me(), userData);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      // If fetch fails, clear auth state
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
      fetchingUserRef.current = false;
    }
  };

  /**
   * Manual login placeholder
   * Actual login happens in LoginPage using auth-service directly
   * This just updates local state after successful login
   */
  const login = async () => {
    console.log("Login called, updating auth state...");
    // After login via auth-service, update state
    if (isAuthenticated()) {
      setIsLoggedIn(true);
      // Fetch user data immediately
      await fetchUser();
    }
  };

  /**
   * Logout - Clear tokens and state
   */
  const logout = async () => {
    try {
      await logoutService(); // Calls API + clears tokens
      setUser(null);
      setIsLoggedIn(false);

      // Clear ALL React Query cache
      queryClient.clear();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  /**
   * Refresh user info
   * In lazy auth, this just invalidates cache
   * Components will refetch data automatically
   */
  const refreshUser = async () => {
    console.log("Refreshing user data...");
    // Invalidate all user-related cache
    // Components using queries will refetch automatically
    queryClient.invalidateQueries({ queryKey: authKeys.all });
    queryClient.invalidateQueries({ queryKey: ['users'] });
  };

  // No loading screen needed - app renders immediately

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoggedIn,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
