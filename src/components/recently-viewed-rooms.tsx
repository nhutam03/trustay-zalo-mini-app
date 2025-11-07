import React from "react";
import { Box, Icon } from "zmp-ui";
import { useRecentlyViewedRooms } from "@/hooks/useRoomQuery";
import RoomCard from "./room-card";
import { RoomDetail } from "@/services/room";
import { RoomCardProps } from "@/interfaces/basic";

const RecentlyViewedRooms: React.FC = () => {
  const { data: recentlyViewed = [], isLoading } = useRecentlyViewedRooms();

  if (isLoading || recentlyViewed.length === 0) {
    return null;
  }

  // Convert RoomDetail to RoomCardProps
  const roomCards: RoomCardProps[] = recentlyViewed.map((room: RoomDetail) => ({
    id: room.id,
    title: room.name,
    price: parseInt(room.pricing.basePriceMonthly),
    area: room.area,
    location: `${room.location.districtName}, ${room.location.provinceName}`,
    image: room.images[0]?.url || "/placeholder.jpg",
    verified: room.isVerified,
  }));

  return (
    <Box className="pb-4">
      <div className="flex items-center justify-between mb-3 px-4">
        <div className="flex items-center gap-2">
          <Icon icon="zi-clock-1" size={20} className="text-primary" />
          <h2 className="text-base font-semibold text-gray-900">
            Đã xem gần đây
          </h2>
        </div>
        <span className="text-xs text-gray-500">
          {recentlyViewed.length} phòng
        </span>
      </div>

      <div className="overflow-x-auto hide-scrollbar">
        <div className="flex gap-3 px-4">
          {roomCards.slice(0, 5).map((room) => (
            <div key={room.id} className="flex-shrink-0 w-64">
              <RoomCard {...room} />
            </div>
          ))}
        </div>
      </div>
    </Box>
  );
};

export default RecentlyViewedRooms;
