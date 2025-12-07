import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Page, Box, Icon, Input, Button, Select } from "zmp-ui";
import useSetHeader from "@/hooks/useSetHeader";
import { changeStatusBarColor } from "@/utils/basic";
import {
  useBuilding,
  useCreateBuilding,
  useUpdateBuilding,
} from "@/hooks/useBuildingService";
import {
  useProvinces,
  useDistricts,
  useWards,
} from "@/hooks/useLocationService";
import type { CreateBuildingRequest } from "@/services/building-service";
const { Option } = Select;

const BuildingFormPage: React.FC = () => {
  const setHeader = useSetHeader();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<CreateBuildingRequest>({
    name: "",
    addressLine1: "",
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

  // Load location data
  const { data: provinces, isLoading: loadingProvinces } = useProvinces();
  const { data: districts, isLoading: loadingDistricts } = useDistricts(
    formData.provinceId,
    formData.provinceId > 0
  );
  const { data: wards, isLoading: loadingWards } = useWards(
    formData.districtId,
    formData.districtId > 0
  );

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
        addressLine1: building.addressLine1,
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
    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = "Vui lòng nhập địa chỉ";
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
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      
      // Reset dependent fields when parent location changes
      if (field === "provinceId") {
        newData.districtId = 0;
        newData.wardId = undefined;
      } else if (field === "districtId") {
        newData.wardId = undefined;
      }
      
      return newData;
    });
    
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
            value={formData.addressLine1}
            onChange={(e) => handleChange("addressLine1", e.target.value)}
            className={errors.addressLine1 ? "border-red-500" : ""}
          />
          {errors.addressLine1 && (
            <p className="text-xs text-red-500 mt-1">{errors.addressLine1}</p>
          )}
        </div>

        {/* Province ID */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Tỉnh/Thành phố <span className="text-red-500">*</span>
          </label>
          <Select
            closeOnSelect={true}
            placeholder="Chọn tỉnh/thành phố"
            value={formData.provinceId || undefined}
            onChange={(value) => handleChange("provinceId", Number(value))}
            className={errors.provinceId ? "border-red-500" : ""}
            disabled={loadingProvinces}
          >
            {provinces?.map((province) => (
              <Option key={province.id} value={province.id} title={province.name}>
                {province.name}
              </Option>
            ))}
          </Select>
          {errors.provinceId && (
            <p className="text-xs text-red-500 mt-1">{errors.provinceId}</p>
          )}
        </div>

        {/* District ID */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Quận/Huyện <span className="text-red-500">*</span>
          </label>
          <Select
            closeOnSelect={true}
            placeholder="Chọn quận/huyện"
            value={formData.districtId || undefined}
            onChange={(value) => handleChange("districtId", Number(value))}
            className={errors.districtId ? "border-red-500" : ""}
            disabled={!formData.provinceId || loadingDistricts}
          >
            {districts?.map((district) => (
              <Option key={district.id} value={district.id} title={district.name}>
                {district.name}
              </Option>
            ))}
          </Select>
          {errors.districtId && (
            <p className="text-xs text-red-500 mt-1">{errors.districtId}</p>
          )}
        </div>

        {/* Ward ID (Optional) */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Phường/Xã (Tùy chọn)
          </label>
          <Select
            closeOnSelect={true}
            placeholder="Chọn phường/xã"
            value={formData.wardId || undefined}
            onChange={(value) => handleChange("wardId", value ? Number(value) : undefined)}
            disabled={!formData.districtId || loadingWards}
          >
            {wards?.map((ward) => (
              <Option key={ward.id} value={ward.id} title={ward.name}>
                {ward.name}
              </Option>
            ))}
          </Select>
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
