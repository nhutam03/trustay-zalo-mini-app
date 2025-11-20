import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	createRental,
	getLandlordRentals,
	getTenantRentals,
	getRentalById,
	updateRental,
	terminateRental,
	renewRental,
	deleteRental,
	type CreateRentalRequest,
	type UpdateRentalRequest,
	type TerminateRentalRequest,
	type RenewRentalRequest,
} from '@/services/rental-service';

// Query keys
export const rentalKeys = {
	all: ['rentals'] as const,
	lists: () => [...rentalKeys.all, 'list'] as const,
	landlordRentals: (params?: Record<string, any>) =>
		[...rentalKeys.all, 'landlord-rentals', params] as const,
	tenantRentals: (params?: Record<string, any>) =>
		[...rentalKeys.all, 'tenant-rentals', params] as const,
	details: () => [...rentalKeys.all, 'detail'] as const,
	detail: (id: string) => [...rentalKeys.details(), id] as const,
};

// Get landlord rentals
export const useLandlordRentals = (params?: {
	page?: number;
	limit?: number;
	status?: string;
}) => {
	return useQuery({
		queryKey: rentalKeys.landlordRentals(params),
		queryFn: () => getLandlordRentals(params),
		staleTime: 60 * 1000,
	});
};

// Get tenant rentals
export const useTenantRentals = (params?: { page?: number; limit?: number; status?: string }) => {
	return useQuery({
		queryKey: rentalKeys.tenantRentals(params),
		queryFn: () => getTenantRentals(params),
		staleTime: 60 * 1000,
	});
};

// Get rental by ID
export const useRentalById = (id: string | undefined) => {
	return useQuery({
		queryKey: rentalKeys.detail(id || ''),
		queryFn: () => getRentalById(id!),
		enabled: !!id,
		staleTime: 60 * 1000,
	});
};

// Create rental
export const useCreateRental = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateRentalRequest) => createRental(data),
		onSuccess: () => {
			// Invalidate all rental lists
			queryClient.invalidateQueries({ queryKey: rentalKeys.lists() });
		},
	});
};

// Update rental
export const useUpdateRental = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateRentalRequest }) =>
			updateRental(id, data),
		onSuccess: (_, variables) => {
			// Invalidate the specific rental and all lists
			queryClient.invalidateQueries({ queryKey: rentalKeys.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: rentalKeys.lists() });
		},
	});
};

// Terminate rental
export const useTerminateRental = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: TerminateRentalRequest }) =>
			terminateRental(id, data),
		onSuccess: (_, variables) => {
			// Invalidate the specific rental and all lists
			queryClient.invalidateQueries({ queryKey: rentalKeys.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: rentalKeys.lists() });
		},
	});
};

// Renew rental
export const useRenewRental = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: RenewRentalRequest }) =>
			renewRental(id, data),
		onSuccess: (_, variables) => {
			// Invalidate the specific rental and all lists
			queryClient.invalidateQueries({ queryKey: rentalKeys.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: rentalKeys.lists() });
		},
	});
};

// Delete rental
export const useDeleteRental = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteRental(id),
		onSuccess: () => {
			// Invalidate all rental lists
			queryClient.invalidateQueries({ queryKey: rentalKeys.lists() });
		},
	});
};
