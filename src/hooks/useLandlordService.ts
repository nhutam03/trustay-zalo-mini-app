import { useQuery } from '@tanstack/react-query';
import {
	listMyTenants,
	listMyRoomsWithOccupants,
	getDashboardOverview,
	getDashboardOperations,
	getDashboardFinance,
} from '@/services/landlord-service';

// Query keys
export const landlordKeys = {
	all: ['landlord'] as const,
	tenants: (params?: Record<string, any>) => [...landlordKeys.all, 'tenants', params] as const,
	roomsWithOccupants: (params?: Record<string, any>) =>
		[...landlordKeys.all, 'rooms-occupants', params] as const,
	dashboard: () => [...landlordKeys.all, 'dashboard'] as const,
	dashboardOverview: (params?: Record<string, any>) =>
		[...landlordKeys.dashboard(), 'overview', params] as const,
	dashboardOperations: (params?: Record<string, any>) =>
		[...landlordKeys.dashboard(), 'operations', params] as const,
	dashboardFinance: (params?: Record<string, any>) =>
		[...landlordKeys.dashboard(), 'finance', params] as const,
};

// List my tenants
export const useMyTenants = (params?: {
	page?: number;
	limit?: number;
	buildingId?: string;
	roomId?: string;
	status?: string;
	search?: string;
}) => {
	return useQuery({
		queryKey: landlordKeys.tenants(params),
		queryFn: () => listMyTenants(params),
		staleTime: 60 * 1000, // 1 minute
	});
};

// List my rooms with occupants
export const useMyRoomsWithOccupants = (params?: {
	page?: number;
	limit?: number;
	buildingId?: string;
	status?: string;
	occupancyStatus?: 'occupied' | 'vacant' | 'all';
}) => {
	return useQuery({
		queryKey: landlordKeys.roomsWithOccupants(params),
		queryFn: () => listMyRoomsWithOccupants(params),
		staleTime: 60 * 1000,
	});
};

// Dashboard overview
export const useDashboardOverview = (params?: { buildingId?: string }) => {
	return useQuery({
		queryKey: landlordKeys.dashboardOverview(params),
		queryFn: () => getDashboardOverview(params),
		staleTime: 2 * 60 * 1000, // 2 minutes
		refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
	});
};

// Dashboard operations
export const useDashboardOperations = (params?: { buildingId?: string }) => {
	return useQuery({
		queryKey: landlordKeys.dashboardOperations(params),
		queryFn: () => getDashboardOperations(params),
		staleTime: 60 * 1000, // 1 minute
		refetchInterval: 3 * 60 * 1000, // Auto-refetch every 3 minutes
	});
};

// Dashboard finance
export const useDashboardFinance = (params?: { buildingId?: string; referenceMonth?: string }) => {
	return useQuery({
		queryKey: landlordKeys.dashboardFinance(params),
		queryFn: () => getDashboardFinance(params),
		staleTime: 2 * 60 * 1000, // 2 minutes
		refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
	});
};
