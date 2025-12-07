import { apiClient, extractErrorMessage } from '@/lib/api-client';

// ========================
// Types for Buildings
// ========================

export interface Building {
	id: string;
	slug: string;
	name: string;
	description?: string;
	addressLine1: string;
	addressLine2?: string;
	country: string;
	roomCount: number;
	provinceId: number;
	districtId: number;
	wardId?: number;
	ownerId: string;
	totalRooms: number;
	totalRoomInstances: number;
	occupiedRoomInstances: number;
	isActive: boolean;
	isVerified: boolean;
	createdAt: string;
	updatedAt: string;
	owner?: {
		id: string;
		firstName: string;
		lastName: string;
		isVerifiedIdentity: boolean;
		avatarUrl?: string;
	};
	location?: {
		provinceName: string;
		districtName: string;
		wardName?: string;
	};
}

export interface BuildingsListResponse {
	data: Building[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export interface CreateBuildingRequest {
	name: string;
	addressLine1: string;
	provinceId: number;
	districtId: number;
	wardId?: number;
	description?: string;
}

export interface UpdateBuildingRequest {
	name?: string;
	address?: string;
	provinceId?: number;
	districtId?: number;
	wardId?: number;
	description?: string;
	isActive?: boolean;
}

// ========================
// Building Service Functions
// ========================

/**
 * Get list of buildings with pagination and filters
 */
export const getBuildings = async (params?: {
	page?: number;
	limit?: number;
	search?: string;
	isActive?: boolean;
}): Promise<BuildingsListResponse> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());
		if (params?.search) searchParams.append('search', params.search);
		if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());

		const endpoint = `/api/buildings${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
		const response = await apiClient.get<{
			success: boolean;
			message: string;
			data: {
				buildings: Building[];
				[key: string]: any;
			};
		}>(endpoint);

		// Map response to expected format
		return {
			data: response.data.data.buildings || [],
			meta: {
				page: params?.page || 1,
				limit: params?.limit || 10,
				total: response.data.data.buildings?.length || 0,
				totalPages: 1,
			}
		};
	} catch (error) {
		console.error('Error getting buildings:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải danh sách dãy trọ'));
	}
};

/**
 * Get my buildings (landlord's buildings)
 */
export const getMyBuildings = async (params?: {
	page?: number;
	limit?: number;
}): Promise<BuildingsListResponse> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());

		const endpoint = `/api/buildings/me${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
		const response = await apiClient.get<{
			success: boolean;
			message: string;
			data: BuildingsListResponse;
		}>(endpoint);

		return response.data.data;
	} catch (error) {
		console.error('Error getting my buildings:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải danh sách dãy trọ của tôi'));
	}
};

/**
 * Get building by ID
 */
export const getBuildingById = async (id: string): Promise<Building> => {
	try {
		const response = await apiClient.get<{
			success: boolean;
			message: string;
			data: Building;
		}>(`/api/buildings/${id}`);

		return response.data.data;
	} catch (error) {
		console.error('Error getting building by ID:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải thông tin dãy trọ'));
	}
};

/**
 * Create new building (Landlord only)
 */
export const createBuilding = async (data: CreateBuildingRequest): Promise<Building> => {
	try {
		const response = await apiClient.post<{ data: Building }>('/api/buildings', data);
		return response.data.data;
	} catch (error) {
		console.error('Error creating building:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tạo dãy trọ'));
	}
};

/**
 * Update building (Landlord only)
 */
export const updateBuilding = async (
	id: string,
	data: UpdateBuildingRequest,
): Promise<Building> => {
	try {
		const response = await apiClient.put<{ data: Building }>(`/api/buildings/${id}`, data);
		return response.data.data;
	} catch (error) {
		console.error('Error updating building:', error);
		throw new Error(extractErrorMessage(error, 'Không thể cập nhật dãy trọ'));
	}
};

/**
 * Delete building (Landlord only)
 */
export const deleteBuilding = async (id: string): Promise<{ message: string }> => {
	try {
		const response = await apiClient.delete<{ message: string }>(`/api/buildings/${id}`);
		return response.data;
	} catch (error) {
		console.error('Error deleting building:', error);
		throw new Error(extractErrorMessage(error, 'Không thể xóa dãy trọ'));
	}
};
