import React from "react";
import { cx } from "../utils/basic";
import { Box, Icon, useNavigate } from "zmp-ui";
import { useRecoilValue } from "recoil";
import { headerState } from "@/utils/state";
import logoWhite from "@/static/logo-slogan-white.png";
import { useLocation } from "react-router-dom";

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

  return (
    <div
      className={cx(
        "fixed top-0 z-50 w-screen flex items-center",
        headerColor,
        textColor
      )}
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        height: 'calc(44px + env(safe-area-inset-top))'
      }}
    >
      <div className="flex items-center h-[44px] pl-5 pr-[105px] gap-3 w-full justify-between">
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
        {rightIcon || " "}
      </div>
    </div>
  );
};

export default Header;
