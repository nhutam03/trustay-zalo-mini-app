import React, { useEffect, useState } from 'react';
import { Page, Box, Icon } from 'zmp-ui';
import { useNavigate } from 'react-router-dom';
import useSetHeader from '@/hooks/useSetHeader';
import { changeStatusBarColor } from '@/utils/basic';
import BottomNav from '@/components/navigate-bottom';
import { useAuth } from '@/components/providers/auth-provider';

interface Invoice {
	id: string;
	rentalId: string;
	month: string;
	year: number;
	amount: number;
	status: 'pending' | 'paid' | 'overdue' | 'cancelled';
	dueDate: string;
	paidDate?: string;
	roomName: string;
	roomNumber: string;
	buildingName: string;
	items: {
		description: string;
		amount: number;
	}[];
}

const InvoicesPage: React.FC = () => {
	const setHeader = useSetHeader();
	const navigate = useNavigate();
	const { user } = useAuth();
	const [filter, setFilter] = useState<string>('all');
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setHeader({
			title: 'Hóa đơn',
			hasLeftIcon: true,
			type: 'primary',
		});
		changeStatusBarColor('primary');
		// TODO: Load invoices from API
		// For now, using mock data
		loadInvoices();
	}, []);

	const loadInvoices = async () => {
		setLoading(true);
		// TODO: Replace with actual API call
		// Simulating API call
		setTimeout(() => {
			const mockInvoices: Invoice[] = [
				{
					id: '1',
					rentalId: 'rental-1',
					month: '11',
					year: 2025,
					amount: 5500000,
					status: 'paid',
					dueDate: '2025-11-05',
					paidDate: '2025-11-03',
					roomName: 'Phòng Studio cao cấp',
					roomNumber: '101',
					buildingName: 'Nhà trọ ABC',
					items: [
						{ description: 'Tiền phòng', amount: 5000000 },
						{ description: 'Tiền điện', amount: 300000 },
						{ description: 'Tiền nước', amount: 200000 },
					],
				},
				{
					id: '2',
					rentalId: 'rental-1',
					month: '10',
					year: 2025,
					amount: 5300000,
					status: 'paid',
					dueDate: '2025-10-05',
					paidDate: '2025-10-04',
					roomName: 'Phòng Studio cao cấp',
					roomNumber: '101',
					buildingName: 'Nhà trọ ABC',
					items: [
						{ description: 'Tiền phòng', amount: 5000000 },
						{ description: 'Tiền điện', amount: 200000 },
						{ description: 'Tiền nước', amount: 100000 },
					],
				},
				{
					id: '3',
					rentalId: 'rental-2',
					month: '11',
					year: 2025,
					amount: 3500000,
					status: 'pending',
					dueDate: '2025-11-10',
					roomName: 'Phòng đơn',
					roomNumber: '205',
					buildingName: 'Nhà trọ XYZ',
					items: [
						{ description: 'Tiền phòng', amount: 3000000 },
						{ description: 'Tiền điện', amount: 350000 },
						{ description: 'Tiền nước', amount: 150000 },
					],
				},
				{
					id: '4',
					rentalId: 'rental-2',
					month: '09',
					year: 2025,
					amount: 3500000,
					status: 'overdue',
					dueDate: '2025-09-10',
					roomName: 'Phòng đơn',
					roomNumber: '205',
					buildingName: 'Nhà trọ XYZ',
					items: [
						{ description: 'Tiền phòng', amount: 3000000 },
						{ description: 'Tiền điện', amount: 300000 },
						{ description: 'Tiền nước', amount: 200000 },
					],
				},
			];
			setInvoices(mockInvoices);
			setLoading(false);
		}, 500);
	};

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

	const handleInvoiceClick = (invoiceId: string) => {
		navigate(`/invoices/${invoiceId}`);
	};

	const filteredInvoices = invoices.filter((invoice) => {
		if (filter === 'all') return true;
		return invoice.status === filter;
	});

	const renderInvoiceCard = (invoice: Invoice) => (
		<button
			key={invoice.id}
			onClick={() => handleInvoiceClick(invoice.id)}
			className="w-full bg-white p-4 mb-3 rounded-lg shadow-sm active:bg-gray-50"
		>
			<div className="flex justify-between items-start mb-3">
				<div className="flex-1 text-left">
					<h3 className="font-semibold text-gray-900 mb-1">
						Hóa đơn tháng {invoice.month}/{invoice.year}
					</h3>
					<p className="text-sm text-gray-600">
						{invoice.roomName} - Phòng {invoice.roomNumber}
					</p>
					<p className="text-xs text-gray-500 mt-1">{invoice.buildingName}</p>
				</div>
				{getStatusBadge(invoice.status)}
			</div>

			<div className="space-y-2 mb-3">
				<div className="flex items-center justify-between text-sm">
					<span className="text-gray-600">Tổng tiền:</span>
					<span className="font-semibold text-primary">
						{invoice.amount.toLocaleString('vi-VN')} đ
					</span>
				</div>
				<div className="flex items-center text-sm">
					<Icon icon="zi-calendar" size={16} className="text-gray-400 mr-2" />
					<span className="text-gray-600">
						Hạn thanh toán: {new Date(invoice.dueDate).toLocaleDateString('vi-VN')}
					</span>
				</div>
				{invoice.paidDate && (
					<div className="flex items-center text-sm">
						<Icon icon="zi-check-circle" size={16} className="text-green-500 mr-2" />
						<span className="text-gray-600">
							Đã thanh toán: {new Date(invoice.paidDate).toLocaleDateString('vi-VN')}
						</span>
					</div>
				)}
			</div>

			<div className="pt-2 border-t border-gray-100">
				<div className="space-y-1">
					{invoice.items.map((item, index) => (
						<div key={index} className="flex justify-between text-xs text-gray-600">
							<span>{item.description}</span>
							<span>{item.amount.toLocaleString('vi-VN')} đ</span>
						</div>
					))}
				</div>
			</div>

			<div className="flex items-center justify-end pt-2">
				<Icon icon="zi-chevron-right" size={20} className="text-gray-400" />
			</div>
		</button>
	);

	const calculateStats = () => {
		const totalPaid = invoices
			.filter((inv) => inv.status === 'paid')
			.reduce((sum, inv) => sum + inv.amount, 0);
		const totalPending = invoices
			.filter((inv) => inv.status === 'pending')
			.reduce((sum, inv) => sum + inv.amount, 0);
		const totalOverdue = invoices
			.filter((inv) => inv.status === 'overdue')
			.reduce((sum, inv) => sum + inv.amount, 0);

		return { totalPaid, totalPending, totalOverdue };
	};

	const stats = calculateStats();

	return (
		<Page className="bg-gray-50 has-bottom-nav">
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

			<Box className="px-4 py-2">
				{loading ? (
					<div className="flex justify-center items-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					</div>
				) : filteredInvoices.length > 0 ? (
					filteredInvoices.map((invoice) => renderInvoiceCard(invoice))
				) : (
					<div className="text-center py-8">
						<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
							<Icon icon="zi-note-text" size={32} className="text-gray-400" />
						</div>
						<p className="text-gray-500 mb-2">Chưa có hóa đơn nào</p>
						<p className="text-sm text-gray-400">Hóa đơn sẽ được tạo hàng tháng cho phòng đang thuê</p>
					</div>
				)}
			</Box>

			<BottomNav />
		</Page>
	);
};

export default InvoicesPage;
