import React, { useState, useRef, useEffect } from "react";
import { cx } from "../utils/basic";
import { Box, Icon, useNavigate, Input } from "zmp-ui";
import { useRecoilValue } from "recoil";
import { headerState } from "@/utils/state";
import logoWhite from "@/static/logo-slogan-white.png";
import { useLocation } from "react-router-dom";
import { getUnreadNotificationCount } from "@/services/notification-service";
import { useAuth } from "@/components/providers/auth-provider";

const typeColor = {
  primary: {
    headerColor: "bg-primary",
    textColor: "text-white",
    iconColor: "text-white",
  },
  secondary: {
    headerColor: "bg-white",
    textColor: "text-black",
    iconColor: "text-gray-400",
  },
};

const Header = () => {
  const { route, hasLeftIcon, rightIcon, title, customTitle, type } =
    useRecoilValue(headerState);

  const { headerColor, textColor, iconColor } = typeColor[type! || "primary"];
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Gợi ý tìm kiếm phổ biến
  const popularSearches = [
    { text: "Phòng trọ quận 1", icon: "zi-location" },
    { text: "Phòng trọ Thủ Đức", icon: "zi-location" },
    { text: "Phòng trọ Bình Thạnh", icon: "zi-location" },
    { text: "Phòng giá rẻ", icon: "zi-star" },
    { text: "Căn hộ mini", icon: "zi-home" },
  ];

  // Lịch sử tìm kiếm (có thể lưu vào localStorage)
  const recentSearches = [
    "Phòng trọ Gò Vấp",
    "Phòng có máy lạnh",
  ];

  const handleBack = () => {
    if (route === "/explore" && location.pathname.startsWith("/roommate/")) {
      // Quay về tab "Tìm bạn" khi từ roommate detail page
      navigate(route, { state: { activeTab: "seeking-roommates" } });
    } else if (route) {
      navigate(route);
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    if (showSearch && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showSearch]);

  // Load unread notification count
  useEffect(() => {
    const loadUnreadCount = async () => {
      if (isLoggedIn) {
        try {
          const response = await getUnreadNotificationCount();
          setUnreadCount(response.data?.count || response.unreadCount || 0);
        } catch (error) {
          console.error('Error loading unread count:', error);
        }
      }
    };

    loadUnreadCount();
    // Poll every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const handleSearchClick = () => {
    setShowSearch(true);
  };

  const handleCloseSearch = () => {
    setShowSearch(false);
    setSearchQuery("");
  };

  const handleSearch = (query?: string) => {
    const searchText = query || searchQuery;
    if (searchText.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchText)}`);
      handleCloseSearch();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSuggestionClick = (text: string) => {
    setSearchQuery(text);
    handleSearch(text);
  };

  return (
    <>
    <div
      className={cx(
        "fixed top-0 z-50 w-screen flex items-center",
        headerColor,
        textColor
      )}
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        height: 'calc(50px + env(safe-area-inset-top))',
        paddingBottom: '10px',
      }}
    >
      {showSearch ? (
        // Search mode
        <div className="flex items-center h-[44px] px-4 mb-2 gap-2 w-full">
          <span onClick={handleCloseSearch} className="cursor-pointer">
            <Icon icon="zi-arrow-left" className={iconColor} />
          </span>
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              placeholder="Tìm phòng trọ, khu vực..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 rounded-lg bg-white text-black outline-none"
            />
          </div>
          {searchQuery && (
            <span onClick={() => handleSearch(searchQuery)} className="cursor-pointer">
              <Icon icon="zi-search" className={iconColor} />
            </span>
          )}
        </div>
      ) : (
        // Normal mode
        <div className="flex items-center h-[44px] pl-5 pr-5 gap-3 w-full justify-between">
          <div className="flex flex-row items-center gap-2">
            {hasLeftIcon && (
              <span onClick={handleBack}>
                <Icon icon="zi-arrow-left" className={iconColor} />
              </span>
            )}
            {customTitle || (
              <>
                {title ? (
                  <div className="pl-2 text-lg font-medium">{title}</div>
                ) : (
                  <img
                    src={logoWhite}
                    alt="Trustay"
                    className="h-8 object-contain"
                    onClick={() => navigate("/")}
                  />
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span onClick={handleSearchClick} className="cursor-pointer">
              <Icon icon="zi-search" className={iconColor} />
            </span>
            {isLoggedIn && (
              <button
                onClick={() => navigate('/notifications')}
                className="relative cursor-pointer"
              >
                <Icon icon="zi-notif" className={iconColor} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}
            {rightIcon}
          </div>
        </div>
      )}
    </div>

    {/* Blur overlay khi search mode active */}
    {showSearch && (
      <>
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          style={{ top: 'calc(44px + env(safe-area-inset-top))' }}
          onClick={handleCloseSearch}
        />

        {/* Search suggestions panel */}
        <div
          className="fixed left-0 right-0 bg-white z-40 shadow-lg"
          style={{ top: 'calc(44px + env(safe-area-inset-top))' }}
        >
          {/* Lịch sử tìm kiếm */}
          {recentSearches.length > 0 && !searchQuery && (
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Tìm kiếm gần đây</h3>
                <button className="text-xs text-primary">Xóa tất cả</button>
              </div>
              <div className="space-y-2">
                {recentSearches.map((search, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer active:bg-gray-100"
                  >
                    <Icon icon="zi-poll" className="text-gray-400" size={20} />
                    <span className="flex-1 text-sm text-gray-700">{search}</span>
                    <Icon icon="zi-arrow-right" className="text-gray-300" size={16} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gợi ý tìm kiếm phổ biến */}
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              {searchQuery ? "Gợi ý tìm kiếm" : "Tìm kiếm phổ biến"}
            </h3>
            <div className="space-y-2">
              {popularSearches.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleSuggestionClick(item.text)}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer active:bg-gray-100"
                >
                  {/* <Icon icon={item.icon} className="text-primary" size={20} /> */}
                  <span className="flex-1 text-sm text-gray-700">{item.text}</span>
                  <Icon icon="zi-arrow-right" className="text-gray-300" size={16} />
                </div>
              ))}
            </div>
          </div>

          {/* Quick filters */}
          <div className="p-4 pt-0">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSuggestionClick("Phòng có máy lạnh")}
                className="px-3 py-1.5 bg-blue-50 text-primary text-xs rounded-full border border-primary/20"
              >
                Có máy lạnh
              </button>
              <button
                onClick={() => handleSuggestionClick("Phòng có gác")}
                className="px-3 py-1.5 bg-blue-50 text-primary text-xs rounded-full border border-primary/20"
              >
                Có gác
              </button>
              <button
                onClick={() => handleSuggestionClick("Giá dưới 3 triệu")}
                className="px-3 py-1.5 bg-blue-50 text-primary text-xs rounded-full border border-primary/20"
              >
                Dưới 3 triệu
              </button>
              <button
                onClick={() => handleSuggestionClick("Gần trường đại học")}
                className="px-3 py-1.5 bg-blue-50 text-primary text-xs rounded-full border border-primary/20"
              >
                Gần trường ĐH
              </button>
            </div>
          </div>
        </div>
      </>
    )}
    </>
  );
};

export default Header;
