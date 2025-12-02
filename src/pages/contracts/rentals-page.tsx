import React, { useEffect, useState } from 'react';
import { Page, Box, Icon } from 'zmp-ui';
import { useNavigate } from 'react-router-dom';
import useSetHeader from '@/hooks/useSetHeader';
import { changeStatusBarColor } from '@/utils/basic';
import BottomNav from '@/components/navigate-bottom';
import {
	useLandlordRentals,
	useTenantRentals,
	useTerminateRental,
	useRenewRental,
	useDeleteRental,
} from '@/hooks/useRentalService';
import { Rental } from '@/services/rental-service';
import { useAuth } from '@/components/providers/auth-provider';

const RentalsPage: React.FC = () => {
	const setHeader = useSetHeader();
	const navigate = useNavigate();
	const { user } = useAuth();
	const [filter, setFilter] = useState<string>('all');

	// Lấy data dựa vào role - chỉ gọi 1 hook dựa trên role
	const params = filter !== 'all' ? { status: filter } : {};

	const query =
		user?.role === 'landlord' ? useLandlordRentals(params) : useTenantRentals(params);

	const rentals = query.data?.data || [];
	const loading = query.isLoading;

	const terminateMutation = useTerminateRental();
	const renewMutation = useRenewRental();
	const deleteMutation = useDeleteRental();

	useEffect(() => {
		setHeader({
			title: 'Quản lý cho thuê',
			hasLeftIcon: true,
			type: 'primary',
		});
		changeStatusBarColor('primary');
	}, []);

	const getStatusBadge = (status: string) => {
		const statusConfig = {
			active: { text: 'Đang hoạt động', color: 'bg-green-100 text-green-800' },
			pending: { text: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
			terminated: { text: 'Đã chấm dứt', color: 'bg-red-100 text-red-800' },
			expired: { text: 'Hết hạn', color: 'bg-gray-100 text-gray-600' },
		};
		const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
		return (
			<span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
				{config.text}
			</span>
		);
	};

	const handleRentalClick = (rentalId: string, e?: React.MouseEvent) => {
		if (e) e.stopPropagation();
		navigate(`/rentals/${rentalId}`);
	};

	const handleTerminateRental = async (rentalId: string, e: React.MouseEvent) => {
		e.stopPropagation();
		const confirmed = window.confirm('Bạn có chắc chắn muốn chấm dứt hợp đồng cho thuê này?');

		if (confirmed) {
			try {
				await terminateMutation.mutateAsync({
					id: rentalId,
					data: { terminationDate: new Date().toISOString(), reason: 'Chấm dứt bởi chủ nhà' },
				});
				alert('Đã chấm dứt hợp đồng thành công');
			} catch (error) {
				console.error('Error terminating rental:', error);
				alert('Có lỗi khi chấm dứt hợp đồng');
			}
		}
	};

	const handleRenewRental = async (rentalId: string, e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			await renewMutation.mutateAsync({
				id: rentalId,
				data: { newEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() },
			});
			alert('Đã gia hạn hợp đồng thành công');
		} catch (error) {
			console.error('Error renewing rental:', error);
			alert('Có lỗi khi gia hạn hợp đồng');
		}
	};

	const handleDeleteRental = async (rentalId: string, e: React.MouseEvent) => {
		e.stopPropagation();
		const confirmed = window.confirm('Bạn có chắc chắn muốn xóa hợp đồng cho thuê này?');

		if (confirmed) {
			try {
				await deleteMutation.mutateAsync(rentalId);
				alert('Đã xóa hợp đồng thành công');
			} catch (error) {
				console.error('Error deleting rental:', error);
				alert('Có lỗi khi xóa hợp đồng');
			}
		}
	};

	const renderRentalCard = (rental: Rental) => (
		<button
			key={rental.id}
			onClick={() => handleRentalClick(rental.id)}
			className="w-full bg-white p-4 mb-3 rounded-lg shadow-sm active:bg-gray-50"
		>
			<div className="flex justify-between items-start mb-3">
				<div className="flex-1 text-left">
					<h3 className="font-semibold text-gray-900 mb-1">
						{rental.roomInstance?.room?.name || 'Phòng không xác định'}
					</h3>
					<p className="text-sm text-gray-600">
						Phòng {rental.roomInstance?.roomNumber} -{' '}
						{rental.roomInstance?.room?.building?.name}
					</p>
					<p className="text-xs text-gray-500 mt-1">
						{rental.roomInstance?.room?.building?.address}
					</p>
				</div>
				{getStatusBadge(rental.status)}
			</div>

			<div className="space-y-2 mb-3">
				<div className="flex items-center text-sm">
					<Icon icon="zi-calendar" size={16} className="text-gray-400 mr-2" />
					<span className="text-gray-600">
						{new Date(rental.createdAt).toLocaleDateString('vi-VN')}
						{rental.contractEndDate && ` - ${new Date(rental.contractEndDate).toLocaleDateString('vi-VN')}`}
					</span>
				</div>
				<div className="flex items-center text-sm">
					<Icon icon="zi-poll" size={16} className="text-gray-400 mr-2" />
					<span className="text-gray-600">
						{Number(rental.monthlyRent).toLocaleString('vi-VN')} đ/tháng
					</span>
				</div>
				{rental.depositPaid && Number(rental.depositPaid) > 0 && (
					<div className="flex items-center text-sm">
						<Icon icon="zi-check-circle" size={16} className="text-gray-400 mr-2" />
						<span className="text-gray-600">
							Đặt cọc: {Number(rental.depositPaid).toLocaleString('vi-VN')} đ
						</span>
					</div>
				)}
			</div>

			{user?.role === 'landlord' && rental.tenant && (
				<>
					<div className="flex items-center justify-between pt-2 border-t border-gray-100">
						<div className="flex items-center text-sm text-gray-600">
							<Icon icon="zi-user" size={16} className="mr-1" />
							<span>
								Người thuê: {rental.tenant.firstName} {rental.tenant.lastName}
							</span>
						</div>
						<Icon icon="zi-chevron-right" size={20} className="text-gray-400" />
					</div>
					{rental.status === 'active' && (
						<div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
							<button
								onClick={(e) => handleRenewRental(rental.id, e)}
								className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg active:bg-blue-600"
							>
								Gia hạn
							</button>
							<button
								onClick={(e) => handleTerminateRental(rental.id, e)}
								className="flex-1 px-3 py-2 bg-red-500 text-white text-sm font-medium rounded-lg active:bg-red-600"
							>
								Chấm dứt
							</button>
						</div>
					)}
					{(rental.status === 'terminated' || rental.status === 'expired') && (
						<div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
							<button
								onClick={(e) => handleDeleteRental(rental.id, e)}
								className="flex-1 px-3 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg active:bg-gray-600"
							>
								Xóa
							</button>
						</div>
					)}
				</>
			)}

			{user?.role === 'tenant' && (
				<div className="flex items-center justify-end pt-2 border-t border-gray-100">
					<Icon icon="zi-chevron-right" size={20} className="text-gray-400" />
				</div>
			)}
		</button>
	);

	return (
		<Page className="bg-gray-50">
			{/* Filter tabs */}
			<Box className="bg-white mb-2 px-4 py-3">
				<div className="flex gap-2 overflow-x-auto">
					{[
						{ key: 'all', label: 'Tất cả' },
						{ key: 'active', label: 'Đang hoạt động' },
						{ key: 'pending', label: 'Chờ xác nhận' },
						{ key: 'terminated', label: 'Đã chấm dứt' },
					].map((tab) => (
						<button
							key={tab.key}
							onClick={() => setFilter(tab.key)}
							className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
								filter === tab.key
									? 'bg-primary text-white'
									: 'bg-gray-100 text-gray-700 active:bg-gray-200'
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>
			</Box>

			{/* Quick Access Button to Room Issues */}
			<Box className="px-4 py-2 mb-2">
				<button
					onClick={() => navigate('/room-issues')}
					className="w-full bg-white p-3 rounded-lg shadow-sm flex items-center justify-between active:bg-gray-50"
				>
					<div className="flex items-center gap-3">
						<div className="p-2 bg-orange-50 rounded-lg">
							<Icon icon="zi-warning" size={20} className="text-orange-600" />
						</div>
						<div className="text-left">
							<p className="font-medium text-gray-900">
								{user?.role === 'landlord' ? 'Sự cố cần xử lý' : 'Sự cố đã báo cáo'}
							</p>
							<p className="text-xs text-gray-500">
								{user?.role === 'landlord' ? 'Xem các sự cố được báo cáo' : 'Xem các sự cố bạn đã báo cáo'}
							</p>
						</div>
					</div>
					<Icon icon="zi-chevron-right" size={20} className="text-gray-400" />
				</button>
			</Box>

			<Box className="px-4 py-2">
				{loading ? (
					<div className="flex justify-center items-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					</div>
				) : rentals.length > 0 ? (
					rentals.map((rental) => renderRentalCard(rental))
				) : (
					<div className="text-center py-8">
						<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
							<Icon icon="zi-home" size={32} className="text-gray-400" />
						</div>
						<p className="text-gray-500 mb-2">
							{user?.role === 'landlord' ? 'Chưa có phòng cho thuê nào' : 'Bạn chưa thuê phòng nào'}
						</p>
						<p className="text-sm text-gray-400">
							{user?.role === 'landlord'
								? 'Khi có người thuê phòng, thông tin sẽ hiển thị tại đây'
								: 'Hãy tìm và đặt phòng để bắt đầu'}
						</p>
					</div>
				)}
			</Box>
		</Page>
	);
};

export default RentalsPage;
