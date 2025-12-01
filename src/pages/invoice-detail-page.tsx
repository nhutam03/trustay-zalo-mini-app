import React, { useEffect, useState } from 'react';
import { Page, Box, Icon, Button } from 'zmp-ui';
import { useParams, useNavigate } from 'react-router-dom';
import useSetHeader from '@/hooks/useSetHeader';
import { changeStatusBarColor } from '@/utils/basic';
import { useBill, useMarkBillAsPaid, useCreatePayOSLink } from '@/hooks/useBillService';
import { useAuth } from '@/components/providers/auth-provider';
import { openWebview } from 'zmp-sdk/apis';

const InvoiceDetailPage: React.FC = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const setHeader = useSetHeader();
	const { user } = useAuth();
	const [isCreatingPayment, setIsCreatingPayment] = useState(false);

	// Use hooks
	const { data: billData, isLoading: loading } = useBill(id || '', !!id);
	const markAsPaidMutation = useMarkBillAsPaid();
	const createPayOSLinkMutation = useCreatePayOSLink();

	const bill = billData?.data;

	useEffect(() => {
		setHeader({
			title: 'Chi tiết hóa đơn',
			hasLeftIcon: true,
			type: 'primary',
		});
		changeStatusBarColor('primary');
	}, []);

	const handleMarkAsPaid = async () => {
		if (!id) return;
		try {
			await markAsPaidMutation.mutateAsync(id);
			alert('Đã đánh dấu hóa đơn là đã thanh toán');
		} catch (error) {
			console.error('Error marking bill as paid:', error);
			alert('Không thể đánh dấu đã thanh toán');
		}
	};

	const handlePayWithPayOS = async () => {
		if (!id) return;
		
		setIsCreatingPayment(true);
		try {
			const response = await createPayOSLinkMutation.mutateAsync({
				billId: id,
			});

			if (response.checkoutUrl) {
				// Open PayOS checkout in webview
				await openWebview({
					url: response.checkoutUrl,
					config: {
						style: 'bottomSheet',
						leftButton: 'back',
					},
				});
			} else {
				throw new Error('Không nhận được link thanh toán');
			}
		} catch (error) {
			console.error('Error creating PayOS link:', error);
			alert('Không thể tạo link thanh toán. Vui lòng thử lại sau.');
		} finally {
			setIsCreatingPayment(false);
		}
	};

	const getStatusBadge = (status: string) => {
		const statusConfig = {
			draft: { text: 'Nháp', color: 'bg-gray-100 text-gray-800' },
			pending: { text: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-800' },
			paid: { text: 'Đã thanh toán', color: 'bg-green-100 text-green-800' },
			overdue: { text: 'Quá hạn', color: 'bg-red-100 text-red-800' },
			cancelled: { text: 'Đã hủy', color: 'bg-gray-100 text-gray-600' },
		};
		const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
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

	if (!bill) {
		return (
			<Page className="bg-gray-50 flex items-center justify-center min-h-screen">
				<Box className="text-center">
					<p className="text-gray-500 mb-4">Không tìm thấy hóa đơn</p>
					<Button onClick={() => navigate('/invoices')}>Quay lại</Button>
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
								Hóa đơn tháng {bill.billingMonth}/{bill.billingYear}
							</h2>
							<p className="text-sm text-gray-600">{bill.billingPeriod}</p>
						</div>
						{getStatusBadge(bill.status)}
					</div>

					<div className="bg-primary bg-opacity-5 rounded-lg p-4 mt-4">
						<p className="text-xs text-gray-600 mb-1">Tổng tiền</p>
						<p className="text-2xl font-bold text-primary">
							{Number(bill.totalAmount).toLocaleString('vi-VN')} đ
						</p>
					</div>
				</div>

				{/* Period Info */}
				<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
					<h3 className="font-semibold text-gray-900 mb-3">Kỳ thanh toán</h3>
					<div className="space-y-2">
						<div className="flex items-center text-sm">
							<Icon icon="zi-calendar" size={16} className="text-gray-400 mr-2" />
							<span className="text-gray-600">
								Từ {new Date(bill.periodStart).toLocaleDateString('vi-VN')} đến{' '}
								{new Date(bill.periodEnd).toLocaleDateString('vi-VN')}
							</span>
						</div>
						<div className="flex items-center text-sm">
							<Icon icon="zi-clock" size={16} className="text-gray-400 mr-2" />
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
						{bill.occupancyCount && (
							<div className="flex items-center text-sm">
								<Icon icon="zi-user-group" size={16} className="text-gray-400 mr-2" />
								<span className="text-gray-600">Số người ở: {bill.occupancyCount}</span>
							</div>
						)}
					</div>
				</div>

				{/* Bill Items */}
				<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
					<h3 className="font-semibold text-gray-900 mb-3">Chi tiết hóa đơn</h3>
					<div className="space-y-3">
						{bill.billItems && bill.billItems.length > 0 ? (
							<>
								{bill.billItems.map((item, index) => (
									<div key={item.id || index} className="pb-3 border-b border-gray-100 last:border-0">
										<div className="flex justify-between items-start mb-1">
											<div className="flex-1">
												<p className="text-sm font-medium text-gray-900">{item.itemName}</p>
												{item.description && (
													<p className="text-xs text-gray-500 mt-1">{item.description}</p>
												)}
											</div>
											<p className="text-sm font-semibold text-gray-900">
												{Number(item.amount).toLocaleString('vi-VN')} đ
											</p>
										</div>
										{item.meterReading && (
											<div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
												<span>
													Chỉ số: {item.meterReading.lastReading} → {item.meterReading.currentReading}
												</span>
												<span className="text-gray-400">•</span>
												<span>
													Tiêu thụ: {item.meterReading.consumption} {item.meterReading.unit}
												</span>
											</div>
										)}
										{item.quantity && item.unitPrice && (
											<div className="text-xs text-gray-500 mt-1">
												{item.quantity} × {Number(item.unitPrice).toLocaleString('vi-VN')} đ
											</div>
										)}
									</div>
								))}

								{/* Summary */}
								<div className="pt-3 space-y-2">
									<div className="flex justify-between text-sm">
										<span className="text-gray-600">Tạm tính:</span>
										<span className="text-gray-900">
											{Number(bill.subtotal).toLocaleString('vi-VN')} đ
										</span>
									</div>
									{bill.discountAmount > 0 && (
										<div className="flex justify-between text-sm">
											<span className="text-gray-600">Giảm giá:</span>
											<span className="text-red-600">
												-{Number(bill.discountAmount).toLocaleString('vi-VN')} đ
											</span>
										</div>
									)}
									{bill.taxAmount > 0 && (
										<div className="flex justify-between text-sm">
											<span className="text-gray-600">Thuế:</span>
											<span className="text-gray-900">
												{Number(bill.taxAmount).toLocaleString('vi-VN')} đ
											</span>
										</div>
									)}
									<div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
										<span className="text-gray-900">Tổng cộng:</span>
										<span className="text-primary">
											{Number(bill.totalAmount).toLocaleString('vi-VN')} đ
										</span>
									</div>
									{bill.paidAmount > 0 && (
										<>
											<div className="flex justify-between text-sm">
												<span className="text-gray-600">Đã thanh toán:</span>
												<span className="text-green-600">
													{Number(bill.paidAmount).toLocaleString('vi-VN')} đ
												</span>
											</div>
											<div className="flex justify-between text-sm font-medium">
												<span className="text-gray-600">Còn lại:</span>
												<span className="text-red-600">
													{Number(bill.remainingAmount).toLocaleString('vi-VN')} đ
												</span>
											</div>
										</>
									)}
								</div>
							</>
						) : (
							<p className="text-sm text-gray-500 text-center py-4">
								Chưa có chi tiết hóa đơn
							</p>
						)}
					</div>
				</div>

				{/* Rental Info */}
				{bill.rental && (
					<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
						<h3 className="font-semibold text-gray-900 mb-3">Thông tin thuê</h3>
						<div className="space-y-2">
							{bill.rental.roomInstance?.room && (
								<div className="flex items-center text-sm">
									<Icon icon="zi-home" size={16} className="text-gray-400 mr-2" />
									<span className="text-gray-600">
										{bill.rental.roomInstance.room.name || 'Phòng không xác định'}
									</span>
								</div>
							)}
							{bill.rentalStartDate && (
								<div className="flex items-center text-sm">
									<Icon icon="zi-calendar" size={16} className="text-gray-400 mr-2" />
									<span className="text-gray-600">
										Bắt đầu: {new Date(bill.rentalStartDate).toLocaleDateString('vi-VN')}
									</span>
								</div>
							)}
							{bill.rentalEndDate && (
								<div className="flex items-center text-sm">
									<Icon icon="zi-calendar" size={16} className="text-gray-400 mr-2" />
									<span className="text-gray-600">
										Kết thúc: {new Date(bill.rentalEndDate).toLocaleDateString('vi-VN')}
									</span>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Notes */}
				{bill.notes && (
					<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
						<h3 className="font-semibold text-gray-900 mb-2">Ghi chú</h3>
						<p className="text-sm text-gray-600">{bill.notes}</p>
					</div>
				)}

				{/* Actions */}
				{user?.role === 'landlord' && bill.status === 'pending' && (
					<div className="space-y-3 mb-6">
						<Button
							fullWidth
							variant="secondary"
							onClick={() => navigate(`/invoices/${id}/update-meter`)}
						>
							<Icon icon="zi-edit" className="mr-2" />
							Cập nhật số đồng hồ
						</Button>
						<Button
							fullWidth
							variant="primary"
							onClick={handleMarkAsPaid}
							disabled={markAsPaidMutation.isPending}
						>
							{markAsPaidMutation.isPending ? 'Đang xử lý...' : 'Đánh dấu đã thanh toán'}
						</Button>
					</div>
				)}

				{/* Tenant Payment Action */}
				{user?.role === 'tenant' && (bill.status === 'pending' || bill.status === 'overdue') && (
					<div className="space-y-3 mb-6">
						<Button
							fullWidth
							variant="primary"
							onClick={handlePayWithPayOS}
							disabled={isCreatingPayment || createPayOSLinkMutation.isPending}
						>
							{isCreatingPayment || createPayOSLinkMutation.isPending 
								? 'Đang tạo link thanh toán...' 
								: 'Thanh toán qua PayOS'}
						</Button>
						<p className="text-xs text-gray-500 text-center">
							Hỗ trợ thanh toán qua QR Code, ATM, Visa, Mastercard
						</p>
					</div>
				)}

				{/* Metadata */}
				<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
					<h3 className="font-semibold text-gray-900 mb-3">Thông tin khác</h3>
					<div className="space-y-2 text-xs text-gray-500">
						<div className="flex justify-between">
							<span>Ngày tạo:</span>
							<span>{new Date(bill.createdAt).toLocaleString('vi-VN')}</span>
						</div>
						<div className="flex justify-between">
							<span>Cập nhật:</span>
							<span>{new Date(bill.updatedAt).toLocaleString('vi-VN')}</span>
						</div>
						{bill.isAutoGenerated && (
							<div className="flex items-center gap-1">
								<Icon icon="zi-info-circle" size={12} className="text-blue-500" />
								<span className="text-blue-600">Hóa đơn tự động</span>
							</div>
						)}
					</div>
				</div>
			</Box>
		</Page>
	);
};

export default InvoiceDetailPage;
