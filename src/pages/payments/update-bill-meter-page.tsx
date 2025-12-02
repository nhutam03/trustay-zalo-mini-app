import React, { useEffect, useState } from 'react';
import { Page, Box, Icon, Button, Input } from 'zmp-ui';
import { useParams, useNavigate } from 'react-router-dom';
import useSetHeader from '@/hooks/useSetHeader';
import { changeStatusBarColor } from '@/utils/basic';
import { useBill, useUpdateBillWithMeterData } from '@/hooks/useBillService';
import { useAuth } from '@/components/providers/auth-provider';

interface MeterData {
	electricityLastReading?: number;
	electricityCurrentReading?: number;
	waterLastReading?: number;
	waterCurrentReading?: number;
	occupancyCount?: number;
}

const UpdateBillMeterPage: React.FC = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const setHeader = useSetHeader();
	const { user } = useAuth();

	const { data: billData, isLoading: loading } = useBill(id || '', !!id);
	const updateMeterMutation = useUpdateBillWithMeterData();

	const bill = billData?.data;

	const [meterData, setMeterData] = useState<MeterData>({
		electricityLastReading: undefined,
		electricityCurrentReading: undefined,
		waterLastReading: undefined,
		waterCurrentReading: undefined,
		occupancyCount: undefined,
	});

	useEffect(() => {
		setHeader({
			title: 'Cập nhật số đồng hồ',
			hasLeftIcon: true,
			type: 'primary',
		});
		changeStatusBarColor('primary');
	}, []);

	useEffect(() => {
		if (bill) {
			// Pre-fill with existing meter readings if available
			const electricityItem = bill.billItems?.find(item => 
				item.itemName?.toLowerCase().includes('điện') || 
				item.meterReading?.unit?.toLowerCase().includes('kwh')
			);
			const waterItem = bill.billItems?.find(item => 
				item.itemName?.toLowerCase().includes('nước') || 
				item.meterReading?.unit?.toLowerCase().includes('m3')
			);

			setMeterData({
				electricityLastReading: electricityItem?.meterReading?.lastReading,
				electricityCurrentReading: electricityItem?.meterReading?.currentReading,
				waterLastReading: waterItem?.meterReading?.lastReading,
				waterCurrentReading: waterItem?.meterReading?.currentReading,
				occupancyCount: bill.occupancyCount,
			});
		}
	}, [bill]);

	const handleInputChange = (field: keyof MeterData, value: string) => {
		const numValue = value ? parseFloat(value) : undefined;
		setMeterData(prev => ({ ...prev, [field]: numValue }));
	};

	const handleSubmit = async () => {
		if (!id || !bill) return;

		// Validation
		if (meterData.electricityCurrentReading !== undefined && 
			meterData.electricityLastReading !== undefined &&
			meterData.electricityCurrentReading < meterData.electricityLastReading) {
			alert('Chỉ số điện hiện tại phải lớn hơn chỉ số cũ');
			return;
		}

		if (meterData.waterCurrentReading !== undefined && 
			meterData.waterLastReading !== undefined &&
			meterData.waterCurrentReading < meterData.waterLastReading) {
			alert('Chỉ số nước hiện tại phải lớn hơn chỉ số cũ');
			return;
		}

		try {
			const meterReadings: { roomCostId: string; currentReading: number; lastReading: number }[] = [];
			
			// Add electricity reading if available
			if (meterData.electricityCurrentReading !== undefined) {
				const electricityItem = bill.billItems?.find(item => 
					item.itemName?.toLowerCase().includes('điện') || 
					item.meterReading?.unit?.toLowerCase().includes('kwh')
				);
				if (electricityItem?.roomCostId) {
					meterReadings.push({
						roomCostId: electricityItem.roomCostId,
						currentReading: meterData.electricityCurrentReading,
						lastReading: meterData.electricityLastReading || 0,
					});
				}
			}

			// Add water reading if available
			if (meterData.waterCurrentReading !== undefined) {
				const waterItem = bill.billItems?.find(item => 
					item.itemName?.toLowerCase().includes('nước') || 
					item.meterReading?.unit?.toLowerCase().includes('m3')
				);
				if (waterItem?.roomCostId) {
					meterReadings.push({
						roomCostId: waterItem.roomCostId,
						currentReading: meterData.waterCurrentReading,
						lastReading: meterData.waterLastReading || 0,
					});
				}
			}

			await updateMeterMutation.mutateAsync({
				billId: id,
				occupancyCount: meterData.occupancyCount || bill.occupancyCount || 1,
				meterData: meterReadings,
			});

			alert('Cập nhật số đồng hồ thành công!');
			navigate(`/invoices/${id}`);
		} catch (error) {
			console.error('Error updating meter data:', error);
			alert('Không thể cập nhật số đồng hồ. Vui lòng thử lại.');
		}
	};

	if (loading) {
		return (
			<Page className="bg-gray-50 flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
			</Page>
		);
	}

	if (!bill || user?.role !== 'landlord') {
		return (
			<Page className="bg-gray-50 flex items-center justify-center min-h-screen">
				<Box className="text-center">
					<p className="text-gray-500 mb-4">Không tìm thấy hóa đơn hoặc bạn không có quyền truy cập</p>
					<Button onClick={() => navigate('/invoices')}>Quay lại</Button>
				</Box>
			</Page>
		);
	}

	return (
		<Page className="bg-gray-50">
			<Box className="px-4 py-4">
				{/* Bill Info */}
				<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
					<h2 className="text-lg font-bold text-gray-900 mb-1">
						Hóa đơn tháng {bill.billingMonth}/{bill.billingYear}
					</h2>
					<p className="text-sm text-gray-600">
						{bill.rental?.roomInstance?.room?.name || 'Phòng không xác định'}
					</p>
				</div>

				{/* Electricity Meter */}
				<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
					<div className="flex items-center mb-3">
						<Icon icon="zi-setting" size={20} className="text-yellow-500 mr-2" />
						<h3 className="font-semibold text-gray-900">Số điện</h3>
					</div>
					
					<div className="space-y-3">
						<div>
							<label className="block text-sm text-gray-600 mb-1">
								Chỉ số cũ (kWh)
							</label>
							<Input
								type="number"
								value={meterData.electricityLastReading?.toString() || ''}
								onChange={(e) => handleInputChange('electricityLastReading', e.target.value)}
								placeholder="Nhập chỉ số cũ"
								className="w-full"
							/>
						</div>
						<div>
							<label className="block text-sm text-gray-600 mb-1">
								Chỉ số mới (kWh) <span className="text-red-500">*</span>
							</label>
							<Input
								type="number"
								value={meterData.electricityCurrentReading?.toString() || ''}
								onChange={(e) => handleInputChange('electricityCurrentReading', e.target.value)}
								placeholder="Nhập chỉ số mới"
								className="w-full"
							/>
						</div>
						{meterData.electricityLastReading !== undefined && 
						 meterData.electricityCurrentReading !== undefined && (
							<div className="bg-blue-50 p-3 rounded-lg">
								<p className="text-sm text-blue-800">
									Tiêu thụ: <span className="font-semibold">
										{(meterData.electricityCurrentReading - meterData.electricityLastReading).toFixed(2)} kWh
									</span>
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Water Meter */}
				<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
					<div className="flex items-center mb-3">
						<Icon icon="zi-location" size={20} className="text-blue-500 mr-2" />
						<h3 className="font-semibold text-gray-900">Số nước</h3>
					</div>
					
					<div className="space-y-3">
						<div>
							<label className="block text-sm text-gray-600 mb-1">
								Chỉ số cũ (m³)
							</label>
							<Input
								type="number"
								value={meterData.waterLastReading?.toString() || ''}
								onChange={(e) => handleInputChange('waterLastReading', e.target.value)}
								placeholder="Nhập chỉ số cũ"
								className="w-full"
							/>
						</div>
						<div>
							<label className="block text-sm text-gray-600 mb-1">
								Chỉ số mới (m³) <span className="text-red-500">*</span>
							</label>
							<Input
								type="number"
								value={meterData.waterCurrentReading?.toString() || ''}
								onChange={(e) => handleInputChange('waterCurrentReading', e.target.value)}
								placeholder="Nhập chỉ số mới"
								className="w-full"
							/>
						</div>
						{meterData.waterLastReading !== undefined && 
						 meterData.waterCurrentReading !== undefined && (
							<div className="bg-blue-50 p-3 rounded-lg">
								<p className="text-sm text-blue-800">
									Tiêu thụ: <span className="font-semibold">
										{(meterData.waterCurrentReading - meterData.waterLastReading).toFixed(2)} m³
									</span>
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Occupancy */}
				<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
					<div className="flex items-center mb-3">
						<Icon icon="zi-user" size={20} className="text-gray-500 mr-2" />
						<h3 className="font-semibold text-gray-900">Số người ở</h3>
					</div>
					
					<div>
						<label className="block text-sm text-gray-600 mb-1">
							Số lượng người ở trong kỳ
						</label>
						<Input
							type="number"
							value={meterData.occupancyCount?.toString() || ''}
							onChange={(e) => handleInputChange('occupancyCount', e.target.value)}
							placeholder="Nhập số người"
							className="w-full"
							min="1"
						/>
					</div>
				</div>

				{/* Submit Button */}
				<div className="space-y-3 mb-6">
					<Button
						fullWidth
						variant="primary"
						onClick={handleSubmit}
						disabled={updateMeterMutation.isPending || 
							(!meterData.electricityCurrentReading && !meterData.waterCurrentReading)}
					>
						{updateMeterMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật hóa đơn'}
					</Button>
					<Button
						fullWidth
						variant="secondary"
						onClick={() => navigate(`/invoices/${id}`)}
					>
						Hủy
					</Button>
				</div>

				{/* Info */}
				<div className="bg-yellow-50 p-3 rounded-lg mb-4">
					<div className="flex items-start">
						<Icon icon="zi-info-circle" size={16} className="text-yellow-600 mr-2 mt-0.5" />
						<div className="flex-1">
							<p className="text-xs text-yellow-800">
								Hóa đơn sẽ được tự động tính toán lại dựa trên số đồng hồ điện nước bạn nhập và các khoản phí khác.
							</p>
						</div>
					</div>
				</div>
			</Box>
		</Page>
	);
};

export default UpdateBillMeterPage;
