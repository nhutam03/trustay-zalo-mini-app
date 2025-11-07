import React, { createContext, useContext, useEffect, useState } from "react";
import { Spinner } from "zmp-ui";
import {
  isAuthenticated,
  getCurrentUser,
  logout as logoutService,
  loginWithZaloPhone,
  getZaloUserInfo,
  type UserProfile,
} from "@/services/auth-service";

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
 * AuthProvider - Tự động đăng nhập khi app khởi động
 *
 * Flow:
 * 1. App khởi động → Check có token trong storage không
 * 2. Nếu có token → Verify với backend
 * 3. Nếu không có token hoặc token hết hạn → Auto login với Zalo
 * 4. Lấy Zalo access token (không cần user tương tác)
 * 5. Gửi lên backend để đăng nhập
 * 6. Lưu JWT token và hiển thị app
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    initAuth();
  }, []);

  /**
   * Khởi tạo authentication khi app start
   */
  const initAuth = async () => {
    try {
      setLoading(true);

      // Check if already has valid token
      if (isAuthenticated()) {
        try {
          // Try to get current user to verify token is valid
          const userInfo = await getCurrentUser();
          setUser(userInfo);
          setIsLoggedIn(true);
          setLoading(false);
          return;
        } catch (error) {
          console.log("Token expired or invalid, performing auto-login...");
          // Token invalid, continue to auto-login
        }
      }

      // No valid token → Perform silent login with Zalo
      await performAutoLogin();
    } catch (error) {
      console.error("Auth initialization failed:", error);
      // Even if login fails, we still show the app
      // Some features will require login and show login prompt
      setLoading(false);
    }
  };

  /**
   * Tự động đăng nhập bằng Zalo (auto login)
   *
   * Flow:
   * 1. Lấy số điện thoại từ Zalo (nếu được phê duyệt)
   * 2. Gọi API login → Backend kiểm tra user đã tồn tại chưa
   * 3. Nếu tồn tại → Đăng nhập thành công
   * 4. Nếu chưa tồn tại → Để user tiếp tục dùng app (chưa đăng nhập)
   */
  const performAutoLogin = async () => {
    try {
      console.log("Attempting auto-login with Zalo phone...");

      // Thử lấy số điện thoại từ Zalo (cần được phê duyệt bởi Zalo)
      const zaloInfo = await getZaloUserInfo(true);

      if (!zaloInfo.phone) {
        console.log("Phone number not available, user can browse without login");
        return;
      }

      // Thử đăng nhập bằng số điện thoại
      const loginResponse = await loginWithZaloPhone(zaloInfo.phone);

      setUser(loginResponse.user);
      setIsLoggedIn(true);

      console.log("Auto-login successful:", loginResponse.user);
    } catch (error: any) {
      console.error("Auto-login failed:", error);

      // Không cần chuyển hướng, để user tiếp tục dùng app
      // User có thể đăng ký sau bằng cách nhấn nút đăng ký ở trang Profile
      console.log("User not logged in, can browse app without authentication");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manual login (for retry or explicit login)
   */
  const login = async () => {
    try {
      setLoading(true);
      await performAutoLogin();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      setLoading(true);
      await logoutService();
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh user info
   */
  const refreshUser = async () => {
    try {
      const userInfo = await getCurrentUser();
      setUser(userInfo);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  // Show splash screen while initializing
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          {/* Logo */}
          <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>

          {/* App Name */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trustay</h1>
          <p className="text-gray-600 text-sm mb-8">
            Tìm phòng trọ uy tín, dễ dàng
          </p>

          {/* Loading Spinner */}
          <Spinner />
          <p className="mt-4 text-sm text-gray-600">Đang khởi động...</p>
        </div>
      </div>
    );
  }

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
