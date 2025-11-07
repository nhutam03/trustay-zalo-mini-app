import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Box, Icon } from "zmp-ui";
import BottomNav from "../components/navigate-bottom";
import useSetHeader from "@/hooks/useSetHeader";
import { changeStatusBarColor } from "@/utils/basic";
import { useAuth } from "@/components/providers/auth-provider";

const ProfilePage: React.FC = () => {
  const setHeader = useSetHeader();
  const navigate = useNavigate();
  const { user, isLoggedIn, logout: handleLogout, loading } = useAuth();

  useEffect(() => {
    setHeader({
      title: "Cá nhân",
      hasLeftIcon: false,
      type: "primary",
    });
    changeStatusBarColor("primary");
  }, []);

  const onLogout = async () => {
    await handleLogout();
    navigate("/", { replace: true });
  };

  const menuItems = [
    { id: "saved", label: "Phòng đã lưu", icon: "zi-heart", route: "/saved" },
    { id: "contracts", label: "Hợp đồng", icon: "zi-note", route: "/contracts" },
    { id: "payments", label: "Thanh toán", icon: "zi-poll", route: "/payments" },
    { id: "settings", label: "Cài đặt", icon: "zi-setting", route: "/settings" },
    { id: "support", label: "Hỗ trợ", icon: "zi-help-circle", route: "/support" },
  ];

  return (
    <Page className="bg-gray-50 has-bottom-nav">
      {/* User Info Card */}
      <Box className="bg-white p-4 mb-2">
        {isLoggedIn ? (
          <div className="flex items-center gap-4">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-bold text-lg">{user?.name || "Người dùng"}</h3>
              <p className="text-sm text-gray-600">
                {user?.email || user?.phone || "Chưa cập nhật thông tin"}
              </p>
            </div>
            <button className="p-2">
              <Icon icon="zi-edit" size={20} className="text-gray-600" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
              <Icon icon="zi-user" size={40} className="text-gray-400" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-lg text-gray-900 mb-1">Chưa đăng nhập</h3>
              <p className="text-sm text-gray-600 mb-4">
                Đăng ký để sử dụng đầy đủ tính năng
              </p>
              <button
                onClick={() => navigate("/register")}
                className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:opacity-90 active:opacity-70"
              >
                Đăng ký ngay
              </button>
            </div>
          </div>
        )}
      </Box>

      {/* Menu List */}
      <Box className="bg-white">
        {menuItems.map((item, index) => (
          <div key={item.id}>
            <button className="w-full flex items-center gap-4 px-4 py-4 active:bg-gray-50">
              <Icon icon={item.icon as any} size={24} className="text-gray-700" />
              <span className="flex-1 text-left font-medium text-gray-900">
                {item.label}
              </span>
              <Icon icon="zi-chevron-right" size={20} className="text-gray-400" />
            </button>
            {index < menuItems.length - 1 && (
              <div className="border-b border-gray-100 ml-14" />
            )}
          </div>
        ))}
      </Box>

      {/* Logout Button - Only show if logged in */}
      {isLoggedIn && (
        <Box className="bg-white mt-2 p-4">
          <button
            onClick={onLogout}
            disabled={loading}
            className="w-full py-3 border border-red-500 text-red-500 font-medium rounded-lg active:opacity-70 disabled:opacity-50"
          >
            {loading ? "Đang đăng xuất..." : "Đăng xuất"}
          </button>
        </Box>
      )}

      <BottomNav />
    </Page>
  );
};

export default ProfilePage;
