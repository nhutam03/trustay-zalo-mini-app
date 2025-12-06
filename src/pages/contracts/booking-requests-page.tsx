import React, { useEffect, useState } from 'react';
import { Page, Box, Tabs, Icon } from 'zmp-ui';
import { useNavigate } from 'react-router-dom';
import useSetHeader from '@/hooks/useSetHeader';
import { changeStatusBarColor } from '@/utils/basic';
import BottomNav from '@/components/navigate-bottom';
import {
	getMyBookingRequests,
	getReceivedBookingRequests,
	updateBookingRequestAsOwner,
	cancelMyBookingRequest,
	BookingRequest,
} from '@/services/booking-request-service';
import { useAuth } from '@/components/providers/auth-provider';

const BookingRequestsPage: React.FC = () => {
	const setHeader = useSetHeader();
	const navigate = useNavigate();
	const { user } = useAuth();
	const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');
	const [sentRequests, setSentRequests] = useState<BookingRequest[]>([]);
	const [receivedRequests, setReceivedRequests] = useState<BookingRequest[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setHeader({
			title: 'Yêu cầu đặt phòng',
			hasLeftIcon: true,
			type: 'primary',
		});
		changeStatusBarColor('primary');
	}, []);

	useEffect(() => {
		loadBookingRequests();
	}, [activeTab]);

	const loadBookingRequests = async () => {
		try {
			setLoading(true);
			if (activeTab === 'sent') {
				const response = await getMyBookingRequests({ page: 1, limit: 50 });
				setSentRequests(response.data);
			} else {
				const response = await getReceivedBookingRequests({ page: 1, limit: 50 });
				setReceivedRequests(response.data);
			}
		} catch (error) {
			console.error('Error loading booking requests:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleAccept = async (id: string) => {
		try {
			await updateBookingRequestAsOwner(id, { status: 'accepted' });
			loadBookingRequests();
		} catch (error) {
			console.error('Error accepting request:', error);
		}
	};

	const handleReject = async (id: string) => {
		try {
			await updateBookingRequestAsOwner(id, { status: 'rejected' });
			loadBookingRequests();
		} catch (error) {
			console.error('Error rejecting request:', error);
		}
	};

	const handleCancel = async (id: string) => {
		try {
			await cancelMyBookingRequest(id, {});
			loadBookingRequests();
		} catch (error) {
			console.error('Error cancelling request:', error);
		}
	};

	const getStatusBadge = (status: string) => {
		const statusConfig = {
			pending: { text: 'Đang chờ', color: 'bg-yellow-100 text-yellow-800' },
			accepted: { text: 'Đã chấp nhận', color: 'bg-green-100 text-green-800' },
			rejected: { text: 'Đã từ chối', color: 'bg-red-100 text-red-800' },
			cancelled: { text: 'Đã hủy', color: 'bg-gray-100 text-gray-800' },
		};
		const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
		return (
			<span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
				{config.text}
			</span>
		);
	};

	const renderBookingCard = (request: BookingRequest, isSent: boolean) => (
		<div key={request.id} className="bg-white p-4 mb-3 rounded-lg shadow-sm">
			<div className="flex justify-between items-start mb-3">
				<div className="flex-1">
					<h3 className="font-semibold text-gray-900 mb-1">
						{request.room?.name || 'Phòng không xác định'}
					</h3>
					<p className="text-sm text-gray-600">
						{request.room?.building?.name || 'Địa chỉ không xác định'}
					</p>
				</div>
				{getStatusBadge(request.status)}
			</div>

			<div className="space-y-2 mb-3">
				<div className="flex items-center text-sm">
					<Icon icon="zi-calendar" size={16} className="text-gray-400 mr-2" />
					<span className="text-gray-600">
						Ngày vào: {new Date(request.moveInDate).toLocaleDateString('vi-VN')}
					</span>
				</div>
				{request.monthlyRent && (
					<div className="flex items-center text-sm">
						<Icon icon="zi-poll" size={16} className="text-gray-400 mr-2" />
						<span className="text-gray-600">
							Giá thuê: {Number(request.monthlyRent).toLocaleString('vi-VN')} đ/tháng
						</span>
					</div>
				)}
				{!isSent && request.tenant && (
					<div className="flex items-center text-sm">
						<Icon icon="zi-user" size={16} className="text-gray-400 mr-2" />
						<span className="text-gray-600">
							Người thuê: {request.tenant.firstName} {request.tenant.lastName}
						</span>
					</div>
				)}
			</div>

			{request.messageToOwner && (
				<div className="bg-gray-50 p-3 rounded-lg mb-3">
					<p className="text-sm text-gray-700">{request.messageToOwner}</p>
				</div>
			)}

			{/* View Room Detail Link */}
			{request.room?.id && (
				<button
					onClick={() => navigate(`/room/${request?.room?.id}`)}
					className="w-full mb-3 py-2 border border-primary text-primary rounded-lg text-sm font-medium active:opacity-70 flex items-center justify-center gap-1"
				>
					<Icon icon="zi-post" size={16} />
					Xem chi tiết phòng
				</button>
			)}

			{request.status === 'pending' && (
				<div className="flex gap-2">
					{isSent ? (
						<button
							onClick={() => handleCancel(request.id)}
							className="flex-1 py-2 border border-red-500 text-red-500 rounded-lg text-sm font-medium active:opacity-70"
						>
							Hủy yêu cầu
						</button>
					) : (
						<>
							<button
								onClick={() => handleAccept(request.id)}
								className="flex-1 py-2 bg-primary text-white rounded-lg text-sm font-medium active:opacity-70"
							>
								Chấp nhận
							</button>
							<button
								onClick={() => handleReject(request.id)}
								className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium active:opacity-70"
							>
								Từ chối
							</button>
						</>
					)}
				</div>
			)}
		</div>
	);

	return (
		<Page className="bg-gray-50">
			<Box className="bg-white mb-2">
				<Tabs
					activeKey={activeTab}
					onChange={(key) => setActiveTab(key as 'sent' | 'received')}
				>
					<Tabs.Tab key="sent" label="Đã gửi" />
					<Tabs.Tab key="received" label="Đã nhận" />
				</Tabs>
			</Box>

			<Box className="px-4 py-2">
				{loading ? (
					<div className="flex justify-center items-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					</div>
				) : (
					<>
						{activeTab === 'sent' ? (
							sentRequests.length > 0 ? (
								sentRequests.map((request) => renderBookingCard(request, true))
							) : (
								<div className="text-center py-8 text-gray-500">
									Bạn chưa gửi yêu cầu đặt phòng nào
								</div>
							)
						) : receivedRequests.length > 0 ? (
							receivedRequests.map((request) => renderBookingCard(request, false))
						) : (
							<div className="text-center py-8 text-gray-500">
								Chưa có yêu cầu đặt phòng nào
							</div>
						)}
					</>
				)}
			</Box>
		</Page>
	);
};

export default BookingRequestsPage;
