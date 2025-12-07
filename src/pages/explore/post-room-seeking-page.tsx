import React, { useState } from 'react';
import { Box, Input, Button, Select } from 'zmp-ui';
import { useNavigate } from 'react-router-dom';
import { CreateRoomSeekingPostRequest } from '@/services/room-seeking-service';
import { useCreateRoomSeekingPost } from '@/hooks/useRoomSeekingPostsService';
import {
	useProvinces,
	useDistricts,
	useWards,
} from '@/hooks/useLocationService';
import { useAmenities, useAppEnums } from '@/hooks/useReferenceService';
import { ROOM_TYPE_LABELS } from '@/interfaces/basic';

const { Option } = Select;

const PostRoomSeekingPage: React.FC = () => {
	const navigate = useNavigate();
	const createMutation = useCreateRoomSeekingPost();
	const [formData, setFormData] = useState<CreateRoomSeekingPostRequest>({
		title: '',
		description: '',
		preferredProvinceId: 0,
		preferredDistrictId: 0,
		preferredWardId: 0,
		minBudget: 0,
		maxBudget: 0,
		occupancy: 1,
		moveInDate: '',
		currency: 'VND',
		preferredRoomType: 'boarding_house',
		expiresAt: '',
	});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isPublic, setIsPublic] = useState(true);
	const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

	// Load location data
	const { data: provinces, isLoading: loadingProvinces } = useProvinces();
	const { data: districts, isLoading: loadingDistricts } = useDistricts(
		formData.preferredProvinceId,
		formData.preferredProvinceId > 0
	);
	const { data: wards, isLoading: loadingWards } = useWards(
		formData.preferredDistrictId,
		formData.preferredDistrictId > 0
	);

	// Load reference data
	const { data: amenities, isLoading: loadingAmenities } = useAmenities();
	const { data: appEnums, isLoading: loadingEnums } = useAppEnums();

	// Format room types from API response
	const roomTypes = appEnums?.roomType || [];
	const currencies = ['VND', 'USD'];

	// Helper function to format enum values for display
	const formatEnumLabel = (value: string) => {
		return ROOM_TYPE_LABELS[value.toLowerCase()] ? value.toLowerCase() : value;
	};

	const handleInputChange = (field: keyof CreateRoomSeekingPostRequest, value: any) => {
		setFormData((prev) => {
			const newData = { ...prev, [field]: value };
			
			// Reset dependent fields when parent location changes
			if (field === 'preferredProvinceId') {
				newData.preferredDistrictId = 0;
				newData.preferredWardId = 0;
			} else if (field === 'preferredDistrictId') {
				newData.preferredWardId = 0;
			}
			
			return newData;
		});

		// Clear error when user makes changes
		if (errors[field]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[field];
				return newErrors;
			});
		}
	};

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!formData.title.trim()) {
			newErrors.title = 'Vui lòng nhập tiêu đề';
		}
		if (!formData.minBudget || formData.minBudget <= 0) {
			newErrors.minBudget = 'Vui lòng nhập ngân sách tối thiểu';
		}
		if (!formData.preferredProvinceId || formData.preferredProvinceId === 0) {
			newErrors.preferredProvinceId = 'Vui lòng chọn tỉnh/thành phố';
		}
		if (!formData.preferredDistrictId || formData.preferredDistrictId === 0) {
			newErrors.preferredDistrictId = 'Vui lòng chọn quận/huyện';
		}
		if (!formData.preferredWardId || formData.preferredWardId === 0) {
			newErrors.preferredWardId = 'Vui lòng chọn phường/xã';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (!validateForm()) {
			return;
		}

		try {
			// Prepare submission data with all required fields
			const submissionData = {
				...formData,
				moveInDate: formData.moveInDate ? new Date(formData.moveInDate).toISOString() : new Date().toISOString(),
				expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
				isPublic,
				amenityIds: selectedAmenities,
			};
			
			await createMutation.mutateAsync(submissionData);
			alert('Đăng bài tìm chỗ thuê thành công!');
			navigate('/explore');
		} catch (error: any) {
			console.error('Form submission error:', error);
			const errorMessage = error?.response?.data?.message?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
			alert(errorMessage);
		}
	};

	return (
		<Box className="p-4 space-y-4">
				<div className="text-center mb-6">
					<h2 className="text-xl font-bold text-gray-900">Tìm chỗ thuê</h2>
					<p className="text-sm text-gray-500 mt-2">
						Đăng bài tìm phòng trọ, căn hộ phù hợp với nhu cầu của bạn
					</p>
				</div>

				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Tiêu đề <span className="text-red-500">*</span>
						</label>
						<Input
							type="text"
							placeholder="VD: Tìm phòng trọ quận 1, giá dưới 3 triệu"
							value={formData.title}
							onChange={(e) => handleInputChange('title', e.target.value)}
						/>
						{errors.title && (
							<p className="text-xs text-red-500 mt-1">{errors.title}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Mô tả chi tiết
						</label>
						<Input.TextArea
							placeholder="Mô tả nhu cầu tìm phòng của bạn..."
							value={formData.description}
							onChange={(e) => handleInputChange('description', e.target.value)}
							rows={4}
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Tỉnh/Thành phố <span className="text-red-500">*</span>
						</label>
						<Select
                            closeOnSelect={true}
							placeholder="Chọn tỉnh/thành phố"
							value={formData.preferredProvinceId || undefined}
							onChange={(value) => handleInputChange('preferredProvinceId', Number(value))}
							disabled={loadingProvinces}
						>
							{provinces?.map((province) => (
								<Option key={province.id} value={province.id} title={province.name}>
									{province.name}
								</Option>
							))}
						</Select>
						{errors.preferredProvinceId && (
							<p className="text-xs text-red-500 mt-1">{errors.preferredProvinceId}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Quận/Huyện <span className="text-red-500">*</span>
						</label>
						<Select
                            closeOnSelect={true}
							placeholder="Chọn quận/huyện"
							value={formData.preferredDistrictId || undefined}
							onChange={(value) => handleInputChange('preferredDistrictId', Number(value))}
							disabled={!formData.preferredProvinceId || loadingDistricts}
						>
							{districts?.map((district) => (
								<Option key={district.id} value={district.id} title={district.name}>
									{district.name}
								</Option>
							))}
						</Select>
						{errors.preferredDistrictId && (
							<p className="text-xs text-red-500 mt-1">{errors.preferredDistrictId}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Phường/Xã <span className="text-red-500">*</span>
						</label>
						<Select
                            closeOnSelect={true}
							placeholder="Chọn phường/xã"
							value={formData.preferredWardId || undefined}
							onChange={(value) => handleInputChange('preferredWardId', value ? Number(value) : 0)}
							disabled={!formData.preferredDistrictId || loadingWards}
						>
							{wards?.map((ward) => (
								<Option key={ward.id} value={ward.id} title={ward.name}>
									{ward.name}
								</Option>
							))}
						</Select>
						{errors.preferredWardId && (
							<p className="text-xs text-red-500 mt-1">{errors.preferredWardId}</p>
						)}
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Ngân sách từ <span className="text-red-500">*</span>
							</label>
							<Input
								type="number"
								placeholder="VD: 2000000"
								value={formData.minBudget || ''}
								onChange={(e) => handleInputChange('minBudget', Number(e.target.value))}
							/>
							{errors.minBudget && (
								<p className="text-xs text-red-500 mt-1">{errors.minBudget}</p>
							)}
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Đến
							</label>
							<Input
								type="number"
								placeholder="VD: 5000000"
								value={formData.maxBudget || ''}
								onChange={(e) => handleInputChange('maxBudget', Number(e.target.value))}
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Số người ở
						</label>
						<Input
							type="number"
							placeholder="VD: 2"
							value={formData.occupancy || ''}
							onChange={(e) => handleInputChange('occupancy', Number(e.target.value))}
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Ngày dự kiến chuyển vào ở <span className="text-red-500">*</span>
						</label>
						<input
							type="date"
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
							value={formData.moveInDate}
							onChange={(e) => handleInputChange('moveInDate', e.target.value)}
							min={new Date().toISOString().split('T')[0]}
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Ngày hết hạn bài đăng <span className="text-red-500">*</span>
						</label>
						<input
							type="date"
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
							value={formData.expiresAt}
							onChange={(e) => handleInputChange('expiresAt', e.target.value)}
							min={new Date().toISOString().split('T')[0]}
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Đơn vị tiền tệ
						</label>
						<Select
							closeOnSelect={true}
							placeholder="Chọn đơn vị tiền tệ"
							value={formData.currency}
							onChange={(value) => handleInputChange('currency', value)}
						>
							{currencies.map((currency) => (
								<Option key={currency} value={currency} title={currency}>
									{currency}
								</Option>
							))}
						</Select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Loại phòng mong muốn
						</label>
						<Select
							closeOnSelect={true}
							placeholder="Chọn loại phòng"
							value={formData.preferredRoomType}
							onChange={(value) => handleInputChange('preferredRoomType', value)}
							disabled={loadingEnums}
						>
							{roomTypes.map((type: string) => (
								<Option key={type} value={type.toLowerCase()} title={ROOM_TYPE_LABELS[formatEnumLabel(type)]}>
									{ROOM_TYPE_LABELS[formatEnumLabel(type)]}
								</Option>
							))}
						</Select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Tiện nghi mong muốn
						</label>
						<Select
							closeOnSelect={false}
							multiple
							placeholder="Chọn tiện nghi"
							value={selectedAmenities}
							onChange={(value) => setSelectedAmenities(value as string[])}
							disabled={loadingAmenities}
						>
							{amenities?.map((amenity) => (
								<Option key={amenity.id} value={amenity.id} title={amenity.name}>
									{amenity.name}
								</Option>
							))}
						</Select>
					</div>

					<div className="flex items-center space-x-3">
						<label className="relative inline-flex items-center cursor-pointer">
							<input
								type="checkbox"
								checked={isPublic}
								onChange={(e) => setIsPublic(e.target.checked)}
								className="sr-only peer"
							/>
							<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
						</label>
						<span className="text-sm font-medium text-gray-700">Công khai bài đăng</span>
					</div>
				</div>

				<div className="mt-6 space-y-3">
					<Button
						fullWidth
						variant="primary"
						onClick={handleSubmit}
						loading={createMutation.isPending}
						disabled={createMutation.isPending || !formData.title || !formData.minBudget}
					>
						{createMutation.isPending ? 'Đang đăng bài...' : 'Đăng bài'}
					</Button>
					<Button
						fullWidth
						variant="tertiary"
						onClick={() => navigate(-1)}
					>
						Hủy
					</Button>
				</div>
		</Box>
	);
};

export default PostRoomSeekingPage;
