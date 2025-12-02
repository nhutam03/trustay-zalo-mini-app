import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Page, Box, Icon, Button } from "zmp-ui";
import useSetHeader from "@/hooks/useSetHeader";
import { changeStatusBarColor } from "@/utils/basic";
import BottomNav from "@/components/navigate-bottom";
import parse from "html-react-parser";
import { useBuilding, useDeleteBuilding } from "@/hooks/useBuildingService";
import { useRoomsByBuilding } from "@/hooks/useRoomManagementService";
import { processImageUrl } from "@/utils/image-proxy";
import { ROOM_TYPE_LABELS } from "@/interfaces/basic";

const BuildingDetailPage: React.FC = () => {
  const setHeader = useSetHeader();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch building details
  const { data: building, isLoading: buildingLoading } = useBuilding(id || "");
  
  // Fetch rooms in this building
  const { data: roomsData, isLoading: roomsLoading } = useRoomsByBuilding(
    id || "",
    { page: 1, limit: 100 }
  );

  const deleteBuilding = useDeleteBuilding();

  useEffect(() => {
    setHeader({
      title: "Chi tiết tòa nhà",
      hasLeftIcon: true,
      type: "primary",
    });
    changeStatusBarColor("primary");
  }, []);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteBuilding.mutateAsync(id);
      navigate("/buildings", { replace: true });
    } catch (error) {
      console.error("Delete building error:", error);
      alert("Không thể xóa tòa nhà. Vui lòng thử lại.");
    }
  };

  if (buildingLoading) {
    return (
      <Page className="bg-gray-50">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </Page>
    );
  }

  if (!building) {
    return (
      <Page className="bg-gray-50">
        <div className="flex flex-col items-center justify-center py-12">
          <Icon icon="zi-close-circle" size={64} className="text-red-500 mb-4" />
          <p className="text-gray-600">Không tìm thấy tòa nhà</p>
        </div>
      </Page>
    );
  }

  const rooms = roomsData?.rooms || [];

  return (
    <Page className="bg-gray-50">
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa</h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa tòa nhà này? Hành động này không thể hoàn tác.
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
                disabled={deleteBuilding.isPending}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {deleteBuilding.isPending ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Building Info Card */}
      <Box className="bg-white mb-2">
        <div className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{building.name}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Icon icon="zi-location" size={16} />
                <span>{building.addressLine1}</span>
              </div>
              {building.location && (
                <p className="text-sm text-gray-500">
                  {building.location.wardName && `${building.location.wardName}, `}
                  {building.location.districtName}, {building.location.provinceName}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/buildings/${id}/edit`)}
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

          {building.description && (
            <div className="mb-4">
              <p className="text-sm text-gray-700">{parse(building.description)}</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{building.roomCount}</p>
              <p className="text-xs text-gray-600 mt-1">Tổng loại phòng</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600">
                {building.totalRoomInstances - building.occupiedRoomInstances}
              </p>
              <p className="text-xs text-gray-600 mt-1">Phòng trống</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-orange-600">
                {building.occupiedRoomInstances}
              </p>
              <p className="text-xs text-gray-600 mt-1">Đã cho thuê</p>
            </div>
          </div>

          {/* Status badges */}
          <div className="flex gap-2 mt-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                building.isActive
                  ? "bg-green-50 text-green-600"
                  : "bg-gray-50 text-gray-600"
              }`}
            >
              {building.isActive ? "Đang hoạt động" : "Tạm ngưng"}
            </span>
            {building.isVerified && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                ✓ Đã xác minh
              </span>
            )}
          </div>
        </div>
      </Box>

      {/* Owner Info */}
      {building.owner && (
        <Box className="bg-white mb-2">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Chủ sở hữu</h3>
            <div className="flex items-center gap-3">
              {building.owner.avatarUrl ? (
                <img
                  src={processImageUrl(building.owner.avatarUrl)}
                  alt={`${building.owner.firstName} ${building.owner.lastName}`}
                  className="w-12 h-12 rounded-full object-cover"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                  {building.owner.firstName?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {building.owner.firstName} {building.owner.lastName}
                </p>
              </div>
            </div>
          </div>
        </Box>
      )}

      {/* Rooms List */}
      <Box className="bg-white mb-2">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">
              Danh sách phòng ({roomsData?.total || 0})
            </h3>
            <button
              onClick={() => navigate(`/buildings/${id}/rooms/create`)}
              className="px-3 py-1.5 bg-primary text-white rounded-lg flex items-center gap-1 text-sm active:opacity-70"
            >
              <Icon icon="zi-plus" size={16} />
              Thêm phòng
            </button>
          </div>

          {roomsLoading && (
            <div className="text-center py-8">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-gray-600">Đang tải phòng...</p>
            </div>
          )}

          {!roomsLoading && roomsData?.total === 0 && (
            <div className="text-center py-8">
              <Icon icon="zi-home" size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">Chưa có phòng nào</p>
              <button
                onClick={() => navigate(`/buildings/${id}/rooms/create`)}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm"
              >
                Thêm phòng đầu tiên
              </button>
            </div>
          )}

          {!roomsLoading && (roomsData?.rooms?.length ?? 0) > 0 && (
            <div className="space-y-3">
              {roomsData?.rooms?.map((room) => (
                <div
                  key={room.id}
                  onClick={() => navigate(`/rooms/${room.id}/manage`)}
                  className="border border-gray-200 rounded-lg p-3 active:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    {room.images && room.images.length > 0 ? (
                      <img
                        src={processImageUrl(room.images[0].url)}
                        alt={room.name}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Icon icon="zi-home" size={24} className="text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1">{room.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {ROOM_TYPE_LABELS[room.roomType]} • {room.areaSqm}m²
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-primary font-bold text-sm">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(room.pricing.basePriceMonthly)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {room.availableRooms}/{room.totalRooms} trống
                        </span>
                      </div>
                    </div>
                    <Icon icon="zi-chevron-right" size={20} className="text-gray-400 flex-shrink-0" />
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

export default BuildingDetailPage;
