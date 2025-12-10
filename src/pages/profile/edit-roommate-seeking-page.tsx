import React, { useState, useEffect } from 'react';
import { Box, Input, Button, Select, Page } from 'zmp-ui';
import { useNavigate, useParams } from 'react-router-dom';
import { useRoommateSeekingPost, useUpdateRoommateSeekingPost } from '@/hooks/useRoommateSeekingPostsService';
import type { UpdateRoommateSeekingPostRequest } from '@/services/roommate-seeking-posts-service';
import useSetHeader from '@/hooks/useSetHeader';
import { changeStatusBarColor } from '@/utils/basic';
import { toast } from 'react-hot-toast';

const { Option } = Select;

const EditRoommateSeekingPage: React.FC = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const setHeader = useSetHeader();
	
	const { data: post, isLoading: loadingPost } = useRoommateSeekingPost(id || '');
	const updateMutation = useUpdateRoommateSeekingPost();
	
	const [formData, setFormData] = useState<UpdateRoommateSeekingPostRequest>({
		title: '',
		description: '',
		monthlyRent: 0,
		depositAmount: 0,
		seekingCount: 1,
		maxOccupancy: 2,
		currentOccupancy: 1,
		preferredGender: 'other',
		availableFromDate: '',
	});

	useEffect(() => {
		setHeader({
			title: 'Sửa bài tìm bạn cùng phòng',
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
				monthlyRent: post.monthlyRent,
				depositAmount: post.depositAmount,
				seekingCount: post.seekingCount,
				maxOccupancy: post.maxOccupancy,
				currentOccupancy: post.currentOccupancy,
				preferredGender: post.preferredGender || 'other',
				availableFromDate: post.availableFromDate ? new Date(post.availableFromDate).toISOString().split('T')[0] : '',
				externalAddress: post.externalAddress,
				additionalRequirements: post.additionalRequirements,
			});
		}
	}, [post]);	const handleInputChange = (field: keyof UpdateRoommateSeekingPostRequest, value: any) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSubmit = async () => {
		if (!id) return;

		try {
			await updateMutation.mutateAsync({ id, data: formData });
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
						placeholder="VD: Tìm 1 bạn nữ ở ghép, gần ĐH Bách Khoa"
						value={formData.title}
						onChange={(e) => handleInputChange('title', e.target.value)}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Mô tả chi tiết
					</label>
					<Input.TextArea
						placeholder="Mô tả về phòng, yêu cầu với bạn cùng phòng..."
						value={formData.description}
						onChange={(e) => handleInputChange('description', e.target.value)}
						rows={4}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Địa chỉ
					</label>
					<Input
						type="text"
						placeholder="Nhập địa chỉ phòng trọ"
						value={formData.externalAddress || ''}
						onChange={(e) => handleInputChange('externalAddress', e.target.value)}
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Tiền phòng/tháng <span className="text-red-500">*</span>
						</label>
						<Input
							type="number"
							placeholder="VD: 3000000"
							value={formData.monthlyRent || ''}
							onChange={(e) => handleInputChange('monthlyRent', Number(e.target.value))}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Tiền cọc
						</label>
						<Input
							type="number"
							placeholder="VD: 3000000"
							value={formData.depositAmount || ''}
							onChange={(e) => handleInputChange('depositAmount', Number(e.target.value))}
						/>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Cần tìm (người)
						</label>
						<Input
							type="number"
							placeholder="VD: 1"
							value={formData.seekingCount || ''}
							onChange={(e) => handleInputChange('seekingCount', Number(e.target.value))}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Giới tính ưu tiên
						</label>
						<Select
							value={formData.preferredGender}
							onChange={(value) => handleInputChange('preferredGender', value)}
						>
							<Option value="other" title="Không yêu cầu" />
							<Option value="male" title="Nam" />
							<Option value="female" title="Nữ" />
						</Select>
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Ngày có thể vào ở
					</label>
					<Input
						type="text"
						placeholder="YYYY-MM-DD"
						value={formData.availableFromDate}
						onChange={(e) => handleInputChange('availableFromDate', e.target.value)}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Yêu cầu bổ sung
					</label>
					<Input.TextArea
						placeholder="Các yêu cầu khác với bạn cùng phòng..."
						value={formData.additionalRequirements || ''}
						onChange={(e) => handleInputChange('additionalRequirements', e.target.value)}
						rows={3}
					/>
				</div>

				<div className="mt-6 space-y-3">
					<Button
						fullWidth
						variant="primary"
						onClick={handleSubmit}
						loading={updateMutation.isPending}
						disabled={!formData.title || !formData.monthlyRent}
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

export default EditRoommateSeekingPage;
