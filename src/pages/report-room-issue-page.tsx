import React, { useEffect, useState } from 'react';
import { Page, Box, Icon, Button, Input } from 'zmp-ui';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import useSetHeader from '@/hooks/useSetHeader';
import { changeStatusBarColor } from '@/utils/basic';
import { useCreateRoomIssue } from '@/hooks/useRoomIssueService';
import type { RoomIssueCategory } from '@/interfaces/room-issue-interfaces';
import { useAuth } from '@/components/providers/auth-provider';

const ISSUE_CATEGORIES = [
	{ value: 'facility', label: 'Cơ sở vật chất', icon: 'zi-home', description: 'Tường, cửa, sàn...' },
	{ value: 'utility', label: 'Tiện ích', icon: 'zi-flash', description: 'Điện, nước, wifi...' },
	{ value: 'neighbor', label: 'Hàng xóm', icon: 'zi-user-group', description: 'Vấn đề với hàng xóm' },
	{ value: 'noise', label: 'Tiếng ồn', icon: 'zi-volume-mute', description: 'Ồn ào, ảnh hưởng nghỉ ngơi' },
	{ value: 'security', label: 'An ninh', icon: 'zi-shield-check', description: 'Vấn đề an toàn, bảo mật' },
	{ value: 'other', label: 'Khác', icon: 'zi-more-grid', description: 'Các vấn đề khác' },
];

const ReportRoomIssuePage: React.FC = () => {
	const navigate = useNavigate();
	const { rentalId } = useParams();
	const [searchParams] = useSearchParams();
	const roomInstanceId = searchParams.get('roomInstanceId') || '';
	const roomName = searchParams.get('roomName') || '';
	const roomNumber = searchParams.get('roomNumber') || '';
	
	const setHeader = useSetHeader();
	const { user } = useAuth();
	const createIssueMutation = useCreateRoomIssue();

	const [title, setTitle] = useState('');
	const [category, setCategory] = useState<RoomIssueCategory | ''>('');
	const [imageUrls, setImageUrls] = useState<string[]>([]);
	const [imageUrlInput, setImageUrlInput] = useState('');

	useEffect(() => {
		setHeader({
			title: 'Báo cáo sự cố',
			hasLeftIcon: true,
			type: 'primary',
		});
		changeStatusBarColor('primary');
	}, []);

	useEffect(() => {
		// Redirect if not tenant or no roomInstanceId
		if (user?.role !== 'tenant' || !roomInstanceId) {
			navigate('/rentals');
		}
	}, [user, roomInstanceId, navigate]);

	const handleAddImageUrl = () => {
		if (imageUrlInput.trim() && imageUrls.length < 10) {
			setImageUrls([...imageUrls, imageUrlInput.trim()]);
			setImageUrlInput('');
		}
	};

	const handleRemoveImage = (index: number) => {
		setImageUrls(imageUrls.filter((_, i) => i !== index));
	};

	const handleSubmit = async () => {
		if (!title.trim()) {
			alert('Vui lòng nhập tiêu đề sự cố');
			return;
		}
		if (!category) {
			alert('Vui lòng chọn loại sự cố');
			return;
		}
		if (title.length > 120) {
			alert('Tiêu đề không được vượt quá 120 ký tự');
			return;
		}

		try {
			await createIssueMutation.mutateAsync({
				roomInstanceId,
				title: title.trim(),
				category: category as RoomIssueCategory,
				imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
			});
			
			alert('Đã báo cáo sự cố thành công! Chủ nhà sẽ sớm xem xét và xử lý.');
			navigate(`/rentals/${rentalId}`);
		} catch (error) {
			console.error('Error creating room issue:', error);
			alert('Không thể gửi báo cáo sự cố. Vui lòng thử lại sau.');
		}
	};

	return (
		<Page className="bg-gray-50">
			<Box className="px-4 py-4">
				{/* Room Info */}
				<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
					<div className="flex items-center mb-2">
						<Icon icon="zi-home" size={20} className="text-primary mr-2" />
						<h3 className="font-semibold text-gray-900">{roomName}</h3>
					</div>
					<p className="text-sm text-gray-600">Phòng số: {roomNumber}</p>
				</div>

				{/* Issue Title */}
				<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Tiêu đề sự cố <span className="text-red-500">*</span>
					</label>
					<Input
						type="text"
						placeholder="Ví dụ: Rò rỉ nước gần cửa phòng tắm"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						maxLength={120}
						className="w-full"
					/>
					<p className="text-xs text-gray-500 mt-1">{title.length}/120 ký tự</p>
				</div>

				{/* Issue Category */}
				<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
					<label className="block text-sm font-medium text-gray-700 mb-3">
						Loại sự cố <span className="text-red-500">*</span>
					</label>
					<div className="grid grid-cols-2 gap-3">
						{ISSUE_CATEGORIES.map((cat) => (
							<button
								key={cat.value}
								onClick={() => setCategory(cat.value as RoomIssueCategory)}
								className={`p-3 rounded-lg border-2 transition-all ${
									category === cat.value
										? 'border-primary bg-blue-50'
										: 'border-gray-200 bg-white active:bg-gray-50'
								}`}
							>
								<Icon icon={cat.icon} size={24} className={`mb-2 ${category === cat.value ? 'text-primary' : 'text-gray-400'}`} />
								<p className={`text-sm font-medium ${category === cat.value ? 'text-primary' : 'text-gray-900'}`}>
									{cat.label}
								</p>
								<p className="text-xs text-gray-500 mt-1">{cat.description}</p>
							</button>
						))}
					</div>
				</div>

				{/* Image URLs */}
				<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Ảnh minh chứng (Tùy chọn)
					</label>
					<p className="text-xs text-gray-500 mb-3">Tối đa 10 ảnh. Nhập URL của ảnh đã tải lên.</p>
					
					<div className="flex gap-2 mb-3">
						<Input
							type="url"
							placeholder="https://example.com/image.jpg"
							value={imageUrlInput}
							onChange={(e) => setImageUrlInput(e.target.value)}
							disabled={imageUrls.length >= 10}
							className="flex-1"
						/>
						<Button
							size="small"
							onClick={handleAddImageUrl}
							disabled={!imageUrlInput.trim() || imageUrls.length >= 10}
						>
							<Icon icon="zi-plus" />
						</Button>
					</div>

					{imageUrls.length > 0 && (
						<div className="space-y-2">
							{imageUrls.map((url, index) => (
								<div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
									<Icon icon="zi-photo" size={16} className="text-gray-400" />
									<span className="flex-1 text-xs text-gray-600 truncate">{url}</span>
									<button
										onClick={() => handleRemoveImage(index)}
										className="p-1 text-red-500 active:bg-red-50 rounded"
									>
										<Icon icon="zi-close" size={16} />
									</button>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Info Note */}
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
					<div className="flex items-start">
						<Icon icon="zi-info-circle" size={20} className="text-blue-600 mr-2 mt-0.5" />
						<div className="flex-1">
							<p className="text-sm text-blue-900 font-medium mb-1">Lưu ý</p>
							<p className="text-xs text-blue-700">
								Sau khi gửi báo cáo, chủ nhà sẽ nhận được thông báo và sẽ liên hệ để xử lý sự cố trong thời gian sớm nhất.
							</p>
						</div>
					</div>
				</div>

				{/* Submit Button */}
				<div className="space-y-3">
					<Button
						fullWidth
						variant="primary"
						onClick={handleSubmit}
						disabled={createIssueMutation.isPending || !title.trim() || !category}
					>
						{createIssueMutation.isPending ? (
							<>
								<div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
								Đang gửi...
							</>
						) : (
							<>
								<Icon icon="zi-send" className="mr-2" />
								Gửi báo cáo
							</>
						)}
					</Button>
					
					<Button
						fullWidth
						variant="secondary"
						onClick={() => navigate(`/rentals/${rentalId}`)}
						disabled={createIssueMutation.isPending}
					>
						Hủy bỏ
					</Button>
				</div>
			</Box>
		</Page>
	);
};

export default ReportRoomIssuePage;
