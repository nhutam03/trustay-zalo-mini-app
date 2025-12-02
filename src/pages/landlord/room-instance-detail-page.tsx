import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Page, Box, Icon } from "zmp-ui";
import useSetHeader from "@/hooks/useSetHeader";
import { changeStatusBarColor } from "@/utils/basic";
import { useUpdateRoomInstanceStatus } from "@/hooks/useRoomManagementService";

// Mock data - should be replaced with actual API call
const getRoomInstanceDetail = async (id: string) => {
  // This is a placeholder - you should implement the actual API call
  return {
    id,
    roomNumber: "101",
    status: "available" as const,
    floorNumber: 1,
    notes: "Phòng góc, view đẹp",
    room: {
      id: "room-1",
      name: "Phòng đơn tiêu chuẩn",
      roomType: "Phòng đơn",
      areaSqm: 25,
      basePriceMonthly: 3000000,
    },
  };
};

const RoomInstanceDetailPage: React.FC = () => {
  const setHeader = useSetHeader();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [instance, setInstance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [statusNotes, setStatusNotes] = useState("");

  const updateStatus = useUpdateRoomInstanceStatus();

  useEffect(() => {
    setHeader({
      title: "Chi tiết phòng",
      hasLeftIcon: true,
      type: "primary",
    });
    changeStatusBarColor("primary");
  }, []);

  useEffect(() => {
    const loadInstance = async () => {
      if (!id) return;
      try {
        const data = await getRoomInstanceDetail(id);
        setInstance(data);
        setSelectedStatus(data.status);
        setStatusNotes(data.notes || "");
      } catch (error) {
        console.error("Error loading room instance:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInstance();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!id) return;
    try {
      await updateStatus.mutateAsync({
        instanceId: id,
        data: {
          status: selectedStatus as any,
          notes: statusNotes,
        },
      });
      setShowStatusModal(false);
      // Reload instance data
      const data = await getRoomInstanceDetail(id);
      setInstance(data);
    } catch (error) {
      console.error("Update status error:", error);
      alert("Không thể cập nhật trạng thái. Vui lòng thử lại.");
    }
  };

  if (isLoading) {
    return (
      <Page className="bg-gray-50">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </Page>
    );
  }

  if (!instance) {
    return (
      <Page className="bg-gray-50">
        <div className="flex flex-col items-center justify-center py-12">
          <Icon icon="zi-close-circle" size={64} className="text-red-500 mb-4" />
          <p className="text-gray-600">Không tìm thấy phòng</p>
        </div>
      </Page>
    );
  }

  const statusOptions = [
    { value: "available", label: "Còn trống", color: "green" },
    { value: "occupied", label: "Đã cho thuê", color: "blue" },
    { value: "maintenance", label: "Bảo trì", color: "orange" },
    { value: "reserved", label: "Đã đặt cọc", color: "purple" },
    { value: "unavailable", label: "Không khả dụng", color: "gray" },
  ];

  const currentStatusOption = statusOptions.find((s) => s.value === instance.status);

  return (
    <Page className="bg-gray-50">
      {/* Status update modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Cập nhật trạng thái</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Trạng thái
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Ghi chú
              </label>
              <textarea
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                rows={3}
                placeholder="Nhập ghi chú (tùy chọn)..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                disabled={updateStatus.isPending}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={updateStatus.isPending}
                className="flex-1 py-2 bg-primary text-white rounded-lg font-medium disabled:opacity-50"
              >
                {updateStatus.isPending ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Instance Info */}
      <Box className="bg-white mb-2">
        <div className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Phòng {instance.roomNumber}
              </h2>
              <p className="text-gray-600 mb-3">{instance.room?.name}</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium bg-${currentStatusOption?.color}-50 text-${currentStatusOption?.color}-600`}
              >
                {currentStatusOption?.label}
              </span>
            </div>
            <button
              onClick={() => setShowStatusModal(true)}
              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center active:opacity-70"
            >
              <Icon icon="zi-edit" size={20} className="text-primary" />
            </button>
          </div>

          {instance.notes && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm font-semibold text-gray-900 mb-1">Ghi chú</p>
              <p className="text-sm text-gray-700">{instance.notes}</p>
            </div>
          )}

          {/* Room Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Loại phòng</p>
              <p className="font-semibold text-gray-900">{instance.room?.roomType}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Diện tích</p>
              <p className="font-semibold text-gray-900">{instance.room?.areaSqm}m²</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Tầng</p>
              <p className="font-semibold text-gray-900">{instance.floorNumber}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Giá thuê</p>
              <p className="font-semibold text-primary">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(instance.room?.basePriceMonthly || 0)}
              </p>
            </div>
          </div>
        </div>
      </Box>

      {/* Quick Actions */}
      <Box className="bg-white mb-2">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Thao tác nhanh</h3>
          <div className="space-y-2">
            <button
              onClick={() => navigate(`/room-instances/${id}/tenant`)}
              className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg active:bg-gray-100"
            >
              <Icon icon="zi-user" size={24} className="text-primary" />
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">Thông tin người thuê</p>
                <p className="text-xs text-gray-600">Xem chi tiết người thuê phòng</p>
              </div>
              <Icon icon="zi-chevron-right" size={20} className="text-gray-400" />
            </button>

            <button
              onClick={() => navigate(`/room-instances/${id}/contract`)}
              className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg active:bg-gray-100"
            >
              <Icon icon="zi-note" size={24} className="text-primary" />
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">Hợp đồng thuê</p>
                <p className="text-xs text-gray-600">Xem và quản lý hợp đồng</p>
              </div>
              <Icon icon="zi-chevron-right" size={20} className="text-gray-400" />
            </button>

            <button
              onClick={() => navigate(`/room-instances/${id}/bills`)}
              className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg active:bg-gray-100"
            >
              <Icon icon="zi-poll" size={24} className="text-primary" />
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">Hóa đơn</p>
                <p className="text-xs text-gray-600">Lịch sử hóa đơn thanh toán</p>
              </div>
              <Icon icon="zi-chevron-right" size={20} className="text-gray-400" />
            </button>
          </div>
        </div>
      </Box>

      <div className="h-20" />
    </Page>
  );
};

export default RoomInstanceDetailPage;
