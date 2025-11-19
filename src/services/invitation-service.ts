import { apiClient, extractErrorMessage } from '@/lib/api-client';

// Types
export interface RoomInvitation {
	id: string;
	landlordId: string;
	tenantId: string;
	roomId: string;
	status: 'pending' | 'accepted' | 'declined' | 'withdrawn';
	availableFrom?: string;
	availableUntil?: string;
	invitationMessage?: string;
	proposedRent?: number;
	createdAt: string;
	updatedAt: string;
	landlord?: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		phone?: string;
		avatarUrl?: string;
	};
	tenant?: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		phone?: string;
		avatarUrl?: string;
	};
	room?: {
		id: string;
		name: string;
		roomType: string;
		building?: {
			id: string;
			name: string;
			address: string;
		};
	};
}

export interface CreateRoomInvitationRequest {
	roomInstanceId?: string;
	tenantId: string;
	availableFrom?: string;
	availableUntil?: string;
	invitationMessage?: string;
	proposedRent?: number;
}

export interface RespondInvitationRequest {
	status: 'accepted' | 'declined';
	message?: string;
}

export interface InvitationListResponse {
	data: RoomInvitation[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

// Create room invitation
export const createRoomInvitation = async (
	data: CreateRoomInvitationRequest
): Promise<{ data: RoomInvitation }> => {
	try {
		const apiPayload = {
			roomId: data.roomInstanceId,
			tenantId: data.tenantId,
			...(data.availableFrom ? { availableFrom: data.availableFrom } : {}),
			...(data.availableUntil ? { availableUntil: data.availableUntil } : {}),
			...(data.invitationMessage ? { invitationMessage: data.invitationMessage } : {}),
			...(data.proposedRent ? { proposedRent: data.proposedRent } : {}),
		};

		const response = await apiClient.post<{ data: RoomInvitation }>(
			'/api/room-invitations',
			apiPayload
		);
		return response.data;
	} catch (error) {
		console.error('Error creating room invitation:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tạo lời mời'));
	}
};

// Get sent invitations
export const getSentInvitations = async (params?: {
	page?: number;
	limit?: number;
	status?: string;
	buildingId?: string;
	roomId?: string;
}): Promise<InvitationListResponse> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', String(params.page));
		if (params?.limit) searchParams.append('limit', String(params.limit));
		if (params?.status) searchParams.append('status', params.status);
		if (params?.buildingId) searchParams.append('buildingId', params.buildingId);
		if (params?.roomId) searchParams.append('roomId', params.roomId);

		const endpoint = `/api/room-invitations/sent${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
		const response = await apiClient.get<InvitationListResponse>(endpoint);

		return response.data;
	} catch (error) {
		console.error('Error getting sent invitations:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải danh sách lời mời đã gửi'));
	}
};

// Get received invitations
export const getReceivedInvitations = async (params?: {
	page?: number;
	limit?: number;
	status?: string;
}): Promise<InvitationListResponse> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', String(params.page));
		if (params?.limit) searchParams.append('limit', String(params.limit));
		if (params?.status) searchParams.append('status', params.status);

		const endpoint = `/api/room-invitations/received${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
		const response = await apiClient.get<InvitationListResponse>(endpoint);

		return response.data;
	} catch (error) {
		console.error('Error getting received invitations:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải danh sách lời mời nhận được'));
	}
};

// Get invitation by ID
export const getInvitationById = async (id: string): Promise<{ data: RoomInvitation }> => {
	try {
		const response = await apiClient.get<{ data: RoomInvitation }>(
			`/api/room-invitations/${id}`
		);
		return response.data;
	} catch (error) {
		console.error('Error getting invitation by ID:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải thông tin lời mời'));
	}
};

// Respond to invitation
export const respondToInvitation = async (
	id: string,
	data: RespondInvitationRequest
): Promise<{ message: string }> => {
	try {
		const response = await apiClient.patch<{ message: string }>(
			`/api/room-invitations/${id}/respond`,
			data
		);
		return response.data;
	} catch (error) {
		console.error('Error responding to invitation:', error);
		throw new Error(extractErrorMessage(error, 'Không thể phản hồi lời mời'));
	}
};

// Withdraw invitation
export const withdrawInvitation = async (id: string): Promise<{ message: string }> => {
	try {
		const response = await apiClient.patch<{ message: string }>(
			`/api/room-invitations/${id}/withdraw`
		);
		return response.data;
	} catch (error) {
		console.error('Error withdrawing invitation:', error);
		throw new Error(extractErrorMessage(error, 'Không thể rút lại lời mời'));
	}
};

// Get my invitations
export const getMyInvitations = async (params?: {
	page?: number;
	limit?: number;
	status?: string;
	buildingId?: string;
	roomId?: string;
}): Promise<InvitationListResponse> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', String(params.page));
		if (params?.limit) searchParams.append('limit', String(params.limit));
		if (params?.status) searchParams.append('status', params.status);
		if (params?.buildingId) searchParams.append('buildingId', params.buildingId);
		if (params?.roomId) searchParams.append('roomId', params.roomId);

		const endpoint = `/api/room-invitations/me${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
		const response = await apiClient.get<InvitationListResponse>(endpoint);

		return response.data;
	} catch (error) {
		console.error('Error getting my invitations:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải danh sách lời mời của tôi'));
	}
};

// Confirm invitation
export const confirmInvitation = async (
	id: string
): Promise<{ data: RoomInvitation; rental?: { id: string } }> => {
	try {
		const response = await apiClient.post<{
			data: RoomInvitation;
			rental?: { id: string };
		}>(`/api/room-invitations/${id}/confirm`);
		return response.data;
	} catch (error) {
		console.error('Error confirming invitation:', error);
		throw new Error(extractErrorMessage(error, 'Không thể xác nhận lời mời'));
	}
};
