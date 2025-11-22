import { apiClient, extractErrorMessage } from '@/lib/api-client';

// Types
export interface Rental {
	id: string;
	roomInstanceId: string;
	tenantId: string;
	contractStartDate: string;
	contractEndDate?: string;
	monthlyRent: string;
	depositPaid: string;
	status: 'active' | 'pending' | 'terminated' | 'expired';
	notes?: string;
	createdAt: string;
	updatedAt: string;
	roomInstance?: {
		id: string;
		roomNumber: string;
		room?: {
			id: string;
			slug?: string;
			name: string;
			roomType: string;
			areaSqm: string | { s: number; e: number; d: number[] };
			overallRating?: { s: number; e: number; d: number[] };
			building?: {
				id: string;
				name: string;
				address?: string;
			};
		};
	};
	tenant?: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		phone?: string;
		avatarUrl?: string;
	};
	owner?: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		phone?: string;
	};
	invitation?: {
		id: string;
		moveInDate: string;
		message: string;
	};
	members?: Array<{
		tenantId: string;
		firstName: string;
		lastName: string;
		email: string;
		rentalId: string;
	}>;
}

export interface CreateRentalRequest {
	roomId: string;
	tenantId: string;
	startDate: string;
	endDate?: string;
	monthlyRent: number;
	depositAmount: number;
	notes?: string;
}

export interface UpdateRentalRequest {
	startDate?: string;
	endDate?: string;
	monthlyRent?: number;
	depositAmount?: number;
	notes?: string;
	status?: 'active' | 'pending' | 'terminated' | 'expired';
}

export interface TerminateRentalRequest {
	terminationDate: string;
	reason?: string;
}

export interface RenewRentalRequest {
	newEndDate: string;
	newMonthlyRent?: number;
}

export interface PaginatedRentalResponse {
	data: Rental[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

// Create rental (Landlord only)
export const createRental = async (data: CreateRentalRequest): Promise<{ data: Rental }> => {
	try {
		const response = await apiClient.post<{ data: Rental }>('/api/rentals', data);
		return response.data;
	} catch (error) {
		console.error('Error creating rental:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tạo hợp đồng thuê'));
	}
};

// Get landlord rentals
export const getLandlordRentals = async (params?: {
	page?: number;
	limit?: number;
	status?: string;
}): Promise<PaginatedRentalResponse> => {
	try {
		const queryParams = new URLSearchParams();
		if (params?.page) queryParams.append('page', String(params.page));
		if (params?.limit) queryParams.append('limit', String(params.limit));
		if (params?.status) queryParams.append('status', params.status);

		const endpoint = `/api/rentals/owner${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
		const response = await apiClient.get<PaginatedRentalResponse>(endpoint);

		return response.data;
	} catch (error) {
		console.error('Error fetching landlord rentals:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải hợp đồng thuê của chủ nhà'));
	}
};

// Get tenant rentals
export const getTenantRentals = async (params?: {
	page?: number;
	limit?: number;
	status?: string;
}): Promise<PaginatedRentalResponse> => {
	try {
		const queryParams = new URLSearchParams();
		if (params?.page) queryParams.append('page', String(params.page));
		if (params?.limit) queryParams.append('limit', String(params.limit));
		if (params?.status) queryParams.append('status', params.status);

		const endpoint = `/api/rentals/my-rentals${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
		const response = await apiClient.get<PaginatedRentalResponse>(endpoint);

		return response.data;
	} catch (error) {
		console.error('Error fetching tenant rentals:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải hợp đồng thuê của người thuê'));
	}
};

// Get rental details by ID
export const getRentalById = async (id: string): Promise<Rental> => {
	try {
		const response = await apiClient.get(`/api/rentals/${id}`);
		return response.data;
	} catch (error) {
		console.error('Error fetching rental details:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải chi tiết hợp đồng thuê'));
	}
};

// Update rental (Landlord only)
export const updateRental = async (
	id: string,
	data: UpdateRentalRequest
): Promise<{ data: Rental }> => {
	try {
		const response = await apiClient.put<{ data: Rental }>(`/api/rentals/${id}`, data);
		return response.data;
	} catch (error) {
		console.error('Error updating rental:', error);
		throw new Error(extractErrorMessage(error, 'Không thể cập nhật hợp đồng thuê'));
	}
};

// Terminate rental
export const terminateRental = async (
	id: string,
	data: TerminateRentalRequest
): Promise<{ data: Rental }> => {
	try {
		const response = await apiClient.put<{ data: Rental }>(
			`/api/rentals/${id}/terminate`,
			data
		);
		return response.data;
	} catch (error) {
		console.error('Error terminating rental:', error);
		throw new Error(extractErrorMessage(error, 'Không thể chấm dứt hợp đồng thuê'));
	}
};

// Renew rental
export const renewRental = async (
	id: string,
	data: RenewRentalRequest
): Promise<{ data: Rental }> => {
	try {
		const response = await apiClient.put<{ data: Rental }>(`/api/rentals/${id}/renew`, data);
		return response.data;
	} catch (error) {
		console.error('Error renewing rental:', error);
		throw new Error(extractErrorMessage(error, 'Không thể gia hạn hợp đồng thuê'));
	}
};

// Delete rental (remove member from rental)
export const deleteRental = async (id: string): Promise<{ message: string }> => {
	try {
		const response = await apiClient.delete<{ message: string }>(`/api/rentals/${id}`);
		return response.data;
	} catch (error) {
		console.error('Error deleting rental:', error);
		throw new Error(extractErrorMessage(error, 'Không thể xóa thành viên khỏi hợp đồng'));
	}
};
