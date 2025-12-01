import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	getMyRooms,
	createRoom,
	getRoomById,
	updateRoom,
	getRoomsByBuilding,
	getRoomInstancesByStatus,
	updateRoomInstanceStatus,
	bulkUpdateRoomInstancesStatus,
	deleteRoom,
	searchRoomInstances,
} from '@/services/room-management-service';
import type {
	CreateRoomRequest,
	UpdateRoomRequest,
	UpdateRoomInstanceStatusRequest,
	BulkUpdateRoomInstancesRequest,
} from '@/services/room-management-service';

// Query keys
export const roomManagementKeys = {
	all: ['room-management'] as const,
	myRooms: (filters: Record<string, unknown>) => [...roomManagementKeys.all, 'my', filters] as const,
	details: () => [...roomManagementKeys.all, 'detail'] as const,
	detail: (id: string) => [...roomManagementKeys.details(), id] as const,
	byBuilding: (buildingId: string, filters: Record<string, unknown>) => 
		[...roomManagementKeys.all, 'building', buildingId, filters] as const,
	instances: (roomId: string, status?: string) => 
		[...roomManagementKeys.all, 'instances', roomId, status] as const,
	search: (params: Record<string, unknown>) => 
		[...roomManagementKeys.all, 'search', params] as const,
};

// Get my rooms (landlord's rooms)
export const useMyRooms = (params?: {
	page?: number;
	limit?: number;
}) => {
	return useQuery({
		queryKey: roomManagementKeys.myRooms(params || {}),
		queryFn: () => getMyRooms(params),
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
};

// Get room by ID
export const useRoomManagement = (id: string, enabled = true) => {
	return useQuery({
		queryKey: roomManagementKeys.detail(id),
		queryFn: () => getRoomById(id),
		enabled: enabled && !!id,
		staleTime: 2 * 60 * 1000,
	});
};

// Get rooms by building
export const useRoomsByBuilding = (
	buildingId: string,
	params?: {
		page?: number;
		limit?: number;
	},
	enabled = true,
) => {
	return useQuery({
		queryKey: roomManagementKeys.byBuilding(buildingId, params || {}),
		queryFn: () => getRoomsByBuilding(buildingId, params),
		enabled: enabled && !!buildingId,
		staleTime: 2 * 60 * 1000,
	});
};

// Get room instances by status
export const useRoomInstancesByStatus = (
	roomId: string,
	status?: string,
	enabled = true,
) => {
	return useQuery({
		queryKey: roomManagementKeys.instances(roomId, status),
		queryFn: () => getRoomInstancesByStatus(roomId, status),
		enabled: enabled && !!roomId,
		staleTime: 1 * 60 * 1000,
	});
};

// Search room instances
export const useSearchRoomInstances = (params: {
	buildingId?: string;
	search?: string;
	status?: 'available' | 'occupied' | 'maintenance' | 'reserved' | 'unavailable';
}, enabled = true) => {
	return useQuery({
		queryKey: roomManagementKeys.search(params),
		queryFn: () => searchRoomInstances(params),
		enabled,
		staleTime: 1 * 60 * 1000,
	});
};

// Create room mutation
export const useCreateRoom = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ buildingId, data }: { buildingId: string; data: CreateRoomRequest }) =>
			createRoom(buildingId, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: roomManagementKeys.myRooms({}) });
			queryClient.invalidateQueries({ 
				queryKey: roomManagementKeys.byBuilding(variables.buildingId, {}) 
			});
		},
	});
};

// Update room mutation
export const useUpdateRoom = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateRoomRequest }) =>
			updateRoom(id, data),
		onSuccess: (result, variables) => {
			queryClient.invalidateQueries({ queryKey: roomManagementKeys.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: roomManagementKeys.myRooms({}) });
			if (result.buildingId) {
				queryClient.invalidateQueries({ 
					queryKey: roomManagementKeys.byBuilding(result.buildingId, {}) 
				});
			}
		},
	});
};

// Update room instance status mutation
export const useUpdateRoomInstanceStatus = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ instanceId, data }: { instanceId: string; data: UpdateRoomInstanceStatusRequest }) =>
			updateRoomInstanceStatus(instanceId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: roomManagementKeys.all });
		},
	});
};

// Bulk update room instances status mutation
export const useBulkUpdateRoomInstancesStatus = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ roomId, data }: { roomId: string; data: BulkUpdateRoomInstancesRequest }) =>
			bulkUpdateRoomInstancesStatus(roomId, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: roomManagementKeys.instances(variables.roomId) });
			queryClient.invalidateQueries({ queryKey: roomManagementKeys.all });
		},
	});
};

// Delete room mutation
export const useDeleteRoom = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteRoom(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: roomManagementKeys.myRooms({}) });
			queryClient.invalidateQueries({ queryKey: roomManagementKeys.all });
		},
	});
};
