import React, { useEffect, useState } from 'react';
import { Page, Box, Icon, Button, Input, Select } from 'zmp-ui';
import { useNavigate } from 'react-router-dom';
import useSetHeader from '@/hooks/useSetHeader';
import { changeStatusBarColor } from '@/utils/basic';
import { useGenerateMonthlyBills, usePreviewBills } from '@/hooks/useBillService';
import { useAuth } from '@/components/providers/auth-provider';

const GenerateMonthlyBillsPage: React.FC = () => {
	const navigate = useNavigate();
	const setHeader = useSetHeader();
	const { user } = useAuth();

	// For now, use empty array - will be populated from landlord profile
	const buildings: any[] = [];

	const generateMutation = useGenerateMonthlyBills();
	const previewMutation = usePreviewBills();

	const currentDate = new Date();
	const [formData, setFormData] = useState({
		buildingId: '',
		billingMonth: currentDate.getMonth() + 1,
		billingYear: currentDate.getFullYear(),
	});

	const [previewData, setPreviewData] = useState<any>(null);
	const [showPreview, setShowPreview] = useState(false);

	useEffect(() => {
		setHeader({
			title: 'Tạo hóa đơn hàng tháng',
			hasLeftIcon: true,
			type: 'primary',
		});
		changeStatusBarColor('primary');
	}, []);

	useEffect(() => {
		// Auto-select first building if available
		if (buildings.length > 0 && !formData.buildingId) {
			setFormData(prev => ({ ...prev, buildingId: buildings[0].id }));
		}
	}, [buildings]);

	const handlePreview = async () => {
		if (!formData.buildingId) {
			alert('Vui lòng chọn tòa nhà');
			return;
		}

		try {
			const result = await previewMutation.mutateAsync({
				buildingId: formData.buildingId,
				billingMonth: formData.billingMonth,
				billingYear: formData.billingYear,
			});

			setPreviewData(result);
			setShowPreview(true);
		} catch (error) {
			console.error('Error previewing bills:', error);
			alert('Không thể xem trước hóa đơn. Vui lòng thử lại.');
		}
	};

	const handleGenerate = async () => {
		if (!formData.buildingId) {
			alert('Vui lòng chọn tòa nhà');
			return;
		}

		const confirmed = window.confirm(
			`Bạn có chắc chắn muốn tạo hóa đơn tháng ${formData.billingMonth}/${formData.billingYear} cho tòa nhà này?`
		);

		if (!confirmed) return;

		try {
			const result = await generateMutation.mutateAsync({
				buildingId: formData.buildingId,
				billingMonth: formData.billingMonth,
				billingYear: formData.billingYear,
			});

			alert(
				`Đã tạo thành công ${result.billsCreated} hóa đơn. ` +
				(result.billsExisted > 0 ? `Bỏ qua ${result.billsExisted} hóa đơn đã tồn tại.` : '')
			);
			navigate('/invoices');
		} catch (error) {
			console.error('Error generating bills:', error);
			alert('Không thể tạo hóa đơn. Vui lòng thử lại.');
		}
	};

	if (user?.role !== 'landlord') {
		return (
			<Page className="bg-gray-50 flex items-center justify-center min-h-screen">
				<Box className="text-center">
					<p className="text-gray-500 mb-4">Bạn không có quyền truy cập trang này</p>
					<Button onClick={() => navigate('/')}>Quay về trang chủ</Button>
				</Box>
			</Page>
		);
	}

	return (
		<Page className="bg-gray-50">
			<Box className="px-4 py-4">
				{/* Form */}
				<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
					<h3 className="font-semibold text-gray-900 mb-4">Thông tin hóa đơn</h3>

					<div className="space-y-4">
						{/* Building Selection */}
						<div>
							<label className="block text-sm text-gray-600 mb-2">
								Chọn tòa nhà <span className="text-red-500">*</span>
							</label>
							{buildings.length > 0 ? (
								<Select
									value={formData.buildingId}
									onChange={(value) => setFormData(prev => ({ ...prev, buildingId: value as string }))}
									className="w-full"
								>
									{buildings.map((building) => (
										<option key={building.id} value={building.id}>
											{building.name}
										</option>
									))}
								</Select>
							) : (
								<p className="text-sm text-gray-500">Bạn chưa có tòa nhà nào</p>
							)}
						</div>

						{/* Month Selection */}
						<div className="grid grid-cols-2 gap-3">
							<div>
								<label className="block text-sm text-gray-600 mb-2">
									Tháng <span className="text-red-500">*</span>
								</label>
								<Select
									value={formData.billingMonth}
									onChange={(value) => setFormData(prev => ({ ...prev, billingMonth: Number(value) }))}
									className="w-full"
								>
									{Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
										<option key={month} value={month}>
											Tháng {month}
										</option>
									))}
								</Select>
							</div>

							<div>
								<label className="block text-sm text-gray-600 mb-2">
									Năm <span className="text-red-500">*</span>
								</label>
								<Input
									type="number"
									value={formData.billingYear}
									onChange={(e) => setFormData(prev => ({ ...prev, billingYear: Number(e.target.value) }))}
									className="w-full"
									min="2020"
									max="2100"
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Info Card */}
				<div className="bg-blue-50 p-4 rounded-lg mb-4">
					<div className="flex items-start">
						<Icon icon="zi-info-circle" size={16} className="text-blue-600 mr-2 mt-0.5" />
						<div className="flex-1">
							<p className="text-sm text-blue-800 mb-2">
								<strong>Lưu ý:</strong>
							</p>
							<ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
								<li>Hệ thống sẽ tự động tạo hóa đơn cho tất cả các phòng đang có hợp đồng thuê</li>
								<li>Hóa đơn bao gồm tiền phòng và các dịch vụ theo cấu hình</li>
								<li>Bạn có thể xem trước trước khi tạo chính thức</li>
								<li>Các hóa đơn đã tồn tại sẽ được bỏ qua</li>
							</ul>
						</div>
					</div>
				</div>

				{/* Preview Data */}
				{showPreview && previewData && (
					<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
						<h3 className="font-semibold text-gray-900 mb-3">Xem trước</h3>
						
						<div className="space-y-3">
							<div className="flex justify-between items-center py-2 border-b">
								<span className="text-sm text-gray-600">Tổng số phòng:</span>
								<span className="text-sm font-semibold">{previewData.totalRooms || 0}</span>
							</div>
							<div className="flex justify-between items-center py-2 border-b">
								<span className="text-sm text-gray-600">Số hóa đơn sẽ tạo:</span>
								<span className="text-sm font-semibold text-green-600">{previewData.billCount || 0}</span>
							</div>
							<div className="flex justify-between items-center py-2 border-b">
								<span className="text-sm text-gray-600">Tổng tiền dự kiến:</span>
								<span className="text-sm font-semibold text-primary">
									{Number(previewData.totalAmount || 0).toLocaleString('vi-VN')} đ
								</span>
							</div>

							{previewData.bills && previewData.bills.length > 0 && (
								<div className="pt-3">
									<p className="text-xs text-gray-600 mb-2">Chi tiết theo phòng:</p>
									<div className="space-y-2 max-h-64 overflow-y-auto">
										{previewData.bills.map((bill: any, index: number) => (
											<div key={index} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded">
												<span className="text-gray-700">{bill.roomName || `Phòng ${index + 1}`}</span>
												<span className="font-medium">
													{Number(bill.totalAmount || 0).toLocaleString('vi-VN')} đ
												</span>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Actions */}
				<div className="space-y-3 mb-6">
					<Button
						fullWidth
						variant="secondary"
						onClick={handlePreview}
						disabled={previewMutation.isPending || !formData.buildingId}
					>
						{previewMutation.isPending ? 'Đang xử lý...' : 'Xem trước'}
					</Button>
					
					<Button
						fullWidth
						variant="primary"
						onClick={handleGenerate}
						disabled={generateMutation.isPending || !formData.buildingId}
					>
						{generateMutation.isPending ? 'Đang tạo...' : 'Tạo hóa đơn'}
					</Button>

					<Button
						fullWidth
						variant="tertiary"
						onClick={() => navigate('/invoices')}
					>
						Hủy
					</Button>
				</div>
			</Box>
		</Page>
	);
};

export default GenerateMonthlyBillsPage;
