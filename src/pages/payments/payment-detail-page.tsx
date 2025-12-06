import React, { useState } from 'react';
import { Page, Box, Text, Button, Modal, Input, useNavigate } from 'zmp-ui';
import { useParams } from 'react-router-dom';
import useSetHeader from '@/hooks/useSetHeader';
import {
	usePayment,
	usePaymentQRCode,
	useUpdatePayment,
	useCreatePaymentReceipt,
	useProcessRefund,
	usePayOSLink,
} from '@/hooks/usePaymentService';
import { formatCurrency } from '@/utils/format';
import { formatPaymentMethod } from '@/utils/paymentUtils';
import { useCurrentUser } from '@/hooks/useAuthService';
import PaymentQRModal from '@/components/payment-qr-modal';

const PaymentDetailPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const setHeader = useSetHeader();
	
	React.useEffect(() => {
		setHeader({ title: 'Chi tiết thanh toán', hasLeftIcon: true });
	}, [setHeader]);

	const { data: currentUser } = useCurrentUser();
	const { data: payment, isLoading, error } = usePayment(id || '', !!id);
	const { data: qrCode } = usePaymentQRCode(id || '', !!id && payment?.status === 'pending');
	
	// Debug: Log payment data
	React.useEffect(() => {
		if (payment) {
			console.log('Payment data:', payment);
			console.log('Payment billId:', payment.billId);
			console.log('Payment status:', payment.status);
		}
	}, [payment]);
	
	const { data: payosLink, isLoading: payosLoading, error: payosError } = usePayOSLink(
		payment?.billId || '', 
		!!payment?.billId && payment?.status === 'pending'
	);
	
	// Debug: Log PayOS link data
	React.useEffect(() => {
		console.log('PayOS Link data:', payosLink);
		console.log('PayOS Loading:', payosLoading);
		console.log('PayOS Error:', payosError);
	}, [payosLink, payosLoading, payosError]);

	const updatePaymentMutation = useUpdatePayment();
	const createReceiptMutation = useCreatePaymentReceipt();
	const processRefundMutation = useProcessRefund();

	const [showReceiptModal, setShowReceiptModal] = useState(false);
	const [showRefundModal, setShowRefundModal] = useState(false);
	const [showQRModal, setShowQRModal] = useState(false);
	const [receiptData, setReceiptData] = useState({
		receiptNumber: '',
		notes: '',
	});
	const [refundData, setRefundData] = useState({
		amount: '',
		reason: '',
	});

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'completed':
				return 'bg-green-100 text-green-800';
			case 'pending':
				return 'bg-yellow-100 text-yellow-800';
			case 'failed':
				return 'bg-red-100 text-red-800';
			case 'refunded':
				return 'bg-blue-100 text-blue-800';
			default:
				return 'bg-gray-100 text-gray-800';
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

	const handleCreateReceipt = async () => {
		if (!id) return;

		try {
			await createReceiptMutation.mutateAsync({
				paymentId: id,
				data: {
					receiptUrl: '',
					receiptNumber: receiptData.receiptNumber,
					notes: receiptData.notes,
				},
			});
			setShowReceiptModal(false);
			setReceiptData({ receiptNumber: '', notes: '' });
		} catch (error) {
			console.error('Failed to create receipt:', error);
		}
	};

	const handleProcessRefund = async () => {
		if (!id) return;

		try {
			await processRefundMutation.mutateAsync({
				paymentId: id,
				refundAmount: Number(refundData.amount),
				refundReason: refundData.reason,
			});
			setShowRefundModal(false);
			setRefundData({ amount: '', reason: '' });
		} catch (error) {
			console.error('Failed to process refund:', error);
		}
	};

	const handleMarkAsCompleted = async () => {
		if (!id) return;

		try {
			await updatePaymentMutation.mutateAsync({
				id,
				data: { status: 'completed' },
			});
		} catch (error) {
			console.error('Failed to update payment:', error);
		}
	};

	if (isLoading) {
		return (
			<Page className="bg-gray-50">
				<Box className="flex justify-center items-center h-screen">
					<Text>Đang tải...</Text>
				</Box>
			</Page>
		);
	}

	if (error || !payment) {
		return (
			<Page className="bg-gray-50">
				<Box className="flex flex-col justify-center items-center h-screen">
					<Text className="text-red-500 mb-4">Không thể tải thông tin thanh toán</Text>
					<Button onClick={() => navigate(-1)}>Quay lại</Button>
				</Box>
			</Page>
		);
	}

	const isLandlord = currentUser?.role === 'landlord';
	const canProcessRefund =
		isLandlord && payment.status === 'completed';

	return (
		<Page className="bg-gray-50">
			<Box className="p-4 space-y-4">
				{/* Status Card */}
				<Box className="bg-white rounded-lg p-6 shadow-sm">
					<Box className="flex justify-between items-start mb-4">
						<Text className="text-2xl font-bold text-gray-800">
							{formatCurrency(payment.amount)}
						</Text>
						<Box className={`px-3 py-1 rounded-full ${getStatusColor(payment.status)}`}>
							<Text className="text-sm font-semibold">{getStatusText(payment.status)}</Text>
						</Box>
					</Box>

					<Box className="space-y-2">
						<Box className="flex justify-between">
							<Text className="text-gray-600">Loại thanh toán:</Text>
							<Text className="font-semibold">
								{payment.paymentType === 'deposit'
									? 'Tiền cọc'
									: payment.paymentType === 'rent'
										? 'Tiền thuê'
										: payment.paymentType === 'utility'
											? 'Tiện ích'
											: payment.paymentType === 'service'
												? 'Dịch vụ'
												: 'Khác'}
							</Text>
						</Box>

						{payment.contractId && (
							<Box className="flex justify-between">
								<Text className="text-gray-600">Hợp đồng:</Text>
								<Text className="font-semibold">#{payment.contractId.slice(0, 8)}</Text>
							</Box>
						)}

						{payment.rentalId && (
							<Box className="flex justify-between">
								<Text className="text-gray-600">Thuê phòng:</Text>
								<Text className="font-semibold">#{payment.rentalId.slice(0, 8)}</Text>
							</Box>
						)}

					<Box className="flex justify-between">
						<Text className="text-gray-600">Ngày tạo:</Text>
						<Text className="font-semibold">
							{new Date(payment.createdAt).toLocaleDateString('vi-VN', {
								day: '2-digit',
								month: '2-digit',
								year: 'numeric',
							})}
						</Text>
					</Box>

					{payment.paidAt && (
						<Box className="flex justify-between">
							<Text className="text-gray-600">Ngày thanh toán:</Text>
							<Text className="font-semibold">
								{new Date(payment.paidAt).toLocaleDateString('vi-VN', {
									day: '2-digit',
									month: '2-digit',
									year: 'numeric',
								})}
							</Text>
						</Box>
					)}
				</Box>
			</Box>

				{payment.notes && (
					<Box className="bg-white rounded-lg p-4 shadow-sm">
						<Text className="text-gray-600 text-sm mb-1">Ghi chú:</Text>
						<Text className="text-gray-800">{payment.notes}</Text>
					</Box>
				)}

				{/* Debug info */}
				<Box className="bg-yellow-50 rounded-lg p-4 text-xs">
					<Text>Debug: billId = {payment.billId || 'null'}</Text>
					<Text>Status = {payment.status}</Text>
					<Text>PayOS Loading = {String(payosLoading)}</Text>
					<Text>PayOS Link = {payosLink ? 'YES' : 'NO'}</Text>
					{payosError && <Text className="text-red-600">Error: {String(payosError)}</Text>}
				</Box>

				{/* QR Code for pending payments */}
				{payment.billId && (payment.status === 'pending' || payment.status === 'completed') && (
					<Box className="bg-white rounded-lg p-6 shadow-sm">
						<Text className="font-semibold text-gray-800 mb-4 text-center">
							Thanh toán qua PayOS
						</Text>
						{payosLoading ? (
							<Text className="text-center text-gray-600">Đang tải thông tin thanh toán...</Text>
						) : payosLink ? (
							<Box className="flex flex-col items-center gap-3">
								<Button
									fullWidth
									variant="primary"
									onClick={() => setShowQRModal(true)}
								>
									Hiển thị mã QR thanh toán
								</Button>
								<Text className="text-xs text-gray-500 text-center">
									Quét mã QR hoặc mở link thanh toán để hoàn tất giao dịch
								</Text>
							</Box>
						) : (
							<Text className="text-center text-red-600">
								Không thể tải thông tin thanh toán
							</Text>
						)}
					</Box>
				)}

				{/* Payment Method Info */}
				{payment.paymentMethod && (
					<Box className="bg-white rounded-lg p-4 shadow-sm">
						<Text className="font-semibold text-gray-800 mb-3">Phương thức thanh toán</Text>
						<Box className="space-y-2">
							<Box className="flex justify-between">
								<Text className="text-gray-600">Phương thức:</Text>
								<Text className="font-semibold">{formatPaymentMethod(payment.paymentMethod)}</Text>
							</Box>
							{payment.transactionId && (
								<Box className="flex justify-between">
									<Text className="text-gray-600">Mã giao dịch:</Text>
									<Text className="font-mono text-sm">{payment.transactionId}</Text>
								</Box>
							)}
						</Box>
					</Box>
				)}

				{/* Actions for Landlord */}
				{isLandlord && (
					<Box className="space-y-3">
						{payment.status === 'pending' && (
							<Button
								fullWidth
								variant="primary"
								onClick={handleMarkAsCompleted}
								disabled={updatePaymentMutation.isPending}
							>
								Xác nhận đã thanh toán
							</Button>
						)}

				{payment.status === 'completed' && !payment.receiptUrl && (
					<Button
						fullWidth
						variant="secondary"
						onClick={() => setShowReceiptModal(true)}
					>
						Tạo biên lai
					</Button>
				)}						{canProcessRefund && (
							<Button
								fullWidth
								variant="tertiary"
								onClick={() => setShowRefundModal(true)}
							>
								Hoàn tiền
							</Button>
						)}
					</Box>
				)}

				{/* Receipt Modal */}
				<Modal
					visible={showReceiptModal}
					title="Tạo biên lai"
					onClose={() => setShowReceiptModal(false)}
					actions={[
						{
							text: 'Hủy',
							close: true,
						},
						{
							text: 'Tạo biên lai',
							highLight: true,
							onClick: handleCreateReceipt,
							disabled: createReceiptMutation.isPending || !receiptData.receiptNumber,
						},
					]}
				>
					<Box className="space-y-4">
						<Box>
							<Text className="text-sm font-medium mb-2">Số biên lai *</Text>
							<Input
								type="text"
								placeholder="Nhập số biên lai"
								value={receiptData.receiptNumber}
								onChange={(e) =>
									setReceiptData({ ...receiptData, receiptNumber: e.target.value })
								}
							/>
						</Box>
						<Box>
							<Text className="text-sm font-medium mb-2">Ghi chú</Text>
							<Input
								type="text"
								placeholder="Nhập ghi chú (tùy chọn)"
								value={receiptData.notes}
								onChange={(e) => setReceiptData({ ...receiptData, notes: e.target.value })}
							/>
						</Box>
					</Box>
				</Modal>

				{/* Refund Modal */}
				<Modal
					visible={showRefundModal}
					title="Hoàn tiền"
					onClose={() => setShowRefundModal(false)}
					actions={[
						{
							text: 'Hủy',
							close: true,
						},
						{
							text: 'Xác nhận hoàn tiền',
							highLight: true,
							onClick: handleProcessRefund,
							disabled:
								processRefundMutation.isPending ||
								!refundData.amount ||
								!refundData.reason,
						},
					]}
				>
					<Box className="space-y-4">
						<Box>
							<Text className="text-sm font-medium mb-2">Số tiền hoàn *</Text>
							<Input
								type="number"
								placeholder="Nhập số tiền"
								value={refundData.amount}
								onChange={(e) => setRefundData({ ...refundData, amount: e.target.value })}
							/>
							<Text className="text-xs text-gray-500 mt-1">
								Tối đa: {formatCurrency(payment.amount)}
							</Text>
						</Box>
						<Box>
							<Text className="text-sm font-medium mb-2">Lý do *</Text>
							<Input
								type="text"
								placeholder="Nhập lý do hoàn tiền"
								value={refundData.reason}
								onChange={(e) => setRefundData({ ...refundData, reason: e.target.value })}
							/>
						</Box>
					</Box>
				</Modal>

				{/* PayOS QR Modal */}
				{payosLink && (
					<PaymentQRModal
						visible={showQRModal}
						onClose={() => setShowQRModal(false)}
						qrCode={payosLink.qrCode || ''}
						checkoutUrl={payosLink.checkoutUrl}
						amount={payosLink.amount}
						description={payosLink.description}
						orderCode={payosLink.orderCode}
					/>
				)}
			</Box>
		</Page>
	);
};export default PaymentDetailPage;
