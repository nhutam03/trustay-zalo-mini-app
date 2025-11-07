import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button, Icon } from "zmp-ui";
import { useAuth } from "./providers/auth-provider";

interface ProtectedRouteProps {
  children: React.ReactNode;
  showLoginPrompt?: boolean;
}

/**
 * Protected Route Component
 * Bảo vệ các route yêu cầu đăng nhập
 * Nếu user chưa đăng nhập -> hiển thị prompt để đăng nhập
 *
 * Note: Không redirect về /login vì user đã đăng nhập Zalo rồi
 * Chỉ cần gọi login() để auto-login
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  showLoginPrompt = true,
}) => {
  const { isLoggedIn, loading, login } = useAuth();
  const navigate = useNavigate();

  // AuthProvider đang loading (checking auth status)
  // Không cần show gì vì AuthProvider đã có splash screen
  if (loading) {
    return null;
  }

  // User chưa đăng nhập -> Show prompt
  if (!isLoggedIn) {
    if (showLoginPrompt) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
          <div className="text-center max-w-sm">
            {/* Icon */}
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon icon="zi-lock" size={40} className="text-orange-600" />
            </div>

            {/* Message */}
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Cần đăng nhập
            </h2>
            <p className="text-gray-600 mb-8">
              Vui lòng đăng nhập để sử dụng tính năng này
            </p>

            {/* Login Button */}
            <Button
              fullWidth
              size="large"
              onClick={async () => {
                // Thử auto-login trước
                await login();
                // Nếu auto-login không thành công, chuyển đến trang login
                if (!isLoggedIn) {
                  navigate("/login");
                }
              }}
              className="bg-primary text-white font-medium rounded-xl py-4 shadow-lg mb-3"
            >
              <div className="flex items-center justify-center gap-3">
                <Icon icon="zi-user" size={24} />
                <span>Đăng nhập ngay</span>
              </div>
            </Button>

            {/* Back Button */}
            <Button
              fullWidth
              variant="tertiary"
              onClick={() => window.history.back()}
              className="text-gray-600"
            >
              Quay lại
            </Button>
          </div>
        </div>
      );
    }

    // No prompt, just redirect to home
    return <Navigate to="/" replace />;
  }

  // User đã đăng nhập -> render children
  return <>{children}</>;
};

export default ProtectedRoute;
