/**
 * Payment utility functions for formatting and displaying payment-related data
 */

/**
 * Map payment method codes to Vietnamese display names
 */
export const PAYMENT_METHOD_LABELS: Record<string, string> = {
	bank_transfer: 'Chuyển khoản ngân hàng',
	cash: 'Tiền mặt',
	e_wallet: 'Ví điện tử',
	card: 'Thẻ',
};

/**
 * Map payment type codes to Vietnamese display names
 */
export const PAYMENT_TYPE_LABELS: Record<string, string> = {
	rent: 'Tiền thuê',
	deposit: 'Tiền cọc',
	utility: 'Tiền điện nước',
	fee: 'Phí dịch vụ',
	refund: 'Hoàn tiền',
};

/**
 * Format payment method for display
 */
export function formatPaymentMethod(method: string): string {
	return PAYMENT_METHOD_LABELS[method] || method;
}

/**
 * Format payment type for display
 */
export function formatPaymentType(type: string): string {
	return PAYMENT_TYPE_LABELS[type] || type;
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number | string, currency: string = 'VND'): string {
	const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
	
	if (currency === 'VND') {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(numAmount);
	}
	
	return new Intl.NumberFormat('vi-VN', {
		style: 'currency',
		currency: currency,
	}).format(numAmount);
}

/**
 * Get payment status color class
 */
export function getPaymentStatusColor(status: string): string {
	const statusColors: Record<string, string> = {
		pending: 'bg-yellow-100 text-yellow-800',
		completed: 'bg-green-100 text-green-800',
		failed: 'bg-red-100 text-red-800',
		refunded: 'bg-blue-100 text-blue-800',
		cancelled: 'bg-gray-100 text-gray-600',
	};
	return statusColors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Get payment status label
 */
export function getPaymentStatusLabel(status: string): string {
	const statusLabels: Record<string, string> = {
		pending: 'Chờ xử lý',
		completed: 'Hoàn thành',
		failed: 'Thất bại',
		refunded: 'Đã hoàn tiền',
		cancelled: 'Đã hủy',
	};
	return statusLabels[status] || status;
}
