import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Box } from "zmp-ui";
import { useAuth } from "@/components/providers/auth-provider";
import BottomNav from "./navigate-bottom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute - Bảo vệ các trang yêu cầu đăng nhập
 *
 * Nếu chưa đăng nhập, hiển thị màn hình yêu cầu đăng nhập
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  // Nếu chưa đăng nhập, hiển thị màn hình yêu cầu đăng nhập
  if (!isLoggedIn) {
    return (
      <Page className="bg-gray-50">
        <div className="flex flex-col items-center justify-center min-h-screen px-6">
          <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center mb-6">
            <svg
              className="w-16 h-16 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Yêu cầu đăng nhập
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Vui lòng đăng nhập để sử dụng tính năng này
          </p>

          <button
            onClick={() => navigate("/login")}
            className="w-full max-w-sm py-3 bg-primary text-white font-medium rounded-lg active:opacity-70 transition-opacity mb-3"
          >
            Đăng nhập
          </button>

          <button
            onClick={() => navigate("/register")}
            className="w-full max-w-sm py-3 border border-primary text-primary font-medium rounded-lg active:opacity-70 transition-opacity"
          >
            Đăng ký ngay
          </button>
        </div>
        <BottomNav />
      </Page>

      
    );
  }

  // Đã đăng nhập, hiển thị nội dung
  return <>{children}</>;
};

export default ProtectedRoute;
