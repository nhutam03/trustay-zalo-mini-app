import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	createBookingRequest,
	getReceivedBookingRequests,
	getMyBookingRequests,
	getBookingRequestById,
	updateBookingRequestAsOwner,
	cancelMyBookingRequest,
	confirmBookingRequest,
	type CreateBookingRequestRequest,
	type UpdateBookingRequestRequest,
	type CancelBookingRequestRequest,
	type ConfirmBookingRequestRequest,
} from '@/services/booking-request-service';

// Query keys
export const bookingRequestKeys = {
	all: ['booking-requests'] as const,
	lists: () => [...bookingRequestKeys.all, 'list'] as const,
	received: (params?: Record<string, any>) =>
		[...bookingRequestKeys.all, 'received', params] as const,
	myRequests: (params?: Record<string, any>) =>
		[...bookingRequestKeys.all, 'my-requests', params] as const,
	details: () => [...bookingRequestKeys.all, 'detail'] as const,
	detail: (id: string) => [...bookingRequestKeys.details(), id] as const,
};

// Get received booking requests
export const useReceivedBookingRequests = (params?: {
	page?: number;
	limit?: number;
	status?: string;
	buildingId?: string;
	roomId?: string;
}) => {
	return useQuery({
		queryKey: bookingRequestKeys.received(params),
		queryFn: () => getReceivedBookingRequests(params),
		staleTime: 30 * 1000, // 30 seconds
	});
};

// Get my booking requests
export const useMyBookingRequests = (params?: {
	page?: number;
	limit?: number;
	status?: string;
}) => {
	return useQuery({
		queryKey: bookingRequestKeys.myRequests(params),
		queryFn: () => getMyBookingRequests(params),
		staleTime: 30 * 1000, // 30 seconds
	});
};

// Get booking request by ID
export const useBookingRequestById = (id: string | undefined) => {
	return useQuery({
		queryKey: bookingRequestKeys.detail(id || ''),
		queryFn: () => getBookingRequestById(id!),
		enabled: !!id,
		staleTime: 30 * 1000,
	});
};

// Create booking request
export const useCreateBookingRequest = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateBookingRequestRequest) => createBookingRequest(data),
		onSuccess: () => {
			// Invalidate my requests list
			queryClient.invalidateQueries({ queryKey: bookingRequestKeys.myRequests() });
		},
	});
};

// Update booking request as owner
export const useUpdateBookingRequestAsOwner = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateBookingRequestRequest }) =>
			updateBookingRequestAsOwner(id, data),
		onSuccess: (_, variables) => {
			// Invalidate received requests list and the specific booking request
			queryClient.invalidateQueries({ queryKey: bookingRequestKeys.received() });
			queryClient.invalidateQueries({ queryKey: bookingRequestKeys.detail(variables.id) });
		},
	});
};

// Cancel my booking request
export const useCancelMyBookingRequest = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: CancelBookingRequestRequest }) =>
			cancelMyBookingRequest(id, data),
		onSuccess: (_, variables) => {
			// Invalidate my requests list and the specific booking request
			queryClient.invalidateQueries({ queryKey: bookingRequestKeys.myRequests() });
			queryClient.invalidateQueries({ queryKey: bookingRequestKeys.detail(variables.id) });
		},
	});
};

// Confirm booking request
export const useConfirmBookingRequest = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: ConfirmBookingRequestRequest }) =>
			confirmBookingRequest(id, data),
		onSuccess: (_, variables) => {
			// Invalidate received requests list and the specific booking request
			queryClient.invalidateQueries({ queryKey: bookingRequestKeys.received() });
			queryClient.invalidateQueries({ queryKey: bookingRequestKeys.detail(variables.id) });
			// Also invalidate rentals list
			queryClient.invalidateQueries({ queryKey: ['rentals'] });
		},
	});
};
