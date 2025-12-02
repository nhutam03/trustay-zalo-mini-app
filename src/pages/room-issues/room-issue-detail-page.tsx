import React, { useEffect } from 'react';
import { Page, Box, Icon, Button } from 'zmp-ui';
import { useParams, useNavigate } from 'react-router-dom';
import useSetHeader from '@/hooks/useSetHeader';
import { changeStatusBarColor } from '@/utils/basic';
import { useRoomIssue } from '@/hooks/useRoomIssueService';
import type { RoomIssueCategory } from '@/interfaces/room-issue-interfaces';
import { useAuth } from '@/components/providers/auth-provider';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

const CATEGORY_LABELS: Record<RoomIssueCategory, string> = {
	facility: 'Cơ sở vật chất',
	utility: 'Tiện ích',
	neighbor: 'Hàng xóm',
	noise: 'Tiếng ồn',
	security: 'An ninh',
	other: 'Khác',
};

const CATEGORY_ICONS = {
	facility: 'zi-home',
	utility: 'zi-setting',
	neighbor: 'zi-user',
	noise: 'zi-notif',
	security: 'zi-lock',
	other: 'zi-more-grid',
} as const;

const RoomIssueDetailPage: React.FC = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const setHeader = useSetHeader();
	const { user } = useAuth();

	const { data, isLoading, error } = useRoomIssue(id || '', !!id);
	const issue = data?.data;

	useEffect(() => {
		setHeader({
			title: 'Chi tiết sự cố',
			hasLeftIcon: true,
			type: 'primary',
		});
		changeStatusBarColor('primary');
	}, []);

	const getStatusBadge = (status: string) => {
		const statusConfig = {
			new: { text: 'Mới', color: 'bg-red-100 text-red-800', iconColor: 'text-red-600' },
			in_progress: { text: 'Đang xử lý', color: 'bg-yellow-100 text-yellow-800', iconColor: 'text-yellow-600' },
			resolved: { text: 'Đã giải quyết', color: 'bg-green-100 text-green-800', iconColor: 'text-green-600' },
		};
		const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
		return (
			<div className="flex items-center">
				<Icon icon="zi-check-circle" size={16} className={`mr-1 ${config.iconColor}`} />
				<span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
					{config.text}
				</span>
			</div>
		);
	};

	const formatDateTime = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleString('vi-VN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	if (isLoading) {
		return (
			<Page className="bg-gray-50 flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
			</Page>
		);
	}

	if (error || !issue) {
		return (
			<Page className="bg-gray-50 flex items-center justify-center min-h-screen">
				<Box className="text-center">
					<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
						<Icon icon="zi-close-circle" size={32} className="text-red-600" />
					</div>
					<p className="text-gray-500 mb-4">Không thể tải thông tin sự cố</p>
					<Button onClick={() => navigate('/room-issues')}>Quay lại</Button>
				</Box>
			</Page>
		);
	}

	return (
		<Page className="bg-gray-50">
			<Box className="px-4 py-4">
				{/* Status Card */}
				<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
					<div className="flex items-center justify-between mb-3">
						<div className={`p-3 rounded-lg ${issue.status === 'new' ? 'bg-red-50' : issue.status === 'in_progress' ? 'bg-yellow-50' : 'bg-green-50'}`}>
							<Icon 
								icon={CATEGORY_ICONS[issue.category]} 
								size={32} 
								className={issue.status === 'new' ? 'text-red-600' : issue.status === 'in_progress' ? 'text-yellow-600' : 'text-green-600'}
							/>
						</div>
						{getStatusBadge(issue.status)}
					</div>
					
					<h2 className="text-lg font-bold text-gray-900 mb-2">{issue.title}</h2>
					
					<div className="flex items-center gap-2 mb-3">
						<span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
							{CATEGORY_LABELS[issue.category]}
						</span>
					</div>
				</div>

				{/* Room Information */}
				<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
					<h3 className="font-semibold text-gray-900 mb-3 flex items-center">
						<Icon icon="zi-location" size={18} className="mr-2 text-primary" />
						Thông tin phòng
					</h3>
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-gray-600">Tên phòng:</span>
							<span className="font-medium text-gray-900">{issue.roomInstance.room.name}</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-gray-600">Số phòng:</span>
							<span className="font-medium text-gray-900">{issue.roomInstance.roomNumber}</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-gray-600">Tòa nhà:</span>
							<span className="font-medium text-gray-900">{issue.roomInstance.room.buildingName}</span>
						</div>
						{user?.role === 'landlord' && (
							<Button
								size="small"
								variant="tertiary"
								onClick={() => navigate(`/room/${issue.roomInstance.room.slug}`)}
								className="mt-2"
							>
								<Icon icon="zi-star" size={14} className="mr-1" />
								Xem chi tiết phòng
							</Button>
						)}
					</div>
				</div>

				{/* Reporter Information */}
				{issue.reporter && (
					<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
						<h3 className="font-semibold text-gray-900 mb-3 flex items-center">
							<Icon icon="zi-user" size={18} className="mr-2 text-primary" />
							Người báo cáo
						</h3>
						<div className="space-y-2">
							<div className="flex items-center text-sm">
								<Icon icon="zi-user" size={14} className="text-gray-400 mr-2" />
								<span className="text-gray-600">
									{issue.reporter.firstName} {issue.reporter.lastName}
								</span>
							</div>
							<div className="flex items-center text-sm">
								<Icon icon="zi-chat" size={14} className="text-gray-400 mr-2" />
								<span className="text-gray-600">{issue.reporter.email}</span>
							</div>
							{issue.reporter.phone && (
								<div className="flex items-center text-sm">
									<Icon icon="zi-call" size={14} className="text-gray-400 mr-2" />
									<span className="text-gray-600">{issue.reporter.phone}</span>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Images */}
				{issue.imageUrls && issue.imageUrls.length > 0 && (
					<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
						<h3 className="font-semibold text-gray-900 mb-3 flex items-center">
							<Icon icon="zi-photo" size={18} className="mr-2 text-primary" />
							Ảnh minh chứng ({issue.imageUrls.length})
						</h3>
						<PhotoProvider>
							<div className="grid grid-cols-3 gap-2">
								{issue.imageUrls.map((url, index) => (
									<PhotoView key={index} src={url}>
										<div className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
											<img 
												src={url} 
												alt={`Ảnh ${index + 1}`}
												className="w-full h-full object-cover"
												onError={(e) => {
													(e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Ảnh+lỗi';
												}}
											/>
										</div>
									</PhotoView>
								))}
							</div>
						</PhotoProvider>
					</div>
				)}

				{/* Timeline */}
				<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
					<h3 className="font-semibold text-gray-900 mb-3 flex items-center">
						<Icon icon="zi-calendar" size={18} className="mr-2 text-primary" />
						Thời gian
					</h3>
					<div className="space-y-3">
						<div className="flex items-start">
							<div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-3"></div>
							<div className="flex-1">
								<p className="text-sm font-medium text-gray-900">Đã tạo báo cáo</p>
								<p className="text-xs text-gray-500">{formatDateTime(issue.createdAt)}</p>
							</div>
						</div>
						{issue.updatedAt !== issue.createdAt && (
							<div className="flex items-start">
								<div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-3"></div>
								<div className="flex-1">
									<p className="text-sm font-medium text-gray-900">Cập nhật lần cuối</p>
									<p className="text-xs text-gray-500">{formatDateTime(issue.updatedAt)}</p>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Status Info */}
				<div className={`rounded-lg p-4 mb-6 ${
					issue.status === 'new' 
						? 'bg-red-50 border border-red-200' 
						: issue.status === 'in_progress'
						? 'bg-yellow-50 border border-yellow-200'
						: 'bg-green-50 border border-green-200'
				}`}>
					<div className="flex items-start">
						<Icon 
							icon="zi-info-circle" 
							size={20} 
							className={`mr-2 mt-0.5 ${
								issue.status === 'new' 
									? 'text-red-600' 
									: issue.status === 'in_progress'
									? 'text-yellow-600'
									: 'text-green-600'
							}`} 
						/>
						<div className="flex-1">
							<p className={`text-sm font-medium mb-1 ${
								issue.status === 'new' 
									? 'text-red-900' 
									: issue.status === 'in_progress'
									? 'text-yellow-900'
									: 'text-green-900'
							}`}>
								{issue.status === 'new' && 'Sự cố đang chờ xử lý'}
								{issue.status === 'in_progress' && 'Sự cố đang được xử lý'}
								{issue.status === 'resolved' && 'Sự cố đã được giải quyết'}
							</p>
							<p className={`text-xs ${
								issue.status === 'new' 
									? 'text-red-700' 
									: issue.status === 'in_progress'
									? 'text-yellow-700'
									: 'text-green-700'
							}`}>
								{issue.status === 'new' && user?.role === 'tenant' && 
									'Chủ nhà đã nhận được thông báo và sẽ sớm liên hệ xử lý.'
								}
								{issue.status === 'new' && user?.role === 'landlord' && 
									'Vui lòng liên hệ với người thuê để xử lý sự cố này sớm nhất có thể.'
								}
								{issue.status === 'in_progress' && 
									'Sự cố đang trong quá trình xử lý. Vui lòng đợi thêm ít phút.'
								}
								{issue.status === 'resolved' && 
									'Cảm ơn bạn đã báo cáo. Nếu vấn đề vẫn còn, vui lòng tạo báo cáo mới.'
								}
							</p>
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="space-y-3">
					<Button
						fullWidth
						variant="secondary"
						onClick={() => navigate('/room-issues')}
					>
						<Icon icon="zi-arrow-left" className="mr-2" />
						Quay lại danh sách
					</Button>
				</div>
			</Box>
		</Page>
	);
};

export default RoomIssueDetailPage;
