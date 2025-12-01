import { apiClient, extractErrorMessage } from '@/lib/api-client';
import type {
	CreateRoomIssueDto,
	RoomIssueQueryDto,
	LandlordRoomIssueQueryDto,
	RoomIssueResponseDto,
	PaginatedRoomIssueResponse,
} from '@/interfaces/room-issue-interfaces';

// Export types for use in hooks
export type {
	CreateRoomIssueDto,
	RoomIssueQueryDto,
	LandlordRoomIssueQueryDto,
	RoomIssueResponseDto,
	PaginatedRoomIssueResponse,
};

// Base response wrapper
interface ApiResponse<T> {
	success: boolean;
	message: string;
	data: T;
	timestamp?: string;
}

/**
 * Create a new room issue report (Tenant only)
 * POST /room-issues
 */
export const createRoomIssue = async (
	data: CreateRoomIssueDto,
): Promise<{ data: RoomIssueResponseDto }> => {
	try {
		const response = await apiClient.post<ApiResponse<RoomIssueResponseDto>>(
			'/api/room-issues',
			data,
		);
		return { data: response.data.data };
	} catch (error) {
		throw new Error(extractErrorMessage(error, 'Không thể báo cáo sự cố'));
	}
};

/**
 * Get room issues reported by current tenant
 * GET /room-issues/me
 */
export const getTenantRoomIssues = async (
	params?: RoomIssueQueryDto,
): Promise<{ data: PaginatedRoomIssueResponse }> => {
	try {
		const response = await apiClient.get<ApiResponse<PaginatedRoomIssueResponse>>(
			'/api/room-issues/me',
			{ params },
		);
		return { data: response.data.data };
	} catch (error) {
		throw new Error(extractErrorMessage(error, 'Không thể tải danh sách sự cố'));
	}
};

/**
 * Get room issues for landlord
 * GET /room-issues/landlord
 */
export const getLandlordRoomIssues = async (
	params?: LandlordRoomIssueQueryDto,
): Promise<{ data: PaginatedRoomIssueResponse }> => {
	try {
		const response = await apiClient.get<ApiResponse<PaginatedRoomIssueResponse>>(
			'/api/room-issues/landlord',
			{ params },
		);
		return { data: response.data.data };
	} catch (error) {
		throw new Error(extractErrorMessage(error, 'Không thể tải danh sách sự cố'));
	}
};

/**
 * Get room issue detail by ID
 * GET /room-issues/:issueId
 * Access: Tenant (own issues) or Landlord (building owner)
 */
export const getRoomIssueById = async (
	issueId: string,
): Promise<{ data: RoomIssueResponseDto }> => {
	try {
		const response = await apiClient.get<ApiResponse<RoomIssueResponseDto>>(
			`/api/room-issues/${issueId}`,
		);
		return { data: response.data.data };
	} catch (error) {
		throw new Error(extractErrorMessage(error, 'Không thể tải thông tin sự cố'));
	}
};
