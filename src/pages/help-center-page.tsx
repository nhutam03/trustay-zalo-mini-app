import React, { useEffect, useState } from 'react';
import { Page, Box, Icon, Input } from 'zmp-ui';
import { useNavigate } from 'react-router-dom';
import useSetHeader from '@/hooks/useSetHeader';
import { changeStatusBarColor } from '@/utils/basic';
import BottomNav from '@/components/navigate-bottom';

interface FAQItem {
	id: string;
	question: string;
	answer: string;
	category: string;
}

interface HelpCategory {
	id: string;
	title: string;
	icon: any;
	description: string;
	articles: number;
}

const HelpCenterPage: React.FC = () => {
	const setHeader = useSetHeader();
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState('');
	const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

	useEffect(() => {
		setHeader({
			title: 'Trung tâm hỗ trợ',
			hasLeftIcon: true,
			type: 'primary',
		});
		changeStatusBarColor('primary');
	}, []);

	const categories: HelpCategory[] = [
		{
			id: 'getting-started',
			title: 'Bắt đầu sử dụng',
			icon: 'zi-star',
			description: 'Hướng dẫn cơ bản cho người mới',
			articles: 8,
		},
		{
			id: 'booking',
			title: 'Đặt phòng',
			icon: 'zi-home',
			description: 'Tìm hiểu về quy trình đặt phòng',
			articles: 12,
		},
		{
			id: 'payment',
			title: 'Thanh toán',
			icon: 'zi-poll',
			description: 'Phương thức và chính sách thanh toán',
			articles: 6,
		},
		{
			id: 'account',
			title: 'Tài khoản',
			icon: 'zi-user',
			description: 'Quản lý tài khoản và bảo mật',
			articles: 10,
		},
		{
			id: 'landlord',
			title: 'Dành cho chủ nhà',
			icon: 'zi-star',
			description: 'Hướng dẫn cho chủ nhà cho thuê',
			articles: 15,
		},
		{
			id: 'tenant',
			title: 'Dành cho người thuê',
			icon: 'zi-user',
			description: 'Hướng dẫn cho người thuê phòng',
			articles: 14,
		},
	];

	const faqs: FAQItem[] = [
		{
			id: '1',
			question: 'Làm thế nào để đặt phòng trên TruStay?',
			answer:
				'Để đặt phòng, bạn cần: 1) Tìm phòng phù hợp thông qua trang Khám phá, 2) Xem chi tiết và gửi yêu cầu đặt phòng, 3) Chờ chủ nhà xác nhận, 4) Thanh toán đặt cọc khi được chấp nhận, 5) Hoàn tất hợp đồng và nhận chìa khóa.',
			category: 'booking',
		},
		{
			id: '2',
			question: 'Tôi có thể hủy đặt phòng không?',
			answer:
				'Có, bạn có thể hủy đặt phòng theo chính sách hủy của từng phòng. Nếu hủy trước 7 ngày, bạn sẽ được hoàn 100% tiền cọc. Nếu hủy trong vòng 7 ngày, bạn có thể bị mất một phần hoặc toàn bộ tiền cọc tùy chính sách của chủ nhà.',
			category: 'booking',
		},
		{
			id: '3',
			question: 'Các hình thức thanh toán nào được chấp nhận?',
			answer:
				'TruStay chấp nhận nhiều hình thức thanh toán: Thẻ ATM nội địa, Thẻ tín dụng/ghi nợ quốc tế (Visa, Mastercard), Ví điện tử (ZaloPay, Momo, VNPay), Chuyển khoản ngân hàng.',
			category: 'payment',
		},
		{
			id: '4',
			question: 'Làm sao để xác minh danh tính?',
			answer:
				'Vào Cài đặt > Xác minh danh tính, sau đó tải lên ảnh CCCD/CMND và ảnh selfie. Quá trình xác minh thường mất 1-2 ngày làm việc. Tài khoản đã xác minh sẽ được ưu tiên và tạo niềm tin hơn.',
			category: 'account',
		},
		{
			id: '5',
			question: 'Tôi quên mật khẩu, phải làm sao?',
			answer:
				'Tại trang đăng nhập, nhấn "Quên mật khẩu". Nhập email đã đăng ký, bạn sẽ nhận được link đặt lại mật khẩu qua email. Link có hiệu lực trong 1 giờ.',
			category: 'account',
		},
		{
			id: '6',
			question: 'Chi phí dịch vụ là bao nhiêu?',
			answer:
				'Người thuê: 5% giá trị hợp đồng (tối thiểu 50,000đ). Chủ nhà: 3% giá trị hợp đồng (tối thiểu 30,000đ). Phí dịch vụ đã bao gồm VAT và được tính tự động khi thanh toán.',
			category: 'payment',
		},
		{
			id: '7',
			question: 'Làm thế nào để đăng tin cho thuê phòng?',
			answer:
				'Truy cập Quản lý cho thuê > Thêm phòng mới. Điền đầy đủ thông tin: địa chỉ, giá thuê, diện tích, tiện nghi, tải ảnh chất lượng cao, và mô tả chi tiết. Tin đăng sẽ được duyệt trong 24h.',
			category: 'landlord',
		},
		{
			id: '8',
			question: 'Tôi cần chuẩn bị gì trước khi chuyển vào?',
			answer:
				'Bạn cần: Hợp đồng đã ký, Biên bản bàn giao, CCCD gốc, Tiền thuê tháng đầu + tiền cọc (nếu chưa thanh toán), Danh sách người ở cùng (nếu có). Liên hệ chủ nhà để sắp xếp thời gian cụ thể.',
			category: 'tenant',
		},
	];

	const quickActions: Array<{ id: string; icon: any; label: string; action: string; info?: string }> = [
		{ id: 'contact', icon: 'zi-chat', label: 'Chat với hỗ trợ', action: 'chat' },
		{ id: 'call', icon: 'zi-call', label: 'Gọi hotline', action: 'call', info: '1900 xxxx' },
		{ id: 'email', icon: 'zi-mail', label: 'Gửi email', action: 'email', info: 'support@trustay.vn' },
	];

	const handleCategoryClick = (categoryId: string) => {
		// TODO: Navigate to category detail page
		console.log('Navigate to category:', categoryId);
	};

	const handleQuickAction = (action: string) => {
		switch (action) {
			case 'chat':
				navigate('/messages');
				break;
			case 'call':
				// TODO: Implement call action
				console.log('Call hotline');
				break;
			case 'email':
				// TODO: Implement email action
				console.log('Send email');
				break;
		}
	};

	const filteredFAQs = searchQuery
		? faqs.filter(
				(faq) =>
					faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
					faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
		  )
		: faqs;

	return (
		<Page className="bg-gray-50">
			{/* Search Bar */}
			<Box className="bg-white mb-2 px-4 py-3">
				<div className="relative">
					<Input
						type="text"
						placeholder="Tìm kiếm câu hỏi..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
					/>
					<Icon icon="zi-search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
				</div>
			</Box>

			<Box className="px-4 py-2">
				{/* Quick Actions */}
				<div className="mb-6">
					<h3 className="text-sm font-semibold text-gray-700 mb-3">Liên hệ hỗ trợ</h3>
					<div className="grid grid-cols-3 gap-3">
						{quickActions.map((action) => (
							<button
								key={action.id}
								onClick={() => handleQuickAction(action.action)}
								className="bg-white p-4 rounded-lg shadow-sm active:bg-gray-50 flex flex-col items-center gap-2"
							>
								<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
									<Icon icon={action.icon} size={24} className="text-primary" />
								</div>
								<span className="text-xs font-medium text-gray-700 text-center">{action.label}</span>
								{action.info && (
									<span className="text-xs text-gray-500 text-center">{action.info}</span>
								)}
							</button>
						))}
					</div>
				</div>

				{/* Categories */}
				<div className="mb-6">
					<h3 className="text-sm font-semibold text-gray-700 mb-3">Chủ đề</h3>
					<div className="grid grid-cols-2 gap-3">
						{categories.map((category) => (
							<button
								key={category.id}
								onClick={() => handleCategoryClick(category.id)}
								className="bg-white p-4 rounded-lg shadow-sm active:bg-gray-50 text-left"
							>
								<div className="flex items-start gap-3">
									<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
										<Icon icon={category.icon} size={20} className="text-primary" />
									</div>
									<div className="flex-1 min-w-0">
										<h4 className="font-semibold text-gray-900 mb-1">{category.title}</h4>
										<p className="text-xs text-gray-500 mb-2">{category.description}</p>
										<span className="text-xs text-primary">{category.articles} bài viết</span>
									</div>
								</div>
							</button>
						))}
					</div>
				</div>

				{/* FAQ Section */}
				<div className="mb-6">
					<h3 className="text-sm font-semibold text-gray-700 mb-3">Câu hỏi thường gặp</h3>
					<div className="space-y-3">
						{filteredFAQs.map((faq) => (
							<div key={faq.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
								<button
									onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
									className="w-full p-4 flex items-start gap-3 active:bg-gray-50"
								>
									<div className="flex-1 text-left">
										<h4 className="font-medium text-gray-900">{faq.question}</h4>
									</div>
									<Icon
										icon={expandedFAQ === faq.id ? 'zi-chevron-up' : 'zi-chevron-down'}
										size={20}
										className="text-gray-400 flex-shrink-0"
									/>
								</button>
								{expandedFAQ === faq.id && (
									<div className="px-4 pb-4 text-sm text-gray-600 border-t border-gray-100 pt-3">
										{faq.answer}
									</div>
								)}
							</div>
						))}
					</div>

					{filteredFAQs.length === 0 && (
						<div className="text-center py-8">
							<Icon icon="zi-search" size={48} className="text-gray-300 mx-auto mb-3" />
							<p className="text-gray-500">Không tìm thấy câu hỏi phù hợp</p>
							<p className="text-sm text-gray-400 mt-1">Vui lòng thử từ khóa khác</p>
						</div>
					)}
				</div>

				{/* Still need help */}
				<div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6 text-center mb-6">
					<Icon icon="zi-help-circle" size={48} className="text-primary mx-auto mb-3" />
					<h3 className="font-semibold text-gray-900 mb-2">Vẫn cần hỗ trợ?</h3>
					<p className="text-sm text-gray-600 mb-4">
						Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn
					</p>
					<button
						onClick={() => navigate('/messages')}
						className="bg-primary text-white px-6 py-2 rounded-lg font-medium active:bg-primary/90"
					>
						Chat ngay
					</button>
				</div>
			</Box>
		</Page>
	);
};

export default HelpCenterPage;
