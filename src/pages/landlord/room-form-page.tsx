import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Page, Box, Icon, Input, Select, Button } from "zmp-ui";
import useSetHeader from "@/hooks/useSetHeader";
import { changeStatusBarColor } from "@/utils/basic";
import {
  useRoomManagement,
  useCreateRoom,
  useUpdateRoom,
} from "@/hooks/useRoomManagementService";
import type { CreateRoomRequest } from "@/services/room-management-service";
import { useAppEnums, useAmenities, useCostTypes, useRules } from "@/hooks/useReferenceService";
import { uploadBulkImages } from "@/services/upload-service";
import { ROOM_TYPE_LABELS } from "@/interfaces/basic";

const { Option } = Select;

const RoomFormPage: React.FC = () => {
  const setHeader = useSetHeader();
  const navigate = useNavigate();
  const { id: roomId, buildingId: buildingIdFromRoute } = useParams<{ id?: string; buildingId?: string }>();
  const [searchParams] = useSearchParams();
  const buildingIdFromQuery = searchParams.get("buildingId");
  const buildingId = buildingIdFromRoute || buildingIdFromQuery;
  const isEditMode = !!roomId;

  console.log("RoomFormPage - roomId:", roomId, "isEditMode:", isEditMode, "buildingId:", buildingId);

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
    amenities: [],
    costs: [],
    rules: [],
    images: [],
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch room data for edit mode
  const { data: room } = useRoomManagement(roomId || "", isEditMode);
  const { data: appEnums, isLoading: loadingEnums } = useAppEnums();
  const { data: amenitiesData } = useAmenities();
  const { data: costTypesData } = useCostTypes();
  const { data: rulesData } = useRules();
  
  // Format room types from API response
  const roomTypes = appEnums?.roomType || [];
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  // Helper function to format enum values for display
  const formatEnumLabel = (value: string) => {
    return ROOM_TYPE_LABELS[value.toLowerCase()] ? value.toLowerCase() : value;
  };

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
        basePriceMonthly: room.pricing.basePriceMonthly,
        depositAmount: room.pricing.depositAmount || 0,
        floorNumber: room.floorNumber || 1,
        totalRooms: room.totalRooms,
        amenities: room.amenities?.map(a => a.id) || [],
        costs: room.costs?.map(c => ({
          costTypeId: c.id,
          costType: 'fixed' as const,
          value: Number(c.value),
          unit: '',
          notes: ""
        })) || [],
        rules: room.rules?.map(r => r.id) || [],
        images: room.images?.map(img => ({
          url: img.url,
          alt: img.alt || "",
          isPrimary: img.isPrimary || false
        })) || [],
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

    console.log("Validation errors:", newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log("handleSubmit called");
    console.log("Form data:", formData);
    
    if (!validateForm()) {
      console.log("Validation failed");
      return;
    }

    console.log("Validation passed, starting submission");

    try {
      const { buildingId: bId, basePriceMonthly, depositAmount, amenities, costs, rules, ...restRoomData } = formData;
      
      console.log("Building ID:", bId);
      
      // Upload images if any selected
      let uploadedImages: Array<{ url: string; alt: string; isPrimary: boolean }> = [];
      if (selectedImages.length > 0) {
        console.log("Uploading images:", selectedImages.length);
        const altTexts = selectedImages.map((_, index) => `Room image ${index + 1}`);
        const uploadResult = await uploadBulkImages(selectedImages, altTexts);
        uploadedImages = uploadResult.results.map((img, index) => ({
          url: img.imagePath,
          alt: `Room image ${index + 1}`,
          isPrimary: index === 0
        }));
        console.log("Images uploaded:", uploadedImages);
      }
      
      // Transform data based on mode (CREATE vs UPDATE have different requirements)
      if (isEditMode && roomId) {
        // UPDATE - exclude maxOccupancy, floorNumber, utilityIncluded, isEnforced
        const updateData: any = {
          name: restRoomData.name,
          description: restRoomData.description,
          roomType: restRoomData.roomType,
          areaSqm: restRoomData.areaSqm,
          totalRooms: restRoomData.totalRooms,
          pricing: {
            basePriceMonthly,
            depositAmount,
            depositMonths: 2,
            // utilityIncluded NOT allowed in UPDATE
          },
          amenities: amenities?.map(id => ({
            systemAmenityId: id,
            customValue: "",
            notes: ""
          })) || [],
          costs: costs?.map(cost => ({
            systemCostTypeId: cost.costTypeId,
            value: cost.value,
            costType: cost.costType,
            unit: cost.unit,
            notes: cost.notes
          })) || [],
          rules: rules?.map(id => ({
            systemRuleId: id,
            // isEnforced NOT allowed in UPDATE
            notes: ""
          })) || [],
        };
        
        if (uploadedImages.length > 0) {
          // UPDATE uses 'path' instead of 'url'
          updateData.images = { 
            images: uploadedImages.map((img, index) => ({
              path: img.url,
              alt: img.alt,
              isPrimary: img.isPrimary,
              sortOrder: index
            }))
          };
        }
        
        console.log("UPDATE payload:", updateData);
        await updateRoom.mutateAsync({ id: roomId, data: updateData });
        navigate(`/rooms/${roomId}/manage`, { replace: true });
      } else {
        // CREATE - includes all fields
        const createData: any = {
          name: restRoomData.name,
          description: restRoomData.description,
          roomType: restRoomData.roomType,
          areaSqm: restRoomData.areaSqm,
          maxOccupancy: restRoomData.maxOccupancy,
          floorNumber: restRoomData.floorNumber,
          totalRooms: restRoomData.totalRooms,
          pricing: {
            basePriceMonthly,
            depositAmount,
            depositMonths: 2,
            utilityIncluded: false,
          },
          amenities: amenities?.map(id => ({
            systemAmenityId: id,
            customValue: "",
            notes: ""
          })) || [],
          costs: costs?.map(cost => ({
            systemCostTypeId: cost.costTypeId,
            value: cost.value,
            costType: cost.costType,
            unit: cost.unit,
            notes: cost.notes
          })) || [],
          rules: rules?.map(id => ({
            systemRuleId: id,
            isEnforced: true,
            notes: ""
          })) || [],
        };
        
        if (uploadedImages.length > 0) {
          createData.images = { images: uploadedImages };
        }
        
        console.log("CREATE payload:", createData);
        const result = await createRoom.mutateAsync({ 
          buildingId: bId, 
          data: createData 
        });
        console.log("Room created:", result);
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

  const handleAmenityToggle = (amenityId: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities?.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...(prev.amenities || []), amenityId]
    }));
  };

  const handleRuleToggle = (ruleId: string) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules?.includes(ruleId)
        ? prev.rules.filter(id => id !== ruleId)
        : [...(prev.rules || []), ruleId]
    }));
  };

  const handleAddCost = () => {
    setFormData(prev => ({
      ...prev,
      costs: [...(prev.costs || []), { costTypeId: '', costType: 'fixed', value: 0, unit: '', notes: '' }]
    }));
  };

  const handleRemoveCost = (index: number) => {
    setFormData(prev => ({
      ...prev,
      costs: prev.costs?.filter((_, i) => i !== index) || []
    }));
  };

  const handleCostChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      costs: prev.costs?.map((cost, i) => 
        i === index ? { ...cost, [field]: value } : cost
      ) || []
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages(prev => [...prev, ...files]);
    
    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrls(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
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
          {/* <Input
            type="text"
            placeholder="VD: Phòng đơn, Phòng đôi"
            value={formData.roomType}
            onChange={(e) => handleChange("roomType", e.target.value)}
            className={errors.roomType ? "border-red-500" : ""}
          /> */}
          <Select
							closeOnSelect={true}
							placeholder="Chọn loại phòng"
							value={formData.roomType}
							onChange={(value) => handleChange('roomType', value)}
							disabled={loadingEnums}
						>
							{roomTypes.map((type: string) => (
								<Option key={type} value={type.toLowerCase()} title={ROOM_TYPE_LABELS[formatEnumLabel(type)]}>
									{ROOM_TYPE_LABELS[formatEnumLabel(type)]}
								</Option>
							))}
						</Select>
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

        {/* Amenities */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Tiện ích
          </label>
          <div className="grid grid-cols-2 gap-2">
            {amenitiesData?.map((amenity) => (
              <label
                key={amenity.id}
                className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={formData.amenities?.includes(amenity.id) || false}
                  onChange={() => handleAmenityToggle(amenity.id)}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm">{amenity.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Costs */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-semibold text-gray-900">
              Chi phí phụ trội
            </label>
            <button
              type="button"
              onClick={handleAddCost}
              className="text-sm text-primary font-medium"
            >
              + Thêm chi phí
            </button>
          </div>
          <div className="space-y-3">
            {formData.costs?.map((cost, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Chi phí #{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCost(index)}
                    className="text-red-500 text-sm"
                  >
                    Xóa
                  </button>
                </div>
                <Select
                  placeholder="Chọn loại chi phí"
                  value={cost.costTypeId}
                  onChange={(value) => handleCostChange(index, 'costTypeId', value)}
                >
                  {costTypesData?.map((type) => (
                    <Option key={type.id} value={type.id} title={type.name}>
                      {type.name}
                    </Option>
                  ))}
                </Select>
                <Select
                  placeholder="Chọn kiểu tính phí"
                  value={cost.costType}
                  onChange={(value) => handleCostChange(index, 'costType', value)}
                >
                  <Option value="fixed" title="Cố định">
                    Cố định
                  </Option>
                  <Option value="per_person" title="Theo người">
                    Theo người
                  </Option>
                  <Option value="metered" title="Theo đồng hồ">
                    Theo đồng hồ
                  </Option>
                </Select>
                <Input
                  type="number"
                  placeholder="Giá trị"
                  value={cost.value || ""}
                  onChange={(e) => handleCostChange(index, 'value', parseFloat(e.target.value) || 0)}
                />
                <Input
                  type="text"
                  placeholder="Đơn vị (VD: kWh, m³)"
                  value={cost.unit || ""}
                  onChange={(e) => handleCostChange(index, 'unit', e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Rules */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Nội quy
          </label>
          <div className="space-y-2">
            {rulesData?.map((rule) => (
              <label
                key={rule.id}
                className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={formData.rules?.includes(rule.id) || false}
                  onChange={() => handleRuleToggle(rule.id)}
                  className="w-4 h-4 text-primary"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">{rule.name}</div>
                  {rule.description && (
                    <div className="text-xs text-gray-500">{rule.description}</div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Hình ảnh phòng
          </label>
          <div className="space-y-3">
            {/* Image Preview Grid */}
            {imagePreviewUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                    >
                      ×
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-1 left-1 bg-primary text-white text-xs px-2 py-1 rounded">
                        Ảnh chính
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Upload Button */}
            <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <div className="text-center">
                <Icon icon="zi-photo" className="text-2xl text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Chọn hình ảnh</p>
                <p className="text-xs text-gray-400 mt-1">Ảnh đầu tiên sẽ là ảnh chính</p>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          </div>
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
