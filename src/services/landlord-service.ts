import { apiClient, extractErrorMessage } from '@/lib/api-client';

// Types
export interface TenantInfo {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	avatarUrl?: string;
	roomNumber?: string;
	buildingName?: string;
	rentalStatus?: string;
	moveInDate?: string;
}

export interface TenantListResponse {
	data: TenantInfo[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export interface RoomWithOccupants {
	id: string;
	roomNumber: string;
	roomType: string;
	maxOccupancy: number;
	currentOccupancy: number;
	status: string;
	buildingName: string;
	occupants: TenantInfo[];
}

export interface RoomWithOccupantsListResponse {
	data: RoomWithOccupants[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export interface DashboardOverviewResponseDto {
	totalBuildings: number;
	totalRooms: number;
	occupiedRooms: number;
	vacantRooms: number;
	totalTenants: number;
	occupancyRate: number;
}

export interface DashboardOperationsResponseDto {
	pendingBookings: number;
	activeContracts: number;
	expiringSoonContracts: number;
	maintenanceRequests: number;
}

export interface DashboardFinanceResponseDto {
	monthlyRevenue: number;
	expectedRevenue: number;
	collectedRevenue: number;
	pendingPayments: number;
	overduePayments: number;
}

// List my tenants (Landlord only)
export const listMyTenants = async (params?: {
	page?: number;
	limit?: number;
	buildingId?: string;
	roomId?: string;
	status?: string;
	search?: string;
}): Promise<TenantListResponse> => {
	try {
		const queryParams = new URLSearchParams();
		if (params?.page) queryParams.append('page', String(params.page));
		if (params?.limit) queryParams.append('limit', String(params.limit));
		if (params?.buildingId) queryParams.append('buildingId', params.buildingId);
		if (params?.roomId) queryParams.append('roomId', params.roomId);
		if (params?.search) queryParams.append('search', params.search);

		const endpoint = `/api/landlord/tenants${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
		const response = await apiClient.get<TenantListResponse>(endpoint);

		return response.data;
	} catch (error) {
		console.error('Error listing my tenants:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải danh sách người thuê'));
	}
};

// List my rooms with occupants (Landlord only)
export const listMyRoomsWithOccupants = async (params?: {
	page?: number;
	limit?: number;
	buildingId?: string;
	status?: string;
	occupancyStatus?: 'occupied' | 'vacant' | 'all';
}): Promise<RoomWithOccupantsListResponse> => {
	try {
		const queryParams = new URLSearchParams();
		if (params?.page) queryParams.append('page', String(params.page));
		if (params?.limit) queryParams.append('limit', String(params.limit));
		if (params?.buildingId) queryParams.append('buildingId', params.buildingId);
		if (params?.occupancyStatus) queryParams.append('occupancyStatus', params.occupancyStatus);

		const endpoint = `/api/landlord/rooms${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
		const response = await apiClient.get<RoomWithOccupantsListResponse>(endpoint);

		return response.data;
	} catch (error) {
		console.error('Error listing my rooms with occupants:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải danh sách phòng và người thuê'));
	}
};

// Dashboard Overview (Landlord only)
export const getDashboardOverview = async (params?: {
	buildingId?: string;
}): Promise<DashboardOverviewResponseDto> => {
	try {
		const queryParams = new URLSearchParams();
		if (params?.buildingId) queryParams.append('buildingId', params.buildingId);

		const endpoint = `/api/dashboard/overview${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
		const response = await apiClient.get<DashboardOverviewResponseDto>(endpoint);

		return response.data;
	} catch (error) {
		console.error('Error getting dashboard overview:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải dữ liệu tổng quan'));
	}
};

// Dashboard Operations (Landlord only)
export const getDashboardOperations = async (params?: {
	buildingId?: string;
}): Promise<DashboardOperationsResponseDto> => {
	try {
		const queryParams = new URLSearchParams();
		if (params?.buildingId) queryParams.append('buildingId', params.buildingId);

		const endpoint = `/api/dashboard/operations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
		const response = await apiClient.get<DashboardOperationsResponseDto>(endpoint);

		return response.data;
	} catch (error) {
		console.error('Error getting dashboard operations:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải dữ liệu hoạt động'));
	}
};

// Dashboard Finance (Landlord only)
export const getDashboardFinance = async (params?: {
	buildingId?: string;
	referenceMonth?: string; // Format: YYYY-MM
}): Promise<DashboardFinanceResponseDto> => {
	try {
		const queryParams = new URLSearchParams();
		if (params?.buildingId) queryParams.append('buildingId', params.buildingId);
		if (params?.referenceMonth) queryParams.append('referenceMonth', params.referenceMonth);

		const endpoint = `/api/dashboard/finance${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
		const response = await apiClient.get<DashboardFinanceResponseDto>(endpoint);

		return response.data;
	} catch (error) {
		console.error('Error getting dashboard finance:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải dữ liệu tài chính'));
	}
};
