import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Box, Button, Icon, Input } from "zmp-ui";
import useSetHeader from "@/hooks/useSetHeader";
import { changeStatusBarColor } from "@/utils/basic";
import {
  getZaloUserInfo,
  sendPhoneVerification,
  verifyPhoneCode,
  registerWithVerification,
  type RegisterRequest
} from "@/services/auth-service";
import { useAuth } from "@/components/providers/auth-provider";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const setHeader = useSetHeader();
  const { refreshUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "verifying">("form");

  // Form data
  const [formData, setFormData] = useState<RegisterRequest>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    gender: "other",
    role: "tenant",
  });

  useEffect(() => {
    setHeader({
      title: "Đăng ký tài khoản",
      hasLeftIcon: true,
      type: "primary",
    });
    changeStatusBarColor("primary");

    // Tự động lấy thông tin từ Zalo
    loadZaloInfo();
  }, []);

  const loadZaloInfo = async () => {
    try {
      // Thử lấy thông tin Zalo (bao gồm cả phone nếu được phê duyệt)
      const zaloInfo = await getZaloUserInfo(true);

      // Tự động điền thông tin từ Zalo
      if (zaloInfo.name) {
        const nameParts = zaloInfo.name.split(" ");
        setFormData(prev => ({
          ...prev,
          firstName: nameParts.slice(0, -1).join(" ") || zaloInfo.name,
          lastName: nameParts[nameParts.length - 1] || "",
          phone: zaloInfo.phone || "",
        }));
      }
    } catch (error) {
      console.error("Error loading Zalo info:", error);
      // Không hiển thị lỗi, để user tự nhập thông tin
    }
  };

  const handleInputChange = (field: keyof RegisterRequest) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError(null);
      setStep("verifying");

      // Validate form
      if (!formData.phone || !formData.firstName || !formData.lastName) {
        throw new Error("Vui lòng điền đầy đủ thông tin");
      }

      // Bước 1: Gửi OTP verification
      console.log("Step 1: Sending phone verification for:", formData.phone);
      const verificationResponse = await sendPhoneVerification(formData.phone);

      if (!verificationResponse.verificationToken) {
        throw new Error("Không nhận được verification token");
      }

      // Bước 2: Verify OTP (mặc định 123456 - tự động)
      console.log("Step 2: Verifying OTP with default code: 123456");
      await verifyPhoneCode(formData.phone, "123456");

      // Bước 3: Đăng ký với verification token
      console.log("Step 3: Registering user with verification token");

      // Tạo email tạm nếu không có
      const email = formData.email || `${formData.phone}@trustay.app`;
      // Tạo password tạm từ phone number
      const password = formData.phone;

      const authResponse = await registerWithVerification(
        {
          ...formData,
          email,
          password,
        },
        verificationResponse.verificationToken
      );

      console.log("Registration successful:", authResponse);

      // Refresh user info in AuthProvider
      await refreshUser();

      // Navigate to home
      navigate("/", { replace: true });
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
      setStep("form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page className="bg-gray-50">
      <Box className="p-4 space-y-4">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex gap-3">
            <Icon icon="zi-info-circle" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-900 font-medium mb-1">
                Đăng ký nhanh với Zalo
              </p>
              <p className="text-xs text-blue-700">
                Thông tin sẽ tự động điền từ tài khoản Zalo của bạn.
                Bạn có thể chỉnh sửa trước khi đăng ký.
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Icon icon="zi-warning" size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 flex-1">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <Box className="bg-white rounded-xl p-4 space-y-4">
          <h2 className="font-semibold text-lg text-gray-900">Thông tin cá nhân</h2>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone")(e.target.value)}
              placeholder="Nhập số điện thoại"
              disabled={loading}
              className="w-full"
            />
          </div>

          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Họ và tên đệm <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName")(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn"
              disabled={loading}
              className="w-full"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName")(e.target.value)}
              placeholder="Ví dụ: An"
              disabled={loading}
              className="w-full"
            />
          </div>

          {/* Email (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email (không bắt buộc)
            </label>
            <Input
              type="text"
              value={formData.email}
              onChange={(e) => handleInputChange("email")(e.target.value)}
              placeholder="email@example.com"
              disabled={loading}
              className="w-full"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giới tính
            </label>
            <div className="flex gap-3">
              {[
                { value: "male", label: "Nam" },
                { value: "female", label: "Nữ" },
                { value: "other", label: "Khác" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormData(prev => ({ ...prev, gender: option.value as any }))}
                  disabled={loading}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-colors ${
                    formData.gender === option.value
                      ? "border-primary bg-blue-50 text-primary"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bạn là
            </label>
            <div className="flex gap-3">
              {[
                { value: "tenant", label: "Người thuê trọ", icon: "zi-user" },
                { value: "landlord", label: "Chủ nhà", icon: "zi-home" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormData(prev => ({ ...prev, role: option.value as any }))}
                  disabled={loading}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                    formData.role === option.value
                      ? "border-primary bg-blue-50 text-primary"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Icon icon={option.icon as any} size={24} />
                    <span className="text-sm">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Box>

        {/* Register Button */}
        <Button
          fullWidth
          size="large"
          onClick={handleRegister}
          loading={loading}
          disabled={loading || !formData.phone || !formData.firstName || !formData.lastName}
          className="bg-primary text-white font-medium rounded-xl py-4 shadow-lg"
        >
          {step === "verifying" ? "Đang xác thực..." : "Đăng ký"}
        </Button>

        {/* OTP Info */}
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-600 text-center">
            Hệ thống sẽ tự động xác thực số điện thoại của bạn.
            Không cần nhập mã OTP.
          </p>
        </div>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center">
          Bằng việc đăng ký, bạn đồng ý với{" "}
          <span className="text-primary font-medium">Điều khoản sử dụng</span> và{" "}
          <span className="text-primary font-medium">Chính sách bảo mật</span> của Trustay
        </p>
      </Box>
    </Page>
  );
};

export default RegisterPage;
