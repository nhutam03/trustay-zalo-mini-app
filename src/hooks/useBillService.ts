import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	getBills,
	getBillById,
	getTenantBills,
	getLandlordBillsByMonth,
	createBillForRoom,
	createBillByRoomInstance,
	updateBill,
	deleteBill,
	markBillAsPaid,
	updateBillWithMeterData,
	generateMonthlyBillsForBuilding,
	previewBillsForBuilding,
	createPayOSLinkForBill,
} from '@/services/bill-service';
import type {
	BillQueryParams,
	LandlordBillQueryParams,
	CreateBillRequest,
	CreateBillForRoomRequest,
	UpdateBillRequest,
	UpdateBillWithMeterDataRequest,
	GenerateMonthlyBillsRequest,
	PreviewBillForBuildingRequest,
	PayOSLinkRequest,
} from '@/interfaces/bill-interfaces';

// Query keys
export const billKeys = {
	all: ['bills'] as const,
	lists: () => [...billKeys.all, 'list'] as const,
	list: (filters: BillQueryParams) => [...billKeys.lists(), filters] as const,
	details: () => [...billKeys.all, 'detail'] as const,
	detail: (id: string) => [...billKeys.details(), id] as const,
	tenant: (filters: BillQueryParams) => [...billKeys.all, 'tenant', filters] as const,
	landlord: (filters: LandlordBillQueryParams) => [...billKeys.all, 'landlord', filters] as const,
};

// Get bills list
export const useBills = (params?: BillQueryParams) => {
	return useQuery({
		queryKey: billKeys.list(params || {}),
		queryFn: () => getBills(params),
		staleTime: 1 * 60 * 1000, // 1 minute
	});
};

// Get bill by ID
export const useBill = (id: string, enabled = true) => {
	return useQuery({
		queryKey: billKeys.detail(id),
		queryFn: () => getBillById(id),
		enabled: enabled && !!id,
		staleTime: 1 * 60 * 1000,
	});
};

// Get tenant bills
export const useTenantBills = (params?: BillQueryParams) => {
	return useQuery({
		queryKey: billKeys.tenant(params || {}),
		queryFn: () => getTenantBills(params),
		staleTime: 1 * 60 * 1000,
	});
};

// Get landlord bills by month
export const useLandlordBills = (params?: LandlordBillQueryParams) => {
	return useQuery({
		queryKey: billKeys.landlord(params || {}),
		queryFn: () => getLandlordBillsByMonth(params),
		staleTime: 1 * 60 * 1000,
	});
};

// Create bill mutation
export const useCreateBill = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateBillRequest) => createBillForRoom(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: billKeys.lists() });
		},
	});
};

// Create bill by room instance mutation
export const useCreateBillByRoomInstance = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateBillForRoomRequest) => createBillByRoomInstance(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: billKeys.lists() });
		},
	});
};

// Update bill mutation
export const useUpdateBill = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateBillRequest }) =>
			updateBill(id, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: billKeys.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: billKeys.lists() });
		},
	});
};

// Delete bill mutation
export const useDeleteBill = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteBill(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: billKeys.lists() });
		},
	});
};

// Mark bill as paid mutation
export const useMarkBillAsPaid = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => markBillAsPaid(id),
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: billKeys.detail(id) });
			queryClient.invalidateQueries({ queryKey: billKeys.lists() });
		},
	});
};

// Update bill with meter data mutation
export const useUpdateBillWithMeterData = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdateBillWithMeterDataRequest) => updateBillWithMeterData(data),
		onSuccess: (result) => {
			if (result.data?.id) {
				queryClient.invalidateQueries({ queryKey: billKeys.detail(result.data.id) });
			}
			queryClient.invalidateQueries({ queryKey: billKeys.lists() });
		},
	});
};

// Generate monthly bills for building mutation
export const useGenerateMonthlyBills = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: GenerateMonthlyBillsRequest) => generateMonthlyBillsForBuilding(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: billKeys.lists() });
		},
	});
};

// Preview bills for building
export const usePreviewBills = () => {
	return useMutation({
		mutationFn: (data: PreviewBillForBuildingRequest) => previewBillsForBuilding(data),
	});
};

// Create PayOS link for bill payment
export const useCreatePayOSLink = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ billId, data }: { billId: string; data?: PayOSLinkRequest }) =>
			createPayOSLinkForBill(billId, data),
		onSuccess: (_, variables) => {
			// Optionally invalidate bill details to refresh status
			queryClient.invalidateQueries({ queryKey: billKeys.detail(variables.billId) });
		},
	});
};
