import { apiClient, extractErrorMessage } from '../lib/api-client';
import type { RoomSeekingPost, RoomSeekingPostListResponse } from '../interfaces/basic';
import {  
  RoomDetail,
	RoomListing,
	RoomListingsResponse,
	RoomSearchParams,
	RoomSeekingPublicSearchParams } from '@/interfaces/room-interface';
import { encodeSearchQuery } from '@/utils/basic';
import { RoommateSeekingListingResponse } from '@/interfaces/roommate-interface';

/**
 * Search room listings with filters
 */
export async function searchRoomListings(params: RoomSearchParams): Promise<RoomListingsResponse> {
	try {
		// Build query string
		const queryParams = new URLSearchParams();

		// Required parameter - handle empty search properly
		queryParams.append('search', encodeSearchQuery(params.search));

		// Optional parameters
		if (params.provinceId !== undefined)
			queryParams.append('provinceId', params.provinceId.toString());
		if (params.districtId !== undefined)
			queryParams.append('districtId', params.districtId.toString());
		if (params.wardId !== undefined) queryParams.append('wardId', params.wardId.toString());
		if (params.roomType) queryParams.append('roomType', params.roomType);
		if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
		if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
		if (params.minArea !== undefined) queryParams.append('minArea', params.minArea.toString());
		if (params.maxArea !== undefined) queryParams.append('maxArea', params.maxArea.toString());
		if (params.amenities) queryParams.append('amenities', params.amenities);
		if (params.maxOccupancy !== undefined)
			queryParams.append('maxOccupancy', params.maxOccupancy.toString());
		if (params.isVerified !== undefined)
			queryParams.append('isVerified', params.isVerified.toString());
		if (params.latitude !== undefined) queryParams.append('latitude', params.latitude.toString());
		if (params.longitude !== undefined)
			queryParams.append('longitude', params.longitude.toString());
		if (params.sortBy) queryParams.append('sortBy', params.sortBy);
		if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
		if (params.page !== undefined) queryParams.append('page', params.page.toString());
		if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());

		const endpoint = `/api/listings/rooms?${queryParams.toString()}`;

		const response = await apiClient.get<RoomListingsResponse>(endpoint);
		return response.data;
	} catch (error: unknown) {
		console.error('Failed to search room listings:', error);
		throw error;
	}
}

/**
//  * Get room detail by id
//  */
// export async function getRoomById(id: string): Promise<RoomDetail> {
// 	try {
// 		const response = await apiClient.get<RoomDetail>(`/api/rooms/public/id/${id}`);

// 		return response.data;
// 	} catch (error: unknown) {
// 		console.error('Failed to get room detail:', error);
// 		throw error;
// 	}
// }

/**
 * Get all room listings without search filter (for internal use)
 */
export async function getAllRoomListings(
	params: Omit<RoomSearchParams, 'search'> = {},
): Promise<RoomListingsResponse> {
	try {
		// Use searchRoomListings with empty search (will default to '.')
		return await searchRoomListings({
			search: '',
			...params,
		});
	} catch (error: unknown) {
		console.error('Failed to get all room listings:', error);
		throw error;
	}
}

/**
 * Get featured/hot room listings for homepage
 */
export async function getFeaturedRoomListings(limit: number = 4): Promise<RoomListing[]> {
	try {
		const response = await getAllRoomListings({
			sortBy: 'createdAt',
			sortOrder: 'desc',
			page: 1,
		});

		return response.data.slice(0, limit);
	} catch (error: unknown) {
		console.error('Failed to get featured room listings:', error);
		throw error;
	}
}

export async function listPublicRoomSeekingPosts(
	params: RoomSeekingPublicSearchParams = {},
): Promise<RoomSeekingPostListResponse> {
	const query = new URLSearchParams();
	// Do NOT force a default search for room-seeking posts
	if (params.search && params.search.trim().length > 0) {
		query.append('search', params.search);
	}
	if (typeof params.page === 'number') query.append('page', String(params.page));
	if (typeof params.limit === 'number') query.append('limit', String(params.limit));
	if (typeof params.provinceId === 'number') query.append('provinceId', String(params.provinceId));
	if (typeof params.districtId === 'number') query.append('districtId', String(params.districtId));
	if (typeof params.wardId === 'number') query.append('wardId', String(params.wardId));
	if (typeof params.minBudget === 'number') query.append('minBudget', String(params.minBudget));
	if (typeof params.maxBudget === 'number') query.append('maxBudget', String(params.maxBudget));
	if (params.roomType) query.append('roomType', params.roomType);
	if (typeof params.occupancy === 'number') query.append('occupancy', String(params.occupancy));
	if (params.status) query.append('status', params.status);
	if (typeof params.isPublic === 'boolean') query.append('isPublic', String(params.isPublic));
	if (params.sortBy) query.append('sortBy', params.sortBy);
	if (params.sortOrder) query.append('sortOrder', params.sortOrder);

	const endpoint = `/api/listings/room-seeking-posts${query.toString() ? `?${query.toString()}` : ''}`;
	try {
		const response = await apiClient.get<RoomSeekingPostListResponse>(endpoint);
		return response.data;
	} catch (error) {
		console.error('Failed to list public room seeking posts:', error);
		throw error;
	}
}

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