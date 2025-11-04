import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Icon } from "zmp-ui";
import { NavItem } from "@/interfaces/basic";

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      id: "home",
      label: "Trang chủ",
      icon: "zi-home",
      iconActive: "zi-home-solid",
      route: "/",
    },
    {
      id: "search",
      label: "Khám phá",
      icon: "zi-search",
      iconActive: "zi-search",
      route: "/explore",
    },
    {
      id: "post",
      label: "Đăng tin",
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

  const isActive = (route: string) => {
    if (route === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(route);
  };

  const handleNavClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const active = isActive(item.route);
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.route)}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                active ? "text-primary" : "text-gray-500"
              }`}
            >
              <Icon
                icon={active ? (item.iconActive as any) : (item.icon as any)}
                size={24}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
