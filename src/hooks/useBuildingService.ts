import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	getBuildings,
	getMyBuildings,
	getBuildingById,
	createBuilding,
	updateBuilding,
	deleteBuilding,
} from '@/services/building-service';
import type {
	CreateBuildingRequest,
	UpdateBuildingRequest,
} from '@/services/building-service';

// Query keys
export const buildingKeys = {
	all: ['buildings'] as const,
	lists: () => [...buildingKeys.all, 'list'] as const,
	list: (filters: Record<string, unknown>) => [...buildingKeys.lists(), filters] as const,
	myBuildings: (filters: Record<string, unknown>) => [...buildingKeys.all, 'my', filters] as const,
	details: () => [...buildingKeys.all, 'detail'] as const,
	detail: (id: string) => [...buildingKeys.details(), id] as const,
};

// Get buildings list
export const useBuildings = (params?: {
	page?: number;
	limit?: number;
	search?: string;
	isActive?: boolean;
}) => {
	return useQuery({
		queryKey: buildingKeys.list(params || {}),
		queryFn: () => getBuildings(params),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};

// Get my buildings (landlord's buildings)
export const useMyBuildings = (params?: {
	page?: number;
	limit?: number;
}) => {
	return useQuery({
		queryKey: buildingKeys.myBuildings(params || {}),
		queryFn: () => getMyBuildings(params),
		staleTime: 5 * 60 * 1000,
	});
};

// Get building by ID
export const useBuilding = (id: string, enabled = true) => {
	return useQuery({
		queryKey: buildingKeys.detail(id),
		queryFn: () => getBuildingById(id),
		enabled: enabled && !!id,
		staleTime: 5 * 60 * 1000,
	});
};

// Create building mutation
export const useCreateBuilding = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateBuildingRequest) => createBuilding(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: buildingKeys.lists() });
			queryClient.invalidateQueries({ queryKey: buildingKeys.all });
		},
	});
};

// Update building mutation
export const useUpdateBuilding = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateBuildingRequest }) =>
			updateBuilding(id, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: buildingKeys.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: buildingKeys.lists() });
		},
	});
};

// Delete building mutation
export const useDeleteBuilding = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteBuilding(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: buildingKeys.lists() });
		},
	});
};
