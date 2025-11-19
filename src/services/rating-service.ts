import { apiClient, extractErrorMessage } from '@/lib/api-client';

// Types
export interface RatingResponseDto {
	id: string;
	reviewerId: string;
	targetType: 'tenant' | 'landlord' | 'room';
	targetId: string;
	rentalId?: string;
	rating: number;
	comment?: string;
	isCurrentUser?: boolean;
	createdAt: string;
	updatedAt: string;
	reviewer?: {
		id: string;
		firstName: string;
		lastName: string;
		avatarUrl?: string;
	};
}

export interface CreateRatingRequest {
	targetType: 'tenant' | 'landlord' | 'room';
	targetId: string;
	rentalId?: string;
	rating: number;
	comment?: string;
}

export interface UpdateRatingRequest {
	rating?: number;
	comment?: string;
}

export interface GetRatingsQueryParams {
	targetType?: 'tenant' | 'landlord' | 'room';
	targetId?: string;
	reviewerId?: string;
	rentalId?: string;
	minRating?: number;
	maxRating?: number;
	page?: number;
	limit?: number;
	sortBy?: 'createdAt' | 'rating';
	sortOrder?: 'asc' | 'desc';
}

export interface PaginatedRatingsResponse {
	data: RatingResponseDto[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
	stats?: {
		averageRating: number;
		totalRatings: number;
		distribution: {
			'1': number;
			'2': number;
			'3': number;
			'4': number;
			'5': number;
		};
	};
}

// Create a new rating
export const createRating = async (data: CreateRatingRequest): Promise<RatingResponseDto> => {
	try {
		const response = await apiClient.post<RatingResponseDto>('/api/ratings', data);
		return response.data;
	} catch (error) {
		console.error('Error creating rating:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tạo đánh giá'));
	}
};

// Get ratings with filters and pagination
export const getRatings = async (
	params?: GetRatingsQueryParams
): Promise<PaginatedRatingsResponse> => {
	try {
		const queryParams = new URLSearchParams();

		if (params?.targetType) queryParams.append('targetType', params.targetType);
		if (params?.targetId) queryParams.append('targetId', params.targetId);
		if (params?.reviewerId) queryParams.append('reviewerId', params.reviewerId);
		if (params?.rentalId) queryParams.append('rentalId', params.rentalId);
		if (params?.minRating) queryParams.append('minRating', params.minRating.toString());
		if (params?.maxRating) queryParams.append('maxRating', params.maxRating.toString());
		if (params?.page) queryParams.append('page', params.page.toString());
		if (params?.limit) queryParams.append('limit', params.limit.toString());
		if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
		if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

		const url = queryParams.toString() ? `/api/ratings?${queryParams.toString()}` : '/api/ratings';

		const response = await apiClient.get<PaginatedRatingsResponse>(url);
		return response.data;
	} catch (error) {
		console.error('Error getting ratings:', error);
		// If 404, return empty ratings instead of throwing
		if ((error as any)?.response?.status === 404) {
			return {
				data: [],
				meta: {
					page: 1,
					limit: params?.limit || 10,
					total: 0,
					totalPages: 0,
				},
				stats: {
					averageRating: 0,
					totalRatings: 0,
					distribution: {
						'1': 0,
						'2': 0,
						'3': 0,
						'4': 0,
						'5': 0,
					},
				},
			};
		}
		throw new Error(extractErrorMessage(error, 'Không thể tải danh sách đánh giá'));
	}
};

// Get a single rating by ID
export const getRatingById = async (ratingId: string): Promise<RatingResponseDto> => {
	try {
		const response = await apiClient.get<RatingResponseDto>(`/api/ratings/${ratingId}`);
		return response.data;
	} catch (error) {
		console.error('Error getting rating by ID:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải thông tin đánh giá'));
	}
};

// Update an existing rating
export const updateRating = async (
	ratingId: string,
	data: UpdateRatingRequest
): Promise<RatingResponseDto> => {
	try {
		const response = await apiClient.patch<RatingResponseDto>(
			`/api/ratings/${ratingId}`,
			data
		);
		return response.data;
	} catch (error) {
		console.error('Error updating rating:', error);
		throw new Error(extractErrorMessage(error, 'Không thể cập nhật đánh giá'));
	}
};

// Delete a rating
export const deleteRating = async (ratingId: string): Promise<{ message: string }> => {
	try {
		const response = await apiClient.delete<{ message: string }>(
			`/api/ratings/${ratingId}`
		);
		return response.data;
	} catch (error) {
		console.error('Error deleting rating:', error);
		throw new Error(extractErrorMessage(error, 'Không thể xóa đánh giá'));
	}
};

// Get ratings created by a specific user
export const getUserCreatedRatings = async (
	userId: string,
	params?: Omit<GetRatingsQueryParams, 'reviewerId'>
): Promise<PaginatedRatingsResponse> => {
	try {
		const queryParams = new URLSearchParams();

		if (params?.targetType) queryParams.append('targetType', params.targetType);
		if (params?.minRating) queryParams.append('minRating', params.minRating.toString());
		if (params?.maxRating) queryParams.append('maxRating', params.maxRating.toString());
		if (params?.page) queryParams.append('page', params.page.toString());
		if (params?.limit) queryParams.append('limit', params.limit.toString());
		if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
		if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

		const url = queryParams.toString()
			? `/api/ratings/user/${userId}?${queryParams.toString()}`
			: `/api/ratings/user/${userId}`;

		const response = await apiClient.get<PaginatedRatingsResponse>(url);
		return response.data;
	} catch (error) {
		console.error('Error getting user created ratings:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải danh sách đánh giá của người dùng'));
	}
};

// Check if current user has rated a target
export const hasUserRatedTarget = async (
	targetType: 'tenant' | 'landlord' | 'room',
	targetId: string
): Promise<{ hasRated: boolean; rating?: RatingResponseDto }> => {
	try {
		const data = await getRatings({
			targetType,
			targetId,
			limit: 1,
		});

		// Check if the first rating is from the current user
		const currentUserRating = data.data.find((rating) => rating.isCurrentUser);

		return {
			hasRated: !!currentUserRating,
			rating: currentUserRating,
		};
	} catch (error) {
		console.error('Error checking if user rated target:', error);
		throw new Error(extractErrorMessage(error, 'Không thể kiểm tra đánh giá'));
	}
};

// Get rating statistics for a target
export const getRatingStats = async (
	targetType: 'tenant' | 'landlord' | 'room',
	targetId: string
): Promise<{
	totalRatings: number;
	averageRating: number;
	distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
}> => {
	try {
		const data = await getRatings({
			targetType,
			targetId,
			limit: 1, // We only need the stats, not the actual ratings
		});

		if (data.stats) {
			return data.stats;
		}

		throw new Error('Failed to get rating statistics');
	} catch (error) {
		console.error('Error getting rating stats:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải thống kê đánh giá'));
	}
};
