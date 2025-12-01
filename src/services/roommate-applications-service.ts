import { apiClient, extractErrorMessage } from '@/lib/api-client';

// ========================
// Types for Roommate Applications
// ========================

export interface RoommateApplication {
	id: string;
	roommateSeekingPostId: string;
	applicantId: string;
	fullName: string;
	phoneNumber: string;
	email: string;
	occupation: string;
	monthlyIncome: number;
	applicationMessage: string;
	moveInDate: string;
	intendedStayMonths: number;
	isUrgent: boolean;
	status: 'pending' | 'accepted' | 'rejected' | 'awaiting_confirmation' | 'cancelled' | 'expired';
	tenantResponse?: string;
	landlordResponse?: string;
	tenantRespondedAt?: string;
	landlordRespondedAt?: string;
	confirmedAt?: string;
	createdAt: string;
	updatedAt: string;
	applicant?: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		avatarUrl?: string;
	};
	roommateSeekingPost?: {
		id: string;
		title: string;
		slug?: string;
		tenantId?: string;
		monthlyRent: number;
		depositAmount?: number;
		roomInstanceId?: string;
		roomInstance?: {
			id: string;
			roomNumber: string;
			room: {
				name: string;
				building: {
					name: string;
					ownerId: string;
				};
			};
		};
		tenant?: {
			id: string;
			firstName: string;
			lastName: string;
			avatarUrl?: string | null;
		};
	};
	rental?: {
		id: string;
		roomInstanceId: string;
		tenantId: string;
		ownerId: string;
		contractStartDate: string;
		contractEndDate: string;
		monthlyRent: number;
		depositPaid: number;
		status: string;
	};
}

export interface CreateRoommateApplicationRequest {
	roommateSeekingPostId: string;
	fullName: string;
	phone: string;
	email: string;
	occupation: string;
	monthlyIncome: number;
	applicationMessage: string;
	moveInDate: string;
	intendedStayMonths: number;
	isUrgent?: boolean;
}

export interface UpdateRoommateApplicationRequest {
	fullName?: string;
	phone?: string;
	email?: string;
	occupation?: string;
	monthlyIncome?: number;
	applicationMessage?: string;
	moveInDate?: string;
	intendedStayMonths?: number;
	isUrgent?: boolean;
}

export interface RespondToApplicationRequest {
	status: 'accepted' | 'rejected';
	response: string;
}

export interface RoommateApplicationListResponse {
	data: RoommateApplication[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
		itemCount: number;
	};
	counts: {
		pending: number;
		approvedByTenant: number;
		rejectedByTenant: number;
		approvedByLandlord: number;
		rejectedByLandlord: number;
		cancelled: number;
		expired: number;
		total: number;
	};
}

export interface ApplicationStatistics {
	total: number;
	pending: number;
	approvedByTenant: number;
	rejectedByTenant: number;
	approvedByLandlord: number;
	rejectedByLandlord: number;
	cancelled: number;
	expired: number;
	urgent: number;
	dailyStats: Array<{
		date: string;
		count: number;
	}>;
	statusBreakdown: Array<{
		status: string;
		count: number;
		percentage: number;
	}>;
}

export interface AddRoommateDirectlyRequest {
	email?: string;
	phone?: string;
	userId?: string;
	moveInDate?: string;
	intendedStayMonths?: number;
}

export interface GenerateInviteLinkResponse {
	inviteLink: string;
	token: string;
	rentalId: string;
	roommateSeekingPostId?: string;
	expiresAt: string;
}

export interface AcceptInviteRequest {
	token: string;
	moveInDate: string;
	intendedStayMonths?: number;
}

// ========================
// Roommate Applications Service Functions
// ========================

/**
 * Create roommate application
 */
export const createRoommateApplication = async (
	data: CreateRoommateApplicationRequest,
): Promise<RoommateApplication> => {
	try {
		const response = await apiClient.post<RoommateApplication>(
			'/api/roommate-applications',
			data,
		);
		return response.data;
	} catch (error) {
		console.error('Error creating roommate application:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tạo đơn ứng tuyển'));
	}
};

/**
 * Get application by ID
 */
export const getRoommateApplicationById = async (id: string): Promise<RoommateApplication> => {
	try {
		const response = await apiClient.get<RoommateApplication>(
			`/api/roommate-applications/${id}`,
		);
		return response.data;
	} catch (error) {
		console.error('Error getting roommate application:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải thông tin đơn ứng tuyển'));
	}
};

/**
 * Get my applications
 */
export const getMyRoommateApplications = async (params?: {
	page?: number;
	limit?: number;
	status?: 'pending' | 'accepted' | 'rejected' | 'awaiting_confirmation' | 'cancelled' | 'expired';
	search?: string;
	roommateSeekingPostId?: string;
	isUrgent?: boolean;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}): Promise<RoommateApplicationListResponse> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());
		if (params?.status) searchParams.append('status', params.status);
		if (params?.search) searchParams.append('search', params.search);
		if (params?.roommateSeekingPostId)
			searchParams.append('roommateSeekingPostId', params.roommateSeekingPostId);
		if (params?.isUrgent !== undefined) searchParams.append('isUrgent', params.isUrgent.toString());
		if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
		if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

		const endpoint = `/api/roommate-applications/my-applications${
			searchParams.toString() ? `?${searchParams.toString()}` : ''
		}`;

		const response = await apiClient.get<RoommateApplicationListResponse>(endpoint);
		return response.data;
	} catch (error) {
		console.error('Error getting my roommate applications:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải danh sách đơn ứng tuyển của bạn'));
	}
};

/**
 * Get applications for my posts
 */
export const getApplicationsForMyPosts = async (params?: {
	page?: number;
	limit?: number;
	status?: 'pending' | 'accepted' | 'rejected' | 'awaiting_confirmation' | 'cancelled' | 'expired';
	search?: string;
	roommateSeekingPostId?: string;
	isUrgent?: boolean;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}): Promise<RoommateApplicationListResponse> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());
		if (params?.status) searchParams.append('status', params.status);
		if (params?.search) searchParams.append('search', params.search);
		if (params?.roommateSeekingPostId)
			searchParams.append('roommateSeekingPostId', params.roommateSeekingPostId);
		if (params?.isUrgent !== undefined) searchParams.append('isUrgent', params.isUrgent.toString());
		if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
		if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

		const endpoint = `/api/roommate-applications/for-my-posts${
			searchParams.toString() ? `?${searchParams.toString()}` : ''
		}`;

		const response = await apiClient.get<RoommateApplicationListResponse>(endpoint);
		return response.data;
	} catch (error) {
		console.error('Error getting applications for my posts:', error);
		throw new Error(
			extractErrorMessage(error, 'Không thể tải danh sách đơn ứng tuyển cho bài đăng của bạn'),
		);
	}
};

/**
 * Update application
 */
export const updateRoommateApplication = async (
	id: string,
	data: UpdateRoommateApplicationRequest,
): Promise<RoommateApplication> => {
	try {
		const response = await apiClient.patch<RoommateApplication>(
			`/api/roommate-applications/${id}`,
			data,
		);
		return response.data;
	} catch (error) {
		console.error('Error updating roommate application:', error);
		throw new Error(extractErrorMessage(error, 'Không thể cập nhật đơn ứng tuyển'));
	}
};

/**
 * Respond to application (Tenant)
 */
export const respondToRoommateApplication = async (
	id: string,
	data: RespondToApplicationRequest,
): Promise<RoommateApplication> => {
	try {
		const response = await apiClient.post<RoommateApplication>(
			`/api/roommate-applications/${id}/respond`,
			data,
		);
		return response.data;
	} catch (error) {
		console.error('Error responding to roommate application:', error);
		throw new Error(extractErrorMessage(error, 'Không thể phản hồi đơn ứng tuyển'));
	}
};

/**
 * Confirm application
 */
export const confirmRoommateApplication = async (id: string): Promise<RoommateApplication> => {
	try {
		const response = await apiClient.patch<RoommateApplication>(
			`/api/roommate-applications/${id}/confirm`,
			{},
		);
		return response.data;
	} catch (error) {
		console.error('Error confirming roommate application:', error);
		throw new Error(extractErrorMessage(error, 'Không thể xác nhận đơn ứng tuyển'));
	}
};

/**
 * Cancel application
 */
export const cancelRoommateApplication = async (id: string): Promise<RoommateApplication> => {
	try {
		const response = await apiClient.patch<RoommateApplication>(
			`/api/roommate-applications/${id}/cancel`,
			{},
		);
		return response.data;
	} catch (error) {
		console.error('Error cancelling roommate application:', error);
		throw new Error(extractErrorMessage(error, 'Không thể hủy đơn ứng tuyển'));
	}
};

/**
 * Bulk respond to applications
 */
export const bulkRespondToApplications = async (data: {
	applicationIds: string[];
	status: 'accepted' | 'rejected';
	response: string;
}): Promise<{
	successCount: number;
	failureCount: number;
	processedApplications: string[];
	errors: Array<{
		applicationId: string;
		error: string;
	}>;
}> => {
	try {
		const response = await apiClient.post<{
			successCount: number;
			failureCount: number;
			processedApplications: string[];
			errors: Array<{
				applicationId: string;
				error: string;
			}>;
		}>('/api/roommate-applications/bulk-respond', data);
		return response.data;
	} catch (error) {
		console.error('Error bulk responding to applications:', error);
		throw new Error(extractErrorMessage(error, 'Không thể phản hồi hàng loạt đơn ứng tuyển'));
	}
};

/**
 * Get my application statistics
 */
export const getMyApplicationStatistics = async (): Promise<ApplicationStatistics> => {
	try {
		const response = await apiClient.get<ApplicationStatistics>(
			'/api/roommate-applications/statistics/my-applications',
		);
		return response.data;
	} catch (error) {
		console.error('Error getting my application statistics:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải thống kê đơn ứng tuyển của bạn'));
	}
};

/**
 * Get applications statistics for my posts
 */
export const getApplicationStatisticsForMyPosts = async (): Promise<ApplicationStatistics> => {
	try {
		const response = await apiClient.get<ApplicationStatistics>(
			'/api/roommate-applications/statistics/for-my-posts',
		);
		return response.data;
	} catch (error) {
		console.error('Error getting application statistics for my posts:', error);
		throw new Error(
			extractErrorMessage(error, 'Không thể tải thống kê đơn ứng tuyển cho bài đăng của bạn'),
		);
	}
};

/**
 * Landlord: Get pending applications that need approval (Platform Rooms only)
 */
export const getLandlordPendingApplications = async (params?: {
	page?: number;
	limit?: number;
	status?: 'accepted' | 'rejected' | 'awaiting_confirmation';
	search?: string;
	roommateSeekingPostId?: string;
	isUrgent?: boolean;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}): Promise<RoommateApplicationListResponse> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());
		if (params?.status) searchParams.append('status', params.status);
		if (params?.search) searchParams.append('search', params.search);
		if (params?.roommateSeekingPostId)
			searchParams.append('roommateSeekingPostId', params.roommateSeekingPostId);
		if (params?.isUrgent !== undefined) searchParams.append('isUrgent', params.isUrgent.toString());
		if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
		if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

		const endpoint = `/api/roommate-applications/landlord/pending${
			searchParams.toString() ? `?${searchParams.toString()}` : ''
		}`;

		const response = await apiClient.get<RoommateApplicationListResponse>(endpoint);
		return response.data;
	} catch (error) {
		console.error('Error getting landlord pending applications:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải danh sách đơn ứng tuyển cần duyệt'));
	}
};

/**
 * Landlord: Approve application (Platform Rooms only)
 */
export const landlordApproveApplication = async (
	id: string,
	response: string,
): Promise<RoommateApplication> => {
	try {
		const result = await apiClient.post<RoommateApplication>(
			`/api/roommate-applications/${id}/landlord-approve`,
			{
				status: 'accepted',
				response,
			},
		);
		return result.data;
	} catch (error) {
		console.error('Error landlord approving application:', error);
		throw new Error(extractErrorMessage(error, 'Không thể phê duyệt đơn ứng tuyển'));
	}
};

/**
 * Landlord: Reject application (Platform Rooms only)
 */
export const landlordRejectApplication = async (
	id: string,
	response: string,
): Promise<RoommateApplication> => {
	try {
		const result = await apiClient.post<RoommateApplication>(
			`/api/roommate-applications/${id}/landlord-reject`,
			{
				status: 'rejected',
				response,
			},
		);
		return result.data;
	} catch (error) {
		console.error('Error landlord rejecting application:', error);
		throw new Error(extractErrorMessage(error, 'Không thể từ chối đơn ứng tuyển'));
	}
};

/**
 * Add Roommate Directly (Flow 1)
 * Thêm người vào phòng trực tiếp bằng email/phone → Tạo rental ngay
 */
export const addRoommateDirectly = async (
	postId: string,
	data: AddRoommateDirectlyRequest,
): Promise<void> => {
	try {
		await apiClient.post<void>('/api/roommate-applications/add-roommate', data);
	} catch (error) {
		console.error('Error adding roommate directly:', error);
		throw new Error(
			extractErrorMessage(error, 'Không thể thêm người ở ghép. Vui lòng kiểm tra lại thông tin.'),
		);
	}
};

/**
 * Generate Invite Link (Flow 2)
 * Tenant tạo invite link để chia sẻ với người khác
 */
export const generateInviteLink = async (): Promise<GenerateInviteLinkResponse> => {
	try {
		const response = await apiClient.post<GenerateInviteLinkResponse>(
			'/api/roommate-applications/generate-invite-link',
		);
		return response.data;
	} catch (error) {
		console.error('Error generating invite link:', error);
		throw new Error(
			extractErrorMessage(
				error,
				'Không thể tạo liên kết mời. Bạn cần có rental active để tạo link mời.',
			),
		);
	}
};

/**
 * Accept Invite (Flow 2)
 * Người nhận link accept invite và tạo application
 */
export const acceptInvite = async (
	data: AcceptInviteRequest,
): Promise<RoommateApplication> => {
	try {
		const response = await apiClient.post<RoommateApplication>(
			'/api/roommate-applications/accept-invite',
			data,
		);
		return response.data;
	} catch (error) {
		console.error('Error accepting invite:', error);
		throw new Error(
			extractErrorMessage(
				error,
				'Không thể chấp nhận lời mời. Link có thể đã hết hạn hoặc không hợp lệ.',
			),
		);
	}
};
