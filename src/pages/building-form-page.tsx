import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Page, Box, Icon, Input, Button } from "zmp-ui";
import useSetHeader from "@/hooks/useSetHeader";
import { changeStatusBarColor } from "@/utils/basic";
import {
  useBuilding,
  useCreateBuilding,
  useUpdateBuilding,
} from "@/hooks/useBuildingService";
import type { CreateBuildingRequest } from "@/services/building-service";

const BuildingFormPage: React.FC = () => {
  const setHeader = useSetHeader();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<CreateBuildingRequest>({
    name: "",
    address: "",
    provinceId: 0,
    districtId: 0,
    wardId: undefined,
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch building data for edit mode
  const { data: building } = useBuilding(id || "", isEditMode);
  const createBuilding = useCreateBuilding();
  const updateBuilding = useUpdateBuilding();

  useEffect(() => {
    setHeader({
      title: isEditMode ? "Chỉnh sửa tòa nhà" : "Thêm tòa nhà mới",
      hasLeftIcon: true,
      type: "primary",
    });
    changeStatusBarColor("primary");
  }, [isEditMode]);

  useEffect(() => {
    if (building && isEditMode) {
      setFormData({
        name: building.name,
        address: building.address,
        provinceId: building.provinceId,
        districtId: building.districtId,
        wardId: building.wardId,
        description: building.description || "",
      });
    }
  }, [building, isEditMode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập tên tòa nhà";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Vui lòng nhập địa chỉ";
    }
    if (!formData.provinceId || formData.provinceId === 0) {
      newErrors.provinceId = "Vui lòng chọn tỉnh/thành phố";
    }
    if (!formData.districtId || formData.districtId === 0) {
      newErrors.districtId = "Vui lòng chọn quận/huyện";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (isEditMode && id) {
        await updateBuilding.mutateAsync({ id, data: formData });
        navigate(`/buildings/${id}`, { replace: true });
      } else {
        const result = await createBuilding.mutateAsync(formData);
        navigate(`/buildings/${result.id}`, { replace: true });
      }
    } catch (error) {
      console.error("Form submission error:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const handleChange = (field: keyof CreateBuildingRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const isSubmitting = createBuilding.isPending || updateBuilding.isPending;

  return (
    <Page className="bg-gray-50">
      <Box className="bg-white p-4 space-y-4">
        {/* Building Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Tên tòa nhà <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="VD: Nhà trọ ABC"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Địa chỉ <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="VD: 123 Đường ABC"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            className={errors.address ? "border-red-500" : ""}
          />
          {errors.address && (
            <p className="text-xs text-red-500 mt-1">{errors.address}</p>
          )}
        </div>

        {/* Province ID */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Tỉnh/Thành phố <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            placeholder="Nhập mã tỉnh/thành phố"
            value={formData.provinceId || ""}
            onChange={(e) => handleChange("provinceId", parseInt(e.target.value) || 0)}
            className={errors.provinceId ? "border-red-500" : ""}
          />
          {errors.provinceId && (
            <p className="text-xs text-red-500 mt-1">{errors.provinceId}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Nhập mã ID của tỉnh/thành phố (ví dụ: 1 cho Hà Nội, 79 cho TP.HCM)
          </p>
        </div>

        {/* District ID */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Quận/Huyện <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            placeholder="Nhập mã quận/huyện"
            value={formData.districtId || ""}
            onChange={(e) => handleChange("districtId", parseInt(e.target.value) || 0)}
            className={errors.districtId ? "border-red-500" : ""}
          />
          {errors.districtId && (
            <p className="text-xs text-red-500 mt-1">{errors.districtId}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Nhập mã ID của quận/huyện
          </p>
        </div>

        {/* Ward ID (Optional) */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Phường/Xã (Tùy chọn)
          </label>
          <Input
            type="number"
            placeholder="Nhập mã phường/xã"
            value={formData.wardId || ""}
            onChange={(e) => handleChange("wardId", parseInt(e.target.value) || undefined)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Nhập mã ID của phường/xã (không bắt buộc)
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Mô tả (Tùy chọn)
          </label>
          <textarea
            placeholder="Nhập mô tả về tòa nhà..."
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
              : "Tạo tòa nhà"}
          </button>
        </div>
      </Box>

      <div className="h-8" />
    </Page>
  );
};

export default BuildingFormPage;
