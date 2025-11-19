import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Box, Input, Button, Select, Icon } from "zmp-ui";
import useSetHeader from "@/hooks/useSetHeader";
import { changeStatusBarColor } from "@/utils/basic";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient, extractErrorMessage } from "@/lib/api-client";

const { Option } = Select;

const ProfileDetailPage: React.FC = () => {
  const setHeader = useSetHeader();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    gender: user?.gender || "other",
    dateOfBirth: user?.dateOfBirth || "",
    bio: user?.bio || "",
    idCardNumber: user?.idCardNumber || "",
    bankAccount: user?.bankAccount || "",
    bankName: user?.bankName || "",
  });

  useEffect(() => {
    setHeader({
      title: "Thông tin cá nhân",
      hasLeftIcon: true,
      type: "primary",
      customBackIcon: () => navigate(-1),
    });
    changeStatusBarColor("primary");
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender || "other",
        dateOfBirth: user.dateOfBirth || "",
        bio: user.bio || "",
        idCardNumber: user.idCardNumber || "",
        bankAccount: user.bankAccount || "",
        bankName: user.bankName || "",
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);

      await apiClient.put("/api/users/profile", formData);

      // Refresh user data
      await refreshUser();

      setIsEditing(false);

      // Show success message (you can add a toast notification here)
      console.log("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(extractErrorMessage(error, "Không thể cập nhật thông tin"));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender || "other",
        dateOfBirth: user.dateOfBirth || "",
        bio: user.bio || "",
        idCardNumber: user.idCardNumber || "",
        bankAccount: user.bankAccount || "",
        bankName: user.bankName || "",
      });
    }
    setIsEditing(false);
  };

  return (
    <Page className="bg-gray-50">
      <Box className="bg-white p-4 mb-2">
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-6">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold">
              {user?.firstName?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}
          {isEditing && (
            <button className="mt-3 text-primary text-sm font-medium">
              Thay đổi ảnh đại diện
            </button>
          )}
        </div>

        {/* Role Badge */}
        {user?.role && (
          <div className="flex justify-center mb-4">
            <span className="px-4 py-1.5 bg-blue-50 text-blue-600 text-sm font-medium rounded-full">
              {user.role === "landlord" ? "Chủ trọ" : "Người thuê"}
            </span>
          </div>
        )}

        {/* Edit Button */}
        {!isEditing && (
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 bg-primary text-white font-medium rounded-lg active:opacity-70 transition-opacity"
            >
              Cập nhật thông tin
            </button>
          </div>
        )}
      </Box>

      {/* Form Fields */}
      <Box className="bg-white p-4 mb-2">
        <h3 className="font-bold text-base mb-4 text-gray-900">Thông tin cơ bản</h3>

        {/* First Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Họ <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            disabled={!isEditing}
            placeholder="Nhập họ"
            className={!isEditing ? "bg-gray-50" : ""}
          />
        </div>

        {/* Last Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            disabled={!isEditing}
            placeholder="Nhập tên"
            className={!isEditing ? "bg-gray-50" : ""}
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            disabled={!isEditing}
            placeholder="example@email.com"
            className={!isEditing ? "bg-gray-50" : ""}
          />
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            disabled={!isEditing}
            placeholder="0123456789"
            className={!isEditing ? "bg-gray-50" : ""}
          />
        </div>

        {/* Gender */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Giới tính
          </label>
          <Select
            value={formData.gender}
            onChange={(value) => handleInputChange("gender", value as string)}
            disabled={!isEditing}
            className={!isEditing ? "bg-gray-50" : ""}
          >
            <Option value="male" title="Nam" />
            <Option value="female" title="Nữ" />
            <Option value="other" title="Khác" />
          </Select>
        </div>

        {/* Date of Birth */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ngày sinh
          </label>
          <Input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
            disabled={!isEditing}
            className={!isEditing ? "bg-gray-50" : ""}
          />
        </div>

        {/* Bio */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Giới thiệu bản thân
          </label>
          <Input.TextArea
            value={formData.bio}
            onChange={(e) => handleInputChange("bio", e.target.value)}
            disabled={!isEditing}
            placeholder="Viết vài dòng về bản thân..."
            maxLength={500}
            showCount
            className={!isEditing ? "bg-gray-50" : ""}
          />
        </div>
      </Box>

      {/* Additional Information */}
      <Box className="bg-white p-4 mb-2">
        <h3 className="font-bold text-base mb-4 text-gray-900">Thông tin bổ sung</h3>

        {/* ID Card Number */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số CMND/CCCD
          </label>
          <Input
            type="text"
            value={formData.idCardNumber}
            onChange={(e) => handleInputChange("idCardNumber", e.target.value)}
            disabled={!isEditing}
            placeholder="Nhập số CMND/CCCD"
            className={!isEditing ? "bg-gray-50" : ""}
          />
        </div>

        {/* Bank Account */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số tài khoản ngân hàng
          </label>
          <Input
            type="text"
            value={formData.bankAccount}
            onChange={(e) => handleInputChange("bankAccount", e.target.value)}
            disabled={!isEditing}
            placeholder="Nhập số tài khoản"
            className={!isEditing ? "bg-gray-50" : ""}
          />
        </div>

        {/* Bank Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên ngân hàng
          </label>
          <Input
            type="text"
            value={formData.bankName}
            onChange={(e) => handleInputChange("bankName", e.target.value)}
            disabled={!isEditing}
            placeholder="VD: Vietcombank, Techcombank..."
            className={!isEditing ? "bg-gray-50" : ""}
          />
        </div>
      </Box>

      {/* Action Buttons - Only show when editing */}
      {isEditing && (
        <Box className="bg-white p-4 mb-4">
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg active:opacity-70 disabled:opacity-50 transition-opacity"
            >
              Hủy
            </button>
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="flex-1 py-3 bg-primary text-white font-medium rounded-lg active:opacity-70 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </Box>
      )}
    </Page>
  );
};

export default ProfileDetailPage;
