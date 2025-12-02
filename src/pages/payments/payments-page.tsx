import React, { useState } from 'react';
import { Page, Box, Text, Button, Select, useNavigate } from 'zmp-ui';
import useSetHeader from '@/hooks/useSetHeader';
import {
	usePayments,
	usePaymentHistory,
	usePaymentStatistics,
} from '@/hooks/usePaymentService';
import { formatCurrency } from '@/utils/format';

const { Option } = Select;

const PaymentsPage: React.FC = () => {
	const setHeader = useSetHeader();
	const navigate = useNavigate();
	
	React.useEffect(() => {
		setHeader({ title: 'Quản lý thanh toán', hasLeftIcon: true });
	}, [setHeader]);

	const [activeTab, setActiveTab] = useState<'all' | 'history' | 'stats'>('all');
	const [statusFilter, setStatusFilter] = useState<string>('');
	const [paymentTypeFilter, setPaymentTypeFilter] = useState<string>('');

	// Fetch data
	const { data: paymentsData, isLoading: paymentsLoading } = usePayments({
		status: statusFilter || undefined,
		paymentType: paymentTypeFilter || undefined,
		page: 1,
		limit: 20,
	});

	const { data: historyData, isLoading: historyLoading } = usePaymentHistory({
		page: 1,
		limit: 20,
	});

	const { data: statsData, isLoading: statsLoading } = usePaymentStatistics();

	const handlePaymentClick = (paymentId: string) => {
		navigate(`/payment-detail/${paymentId}`);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'completed':
				return 'text-green-600';
			case 'pending':
				return 'text-yellow-600';
			case 'failed':
				return 'text-red-600';
			case 'refunded':
				return 'text-blue-600';
			default:
				return 'text-gray-600';
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case 'completed':
				return 'Hoàn thành';
			case 'pending':
				return 'Đang chờ';
			case 'failed':
				return 'Thất bại';
			case 'refunded':
				return 'Đã hoàn tiền';
			default:
				return status;
		}
	};

	const renderAllPayments = () => {
		if (paymentsLoading) {
			return (
				<Box className="flex justify-center items-center py-8">
					<Text>Đang tải...</Text>
				</Box>
			);
		}

		if (!paymentsData?.data || paymentsData.data.length === 0) {
			return (
				<Box className="flex flex-col items-center justify-center py-12">
					<Text className="text-gray-500">Không có giao dịch nào</Text>
				</Box>
			);
		}

		return (
			<Box className="space-y-3">
				{paymentsData.data.map((payment: any) => (
					<Box
						key={payment.id}
						className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
						onClick={() => handlePaymentClick(payment.id)}
					>
						<Box className="flex justify-between items-start mb-2">
							<Box className="flex-1">
								<Text className="font-semibold text-gray-800">
									{payment.paymentType === 'deposit'
										? 'Tiền cọc'
										: payment.paymentType === 'rent'
											? 'Tiền thuê'
											: payment.paymentType === 'bill'
												? 'Hóa đơn'
												: 'Khác'}
								</Text>
								<Text className="text-xs text-gray-500 mt-1">
									{new Date(payment.createdAt).toLocaleDateString('vi-VN')}
								</Text>
							</Box>
							<Text className={`text-sm font-semibold ${getStatusColor(payment.status)}`}>
								{getStatusText(payment.status)}
							</Text>
						</Box>
						<Box className="flex justify-between items-center">
							<Text className="text-xs text-gray-600">
								{payment.contractId ? `Hợp đồng #${payment.contractId.slice(0, 8)}` : ''}
							</Text>
							<Text className="font-bold text-blue-600">
								{formatCurrency(payment.amount)}
							</Text>
						</Box>
						{payment.description && (
							<Text className="text-xs text-gray-600 mt-2">{payment.description}</Text>
						)}
					</Box>
				))}
			</Box>
		);
	};

	const renderPaymentHistory = () => {
		if (historyLoading) {
			return (
				<Box className="flex justify-center items-center py-8">
					<Text>Đang tải...</Text>
				</Box>
			);
		}

		if (!historyData?.data || historyData.data.length === 0) {
			return (
				<Box className="flex flex-col items-center justify-center py-12">
					<Text className="text-gray-500">Không có lịch sử thanh toán</Text>
				</Box>
			);
		}

		return (
			<Box className="space-y-3">
				{historyData.data.map((record: any) => (
					<Box
						key={record.id}
						className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
					>
						<Box className="flex justify-between items-start mb-2">
							<Text className="font-semibold text-gray-800">{record.description}</Text>
							<Text className={`text-sm font-semibold ${getStatusColor(record.status)}`}>
								{getStatusText(record.status)}
							</Text>
						</Box>
						<Box className="flex justify-between items-center mt-2">
							<Text className="text-xs text-gray-600">
								{new Date(record.createdAt).toLocaleDateString('vi-VN', {
									day: '2-digit',
									month: '2-digit',
									year: 'numeric',
									hour: '2-digit',
									minute: '2-digit',
								})}
							</Text>
							<Text className="font-bold text-blue-600">
								{formatCurrency(record.amount)}
							</Text>
						</Box>
					</Box>
				))}
			</Box>
		);
	};

	const renderStatistics = () => {
		if (statsLoading) {
			return (
				<Box className="flex justify-center items-center py-8">
					<Text>Đang tải...</Text>
				</Box>
			);
		}

		if (!statsData) {
			return (
				<Box className="flex flex-col items-center justify-center py-12">
					<Text className="text-gray-500">Không có dữ liệu thống kê</Text>
				</Box>
			);
		}

		return (
			<Box className="space-y-4">
				<Box className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 shadow-md">
					<Text className="text-white text-sm mb-2">Tổng đã thanh toán</Text>
				<Text className="text-white text-3xl font-bold">
					{formatCurrency(statsData.completedAmount || 0)}
				</Text>
				</Box>

				<Box className="grid grid-cols-2 gap-3">
					<Box className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
						<Text className="text-yellow-800 text-xs mb-1">Đang chờ</Text>
					<Text className="text-yellow-900 text-xl font-bold">
						{formatCurrency(statsData.pendingAmount || 0)}
					</Text>
					<Text className="text-yellow-700 text-xs mt-1">
						{statsData.pendingPayments || 0} giao dịch
					</Text>
					</Box>

					<Box className="bg-green-50 rounded-lg p-4 border border-green-200">
						<Text className="text-green-800 text-xs mb-1">Hoàn thành</Text>
					<Text className="text-green-900 text-xl font-bold">
						{formatCurrency(statsData.completedAmount || 0)}
					</Text>
					<Text className="text-green-700 text-xs mt-1">
						{statsData.completedPayments || 0} giao dịch
					</Text>
					</Box>

				<Box className="bg-blue-50 rounded-lg p-4 border border-blue-200">
					<Text className="text-blue-800 text-xs mb-1">Quá hạn</Text>
					<Text className="text-blue-900 text-xl font-bold">
						{formatCurrency(statsData.overdueAmount || 0)}
					</Text>
					<Text className="text-blue-700 text-xs mt-1">
						{statsData.overduePayments || 0} giao dịch
					</Text>
				</Box>
				</Box>
			</Box>
		);
	};

	return (
		<Page className="bg-gray-50">
			<Box className="p-4">
				{/* Tabs */}
				<Box className="flex space-x-2 mb-4 bg-white rounded-lg p-1 shadow-sm">
					<Button
						size="small"
						variant={activeTab === 'all' ? 'primary' : 'tertiary'}
						onClick={() => setActiveTab('all')}
						className="flex-1"
					>
						Tất cả
					</Button>
					<Button
						size="small"
						variant={activeTab === 'history' ? 'primary' : 'tertiary'}
						onClick={() => setActiveTab('history')}
						className="flex-1"
					>
						Lịch sử
					</Button>
					<Button
						size="small"
						variant={activeTab === 'stats' ? 'primary' : 'tertiary'}
						onClick={() => setActiveTab('stats')}
						className="flex-1"
					>
						Thống kê
					</Button>
				</Box>

				{/* Filters (only show for 'all' tab) */}
				{activeTab === 'all' && (
					<Box className="bg-white rounded-lg p-4 mb-4 shadow-sm space-y-3">
						<Box>
							<Text className="text-sm font-medium mb-2">Trạng thái</Text>
							<Select
								value={statusFilter}
								onChange={(value) => setStatusFilter(value as string)}
								placeholder="Tất cả trạng thái"
							>
								<Option value="" title="Tất cả" />
								<Option value="pending" title="Đang chờ" />
								<Option value="completed" title="Hoàn thành" />
								<Option value="failed" title="Thất bại" />
								<Option value="refunded" title="Đã hoàn tiền" />
							</Select>
						</Box>

						<Box>
							<Text className="text-sm font-medium mb-2">Loại thanh toán</Text>
							<Select
								value={paymentTypeFilter}
								onChange={(value) => setPaymentTypeFilter(value as string)}
								placeholder="Tất cả loại"
							>
								<Option value="" title="Tất cả" />
								<Option value="deposit" title="Tiền cọc" />
								<Option value="rent" title="Tiền thuê" />
								<Option value="bill" title="Hóa đơn" />
								<Option value="other" title="Khác" />
							</Select>
						</Box>
					</Box>
				)}

				{/* Content */}
				<Box>
					{activeTab === 'all' && renderAllPayments()}
					{activeTab === 'history' && renderPaymentHistory()}
					{activeTab === 'stats' && renderStatistics()}
				</Box>
			</Box>
		</Page>
	);
};

export default PaymentsPage;
