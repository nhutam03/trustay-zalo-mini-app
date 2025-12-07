import { apiClient, extractErrorMessage } from '@/lib/api-client';

// ========================
// Types for Room Management (Extended from room.ts)
// ========================

export interface Room {
	id: string;
	buildingId: string;
	name: string;
	description?: string;
	roomType: string;
	areaSqm: number;
	maxOccupancy: number;
	floorNumber?: number;
	totalRooms: number;
	availableRooms: number;
	isActive: boolean;
	viewCount: number;
	createdAt: string;
	updatedAt: string;
	amenities?: Array<{
		id: string;
		name: string;
		category: string;
	}>;
	costs?: Array<{
		id: string;
		name: string;
		value: string;
		category: string;
	}>;
	rules?: Array<{
		id: string;
		name: string;
		type: string;
	}>;
	images?: Array<{
		url: string;
		alt: string;
		isPrimary: boolean;
	}>;
	pricing: {
		basePriceMonthly: number;
		depositAmount?: number;
		utilityIncluded?: boolean;
	};
}

export interface RoomsListResponse {
	rooms: Room[],
	total: number,
	page: number,
	limit: number,
	totalPages: number,
}

export interface RoomInstancesResponse {
	data: {
		instances: Array<{
			id: string;
			roomNumber: string;
			status: 'available' | 'occupied' | 'maintenance' | 'reserved' | 'unavailable';
			notes?: string;
			updatedAt: string;
			isActive: boolean;
		}>;
		statusCounts: {
			available: number;
			occupied: number;
			maintenance: number;
			reserved: number;
			unavailable: number;
		};
	}
}

export interface CreateRoomRequest {
	name: string;
	description?: string;
	roomType: string;
	areaSqm: number;
	maxOccupancy: number;
	basePriceMonthly: number;
	depositAmount?: number;
	floorNumber?: number;
	totalRooms: number;
	amenities?: string[];
	costs?: Array<{
		costTypeId: string;
		costType: 'fixed' | 'per_person' | 'metered';
		value: number;
		unit?: string;
		notes?: string;
	}>;
	rules?: string[];
	images?: Array<{
		url: string;
		alt: string;
		isPrimary: boolean;
	}>;
}

export interface UpdateRoomRequest {
	name?: string;
	description?: string;
	roomType?: string;
	areaSqm?: number;
	maxOccupancy?: number;
	basePriceMonthly?: number;
	depositAmount?: number;
	floorNumber?: number;
	totalRooms?: number;
	isActive?: boolean;
	amenities?: string[];
	costs?: Array<{
		costTypeId: string;
		costType: 'fixed' | 'per_person' | 'metered';
		value: number;
		unit?: string;
		notes?: string;
	}>;
	rules?: string[];
	images?: Array<{
		url: string;
		alt: string;
		isPrimary: boolean;
	}>;
}

export interface UpdateRoomInstanceStatusRequest {
	status: 'available' | 'occupied' | 'maintenance' | 'reserved' | 'unavailable';
	notes?: string;
}

export interface BulkUpdateRoomInstancesRequest {
	instanceIds: string[];
	status: 'available' | 'occupied' | 'maintenance' | 'reserved' | 'unavailable';
	notes?: string;
}

export interface RoomInstanceSearchResult {
	id: string;
	roomNumber: string;
	roomId: string;
	roomName: string;
	buildingId: string;
	buildingName: string;
	ownerId: string;
	ownerName: string;
	status?: string;
	floorNumber?: number;
	notes?: string;
}

// ========================
// Room Management Service Functions
// ========================

/**
 * Get my rooms (landlord's rooms)
 */
export const getMyRooms = async (params?: {
	page?: number;
	limit?: number;
}): Promise<RoomsListResponse> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());

		const endpoint = `/api/rooms/me${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
		const response = await apiClient.get<{
			success: boolean;
			message: string;
			data: RoomsListResponse;
		}>(endpoint);

		return response.data.data;
	} catch (error) {
		console.error('Error getting my rooms:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải danh sách phòng của tôi'));
	}
};

/**
 * Create room type in building (Landlord only)
 */
export const createRoom = async (
	buildingId: string,
	data: CreateRoomRequest,
): Promise<Room> => {
	try {
		const response = await apiClient.post<{ data: Room }>(
			`/api/rooms/${buildingId}/rooms`,
			data,
		);
		return response.data.data;
	} catch (error) {
		console.error('Error creating room:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tạo loại phòng'));
	}
};

/**
 * Get room by ID
 */
export const getRoomById = async (id: string): Promise<Room> => {
	try {
		const response = await apiClient.get<{ data: Room }>(`/api/rooms/${id}`);
		return response.data.data;
	} catch (error) {
		console.error('Error getting room by ID:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải thông tin phòng'));
	}
};

/**
 * Update room type (Landlord only)
 */
export const updateRoom = async (id: string, data: UpdateRoomRequest): Promise<Room> => {
	try {
		const response = await apiClient.put<{ data: Room }>(`/api/rooms/${id}`, data);
		return response.data.data;
	} catch (error) {
		console.error('Error updating room:', error);
		throw new Error(extractErrorMessage(error, 'Không thể cập nhật loại phòng'));
	}
};

/**
 * Get rooms by building with pagination
 */
export const getRoomsByBuilding = async (
	buildingId: string,
	params?: {
		page?: number;
		limit?: number;
	},
): Promise<RoomsListResponse> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());

		const endpoint = `/api/rooms/building/${buildingId}/rooms${
			searchParams.toString() ? `?${searchParams.toString()}` : ''
		}`;
		const response = await apiClient.get<{
			success: boolean;
			message: string;
			data: RoomsListResponse;
		}>(endpoint);

		return response.data.data;
	} catch (error) {
		console.error('Error getting rooms by building:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải danh sách phòng'));
	}
};

/**
 * Get room instances by status
 */
export const getRoomInstancesByStatus = async (
	roomId: string,
	status?: string,
): Promise<RoomInstancesResponse> => {
	try {
		const searchParams = new URLSearchParams();
		if (status && status !== 'all') searchParams.append('status', status);

		const endpoint = `/api/rooms/${roomId}/instances/status${
			searchParams.toString() ? `?${searchParams.toString()}` : ''
		}`;
		const response = await apiClient.get<RoomInstancesResponse>(endpoint);

		return response.data;
	} catch (error) {
		console.error('Error getting room instances by status:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải danh sách phòng'));
	}
};

/**
 * Update single room instance status
 */
export const updateRoomInstanceStatus = async (
	instanceId: string,
	data: UpdateRoomInstanceStatusRequest,
): Promise<{ message: string }> => {
	try {
		const response = await apiClient.put<{ message: string }>(
			`/api/rooms/instance/${instanceId}/status`,
			data,
		);
		return response.data;
	} catch (error) {
		console.error('Error updating room instance status:', error);
		throw new Error(extractErrorMessage(error, 'Không thể cập nhật trạng thái phòng'));
	}
};

/**
 * Bulk update room instances status
 */
export const bulkUpdateRoomInstancesStatus = async (
	roomId: string,
	data: BulkUpdateRoomInstancesRequest,
): Promise<{ message: string }> => {
	try {
		const response = await apiClient.put<{ message: string }>(
			`/api/rooms/${roomId}/instances/status/bulk`,
			data,
		);
		return response.data;
	} catch (error) {
		console.error('Error bulk updating room instances status:', error);
		throw new Error(extractErrorMessage(error, 'Không thể cập nhật trạng thái phòng'));
	}
};

/**
 * Delete room type (Landlord only)
 */
export const deleteRoom = async (id: string): Promise<{ message: string }> => {
	try {
		const response = await apiClient.delete<{ message: string }>(`/api/rooms/${id}`);
		return response.data;
	} catch (error) {
		console.error('Error deleting room:', error);
		throw new Error(extractErrorMessage(error, 'Không thể xóa loại phòng'));
	}
};

/**
 * Search room instances with filters
 */
export const searchRoomInstances = async (params: {
	buildingId?: string;
	search?: string;
	status?: 'available' | 'occupied' | 'maintenance' | 'reserved' | 'unavailable';
}): Promise<{
	success: boolean;
	message: string;
	data: RoomInstanceSearchResult[];
	timestamp: string;
}> => {
	try {
		const searchParams = new URLSearchParams();
		if (params.buildingId) searchParams.append('buildingId', params.buildingId);
		if (params.search) searchParams.append('search', params.search);
		if (params.status) searchParams.append('status', params.status);

		const endpoint = `/api/rooms/instances/search${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
		const response = await apiClient.get<{
			success: boolean;
			message: string;
			data: RoomInstanceSearchResult[];
			timestamp: string;
		}>(endpoint);

		return response.data;
	} catch (error) {
		console.error('Error searching room instances:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tìm kiếm phòng'));
	}
};
