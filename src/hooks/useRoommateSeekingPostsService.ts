import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	createRoommateSeekingPost,
	getRoommateSeekingPostById,
	getMyRoommateSeekingPosts,
	getAllRoommateSeekingPosts,
	searchRoommateSeekingPosts,
	updateRoommateSeekingPost,
	updateRoommateSeekingPostStatus,
	deleteRoommateSeekingPost,
} from '@/services/roommate-seeking-posts-service';
import type {
	CreateRoommateSeekingPostRequest,
	UpdateRoommateSeekingPostRequest,
	SearchRoommateSeekingPostsParams,
} from '@/services/roommate-seeking-posts-service';

// Query keys
export const roommateSeekingPostKeys = {
	all: ['roommate-seeking-posts'] as const,
	lists: () => [...roommateSeekingPostKeys.all, 'list'] as const,
	myPosts: (filters: Record<string, unknown>) => 
		[...roommateSeekingPostKeys.all, 'my-posts', filters] as const,
	allPosts: (filters: Record<string, unknown>) => 
		[...roommateSeekingPostKeys.all, 'all-posts', filters] as const,
	search: (params: SearchRoommateSeekingPostsParams) => 
		[...roommateSeekingPostKeys.all, 'search', params] as const,
	details: () => [...roommateSeekingPostKeys.all, 'detail'] as const,
	detail: (id: string) => [...roommateSeekingPostKeys.details(), id] as const,
};

// Get roommate seeking post by ID
export const useRoommateSeekingPost = (id: string, enabled = true) => {
	return useQuery({
		queryKey: roommateSeekingPostKeys.detail(id),
		queryFn: () => getRoommateSeekingPostById(id),
		enabled: enabled && !!id,
		staleTime: 2 * 60 * 1000,
	});
};

// Get my roommate seeking posts
export const useMyRoommateSeekingPosts = (params?: {
	page?: number;
	limit?: number;
}) => {
	return useQuery({
		queryKey: roommateSeekingPostKeys.myPosts(params || {}),
		queryFn: () => getMyRoommateSeekingPosts(params),
		staleTime: 2 * 60 * 1000,
	});
};

// Get all roommate seeking posts (public)
export const useAllRoommateSeekingPosts = (params?: {
	page?: number;
	limit?: number;
	sortBy?: 'createdAt' | 'monthlyRent' | 'updatedAt';
	sortOrder?: 'asc' | 'desc';
}) => {
	return useQuery({
		queryKey: roommateSeekingPostKeys.allPosts(params || {}),
		queryFn: () => getAllRoommateSeekingPosts(params),
		staleTime: 2 * 60 * 1000,
	});
};

// Search/Filter roommate seeking posts
export const useSearchRoommateSeekingPosts = (
	params: SearchRoommateSeekingPostsParams,
	enabled = true,
) => {
	return useQuery({
		queryKey: roommateSeekingPostKeys.search(params),
		queryFn: () => searchRoommateSeekingPosts(params),
		enabled,
		staleTime: 2 * 60 * 1000,
	});
};

// Create roommate seeking post mutation
export const useCreateRoommateSeekingPost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateRoommateSeekingPostRequest) => createRoommateSeekingPost(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: roommateSeekingPostKeys.myPosts({}) });
			queryClient.invalidateQueries({ queryKey: roommateSeekingPostKeys.allPosts({}) });
		},
	});
};

// Update roommate seeking post mutation
export const useUpdateRoommateSeekingPost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateRoommateSeekingPostRequest }) =>
			updateRoommateSeekingPost(id, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: roommateSeekingPostKeys.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: roommateSeekingPostKeys.myPosts({}) });
			queryClient.invalidateQueries({ queryKey: roommateSeekingPostKeys.allPosts({}) });
		},
	});
};

// Update roommate seeking post status mutation
export const useUpdateRoommateSeekingPostStatus = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, status }: { id: string; status: 'active' | 'paused' | 'closed' | 'expired' }) =>
			updateRoommateSeekingPostStatus(id, status),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: roommateSeekingPostKeys.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: roommateSeekingPostKeys.myPosts({}) });
			queryClient.invalidateQueries({ queryKey: roommateSeekingPostKeys.allPosts({}) });
		},
	});
};

// Delete roommate seeking post mutation
export const useDeleteRoommateSeekingPost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteRoommateSeekingPost(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: roommateSeekingPostKeys.myPosts({}) });
			queryClient.invalidateQueries({ queryKey: roommateSeekingPostKeys.allPosts({}) });
		},
	});
};
