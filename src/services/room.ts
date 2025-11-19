import { apiClient, extractErrorMessage } from '../lib/api-client';

// Room types (matching API response structure)
export interface RoomListing {
	id: string;
	slug: string;
	name: string;
	roomType: string;
	areaSqm: string;
	maxOccupancy: number;
	isVerified: boolean;
	buildingName: string;
	buildingVerified: boolean;
	address: string;
	addressLine2?: string;
	availableRooms: number;
	owner: {
		id: string;
		name: string;
		avatarUrl?: string;
		gender: string;
		email: string;
		phone: string;
		verifiedPhone: boolean;
		verifiedEmail: boolean;
		verifiedIdentity: boolean;
		totalBuildings: number;
		totalRoomInstances: number;
	};
	location: {
		provinceId: number;
		provinceName: string;
		districtId: number;
		districtName: string;
		wardId?: number;
		wardName?: string;
	};
	images: Array<{
		url: string;
		alt: string;
		isPrimary: boolean;
		sortOrder: number;
	}>;
	amenities: Array<{
		id: string;
		name: string;
		category: string;
		customValue?: string | null;
		notes?: string | null;
	}>;
	costs: Array<{
		id: string;
		name: string;
		value: string;
		category: string;
		notes?: string | null;
	}>;
	pricing: {
		basePriceMonthly: string;
		depositAmount?: string;
		utilityIncluded: boolean;
	};
	rules: Array<{
		id: string;
		name: string;
		type: string;
		customValue?: string | null;
		notes?: string | null;
		isEnforced: boolean;
	}>;
	buildingId: string;
	description?: string;
	buildingDescription?: string;
	floorNumber?: number;
	totalRooms: number;
	isActive: boolean;
	viewCount: number;
	lastUpdated: string;
	seo?: {
		title: string;
		description: string;
		keywords: string;
	};
	breadcrumb?: {
		items: Array<{
			title: string;
			path: string;
		}>;
	};
	similarRooms?: Array<RoomListing>;
}

// Room detail type (for detail page) - same as listing for now
export type RoomDetail = RoomListing;

export interface RoomSearchParams {
	search?: string;
	provinceId?: number;
	districtId?: number;
	wardId?: number;
	roomType?: string;
	minPrice?: number;
	maxPrice?: number;
	minArea?: number;
	maxArea?: number;
	amenities?: string;
	maxOccupancy?: number;
	isVerified?: boolean;
	latitude?: number;
	longitude?: number;
	sortBy?: 'price' | 'area' | 'createdAt';
	sortOrder?: 'asc' | 'desc';
	page?: number;
	limit?: number;
}

export interface RoomListingsResponse {
	data: RoomListing[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

// Get featured/popular rooms for homepage
export const getFeaturedRooms = async (limit: number = 10): Promise<RoomListing[]> => {
	try {
		const response = await apiClient.get<RoomListingsResponse>('/api/listings/rooms', {
			params: {
				search: '', // Empty search to get all
				page: 1,
				limit,
				sortBy: 'createdAt',
				sortOrder: 'desc',
			},
		});

		console.log('getFeaturedRooms response:', response.data);
		
		// Response structure: axios wraps in { data: {...} }
		// API returns: { data: [...], meta: {...} }
		return response.data.data || [];
	} catch (error) {
		console.error('Error fetching featured rooms:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải danh sách phòng nổi bật'));
	}
};

// Search rooms with filters (for listing page)
export const searchRoomListings = async (params: RoomSearchParams): Promise<RoomListingsResponse> => {
	try {
		// Build query params
		const queryParams: Record<string, string> = {
			search: params.search || '', // Empty search to get all
		};

		// Add optional parameters
		if (params.provinceId !== undefined) queryParams.provinceId = params.provinceId.toString();
		if (params.districtId !== undefined) queryParams.districtId = params.districtId.toString();
		if (params.wardId !== undefined) queryParams.wardId = params.wardId.toString();
		if (params.roomType) queryParams.roomType = params.roomType;
		if (params.minPrice !== undefined) queryParams.minPrice = params.minPrice.toString();
		if (params.maxPrice !== undefined) queryParams.maxPrice = params.maxPrice.toString();
		if (params.minArea !== undefined) queryParams.minArea = params.minArea.toString();
		if (params.maxArea !== undefined) queryParams.maxArea = params.maxArea.toString();
		if (params.amenities) queryParams.amenities = params.amenities;
		if (params.maxOccupancy !== undefined) queryParams.maxOccupancy = params.maxOccupancy.toString();
		if (params.isVerified !== undefined) queryParams.isVerified = params.isVerified.toString();
		if (params.latitude !== undefined) queryParams.latitude = params.latitude.toString();
		if (params.longitude !== undefined) queryParams.longitude = params.longitude.toString();
		if (params.sortBy) queryParams.sortBy = params.sortBy;
		if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
		if (params.page !== undefined) queryParams.page = params.page.toString();
		if (params.limit !== undefined) queryParams.limit = params.limit.toString();

		const response = await apiClient.get<RoomListingsResponse>('/api/listings/rooms', {
			params: queryParams,
		});

		return response.data;
	} catch (error) {
		console.error('Error searching rooms:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tìm kiếm phòng'));
	}
};

// Get room details by ID (for detail page)
export const getRoomById = async (id: string): Promise<RoomDetail> => {
	try {
		const response = await apiClient.get<RoomDetail>(`/api/rooms/public/id/${id}`);

		return response.data;
	} catch (error) {
		console.error('Error fetching room details:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải thông tin phòng'));
	}
};

// Get my rooms (for landlord) - requires authentication
export const getMyRooms = async (params?: { page?: number; limit?: number }): Promise<RoomListing[]> => {
	try {
		const queryParams = new URLSearchParams();
		if (params?.page) queryParams.append('page', params.page.toString());
		if (params?.limit) queryParams.append('limit', params.limit.toString());

		const endpoint = `/api/rooms/me${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

		const response = await apiClient.get<{
			success: boolean;
			data: {
				rooms: RoomListing[];
			};
		}>(endpoint);

		return response.data.data?.rooms || [];
	} catch (error) {
		console.error('Error fetching my rooms:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải danh sách phòng của bạn'));
	}
};

// Additional types for room management
export interface CreateRoomRequest {
	name: string;
	roomType: string;
	areaSqm: number;
	maxOccupancy: number;
	description?: string;
	basePriceMonthly: number;
	depositAmount?: number;
	utilityIncluded?: boolean;
	floorNumber?: number;
	amenities?: Array<{
		name: string;
		category: string;
		customValue?: string;
		notes?: string;
	}>;
	costs?: Array<{
		name: string;
		value: number;
		category: string;
		notes?: string;
	}>;
	rules?: Array<{
		name: string;
		type: string;
		customValue?: string;
		notes?: string;
		isEnforced: boolean;
	}>;
}

export interface UpdateRoomRequest {
	name?: string;
	roomType?: string;
	areaSqm?: number;
	maxOccupancy?: number;
	description?: string;
	basePriceMonthly?: number;
	depositAmount?: number;
	utilityIncluded?: boolean;
	floorNumber?: number;
	isActive?: boolean;
	amenities?: Array<{
		name: string;
		category: string;
		customValue?: string;
		notes?: string;
	}>;
	costs?: Array<{
		name: string;
		value: number;
		category: string;
		notes?: string;
	}>;
	rules?: Array<{
		name: string;
		type: string;
		customValue?: string;
		notes?: string;
		isEnforced: boolean;
	}>;
}

export interface RoomInstance {
	id: string;
	roomId: string;
	roomNumber: string;
	status: 'available' | 'occupied' | 'maintenance' | 'reserved';
	currentOccupancy: number;
	notes?: string;
}

export interface RoomInstancesResponse {
	data: RoomInstance[];
	total: number;
}

export interface UpdateRoomInstanceStatusRequest {
	status: 'available' | 'occupied' | 'maintenance' | 'reserved';
	notes?: string;
}

export interface BulkUpdateRoomInstancesRequest {
	instanceIds: string[];
	status: 'available' | 'occupied' | 'maintenance' | 'reserved';
	notes?: string;
}

// Create room in building (Landlord only)
export const createRoom = async (
	buildingId: string,
	data: CreateRoomRequest
): Promise<{ data: RoomDetail }> => {
	try {
		const response = await apiClient.post<{ data: RoomDetail }>(
			`/api/rooms/${buildingId}/rooms`,
			data
		);
		return response.data;
	} catch (error) {
		console.error('Error creating room:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tạo loại phòng'));
	}
};

// Get room by slug
export const getRoomBySlug = async (slug: string): Promise<{ data: RoomDetail }> => {
	try {
		const response = await apiClient.get<{ data: RoomDetail }>(`/api/rooms/${slug}`);
		return response.data;
	} catch (error) {
		console.error('Error getting room by slug:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải thông tin phòng'));
	}
};

// Update room (Landlord only)
export const updateRoom = async (
	id: string,
	data: UpdateRoomRequest
): Promise<{ data: RoomDetail }> => {
	try {
		const response = await apiClient.put<{ data: RoomDetail }>(`/api/rooms/${id}`, data);
		return response.data;
	} catch (error) {
		console.error('Error updating room:', error);
		throw new Error(extractErrorMessage(error, 'Không thể cập nhật loại phòng'));
	}
};

// Get rooms by building with pagination
export const getRoomsByBuilding = async (
	buildingId: string,
	params?: {
		page?: number;
		limit?: number;
	}
): Promise<RoomListingsResponse> => {
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
			data: RoomListingsResponse;
		}>(endpoint);

		return response.data.data;
	} catch (error) {
		console.error('Error getting rooms by building:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải danh sách phòng'));
	}
};

// Get room instances by status
export const getRoomInstancesByStatus = async (
	roomId: string,
	status?: string
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

// Update single room instance status
export const updateRoomInstanceStatus = async (
	instanceId: string,
	data: UpdateRoomInstanceStatusRequest
): Promise<{ message: string }> => {
	try {
		const response = await apiClient.put<{ message: string }>(
			`/api/rooms/instance/${instanceId}/status`,
			data
		);
		return response.data;
	} catch (error) {
		console.error('Error updating room instance status:', error);
		throw new Error(extractErrorMessage(error, 'Không thể cập nhật trạng thái phòng'));
	}
};

// Bulk update room instances status
export const bulkUpdateRoomInstancesStatus = async (
	roomId: string,
	data: BulkUpdateRoomInstancesRequest
): Promise<{ message: string }> => {
	try {
		const response = await apiClient.put<{ message: string }>(
			`/api/rooms/${roomId}/instances/status/bulk`,
			data
		);
		return response.data;
	} catch (error) {
		console.error('Error bulk updating room instances status:', error);
		throw new Error(extractErrorMessage(error, 'Không thể cập nhật trạng thái phòng'));
	}
};

// Delete room type (Landlord only)
export const deleteRoom = async (id: string): Promise<{ message: string }> => {
	try {
		const response = await apiClient.delete<{ message: string }>(`/api/rooms/${id}`);
		return response.data;
	} catch (error) {
		console.error('Error deleting room:', error);
		throw new Error(extractErrorMessage(error, 'Không thể xóa loại phòng'));
	}
};
