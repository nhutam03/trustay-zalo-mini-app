import React, { useEffect, useState } from 'react';
import { Page, Tabs } from 'zmp-ui';
import useSetHeader from '@/hooks/useSetHeader';
import { changeStatusBarColor } from '@/utils/basic';
import PostRoomSeekingPage from './post-room-seeking-page';
import PostRoommateSeekingPage from './post-roommate-seeking-page';

const TenantPostPage: React.FC = () => {
	const setHeader = useSetHeader();
	const [activeTab, setActiveTab] = useState('room-seeking');

	useEffect(() => {
		setHeader({
			title: 'Đăng tin',
			hasLeftIcon: true,
			type: 'primary',
		});
		changeStatusBarColor('primary');
	}, []);

	return (
		<Page className="page bg-white">
			<Tabs
				activeKey={activeTab}
				onChange={(key) => setActiveTab(key as string)}
			>
				<Tabs.Tab key="room-seeking" label="Tìm chỗ thuê">
					<PostRoomSeekingPage />
				</Tabs.Tab>
				<Tabs.Tab key="roommate-seeking" label="Tìm bạn cùng phòng">
					<PostRoommateSeekingPage />
				</Tabs.Tab>
			</Tabs>
		</Page>
	);
};

export default TenantPostPage;
