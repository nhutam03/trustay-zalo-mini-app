import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Box, Button, Icon, Input } from "zmp-ui";
import useSetHeader from "@/hooks/useSetHeader";
import { changeStatusBarColor } from "@/utils/basic";
import {
  sendVerificationCode,
  verifyCode,
} from "@/services/verification-service";
import {
  verifyPhoneCode,
  registerWithVerification,
  type RegisterRequest
} from "@/services/auth-service";
import { useAuth } from "@/components/providers/auth-provider";

type VerificationType = "email" | "phone";
type StepType = "input-contact" | "verify-code" | "input-info";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const setHeader = useSetHeader();
  const { login: authLogin } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<StepType>("input-contact");
  
  // Step 1: Contact info
  const [verificationType, setVerificationType] = useState<VerificationType>("phone");
  const [contact, setContact] = useState(""); // email hoặc phone
  const [verificationId, setVerificationId] = useState<string>("");
  
  // Step 2: Verification code
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  
  // Step 3: Personal info
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
  }, []);

  const handleInputChange = (field: keyof RegisterRequest) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Step 1: Send verification code
  const handleSendCode = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!contact) {
        throw new Error("Vui lòng nhập email hoặc số điện thoại");
      }

      if (verificationType === "phone") {
        // Số điện thoại: không cần gửi code, chỉ lưu thông tin
        console.log("Phone registration - no need to send code, default is 123456");
        setStep("verify-code");
      } else {
        // Email: gửi code thực
        console.log("Sending verification code to email:", contact);
        const response = await sendVerificationCode({
          type: "email",
          email: contact,
        });
        setVerificationId(response.verificationId);
        setStep("verify-code");
      }
    } catch (err: any) {
      console.error("Error sending code:", err);
      setError(err.message || "Không thể gửi mã xác thực");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify code
  const handleVerifyCode = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!verificationCode) {
        throw new Error("Vui lòng nhập mã xác thực");
      }

      if (verificationType === "phone") {
        // Verify phone với code (mặc định 123456)
        console.log("Verifying phone code:", verificationCode);
        const response = await verifyPhoneCode(contact, verificationCode);
        setVerificationToken(response.verificationToken);
      } else {
        // Verify email code
        console.log("Verifying email code:", verificationCode);
        const response = await verifyCode({
          type: "email",
          email: contact,
          code: verificationCode,
        });
        // Giả sử response có verificationToken
        // Nếu không có thì cần điều chỉnh service
        setVerificationToken((response as any).verificationToken || verificationCode);
      }

      setStep("input-info");
    } catch (err: any) {
      console.error("Error verifying code:", err);
      setError(err.message || "Mã xác thực không đúng");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Register with full info
  const handleRegister = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate form
      if (!formData.password || !formData.firstName || !formData.lastName) {
        throw new Error("Vui lòng điền đầy đủ thông tin");
      }

      // Tạo registerData dựa trên loại đăng ký
      const registerData: RegisterRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        gender: formData.gender,
        role: formData.role,
      };

      // Điền email hoặc phone tùy loại đăng ký
      if (verificationType === "email") {
        registerData.email = contact;
        // Không gửi phone field
      } else {
        registerData.phone = contact;
        // Tạo email tạm cho phone registration
        registerData.email = `${contact}@trustay.app`;
      }

      console.log("Registering user with data:", registerData);
      const authResponse = await registerWithVerification(
        registerData,
        verificationToken
      );

      console.log("Registration successful:", authResponse);

      // Update auth state
      await authLogin();

      // Navigate to home
      navigate("/", { replace: true });
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "verify-code") {
      setStep("input-contact");
      setVerificationCode("");
      setError(null);
    } else if (step === "input-info") {
      setStep("verify-code");
      setError(null);
    }
  };

  return (
    <Page className="bg-gray-50">
      <Box className="p-4 space-y-4">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Icon icon="zi-warning" size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 flex-1">{error}</p>
            </div>
          </div>
        )}

        {/* Step 1: Input Contact */}
        {step === "input-contact" && (
          <>
            <Box className="bg-white rounded-xl p-4 space-y-4">
              <h2 className="font-semibold text-lg text-gray-900">Bắt đầu đăng ký</h2>

              {/* Verification Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đăng ký bằng
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setVerificationType("phone")}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                      verificationType === "phone"
                        ? "border-primary bg-blue-50 text-primary"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Số điện thoại
                  </button>
                  <button
                    onClick={() => setVerificationType("email")}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                      verificationType === "email"
                        ? "border-primary bg-blue-50 text-primary"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Email
                  </button>
                </div>
              </div>

              {/* Contact Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {verificationType === "phone" ? "Số điện thoại" : "Email"}
                  <span className="text-red-500"> *</span>
                </label>
                <Input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder={
                    verificationType === "phone" 
                      ? "Nhập số điện thoại" 
                      : "Nhập địa chỉ email"
                  }
                  disabled={loading}
                  className="w-full"
                />
              </div>

              {verificationType === "phone" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    💡 Mã xác thực mặc định cho số điện thoại là: <strong>123456</strong>
                  </p>
                </div>
              )}
            </Box>

            <Button
              fullWidth
              size="large"
              onClick={handleSendCode}
              loading={loading}
              disabled={loading || !contact}
              className="bg-primary text-white font-medium rounded-xl py-4 shadow-lg"
            >
              Tiếp tục
            </Button>
          </>
        )}

        {/* Step 2: Verify Code */}
        {step === "verify-code" && (
          <>
            <Box className="bg-white rounded-xl p-4 space-y-4">
              <div>
                <h2 className="font-semibold text-lg text-gray-900">Xác thực</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {verificationType === "phone" 
                    ? `Nhập mã xác thực cho số điện thoại ${contact}`
                    : `Mã xác thực đã được gửi đến ${contact}`
                  }
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã xác thực <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Nhập mã xác thực"
                  disabled={loading}
                  className="w-full text-center text-2xl tracking-widest"
                  maxLength={6}
                />
              </div>

              {verificationType === "phone" && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 text-center">
                    Mã mặc định: <strong>123456</strong>
                  </p>
                </div>
              )}
            </Box>

            <div className="flex gap-3">
              <Button
                size="large"
                onClick={handleBack}
                disabled={loading}
                className="flex-1 bg-gray-200 text-gray-700 font-medium rounded-xl py-4"
              >
                Quay lại
              </Button>
              <Button
                size="large"
                onClick={handleVerifyCode}
                loading={loading}
                disabled={loading || !verificationCode}
                className="flex-1 bg-primary text-white font-medium rounded-xl py-4 shadow-lg"
              >
                Xác nhận
              </Button>
            </div>
          </>
        )}

        {/* Step 3: Input Personal Info */}
        {step === "input-info" && (
          <>
            <Box className="bg-white rounded-xl p-4 space-y-4">
              <h2 className="font-semibold text-lg text-gray-900">Thông tin cá nhân</h2>

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

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password")(e.target.value)}
                  placeholder="Nhập mật khẩu"
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

            <div className="flex gap-3">
              <Button
                size="large"
                onClick={handleBack}
                disabled={loading}
                className="flex-1 bg-gray-200 text-gray-700 font-medium rounded-xl py-4"
              >
                Quay lại
              </Button>
              <Button
                size="large"
                onClick={handleRegister}
                loading={loading}
                disabled={loading || !formData.firstName || !formData.lastName || !formData.password}
                className="flex-1 bg-primary text-white font-medium rounded-xl py-4 shadow-lg"
              >
                Đăng ký
              </Button>
            </div>
          </>
        )}

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
