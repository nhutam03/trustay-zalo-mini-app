import { apiClient, extractErrorMessage } from '@/lib/api-client';

// Types
export interface NotificationData {
	id: string;
	userId: string;
	type: string;
	title: string;
	message: string;
	data?: Record<string, unknown>;
	isRead: boolean;
	createdAt: string;
}

export interface NotificationListResponse {
	data: NotificationData[];
	page?: number;
	limit?: number;
	total?: number;
}

export interface NotificationCountResponse {
	data: {
		count: number;
	};
	unreadCount?: number;
}

export interface GetNotificationsParams {
	page?: number;
	limit?: number;
	isRead?: boolean;
	notificationType?: string;
}

// Get notifications
export const getNotifications = async (
	params: GetNotificationsParams = {}
): Promise<NotificationListResponse> => {
	try {
		const queryParams = new URLSearchParams();
		if (params.page) queryParams.set('page', params.page.toString());
		if (params.limit) queryParams.set('limit', params.limit.toString());
		if (params.isRead !== undefined) queryParams.set('isRead', params.isRead.toString());
		if (params.notificationType) queryParams.set('notificationType', params.notificationType);

		const url = `/api/notifications${queryParams.toString() ? `?${queryParams}` : ''}`;

		const response = await apiClient.get<NotificationListResponse>(url);
		return response.data;
	} catch (error) {
		console.error('Error getting notifications:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải thông báo'));
	}
};

// Get unread notification count
export const getUnreadNotificationCount = async (): Promise<NotificationCountResponse> => {
	try {
		const response = await apiClient.get<NotificationCountResponse>(
			'/api/notifications/count'
		);
		return response.data;
	} catch (error) {
		console.error('Error getting unread notification count:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải số lượng thông báo chưa đọc'));
	}
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
	try {
		await apiClient.patch(`/api/notifications/${notificationId}/read`);
	} catch (error) {
		console.error('Error marking notification as read:', error);
		throw new Error(extractErrorMessage(error, 'Không thể đánh dấu thông báo đã đọc'));
	}
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<void> => {
	try {
		await apiClient.patch('/api/notifications/mark-all-read');
	} catch (error) {
		console.error('Error marking all notifications as read:', error);
		throw new Error(extractErrorMessage(error, 'Không thể đánh dấu tất cả thông báo đã đọc'));
	}
};

// Delete notification
export const deleteNotification = async (notificationId: string): Promise<void> => {
	try {
		await apiClient.delete(`/api/notifications/${notificationId}`);
	} catch (error) {
		console.error('Error deleting notification:', error);
		throw new Error(extractErrorMessage(error, 'Không thể xóa thông báo'));
	}
};

// Delete all notifications
export const deleteAllNotifications = async (): Promise<void> => {
	try {
		await apiClient.delete('/api/notifications/all');
	} catch (error) {
		console.error('Error deleting all notifications:', error);
		throw new Error(extractErrorMessage(error, 'Không thể xóa tất cả thông báo'));
	}
};
