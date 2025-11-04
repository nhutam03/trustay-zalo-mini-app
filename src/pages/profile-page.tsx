import React, { useEffect } from "react";
import { Page, Box, Icon } from "zmp-ui";
import BottomNav from "../components/navigate-bottom";
import useSetHeader from "@/hooks/useSetHeader";
import { changeStatusBarColor } from "@/utils/basic";

const ProfilePage: React.FC = () => {
  const setHeader = useSetHeader();

  useEffect(() => {
    setHeader({
      title: "Cá nhân",
      hasLeftIcon: false,
      type: "primary",
    });
    changeStatusBarColor("primary");
  }, []);

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
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
            U
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">Người dùng</h3>
            <p className="text-sm text-gray-600">user@trustay.life</p>
          </div>
        </div>
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

      {/* Logout Button */}
      <Box className="bg-white mt-2 p-4">
        <button className="w-full py-3 border border-red-500 text-red-500 font-medium rounded-lg active:opacity-70">
          Đăng xuất
        </button>
      </Box>

      <BottomNav />
    </Page>
  );
};

export default ProfilePage;
