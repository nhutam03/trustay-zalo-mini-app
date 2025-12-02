import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Page, Box, Icon } from "zmp-ui";
import useSetHeader from "@/hooks/useSetHeader";
import { changeStatusBarColor } from "@/utils/basic";
import BottomNav from "@/components/navigate-bottom";
import {
  useRoomManagement,
  useRoomInstancesByStatus,
  useDeleteRoom,
} from "@/hooks/useRoomManagementService";
import { processImageUrl } from "@/utils/image-proxy";
import { ROOM_TYPE_LABELS } from "@/interfaces/basic";
import parse from "html-react-parser";
import { ROOM_INSTANCE_STATUS_LABELS } from "@/interfaces/room-instance-interfaces";

const RoomDetailManagementPage: React.FC = () => {
  const setHeader = useSetHeader();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"all" | "available" | "occupied" | "maintenance" | "reserved" | "unavailable">("all");

  // Fetch room details
  const { data: room, isLoading: roomLoading } = useRoomManagement(id || "");
  
  // Fetch room instances
  const { data: instancesData, isLoading: instancesLoading } = useRoomInstancesByStatus(
    id || "",
    selectedTab === "all" ? undefined : selectedTab
  );

  const deleteRoom = useDeleteRoom();

  useEffect(() => {
    setHeader({
      title: "Quản lý phòng",
      hasLeftIcon: true,
      type: "primary",
    });
    changeStatusBarColor("primary");
  }, []);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteRoom.mutateAsync(id);
      navigate("/rooms", { replace: true });
    } catch (error) {
      console.error("Delete room error:", error);
      alert("Không thể xóa phòng. Vui lòng thử lại.");
    }
  };

  if (roomLoading) {
    return (
      <Page className="bg-gray-50">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </Page>
    );
  }

  if (!room) {
    return (
      <Page className="bg-gray-50">
        <div className="flex flex-col items-center justify-center py-12">
          <Icon icon="zi-close-circle" size={64} className="text-red-500 mb-4" />
          <p className="text-gray-600">Không tìm thấy phòng</p>
        </div>
      </Page>
    );
  }

  return (
    <Page className="bg-gray-50">
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa</h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa loại phòng này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteRoom.isPending}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {deleteRoom.isPending ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Images */}
      {room.images && room.images.length > 0 && (
        <div className="bg-white mb-2">
          <div className="aspect-video overflow-hidden">
            <img
              src={processImageUrl(room.images[0].url)}
              alt={room.name}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}

      {/* Room Info Card */}
      <Box className="bg-white mb-2">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{room.name}</h2>
              <p className="text-2xl font-bold text-primary mb-2">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(room.pricing.basePriceMonthly)}
                <span className="text-sm text-gray-500 font-normal">/tháng</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/rooms/${id}/edit`)}
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center active:opacity-70"
              >
                <Icon icon="zi-edit" size={20} className="text-primary" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center active:opacity-70"
              >
                <Icon icon="zi-delete" size={20} className="text-red-500" />
              </button>
            </div>
          </div>

          {/* Room Details Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Diện tích</p>
              <p className="font-semibold text-gray-900">{room.areaSqm}m²</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Loại phòng</p>
              <p className="font-semibold text-gray-900">{ROOM_TYPE_LABELS[room.roomType]}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Sức chứa</p>
              <p className="font-semibold text-gray-900">{room.maxOccupancy} người</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Tầng</p>
              <p className="font-semibold text-gray-900">{room.floorNumber || "N/A"}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{room.totalRooms}</p>
              <p className="text-xs text-gray-600 mt-1">Tổng phòng</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{room.availableRooms}</p>
              <p className="text-xs text-gray-600 mt-1">Còn trống</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-orange-600">
                {room.totalRooms - room.availableRooms}
              </p>
              <p className="text-xs text-gray-600 mt-1">Đã thuê</p>
            </div>
          </div>

          {/* Description */}
          {room.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Mô tả</h3>
              <p className="text-sm text-gray-700">{parse(room.description)}</p>
            </div>
          )}
        </div>
      </Box>

      {/* Amenities */}
      {room.amenities && room.amenities.length > 0 && (
        <Box className="bg-white mb-2">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Tiện nghi</h3>
            <div className="grid grid-cols-2 gap-2">
              {room.amenities.map((amenity) => (
                <div key={amenity.id} className="flex items-center gap-2 text-sm text-gray-700">
                  <Icon icon="zi-check-circle" size={16} className="text-green-500" />
                  <span>{amenity.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Box>
      )}

      {/* Costs */}
      {room.costs && room.costs.length > 0 && (
        <Box className="bg-white mb-2">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Chi phí phát sinh</h3>
            <div className="space-y-2">
              {room.costs.map((cost) => (
                <div key={cost.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">{cost.name}</span>
                  <span className="font-semibold text-gray-900">{cost.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Box>
      )}

      {/* Room Instances */}
      <Box className="bg-white mb-2">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">
              Danh sách phòng ({instancesData?.data?.instances?.length || 0})
            </h3>
            <button
              onClick={() => navigate(`/rooms/${id}/instances/create`)}
              className="px-3 py-1.5 bg-primary text-white rounded-lg flex items-center gap-1 text-sm active:opacity-70"
            >
              <Icon icon="zi-plus" size={16} />
              Thêm
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto">
            <button
              onClick={() => setSelectedTab("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedTab === "all"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setSelectedTab("available")}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedTab === "available"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Còn trống
            </button>
            <button
              onClick={() => setSelectedTab("occupied")}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedTab === "occupied"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Đã cho thuê
            </button>
            <button
              onClick={() => setSelectedTab("maintenance")}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedTab === "maintenance"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Bảo trì
            </button>
            <button
              onClick={() => setSelectedTab("reserved")}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedTab === "reserved"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Đã đặt trước
            </button>
            <button
              onClick={() => setSelectedTab("unavailable")}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedTab === "unavailable"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Không khả dụng
            </button>
          </div>

          {instancesLoading && (
            <div className="text-center py-8">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-gray-600">Đang tải...</p>
            </div>
          )}

          {!instancesLoading && (instancesData?.data?.instances?.length ?? 0) === 0 && (
            <div className="text-center py-8">
              <Icon icon="zi-home" size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">Chưa có phòng nào</p>
              <button
                onClick={() => navigate(`/rooms/${id}/instances/create`)}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm"
              >
                Thêm phòng đầu tiên
              </button>
            </div>
          )}

          {!instancesLoading && (instancesData?.data?.instances?.length ?? 0) > 0 && (
            <div className="space-y-2">
              {instancesData?.data?.instances?.map((instance) => (
                <div
                  key={instance.id}
                  onClick={() => navigate(`/room-instances/${instance.id}`)}
                  className="border border-gray-200 rounded-lg p-3 active:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">
                          Phòng {instance.roomNumber}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            instance.status === "available"
                              ? "bg-green-50 text-green-600"
                              : instance.status === "occupied"
                              ? "bg-blue-50 text-blue-600"
                              : instance.status === "maintenance"
                              ? "bg-orange-50 text-orange-600"
                              : "bg-gray-50 text-gray-600"
                          }`}
                        >
                          {ROOM_INSTANCE_STATUS_LABELS[instance.status]}
                        </span>
                      </div>
                      {instance.notes && (
                        <p className="text-sm text-gray-600">{instance.notes}</p>
                      )}
                    </div>
                    <Icon icon="zi-chevron-right" size={20} className="text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Box>

      <div className="h-20" />
    </Page>
  );
};

export default RoomDetailManagementPage;
