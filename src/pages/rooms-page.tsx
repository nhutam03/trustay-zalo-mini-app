import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Box, Icon } from "zmp-ui";
import useSetHeader from "@/hooks/useSetHeader";
import { changeStatusBarColor } from "@/utils/basic";
import BottomNav from "@/components/navigate-bottom";
import { useAuth } from "@/components/providers/auth-provider";
import { useMyRooms } from "@/hooks/useRoomManagementService";
import { processImageUrl } from "@/utils/image-proxy";

const RoomsPage: React.FC = () => {
  const setHeader = useSetHeader();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "available" | "occupied">("all");

  // Fetch rooms của landlord
  const { data: rooms, isLoading } = useMyRooms();

  useEffect(() => {
    setHeader({
      title: "Quản lý phòng",
      hasLeftIcon: true,
      type: "primary",
    });
    changeStatusBarColor("primary");
  }, []);

  // Filter rooms
  const filteredRooms = rooms?.data?.filter((room) => {
    if (filter === "available") return room.availableRooms > 0;
    if (filter === "occupied") return room.availableRooms === 0 && room.totalRooms > 0;
    return true;
  });

  return (
    <Page className="bg-gray-50 has-bottom-nav">
      <Box className="p-4">
        {/* Header với nút thêm phòng */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            Danh sách phòng ({filteredRooms?.length || 0})
          </h2>
          <button
            onClick={() => navigate("/rooms/create")}
            className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 active:opacity-70 transition-opacity"
          >
            <Icon icon="zi-plus" size={18} />
            <span className="text-sm font-medium">Thêm</span>
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === "all"
                ? "bg-primary text-white"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter("available")}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === "available"
                ? "bg-primary text-white"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            Còn trống
          </button>
          <button
            onClick={() => setFilter("occupied")}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === "occupied"
                ? "bg-primary text-white"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            Đã cho thuê
          </button>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && (!filteredRooms || filteredRooms.length === 0) && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Icon icon="zi-home" size={48} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {filter === "all"
                ? "Chưa có phòng nào"
                : filter === "available"
                ? "Không có phòng trống"
                : "Không có phòng đã cho thuê"}
            </h3>
            <p className="text-gray-600 text-center mb-6 px-6">
              {filter === "all"
                ? "Bắt đầu thêm phòng đầu tiên của bạn"
                : "Thử chọn bộ lọc khác"}
            </p>
            {filter === "all" && (
              <button
                onClick={() => navigate("/rooms/create")}
                className="px-6 py-3 bg-primary text-white rounded-lg font-medium active:opacity-70 transition-opacity"
              >
                Thêm phòng
              </button>
            )}
          </div>
        )}

        {/* Rooms list */}
        {!isLoading && filteredRooms && filteredRooms.length > 0 && (
          <div className="space-y-3">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => navigate(`/rooms/${room.id}`)}
                className="bg-white rounded-lg overflow-hidden active:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex gap-3 p-3">
                  {/* Room image */}
                  {room.images && room.images.length > 0 ? (
                    <img
                      src={processImageUrl(room.images[0].url)}
                      alt={room.name}
                      className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes("placeholder")) {
                          target.src = "https://via.placeholder.com/96/f0f0f0/999999?text=Room";
                        }
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Icon icon="zi-home" size={32} className="text-gray-400" />
                    </div>
                  )}

                  {/* Room info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-1 flex-1">
                        {room.name}
                      </h3>
                      <span
                        className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                          room.availableRooms > 0
                            ? "bg-green-50 text-green-600"
                            : room.totalRooms > 0
                            ? "bg-blue-50 text-blue-600"
                            : "bg-gray-50 text-gray-600"
                        }`}
                      >
                        {room.availableRooms > 0
                          ? `${room.availableRooms}/${room.totalRooms} trống`
                          : room.totalRooms > 0
                          ? "Đã đầy"
                          : "Khác"}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                      {room.roomType} • Tầng {room.floorNumber || "N/A"}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-primary font-bold">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(room.basePriceMonthly)}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Icon icon="zi-location" size={14} />
                          {room.areaSqm}m²
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Box>

      <div className="h-20 bg-transparent" />
      <BottomNav />
    </Page>
  );
};

export default RoomsPage;
