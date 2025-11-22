import { apiClient, extractErrorMessage } from '../lib/api-client';
import type { CreateRoommateSeekingPostRequest, RoommateSeekingPost, RoommateSeekingPostListResponse, SearchRoommateSeekingPostsParams, UpdateRoommateSeekingPostRequest } from '../interfaces/roommate-interface';


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


