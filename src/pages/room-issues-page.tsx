import React, { useEffect, useState } from 'react';
import { Page, Box, Icon } from 'zmp-ui';
import { useNavigate } from 'react-router-dom';
import useSetHeader from '@/hooks/useSetHeader';
import { changeStatusBarColor } from '@/utils/basic';
import { useAuth } from '@/components/providers/auth-provider';
import { useTenantRoomIssues, useLandlordRoomIssues } from '@/hooks/useRoomIssueService';
import type { RoomIssueCategory, RoomIssueStatus, RoomIssueResponseDto } from '@/interfaces/room-issue-interfaces';
import BottomNav from '@/components/navigate-bottom';

const CATEGORY_LABELS: Record<RoomIssueCategory, string> = {
	facility: 'Cơ sở vật chất',
	utility: 'Tiện ích',
	neighbor: 'Hàng xóm',
	noise: 'Tiếng ồn',
	security: 'An ninh',
	other: 'Khác',
};

const CATEGORY_ICONS: Record<RoomIssueCategory, string> = {
	facility: 'zi-home',
	utility: 'zi-flash',
	neighbor: 'zi-user-group',
	noise: 'zi-volume-mute',
	security: 'zi-shield-check',
	other: 'zi-more-grid',
};

const RoomIssuesPage: React.FC = () => {
	const navigate = useNavigate();
	const setHeader = useSetHeader();
	const { user } = useAuth();
	const [statusFilter, setStatusFilter] = useState<RoomIssueStatus | 'all'>('all');

	// Build query params based on filter
	const queryParams = statusFilter !== 'all' ? { status: statusFilter } : {};

	// Use appropriate hook based on user role
	const tenantQuery = useTenantRoomIssues(user?.role === 'tenant' ? queryParams : undefined);
	const landlordQuery = useLandlordRoomIssues(user?.role === 'landlord' ? queryParams : undefined);

	const query = user?.role === 'landlord' ? landlordQuery : tenantQuery;
	const issues = query.data?.data?.items || [];
	const loading = query.isLoading;

	useEffect(() => {
		setHeader({
			title: user?.role === 'landlord' ? 'Sự cố cần xử lý' : 'Sự cố đã báo cáo',
			hasLeftIcon: true,
			type: 'primary',
		});
		changeStatusBarColor('primary');
	}, [user]);

	const getStatusBadge = (status: RoomIssueStatus) => {
		const statusConfig = {
			new: { text: 'Mới', color: 'bg-red-100 text-red-800' },
			in_progress: { text: 'Đang xử lý', color: 'bg-yellow-100 text-yellow-800' },
			resolved: { text: 'Đã giải quyết', color: 'bg-green-100 text-green-800' },
		};
		const config = statusConfig[status];
		return (
			<span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
				{config.text}
			</span>
		);
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 60) {
			return `${diffMins} phút trước`;
		} else if (diffHours < 24) {
			return `${diffHours} giờ trước`;
		} else if (diffDays < 7) {
			return `${diffDays} ngày trước`;
		} else {
			return date.toLocaleDateString('vi-VN');
		}
	};

	const handleIssueClick = (issueId: string) => {
		navigate(`/room-issues/${issueId}`);
	};

	const renderIssueCard = (issue: RoomIssueResponseDto) => (
		<button
			key={issue.id}
			onClick={() => handleIssueClick(issue.id)}
			className="w-full bg-white p-4 mb-3 rounded-lg shadow-sm active:bg-gray-50"
		>
			<div className="flex items-start gap-3">
				<div className={`p-2 rounded-lg ${issue.status === 'new' ? 'bg-red-50' : issue.status === 'in_progress' ? 'bg-yellow-50' : 'bg-green-50'}`}>
					<Icon 
						icon={CATEGORY_ICONS[issue.category]} 
						size={24} 
						className={issue.status === 'new' ? 'text-red-600' : issue.status === 'in_progress' ? 'text-yellow-600' : 'text-green-600'}
					/>
				</div>
				
				<div className="flex-1 text-left">
					<div className="flex items-start justify-between mb-1">
						<h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
							{issue.title}
						</h3>
						{getStatusBadge(issue.status)}
					</div>
					
					<div className="space-y-1">
						<p className="text-xs text-gray-500">
							<span className="font-medium">{CATEGORY_LABELS[issue.category]}</span>
						</p>
						
						<div className="flex items-center text-xs text-gray-600">
							<Icon icon="zi-location" size={12} className="mr-1" />
							<span className="line-clamp-1">
								Phòng {issue.roomInstance.roomNumber} - {issue.roomInstance.room.name}
							</span>
						</div>
						
						<div className="flex items-center text-xs text-gray-600">
							<Icon icon="zi-home" size={12} className="mr-1" />
							<span className="line-clamp-1">{issue.roomInstance.room.buildingName}</span>
						</div>

						{user?.role === 'landlord' && issue.reporter && (
							<div className="flex items-center text-xs text-gray-600">
								<Icon icon="zi-user" size={12} className="mr-1" />
								<span>
									Báo cáo bởi: {issue.reporter.firstName} {issue.reporter.lastName}
								</span>
							</div>
						)}

						<div className="flex items-center justify-between mt-2">
							<div className="flex items-center text-xs text-gray-500">
								<Icon icon="zi-clock" size={12} className="mr-1" />
								<span>{formatDate(issue.createdAt)}</span>
							</div>
							
							{issue.imageUrls && issue.imageUrls.length > 0 && (
								<div className="flex items-center text-xs text-gray-500">
									<Icon icon="zi-photo" size={12} className="mr-1" />
									<span>{issue.imageUrls.length} ảnh</span>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</button>
	);

	return (
		<Page className="bg-gray-50">
			{/* Filter tabs */}
			<Box className="bg-white mb-2 px-4 py-3">
				<div className="flex gap-2 overflow-x-auto">
					{[
						{ key: 'all', label: 'Tất cả' },
						{ key: 'new', label: 'Mới' },
						{ key: 'in_progress', label: 'Đang xử lý' },
						{ key: 'resolved', label: 'Đã giải quyết' },
					].map((tab) => (
						<button
							key={tab.key}
							onClick={() => setStatusFilter(tab.key as RoomIssueStatus | 'all')}
							className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
								statusFilter === tab.key
									? 'bg-primary text-white'
									: 'bg-gray-100 text-gray-700 active:bg-gray-200'
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>
			</Box>

			{/* Issues List */}
			<Box className="px-4 py-2">
				{loading ? (
					<div className="flex justify-center items-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					</div>
				) : issues.length > 0 ? (
					<>
						{user?.role === 'landlord' && statusFilter !== 'resolved' && (
							<div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
								<div className="flex items-start">
									<Icon icon="zi-info-circle" size={16} className="text-blue-600 mr-2 mt-0.5" />
									<p className="text-xs text-blue-700">
										Danh sách được sắp xếp theo thời gian tạo (cũ nhất lên đầu) để ưu tiên xử lý.
									</p>
								</div>
							</div>
						)}
						{issues.map((issue) => renderIssueCard(issue))}
					</>
				) : (
					<div className="text-center py-8">
						<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
							<Icon icon="zi-shield-check" size={32} className="text-gray-400" />
						</div>
						<p className="text-gray-500 mb-2">
							{statusFilter === 'all' 
								? (user?.role === 'landlord' ? 'Chưa có sự cố nào được báo cáo' : 'Bạn chưa báo cáo sự cố nào')
								: 'Không có sự cố nào ở trạng thái này'
							}
						</p>
						<p className="text-sm text-gray-400">
							{user?.role === 'tenant' && statusFilter === 'all' && 
								'Khi gặp vấn đề với phòng trọ, hãy báo cáo để chủ nhà xử lý'
							}
						</p>
					</div>
				)}
			</Box>

			<BottomNav />
		</Page>
	);
};

export default RoomIssuesPage;
