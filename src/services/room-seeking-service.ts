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
}

// Get featured room seeking posts
export const getFeaturedRoomSeekingPosts = async (limit: number = 10): Promise<RoomSeekingPost[]> => {
  try {
    const response = await apiClient.get<RoomSeekingPostListResponse>('/api/listings/room-seeking-posts', {
      params: {
        page: 1,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
    });

    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching featured room seeking posts:', error);
    throw new Error(extractErrorMessage(error, 'Không thể tải danh sách tìm phòng'));
  }
};

// Search room seeking posts with filters
export const searchRoomSeekingPosts = async (params: RoomSeekingSearchParams): Promise<RoomSeekingPostListResponse> => {
  try {
    const response = await apiClient.get<RoomSeekingPostListResponse>('/api/listings/room-seeking-posts', {
      params,
    });

    return response.data;
  } catch (error) {
    console.error('Error searching room seeking posts:', error);
    throw new Error(extractErrorMessage(error, 'Không thể tìm kiếm bài đăng'));
  }
};

// Get a single room seeking post by ID
export const getRoomSeekingPostById = async (id: string): Promise<RoomSeekingPost> => {
  try {
    const response = await apiClient.get<RoomSeekingPost>(`/api/listings/room-seeking-posts/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching room seeking post:', error);
    throw new Error(extractErrorMessage(error, 'Không thể tải thông tin bài đăng'));
  }
};

import { RoommatePost } from '@/interfaces/basic';

// Roommate search params
export interface RoommateSearchParams {
  search?: string;
  provinceId?: number;
  districtId?: number;
  wardId?: number;
  minBudget?: number;
  maxBudget?: number;
  preferredGender?: 'male' | 'female' | 'mixed';
  moveInDateFrom?: string;
  moveInDateTo?: string;
  page?: number;
  limit?: number;
}

// Response structure for roommate listings
export interface RoommateListingsResponse {
  data: RoommatePost[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Get featured roommate posts
export const getFeaturedRoommatePosts = async (limit: number = 10): Promise<RoommatePost[]> => {
  try {
    const response = await apiClient.get<RoommateListingsResponse>('/api/listings/roommate-seeking-posts', {
      params: {
        search: '',
        page: 1,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
    });

    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching featured roommate posts:', error);
    throw new Error(extractErrorMessage(error, 'Không thể tải danh sách tìm bạn ở ghép'));
  }
};

// Search roommate posts with filters
export const searchRoommatePosts = async (params: RoommateSearchParams): Promise<RoommateListingsResponse> => {
  try {
    const queryParams: Record<string, string> = {
      search: params.search || '',
    };

    // Add optional parameters
    if (params.provinceId !== undefined) queryParams.provinceId = params.provinceId.toString();
    if (params.districtId !== undefined) queryParams.districtId = params.districtId.toString();
    if (params.wardId !== undefined) queryParams.wardId = params.wardId.toString();
    if (params.minBudget !== undefined) queryParams.minBudget = params.minBudget.toString();
    if (params.maxBudget !== undefined) queryParams.maxBudget = params.maxBudget.toString();
    if (params.preferredGender) queryParams.preferredGender = params.preferredGender;
    if (params.moveInDateFrom) queryParams.moveInDateFrom = params.moveInDateFrom;
    if (params.moveInDateTo) queryParams.moveInDateTo = params.moveInDateTo;
    if (params.page !== undefined) queryParams.page = params.page.toString();
    if (params.limit !== undefined) queryParams.limit = params.limit.toString();

    const response = await apiClient.get<RoommateListingsResponse>('/api/listings/roommate-seeking-posts', {
      params: queryParams,
    });

    return response.data;
  } catch (error) {
    console.error('Error searching roommate posts:', error);
    throw new Error(extractErrorMessage(error, 'Không thể tìm kiếm bài đăng tìm bạn ở ghép'));
  }
};

// Get roommate post by ID
export const getRoommatePostById = async (id: string): Promise<RoommatePost> => {
  try {
    const response = await apiClient.get<RoommatePost>(`/api/roommate/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching roommate post details:', error);
    throw new Error(extractErrorMessage(error, 'Không thể tải thông tin bài đăng'));
  }
};
