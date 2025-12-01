import { apiClient, extractErrorMessage } from '@/lib/api-client';

// ========================
// Types for Roommate Seeking Posts
// ========================

export interface RoommateSeekingPost {
	id: string;
	title: string;
	description: string;
	slug: string;
	tenantId: string;
	roomInstanceId?: string;
	rentalId?: string;
	externalAddress?: string;
	externalProvinceId?: number;
	externalDistrictId?: number;
	externalWardId?: number;
	monthlyRent: number;
	currency: string;
	depositAmount: number;
	utilityCostPerPerson?: number;
	seekingCount: number;
	approvedCount: number;
	remainingSlots: number;
	maxOccupancy: number;
	currentOccupancy: number;
	preferredGender: 'other' | 'male' | 'female';
	additionalRequirements?: string;
	availableFromDate: string;
	minimumStayMonths?: number;
	maximumStayMonths?: number;
	status: 'draft' | 'active' | 'paused' | 'closed' | 'expired';
	requiresLandlordApproval: boolean;
	isApprovedByLandlord?: boolean;
	landlordNotes?: string;
	isActive: boolean;
	expiresAt?: string;
	viewCount: number;
	contactCount: number;
	createdAt: string;
	updatedAt: string;
	tenant?: {
		id: string;
		firstName?: string;
		lastName?: string;
		avatarUrl?: string;
		phoneNumber?: string;
	};
	roomInstance?: {
		id: string;
		roomNumber: string;
		room?: {
			id: string;
			name: string;
			building?: {
				id: string;
				name: string;
				address: string;
			};
		};
	};
	externalProvince?: { id: number; name: string };
	externalDistrict?: { id: number; name: string };
	externalWard?: { id: number; name: string };
}

export interface CreateRoommateSeekingPostRequest {
	title: string;
	description: string;
	roomInstanceId?: string;
	rentalId?: string;
	externalAddress?: string;
	externalProvinceId?: number;
	externalDistrictId?: number;
	externalWardId?: number;
	monthlyRent: number;
	currency?: string;
	depositAmount: number;
	utilityCostPerPerson?: number;
	seekingCount: number;
	maxOccupancy: number;
	currentOccupancy: number;
	preferredGender: 'other' | 'male' | 'female';
	additionalRequirements?: string;
	availableFromDate: string;
	minimumStayMonths?: number;
	maximumStayMonths?: number;
	requiresLandlordApproval?: boolean;
	expiresAt?: string;
}

export interface UpdateRoommateSeekingPostRequest {
	title?: string;
	description?: string;
	roomInstanceId?: string;
	rentalId?: string;
	externalAddress?: string;
	externalProvinceId?: number;
	externalDistrictId?: number;
	externalWardId?: number;
	monthlyRent?: number;
	currency?: string;
	depositAmount?: number;
	utilityCostPerPerson?: number;
	seekingCount?: number;
	maxOccupancy?: number;
	currentOccupancy?: number;
	preferredGender?: 'other' | 'male' | 'female';
	additionalRequirements?: string;
	availableFromDate?: string;
	minimumStayMonths?: number;
	maximumStayMonths?: number;
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

// ========================
// Roommate Seeking Posts Service Functions
// ========================

/**
 * Create roommate seeking post
 */
export const createRoommateSeekingPost = async (
	data: CreateRoommateSeekingPostRequest,
): Promise<RoommateSeekingPost> => {
	try {
		const response = await apiClient.post<RoommateSeekingPost>(
			'/api/roommate-seeking-posts',
			data,
		);
		return response.data;
	} catch (error) {
		console.error('Error creating roommate seeking post:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tạo bài đăng tìm bạn cùng phòng'));
	}
};

/**
 * Get roommate seeking post by ID
 */
export const getRoommateSeekingPostById = async (id: string): Promise<RoommateSeekingPost> => {
	try {
		const response = await apiClient.get<RoommateSeekingPost>(
			`/api/roommate-seeking-posts/${id}`,
		);
		return response.data;
	} catch (error) {
		console.error('Error getting roommate seeking post:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải thông tin bài đăng'));
	}
};

/**
 * Get my roommate seeking posts
 */
export const getMyRoommateSeekingPosts = async (params?: {
	page?: number;
	limit?: number;
}): Promise<RoommateSeekingPostListResponse> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());

		const endpoint = `/api/roommate-seeking-posts/me${
			searchParams.toString() ? `?${searchParams.toString()}` : ''
		}`;

		const response = await apiClient.get<RoommateSeekingPostListResponse>(endpoint);
		return response.data;
	} catch (error) {
		console.error('Error getting my roommate seeking posts:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải danh sách bài đăng của bạn'));
	}
};

/**
 * Get all roommate seeking posts (public)
 */
export const getAllRoommateSeekingPosts = async (params?: {
	page?: number;
	limit?: number;
	sortBy?: 'createdAt' | 'monthlyRent' | 'updatedAt';
	sortOrder?: 'asc' | 'desc';
}): Promise<RoommateSeekingPostListResponse> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());
		if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
		if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

		const endpoint = `/api/roommate-seeking-posts${
			searchParams.toString() ? `?${searchParams.toString()}` : ''
		}`;

		const response = await apiClient.get<RoommateSeekingPostListResponse>(endpoint);
		return response.data;
	} catch (error) {
		console.error('Error getting all roommate seeking posts:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải danh sách bài đăng'));
	}
};

/**
 * Search/Filter roommate seeking posts
 */
export const searchRoommateSeekingPosts = async (
	params: SearchRoommateSeekingPostsParams,
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

		const response = await apiClient.get<RoommateSeekingPostListResponse>(endpoint);
		return response.data;
	} catch (error) {
		console.error('Error searching roommate seeking posts:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tìm kiếm bài đăng'));
	}
};

/**
 * Update roommate seeking post
 */
export const updateRoommateSeekingPost = async (
	id: string,
	data: UpdateRoommateSeekingPostRequest,
): Promise<RoommateSeekingPost> => {
	try {
		const response = await apiClient.patch<RoommateSeekingPost>(
			`/api/roommate-seeking-posts/${id}`,
			data,
		);
		return response.data;
	} catch (error) {
		console.error('Error updating roommate seeking post:', error);
		throw new Error(extractErrorMessage(error, 'Không thể cập nhật bài đăng'));
	}
};

/**
 * Update roommate seeking post status
 */
export const updateRoommateSeekingPostStatus = async (
	id: string,
	status: 'active' | 'paused' | 'closed' | 'expired',
): Promise<RoommateSeekingPost> => {
	try {
		const response = await apiClient.patch<RoommateSeekingPost>(
			`/api/roommate-seeking-posts/${id}/status`,
			{ status },
		);
		return response.data;
	} catch (error) {
		console.error('Error updating roommate seeking post status:', error);
		throw new Error(extractErrorMessage(error, 'Không thể cập nhật trạng thái bài đăng'));
	}
};

/**
 * Delete roommate seeking post
 */
export const deleteRoommateSeekingPost = async (id: string): Promise<{ message: string }> => {
	try {
		const response = await apiClient.delete<{ message: string }>(
			`/api/roommate-seeking-posts/${id}`,
		);
		return response.data;
	} catch (error) {
		console.error('Error deleting roommate seeking post:', error);
		throw new Error(extractErrorMessage(error, 'Không thể xóa bài đăng'));
	}
};
