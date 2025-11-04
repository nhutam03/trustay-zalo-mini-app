import React from "react";
import { Box, Icon } from "zmp-ui";
import { useNavigate } from "react-router-dom";

export interface MenuItemProps {
  id: string;
  title: string;
  icon: any; // Accept any icon type to avoid TS errors
  iconColor?: string;
  route?: string;
  action?: () => void;
}

interface MenuGridProps {
  items: MenuItemProps[];
}

const MenuGrid: React.FC<MenuGridProps> = ({ items }) => {
  const navigate = useNavigate();

  const handleItemClick = (item: MenuItemProps) => {
    if (item.action) {
      item.action();
    } else if (item.route) {
      navigate(item.route);
    }
  };

  return (
    <Box className="bg-white px-4 py-5">
      <div className="grid grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => handleItemClick(item)}
            className="flex flex-col items-center gap-2 cursor-pointer active:opacity-70 transition-opacity"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #e8f8f0 0%, #f0faf5 100%)",
              }}
            >
              <Icon
                icon={item.icon as any}
                className={item.iconColor || "text-trustay-green"}
                size={28}
              />
            </div>
            <span className="text-xs text-center text-gray-700 leading-tight">
              {item.title}
            </span>
          </div>
        ))}
      </div>
    </Box>
  );
};

export default MenuGrid;
