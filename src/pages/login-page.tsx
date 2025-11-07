import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Box, Button, Icon, Input } from "zmp-ui";
import { getZaloUserInfo, loginWithZaloPhone, login } from "@/services/auth-service";
import useSetHeader from "@/hooks/useSetHeader";
import { useAuth } from "@/components/providers/auth-provider";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setHeader = useSetHeader();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login mode: 'zalo' hoặc 'manual'
  const [loginMode, setLoginMode] = useState<"zalo" | "manual">("zalo");

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

  const handleZaloLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get Zalo phone number (cần được phê duyệt bởi Zalo)
      const zaloInfo = await getZaloUserInfo(true);

      if (!zaloInfo.phone) {
        setError("Quyền truy cập số điện thoại chưa được phê duyệt. Bạn có thể đăng ký bằng cách nhập số điện thoại thủ công.");
        setTimeout(() => navigate("/register"), 2000);
        return;
      }

      // Try to login with phone
      const loginResponse = await loginWithZaloPhone(zaloInfo.phone);

      console.log("Login successful:", loginResponse);

      // Refresh user info
      await refreshUser();

      // Navigate to home after successful login
      navigate("/", { replace: true });
    } catch (err: any) {
      console.error("Login error:", err);

      // If user not found, navigate to register
      if (err?.response?.status === 404 || err?.message?.includes("not found")) {
        setError("Tài khoản chưa tồn tại. Chuyển đến trang đăng ký...");
        setTimeout(() => navigate("/register"), 1500);
        return;
      }

      setError(err.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

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

        {/* Login Mode Toggle */}
        <div className="w-full max-w-sm mb-6">
          <div className="flex bg-white rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setLoginMode("zalo")}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                loginMode === "zalo"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-600"
              }`}
            >
              Đăng nhập Zalo
            </button>
            <button
              onClick={() => setLoginMode("manual")}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                loginMode === "manual"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-600"
              }`}
            >
              Đăng nhập thủ công
            </button>
          </div>
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
          {loginMode === "zalo" ? (
            // Zalo Login Mode
            <>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Icon icon="zi-user" size={32} className="text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Đăng nhập nhanh với Zalo
                  </h3>
                  <p className="text-xs text-gray-600">
                    Sử dụng tài khoản Zalo để đăng nhập tự động
                  </p>
                </div>

                <Button
                  fullWidth
                  size="large"
                  onClick={handleZaloLogin}
                  loading={loading}
                  disabled={loading}
                  className="bg-primary text-white font-medium rounded-xl"
                >
                  Đăng nhập với Zalo
                </Button>
              </div>
            </>
          ) : (
            // Manual Login Mode
            <>
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
            </>
          )}

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
