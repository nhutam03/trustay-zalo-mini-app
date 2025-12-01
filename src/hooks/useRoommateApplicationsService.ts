import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	createRoommateApplication,
	getRoommateApplicationById,
	getMyRoommateApplications,
	getApplicationsForMyPosts,
	updateRoommateApplication,
	respondToRoommateApplication,
	confirmRoommateApplication,
	cancelRoommateApplication,
	bulkRespondToApplications,
	getMyApplicationStatistics,
	getApplicationStatisticsForMyPosts,
	getLandlordPendingApplications,
	landlordApproveApplication,
	landlordRejectApplication,
	addRoommateDirectly,
	generateInviteLink,
	acceptInvite,
} from '@/services/roommate-applications-service';
import type {
	CreateRoommateApplicationRequest,
	UpdateRoommateApplicationRequest,
	RespondToApplicationRequest,
	AddRoommateDirectlyRequest,
	AcceptInviteRequest,
} from '@/services/roommate-applications-service';

// Query keys
export const roommateApplicationKeys = {
	all: ['roommate-applications'] as const,
	lists: () => [...roommateApplicationKeys.all, 'list'] as const,
	myApplications: (filters: Record<string, unknown>) => 
		[...roommateApplicationKeys.all, 'my-applications', filters] as const,
	forMyPosts: (filters: Record<string, unknown>) => 
		[...roommateApplicationKeys.all, 'for-my-posts', filters] as const,
	landlordPending: (filters: Record<string, unknown>) => 
		[...roommateApplicationKeys.all, 'landlord-pending', filters] as const,
	details: () => [...roommateApplicationKeys.all, 'detail'] as const,
	detail: (id: string) => [...roommateApplicationKeys.details(), id] as const,
	myStats: () => [...roommateApplicationKeys.all, 'my-stats'] as const,
	forMyPostsStats: () => [...roommateApplicationKeys.all, 'for-my-posts-stats'] as const,
};

// Get application by ID
export const useRoommateApplication = (id: string, enabled = true) => {
	return useQuery({
		queryKey: roommateApplicationKeys.detail(id),
		queryFn: () => getRoommateApplicationById(id),
		enabled: enabled && !!id,
		staleTime: 1 * 60 * 1000,
	});
};

// Get my applications
export const useMyRoommateApplications = (params?: {
	page?: number;
	limit?: number;
	status?: 'pending' | 'accepted' | 'rejected' | 'awaiting_confirmation' | 'cancelled' | 'expired';
	search?: string;
	roommateSeekingPostId?: string;
	isUrgent?: boolean;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}) => {
	return useQuery({
		queryKey: roommateApplicationKeys.myApplications(params || {}),
		queryFn: () => getMyRoommateApplications(params),
		staleTime: 1 * 60 * 1000,
	});
};

// Get applications for my posts
export const useApplicationsForMyPosts = (params?: {
	page?: number;
	limit?: number;
	status?: 'pending' | 'accepted' | 'rejected' | 'awaiting_confirmation' | 'cancelled' | 'expired';
	search?: string;
	roommateSeekingPostId?: string;
	isUrgent?: boolean;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}) => {
	return useQuery({
		queryKey: roommateApplicationKeys.forMyPosts(params || {}),
		queryFn: () => getApplicationsForMyPosts(params),
		staleTime: 1 * 60 * 1000,
	});
};

// Get landlord pending applications
export const useLandlordPendingApplications = (params?: {
	page?: number;
	limit?: number;
	status?: 'accepted' | 'rejected' | 'awaiting_confirmation';
	search?: string;
	roommateSeekingPostId?: string;
	isUrgent?: boolean;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}) => {
	return useQuery({
		queryKey: roommateApplicationKeys.landlordPending(params || {}),
		queryFn: () => getLandlordPendingApplications(params),
		staleTime: 1 * 60 * 1000,
	});
};

// Get my application statistics
export const useMyApplicationStatistics = () => {
	return useQuery({
		queryKey: roommateApplicationKeys.myStats(),
		queryFn: getMyApplicationStatistics,
		staleTime: 5 * 60 * 1000,
	});
};

// Get application statistics for my posts
export const useApplicationStatisticsForMyPosts = () => {
	return useQuery({
		queryKey: roommateApplicationKeys.forMyPostsStats(),
		queryFn: getApplicationStatisticsForMyPosts,
		staleTime: 5 * 60 * 1000,
	});
};

// Create roommate application mutation
export const useCreateRoommateApplication = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateRoommateApplicationRequest) => createRoommateApplication(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: roommateApplicationKeys.myApplications({}) });
			queryClient.invalidateQueries({ queryKey: roommateApplicationKeys.all });
		},
	});
};

// Update application mutation
export const useUpdateRoommateApplication = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateRoommateApplicationRequest }) =>
			updateRoommateApplication(id, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: roommateApplicationKeys.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: roommateApplicationKeys.myApplications({}) });
		},
	});
};

// Respond to application mutation (Tenant)
export const useRespondToRoommateApplication = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: RespondToApplicationRequest }) =>
			respondToRoommateApplication(id, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: roommateApplicationKeys.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: roommateApplicationKeys.forMyPosts({}) });
			queryClient.invalidateQueries({ queryKey: roommateApplicationKeys.all });
		},
	});
};

// Confirm application mutation
export const useConfirmRoommateApplication = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => confirmRoommateApplication(id),
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: roommateApplicationKeys.detail(id) });
			queryClient.invalidateQueries({ queryKey: roommateApplicationKeys.all });
		},
	});
};

// Cancel application mutation
export const useCancelRoommateApplication = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => cancelRoommateApplication(id),
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: roommateApplicationKeys.detail(id) });
			queryClient.invalidateQueries({ queryKey: roommateApplicationKeys.myApplications({}) });
		},
	});
};

// Bulk respond to applications mutation
export const useBulkRespondToApplications = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: {
			applicationIds: string[];
			status: 'accepted' | 'rejected';
			response: string;
		}) => bulkRespondToApplications(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: roommateApplicationKeys.forMyPosts({}) });
			queryClient.invalidateQueries({ queryKey: roommateApplicationKeys.all });
		},
	});
};

// Landlord approve application mutation
export const useLandlordApproveApplication = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, response }: { id: string; response: string }) =>
			landlordApproveApplication(id, response),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: roommateApplicationKeys.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: roommateApplicationKeys.landlordPending({}) });
			queryClient.invalidateQueries({ queryKey: roommateApplicationKeys.all });
		},
	});
};

// Landlord reject application mutation
export const useLandlordRejectApplication = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, response }: { id: string; response: string }) =>
			landlordRejectApplication(id, response),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: roommateApplicationKeys.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: roommateApplicationKeys.landlordPending({}) });
			queryClient.invalidateQueries({ queryKey: roommateApplicationKeys.all });
		},
	});
};

// Add roommate directly mutation
export const useAddRoommateDirectly = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ postId, data }: { postId: string; data: AddRoommateDirectlyRequest }) =>
			addRoommateDirectly(postId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: roommateApplicationKeys.all });
		},
	});
};

// Generate invite link mutation
export const useGenerateInviteLink = () => {
	return useMutation({
		mutationFn: generateInviteLink,
	});
};

// Accept invite mutation
export const useAcceptInvite = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: AcceptInviteRequest) => acceptInvite(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: roommateApplicationKeys.myApplications({}) });
			queryClient.invalidateQueries({ queryKey: roommateApplicationKeys.all });
		},
	});
};
