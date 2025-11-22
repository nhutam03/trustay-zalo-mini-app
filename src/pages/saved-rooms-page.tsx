import React, { useEffect } from 'react';
import { Page, Box, Icon } from 'zmp-ui';
import useSetHeader from '@/hooks/useSetHeader';
import { changeStatusBarColor } from '@/utils/basic';
import BottomNav from '@/components/navigate-bottom';

const SavedRoomsPage: React.FC = () => {
	const setHeader = useSetHeader();

	useEffect(() => {
		setHeader({
			title: 'Phòng đã lưu',
			hasLeftIcon: true,
			type: 'primary',
		});
		changeStatusBarColor('primary');
	}, []);

	return (
		<Page className="bg-gray-50">
			<Box className="px-4 py-2">
				{/* Coming Soon Section */}
				<div className="flex flex-col items-center justify-center py-16">
					<div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
						<Icon icon="zi-bookmark" size={48} className="text-primary" />
					</div>
					<h3 className="text-xl font-bold text-gray-900 mb-3">Tính năng đang phát triển</h3>
					<p className="text-gray-600 text-center mb-2 px-6">
						Chúng tôi đang hoàn thiện tính năng lưu phòng yêu thích
					</p>
					<p className="text-sm text-gray-500 text-center px-6">
						Bạn sẽ có thể lưu và quản lý các phòng ưa thích của mình ở đây
					</p>

					{/* Feature Preview */}
					<div className="w-full mt-10 space-y-4">
						<div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
							<div className="flex items-start gap-3">
								<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
									<Icon icon="zi-heart" size={24} className="text-primary" />
								</div>
								<div className="flex-1">
									<h4 className="font-semibold text-gray-900 mb-1">Lưu phòng yêu thích</h4>
									<p className="text-sm text-gray-600">
										Đánh dấu các phòng bạn quan tâm để xem lại sau
									</p>
								</div>
							</div>
						</div>

						<div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
							<div className="flex items-start gap-3">
								<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
									<Icon icon="zi-notif" size={24} className="text-primary" />
								</div>
								<div className="flex-1">
									<h4 className="font-semibold text-gray-900 mb-1">Nhận thông báo</h4>
									<p className="text-sm text-gray-600">
										Được thông báo khi có thay đổi giá hoặc trạng thái phòng
									</p>
								</div>
							</div>
						</div>

						<div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
							<div className="flex items-start gap-3">
								<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
									<Icon icon="zi-list-1" size={24} className="text-primary" />
								</div>
								<div className="flex-1">
									<h4 className="font-semibold text-gray-900 mb-1">So sánh dễ dàng</h4>
									<p className="text-sm text-gray-600">
										So sánh các phòng đã lưu để đưa ra quyết định tốt nhất
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Status Badge */}
					<div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
						<div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
						<span className="text-sm font-medium text-blue-700">Đang trong quá trình phát triển</span>
					</div>
				</div>
			</Box>
		</Page>
	);
};

export default SavedRoomsPage;
