import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	createPayment,
	getPayments,
	getPaymentHistory,
	getPaymentById,
	updatePayment,
	createPaymentReceipt,
	processRefund,
	getPaymentStatistics,
	generatePaymentQRCode,
	deletePayment,
	getPayOSLinkForBill,
} from '@/services/payment-service';
import type {
	CreatePaymentRequest,
	UpdatePaymentRequest,
	CreatePaymentReceiptRequest,
	ProcessRefundRequest,
} from '@/services/payment-service';

// Query keys
export const paymentKeys = {
	all: ['payments'] as const,
	lists: () => [...paymentKeys.all, 'list'] as const,
	list: (filters: Record<string, unknown>) => [...paymentKeys.lists(), filters] as const,
	history: (filters: Record<string, unknown>) => [...paymentKeys.all, 'history', filters] as const,
	statistics: (filters: Record<string, unknown>) => [...paymentKeys.all, 'stats', filters] as const,
	details: () => [...paymentKeys.all, 'detail'] as const,
	detail: (id: string) => [...paymentKeys.details(), id] as const,
	qrCode: (id: string) => [...paymentKeys.all, 'qr', id] as const,
};

// Get payments list
export const usePayments = (params?: {
	page?: number;
	limit?: number;
	status?: string;
	paymentType?: string;
	contractId?: string;
	rentalId?: string;
}) => {
	return useQuery({
		queryKey: paymentKeys.list(params || {}),
		queryFn: () => getPayments(params),
		staleTime: 1 * 60 * 1000, // 1 minute
	});
};

// Get payment history
export const usePaymentHistory = (params?: {
	contractId?: string;
	rentalId?: string;
	startDate?: string;
	endDate?: string;
	page?: number;
	limit?: number;
}) => {
	return useQuery({
		queryKey: paymentKeys.history(params || {}),
		queryFn: () => getPaymentHistory(params),
		staleTime: 1 * 60 * 1000,
	});
};

// Get payment by ID
export const usePayment = (id: string, enabled = true) => {
	return useQuery({
		queryKey: paymentKeys.detail(id),
		queryFn: () => getPaymentById(id),
		enabled: enabled && !!id,
		staleTime: 1 * 60 * 1000,
	});
};

// Get payment statistics
export const usePaymentStatistics = (params?: {
	contractId?: string;
	rentalId?: string;
	year?: number;
	month?: number;
}) => {
	return useQuery({
		queryKey: paymentKeys.statistics(params || {}),
		queryFn: () => getPaymentStatistics(params),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};

// Generate payment QR code
export const usePaymentQRCode = (id: string, enabled = true) => {
	return useQuery({
		queryKey: paymentKeys.qrCode(id),
		queryFn: () => generatePaymentQRCode(id),
		enabled: enabled && !!id,
		staleTime: 10 * 60 * 1000, // 10 minutes
	});
};

// Get PayOS link for bill
export const usePayOSLink = (billId: string, enabled = true) => {
	return useQuery({
		queryKey: [...paymentKeys.all, 'payos', billId] as const,
		queryFn: () => getPayOSLinkForBill(billId),
		enabled: enabled && !!billId,
		staleTime: 10 * 60 * 1000, // 10 minutes
		retry: 1,
	});
};

// Create payment mutation
export const useCreatePayment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreatePaymentRequest) => createPayment(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
			queryClient.invalidateQueries({ queryKey: paymentKeys.all });
		},
	});
};

// Update payment mutation
export const useUpdatePayment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdatePaymentRequest }) =>
			updatePayment(id, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: paymentKeys.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
		},
	});
};

// Create payment receipt mutation
export const useCreatePaymentReceipt = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ paymentId, data }: { paymentId: string; data: Omit<CreatePaymentReceiptRequest, 'paymentId'> }) =>
			createPaymentReceipt(paymentId, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: paymentKeys.detail(variables.paymentId) });
			queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
		},
	});
};

// Process refund mutation
export const useProcessRefund = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: ProcessRefundRequest) => processRefund(data),
		onSuccess: (result) => {
			if (result.id) {
				queryClient.invalidateQueries({ queryKey: paymentKeys.detail(result.id) });
			}
			queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
		},
	});
};

// Delete payment mutation
export const useDeletePayment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deletePayment(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
		},
	});
};
