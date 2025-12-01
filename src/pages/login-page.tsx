import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Box, Button, Icon, Input } from "zmp-ui";
import { login } from "@/services/auth-service";
import useSetHeader from "@/hooks/useSetHeader";
import { useAuth } from "@/components/providers/auth-provider";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setHeader = useSetHeader();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual login form
  const [identifier, setIdentifier] = useState(""); // email hoặc phone
  const [password, setPassword] = useState("");

  React.useEffect(() => {
    setHeader({
      title: "Đăng nhập",
      hasLeftIcon: false,
      type: "primary",
    });
  }, []);

  const handleManualLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate
      if (!identifier || !password) {
        setError("Vui lòng nhập đầy đủ thông tin");
        return;
      }

      // Login với email/phone + password
      const loginResponse = await login(identifier, password);

      console.log("Manual login successful:", loginResponse);

      // Refresh user info
      await refreshUser();

      // Navigate to home
      navigate("/", { replace: true });
    } catch (err: any) {
      console.error("Manual login error:", err);
      setError(err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page className="bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
      <Box className="flex flex-col items-center justify-center min-h-screen p-6">
        {/* Logo and App Name */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Icon icon="zi-home" size={48} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trustay</h1>
          <p className="text-gray-600 text-sm">
            Tìm phòng trọ uy tín, dễ dàng
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="w-full max-w-sm mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-2">
              <Icon icon="zi-warning" size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 flex-1">{error}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <div className="w-full max-w-sm space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-900 mb-4">
              Đăng nhập bằng tài khoản
            </h3>

            {/* Email/Phone Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email hoặc Số điện thoại
              </label>
              <Input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Nhập email hoặc số điện thoại"
                disabled={loading}
                className="w-full"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                disabled={loading}
                className="w-full"
              />
            </div>

            {/* Login Button */}
            <Button
              fullWidth
              size="large"
              onClick={handleManualLogin}
              loading={loading}
              disabled={loading || !identifier || !password}
              className="bg-primary text-white font-medium rounded-xl mt-4"
            >
              Đăng nhập
            </Button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="text-sm text-gray-500">hoặc</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-primary font-medium hover:underline"
              >
                Đăng ký ngay
              </button>
            </p>
          </div>

          {/* Skip Login */}
          <Button
            fullWidth
            variant="tertiary"
            onClick={() => navigate("/")}
            disabled={loading}
            className="text-gray-600"
          >
            Bỏ qua, xem phòng trước
          </Button>
        </div>

        {/* Terms and Privacy */}
        <p className="text-xs text-gray-500 text-center mt-8 max-w-sm">
          Bằng việc đăng nhập, bạn đồng ý với{" "}
          <span className="text-primary font-medium">Điều khoản sử dụng</span> và{" "}
          <span className="text-primary font-medium">Chính sách bảo mật</span> của
          Trustay
        </p>
      </Box>
    </Page>
  );
};

export default LoginPage;
