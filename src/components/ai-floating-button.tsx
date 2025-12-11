import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from 'zmp-ui';
import { useAuth } from './providers/auth-provider';

/**
 * Floating Action Button để truy cập nhanh AI Assistant
 * Hiển thị ở góc dưới bên phải màn hình
 * Chỉ hiển thị khi đã đăng nhập
 * Ẩn khi đang ở trang AI Assistant
 */
const AIFloatingButton: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { isLoggedIn } = useAuth();

	// Ẩn button khi chưa đăng nhập hoặc đang ở trang AI Assistant
	if (location.pathname === '/ai-assistant') {
		return null;
	}

	const handleClick = () => {
		// Lưu lại trang hiện tại để AI biết context
		sessionStorage.setItem('ai_previous_page', location.pathname);
		navigate('/ai-assistant');
	};

	return (
		<button
			onClick={handleClick}
			className="fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 flex items-center justify-center"
			style={{
				boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
			}}
			aria-label="AI Assistant"
		>
			<div className="relative">
				<Icon icon="zi-chat" size={24} />
				{/* Pulse animation */}
				<span className="absolute inset-0 rounded-full bg-blue-400 opacity-75 animate-ping" />
			</div>
		</button>
	);
};

export default AIFloatingButton;
