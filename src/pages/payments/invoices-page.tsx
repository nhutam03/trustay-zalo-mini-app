import React, { useEffect, useState } from 'react';
import { Page, Box, Icon } from 'zmp-ui';
import { useNavigate } from 'react-router-dom';
import useSetHeader from '@/hooks/useSetHeader';
import { changeStatusBarColor } from '@/utils/basic';
import BottomNav from '@/components/navigate-bottom';
import { useAuth } from '@/components/providers/auth-provider';
import {
	useTenantBills,
	useLandlordBills,
	useMarkBillAsPaid,
	useDeleteBill,
} from '@/hooks/useBillService';
import { Bill, BillStatus } from '@/interfaces/bill-interfaces';

const InvoicesPage: React.FC = () => {
	const setHeader = useSetHeader();
	const navigate = useNavigate();
	const { user } = useAuth();
	const [filter, setFilter] = useState<BillStatus | 'all'>('all');

	// Use appropriate hook based on user role
	const params = filter !== 'all' ? { status: filter } : {};
	const { data: billsData, isLoading } = user?.role === 'landlord'
		? useLandlordBills(params)
		: useTenantBills(params);

	const bills = billsData?.data || [];
	const loading = isLoading;

	const markAsPaidMutation = useMarkBillAsPaid();
	const deleteBillMutation = useDeleteBill();

	useEffect(() => {
		setHeader({
			title: 'Hóa đơn',
			hasLeftIcon: true,
			type: 'primary',
		});
		changeStatusBarColor('primary');
	}, []);

	const getStatusBadge = (status: string) => {
		const statusConfig = {
			pending: { text: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-800' },
			paid: { text: 'Đã thanh toán', color: 'bg-green-100 text-green-800' },
			overdue: { text: 'Quá hạn', color: 'bg-red-100 text-red-800' },
			cancelled: { text: 'Đã hủy', color: 'bg-gray-100 text-gray-600' },
		};
		const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
		return (
			<span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
				{config.text}
			</span>
		);
	};

	const handleInvoiceClick = (billId: string, e?: React.MouseEvent) => {
		if (e) e.stopPropagation();
		navigate(`/invoices/${billId}`);
	};

	const handleMarkAsPaid = async (billId: string, e: React.MouseEvent) => {
		e.stopPropagation();
		const confirmed = window.confirm('Bạn có chắc chắn muốn đánh dấu hóa đơn này đã thanh toán?');

		if (confirmed) {
			try {
				await markAsPaidMutation.mutateAsync(billId);
				alert('Đã đánh dấu hóa đơn là đã thanh toán');
			} catch (error) {
				console.error('Error marking bill as paid:', error);
				alert('Có lỗi khi đánh dấu hóa đơn');
			}
		}
	};

	const handleDeleteBill = async (billId: string, e: React.MouseEvent) => {
		e.stopPropagation();
		const confirmed = window.confirm('Bạn có chắc chắn muốn xóa hóa đơn này?');

		if (confirmed) {
			try {
				await deleteBillMutation.mutateAsync(billId);
				alert('Đã xóa hóa đơn thành công');
			} catch (error) {
				console.error('Error deleting bill:', error);
				alert('Có lỗi khi xóa hóa đơn');
			}
		}
	};

	const renderBillCard = (bill: Bill) => (
		<button
			key={bill.id}
			onClick={() => handleInvoiceClick(bill.id)}
			className="w-full bg-white p-4 mb-3 rounded-lg shadow-sm active:bg-gray-50"
		>
			<div className="flex justify-between items-start mb-3">
				<div className="flex-1 text-left">
					<h3 className="font-semibold text-gray-900 mb-1">
						Hóa đơn tháng {bill.billingMonth}/{bill.billingYear}
					</h3>
					<p className="text-sm text-gray-600">
						{bill.rental?.roomInstance?.room?.name || 'Phòng không xác định'}
					</p>
					{bill.rental?.roomInstance?.room?.building?.name && (
						<p className="text-xs text-gray-500 mt-1">
							{bill.rental.roomInstance.room.building.name}
						</p>
					)}
				</div>
				{getStatusBadge(bill.status)}
			</div>

			<div className="space-y-2 mb-3">
				<div className="flex items-center justify-between text-sm">
					<span className="text-gray-600">Tổng tiền:</span>
					<span className="font-semibold text-primary">
						{Number(bill.totalAmount).toLocaleString('vi-VN')} đ
					</span>
				</div>
				<div className="flex items-center text-sm">
					<Icon icon="zi-calendar" size={16} className="text-gray-400 mr-2" />
					<span className="text-gray-600">
						Hạn thanh toán: {new Date(bill.dueDate).toLocaleDateString('vi-VN')}
					</span>
				</div>
				{bill.paidDate && (
					<div className="flex items-center text-sm">
						<Icon icon="zi-check-circle" size={16} className="text-green-500 mr-2" />
						<span className="text-gray-600">
							Đã thanh toán: {new Date(bill.paidDate).toLocaleDateString('vi-VN')}
						</span>
					</div>
				)}
			</div>

			{bill.billItems && bill.billItems.length > 0 && (
				<div className="pt-2 border-t border-gray-100">
					<div className="space-y-1">
						{bill.billItems.slice(0, 3).map((item, index) => (
							<div key={item.id || index} className="flex justify-between text-xs text-gray-600">
								<span>{item.itemName}</span>
								<span>{Number(item.amount).toLocaleString('vi-VN')} đ</span>
							</div>
						))}
					</div>
				</div>
			)}

			<div className="flex items-center justify-end pt-2">
				<Icon icon="zi-chevron-right" size={20} className="text-gray-400" />
			</div>

			{/* Action buttons for landlord */}
			{user?.role === 'landlord' && (
				<>
					{(bill.status === 'pending' || bill.status === 'overdue') && (
						<div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
							<button
								onClick={(e) => handleMarkAsPaid(bill.id, e)}
								className="flex-1 px-3 py-2 bg-green-500 text-white text-sm font-medium rounded-lg active:bg-green-600"
							>
								Đánh dấu đã thanh toán
							</button>
							<button
								onClick={(e) => handleDeleteBill(bill.id, e)}
								className="px-3 py-2 bg-red-500 text-white text-sm font-medium rounded-lg active:bg-red-600"
							>
								Xóa
							</button>
						</div>
					)}
					{bill.status === 'cancelled' && (
						<div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
							<button
								onClick={(e) => handleDeleteBill(bill.id, e)}
								className="flex-1 px-3 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg active:bg-gray-600"
							>
								Xóa
							</button>
						</div>
					)}
				</>
			)}
		</button>
	);

	const calculateStats = () => {
		const totalPaid = bills
			.filter((bill) => bill.status === 'paid')
			.reduce((sum, bill) => sum + Number(bill.totalAmount), 0);
		const totalPending = bills
			.filter((bill) => bill.status === 'pending')
			.reduce((sum, bill) => sum + Number(bill.totalAmount), 0);
		const totalOverdue = bills
			.filter((bill) => bill.status === 'overdue')
			.reduce((sum, bill) => sum + Number(bill.totalAmount), 0);

		return { totalPaid, totalPending, totalOverdue };
	};

	const stats = calculateStats();

	return (
		<Page className="bg-gray-50">
			{/* Stats Summary */}
			<Box className="bg-white mb-2 px-4 py-3">
				<div className="grid grid-cols-3 gap-3">
					<div className="text-center">
						<p className="text-xs text-gray-500 mb-1">Đã thanh toán</p>
						<p className="text-sm font-semibold text-green-600">
							{(stats.totalPaid / 1000000).toFixed(1)}M
						</p>
					</div>
					<div className="text-center border-l border-r border-gray-200">
						<p className="text-xs text-gray-500 mb-1">Chờ thanh toán</p>
						<p className="text-sm font-semibold text-yellow-600">
							{(stats.totalPending / 1000000).toFixed(1)}M
						</p>
					</div>
					<div className="text-center">
						<p className="text-xs text-gray-500 mb-1">Quá hạn</p>
						<p className="text-sm font-semibold text-red-600">
							{(stats.totalOverdue / 1000000).toFixed(1)}M
						</p>
					</div>
				</div>
			</Box>

			{/* Landlord Actions */}
			{user?.role === 'landlord' && (
				<Box className="bg-white mb-2 px-4 py-3">
					<button
						onClick={() => navigate('/generate-monthly-bills')}
						className="w-full flex items-center justify-between p-3 bg-primary bg-opacity-10 rounded-lg active:bg-opacity-20 transition-colors"
					>
						<div className="flex items-center">
							<Icon icon="zi-plus-circle" size={20} className="text-primary mr-2" />
							<span className="text-sm font-medium text-primary">Tạo hóa đơn hàng tháng</span>
						</div>
						<Icon icon="zi-chevron-right" size={20} className="text-primary" />
					</button>
				</Box>
			)}

			{/* Filter tabs */}
			<Box className="bg-white mb-2 px-4 py-3">
				<div className="flex gap-2 overflow-x-auto">
					{[
						{ key: 'all', label: 'Tất cả' },
						{ key: 'pending', label: 'Chờ thanh toán' },
						{ key: 'paid', label: 'Đã thanh toán' },
						{ key: 'overdue', label: 'Quá hạn' },
					].map((tab) => (
						<button
							key={tab.key}
							onClick={() => setFilter(tab.key as 'all' | BillStatus)}
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

			<Box className="px-4 py-2">
				{loading ? (
					<div className="flex justify-center items-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					</div>
				) : bills.length > 0 ? (
					bills.map((bill) => renderBillCard(bill))
				) : (
					<div className="text-center py-8">
						<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
							<Icon icon="zi-note" size={32} className="text-gray-400" />
						</div>
						<p className="text-gray-500 mb-2">Chưa có hóa đơn nào</p>
						<p className="text-sm text-gray-400">Hóa đơn sẽ được tạo hàng tháng cho phòng đang thuê</p>
					</div>
				)}
			</Box>
		</Page>
	);
};

export default InvoicesPage;
