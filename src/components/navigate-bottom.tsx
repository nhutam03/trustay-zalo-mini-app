import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon } from "zmp-ui";
import { NavItem } from "@/interfaces/basic";
import { useCurrentUser } from "@/hooks/useAuthService";

const BottomNav: React.FC = () => {
  const location = useLocation();
  const { data: user } = useCurrentUser();

  const isActive = (route: string) => {
    if (route === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(route);
  };

  // Different nav items for landlord
  const landlordNavItems: NavItem[] = [
    {
      id: "home",
      label: "Dashboard",
      icon: "zi-home",
      iconActive: "zi-home",
      route: "/",
    },
    {
      id: "search",
      label: "Khám phá",
      icon: "zi-grid-solid",
      iconActive: "zi-grid-solid",
      route: "/explore",
    },
    {
      id: "post",
      label: "Tạo phòng",
      icon: "zi-plus-circle",
      iconActive: "zi-plus-circle-solid",
      route: "/post-room",
    },
    {
      id: "messages",
      label: "Tin nhắn",
      icon: "zi-chat",
      iconActive: "zi-chat-solid",
      route: "/messages",
    },
    {
      id: "profile",
      label: "Cá nhân",
      icon: "zi-user",
      iconActive: "zi-user-solid",
      route: "/profile",
    },
  ];

  // Tenant nav items (default)
  const tenantNavItems: NavItem[] = [
    {
      id: "home",
      label: "Trang chủ",
      icon: "zi-home",
      iconActive: "zi-home",
      route: "/",
    },
    {
      id: "search",
      label: "Khám phá",
      icon: "zi-grid-solid",
      iconActive: "zi-grid-solid",
      route: "/explore",
    },
    {
      id: "post",
      label: "Đăng tin",
      icon: "zi-plus-circle",
      iconActive: "zi-plus-circle-solid",
      route: "/post",
    },
    {
      id: "messages",
      label: "Tin nhắn",
      icon: "zi-chat",
      iconActive: "zi-chat-solid",
      route: "/messages",
    },
    {
      id: "profile",
      label: "Cá nhân",
      icon: "zi-user",
      iconActive: "zi-user-solid",
      route: "/profile",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="grid grid-cols-5 h-16">
        {user?.role === 'landlord' 
          ? landlordNavItems.map((item) => {
              const active = isActive(item.route);
              return (
                <Link
                  key={item.id}
                  to={item.route}
                  className={`flex flex-col items-center justify-center gap-1 transition-colors`}
                >
                  <Icon
                    icon={active ? (item.iconActive as any) : (item.icon as any)}
                    size={24}
                    className={active ? "text-primary" : "text-gray-500"}
                  />
                  <span className={`text-xs font-medium ${active ? "text-primary" : "text-gray-500"}`}>{item.label}</span>
                </Link>
              );
            })
          : tenantNavItems.map((item) => {
              const active = isActive(item.route);
              return (
                <Link
                  key={item.id}
                  to={item.route}
                  className={`flex flex-col items-center justify-center gap-1 transition-colors`}
                >
                  <Icon
                    icon={active ? (item.iconActive as any) : (item.icon as any)}
                    size={24}
                    className={active ? "text-primary" : "text-gray-500"}
                  />
                  <span className={`text-xs font-medium ${active ? "text-primary" : "text-gray-500"}`}>{item.label}</span>
                </Link>
              );
            })}
      </div>
    </div>
  );
};

export default BottomNav;
