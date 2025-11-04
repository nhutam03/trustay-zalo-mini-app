import { apiClient, extractErrorMessage } from '../lib/api-client';

// Room types (matching API response structure)
export interface RoomListing {
	id: string;
	slug: string;
	name: string;
	roomType: string;
	maxOccupancy: number;
	isVerified: boolean;
	buildingName: string;
	buildingVerified: boolean;
	address: string;
	owner: {
		name: string;
		avatarUrl: string | null;
		gender: string;
		verifiedPhone: boolean;
		verifiedEmail: boolean;
		verifiedIdentity: boolean;
	};
	location: {
		provinceId: number;
		provinceName: string;
		districtId: number;
		districtName: string;
		wardId: number;
		wardName: string;
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
	}>;
	costs: Array<{
		id: string;
		name: string;
		value: string;
	}>;
	pricing: {
		basePriceMonthly: string;
		depositAmount: string;
		utilityIncluded: boolean;
	};
	rules: Array<{
		id: string;
		name: string;
		type: string;
	}>;
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
