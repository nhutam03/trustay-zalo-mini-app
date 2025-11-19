import { apiClient, extractErrorMessage } from '../lib/api-client';
import type { RoomSeekingPost, RoomSeekingPostListResponse } from '../interfaces/basic';

// Re-export types
export type { RoomSeekingPost };

// Room seeking search params
export interface RoomSeekingSearchParams {
	search?: string;
	provinceId?: number;
	districtId?: number;
	wardId?: number;
	minBudget?: number;
	maxBudget?: number;
	preferredRoomType?: string;
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
	userId?: string;
	status?: string;
	occupancy?: number;
	preferredProvinceId?: number;
	preferredDistrictId?: number;
	preferredWardId?: number;
}

export interface CreateRoomSeekingPostRequest {
	title: string;
	description: string;
	preferredProvinceId: number;
	preferredDistrictId: number;
	preferredWardId: number;
	minBudget: number;
	maxBudget: number;
	currency?: string;
	occupancy: number;
	preferredRoomType?: string;
	moveInDate: string;
	minimumStayMonths?: number;
	maximumStayMonths?: number;
	additionalRequirements?: string;
	expiresAt?: string;
}

export interface UpdateRoomSeekingPostRequest {
	title?: string;
	description?: string;
	preferredProvinceId?: number;
	preferredDistrictId?: number;
	preferredWardId?: number;
	minBudget?: number;
	maxBudget?: number;
	currency?: string;
	occupancy?: number;
	preferredRoomType?: string;
	moveInDate?: string;
	minimumStayMonths?: number;
	maximumStayMonths?: number;
	additionalRequirements?: string;
	expiresAt?: string;
}

// Get featured room seeking posts
export const getFeaturedRoomSeekingPosts = async (
	limit: number = 10
): Promise<RoomSeekingPost[]> => {
	try {
		const response = await apiClient.get<RoomSeekingPostListResponse>(
			'/api/listings/room-seeking-posts',
			{
				params: {
					page: 1,
					limit,
					sortBy: 'createdAt',
					sortOrder: 'desc',
				},
			}
		);

		return response.data.data || [];
	} catch (error) {
		console.error('Error fetching featured room seeking posts:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải danh sách tìm phòng'));
	}
};

// Search room seeking posts with filters
export const searchRoomSeekingPosts = async (
	params: RoomSeekingSearchParams
): Promise<RoomSeekingPostListResponse> => {
	try {
		const response = await apiClient.get<RoomSeekingPostListResponse>(
			'/api/listings/room-seeking-posts',
			{
				params,
			}
		);

		return response.data;
	} catch (error) {
		console.error('Error searching room seeking posts:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tìm kiếm bài đăng'));
	}
};

// Get a single room seeking post by ID
export const getRoomSeekingPostById = async (id: string): Promise<RoomSeekingPost> => {
	try {
		const response = await apiClient.get<RoomSeekingPost>(`/api/room-seeking-posts/${id}`);
		return response.data;
	} catch (error) {
		console.error('Error fetching room seeking post:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải thông tin bài đăng'));
	}
};

// Create new room seeking post
export const createRoomSeekingPost = async (
	data: CreateRoomSeekingPostRequest
): Promise<{ data: RoomSeekingPost }> => {
	try {
		const response = await apiClient.post<{ data: RoomSeekingPost }>(
			'/api/room-seeking-posts',
			data
		);
		return response.data;
	} catch (error) {
		console.error('Error creating room seeking post:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tạo bài đăng tìm trọ'));
	}
};

// Update room seeking post
export const updateRoomSeekingPost = async (
	id: string,
	data: UpdateRoomSeekingPostRequest
): Promise<{ data: RoomSeekingPost }> => {
	try {
		const response = await apiClient.patch<{ data: RoomSeekingPost }>(
			`/api/room-seeking-posts/${id}`,
			data
		);
		return response.data;
	} catch (error) {
		console.error('Error updating room seeking post:', error);
		throw new Error(extractErrorMessage(error, 'Không thể cập nhật bài đăng tìm trọ'));
	}
};

// Update room seeking post status
export const updateRoomSeekingPostStatus = async (
	id: string,
	status: 'active' | 'paused' | 'closed' | 'expired'
): Promise<{ data: RoomSeekingPost }> => {
	try {
		const response = await apiClient.patch<{ data: RoomSeekingPost }>(
			`/api/room-seeking-posts/${id}/status`,
			{ status }
		);
		return response.data;
	} catch (error) {
		console.error('Error updating room seeking post status:', error);
		throw new Error(extractErrorMessage(error, 'Không thể cập nhật trạng thái bài đăng tìm trọ'));
	}
};

// Delete room seeking post
export const deleteRoomSeekingPost = async (id: string): Promise<{ message: string }> => {
	try {
		const response = await apiClient.delete<{ message: string }>(
			`/api/room-seeking-posts/${id}`
		);
		return response.data;
	} catch (error) {
		console.error('Error deleting room seeking post:', error);
		throw new Error(extractErrorMessage(error, 'Không thể xóa bài đăng tìm trọ'));
	}
};

// Increment contact count for room seeking post
export const incrementRoomSeekingPostContact = async (
	id: string
): Promise<{ message: string }> => {
	try {
		const response = await apiClient.post<{ message: string }>(
			`/api/room-seeking-posts/${id}/contact`,
			{}
		);
		return response.data;
	} catch (error) {
		console.error('Error incrementing contact count:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tăng số lượt liên hệ'));
	}
};

// Get room seeking posts with pagination
export const getRoomSeekingPosts = async (
	params?: RoomSeekingSearchParams
): Promise<RoomSeekingPostListResponse> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());
		if (params?.status) searchParams.append('status', params.status);
		if (params?.userId) searchParams.append('userId', params.userId);
		if (params?.search) searchParams.append('search', params.search);
		if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
		if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);
		if (params?.preferredProvinceId)
			searchParams.append('preferredProvinceId', String(params.preferredProvinceId));
		if (params?.preferredDistrictId)
			searchParams.append('preferredDistrictId', String(params.preferredDistrictId));
		if (params?.preferredWardId)
			searchParams.append('preferredWardId', String(params.preferredWardId));
		if (typeof params?.minBudget === 'number')
			searchParams.append('minBudget', String(params.minBudget));
		if (typeof params?.maxBudget === 'number')
			searchParams.append('maxBudget', String(params.maxBudget));
		if (params?.preferredRoomType)
			searchParams.append('preferredRoomType', params.preferredRoomType);
		if (typeof params?.occupancy === 'number')
			searchParams.append('occupancy', String(params.occupancy));

		const endpoint = `/api/room-seeking-posts${
			searchParams.toString() ? `?${searchParams.toString()}` : ''
		}`;
		const response = await apiClient.get<RoomSeekingPostListResponse>(endpoint);

		return response.data;
	} catch (error) {
		console.error('Error getting room seeking posts:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải danh sách bài đăng tìm trọ'));
	}
};

// Get current user's room seeking posts
export const getMyRoomSeekingPosts = async (
	params?: Omit<RoomSeekingSearchParams, 'userId'>
): Promise<RoomSeekingPostListResponse> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', String(params.page));
		if (params?.limit) searchParams.append('limit', String(params.limit));
		if (params?.search) searchParams.append('search', params.search);
		if (params?.status) searchParams.append('status', params.status);
		if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
		if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

		const endpoint = `/api/room-seeking-posts/me${
			searchParams.toString() ? `?${searchParams.toString()}` : ''
		}`;
		const response = await apiClient.get<RoomSeekingPostListResponse>(endpoint);

		return response.data;
	} catch (error) {
		console.error('Error getting my room seeking posts:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải danh sách bài đăng của bạn'));
	}
};
