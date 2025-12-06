import { apiClient, extractErrorMessage } from '@/lib/api-client';

// ========================
// Types for Payment
// ========================

export interface Payment {
	id: string;
	contractId?: string;
	rentalId?: string;
	billId?: string;
	amount: number;
	currency: string;
	paymentType: 'rent' | 'deposit' | 'utility' | 'fee' | 'refund';
	paymentMethod: 'bank_transfer' | 'cash' | 'e_wallet' | 'card';
	status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
	payerId: string;
	receiverId: string;
	transactionId?: string;
	transactionDate?: string;
	dueDate?: string;
	paidAt?: string;
	receiptUrl?: string;
	notes?: string;
	metadata?: Record<string, unknown>;
	createdAt: string;
	updatedAt: string;
	payer?: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
	};
	receiver?: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
	};
}

export interface PaymentListResponse {
	data: Payment[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export interface PaymentStatistics {
	totalPayments: number;
	totalAmount: number;
	completedPayments: number;
	completedAmount: number;
	pendingPayments: number;
	pendingAmount: number;
	overduePayments: number;
	overdueAmount: number;
	byMonth?: Array<{
		month: number;
		year: number;
		totalPayments: number;
		totalAmount: number;
	}>;
}

export interface CreatePaymentRequest {
	contractId?: string;
	rentalId: string; // Required UUID
	billId?: string;
	amount: string; // Must be a valid decimal string
	currency?: string;
	paymentType: 'rent' | 'deposit' | 'utility' | 'fee' | 'refund';
	paymentMethod: 'bank_transfer' | 'cash' | 'e_wallet' | 'card';
	dueDate?: string;
	metadata?: Record<string, unknown>;
}

export interface UpdatePaymentRequest {
	amount?: number;
	paymentMethod?: 'bank_transfer' | 'cash' | 'e_wallet' | 'card';
	status?: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
	transactionId?: string;
	transactionDate?: string;
	paidAt?: string;
	receiptUrl?: string;
	notes?: string;
	metadata?: Record<string, unknown>;
}

export interface CreatePaymentReceiptRequest {
	paymentId: string;
	receiptUrl: string;
	receiptNumber?: string;
	notes?: string;
}

export interface ProcessRefundRequest {
	paymentId: string;
	refundAmount: number;
	refundReason: string;
	refundMethod?: 'bank_transfer' | 'cash' | 'e_wallet' | 'card';
}

// ========================
// Payment Service Functions
// ========================

/**
 * Create payment
 */
export const createPayment = async (data: CreatePaymentRequest): Promise<Payment> => {
	try {
		const response = await apiClient.post<{ data: Payment }>('/api/payments', data);
		return response.data.data;
	} catch (error) {
		console.error('Error creating payment:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tạo thanh toán'));
	}
};

/**
 * Get payments list with pagination and filtering
 */
export const getPayments = async (params?: {
	page?: number;
	limit?: number;
	status?: string;
	paymentType?: string;
	contractId?: string;
	rentalId?: string;
}): Promise<PaymentListResponse> => {
	try {
		const q = new URLSearchParams();
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));
		if (params?.status) q.append('status', params.status);
		if (params?.paymentType) q.append('paymentType', params.paymentType);
		if (params?.contractId) q.append('contractId', params.contractId);
		if (params?.rentalId) q.append('rentalId', params.rentalId);

		const endpoint = `/api/payments${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiClient.get<PaymentListResponse>(endpoint);
		return response.data;
	} catch (error) {
		console.error('Error getting payments:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải danh sách thanh toán'));
	}
};

/**
 * Get payment history with date filtering
 */
export const getPaymentHistory = async (params?: {
	contractId?: string;
	rentalId?: string;
	startDate?: string;
	endDate?: string;
	page?: number;
	limit?: number;
}): Promise<PaymentListResponse> => {
	try {
		const q = new URLSearchParams();
		if (params?.contractId) q.append('contractId', params.contractId);
		if (params?.rentalId) q.append('rentalId', params.rentalId);
		if (params?.startDate) q.append('startDate', params.startDate);
		if (params?.endDate) q.append('endDate', params.endDate);
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));

		const endpoint = `/api/payments/history${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiClient.get<PaymentListResponse>(endpoint);
		return response.data;
	} catch (error) {
		console.error('Error getting payment history:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải lịch sử thanh toán'));
	}
};

/**
 * Get payment details by ID
 */
export const getPaymentById = async (id: string): Promise<Payment> => {
	try {
		const response = await apiClient.get<{ data: Payment }>(`/api/payments/${id}`);
		return response.data.data;
	} catch (error) {
		console.error('Error getting payment by ID:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải chi tiết thanh toán'));
	}
};

/**
 * Update payment
 */
export const updatePayment = async (id: string, data: UpdatePaymentRequest): Promise<Payment> => {
	try {
		const response = await apiClient.patch<{ data: Payment }>(`/api/payments/${id}`, data);
		return response.data.data;
	} catch (error) {
		console.error('Error updating payment:', error);
		throw new Error(extractErrorMessage(error, 'Không thể cập nhật thanh toán'));
	}
};

/**
 * Record payment receipt (Landlord only)
 */
export const createPaymentReceipt = async (
	paymentId: string,
	data: Omit<CreatePaymentReceiptRequest, 'paymentId'>,
): Promise<{ message: string }> => {
	try {
		const response = await apiClient.post<{ message: string }>(
			`/api/payments/${paymentId}/receipt`,
			{ ...data, paymentId },
		);
		return response.data;
	} catch (error) {
		console.error('Error creating payment receipt:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tạo biên lai thanh toán'));
	}
};

/**
 * Process refund
 */
export const processRefund = async (data: ProcessRefundRequest): Promise<Payment> => {
	try {
		const response = await apiClient.post<{ data: Payment }>('/api/payments/refund', data);
		return response.data.data;
	} catch (error) {
		console.error('Error processing refund:', error);
		throw new Error(extractErrorMessage(error, 'Không thể xử lý hoàn tiền'));
	}
};

/**
 * Get payment statistics
 */
export const getPaymentStatistics = async (params?: {
	contractId?: string;
	rentalId?: string;
	year?: number;
	month?: number;
}): Promise<PaymentStatistics> => {
	try {
		const q = new URLSearchParams();
		if (params?.contractId) q.append('contractId', params.contractId);
		if (params?.rentalId) q.append('rentalId', params.rentalId);
		if (params?.year) q.append('year', String(params.year));
		if (params?.month) q.append('month', String(params.month));

		const endpoint = `/api/payments/stats${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiClient.get<PaymentStatistics>(endpoint);
		return response.data;
	} catch (error) {
		console.error('Error getting payment statistics:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải thống kê thanh toán'));
	}
};

/**
 * Generate QR code for payment
 */
export const generatePaymentQRCode = async (id: string): Promise<{ qrCodeUrl: string }> => {
	try {
		const response = await apiClient.get<{ qrCodeUrl: string }>(`/api/payments/${id}/qr-code`);
		return response.data;
	} catch (error) {
		console.error('Error generating payment QR code:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tạo mã QR thanh toán'));
	}
};

/**
 * Delete payment
 */
export const deletePayment = async (id: string): Promise<{ message: string }> => {
	try {
		const response = await apiClient.delete<{ message: string }>(`/api/payments/${id}`);
		return response.data;
	} catch (error) {
		console.error('Error deleting payment:', error);
		throw new Error(extractErrorMessage(error, 'Không thể xóa thanh toán'));
	}
};
