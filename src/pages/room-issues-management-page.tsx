import React, { useState } from 'react';
import { Page, Box, Text, Button, Select, Tabs, useNavigate } from 'zmp-ui';
import useSetHeader from '@/hooks/useSetHeader';
import { useTenantRoomIssues, useLandlordRoomIssues } from '@/hooks/useRoomIssueService';
import { useCurrentUser } from '@/hooks/useAuthService';

const { Option } = Select;

const RoomIssuesManagementPage: React.FC = () => {
	const navigate = useNavigate();
	const setHeader = useSetHeader();

	React.useEffect(() => {
		setHeader({ title: 'Quản lý sự cố phòng', hasLeftIcon: true });
	}, [setHeader]);

	const { data: currentUser } = useCurrentUser();
	const isLandlord = currentUser?.role === 'landlord';

	const [statusFilter, setStatusFilter] = useState<'new' | 'in_progress' | 'resolved' | ''>('');
	const [categoryFilter, setCategoryFilter] = useState<'facility' | 'utility' | 'neighbor' | 'noise' | 'security' | 'other' | ''>('');

	// Fetch data based on role
	const { data: tenantIssues, isLoading: tenantLoading } = useTenantRoomIssues(
		{
			status: statusFilter || undefined,
			category: categoryFilter || undefined,
		},
		!isLandlord
	);

	const { data: landlordIssues, isLoading: landlordLoading } = useLandlordRoomIssues(
		{
			status: statusFilter || undefined,
			category: categoryFilter || undefined,
		},
		isLandlord
	);

	const issuesData = isLandlord ? landlordIssues?.data : tenantIssues?.data;
	const issues = issuesData?.items || [];
	const isLoading = isLandlord ? landlordLoading : tenantLoading;

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'new':
				return 'bg-yellow-100 text-yellow-800';
			case 'in_progress':
				return 'bg-blue-100 text-blue-800';
			case 'resolved':
				return 'bg-green-100 text-green-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case 'new':
				return 'Mới';
			case 'in_progress':
				return 'Đang xử lý';
			case 'resolved':
				return 'Đã giải quyết';
			default:
				return status;
		}
	};

	const getCategoryIcon = (category: string) => {
		switch (category) {
			case 'plumbing':
				return '🚰';
			case 'electrical':
				return '⚡';
			case 'structural':
				return '🏗️';
			case 'appliance':
				return '🔧';
			case 'security':
				return '🔒';
			case 'cleaning':
				return '🧹';
			case 'other':
				return '📝';
			default:
				return '❓';
		}
	};

	const getCategoryText = (category: string) => {
		switch (category) {
			case 'plumbing':
				return 'Hệ thống nước';
			case 'electrical':
				return 'Điện';
			case 'structural':
				return 'Kết cấu';
			case 'appliance':
				return 'Thiết bị';
			case 'security':
				return 'An ninh';
			case 'cleaning':
				return 'Vệ sinh';
			case 'other':
				return 'Khác';
			default:
				return category;
		}
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case 'urgent':
				return 'text-red-600';
			case 'high':
				return 'text-orange-600';
			case 'medium':
				return 'text-yellow-600';
			case 'low':
				return 'text-gray-600';
			default:
				return 'text-gray-600';
		}
	};

	const handleIssueClick = (issueId: string) => {
		navigate(`/room-issue/${issueId}`);
	};

	const handleCreateIssue = () => {
		navigate('/report-room-issue');
	};

	if (isLoading) {
		return (
			<Page className="bg-gray-50">
				<Box className="flex justify-center items-center py-8">
					<Text>Đang tải...</Text>
				</Box>
			</Page>
		);
	}

	return (
		<Page className="bg-gray-50">
			<Box className="p-4">
				{/* Statistics Cards - for Landlords */}
				{isLandlord && (
					<Box className="grid grid-cols-3 gap-3 mb-4">
						<Box className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
							<Text className="text-yellow-800 text-xs mb-1">Mới</Text>
							<Text className="text-yellow-900 text-xl font-bold">
								{issues?.filter((i: any) => i.status === 'new').length || 0}
							</Text>
						</Box>

						<Box className="bg-blue-50 rounded-lg p-3 border border-blue-200">
							<Text className="text-blue-800 text-xs mb-1">Đang xử lý</Text>
							<Text className="text-blue-900 text-xl font-bold">
								{issues?.filter((i: any) => i.status === 'in_progress').length || 0}
							</Text>
						</Box>

						<Box className="bg-green-50 rounded-lg p-3 border border-green-200">
							<Text className="text-green-800 text-xs mb-1">Đã giải quyết</Text>
							<Text className="text-green-900 text-xl font-bold">
								{issues?.filter((i: any) => i.status === 'resolved').length || 0}
							</Text>
						</Box>
					</Box>
				)}

				{/* Filters */}
				<Box className="bg-white rounded-lg p-4 mb-4 shadow-sm space-y-3">
					<Box>
						<Text className="text-sm font-medium mb-2">Trạng thái</Text>
						<Select
							value={statusFilter}
							onChange={(value) => setStatusFilter(value as any)}
							placeholder="Tất cả trạng thái"
						>
							<Option value="" title="Tất cả" />
							<Option value="new" title="Mới" />
							<Option value="in_progress" title="Đang xử lý" />
							<Option value="resolved" title="Đã giải quyết" />
						</Select>
					</Box>

					<Box>
						<Text className="text-sm font-medium mb-2">Danh mục</Text>
						<Select
							value={categoryFilter}
							onChange={(value) => setCategoryFilter(value as typeof categoryFilter)}
							placeholder="Tất cả danh mục"
						>
							<Option value="" title="Tất cả" />
							<Option value="facility" title="Cơ sở vật chất" />
							<Option value="utility" title="Tiện ích" />
							<Option value="neighbor" title="Hàng xóm" />
							<Option value="noise" title="Tiếng ồn" />
							<Option value="security" title="An ninh" />
							<Option value="other" title="Khác" />
						</Select>
					</Box>
				</Box>

				{/* Create New Issue Button - for Tenants */}
				{!isLandlord && (
					<Button fullWidth variant="primary" onClick={handleCreateIssue} className="mb-4">
						Báo cáo sự cố mới
					</Button>
				)}

				{/* Issues List */}
				<Box className="space-y-3">
					{!issues || issues.length === 0 ? (
						<Box className="bg-white rounded-lg p-8 shadow-sm text-center">
							<Text className="text-gray-500">Không có sự cố nào</Text>
							{!isLandlord && (
								<Button size="small" variant="tertiary" onClick={handleCreateIssue} className="mt-4">
									Báo cáo sự cố
								</Button>
							)}
						</Box>
					) : (
						issues.map((issue: any) => (
							<Box
								key={issue.id}
								className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 cursor-pointer"
								onClick={() => handleIssueClick(issue.id)}
							>
								{/* Header */}
								<Box className="flex justify-between items-start mb-3">
									<Box className="flex-1">
										<Box className="flex items-center gap-2 mb-2">
											<Text className="text-2xl">{getCategoryIcon(issue.category)}</Text>
											<Text className="text-xs text-gray-500">
												{getCategoryText(issue.category)}
											</Text>
											{issue.priority && (
												<Text className={`text-xs font-semibold ${getPriorityColor(issue.priority)}`}>
													{issue.priority === 'urgent'
														? '🔴 Khẩn cấp'
														: issue.priority === 'high'
															? '🟠 Cao'
															: issue.priority === 'medium'
																? '🟡 Trung bình'
																: '⚪ Thấp'}
												</Text>
											)}
										</Box>
										<Text className="font-semibold text-gray-800 line-clamp-2">
											{issue.title}
										</Text>
									</Box>
									<Box className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
										{getStatusText(issue.status)}
									</Box>
								</Box>

								{/* Description */}
								{issue.description && (
									<Text className="text-sm text-gray-600 line-clamp-2 mb-3">
										{issue.description}
									</Text>
								)}

								{/* Images */}
								{issue.imageUrls && issue.imageUrls.length > 0 && (
									<Box className="flex gap-2 mb-3 overflow-x-auto">
										{issue.imageUrls.slice(0, 3).map((url: string, idx: number) => (
											<img
												key={idx}
												src={url}
												alt={`Issue ${idx + 1}`}
												className="w-20 h-20 rounded-lg object-cover"
											/>
										))}
										{issue.imageUrls.length > 3 && (
											<Box className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
												<Text className="text-gray-600 text-sm">
													+{issue.imageUrls.length - 3}
												</Text>
											</Box>
										)}
									</Box>
								)}

								{/* Room Instance Info */}
								{issue.roomInstance && (
									<Box className="flex items-center gap-2 mb-2">
										<Text className="text-xs text-gray-500">
											🏠 {issue.roomInstance.room?.name || 'Phòng không xác định'}
										</Text>
									</Box>
								)}

								{/* Reporter/Timeline Info */}
								<Box className="flex justify-between items-center text-xs text-gray-500">
									<Text>
										{isLandlord && issue.reporter
											? `Báo cáo bởi: ${issue.reporter.fullName || issue.reporter.email}`
											: new Date(issue.createdAt).toLocaleDateString('vi-VN')}
									</Text>
									{issue.resolvedAt && (
										<Text className="text-green-600">
											Giải quyết: {new Date(issue.resolvedAt).toLocaleDateString('vi-VN')}
										</Text>
									)}
								</Box>
							</Box>
						))
					)}
				</Box>
			</Box>
		</Page>
	);
};

export default RoomIssuesManagementPage;
