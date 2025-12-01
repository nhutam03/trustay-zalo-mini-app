import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	createOrUpdateRoomPreferences,
	getRoomPreferences,
	updateRoomPreferences,
	deleteRoomPreferences,
	createOrUpdateRoommatePreferences,
	getRoommatePreferences,
	updateRoommatePreferences,
	deleteRoommatePreferences,
	getAllPreferences,
} from '@/services/tenant-preferences-service';
import type {
	CreateRoomPreferencesRequest,
	UpdateRoomPreferencesRequest,
	CreateRoommatePreferencesRequest,
	UpdateRoommatePreferencesRequest,
} from '@/services/tenant-preferences-service';

// Query keys
export const tenantPreferencesKeys = {
	all: ['tenant-preferences'] as const,
	room: () => [...tenantPreferencesKeys.all, 'room'] as const,
	roommate: () => [...tenantPreferencesKeys.all, 'roommate'] as const,
	allPreferences: () => [...tenantPreferencesKeys.all, 'all-preferences'] as const,
};

// Get room preferences
export const useRoomPreferences = (enabled = true) => {
	return useQuery({
		queryKey: tenantPreferencesKeys.room(),
		queryFn: getRoomPreferences,
		enabled,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};

// Get roommate preferences
export const useRoommatePreferences = (enabled = true) => {
	return useQuery({
		queryKey: tenantPreferencesKeys.roommate(),
		queryFn: getRoommatePreferences,
		enabled,
		staleTime: 5 * 60 * 1000,
	});
};

// Get all preferences (both room and roommate)
export const useAllPreferences = (enabled = true) => {
	return useQuery({
		queryKey: tenantPreferencesKeys.allPreferences(),
		queryFn: getAllPreferences,
		enabled,
		staleTime: 5 * 60 * 1000,
	});
};

// Create or update room preferences mutation
export const useCreateOrUpdateRoomPreferences = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateRoomPreferencesRequest) => createOrUpdateRoomPreferences(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: tenantPreferencesKeys.room() });
			queryClient.invalidateQueries({ queryKey: tenantPreferencesKeys.allPreferences() });
		},
	});
};

// Update room preferences mutation
export const useUpdateRoomPreferences = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdateRoomPreferencesRequest) => updateRoomPreferences(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: tenantPreferencesKeys.room() });
			queryClient.invalidateQueries({ queryKey: tenantPreferencesKeys.allPreferences() });
		},
	});
};

// Delete room preferences mutation
export const useDeleteRoomPreferences = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteRoomPreferences,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: tenantPreferencesKeys.room() });
			queryClient.invalidateQueries({ queryKey: tenantPreferencesKeys.allPreferences() });
		},
	});
};

// Create or update roommate preferences mutation
export const useCreateOrUpdateRoommatePreferences = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateRoommatePreferencesRequest) => createOrUpdateRoommatePreferences(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: tenantPreferencesKeys.roommate() });
			queryClient.invalidateQueries({ queryKey: tenantPreferencesKeys.allPreferences() });
		},
	});
};

// Update roommate preferences mutation
export const useUpdateRoommatePreferences = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdateRoommatePreferencesRequest) => updateRoommatePreferences(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: tenantPreferencesKeys.roommate() });
			queryClient.invalidateQueries({ queryKey: tenantPreferencesKeys.allPreferences() });
		},
	});
};

// Delete roommate preferences mutation
export const useDeleteRoommatePreferences = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteRoommatePreferences,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: tenantPreferencesKeys.roommate() });
			queryClient.invalidateQueries({ queryKey: tenantPreferencesKeys.allPreferences() });
		},
	});
};
