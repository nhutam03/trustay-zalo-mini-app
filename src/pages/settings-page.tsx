import React, { useEffect, useState } from 'react';
import { Page, Box, Icon } from 'zmp-ui';
import { useNavigate } from 'react-router-dom';
import useSetHeader from '@/hooks/useSetHeader';
import { changeStatusBarColor } from '@/utils/basic';
import BottomNav from '@/components/navigate-bottom';
import { useAuth } from '@/components/providers/auth-provider';

const SettingsPage: React.FC = () => {
	const setHeader = useSetHeader();
	const navigate = useNavigate();
	const { user } = useAuth();
	const [notificationsEnabled, setNotificationsEnabled] = useState(true);
	const [emailNotifications, setEmailNotifications] = useState(true);
	const [pushNotifications, setPushNotifications] = useState(true);

	useEffect(() => {
		setHeader({
			title: 'Cài đặt',
			hasLeftIcon: true,
			type: 'primary',
		});
		changeStatusBarColor('primary');
	}, []);

	const settingSections = [
		{
			title: 'Tài khoản',
			items: [
				{
					id: 'profile',
					icon: 'zi-user',
					label: 'Thông tin cá nhân',
					route: '/profile',
					rightIcon: 'zi-chevron-right',
				},
				{
					id: 'security',
					icon: 'zi-shield-solid',
					label: 'Bảo mật',
					description: 'Mật khẩu, xác thực 2 yếu tố',
					rightIcon: 'zi-chevron-right',
				},
				{
					id: 'verification',
					icon: 'zi-check-circle',
					label: 'Xác minh danh tính',
					description: user?.isVerifiedIdentity ? 'Đã xác minh' : 'Chưa xác minh',
					rightIcon: 'zi-chevron-right',
				},
			],
		},
		{
			title: 'Thông báo',
			items: [
				{
					id: 'notifications',
					icon: 'zi-notif',
					label: 'Thông báo',
					description: 'Bật/tắt tất cả thông báo',
					toggle: true,
					value: notificationsEnabled,
					onChange: setNotificationsEnabled,
				},
				{
					id: 'push',
					icon: 'zi-chat',
					label: 'Thông báo đẩy',
					description: 'Tin nhắn, cập nhật đặt phòng',
					toggle: true,
					value: pushNotifications,
					onChange: setPushNotifications,
				},
				{
					id: 'email',
					icon: 'zi-mail',
					label: 'Email thông báo',
					description: 'Nhận thông báo qua email',
					toggle: true,
					value: emailNotifications,
					onChange: setEmailNotifications,
				},
			],
		},
		{
			title: 'Quyền riêng tư',
			items: [
				{
					id: 'privacy',
					icon: 'zi-hide',
					label: 'Quyền riêng tư',
					description: 'Ai có thể xem hồ sơ của bạn',
					rightIcon: 'zi-chevron-right',
				},
				{
					id: 'blocked',
					icon: 'zi-ban',
					label: 'Người dùng bị chặn',
					rightIcon: 'zi-chevron-right',
				},
			],
		},
		{
			title: 'Ứng dụng',
			items: [
				{
					id: 'language',
					icon: 'zi-wifi',
					label: 'Ngôn ngữ',
					description: 'Tiếng Việt',
					rightIcon: 'zi-chevron-right',
				},
				{
					id: 'theme',
					icon: 'zi-wallpaper',
					label: 'Giao diện',
					description: 'Sáng',
					rightIcon: 'zi-chevron-right',
				},
				{
					id: 'storage',
					icon: 'zi-memory',
					label: 'Bộ nhớ & dữ liệu',
					description: '125 MB',
					rightIcon: 'zi-chevron-right',
				},
			],
		},
		{
			title: 'Hỗ trợ',
			items: [
				{
					id: 'help',
					icon: 'zi-help-circle',
					label: 'Trung tâm hỗ trợ',
					route: '/help',
					rightIcon: 'zi-chevron-right',
				},
				{
					id: 'feedback',
					icon: 'zi-chat',
					label: 'Gửi phản hồi',
					rightIcon: 'zi-chevron-right',
				},
				{
					id: 'about',
					icon: 'zi-info-circle',
					label: 'Về TruStay',
					description: 'Phiên bản 1.0.0',
					rightIcon: 'zi-chevron-right',
				},
			],
		},
		{
			title: 'Pháp lý',
			items: [
				{
					id: 'terms',
					icon: 'zi-note',
					label: 'Điều khoản sử dụng',
					rightIcon: 'zi-chevron-right',
				},
				{
					id: 'privacy-policy',
					icon: 'zi-lock',
					label: 'Chính sách bảo mật',
					rightIcon: 'zi-chevron-right',
				},
			],
		},
	];

	const handleItemClick = (item: any) => {
		if (item.toggle) return; // Toggle items are handled by onChange
		if (item.route) {
			navigate(item.route);
		} else {
			// TODO: Handle other actions
			console.log('Clicked:', item.id);
		}
	};

	const renderToggle = (value: boolean, onChange: (value: boolean) => void) => (
		<button
			onClick={(e) => {
				e.stopPropagation();
				onChange(!value);
			}}
			className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
				value ? 'bg-primary' : 'bg-gray-300'
			}`}
		>
			<span
				className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
					value ? 'translate-x-6' : 'translate-x-1'
				}`}
			/>
		</button>
	);

	return (
		<Page className="bg-gray-50">
			<Box className="px-4 py-2">
				{settingSections.map((section, sectionIndex) => (
					<div key={sectionIndex} className="mb-6">
						<h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 px-2">
							{section.title}
						</h3>
						<div className="bg-white rounded-lg shadow-sm overflow-hidden">
							{section.items.map((item, itemIndex) => (
								<button
									key={item.id}
									onClick={() => handleItemClick(item)}
									className={`w-full p-4 flex items-center gap-3 active:bg-gray-50 transition-colors ${
										itemIndex !== section.items.length - 1 ? 'border-b border-gray-100' : ''
									}`}
								>
									<div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
										<Icon icon={item.icon} size={20} className="text-gray-600" />
									</div>
									<div className="flex-1 text-left">
										<p className="font-medium text-gray-900">{item.label}</p>
										{item.description && (
											<p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
										)}
									</div>
									{item.toggle && item.onChange ? (
										renderToggle(item.value, item.onChange)
									) : item.rightIcon ? (
										<Icon icon={item.rightIcon} size={20} className="text-gray-400" />
									) : null}
								</button>
							))}
						</div>
					</div>
				))}

				{/* Logout Button */}
				<button className="w-full bg-white p-4 rounded-lg shadow-sm mb-6 active:bg-gray-50 transition-colors">
					<div className="flex items-center justify-center gap-2">
						<span className="font-medium text-red-600">Đăng xuất</span>
					</div>
				</button>

				{/* Version Info */}
				<div className="text-center text-sm text-gray-400 pb-4">
					<p>TruStay v1.0.0</p>
					<p className="mt-1">© 2025 TruStay. All rights reserved.</p>
				</div>
			</Box>
		</Page>
	);
};

export default SettingsPage;
