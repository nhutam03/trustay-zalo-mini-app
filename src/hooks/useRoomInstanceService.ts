import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	searchRoomInstances,
	createBillForRoom,
	type RoomInstanceSearchParams,
	type CreateBillForRoomDto,
} from '@/services/room-instance-service';

// Query keys
export const roomInstanceKeys = {
	all: ['roomInstances'] as const,
	search: (params: RoomInstanceSearchParams) => [...roomInstanceKeys.all, 'search', params] as const,
};

/**
 * Hook to search room instances (Landlord only)
 * GET /rooms/instances/search
 * 
 * Search behavior:
 * - If search looks like UUID: matches roomInstanceId, roomId, or buildingId
 * - Otherwise: case-insensitive partial match against:
 *   - Room number, room name, building name
 *   - Owner name/email/phone
 *   - Tenant name/email/phone (via active rentals)
 *   - Address: province/district/ward names
 *   - Room notes
 * 
 * Requirements:
 * - At least one parameter must be provided
 * - Returns up to 20 newest matches
 * 
 * Example usage:
 * ```ts
 * // Search by building
 * const { data } = useSearchRoomInstances({ buildingId: 'uuid' });
 * 
 * // Search by text
 * const { data } = useSearchRoomInstances({ search: 'phòng 101' });
 * 
 * // Search by status
 * const { data } = useSearchRoomInstances({ status: 'available' });
 * 
 * // Combined search
 * const { data } = useSearchRoomInstances({ 
 *   buildingId: 'uuid', 
 *   search: 'phòng',
 *   status: 'occupied'
 * });
 * ```
 */
export const useSearchRoomInstances = (
	params: RoomInstanceSearchParams,
	enabled = true,
) => {
	// Validate that at least one parameter is provided
	const hasParams = !!(params.buildingId || params.search || params.status);

	return useQuery({
		queryKey: roomInstanceKeys.search(params),
		queryFn: () => searchRoomInstances(params),
		enabled: enabled && hasParams,
		staleTime: 30 * 1000, // 30 seconds - search results can change quickly
	});
};

/**
 * Hook to create bill for a specific room instance (Landlord only)
 * POST /bills/create-for-room
 * 
 * Flow:
 * 1. Use useSearchRoomInstances to find the correct roomInstanceId
 * 2. Call this mutation with the billing data
 * 3. Backend auto-calculates costs, creates bill items, and notifies tenant
 * 
 * Example usage:
 * ```ts
 * const createBill = useCreateBillForRoom();
 * 
 * createBill.mutate({
 *   roomInstanceId: 'uuid',
 *   billingPeriod: '2025-01',
 *   billingMonth: 1,
 *   billingYear: 2025,
 *   periodStart: '2025-01-01',
 *   periodEnd: '2025-01-31',
 *   occupancyCount: 2,
 *   meterReadings: [
 *     { roomCostId: 'electric-id', currentReading: 1500, lastReading: 1200 },
 *     { roomCostId: 'water-id', currentReading: 310, lastReading: 250 }
 *   ],
 *   notes: 'Manual bill for January'
 * });
 * ```
 */
export const useCreateBillForRoom = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateBillForRoomDto) => createBillForRoom(data),
		onSuccess: () => {
			// Invalidate bills list to show the new bill
			queryClient.invalidateQueries({ queryKey: ['bills'] });
		},
	});
};
