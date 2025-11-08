import { apiClient, extractErrorMessage } from '../lib/api-client';
import type { RoommateSeekingPost } from '../interfaces/roommate-interface';

export interface CreateRoommateSeekingPostRequest {
	// Thông tin cơ bản
	title: string;
	description: string;

	// Phòng trong platform (tùy chọn - chọn 1 trong 2: phòng trong hệ thống hoặc ngoài)
	roomInstanceId?: string;
	rentalId?: string;

	// Phòng ngoài platform (tùy chọn)
	externalAddress?: string;
	externalProvinceId?: number;
	externalDistrictId?: number;
	externalWardId?: number;

	// Chi phí
	monthlyRent: number;
	currency?: string; // Default: "VND"
	depositAmount: number;
	utilityCostPerPerson?: number;

	// Số lượng người
	seekingCount: number; // Số người cần tìm
	maxOccupancy: number; // Tối đa số người ở
	currentOccupancy: number; // Số người hiện tại (thường là 1)

	// Yêu cầu về roommate
	preferredGender: 'other' | 'male' | 'female';
	additionalRequirements?: string;

	// Thời gian
	availableFromDate: string; // ISO date string
	minimumStayMonths?: number;
	maximumStayMonths?: number;

	// Khác
	requiresLandlordApproval?: boolean; // Default: false
	expiresAt?: string; // ISO date string
}

export interface UpdateRoommateSeekingPostRequest {
	// Thông tin cơ bản
	title?: string;
	description?: string;

	// Phòng trong platform
	roomInstanceId?: string;
	rentalId?: string;

	// Phòng ngoài platform
	externalAddress?: string;
	externalProvinceId?: number;
	externalDistrictId?: number;
	externalWardId?: number;

	// Chi phí
	monthlyRent?: number;
	currency?: string;
	depositAmount?: number;
	utilityCostPerPerson?: number;

	// Số lượng
	seekingCount?: number;
	maxOccupancy?: number;
	currentOccupancy?: number;

	// Yêu cầu
	preferredGender?: 'other' | 'male' | 'female';
	additionalRequirements?: string;

	// Thời gian
	availableFromDate?: string;
	minimumStayMonths?: number;
	maximumStayMonths?: number;

	// Khác
	requiresLandlordApproval?: boolean;
	expiresAt?: string;
}

export interface RoommateSeekingPostListResponse {
	data: RoommateSeekingPost[];
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

// Listing response (from /api/listings/roommate-seeking-posts)
export interface RoommateSeekingListingItem {
	id: string;
	title: string;
	description: string;
	slug: string;
	maxBudget: number;
	currency: string;
	occupancy: number;
	moveInDate: string;
	status: 'active' | 'paused' | 'closed' | 'expired';
	viewCount: number;
	contactCount: number;
	createdAt: string;
	requester: {
		id: string;
		avatarUrl: string | null;
		name: string;
		email: string;
	};
}

export interface RoommateSeekingListingResponse {
	data: RoommateSeekingListingItem[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
		itemCount: number;
	};
	seo: {
		title: string;
		description: string;
		keywords: string;
	};
	breadcrumb: {
		items: Array<{
			title: string;
			path: string;
		}>;
	};
}

export interface SearchRoommateSeekingPostsParams {
	page?: number;
	limit?: number;
	provinceId?: number;
	districtId?: number;
	wardId?: number;
	minPrice?: number;
	maxPrice?: number;
	preferredGender?: 'other' | 'male' | 'female';
	status?: 'active' | 'paused' | 'closed' | 'expired';
	sortBy?: 'createdAt' | 'monthlyRent' | 'updatedAt';
	sortOrder?: 'asc' | 'desc';
}

// Create roommate seeking post
export const createRoommateSeekingPost = async (
	data: CreateRoommateSeekingPostRequest,
	token?: string,
): Promise<RoommateSeekingPost> => {
	try {
		const response = await apiClient<any>(
			'/api/roommate-seeking-posts',
			{
				method: 'POST',
				data,
			},
		);

		return response.data.data || [];
	} catch (error) {
		console.error('Error fetching roommate post details:', error);
    	throw new Error(extractErrorMessage(error, 'Không thể tải thông tin bài đăng'));
	}
};

// Get roommate seeking post by ID
export const getRoommateSeekingPostById = async (
	id: string,
	token?: string,
): Promise<RoommateSeekingPost> => {
	try {
		const response = await apiClient<any>(
			`/api/roommate-seeking-posts/${id}`,
			{
				method: 'GET',
			},
		);

		return response.data;
	} catch (error) {
		console.error('Error fetching roommate post details:', error);
    throw new Error(extractErrorMessage(error, 'Không thể tải thông tin bài đăng'));
	}
};

// Get my roommate seeking posts
export const getMyRoommateSeekingPosts = async (
	params?: {
		page?: number;
		limit?: number;
	},
	token?: string,
): Promise<RoommateSeekingPostListResponse> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());

		const endpoint = `/api/roommate-seeking-posts/me${
			searchParams.toString() ? `?${searchParams.toString()}` : ''
		}`;

		const response = await apiClient<any>(
			endpoint,
			{
				method: 'GET',
            },
		);

		return response.data || [];
	} catch (error) {
		console.error('Error fetching roommate post details:', error);
    	throw new Error(extractErrorMessage(error, 'Không thể tải thông tin bài đăng'));
	}
};

// Get all roommate seeking posts (public)
export const getAllRoommateSeekingPosts = async (
	params?: {
		page?: number;
		limit?: number;
		sortBy?: 'createdAt' | 'monthlyRent' | 'updatedAt';
		sortOrder?: 'asc' | 'desc';
	},
	token?: string,
): Promise<RoommateSeekingPostListResponse> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());
		if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
		if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

		const endpoint = `/api/roommate-seeking-posts${
			searchParams.toString() ? `?${searchParams.toString()}` : ''
		}`;

		const response = await apiClient<any>(
			endpoint,
			{
				method: 'GET',
			},
		);

		return response.data || [];
	} catch (error) {
		console.error('Error fetching roommate post details:', error);
    	throw new Error(extractErrorMessage(error, 'Không thể tải thông tin bài đăng'));
	}
};

// Search/Filter roommate seeking posts
export const searchRoommateSeekingPosts = async (
	params: SearchRoommateSeekingPostsParams,
	token?: string,
): Promise<RoommateSeekingPostListResponse> => {
	try {
		const searchParams = new URLSearchParams();
		if (params.page) searchParams.append('page', params.page.toString());
		if (params.limit) searchParams.append('limit', params.limit.toString());
		if (params.provinceId) searchParams.append('provinceId', params.provinceId.toString());
		if (params.districtId) searchParams.append('districtId', params.districtId.toString());
		if (params.wardId) searchParams.append('wardId', params.wardId.toString());
		if (params.minPrice) searchParams.append('minPrice', params.minPrice.toString());
		if (params.maxPrice) searchParams.append('maxPrice', params.maxPrice.toString());
		if (params.preferredGender) searchParams.append('preferredGender', params.preferredGender);
		if (params.status) searchParams.append('status', params.status);
		if (params.sortBy) searchParams.append('sortBy', params.sortBy);
		if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

		const endpoint = `/api/roommate-seeking-posts/search${
			searchParams.toString() ? `?${searchParams.toString()}` : ''
		}`;

		const response = await apiClient<any>(
			endpoint,
			{
				method: 'GET',
			},
			
		);

		return response.data || [];
	} catch (error) {
		console.error('Error fetching roommate post details:', error);
    	throw new Error(extractErrorMessage(error, 'Không thể tải thông tin bài đăng'));
	}
};

// Update roommate seeking post
export const updateRoommateSeekingPost = async (
	id: string,
	data: UpdateRoommateSeekingPostRequest,
	token?: string,
): Promise<RoommateSeekingPost> => {
	try {
		const response = await apiClient<any>(
			`/api/roommate-seeking-posts/${id}`,
			{
				method: 'PATCH',
				data,
			},
		);

		return response.data || [];
	} catch (error) {
		console.error('Error fetching roommate post details:', error);
    	throw new Error(extractErrorMessage(error, 'Không thể tải thông tin bài đăng'));
	}
};

// Update roommate seeking post status
export const updateRoommateSeekingPostStatus = async (
	id: string,
	status: 'active' | 'paused' | 'closed' | 'expired',
	token?: string,
): Promise<RoommateSeekingPost> => {
	try {
		const response = await apiClient<any>(
			`/api/roommate-seeking-posts/${id}/status`,
			{
				method: 'PATCH',
				data: { status },
			},
		);

		return response.data || [];
	} catch (error) {
		console.error('Error fetching roommate post details:', error);
    	throw new Error(extractErrorMessage(error, 'Không thể tải thông tin bài đăng'));
	}
};

// Delete roommate seeking post
export const deleteRoommateSeekingPost = async (
	id: string,
	token?: string,
): Promise<{ message: string }> => {
	try {
		const response = await apiClient<any>(
			`/api/roommate-seeking-posts/${id}`,
			{
				method: 'DELETE',
			},
			
		);

		return response.data || [];
	} catch (error) {
		console.error('Error fetching roommate post details:', error);
    	throw new Error(extractErrorMessage(error, 'Không thể tải thông tin bài đăng'));
	}
};

// Get listings (public endpoint - similar to room-seekings)
export const getRoommateSeekingListings = async (
	params?: {
		page?: number;
		limit?: number;
		sortBy?: 'createdAt' | 'maxBudget' | 'updatedAt';
		sortOrder?: 'asc' | 'desc';
	},
	token?: string,
): Promise<RoommateSeekingListingResponse> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());
		if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
		if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

		const endpoint = `/api/listings/roommate-seeking-posts${
			searchParams.toString() ? `?${searchParams.toString()}` : ''
		}`;

		const response = await apiClient<any>(
			endpoint,
			{
				method: 'GET',
			},

		);

		return response.data || [];
	} catch (error) {
		console.error('Error fetching roommate post details:', error);
    	throw new Error(extractErrorMessage(error, 'Không thể tải thông tin bài đăng'));
	}
};
