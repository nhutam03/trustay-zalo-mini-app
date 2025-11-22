import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Box } from "zmp-ui";
import useSetHeader from "@/hooks/useSetHeader";
import { changeStatusBarColor } from "@/utils/basic";
import { usePrivateUserProfile, useUploadAvatar } from "@/hooks/useUserService";
import { useSnackbar } from "zmp-ui";
import { processImageUrl } from "@/utils/image-proxy";
import { ProfileRow } from "@/components/profile/ProfileRow";
import { useUploadSingleImage } from "@/hooks/useUploadService";

const ProfileDetailPage: React.FC = () => {
  const setHeader = useSetHeader();
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const { data: user, isLoading: isLoadingProfile} = usePrivateUserProfile();
  const uploadAvatarMutation = useUploadAvatar();
  const uploadImageMutation = useUploadSingleImage();

  const [avatarChanged, setAvatarChanged] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Upload image to get URL for preview
      const result = await uploadImageMutation.mutateAsync({ file });
      setPreviewUrl(result.imagePath);
      setSelectedFile(file);
      setAvatarChanged(true);
    } catch (error) {
      console.error("Error uploading preview:", error);
      openSnackbar({
        text: "Không thể tải ảnh xem trước",
        type: "error",
        duration: 3000,
      });
    }
  };

  const handleSave = async () => {
    if (!selectedFile) return;

    try {
      await uploadAvatarMutation.mutateAsync(selectedFile);
      openSnackbar({
        text: "Cập nhật ảnh đại diện thành công!",
        type: "success",
        duration: 3000,
      });
      setAvatarChanged(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      openSnackbar({
        text: error instanceof Error ? error.message : "Không thể tải ảnh đại diện",
        type: "error",
        duration: 4000,
      });
    }
  };

  useEffect(() => {
    setHeader({
      title: "Sửa Hồ sơ",
      hasLeftIcon: true,
      type: "primary",
      customBackIcon: () => navigate(-1),
      rightIcon: (
        <button
          onClick={handleSave}
          disabled={!avatarChanged || uploadAvatarMutation.isPending}
          className={`${
            avatarChanged && !uploadAvatarMutation.isPending
              ? "text-white"
              : "text-white opacity-30"
          } font-medium`}
        >
          {uploadAvatarMutation.isPending ? "Đang lưu..." : "Lưu"}
        </button>
      ),
    });
    changeStatusBarColor("primary");
  }, [avatarChanged, uploadAvatarMutation.isPending, handleSave]);


    // Fetch profile data khi component mount (CHỈ 1 LẦN)
    useEffect(() => {
      if ( !user) {
        console.log("Fetching user profile data...");
      }
    }, [user]);
  
    useEffect(() => {
      user && console.log("User data in ProfilePage:", user);
    }, [user]);
  // Show loading state
  if (isLoadingProfile) {
    return (
      <Page className="bg-gray-50">
        <Box className="bg-white p-4 flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin...</p>
          </div>
        </Box>
      </Page>
    );
  }

  const fullName = `${user?.lastName || ""} ${user?.firstName || ""}`.trim();

  const formatDate = (dateString?: string) => {
    if (!dateString) return undefined;
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")}/${String(
      date.getMonth() + 1
    ).padStart(2, "0")}/${date.getFullYear()}`;
  };

  const getGenderLabel = (gender?: string) => {
    switch (gender) {
      case "male":
        return "Nam";
      case "female":
        return "Nữ";
      case "other":
        return "Khác";
      default:
        return undefined;
    }
  };

  return (
    <Page className="bg-gray-50">
      {/* Avatar Section with Orange Background */}
      <Box className="bg-primary p-4 pb-8">
        <div className="flex flex-col items-center">
          <label className="relative cursor-pointer group">
            {uploadImageMutation.isPending ? (
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center ring-4 ring-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : previewUrl ? (
              <img
                src={processImageUrl(previewUrl)}
                alt="Preview"
                className="w-24 h-24 rounded-full object-cover ring-4 ring-white"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
              />
            ) : user?.avatarUrl ? (
              <img
                src={processImageUrl(user.avatarUrl)}
                alt={fullName}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-white"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== "https://via.placeholder.com/96/f0f0f0/999999?text=Avatar") {
                    target.src = "https://via.placeholder.com/96/f0f0f0/999999?text=Avatar";
                  }
                }}
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-primary text-3xl font-bold ring-4 ring-white">
                {user?.firstName?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
            {/* Overlay text on hover */}
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-medium">Sửa</span>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </label>
        </div>
      </Box>

      {/* Profile Info Rows */}
      <Box className="mt-2">
        <ProfileRow
          label="Tên"
          value={fullName}
          onClick={() => navigate("/profile/edit-name")}
        />

        <ProfileRow
          label="Bio"
          value={user?.bio}
          onClick={() => navigate("/profile/edit-bio")}
        />

        <ProfileRow
          label="Giới tính"
          value={getGenderLabel(user?.gender)}
          onClick={() => navigate("/profile/edit-gender")}
        />

        <ProfileRow
          label="Ngày sinh"
          value={formatDate(user?.dateOfBirth)}
          onClick={() => navigate("/profile/edit-dateofbirth")}
        />
      </Box>

      {/* Additional Info Section */}
      <Box className="mt-2">
        <div className="py-3 px-4 bg-gray-50">
          <p className="text-sm font-medium text-gray-500">Thông tin cá nhân</p>
        </div>

        <ProfileRow
          label="Điện thoại"
          value={user?.phone}
          verified={user?.verifiedPhone}
          showArrow={false}
        />

        <ProfileRow
          label="Email"
          value={user?.email}
          verified={user?.verifiedEmail}
          showArrow={false}
        />

        <ProfileRow
          label="Tài khoản liên kết"
          value="Zalo"
          showArrow={true}
        />
      </Box>

      {/* Bank Info Section */}
      {user?.role === "landlord" && (
        <Box className="mt-2 mb-4">
          <div className="py-3 px-4 bg-gray-50">
            <p className="text-sm font-medium text-gray-500">Thông tin thanh toán</p>
          </div>

          <ProfileRow
            label="Số CMND/CCCD"
            value={user?.idCardNumber}
            placeholder="Thiết lập ngay"
            onClick={() => navigate("/profile/edit-bankinfo")}
          />

          <ProfileRow
            label="Số tài khoản ngân hàng"
            value={user?.bankAccount}
            placeholder="Thiết lập ngay"
            onClick={() => navigate("/profile/edit-bankinfo")}
          />

          <ProfileRow
            label="Tên ngân hàng"
            value={user?.bankName}
            placeholder="Thiết lập ngay"
            onClick={() => navigate("/profile/edit-bankinfo")}
          />
        </Box>
      )}
    </Page>
  );
};

export default ProfileDetailPage;
