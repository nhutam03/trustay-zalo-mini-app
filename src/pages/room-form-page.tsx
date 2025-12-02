import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Page, Box, Icon, Input } from "zmp-ui";
import useSetHeader from "@/hooks/useSetHeader";
import { changeStatusBarColor } from "@/utils/basic";
import {
  useRoomManagement,
  useCreateRoom,
  useUpdateRoom,
} from "@/hooks/useRoomManagementService";
import type { CreateRoomRequest } from "@/services/room-management-service";

const RoomFormPage: React.FC = () => {
  const setHeader = useSetHeader();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const buildingId = searchParams.get("buildingId");
  const isEditMode = !!id;

  const [formData, setFormData] = useState<CreateRoomRequest & { buildingId: string }>({
    buildingId: buildingId || "",
    name: "",
    description: "",
    roomType: "",
    areaSqm: 0,
    maxOccupancy: 1,
    basePriceMonthly: 0,
    depositAmount: 0,
    floorNumber: 1,
    totalRooms: 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch room data for edit mode
  const { data: room } = useRoomManagement(id || "", isEditMode);
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();

  useEffect(() => {
    setHeader({
      title: isEditMode ? "Chỉnh sửa phòng" : "Thêm phòng mới",
      hasLeftIcon: true,
      type: "primary",
    });
    changeStatusBarColor("primary");
  }, [isEditMode]);

  useEffect(() => {
    if (room && isEditMode) {
      setFormData({
        buildingId: room.buildingId,
        name: room.name,
        description: room.description || "",
        roomType: room.roomType,
        areaSqm: room.areaSqm,
        maxOccupancy: room.maxOccupancy,
        basePriceMonthly: room.basePriceMonthly,
        depositAmount: room.depositAmount || 0,
        floorNumber: room.floorNumber || 1,
        totalRooms: room.totalRooms,
      });
    }
  }, [room, isEditMode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.buildingId) {
      newErrors.buildingId = "Vui lòng chọn tòa nhà";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập tên phòng";
    }
    if (!formData.roomType.trim()) {
      newErrors.roomType = "Vui lòng nhập loại phòng";
    }
    if (!formData.areaSqm || formData.areaSqm <= 0) {
      newErrors.areaSqm = "Diện tích phải lớn hơn 0";
    }
    if (!formData.maxOccupancy || formData.maxOccupancy <= 0) {
      newErrors.maxOccupancy = "Sức chứa phải lớn hơn 0";
    }
    if (!formData.basePriceMonthly || formData.basePriceMonthly <= 0) {
      newErrors.basePriceMonthly = "Giá thuê phải lớn hơn 0";
    }
    if (!formData.totalRooms || formData.totalRooms <= 0) {
      newErrors.totalRooms = "Số lượng phòng phải lớn hơn 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const { buildingId: bId, ...roomData } = formData;
      
      if (isEditMode && id) {
        await updateRoom.mutateAsync({ id, data: roomData });
        navigate(`/rooms/${id}/manage`, { replace: true });
      } else {
        const result = await createRoom.mutateAsync({ 
          buildingId: bId, 
          data: roomData 
        });
        navigate(`/rooms/${result.id}/manage`, { replace: true });
      }
    } catch (error) {
      console.error("Form submission error:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const isSubmitting = createRoom.isPending || updateRoom.isPending;

  return (
    <Page className="bg-gray-50">
      <Box className="bg-white p-4 space-y-4">
        {/* Building ID (only for create mode) */}
        {!isEditMode && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Mã tòa nhà <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Nhập mã tòa nhà"
              value={formData.buildingId}
              onChange={(e) => handleChange("buildingId", e.target.value)}
              className={errors.buildingId ? "border-red-500" : ""}
              disabled={!!buildingId}
            />
            {errors.buildingId && (
              <p className="text-xs text-red-500 mt-1">{errors.buildingId}</p>
            )}
          </div>
        )}

        {/* Room Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Tên phòng <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="VD: Phòng đơn tiêu chuẩn"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Room Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Loại phòng <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="VD: Phòng đơn, Phòng đôi"
            value={formData.roomType}
            onChange={(e) => handleChange("roomType", e.target.value)}
            className={errors.roomType ? "border-red-500" : ""}
          />
          {errors.roomType && (
            <p className="text-xs text-red-500 mt-1">{errors.roomType}</p>
          )}
        </div>

        {/* Area */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Diện tích (m²) <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            placeholder="VD: 25"
            value={formData.areaSqm || ""}
            onChange={(e) => handleChange("areaSqm", parseFloat(e.target.value) || 0)}
            className={errors.areaSqm ? "border-red-500" : ""}
          />
          {errors.areaSqm && (
            <p className="text-xs text-red-500 mt-1">{errors.areaSqm}</p>
          )}
        </div>

        {/* Max Occupancy */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Sức chứa (người) <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            placeholder="VD: 2"
            value={formData.maxOccupancy || ""}
            onChange={(e) => handleChange("maxOccupancy", parseInt(e.target.value) || 0)}
            className={errors.maxOccupancy ? "border-red-500" : ""}
          />
          {errors.maxOccupancy && (
            <p className="text-xs text-red-500 mt-1">{errors.maxOccupancy}</p>
          )}
        </div>

        {/* Base Price */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Giá thuê (VNĐ/tháng) <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            placeholder="VD: 3000000"
            value={formData.basePriceMonthly || ""}
            onChange={(e) => handleChange("basePriceMonthly", parseInt(e.target.value) || 0)}
            className={errors.basePriceMonthly ? "border-red-500" : ""}
          />
          {errors.basePriceMonthly && (
            <p className="text-xs text-red-500 mt-1">{errors.basePriceMonthly}</p>
          )}
        </div>

        {/* Deposit */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Tiền cọc (VNĐ)
          </label>
          <Input
            type="number"
            placeholder="VD: 3000000"
            value={formData.depositAmount || ""}
            onChange={(e) => handleChange("depositAmount", parseInt(e.target.value) || 0)}
          />
        </div>

        {/* Floor Number */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Tầng
          </label>
          <Input
            type="number"
            placeholder="VD: 2"
            value={formData.floorNumber || ""}
            onChange={(e) => handleChange("floorNumber", parseInt(e.target.value) || 1)}
          />
        </div>

        {/* Total Rooms */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Số lượng phòng <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            placeholder="VD: 5"
            value={formData.totalRooms || ""}
            onChange={(e) => handleChange("totalRooms", parseInt(e.target.value) || 0)}
            className={errors.totalRooms ? "border-red-500" : ""}
          />
          {errors.totalRooms && (
            <p className="text-xs text-red-500 mt-1">{errors.totalRooms}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Tổng số phòng cùng loại này trong tòa nhà
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Mô tả
          </label>
          <textarea
            placeholder="Nhập mô tả về phòng..."
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
            className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg active:opacity-70 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-primary text-white font-medium rounded-lg active:opacity-70 disabled:opacity-50"
          >
            {isSubmitting
              ? "Đang xử lý..."
              : isEditMode
              ? "Cập nhật"
              : "Tạo phòng"}
          </button>
        </div>
      </Box>

      <div className="h-8" />
    </Page>
  );
};

export default RoomFormPage;
