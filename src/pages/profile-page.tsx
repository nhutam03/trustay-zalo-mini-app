import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Box, Icon } from "zmp-ui";
import BottomNav from "../components/navigate-bottom";
import useSetHeader from "@/hooks/useSetHeader";
import { changeStatusBarColor } from "@/utils/basic";
import { useAuth } from "@/components/providers/auth-provider";
import { usePrivateUserProfile } from "@/hooks/useUserService";
import { processImageUrl } from "@/utils/image-proxy";

const ProfilePage: React.FC = () => {
  const setHeader = useSetHeader();
  const navigate = useNavigate();
  const { isLoggedIn, logout: handleLogout, loading } = useAuth();
  const {data: user} = usePrivateUserProfile();

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

  // Menu items dựa trên role
  const getMenuItems = () => {
    type MenuItem = {
      id: string;
      label: string;
      icon: string;
      route: string;
      description: string;
    };

    const items: MenuItem[] = [];

    // Booking requests
    items.push({
      id: "booking-requests",
      label: "Yêu cầu đặt phòng",
      icon: "zi-calendar",
      route: "/booking-requests",
      description: "Quản lý yêu cầu đặt phòng",
    });

    // Dòng 2: Quản lý trọ/Quản lý cho thuê (tùy theo role)
    items.push({
      id: "rentals",
      label: user?.role === "landlord" ? "Quản lý cho thuê" : "Phòng đã thuê",
      icon: "zi-home",
      route: "/rentals",
      description: user?.role === "landlord" ? "Quản lý phòng cho thuê" : "Phòng bạn đang thuê",
    });

    // Dòng 3: Hợp đồng
    items.push({
      id: "contracts",
      label: "Hợp đồng",
      icon: "zi-note-text",
      route: "/contracts",
      description: "Xem hợp đồng thuê trọ",
    });

    // Dòng 4: Hóa đơn
    items.push({
      id: "invoices",
      label: "Hóa đơn",
      icon: "zi-poll",
      route: "/invoices",
      description: "Quản lý hóa đơn thanh toán",
    });

    // Các dòng bổ sung
    items.push(
      {
        id: "saved",
        label: "Phòng đã lưu",
        icon: "zi-heart",
        route: "/saved",
        description: "Danh sách phòng yêu thích",
      },
      {
        id: "settings",
        label: "Cài đặt",
        icon: "zi-setting",
        route: "/settings",
        description: "Cài đặt ứng dụng",
      },
      {
        id: "support",
        label: "Hỗ trợ",
        icon: "zi-help-circle",
        route: "/support",
        description: "Trung tâm hỗ trợ",
      }
    );

    return items;
  };

  const menuItems = getMenuItems();

  return (
    <Page className="bg-gray-50 has-bottom-nav">
      {/* Dòng 1: User Info Card - Avatar và Tên (SĐT/Email) */}
      <Box className="bg-white mb-2">
        {isLoggedIn ? (
          <button
            onClick={() => navigate("/profile-detail")}
            className="w-full p-4 active:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              {/* Avatar */}
              {user?.avatarUrl ? (
                <img
                  src={processImageUrl(user.avatarUrl)}
                  alt={"User Avatar"}
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
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {user?.firstName?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}

              {/* Thông tin user */}
              <div className="flex-1 text-left">
                <h3 className="font-bold text-lg text-gray-900">
                  {`${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Người dùng"}
                </h3>
                <p className="text-sm text-gray-600 mt-0.5">
                  {user?.phone || user?.email || "Chưa cập nhật thông tin"}
                </p>
                {user?.role && (
                  <span className="inline-block mt-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">
                    {user.role === "landlord" ? "Chủ trọ" : "Người thuê"}
                  </span>
                )}
              </div>

              {/* Icon chevron */}
              <Icon icon="zi-chevron-right" size={20} className="text-gray-400 flex-shrink-0" />
            </div>
          </button>
        ) : (
          <div className="flex flex-col items-center gap-4 py-8 px-4">
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
                className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:opacity-90 active:opacity-70 transition-opacity"
              >
                Đăng ký ngay
              </button>
            </div>
          </div>
        )}
      </Box>

      {/* Menu List - Các dòng 2, 3, 4 và các dòng bổ sung */}
      {isLoggedIn && (
        <Box className="bg-white">
          {menuItems.map((item, index) => (
            <div key={item.id}>
              <button
                onClick={() => navigate(item.route)}
                className="w-full flex items-center gap-4 px-4 py-4 active:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Icon icon={item.icon as any} size={22} className="text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900">{item.label}</p>
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                  )}
                </div>
                <Icon icon="zi-chevron-right" size={20} className="text-gray-400 flex-shrink-0" />
              </button>
              {index < menuItems.length - 1 && (
                <div className="border-b border-gray-100 ml-16" />
              )}
            </div>
          ))}
        </Box>
      )}

      {/* Logout Button - Only show if logged in */}
      {isLoggedIn && (
        <Box className="bg-white mt-2 p-4">
          <button
            onClick={onLogout}
            disabled={loading}
            className="w-full py-3 border border-red-500 text-red-500 font-medium rounded-lg active:opacity-70 disabled:opacity-50 transition-opacity"
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
