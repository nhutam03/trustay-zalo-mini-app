import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	createRoomInvitation,
	getSentInvitations,
	getReceivedInvitations,
	getInvitationById,
	respondToInvitation,
	withdrawInvitation,
	getMyInvitations,
	confirmInvitation,
	type CreateRoomInvitationRequest,
	type RespondInvitationRequest,
} from '@/services/invitation-service';

// Query keys
export const invitationKeys = {
	all: ['invitations'] as const,
	lists: () => [...invitationKeys.all, 'list'] as const,
	sent: (params?: Record<string, any>) => [...invitationKeys.all, 'sent', params] as const,
	received: (params?: Record<string, any>) =>
		[...invitationKeys.all, 'received', params] as const,
	myInvitations: (params?: Record<string, any>) =>
		[...invitationKeys.all, 'my-invitations', params] as const,
	details: () => [...invitationKeys.all, 'detail'] as const,
	detail: (id: string) => [...invitationKeys.details(), id] as const,
};

// Get sent invitations
export const useSentInvitations = (params?: {
	page?: number;
	limit?: number;
	status?: string;
	buildingId?: string;
	roomId?: string;
}) => {
	return useQuery({
		queryKey: invitationKeys.sent(params),
		queryFn: () => getSentInvitations(params),
		staleTime: 30 * 1000, // 30 seconds
	});
};

// Get received invitations
export const useReceivedInvitations = (params?: {
	page?: number;
	limit?: number;
	status?: string;
}) => {
	return useQuery({
		queryKey: invitationKeys.received(params),
		queryFn: () => getReceivedInvitations(params),
		staleTime: 30 * 1000,
	});
};

// Get my invitations
export const useMyInvitations = (params?: {
	page?: number;
	limit?: number;
	status?: string;
	buildingId?: string;
	roomId?: string;
}) => {
	return useQuery({
		queryKey: invitationKeys.myInvitations(params),
		queryFn: () => getMyInvitations(params),
		staleTime: 30 * 1000,
	});
};

// Get invitation by ID
export const useInvitationById = (id: string | undefined) => {
	return useQuery({
		queryKey: invitationKeys.detail(id || ''),
		queryFn: () => getInvitationById(id!),
		enabled: !!id,
		staleTime: 30 * 1000,
	});
};

// Create room invitation
export const useCreateRoomInvitation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateRoomInvitationRequest) => createRoomInvitation(data),
		onSuccess: () => {
			// Invalidate sent invitations list
			queryClient.invalidateQueries({ queryKey: invitationKeys.sent() });
			queryClient.invalidateQueries({ queryKey: invitationKeys.myInvitations() });
		},
	});
};

// Respond to invitation
export const useRespondToInvitation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: RespondInvitationRequest }) =>
			respondToInvitation(id, data),
		onSuccess: (_, variables) => {
			// Invalidate received invitations list and the specific invitation
			queryClient.invalidateQueries({ queryKey: invitationKeys.received() });
			queryClient.invalidateQueries({ queryKey: invitationKeys.detail(variables.id) });
		},
	});
};

// Withdraw invitation
export const useWithdrawInvitation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => withdrawInvitation(id),
		onSuccess: (_, id) => {
			// Invalidate sent invitations list and the specific invitation
			queryClient.invalidateQueries({ queryKey: invitationKeys.sent() });
			queryClient.invalidateQueries({ queryKey: invitationKeys.myInvitations() });
			queryClient.invalidateQueries({ queryKey: invitationKeys.detail(id) });
		},
	});
};

// Confirm invitation
export const useConfirmInvitation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => confirmInvitation(id),
		onSuccess: (_, id) => {
			// Invalidate all invitation lists and the specific invitation
			queryClient.invalidateQueries({ queryKey: invitationKeys.lists() });
			queryClient.invalidateQueries({ queryKey: invitationKeys.detail(id) });
			// Also invalidate rentals list
			queryClient.invalidateQueries({ queryKey: ['rentals'] });
		},
	});
};
