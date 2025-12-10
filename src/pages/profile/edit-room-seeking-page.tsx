import React, { useState, useEffect } from 'react';
import { Box, Input, Button, Select, Page } from 'zmp-ui';
import { useNavigate, useParams } from 'react-router-dom';
import { UpdateRoomSeekingPostRequest } from '@/services/room-seeking-service';
import { useRoomSeekingPost, useUpdateRoomSeekingPost } from '@/hooks/useRoomSeekingPostsService';
import {
	useProvinces,
	useDistricts,
	useWards,
} from '@/hooks/useLocationService';
import { useAmenities, useAppEnums } from '@/hooks/useReferenceService';
import { ROOM_TYPE_LABELS } from '@/interfaces/basic';
import useSetHeader from '@/hooks/useSetHeader';
import { changeStatusBarColor } from '@/utils/basic';
import { toast } from 'react-hot-toast';

const { Option } = Select;

const EditRoomSeekingPage: React.FC = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const setHeader = useSetHeader();
	
	const { data: post, isLoading: loadingPost } = useRoomSeekingPost(id || '');
	const updateMutation = useUpdateRoomSeekingPost();
	
	const [formData, setFormData] = useState<UpdateRoomSeekingPostRequest>({
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
	});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

	// Load location data
	const { data: provinces } = useProvinces();
	const { data: districts } = useDistricts(
		formData.preferredProvinceId || 0,
		(formData.preferredProvinceId || 0) > 0
	);
	const { data: wards } = useWards(
		formData.preferredDistrictId || 0,
		(formData.preferredDistrictId || 0) > 0
	);

	// Load reference data
	const { data: amenities, isLoading: loadingAmenities } = useAmenities();
	const { data: appEnums } = useAppEnums();

	const roomTypes = appEnums?.roomType || [];

	useEffect(() => {
		setHeader({
			title: 'Sửa bài đăng tìm trọ',
			hasLeftIcon: true,
			type: 'primary',
		});
		changeStatusBarColor('primary');
	}, []);

	useEffect(() => {
		if (post) {
			setFormData({
				title: post.title,
				description: post.description || '',
				preferredProvinceId: post.preferredProvinceId,
				preferredDistrictId: post.preferredDistrictId,
				preferredWardId: post.preferredWardId,
				minBudget: post.minBudget,
				maxBudget: post.maxBudget,
				occupancy: post.occupancy,
				moveInDate: post.moveInDate ? new Date(post.moveInDate).toISOString().split('T')[0] : '',
				currency: post.currency || 'VND',
				preferredRoomType: post.preferredRoomType || 'boarding_house',
			});
			// Load amenities if available
			if (post.amenities && Array.isArray(post.amenities)) {
				setSelectedAmenities(post.amenities.map((a: any) => a.id || a));
			}
		}
	}, [post]);

	const formatEnumLabel = (value: string) => {
		return ROOM_TYPE_LABELS[value.toLowerCase()] || value;
	};

	const handleInputChange = (field: keyof UpdateRoomSeekingPostRequest, value: any) => {
		setFormData((prev) => {
			const newData = { ...prev, [field]: value };
			
			if (field === 'preferredProvinceId') {
				newData.preferredDistrictId = 0;
				newData.preferredWardId = 0;
			} else if (field === 'preferredDistrictId') {
				newData.preferredWardId = 0;
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

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!formData.title?.trim()) {
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
		if (!validateForm() || !id) return;

		try {
			const dataToSubmit = {
				...formData,
				amenityIds: selectedAmenities,
			};
			await updateMutation.mutateAsync({ id, data: dataToSubmit });
			toast.success('Cập nhật bài đăng thành công!');
			navigate('/tenant-posts');
		} catch (error) {
			toast.error('Không thể cập nhật bài đăng. Vui lòng thử lại!');
		}
	};

	if (loadingPost) {
		return (
			<Page className="bg-gray-50">
				<div className="flex justify-center items-center py-12">
					<div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
				</div>
			</Page>
		);
	}

	return (
		<Page className="bg-gray-50">
			<Box className="p-4 space-y-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Tiêu đề <span className="text-red-500">*</span>
					</label>
					<Input
						type="text"
						placeholder="VD: Tìm phòng trọ gần ĐH Bách Khoa"
						value={formData.title}
						onChange={(e) => handleInputChange('title', e.target.value)}
						status={errors.title ? 'error' : undefined}
					/>
					{errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Mô tả
					</label>
					<Input.TextArea
						placeholder="Mô tả chi tiết về yêu cầu của bạn..."
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
						value={formData.preferredProvinceId}
						onChange={(value) => handleInputChange('preferredProvinceId', Number(value))}
					>
						<Option value={0} title="Chọn tỉnh/thành phố" />
						{provinces?.map((province) => (
							<Option key={province.id} value={province.id} title={province.name} />
						))}
					</Select>
					{errors.preferredProvinceId && <p className="text-red-500 text-xs mt-1">{errors.preferredProvinceId}</p>}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Quận/Huyện <span className="text-red-500">*</span>
					</label>
					<Select
						value={formData.preferredDistrictId}
						onChange={(value) => handleInputChange('preferredDistrictId', Number(value))}
						disabled={!formData.preferredProvinceId || formData.preferredProvinceId === 0}
					>
						<Option value={0} title="Chọn quận/huyện" />
						{districts?.map((district) => (
							<Option key={district.id} value={district.id} title={district.name} />
						))}
					</Select>
					{errors.preferredDistrictId && <p className="text-red-500 text-xs mt-1">{errors.preferredDistrictId}</p>}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Phường/Xã <span className="text-red-500">*</span>
					</label>
					<Select
						value={formData.preferredWardId}
						onChange={(value) => handleInputChange('preferredWardId', Number(value))}
						disabled={!formData.preferredDistrictId || formData.preferredDistrictId === 0}
					>
						<Option value={0} title="Chọn phường/xã" />
						{wards?.map((ward) => (
							<Option key={ward.id} value={ward.id} title={ward.name} />
						))}
					</Select>
					{errors.preferredWardId && <p className="text-red-500 text-xs mt-1">{errors.preferredWardId}</p>}
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Giá tối thiểu <span className="text-red-500">*</span>
						</label>
						<Input
							type="number"
							placeholder="VD: 2000000"
							value={formData.minBudget || ''}
							onChange={(e) => handleInputChange('minBudget', Number(e.target.value))}
							status={errors.minBudget ? 'error' : undefined}
						/>
						{errors.minBudget && <p className="text-red-500 text-xs mt-1">{errors.minBudget}</p>}
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Giá tối đa
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
						Loại phòng
					</label>
					<Select
						value={formData.preferredRoomType}
						onChange={(value) => handleInputChange('preferredRoomType', value)}
					>
						{roomTypes.map((type) => (
							<Option key={type} value={type.toLowerCase()} title={formatEnumLabel(type)} />
						))}
					</Select>
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

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Ngày dự kiến chuyển vào
					</label>
					<input
						type="date"
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
						value={formData.moveInDate}
						onChange={(e) => handleInputChange('moveInDate', e.target.value)}
					/>
				</div>

				<div className="mt-6 space-y-3">
					<Button
						fullWidth
						variant="primary"
						onClick={handleSubmit}
						loading={updateMutation.isPending}
					>
						Cập nhật bài đăng
					</Button>
					<Button
						fullWidth
						variant="tertiary"
						onClick={() => navigate('/tenant-posts')}
					>
						Hủy
					</Button>
				</div>
			</Box>
		</Page>
	);
};

export default EditRoomSeekingPage;
