import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	createRoomSeekingPost,
	getRoomSeekingPostById,
	searchRoomSeekingPosts,
	updateRoomSeekingPost,
	updateRoomSeekingPostStatus,
	deleteRoomSeekingPost,
	getMyRoomSeekingPosts,
} from '@/services/room-seeking-service';
import type {
	CreateRoomSeekingPostRequest,
	UpdateRoomSeekingPostRequest,
	RoomSeekingSearchParams,
} from '@/services/room-seeking-service';

// Query keys
export const roomSeekingPostKeys = {
	all: ['room-seeking-posts'] as const,
	lists: () => [...roomSeekingPostKeys.all, 'list'] as const,
	myPosts: (filters: Record<string, unknown>) => 
		[...roomSeekingPostKeys.all, 'my-posts', filters] as const,
	search: (params: RoomSeekingSearchParams) => 
		[...roomSeekingPostKeys.all, 'search', params] as const,
	details: () => [...roomSeekingPostKeys.all, 'detail'] as const,
	detail: (id: string) => [...roomSeekingPostKeys.details(), id] as const,
};

// Get room seeking post by ID
export const useRoomSeekingPost = (id: string, enabled = true) => {
	return useQuery({
		queryKey: roomSeekingPostKeys.detail(id),
		queryFn: () => getRoomSeekingPostById(id),
		enabled: enabled && !!id,
		staleTime: 2 * 60 * 1000,
	});
};

// Get my room seeking posts
export const useMyRoomSeekingPosts = (params?: {
	page?: number;
	limit?: number;
	status?: string;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}) => {
	return useQuery({
		queryKey: roomSeekingPostKeys.myPosts(params || {}),
		queryFn: () => getMyRoomSeekingPosts(params),
		staleTime: 2 * 60 * 1000,
	});
};

// Search/Filter room seeking posts
export const useSearchRoomSeekingPosts = (
	params: RoomSeekingSearchParams,
	enabled = true,
) => {
	return useQuery({
		queryKey: roomSeekingPostKeys.search(params),
		queryFn: () => searchRoomSeekingPosts(params),
		enabled,
		staleTime: 2 * 60 * 1000,
	});
};

// Create room seeking post mutation
export const useCreateRoomSeekingPost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateRoomSeekingPostRequest) => createRoomSeekingPost(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: roomSeekingPostKeys.lists() });
			queryClient.invalidateQueries({ queryKey: roomSeekingPostKeys.myPosts({}) });
		},
	});
};

// Update room seeking post mutation
export const useUpdateRoomSeekingPost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateRoomSeekingPostRequest }) =>
			updateRoomSeekingPost(id, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: roomSeekingPostKeys.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: roomSeekingPostKeys.lists() });
			queryClient.invalidateQueries({ queryKey: roomSeekingPostKeys.myPosts({}) });
		},
	});
};

// Update room seeking post status mutation
export const useUpdateRoomSeekingPostStatus = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, status }: { id: string; status: 'active' | 'paused' | 'closed' | 'expired' }) =>
			updateRoomSeekingPostStatus(id, status),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: roomSeekingPostKeys.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: roomSeekingPostKeys.lists() });
			queryClient.invalidateQueries({ queryKey: roomSeekingPostKeys.myPosts({}) });
		},
	});
};

// Delete room seeking post mutation
export const useDeleteRoomSeekingPost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteRoomSeekingPost(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: roomSeekingPostKeys.lists() });
			queryClient.invalidateQueries({ queryKey: roomSeekingPostKeys.myPosts({}) });
		},
	});
};
