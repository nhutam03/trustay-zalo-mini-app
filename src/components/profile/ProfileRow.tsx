import React from "react";
import { Icon } from "zmp-ui";

interface ProfileRowProps {
  label: string;
  value?: string;
  placeholder?: string;
  onClick?: () => void;
  showArrow?: boolean;
  verified?: boolean;
}

export const ProfileRow: React.FC<ProfileRowProps> = ({
  label,
  value,
  placeholder = "Thiết lập ngay",
  onClick,
  showArrow = true,
  verified = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between py-4 px-4 bg-white border-b border-gray-100 ${
        onClick ? "active:bg-gray-50 cursor-pointer" : ""
      }`}
    >
      <div className="flex-1">
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <p className={`text-base ${value ? "text-gray-900" : "text-red-500"}`}>
            {value || placeholder}
          </p>
          {verified && <Icon icon="zi-check-circle" className="text-green-500 text-lg" />}
        </div>
      </div>
      {showArrow && onClick && (
        <Icon icon="zi-chevron-right" className="text-gray-400 text-xl" />
      )}
    </div>
  );
};
