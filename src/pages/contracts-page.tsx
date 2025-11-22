import React, { useEffect, useState } from 'react';
import { Page, Box, Icon } from 'zmp-ui';
import { useNavigate } from 'react-router-dom';
import useSetHeader from '@/hooks/useSetHeader';
import { changeStatusBarColor } from '@/utils/basic';
import BottomNav from '@/components/navigate-bottom';
import { getMyContracts } from '@/services/contract-service';
import { Contract } from '@/interfaces/contract-interfaces';

const ContractsPage: React.FC = () => {
	const setHeader = useSetHeader();
	const navigate = useNavigate();
	const [contracts, setContracts] = useState<Contract[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<string>('all');

	useEffect(() => {
		setHeader({
			title: 'Hợp đồng',
			hasLeftIcon: true,
			type: 'primary',
		});
		changeStatusBarColor('primary');
	}, []);

	useEffect(() => {
		loadContracts();
	}, [filter]);

	const loadContracts = async () => {
		try {
			setLoading(true);
			const params = filter !== 'all' ? { status: filter } : {};
			const response = await getMyContracts(params);
			setContracts(response.data);
		} catch (error) {
			console.error('Error loading contracts:', error);
		} finally {
			setLoading(false);
		}
	};

	const getStatusBadge = (status: string) => {
		const statusConfig = {
			draft: { text: 'Nháp', color: 'bg-gray-100 text-gray-800' },
			pending_signatures: { text: 'Chờ ký', color: 'bg-yellow-100 text-yellow-800' },
			partially_signed: { text: 'Chờ ký', color: 'bg-yellow-100 text-yellow-800' },
			active: { text: 'Đang hiệu lực', color: 'bg-green-100 text-green-800' },
			terminated: { text: 'Đã chấm dứt', color: 'bg-red-100 text-red-800' },
			expired: { text: 'Hết hạn', color: 'bg-gray-100 text-gray-600' },
		};
		const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
		return (
			<span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
				{config.text}
			</span>
		);
	};

	const handleContractClick = (contractId: string) => {
		navigate(`/contracts/${contractId}`);
	};

	const renderContractCard = (contract: Contract) => {
		// Lấy monthlyRent và depositAmount từ contractData nếu không có ở root
		const monthlyRent =
			contract.monthlyRent ||
			(contract.contractData as any)?.financial?.monthlyRent ||
			(contract.contractData as any)?.monthlyRent;
		const depositAmount =
			contract.depositAmount ||
			(contract.contractData as any)?.financial?.deposit ||
			(contract.contractData as any)?.depositAmount;

		return (
			<button
				key={contract.id}
				onClick={() => handleContractClick(contract.id)}
				className="w-full bg-white p-4 mb-3 rounded-lg shadow-sm active:bg-gray-50"
			>
				<div className="flex justify-between items-start mb-3">
					<div className="flex-1 text-left">
						<h3 className="font-semibold text-gray-900 mb-1">
							{contract.room?.roomName || contract.room?.name || 'Phòng không xác định'}
						</h3>
						<p className="text-sm text-gray-600">{contract.room?.buildingName}</p>
					</div>
					{getStatusBadge(contract.status)}
				</div>

				<div className="space-y-2 mb-3">
					<div className="flex items-center text-sm">
						<Icon icon="zi-calendar" size={16} className="text-gray-400 mr-2" />
						<span className="text-gray-600">
							{new Date(contract.startDate).toLocaleDateString('vi-VN')}
							{contract.endDate && ` - ${new Date(contract.endDate).toLocaleDateString('vi-VN')}`}
						</span>
					</div>
					{monthlyRent && (
						<div className="flex items-center text-sm">
							<Icon icon="zi-poll" size={16} className="text-gray-400 mr-2" />
							<span className="text-gray-600">
								{Number(monthlyRent).toLocaleString('vi-VN')} đ/tháng
							</span>
						</div>
					)}
					{depositAmount && Number(depositAmount) > 0 && (
						<div className="flex items-center text-sm">
							<Icon icon="zi-check-circle" size={16} className="text-gray-400 mr-2" />
							<span className="text-gray-600">
								Đặt cọc: {Number(depositAmount).toLocaleString('vi-VN')} đ
							</span>
						</div>
					)}
				</div>

				<div className="flex items-center justify-between pt-2 border-t border-gray-100">
					<div className="flex items-center text-sm text-gray-600">
						<Icon icon="zi-user" size={16} className="mr-1" />
						<span>
							{contract.tenant?.fullName ||
								`${contract.tenant?.firstName || ''} ${contract.tenant?.lastName || ''}`.trim()}
						</span>
					</div>
					<Icon icon="zi-chevron-right" size={20} className="text-gray-400" />
				</div>
			</button>
		);
	};

	return (
		<Page className="bg-gray-50">
			{/* Filter tabs */}
			<Box className="bg-white mb-2 px-4 py-2">
				<div className="flex gap-2 overflow-x-auto pt-3">
					{[
						{ key: 'all', label: 'Tất cả' },
						{ key: 'active', label: 'Đang hiệu lực' },
						{ key: 'pending_signatures', label: 'Chờ ký' },
						{ key: 'expired', label: 'Hết hạn' },
					].map((tab) => (
						<button
							key={tab.key}
							onClick={() => setFilter(tab.key)}
							className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
								filter === tab.key
									? 'bg-primary text-white'
									: 'bg-gray-100 text-gray-700 active:bg-gray-200'
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>
			</Box>

			<Box className="px-4 py-2">
				{loading ? (
					<div className="flex justify-center items-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					</div>
				) : contracts.length > 0 ? (
					contracts.map((contract) => renderContractCard(contract))
				) : (
					<div className="text-center py-8">
						<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
							<Icon icon="zi-note" size={32} className="text-gray-400" />
						</div>
						<p className="text-gray-500 mb-2">Chưa có hợp đồng nào</p>
						<p className="text-sm text-gray-400">
							Hợp đồng sẽ được tạo sau khi đặt phòng thành công
						</p>
					</div>
				)}
			</Box>
		</Page>
	);
};

export default ContractsPage;
