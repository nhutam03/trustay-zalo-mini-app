import React, { useEffect, useState } from 'react';
import { Page, Box, Input, Icon, Select } from 'zmp-ui';
import { useNavigate } from 'react-router-dom';
import BottomNav from '@/components/navigate-bottom';
import useSetHeader from '@/hooks/useSetHeader';
import { changeStatusBarColor } from '@/utils/basic';
import { createRoom, CreateRoomRequest } from '@/services/room';
import { useAuth } from '@/components/providers/auth-provider';

const { Option } = Select;

interface FormData extends CreateRoomRequest {
	buildingId?: string;
	images?: File[];
	imageUrls?: string[];
}

const PostRoomPage: React.FC = () => {
	const setHeader = useSetHeader();
	const navigate = useNavigate();
	const { user } = useAuth();
	const [currentStep, setCurrentStep] = useState(1);
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState<FormData>({
		name: '',
		roomType: 'single_room',
		areaSqm: 0,
		maxOccupancy: 1,
		description: '',
		basePriceMonthly: 0,
		depositAmount: 0,
		utilityIncluded: false,
		floorNumber: 1,
		buildingId: '',
		amenities: [],
		costs: [],
		rules: [],
	});

	useEffect(() => {
		setHeader({
			title: 'Đăng tin cho thuê',
			hasLeftIcon: true,
			type: 'primary',
		});
		changeStatusBarColor('primary');
	}, []);

	// Common amenities
	const commonAmenities = [
		{ id: 'ac', name: 'Máy lạnh', category: 'comfort' },
		{ id: 'fan', name: 'Quạt', category: 'comfort' },
		{ id: 'bed', name: 'Giường', category: 'furniture' },
		{ id: 'wardrobe', name: 'Tủ quần áo', category: 'furniture' },
		{ id: 'desk', name: 'Bàn làm việc', category: 'furniture' },
		{ id: 'wifi', name: 'Wifi', category: 'utilities' },
		{ id: 'water_heater', name: 'Máy nước nóng', category: 'utilities' },
		{ id: 'washing_machine', name: 'Máy giặt', category: 'utilities' },
		{ id: 'refrigerator', name: 'Tủ lạnh', category: 'appliances' },
		{ id: 'kitchen', name: 'Bếp', category: 'appliances' },
		{ id: 'parking', name: 'Chỗ đậu xe', category: 'facilities' },
		{ id: 'security', name: 'Bảo vệ 24/7', category: 'facilities' },
	];

	// Common costs
	const commonCosts = [
		{ name: 'Tiền điện', category: 'utilities', placeholder: 'VD: 3500' },
		{ name: 'Tiền nước', category: 'utilities', placeholder: 'VD: 20000' },
		{ name: 'Phí dịch vụ', category: 'service', placeholder: 'VD: 100000' },
		{ name: 'Phí internet', category: 'utilities', placeholder: 'VD: 100000' },
		{ name: 'Phí vệ sinh', category: 'service', placeholder: 'VD: 50000' },
	];

	// Common rules
	const commonRules = [
		{ id: 'no_pets', name: 'Không nuôi thú cưng', type: 'prohibition' },
		{ id: 'no_smoking', name: 'Không hút thuốc', type: 'prohibition' },
		{ id: 'quiet_hours', name: 'Giữ yên lặng sau 22h', type: 'time_restriction' },
		{ id: 'visitors', name: 'Hạn chế khách đến chơi', type: 'restriction' },
		{ id: 'cleaning', name: 'Giữ vệ sinh chung', type: 'responsibility' },
	];

	const roomTypes = [
		{ value: 'single_room', label: 'Phòng đơn' },
		{ value: 'shared_room', label: 'Phòng ở ghép' },
		{ value: 'studio', label: 'Phòng studio' },
		{ value: 'apartment', label: 'Căn hộ mini' },
	];

	const handleInputChange = (field: keyof FormData, value: any) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const toggleAmenity = (amenity: { id: string; name: string; category: string }) => {
		setFormData((prev) => {
			const exists = prev.amenities?.some((a) => a.name === amenity.name);
			if (exists) {
				return {
					...prev,
					amenities: prev.amenities?.filter((a) => a.name !== amenity.name),
				};
			} else {
				return {
					...prev,
					amenities: [...(prev.amenities || []), { name: amenity.name, category: amenity.category }],
				};
			}
		});
	};

	const addCost = (costName: string, value: number, category: string) => {
		if (value <= 0) return;
		setFormData((prev) => ({
			...prev,
			costs: [
				...(prev.costs || []),
				{
					name: costName,
					value: value,
					category: category,
				},
			],
		}));
	};

	const removeCost = (index: number) => {
		setFormData((prev) => ({
			...prev,
			costs: prev.costs?.filter((_, i) => i !== index),
		}));
	};

	const toggleRule = (rule: { id: string; name: string; type: string }) => {
		setFormData((prev) => {
			const exists = prev.rules?.some((r) => r.name === rule.name);
			if (exists) {
				return {
					...prev,
					rules: prev.rules?.filter((r) => r.name !== rule.name),
				};
			} else {
				return {
					...prev,
					rules: [
						...(prev.rules || []),
						{ name: rule.name, type: rule.type, isEnforced: true },
					],
				};
			}
		});
	};

	const validateStep = (step: number): boolean => {
		switch (step) {
			case 1:
				return !!(
					formData.name &&
					formData.roomType &&
					formData.areaSqm > 0 &&
					formData.basePriceMonthly > 0
				);
			case 2:
				return true; // Amenities are optional
			case 3:
				return true; // Rules are optional
			default:
				return true;
		}
	};

	const handleNext = () => {
		if (validateStep(currentStep)) {
			setCurrentStep((prev) => Math.min(prev + 1, 4));
		}
	};

	const handleBack = () => {
		setCurrentStep((prev) => Math.max(prev - 1, 1));
	};

	const handleSubmit = async () => {
		if (!formData.buildingId) {
			alert('Vui lòng nhập ID tòa nhà (buildingId)');
			return;
		}

		try {
			setLoading(true);
			const submitData: CreateRoomRequest = {
				name: formData.name,
				roomType: formData.roomType,
				areaSqm: Number(formData.areaSqm),
				maxOccupancy: Number(formData.maxOccupancy),
				description: formData.description,
				basePriceMonthly: Number(formData.basePriceMonthly),
				depositAmount: Number(formData.depositAmount),
				utilityIncluded: formData.utilityIncluded,
				floorNumber: Number(formData.floorNumber),
				amenities: formData.amenities,
				costs: formData.costs,
				rules: formData.rules,
			};

			await createRoom(formData.buildingId, submitData);
			alert('Đăng tin thành công!');
			navigate('/profile');
		} catch (error: any) {
			console.error('Error creating room:', error);
			alert(error.message || 'Có lỗi xảy ra khi đăng tin');
		} finally {
			setLoading(false);
		}
	};

	const renderStepIndicator = () => (
		<div className="flex items-center justify-center gap-2 mb-6">
			{[1, 2, 3, 4].map((step) => (
				<div key={step} className="flex items-center">
					<div
						className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
							step === currentStep
								? 'bg-primary text-white'
								: step < currentStep
									? 'bg-green-500 text-white'
									: 'bg-gray-200 text-gray-500'
						}`}
					>
						{step < currentStep ? '✓' : step}
					</div>
					{step < 4 && (
						<div
							className={`w-8 h-0.5 ${step < currentStep ? 'bg-green-500' : 'bg-gray-200'}`}
						/>
					)}
				</div>
			))}
		</div>
	);

	const renderStep1 = () => (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					ID Tòa nhà <span className="text-red-500">*</span>
				</label>
				<Input
					type="text"
					placeholder="Nhập ID tòa nhà"
					value={formData.buildingId}
					onChange={(e) => handleInputChange('buildingId', e.target.value)}
					className="w-full"
				/>
				<p className="text-xs text-gray-500 mt-1">Bạn cần có ID tòa nhà để tạo phòng</p>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Tên phòng <span className="text-red-500">*</span>
				</label>
				<Input
					type="text"
					placeholder="VD: Phòng trọ cao cấp gần trường ĐH"
					value={formData.name}
					onChange={(e) => handleInputChange('name', e.target.value)}
					className="w-full"
				/>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Loại phòng <span className="text-red-500">*</span>
				</label>
				<Select
					value={formData.roomType}
					onChange={(value) => handleInputChange('roomType', value)}
					className="w-full"
				>
					{roomTypes.map((type) => (
						<Option key={type.value} value={type.value} title={type.label} />
					))}
				</Select>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Diện tích (m²) <span className="text-red-500">*</span>
					</label>
					<Input
						type="number"
						placeholder="VD: 25"
						value={formData.areaSqm || ''}
						onChange={(e) => handleInputChange('areaSqm', parseFloat(e.target.value))}
						className="w-full"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">Số người tối đa</label>
					<Input
						type="number"
						placeholder="VD: 2"
						value={formData.maxOccupancy || ''}
						onChange={(e) => handleInputChange('maxOccupancy', parseInt(e.target.value))}
						className="w-full"
					/>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Giá thuê/tháng (VNĐ) <span className="text-red-500">*</span>
					</label>
					<Input
						type="number"
						placeholder="VD: 3000000"
						value={formData.basePriceMonthly || ''}
						onChange={(e) => handleInputChange('basePriceMonthly', parseFloat(e.target.value))}
						className="w-full"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">Tiền cọc (VNĐ)</label>
					<Input
						type="number"
						placeholder="VD: 3000000"
						value={formData.depositAmount || ''}
						onChange={(e) => handleInputChange('depositAmount', parseFloat(e.target.value))}
						className="w-full"
					/>
				</div>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">Tầng</label>
				<Input
					type="number"
					placeholder="VD: 2"
					value={formData.floorNumber || ''}
					onChange={(e) => handleInputChange('floorNumber', parseInt(e.target.value))}
					className="w-full"
				/>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
				<textarea
					placeholder="Mô tả chi tiết về phòng trọ của bạn..."
					value={formData.description}
					onChange={(e) => handleInputChange('description', e.target.value)}
					className="w-full p-3 border border-gray-300 rounded-lg min-h-[100px]"
				/>
			</div>
		</div>
	);

	const renderStep2 = () => (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold text-gray-900 mb-4">Tiện nghi & Chi phí</h3>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-3">Tiện nghi phòng</label>
				<div className="grid grid-cols-2 gap-3">
					{commonAmenities.map((amenity) => {
						const isSelected = formData.amenities?.some((a) => a.name === amenity.name);
						return (
							<button
								key={amenity.id}
								onClick={() => toggleAmenity(amenity)}
								className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
									isSelected
										? 'border-primary bg-blue-50 text-primary'
										: 'border-gray-200 bg-white text-gray-700 active:bg-gray-50'
								}`}
							>
								{amenity.name}
							</button>
						);
					})}
				</div>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-3">Chi phí phát sinh</label>
				{formData.costs && formData.costs.length > 0 && (
					<div className="mb-3 space-y-2">
						{formData.costs.map((cost, index) => (
							<div
								key={index}
								className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
							>
								<div>
									<p className="font-medium text-gray-900">{cost.name}</p>
									<p className="text-sm text-gray-600">
										{cost.value.toLocaleString('vi-VN')} đ/{cost.category === 'utilities' ? 'tháng' : 'lần'}
									</p>
								</div>
								<button
									onClick={() => removeCost(index)}
									className="text-red-500 p-2 active:opacity-70"
								>
									<Icon icon="zi-close" size={20} />
								</button>
							</div>
						))}
					</div>
				)}
				<div className="space-y-3">
					{commonCosts.map((cost, index) => (
						<div key={index} className="flex gap-2">
							<input
								type="number"
								placeholder={cost.placeholder}
								onBlur={(e) => {
									const value = parseFloat(e.target.value);
									if (value > 0) {
										addCost(cost.name, value, cost.category);
										e.target.value = '';
									}
								}}
								className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
							/>
							<span className="flex items-center text-sm text-gray-600 whitespace-nowrap">
								{cost.name}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);

	const renderStep3 = () => (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold text-gray-900 mb-4">Nội quy phòng</h3>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-3">Chọn nội quy</label>
				<div className="space-y-2">
					{commonRules.map((rule) => {
						const isSelected = formData.rules?.some((r) => r.name === rule.name);
						return (
							<button
								key={rule.id}
								onClick={() => toggleRule(rule)}
								className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
									isSelected
										? 'border-primary bg-blue-50'
										: 'border-gray-200 bg-white active:bg-gray-50'
								}`}
							>
								<div className="flex items-center justify-between">
									<span className={`font-medium ${isSelected ? 'text-primary' : 'text-gray-700'}`}>
										{rule.name}
									</span>
									{isSelected && <Icon icon="zi-check-circle-solid" className="text-primary" />}
								</div>
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);

	const renderStep4 = () => (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold text-gray-900 mb-4">Xem lại thông tin</h3>

			<div className="bg-gray-50 p-4 rounded-lg space-y-3">
				<div>
					<p className="text-sm text-gray-600">Tên phòng</p>
					<p className="font-medium text-gray-900">{formData.name}</p>
				</div>
				<div className="grid grid-cols-2 gap-4">
					<div>
						<p className="text-sm text-gray-600">Loại phòng</p>
						<p className="font-medium text-gray-900">
							{roomTypes.find((t) => t.value === formData.roomType)?.label}
						</p>
					</div>
					<div>
						<p className="text-sm text-gray-600">Diện tích</p>
						<p className="font-medium text-gray-900">{formData.areaSqm} m²</p>
					</div>
				</div>
				<div>
					<p className="text-sm text-gray-600">Giá thuê</p>
					<p className="font-medium text-primary text-lg">
						{formData.basePriceMonthly?.toLocaleString('vi-VN')} đ/tháng
					</p>
				</div>
				{formData.amenities && formData.amenities.length > 0 && (
					<div>
						<p className="text-sm text-gray-600 mb-2">Tiện nghi ({formData.amenities.length})</p>
						<div className="flex flex-wrap gap-2">
							{formData.amenities.map((amenity, index) => (
								<span
									key={index}
									className="px-2 py-1 bg-blue-100 text-primary text-xs rounded-full"
								>
									{amenity.name}
								</span>
							))}
						</div>
					</div>
				)}
				{formData.rules && formData.rules.length > 0 && (
					<div>
						<p className="text-sm text-gray-600 mb-2">Nội quy ({formData.rules.length})</p>
						<div className="space-y-1">
							{formData.rules.map((rule, index) => (
								<p key={index} className="text-sm text-gray-700">
									• {rule.name}
								</p>
							))}
						</div>
					</div>
				)}
			</div>

			<div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
				<div className="flex gap-2">
					<Icon icon="zi-info-circle" className="text-yellow-600 flex-shrink-0 mt-0.5" />
					<div className="text-sm text-yellow-800">
						<p className="font-medium mb-1">Lưu ý:</p>
						<p>
							Tin đăng sẽ được quản trị viên xem xét trước khi hiển thị công khai. Vui lòng
							đảm bảo thông tin chính xác và đầy đủ.
						</p>
					</div>
				</div>
			</div>
		</div>
	);

	return (
		<Page className="bg-gray-50 has-bottom-nav">
			<Box className="p-4 pb-24">
				{renderStepIndicator()}

				<div className="bg-white p-4 rounded-lg shadow-sm mb-4">
					{currentStep === 1 && renderStep1()}
					{currentStep === 2 && renderStep2()}
					{currentStep === 3 && renderStep3()}
					{currentStep === 4 && renderStep4()}
				</div>

				{/* Navigation buttons */}
				<div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 p-4">
					<div className="flex gap-3">
						{currentStep > 1 && (
							<button
								onClick={handleBack}
								className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium active:opacity-70"
							>
								Quay lại
							</button>
						)}
						{currentStep < 4 ? (
							<button
								onClick={handleNext}
								disabled={!validateStep(currentStep)}
								className="flex-1 py-3 bg-primary text-white rounded-lg font-medium active:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Tiếp theo
							</button>
						) : (
							<button
								onClick={handleSubmit}
								disabled={loading}
								className="flex-1 py-3 bg-primary text-white rounded-lg font-medium active:opacity-70 disabled:opacity-50"
							>
								{loading ? 'Đang đăng...' : 'Đăng tin'}
							</button>
						)}
					</div>
				</div>
			</Box>
			<BottomNav />
		</Page>
	);
};

export default PostRoomPage;
