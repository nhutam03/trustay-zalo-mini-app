import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	createRating,
	getRatings,
	getRatingById,
	updateRating,
	deleteRating,
	getUserCreatedRatings,
	hasUserRatedTarget,
	getRatingStats,
	type CreateRatingRequest,
	type UpdateRatingRequest,
	type GetRatingsQueryParams,
} from '@/services/rating-service';

// Query keys
export const ratingKeys = {
	all: ['ratings'] as const,
	lists: () => [...ratingKeys.all, 'list'] as const,
	list: (params?: GetRatingsQueryParams) => [...ratingKeys.lists(), params] as const,
	details: () => [...ratingKeys.all, 'detail'] as const,
	detail: (id: string) => [...ratingKeys.details(), id] as const,
	userCreated: (userId: string, params?: any) =>
		[...ratingKeys.all, 'user-created', userId, params] as const,
	hasRated: (targetType: string, targetId: string) =>
		[...ratingKeys.all, 'has-rated', targetType, targetId] as const,
	stats: (targetType: string, targetId: string) =>
		[...ratingKeys.all, 'stats', targetType, targetId] as const,
};

// Get ratings with filters and pagination
export const useRatings = (params?: GetRatingsQueryParams) => {
	return useQuery({
		queryKey: ratingKeys.list(params),
		queryFn: () => getRatings(params),
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
};

// Get rating by ID
export const useRatingById = (ratingId: string | undefined) => {
	return useQuery({
		queryKey: ratingKeys.detail(ratingId || ''),
		queryFn: () => getRatingById(ratingId!),
		enabled: !!ratingId,
		staleTime: 5 * 60 * 1000,
	});
};

// Get user created ratings
export const useUserCreatedRatings = (
	userId: string | undefined,
	params?: Omit<GetRatingsQueryParams, 'reviewerId'>
) => {
	return useQuery({
		queryKey: ratingKeys.userCreated(userId || '', params),
		queryFn: () => getUserCreatedRatings(userId!, params),
		enabled: !!userId,
		staleTime: 2 * 60 * 1000,
	});
};

// Check if user has rated target
export const useHasUserRatedTarget = (
	targetType: 'tenant' | 'landlord' | 'room' | undefined,
	targetId: string | undefined
) => {
	return useQuery({
		queryKey: ratingKeys.hasRated(targetType || '', targetId || ''),
		queryFn: () => hasUserRatedTarget(targetType!, targetId!),
		enabled: !!targetType && !!targetId,
		staleTime: 30 * 1000, // 30 seconds
	});
};

// Get rating statistics
export const useRatingStats = (
	targetType: 'tenant' | 'landlord' | 'room' | undefined,
	targetId: string | undefined
) => {
	return useQuery({
		queryKey: ratingKeys.stats(targetType || '', targetId || ''),
		queryFn: () => getRatingStats(targetType!, targetId!),
		enabled: !!targetType && !!targetId,
		staleTime: 2 * 60 * 1000,
	});
};

// Create rating
export const useCreateRating = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateRatingRequest) => createRating(data),
		onSuccess: (_, variables) => {
			// Invalidate ratings list for the target
			queryClient.invalidateQueries({
				queryKey: ratingKeys.list({
					targetType: variables.targetType,
					targetId: variables.targetId,
				}),
			});
			// Invalidate has-rated query
			queryClient.invalidateQueries({
				queryKey: ratingKeys.hasRated(variables.targetType, variables.targetId),
			});
			// Invalidate rating stats
			queryClient.invalidateQueries({
				queryKey: ratingKeys.stats(variables.targetType, variables.targetId),
			});
		},
	});
};

// Update rating
export const useUpdateRating = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ ratingId, data }: { ratingId: string; data: UpdateRatingRequest }) =>
			updateRating(ratingId, data),
		onSuccess: (_, variables) => {
			// Invalidate the specific rating
			queryClient.invalidateQueries({ queryKey: ratingKeys.detail(variables.ratingId) });
			// Invalidate all ratings lists (to be safe)
			queryClient.invalidateQueries({ queryKey: ratingKeys.lists() });
			// Invalidate stats
			queryClient.invalidateQueries({ queryKey: [...ratingKeys.all, 'stats'] });
		},
	});
};

// Delete rating
export const useDeleteRating = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (ratingId: string) => deleteRating(ratingId),
		onSuccess: () => {
			// Invalidate all ratings queries
			queryClient.invalidateQueries({ queryKey: ratingKeys.all });
		},
	});
};
