import React, { useEffect, useState } from 'react';
import { Page, Box, Icon } from 'zmp-ui';
import { useNavigate } from 'react-router-dom';
import useSetHeader from '@/hooks/useSetHeader';
import { changeStatusBarColor } from '@/utils/basic';
import BottomNav from '@/components/navigate-bottom';
import {
	getNotifications,
	markNotificationAsRead,
	markAllNotificationsAsRead,
	deleteNotification,
	NotificationData,
} from '@/services/notification-service';

const NotificationsPage: React.FC = () => {
	const setHeader = useSetHeader();
	const navigate = useNavigate();
	const [notifications, setNotifications] = useState<NotificationData[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<'all' | 'unread'>('all');

	useEffect(() => {
		setHeader({
			title: 'Thông báo',
			hasLeftIcon: true,
			type: 'primary',
		});
		changeStatusBarColor('primary');
	}, []);

	useEffect(() => {
		loadNotifications();
	}, [filter]);

	const loadNotifications = async () => {
		try {
			setLoading(true);
			const params = filter === 'unread' ? { isRead: false } : {};
			const response = await getNotifications(params);
			setNotifications(response.data);
		} catch (error) {
			console.error('Error loading notifications:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleMarkAsRead = async (id: string) => {
		try {
			await markNotificationAsRead(id);
			setNotifications((prev) =>
				prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
			);
		} catch (error) {
			console.error('Error marking notification as read:', error);
		}
	};

	const handleMarkAllAsRead = async () => {
		try {
			await markAllNotificationsAsRead();
			setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
		} catch (error) {
			console.error('Error marking all as read:', error);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			await deleteNotification(id);
			setNotifications((prev) => prev.filter((notif) => notif.id !== id));
		} catch (error) {
			console.error('Error deleting notification:', error);
		}
	};

	const getNotificationIcon = (type: string) => {
		const iconMap: { [key: string]: string } = {
			booking: 'zi-calendar',
			contract: 'zi-note-text',
			payment: 'zi-card',
			message: 'zi-chat',
			system: 'zi-info-circle',
		};
		return iconMap[type] || 'zi-notif';
	};

	const renderNotificationCard = (notification: NotificationData) => (
		<div
			key={notification.id}
			className={`bg-white p-4 mb-2 rounded-lg ${!notification.isRead ? 'border-l-4 border-primary' : ''}`}
		>
			<div className="flex items-start gap-3">
				<div
					className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
						notification.isRead ? 'bg-gray-100' : 'bg-blue-50'
					}`}
				>
					<Icon
						icon={getNotificationIcon(notification.type) as any}
						size={20}
						className={notification.isRead ? 'text-gray-400' : 'text-primary'}
					/>
				</div>

				<div className="flex-1 min-w-0">
					<h4 className={`font-medium mb-1 ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
						{notification.title}
					</h4>
					<p className={`text-sm mb-2 ${notification.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
						{notification.message}
					</p>
					<div className="flex items-center justify-between">
						<span className="text-xs text-gray-400">
							{new Date(notification.createdAt).toLocaleDateString('vi-VN', {
								day: '2-digit',
								month: '2-digit',
								year: 'numeric',
								hour: '2-digit',
								minute: '2-digit',
							})}
						</span>
						<div className="flex gap-2">
							{!notification.isRead && (
								<button
									onClick={() => handleMarkAsRead(notification.id)}
									className="text-xs text-primary font-medium active:opacity-70"
								>
									Đánh dấu đã đọc
								</button>
							)}
							<button
								onClick={() => handleDelete(notification.id)}
								className="text-xs text-red-500 font-medium active:opacity-70"
							>
								Xóa
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);

	const unreadCount = notifications.filter((n) => !n.isRead).length;

	return (
		<Page className="bg-gray-50 has-bottom-nav">
			{/* Header actions */}
			<Box className="bg-white mb-2 px-4 py-3">
				<div className="flex items-center justify-between mb-3">
					<div className="flex gap-2">
						<button
							onClick={() => setFilter('all')}
							className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
								filter === 'all'
									? 'bg-primary text-white'
									: 'bg-gray-100 text-gray-700 active:bg-gray-200'
							}`}
						>
							Tất cả
						</button>
						<button
							onClick={() => setFilter('unread')}
							className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
								filter === 'unread'
									? 'bg-primary text-white'
									: 'bg-gray-100 text-gray-700 active:bg-gray-200'
							}`}
						>
							Chưa đọc {unreadCount > 0 && `(${unreadCount})`}
						</button>
					</div>
					{unreadCount > 0 && (
						<button
							onClick={handleMarkAllAsRead}
							className="text-sm text-primary font-medium active:opacity-70"
						>
							Đọc tất cả
						</button>
					)}
				</div>
			</Box>

			{/* Notifications list */}
			<Box className="px-4 py-2">
				{loading ? (
					<div className="flex justify-center items-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					</div>
				) : notifications.length > 0 ? (
					notifications.map((notification) => renderNotificationCard(notification))
				) : (
					<div className="text-center py-8">
						<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
							<Icon icon="zi-notif" size={32} className="text-gray-400" />
						</div>
						<p className="text-gray-500 mb-2">
							{filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
						</p>
						<p className="text-sm text-gray-400">Thông báo sẽ xuất hiện tại đây</p>
					</div>
				)}
			</Box>

			<BottomNav />
		</Page>
	);
};

export default NotificationsPage;
