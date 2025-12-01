import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Box, Button, Icon } from "zmp-ui";
import { getZaloAccessToken, linkZaloAccount } from "@/services/auth-service";
import useSetHeader from "@/hooks/useSetHeader";
import { useAuth } from "@/components/providers/auth-provider";

const LinkAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const setHeader = useSetHeader();
  const { login: authLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    setHeader({
      title: "Liên kết tài khoản",
      hasLeftIcon: true,
      type: "primary",
    });
  }, []);

  const handleLinkZaloAccount = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Lấy Zalo Access Token
      const zaloAccessToken = await getZaloAccessToken();

      // Liên kết tài khoản với Zalo
      await linkZaloAccount(zaloAccessToken);

      console.log("Account linked successfully");

      // Update auth state and refresh user info
      await authLogin();

      // Show success message
      setSuccess(true);

      // Navigate back after 2 seconds
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (err: any) {
      console.error("Link account error:", err);
      setError(err.message || "Liên kết tài khoản thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page className="bg-gray-50">
      <Box className="p-4">
        {/* Info Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
          <div className="text-center mb-4">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="zi-user-plus" size={40} className="text-blue-600" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">
              Liên kết tài khoản Zalo
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Liên kết số điện thoại Zalo của bạn với tài khoản Trustay hiện tại
              để có thể sử dụng các tính năng liên quan đến Zalo.
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-blue-900 mb-2">Lợi ích:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-blue-800">
                <Icon icon="zi-check-circle" size={16} className="flex-shrink-0 mt-0.5" />
                <span>Đồng bộ số điện thoại Zalo</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-blue-800">
                <Icon icon="zi-check-circle" size={16} className="flex-shrink-0 mt-0.5" />
                <span>Nhận thông báo qua Zalo</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-blue-800">
                <Icon icon="zi-check-circle" size={16} className="flex-shrink-0 mt-0.5" />
                <span>Truy cập nhanh các tính năng đặc biệt</span>
              </li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Icon icon="zi-warning" size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 flex-1">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Icon icon="zi-check-circle" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800 flex-1">
                  Liên kết tài khoản thành công! Đang chuyển hướng...
                </p>
              </div>
            </div>
          )}

          {/* Link Button */}
          <Button
            fullWidth
            size="large"
            onClick={handleLinkZaloAccount}
            loading={loading}
            disabled={loading || success}
            className="bg-primary text-white font-medium rounded-lg"
          >
            {success ? "Đã liên kết" : "Liên kết ngay"}
          </Button>
        </div>

        {/* Note */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Icon icon="zi-info-circle" size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900 mb-1">Lưu ý:</p>
              <p className="text-xs text-yellow-800 leading-relaxed">
                Bạn cần cấp quyền truy cập thông tin Zalo khi được yêu cầu.
                Thông tin của bạn sẽ được bảo mật và chỉ được sử dụng cho mục đích liên kết tài khoản.
              </p>
            </div>
          </div>
        </div>
      </Box>
    </Page>
  );
};

export default LinkAccountPage;
