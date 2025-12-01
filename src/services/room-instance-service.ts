import { apiClient, extractErrorMessage } from '@/lib/api-client';
import type {
	RoomInstanceSearchParams,
	RoomInstanceSearchResponse,
} from '@/interfaces/room-instance-interfaces';

// Export types for use in hooks
export type {
	RoomInstanceSearchParams,
	RoomInstanceSearchResponse,
};

/**
 * Search room instances (Admin Portal - Landlord only)
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
 * At least one parameter must be provided.
 * Returns up to 20 newest matches.
 */
export const searchRoomInstances = async (
	params: RoomInstanceSearchParams,
): Promise<RoomInstanceSearchResponse> => {
	try {
		// Validate that at least one parameter is provided
		if (!params.buildingId && !params.search && !params.status) {
			throw new Error('Cần cung cấp ít nhất một tham số tìm kiếm');
		}

		const response = await apiClient.get<RoomInstanceSearchResponse>(
			'/api/rooms/instances/search',
			{ params },
		);
		return response.data;
	} catch (error) {
		throw new Error(extractErrorMessage(error, 'Không thể tìm kiếm phòng'));
	}
};

// Note: createBillForRoom has been moved to bill-service.ts to avoid duplication
