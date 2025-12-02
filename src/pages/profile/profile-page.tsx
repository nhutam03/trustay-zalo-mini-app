import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Box, Icon } from "zmp-ui";
import BottomNav from "@/components/navigate-bottom";
import useSetHeader from "@/hooks/useSetHeader";
import { changeStatusBarColor } from "@/utils/basic";
import { useAuth } from "@/components/providers/auth-provider";
import { usePrivateUserProfile } from "@/hooks/useUserService";
import { processImageUrl } from "@/utils/image-proxy";

const ProfilePage: React.FC = () => {
  const setHeader = useSetHeader();
  const navigate = useNavigate();
  const { isLoggedIn, logout: handleLogout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Auto-fetch user profile only when logged in
  const { data: user, isLoading: profileLoading } = usePrivateUserProfile({
    enabled: isLoggedIn,
  });

  useEffect(() => {
    setHeader({
      title: "Cá nhân",
      hasLeftIcon: false,
      type: "primary",
    });
    changeStatusBarColor("primary");
  }, []);

  useEffect(() => {
    if (user) {
      console.log("User profile loaded:", user);
    }
  }, [user]);

  const onLogout = async () => {
    setIsLoggingOut(true);
    try {
      await handleLogout();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
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

    // Menu đặc biệt cho landlord
    if (user?.role === "landlord") {
      items.push(
        {
          id: "buildings",
          label: "Quản lý tòa nhà",
          icon: "zi-location",
          route: "/buildings",
          description: "Danh sách tòa nhà của bạn",
        },
        {
          id: "rooms",
          label: "Quản lý phòng",
          icon: "zi-home",
          route: "/rooms",
          description: "Quản lý tất cả phòng trọ",
        }
      );
    }

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
      icon: "zi-note",
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
        id: "link-account",
        label: "Liên kết tài khoản",
        icon: "zi-user-plus",
        route: "/link-account",
        description: "Liên kết số điện thoại Zalo",
      },
      {
        id: "ai-assistant",
        label: "Trợ lý AI",
        icon: "zi-star",
        route: "/ai-assistant",
        description: "Tìm phòng với AI thông minh",
      },
      {
        id: "saved",
        label: "Phòng đã lưu",
        icon: "zi-heart",
        route: "/saved-rooms",
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
        route: "/help",
        description: "Trung tâm hỗ trợ",
      }
    );

    return items;
  };

  const menuItems = getMenuItems();

  // Nếu chưa đăng nhập, hiển thị màn hình đăng nhập/đăng ký
  if (!isLoggedIn) {
    return (
      <Page className="bg-gray-50 has-bottom-nav">
        <div className="flex flex-col items-center justify-center min-h-screen px-6 pb-20">
          {/* Logo hoặc Icon */}
          <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center mb-6">
            <Icon icon="zi-user" size={64} className="text-white" />
          </div>

          {/* Tiêu đề */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Chào mừng đến với Trustay
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Đăng nhập hoặc đăng ký để sử dụng đầy đủ tính năng
          </p>

          {/* Nút đăng nhập */}
          <button
            onClick={() => navigate("/login")}
            className="w-full max-w-sm py-3 bg-primary text-white font-medium rounded-lg active:opacity-70 transition-opacity mb-3"
          >
            Đăng nhập
          </button>

          {/* Nút đăng ký */}
          <button
            onClick={() => navigate("/register")}
            className="w-full max-w-sm py-3 border border-primary text-primary font-medium rounded-lg active:opacity-70 transition-opacity"
          >
            Đăng ký ngay
          </button>
        </div>
        <BottomNav />
      </Page>
    );
  }

  return (
    <Page className="bg-gray-50 has-bottom-nav">
      {/* Loading overlay khi đang logout */}
      {isLoggingOut && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-700 font-medium">Đang đăng xuất...</p>
          </div>
        </div>
      )}

      {/* User Info Card - Avatar và Tên (SĐT/Email) */}
      <Box className="bg-white mb-2">
        <button
          onClick={() => navigate("/profile-detail")}
          className="w-full p-4 active:bg-gray-50 transition-colors"
          disabled={isLoggingOut}
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
      </Box>

      {/* Menu List - Các dòng 2, 3, 4 và các dòng bổ sung */}
      <Box className="bg-white">
        {menuItems.map((item, index) => (
          <div key={item.id}>
            <button
              onClick={() => navigate(item.route)}
              className="w-full flex items-center gap-4 px-4 py-4 active:bg-gray-50 transition-colors"
              disabled={isLoggingOut}
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

      {/* Logout Button */}
      <Box className="bg-white mt-2 p-4">
        <button
          onClick={onLogout}
          disabled={isLoggingOut}
          className="w-full py-3 border border-red-500 text-red-500 font-medium rounded-lg active:opacity-70 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
        </button>
      </Box>

      <div className="h-4 mb-16 bg-white" />
      <BottomNav />
    </Page>
  );
};

export default ProfilePage;
