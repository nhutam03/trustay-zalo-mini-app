import React, { useState, useEffect } from 'react';
import { Page, Box, Text, Icon } from 'zmp-ui';
import { useNavigate } from 'react-router-dom';
import {
	useDashboardOverview,
	useDashboardOperations,
	useDashboardFinance,
} from '@/hooks/useLandlordService';
import useSetHeader from '@/hooks/useSetHeader';
import { changeStatusBarColor } from '@/utils/basic';

const DashboardPage: React.FC = () => {
	const navigate = useNavigate();
	const setHeader = useSetHeader();

	useEffect(() => {
        setHeader({
          title: "Cá nhân",
          hasLeftIcon: false,
          type: "primary",
        });
        changeStatusBarColor("primary");
      }, []);

	const [selectedBuildingId, setSelectedBuildingId] = useState<string | undefined>(undefined);

	// Fetch dashboard data
	const { data: overview, isLoading: overviewLoading } = useDashboardOverview({
		buildingId: selectedBuildingId,
	});
	const { data: operations, isLoading: operationsLoading } = useDashboardOperations({
		buildingId: selectedBuildingId,
	});
	const { data: finance, isLoading: financeLoading } = useDashboardFinance({
		buildingId: selectedBuildingId,
	});

	const isLoading = overviewLoading || operationsLoading || financeLoading;

	return (
		<Page className="bg-gray-50">
			<Box className="p-4 space-y-4 mb-16">
				{/* Overview Section */}
				<Box className="bg-white rounded-lg shadow p-4">
					<Text className="text-lg font-semibold mb-4 text-gray-800">Tổng Quan</Text>
					{isLoading ? (
						<div className="grid grid-cols-2 gap-3">
							{[1, 2, 3, 4].map((i) => (
								<div key={i} className="bg-gray-100 h-20 rounded animate-pulse" />
							))}
						</div>
					) : overview ? (
						<div className="grid grid-cols-2 gap-3">
							<StatCard
								icon="zi-home"
								label="Tòa nhà"
								value={overview.totalBuildings ?? 0}
								iconColor="text-blue-600"
								bgColor="bg-blue-50"
							/>
							<StatCard
								icon="zi-grid-solid"
								label="Tổng phòng"
								value={overview.totalRooms ?? 0}
								iconColor="text-purple-600"
								bgColor="bg-purple-50"
							/>
							<StatCard
								icon="zi-check-circle"
								label="Đã thuê"
								value={overview.occupiedRooms ?? 0}
								iconColor="text-green-600"
								bgColor="bg-green-50"
							/>
							<StatCard
								icon="zi-close-circle"
								label="Còn trống"
								value={overview.vacantRooms ?? 0}
								iconColor="text-orange-600"
								bgColor="bg-orange-50"
							/>
							<StatCard
								icon="zi-user"
								label="Người thuê"
								value={overview.totalTenants ?? 0}
								iconColor="text-indigo-600"
								bgColor="bg-indigo-50"
							/>
						<StatCard
							icon="zi-group"
							label="Tỷ lệ lấp đầy"
							value={`${overview.occupancyRate?.toFixed(1) ?? 0}%`}
							iconColor="text-pink-600"
							bgColor="bg-pink-50"
						/>
						</div>
					) : null}
				</Box>

				{/* Operations Section */}
				<Box className="bg-white rounded-lg shadow p-4">
					<Text className="text-lg font-semibold mb-4 text-gray-800">Hoạt Động</Text>
					{isLoading ? (
						<div className="space-y-3">
							{[1, 2, 3, 4].map((i) => (
								<div key={i} className="bg-gray-100 h-16 rounded animate-pulse" />
							))}
						</div>
					) : operations ? (
						<div className="space-y-3">
						<OperationCard
							icon="zi-inbox"
							label="Yêu cầu đặt phòng"
							value={operations.pendingBookings ?? 0}
							onClick={() => navigate('/landlord/bookings')}
							iconColor="text-yellow-600"
						/>
						<OperationCard
							icon="zi-note"
							label="Hợp đồng đang hoạt động"
							value={operations.activeContracts ?? 0}
							onClick={() => navigate('/contracts')}
							iconColor="text-blue-600"
						/>
						<OperationCard
							icon="zi-calendar"
							label="Hợp đồng sắp hết hạn"
							value={operations.expiringSoonContracts ?? 0}
							onClick={() => navigate('/contracts')}
							iconColor="text-orange-600"
						/>
						<OperationCard
							icon="zi-setting"
							label="Yêu cầu bảo trì"
							value={operations.maintenanceRequests ?? 0}
							onClick={() => navigate('/room-issues-management')}
							iconColor="text-red-600"
						/>
						</div>
					) : null}
				</Box>

				{/* Finance Section */}
				<Box className="bg-white rounded-lg shadow p-4 mb-20">
					<Text className="text-lg font-semibold mb-4 text-gray-800">Tài Chính</Text>
					{isLoading ? (
						<div className="space-y-3">
							{[1, 2, 3].map((i) => (
								<div key={i} className="bg-gray-100 h-16 rounded animate-pulse" />
							))}
						</div>
					) : finance ? (
						<div className="space-y-3">
							<FinanceCard
								label="Doanh thu tháng"
								value={finance.monthlyRevenue ?? 0}
								color="text-green-600"
							/>
							<FinanceCard
								label="Doanh thu dự kiến"
								value={finance.expectedRevenue ?? 0}
								color="text-blue-600"
							/>
							<FinanceCard
								label="Đã thu"
								value={finance.collectedRevenue ?? 0}
								color="text-green-600"
							/>
							<FinanceCard
								label="Chờ thanh toán"
								value={finance.pendingPayments ?? 0}
								color="text-yellow-600"
							/>
							<FinanceCard
								label="Quá hạn"
								value={finance.overduePayments ?? 0}
								color="text-red-600"
							/>
						</div>
					) : null}
				</Box>
			</Box>
		</Page>
	);
};

// StatCard component
const StatCard: React.FC<{
	icon: string;
	label: string;
	value: number | string;
	iconColor: string;
	bgColor: string;
}> = ({ icon, label, value, iconColor, bgColor }) => (
	<div className={`${bgColor} rounded-lg p-3 flex items-center space-x-3`}>
		<div className={`${iconColor}`}>
			<Icon icon={icon as any} size={24} />
		</div>
		<div>
			<Text className="text-2xl font-bold text-gray-800">{value}</Text>
			<Text className="text-xs text-gray-600">{label}</Text>
		</div>
	</div>
);

// OperationCard component
const OperationCard: React.FC<{
	icon: string;
	label: string;
	value: number;
	onClick: () => void;
	iconColor: string;
}> = ({ icon, label, value, onClick, iconColor }) => (
	<div
		onClick={onClick}
		className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 active:bg-gray-200 transition-colors"
	>
		<div className="flex items-center space-x-3">
			<div className={iconColor}>
				<Icon icon={icon as any} size={20} />
			</div>
			<Text className="text-sm text-gray-700">{label}</Text>
		</div>
		<div className="flex items-center space-x-2">
			<Text className="text-lg font-bold text-gray-800">{value}</Text>
			<Icon icon="zi-chevron-right" size={16} className="text-gray-400" />
		</div>
	</div>
);

// FinanceCard component
const FinanceCard: React.FC<{
	label: string;
	value: number;
	color: string;
}> = ({ label, value, color }) => (
	<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
		<Text className="text-sm text-gray-700">{label}</Text>
		<Text className={`text-lg font-bold ${color}`}>
			{new Intl.NumberFormat('vi-VN', {
				style: 'currency',
				currency: 'VND',
			}).format(value)}
		</Text>
	</div>
);

export default DashboardPage;
