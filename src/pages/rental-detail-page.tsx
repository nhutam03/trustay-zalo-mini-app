import React, { useEffect, useState } from 'react';
import { Page, Box, Icon, Button } from 'zmp-ui';
import { useParams, useNavigate } from 'react-router-dom';
import useSetHeader from '@/hooks/useSetHeader';
import { changeStatusBarColor } from '@/utils/basic';
import { getRentalById, terminateRental, renewRental, Rental } from '@/services/rental-service';
import { useAuth } from '@/components/providers/auth-provider';

const RentalDetailPage: React.FC = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const setHeader = useSetHeader();
	const { user } = useAuth();
	const [rental, setRental] = useState<Rental | null>(null);
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState(false);
	const [showTerminateModal, setShowTerminateModal] = useState(false);
	const [showRenewModal, setShowRenewModal] = useState(false);
	const [terminationReason, setTerminationReason] = useState('');
	const [newEndDate, setNewEndDate] = useState('');

	useEffect(() => {
		setHeader({
			title: 'Chi tiết cho thuê',
			hasLeftIcon: true,
			type: 'primary',
		});
		changeStatusBarColor('primary');
	}, []);

	useEffect(() => {
		if (id) {
			loadRentalDetails();
		}
	}, [id]);

	const loadRentalDetails = async () => {
		try {
			setLoading(true);
			const response = await getRentalById(id!);
			setRental(response.data);
		} catch (error) {
			console.error('Error loading rental details:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleTerminate = async () => {
		if (!terminationReason.trim()) {
			alert('Vui lòng nhập lý do chấm dứt hợp đồng');
			return;
		}
		try {
			setActionLoading(true);
			await terminateRental(id!, {
				terminationDate: new Date().toISOString(),
				reason: terminationReason,
			});
			alert('Đã chấm dứt hợp đồng thuê');
			setShowTerminateModal(false);
			loadRentalDetails();
		} catch (error) {
			console.error('Error terminating rental:', error);
			alert('Không thể chấm dứt hợp đồng thuê');
		} finally {
			setActionLoading(false);
		}
	};

	const handleRenew = async () => {
		if (!newEndDate) {
			alert('Vui lòng chọn ngày kết thúc mới');
			return;
		}
		try {
			setActionLoading(true);
			await renewRental(id!, { newEndDate });
			alert('Đã gia hạn hợp đồng thuê');
			setShowRenewModal(false);
			loadRentalDetails();
		} catch (error) {
			console.error('Error renewing rental:', error);
			alert('Không thể gia hạn hợp đồng thuê');
		} finally {
			setActionLoading(false);
		}
	};

	const getStatusBadge = (status: string) => {
		const statusConfig = {
			active: { text: 'Đang hoạt động', color: 'bg-green-100 text-green-800' },
			pending: { text: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
			terminated: { text: 'Đã chấm dứt', color: 'bg-red-100 text-red-800' },
			expired: { text: 'Hết hạn', color: 'bg-gray-100 text-gray-600' },
		};
		const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
		return (
			<span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
				{config.text}
			</span>
		);
	};

	if (loading) {
		return (
			<Page className="bg-gray-50 flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
			</Page>
		);
	}

	if (!rental) {
		return (
			<Page className="bg-gray-50 flex items-center justify-center min-h-screen">
				<Box className="text-center">
					<p className="text-gray-500 mb-4">Không tìm thấy thông tin cho thuê</p>
					<Button onClick={() => navigate('/rentals')}>Quay lại</Button>
				</Box>
			</Page>
		);
	}

	return (
		<Page className="bg-gray-50">
			<Box className="px-4 py-4">
				{/* Header Card */}
				<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
					<div className="flex justify-between items-start mb-3">
						<div className="flex-1">
							<h2 className="text-lg font-bold text-gray-900 mb-1">
								{rental.roomInstance?.room?.name || 'Phòng không xác định'}
							</h2>
							<p className="text-sm text-gray-600">
								Phòng {rental.roomInstance?.roomNumber} - {rental.roomInstance?.room?.building?.name}
							</p>
							{rental.roomInstance?.room?.building?.address && (
								<p className="text-xs text-gray-500 mt-1">
									{rental.roomInstance.room.building.address}
								</p>
							)}
						</div>
						{getStatusBadge(rental.status)}
					</div>

					<div className="grid grid-cols-2 gap-3 mt-4">
						<div className="bg-primary bg-opacity-5 rounded-lg p-3">
							<p className="text-xs text-gray-600 mb-1">Tiền thuê/tháng</p>
							<p className="text-lg font-bold text-primary">
								{Number(rental.monthlyRent).toLocaleString('vi-VN')} đ
							</p>
						</div>
						{rental.depositPaid && Number(rental.depositPaid) > 0 && (
							<div className="bg-blue-50 rounded-lg p-3">
								<p className="text-xs text-gray-600 mb-1">Tiền cọc</p>
								<p className="text-lg font-bold text-blue-600">
									{Number(rental.depositPaid).toLocaleString('vi-VN')} đ
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Time Period */}
				<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
					<h3 className="font-semibold text-gray-900 mb-3">Thời gian thuê</h3>
					<div className="space-y-2">
						<div className="flex items-center text-sm">
							<Icon icon="zi-calendar" size={16} className="text-gray-400 mr-2" />
							<span className="text-gray-600">
								Bắt đầu: {new Date(rental.startDate).toLocaleDateString('vi-VN')}
							</span>
						</div>
						{rental.endDate && (
							<div className="flex items-center text-sm">
								<Icon icon="zi-calendar" size={16} className="text-gray-400 mr-2" />
								<span className="text-gray-600">
									Kết thúc: {new Date(rental.endDate).toLocaleDateString('vi-VN')}
								</span>
							</div>
						)}
						<div className="flex items-center text-sm">
							<Icon icon="zi-clock" size={16} className="text-gray-400 mr-2" />
							<span className="text-gray-600">
								Ngày tạo: {new Date(rental.createdAt).toLocaleDateString('vi-VN')}
							</span>
						</div>
					</div>
				</div>

				{/* Room Details */}
				{rental.roomInstance?.room && (
					<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
						<h3 className="font-semibold text-gray-900 mb-3">Chi tiết phòng</h3>
						<div className="space-y-2">
							{rental.roomInstance.room.roomType && (
								<div className="flex justify-between text-sm">
									<span className="text-gray-600">Loại phòng:</span>
									<span className="font-medium text-gray-900">
										{rental.roomInstance.room.roomType}
									</span>
								</div>
							)}
							{rental.roomInstance.roomNumber && (
								<div className="flex justify-between text-sm">
									<span className="text-gray-600">Số phòng:</span>
									<span className="font-medium text-gray-900">
										{rental.roomInstance.roomNumber}
									</span>
								</div>
							)}
							{rental.roomInstance.room.areaSqm && (
								<div className="flex justify-between text-sm">
									<span className="text-gray-600">Diện tích:</span>
									<span className="font-medium text-gray-900">
										{rental.roomInstance.room.areaSqm} m²
									</span>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Tenant Info (for landlord) */}
				{user?.role === 'landlord' && rental.tenant && (
					<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
						<h3 className="font-semibold text-gray-900 mb-3">Thông tin người thuê</h3>
						<div className="space-y-2">
							<div className="flex items-center">
								<Icon icon="zi-user" size={16} className="text-gray-400 mr-2" />
								<span className="text-sm text-gray-600">
									{rental.tenant.firstName} {rental.tenant.lastName}
								</span>
							</div>
							<div className="flex items-center">
								<Icon icon="zi-email" size={16} className="text-gray-400 mr-2" />
								<span className="text-sm text-gray-600">{rental.tenant.email}</span>
							</div>
							{rental.tenant.phone && (
								<div className="flex items-center">
									<Icon icon="zi-call" size={16} className="text-gray-400 mr-2" />
									<span className="text-sm text-gray-600">{rental.tenant.phone}</span>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Notes */}
				{rental.notes && (
					<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
						<h3 className="font-semibold text-gray-900 mb-2">Ghi chú</h3>
						<p className="text-sm text-gray-600">{rental.notes}</p>
					</div>
				)}

				{/* Actions */}
				{rental.status === 'active' && (
					<div className="space-y-3 mb-6">
						<Button
							fullWidth
							variant="primary"
							onClick={() => setShowRenewModal(true)}
						>
							<Icon icon="zi-calendar" className="mr-2" />
							Gia hạn hợp đồng
						</Button>
						{user?.role === 'landlord' && (
							<Button
								fullWidth
								variant="secondary"
								onClick={() => setShowTerminateModal(true)}
							>
								<Icon icon="zi-close-circle" className="mr-2" />
								Chấm dứt hợp đồng
							</Button>
						)}
					</div>
				)}

				{/* Quick Actions */}
				<div className="grid grid-cols-2 gap-3 mb-6">
					<Button
						variant="secondary"
						onClick={() => navigate(`/contracts?rentalId=${rental.id}`)}
					>
						<Icon icon="zi-note" className="mr-2" />
						Xem hợp đồng
					</Button>
					<Button
						variant="secondary"
						onClick={() => navigate(`/invoices?rentalId=${rental.id}`)}
					>
						<Icon icon="zi-receipt" className="mr-2" />
						Xem hóa đơn
					</Button>
				</div>
			</Box>

			{/* Terminate Modal */}
			{showTerminateModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg p-6 max-w-md w-full">
						<h3 className="text-lg font-semibold mb-4">Chấm dứt hợp đồng thuê</h3>
						<textarea
							placeholder="Nhập lý do chấm dứt hợp đồng..."
							value={terminationReason}
							onChange={(e) => setTerminationReason(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
							rows={4}
						/>
						<div className="flex gap-3">
							<Button
								fullWidth
								variant="secondary"
								onClick={() => setShowTerminateModal(false)}
								disabled={actionLoading}
							>
								Hủy
							</Button>
							<Button
								fullWidth
								variant="primary"
								onClick={handleTerminate}
								disabled={actionLoading || !terminationReason.trim()}
							>
								{actionLoading ? 'Đang xử lý...' : 'Xác nhận'}
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Renew Modal */}
			{showRenewModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg p-6 max-w-md w-full">
						<h3 className="text-lg font-semibold mb-4">Gia hạn hợp đồng</h3>
						<div className="mb-4">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Ngày kết thúc mới
							</label>
							<input
								type="date"
								value={newEndDate}
								onChange={(e) => setNewEndDate(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg"
							/>
						</div>
						<div className="flex gap-3">
							<Button
								fullWidth
								variant="secondary"
								onClick={() => setShowRenewModal(false)}
								disabled={actionLoading}
							>
								Hủy
							</Button>
							<Button
								fullWidth
								variant="primary"
								onClick={handleRenew}
								disabled={actionLoading || !newEndDate}
							>
								{actionLoading ? 'Đang xử lý...' : 'Xác nhận'}
							</Button>
						</div>
					</div>
				</div>
			)}
		</Page>
	);
};

export default RentalDetailPage;
