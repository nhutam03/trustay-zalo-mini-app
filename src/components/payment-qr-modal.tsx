import React from 'react';
import { Modal, Box, Text, Button } from 'zmp-ui';
import { QRCodeSVG } from 'qrcode.react';
import { formatCurrency } from '@/utils/format';

interface PaymentQRModalProps {
	visible: boolean;
	onClose: () => void;
	qrCode: string;
	checkoutUrl: string;
	amount: number;
	description?: string;
	orderCode?: number;
}

const PaymentQRModal: React.FC<PaymentQRModalProps> = ({
	visible,
	onClose,
	qrCode,
	checkoutUrl,
	amount,
	description,
	orderCode,
}) => {
	const handleOpenPaymentLink = () => {
		window.open(checkoutUrl, '_blank');
	};

	return (
		<Modal
			visible={visible}
			title="Thanh toán qua PayOS"
			onClose={onClose}
			actions={[
				{
					text: 'Đóng',
					close: true,
				},
				{
					text: 'Mở link thanh toán',
					highLight: true,
					onClick: handleOpenPaymentLink,
				},
			]}
		>
			<Box className="space-y-4">
				{/* Amount */}
				<Box className="text-center">
					<Text className="text-sm text-gray-600 mb-1">Số tiền thanh toán</Text>
					<Text className="text-2xl font-bold text-blue-600">
						{formatCurrency(amount)}
					</Text>
				</Box>

				{/* QR Code */}
				<Box className="flex justify-center bg-white p-4 rounded-lg border-2 border-gray-200">
					<QRCodeSVG
						value={qrCode}
						size={240}
						level="H"
						includeMargin={true}
					/>
				</Box>

				{/* Instructions */}
				<Box className="bg-blue-50 p-4 rounded-lg">
					<Text className="text-sm font-semibold text-blue-900 mb-2">
						Hướng dẫn thanh toán:
					</Text>
					<Box className="space-y-1">
						<Text className="text-xs text-blue-800">
							• Mở ứng dụng ngân hàng/ví điện tử
						</Text>
						<Text className="text-xs text-blue-800">
							• Chọn quét mã QR
						</Text>
						<Text className="text-xs text-blue-800">
							• Quét mã QR phía trên
						</Text>
						<Text className="text-xs text-blue-800">
							• Xác nhận thanh toán
						</Text>
					</Box>
				</Box>

				{/* Payment Info */}
				{(description || orderCode) && (
					<Box className="space-y-2 text-sm">
						{orderCode && (
							<Box className="flex justify-between">
								<Text className="text-gray-600">Mã đơn hàng:</Text>
								<Text className="font-mono font-semibold">{orderCode}</Text>
							</Box>
						)}
						{description && (
							<Box>
								<Text className="text-gray-600">Nội dung:</Text>
								<Text className="font-semibold">{description}</Text>
							</Box>
						)}
					</Box>
				)}

				{/* Warning */}
				<Box className="bg-yellow-50 p-3 rounded-lg">
					<Text className="text-xs text-yellow-800">
						⚠️ Vui lòng không tắt trang này cho đến khi hoàn tất thanh toán
					</Text>
				</Box>
			</Box>
		</Modal>
	);
};

export default PaymentQRModal;
