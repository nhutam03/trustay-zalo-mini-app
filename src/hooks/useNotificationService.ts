import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	getNotifications,
	getUnreadNotificationCount,
	markNotificationAsRead,
	markAllNotificationsAsRead,
	deleteNotification,
	deleteAllNotifications,
	type GetNotificationsParams,
} from '@/services/notification-service';

// Query keys
export const notificationKeys = {
	all: ['notifications'] as const,
	lists: () => [...notificationKeys.all, 'list'] as const,
	list: (params?: GetNotificationsParams) => [...notificationKeys.lists(), params] as const,
	count: () => [...notificationKeys.all, 'count'] as const,
};

// Get notifications
export const useNotifications = (params?: GetNotificationsParams) => {
	return useQuery({
		queryKey: notificationKeys.list(params),
		queryFn: () => getNotifications(params),
		staleTime: 30 * 1000, // 30 seconds
	});
};

// Get unread notification count
export const useUnreadNotificationCount = () => {
	return useQuery({
		queryKey: notificationKeys.count(),
		queryFn: getUnreadNotificationCount,
		staleTime: 30 * 1000,
		refetchInterval: 60 * 1000, // Auto-refetch every minute
	});
};

// Mark notification as read
export const useMarkNotificationAsRead = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (notificationId: string) => markNotificationAsRead(notificationId),
		onSuccess: () => {
			// Invalidate notifications list and count
			queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
			queryClient.invalidateQueries({ queryKey: notificationKeys.count() });
		},
	});
};

// Mark all notifications as read
export const useMarkAllNotificationsAsRead = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: markAllNotificationsAsRead,
		onSuccess: () => {
			// Invalidate all notification queries
			queryClient.invalidateQueries({ queryKey: notificationKeys.all });
		},
	});
};

// Delete notification
export const useDeleteNotification = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (notificationId: string) => deleteNotification(notificationId),
		onSuccess: () => {
			// Invalidate notifications list and count
			queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
			queryClient.invalidateQueries({ queryKey: notificationKeys.count() });
		},
	});
};

// Delete all notifications
export const useDeleteAllNotifications = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteAllNotifications,
		onSuccess: () => {
			// Invalidate all notification queries
			queryClient.invalidateQueries({ queryKey: notificationKeys.all });
		},
	});
};
