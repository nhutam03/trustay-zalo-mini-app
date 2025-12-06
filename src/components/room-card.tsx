import React from "react";
import { Box, Icon } from "zmp-ui";
import { useNavigate } from "react-router-dom";
import { RoomCardProps } from "@/interfaces/basic";
import { getImageProps } from "@/utils/image-proxy";

const RoomCard: React.FC<RoomCardProps> = ({
  id,
  title,
  price,
  area,
  location,
  image,
  verified,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Save current scroll position before navigating
    const currentScroll = window.scrollY;
    console.log('💾 Saving scroll position:', currentScroll);
    sessionStorage.setItem('explore-return-scroll', currentScroll.toString());
    navigate(`/room/${id}`, { state: { from: '/explore' } });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  return (
    <div
      className="trustay-card overflow-hidden"
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative">
        <img
          {...getImageProps(image, title, { width: 400, height: 200, quality: 75 })}
          className="w-full h-32 object-cover"
        />
        {verified && (
          <div className="absolute top-2 right-2 bg-trustay-green text-white text-xs px-2 py-1 rounded-md font-medium flex items-center gap-1">
            <Icon icon="zi-check-circle-solid" size={12} />
            Đã xác minh
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
          {title}
        </h3>

        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-primary text-lg font-bold">
            {formatPrice(price)}đ
          </span>
          <span className="text-xs text-gray-500">/tháng</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-600">
          {area && (
            <div className="flex items-center gap-1">
              <Icon icon="zi-home" size={14} />
              <span>{area}m²</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Icon icon="zi-location" size={14} />
            <span className="line-clamp-1 flex-1">{location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
