import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	createRoomIssue,
	getTenantRoomIssues,
	getLandlordRoomIssues,
	getRoomIssueById,
	type CreateRoomIssueDto,
	type RoomIssueQueryDto,
	type LandlordRoomIssueQueryDto,
} from '@/services/room-issue-service';

// Query keys
export const roomIssueKeys = {
	all: ['roomIssues'] as const,
	lists: () => [...roomIssueKeys.all, 'list'] as const,
	tenant: (filters: RoomIssueQueryDto) => [...roomIssueKeys.lists(), 'tenant', filters] as const,
	landlord: (filters: LandlordRoomIssueQueryDto) => [...roomIssueKeys.lists(), 'landlord', filters] as const,
	details: () => [...roomIssueKeys.all, 'detail'] as const,
	detail: (id: string) => [...roomIssueKeys.details(), id] as const,
};

/**
 * Hook to get room issues for tenant
 * GET /room-issues/me
 * 
 * Default behavior: returns only 'new' and 'in_progress' issues
 * To see resolved issues, pass status: 'resolved' in params
 */
export const useTenantRoomIssues = (params?: RoomIssueQueryDto, enabled = true) => {
	return useQuery({
		queryKey: roomIssueKeys.tenant(params || {}),
		queryFn: () => getTenantRoomIssues(params),
		enabled,
		staleTime: 1 * 60 * 1000, // 1 minute
	});
};

/**
 * Hook to get room issues for landlord
 * GET /room-issues/landlord
 * 
 * Default behavior: returns only 'new' and 'in_progress' issues, sorted by oldest first
 * Can filter by reporterId, roomInstanceId, category, or status
 */
export const useLandlordRoomIssues = (params?: LandlordRoomIssueQueryDto, enabled = true) => {
	return useQuery({
		queryKey: roomIssueKeys.landlord(params || {}),
		queryFn: () => getLandlordRoomIssues(params),
		enabled,
		staleTime: 1 * 60 * 1000, // 1 minute
	});
};

/**
 * Hook to get room issue detail by ID
 * GET /room-issues/:issueId
 * 
 * Access control:
 * - Tenant can only view their own issues
 * - Landlord can only view issues from their buildings
 */
export const useRoomIssue = (issueId: string, enabled = true) => {
	return useQuery({
		queryKey: roomIssueKeys.detail(issueId),
		queryFn: () => getRoomIssueById(issueId),
		enabled: enabled && !!issueId,
		staleTime: 1 * 60 * 1000,
	});
};

/**
 * Hook to create a new room issue report (Tenant only)
 * POST /room-issues
 * 
 * Requirements:
 * - Tenant must have an active rental with the roomInstanceId
 * - Title max 120 characters
 * - imageUrls optional, max 10 links
 * 
 * On success:
 * - Creates issue with status 'new'
 * - Sends notification to landlord who owns the building
 */
export const useCreateRoomIssue = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateRoomIssueDto) => createRoomIssue(data),
		onSuccess: () => {
			// Invalidate tenant's room issue list
			queryClient.invalidateQueries({ queryKey: roomIssueKeys.lists() });
		},
	});
};
