import React, { useState } from 'react';
import { Box, Input, Button, Select, useSnackbar } from 'zmp-ui';
import { useNavigate } from 'react-router-dom';
import { useCreateRoommateSeekingPost } from '@/hooks/useRoommateSeekingPostsService';
import type { CreateRoommateSeekingPostRequest } from '@/services/roommate-seeking-posts-service';

const { Option } = Select;

const PostRoommateSeekingPage: React.FC = () => {
	const navigate = useNavigate();
	const { openSnackbar } = useSnackbar();
	const createMutation = useCreateRoommateSeekingPost();
	const [formData, setFormData] = useState<CreateRoommateSeekingPostRequest>({
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

	const handleInputChange = (field: keyof CreateRoommateSeekingPostRequest, value: any) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSubmit = async () => {
		try {
			await createMutation.mutateAsync(formData);
			openSnackbar({
				text: 'Đăng bài tìm bạn cùng phòng thành công!',
				type: 'success',
				duration: 3000,
			});
			navigate('/explore');
		} catch (error) {
			openSnackbar({
				text: 'Không thể đăng bài. Vui lòng thử lại!',
				type: 'error',
				duration: 3000,
			});
		}
	};

	return (
		<Box className="p-4 space-y-4">
				<div className="text-center mb-6">
					<h2 className="text-xl font-bold text-gray-900">Tìm bạn cùng phòng</h2>
					<p className="text-sm text-gray-500 mt-2">
						Đăng bài tìm người ở ghép, chia sẻ chi phí sinh hoạt
					</p>
				</div>

				<div className="space-y-4">
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
				</div>

				<div className="mt-6 space-y-3">
					<Button
						fullWidth
						variant="primary"
						onClick={handleSubmit}
						loading={createMutation.isPending}
						disabled={!formData.title || !formData.monthlyRent}
					>
						Đăng bài
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

export default PostRoommateSeekingPage;
