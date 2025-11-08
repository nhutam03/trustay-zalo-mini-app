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
    const response = await apiClient.get<RoomSeekingPost>(`/api/room-seeking-posts/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching room seeking post:', error);
    throw new Error(extractErrorMessage(error, 'Không thể tải thông tin bài đăng'));
  }
};

// // Get featured roommate posts
// export const getFeaturedRoommatePosts = async (limit: number = 10): Promise<RoommatePost[]> => {
//   try {
//     const response = await apiClient.get<RoommateListingsResponse>('/api/listings/roommate-seeking-posts', {
//       params: {
//         search: '',
//         page: 1,
//         limit,
//         sortBy: 'createdAt',
//         sortOrder: 'desc',
//       },
//     });

//     return response.data.data || [];
//   } catch (error) {
//     console.error('Error fetching featured roommate posts:', error);
//     throw new Error(extractErrorMessage(error, 'Không thể tải danh sách tìm bạn ở ghép'));
//   }
// };
