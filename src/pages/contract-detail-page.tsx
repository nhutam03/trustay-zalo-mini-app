import React, { useEffect, useState } from 'react';
import { Page, Box, Icon, Button } from 'zmp-ui';
import { useParams, useNavigate } from 'react-router-dom';
import useSetHeader from '@/hooks/useSetHeader';
import { changeStatusBarColor } from '@/utils/basic';
import { getContractById, generateContractPDF, signContract, requestSigningOTP } from '@/services/contract-service';
import { useAuth } from '@/components/providers/auth-provider';
import { Contract } from '@/interfaces/contract-interfaces';

const ContractDetailPage: React.FC = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const setHeader = useSetHeader();
	const { user } = useAuth();
	const [contract, setContract] = useState<Contract | null>(null);
	const [loading, setLoading] = useState(true);
	const [otpSent, setOtpSent] = useState(false);
	const [otpCode, setOtpCode] = useState('');
	const [actionLoading, setActionLoading] = useState(false);

	useEffect(() => {
		setHeader({
			title: 'Chi tiết hợp đồng',
			hasLeftIcon: true,
			type: 'primary',
		});
		changeStatusBarColor('primary');
	}, []);

	useEffect(() => {
		if (id) {
			loadContractDetails();
		}
	}, [id]);

	const loadContractDetails = async () => {
		try {
			setLoading(true);
			const contractData = await getContractById(id!);
			console.log('Contract loaded:', contractData);
			console.log('Contract status:', contractData?.status);
			console.log('Contract room:', contractData?.room);
			console.log('Contract landlord:', contractData?.landlord);
			console.log('Contract tenant:', contractData?.tenant);
			setContract(contractData);
		} catch (error) {
			console.error('Error loading contract details:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleDownloadPDF = async () => {
		try {
			setActionLoading(true);
			const result = await generateContractPDF(id!);
			if (result.pdfUrl) {
				window.open(result.pdfUrl, '_blank');
			}
		} catch (error) {
			console.error('Error generating PDF:', error);
		} finally {
			setActionLoading(false);
		}
	};

	const handleRequestOTP = async () => {
		try {
			setActionLoading(true);
			await requestSigningOTP(id!);
			setOtpSent(true);
			alert('Mã OTP đã được gửi đến email của bạn');
		} catch (error) {
			console.error('Error requesting OTP:', error);
			alert('Không thể gửi mã OTP');
		} finally {
			setActionLoading(false);
		}
	};

	const handleSign = async () => {
		if (!otpCode) {
			alert('Vui lòng nhập mã OTP');
			return;
		}
		try {
			setActionLoading(true);
			await signContract(id!, 'signature-data', otpCode);
			alert('Ký hợp đồng thành công');
			loadContractDetails();
		} catch (error) {
			console.error('Error signing contract:', error);
			alert('Không thể ký hợp đồng');
		} finally {
			setActionLoading(false);
		}
	};

	const getStatusBadge = (status: string) => {
		const statusConfig: Record<string, { text: string; color: string }> = {
			draft: { text: 'Nháp', color: 'bg-gray-100 text-gray-800' },
			pending_signatures: { text: 'Chờ ký', color: 'bg-yellow-100 text-yellow-800' },
			partially_signed: { text: 'Chờ ký (đã ký 1 bên)', color: 'bg-blue-100 text-blue-800' },
			active: { text: 'Đang hiệu lực', color: 'bg-green-100 text-green-800' },
			terminated: { text: 'Đã chấm dứt', color: 'bg-red-100 text-red-800' },
			expired: { text: 'Hết hạn', color: 'bg-gray-100 text-gray-600' },
		};

		const config = statusConfig[status] || statusConfig.draft;
		return (
			<span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
				{config.text}
			</span>
		);
	};

	if (loading) {
		return (
			<Page className="bg-gray-50 flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
			</Page>
		);
	}

	console.log('Rendering with contract:', contract);

	if (!contract) {
		return (
			<Page className="bg-gray-50 flex items-center justify-center min-h-screen">
				<Box className="text-center">
					<p className="text-gray-500 mb-4">Không tìm thấy hợp đồng</p>
					<Button onClick={() => navigate('/contracts')}>Quay lại</Button>
				</Box>
			</Page>
		);
	}

	// Lấy data từ contractData
	const monthlyRent = (contract.contractData as any)?.financial?.monthlyRent || (contract.contractData as any)?.monthlyRent || contract.monthlyRent;
	const depositAmount = (contract.contractData as any)?.financial?.deposit || (contract.contractData as any)?.depositAmount || contract.depositAmount;

	// Kiểm tra user hiện tại đã ký chưa
	const userRole = user?.id === contract.landlord?.id ? 'landlord' : user?.id === contract.tenant?.id ? 'tenant' : null;
	const signatures = (contract as any).signatures || [];
	const hasUserSigned = signatures.some((sig: any) => sig.signerRole === userRole);

	console.log('User role:', userRole);
	console.log('Signatures:', signatures);
	console.log('Has user signed:', hasUserSigned);

	return (
		<Page className="bg-gray-50">
			<Box className="px-4 py-4">
				{/* Header Card */}
				<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
					<div className="flex justify-between items-start mb-3">
						<div className="flex-1">
							<h2 className="text-lg font-bold text-gray-900 mb-1">
								{contract.room?.roomName || contract.room?.name || 'Phòng không xác định'}
							</h2>
							<p className="text-sm text-gray-600">{contract.room?.buildingName}</p>
						</div>
						{getStatusBadge(contract.status)}
					</div>

					<div className="space-y-2">
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
									Tiền thuê: {Number(monthlyRent).toLocaleString('vi-VN')} đ/tháng
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
				</div>

				{/* Landlord Info */}
				{contract.landlord && (
					<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
						<h3 className="font-semibold text-gray-900 mb-3">Thông tin chủ nhà</h3>
						<div className="space-y-2">
							<div className="flex items-center">
								<Icon icon="zi-user" size={16} className="text-gray-400 mr-2" />
								<span className="text-sm text-gray-600">
									{contract.landlord.fullName || `${contract.landlord.firstName} ${contract.landlord.lastName}`}
								</span>
							</div>
							<div className="flex items-center">
								<Icon icon="zi-chat" size={16} className="text-gray-400 mr-2" />
								<span className="text-sm text-gray-600">{contract.landlord.email}</span>
							</div>
							{contract.landlord.phone && (
								<div className="flex items-center">
									<Icon icon="zi-call" size={16} className="text-gray-400 mr-2" />
									<span className="text-sm text-gray-600">{contract.landlord.phone}</span>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Tenant Info */}
				{contract.tenant && (
					<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
						<h3 className="font-semibold text-gray-900 mb-3">Thông tin người thuê</h3>
						<div className="space-y-2">
							<div className="flex items-center">
								<Icon icon="zi-user" size={16} className="text-gray-400 mr-2" />
								<span className="text-sm text-gray-600">
									{contract.tenant.fullName || `${contract.tenant.firstName} ${contract.tenant.lastName}`}
								</span>
							</div>
							<div className="flex items-center">
								<Icon icon="zi-chat" size={16} className="text-gray-400 mr-2" />
								<span className="text-sm text-gray-600">{contract.tenant.email}</span>
							</div>
							{contract.tenant.phone && (
								<div className="flex items-center">
									<Icon icon="zi-call" size={16} className="text-gray-400 mr-2" />
									<span className="text-sm text-gray-600">{contract.tenant.phone}</span>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Room Details */}
				{contract.room && (
					<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
						<h3 className="font-semibold text-gray-900 mb-3">Chi tiết phòng</h3>
						<div className="space-y-2">
							{contract.room.roomType && (
								<div className="flex justify-between text-sm">
									<span className="text-gray-600">Loại phòng:</span>
									<span className="font-medium text-gray-900">{contract.room.roomType}</span>
								</div>
							)}
							{contract.room.roomNumber && (
								<div className="flex justify-between text-sm">
									<span className="text-gray-600">Số phòng:</span>
									<span className="font-medium text-gray-900">{contract.room.roomNumber}</span>
								</div>
							)}
							{contract.room.areaSqm && (
								<div className="flex justify-between text-sm">
									<span className="text-gray-600">Diện tích:</span>
									<span className="font-medium text-gray-900">{contract.room.areaSqm} m²</span>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Financial Details */}
				{(contract.contractData as any)?.financial && (
					<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
						<h3 className="font-semibold text-gray-900 mb-3">Thông tin tài chính</h3>
						<div className="space-y-2">
							{(contract.contractData as any).financial.monthlyRent && (
								<div className="flex justify-between text-sm">
									<span className="text-gray-600">Tiền thuê hàng tháng:</span>
									<span className="font-medium text-gray-900">
										{Number((contract.contractData as any).financial.monthlyRent).toLocaleString('vi-VN')} đ
									</span>
								</div>
							)}
							{(contract.contractData as any).financial.deposit && (
								<div className="flex justify-between text-sm">
									<span className="text-gray-600">Tiền đặt cọc:</span>
									<span className="font-medium text-gray-900">
										{Number((contract.contractData as any).financial.deposit).toLocaleString('vi-VN')} đ
										{(contract.contractData as any).financial.depositMonths &&
											` (${(contract.contractData as any).financial.depositMonths} tháng)`
										}
									</span>
								</div>
							)}
							{(contract.contractData as any).financial.electricityPrice && (
								<div className="flex justify-between text-sm">
									<span className="text-gray-600">Giá điện:</span>
									<span className="font-medium text-gray-900">
										{Number((contract.contractData as any).financial.electricityPrice).toLocaleString('vi-VN')} đ/kWh
									</span>
								</div>
							)}
							{(contract.contractData as any).financial.waterPrice && (
								<div className="flex justify-between text-sm">
									<span className="text-gray-600">Giá nước:</span>
									<span className="font-medium text-gray-900">
										{Number((contract.contractData as any).financial.waterPrice).toLocaleString('vi-VN')} đ/m³
									</span>
								</div>
							)}
							{(contract.contractData as any).financial.paymentMethod && (
								<div className="flex justify-between text-sm">
									<span className="text-gray-600">Phương thức thanh toán:</span>
									<span className="font-medium text-gray-900">
										{(contract.contractData as any).financial.paymentMethod}
									</span>
								</div>
							)}
							{(contract.contractData as any).financial.paymentDueDate && (
								<div className="flex justify-between text-sm">
									<span className="text-gray-600">Hạn thanh toán:</span>
									<span className="font-medium text-gray-900">
										Ngày {(contract.contractData as any).financial.paymentDueDate} hàng tháng
									</span>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Terms and Conditions */}
				{(contract.contractData as any)?.terms && (
					<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
						<h3 className="font-semibold text-gray-900 mb-3">Điều khoản hợp đồng</h3>

						{/* Utilities */}
						{(contract.contractData as any).terms.utilities?.length > 0 && (
							<div className="mb-4">
								<p className="text-sm font-medium text-gray-700 mb-2">Tiện ích:</p>
								<div className="flex flex-wrap gap-2">
									{(contract.contractData as any).terms.utilities.map((utility: string, index: number) => (
										<span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
											{utility}
										</span>
									))}
								</div>
							</div>
						)}

						{/* Rules */}
						{(contract.contractData as any).terms.rules?.length > 0 && (
							<div className="mb-4">
								<p className="text-sm font-medium text-gray-700 mb-2">Quy định:</p>
								<ul className="space-y-1">
									{(contract.contractData as any).terms.rules.map((rule: string, index: number) => (
										<li key={index} className="flex items-start text-sm text-gray-600">
											<Icon icon="zi-check-circle" size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
											<span>{rule}</span>
										</li>
									))}
								</ul>
							</div>
						)}

						{/* Restrictions */}
						{(contract.contractData as any).terms.restrictions?.length > 0 && (
							<div className="mb-4">
								<p className="text-sm font-medium text-gray-700 mb-2">Hạn chế:</p>
								<ul className="space-y-1">
									{(contract.contractData as any).terms.restrictions.map((restriction: string, index: number) => (
										<li key={index} className="flex items-start text-sm text-gray-600">
											<Icon icon="zi-close-circle" size={16} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
											<span>{restriction}</span>
										</li>
									))}
								</ul>
							</div>
						)}
					</div>
				)}

				{/* Responsibilities */}
				{(contract.contractData as any)?.terms?.responsibilities && (
					<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
						<h3 className="font-semibold text-gray-900 mb-3">Trách nhiệm hai bên</h3>

						{/* Landlord Responsibilities */}
						{((contract.contractData as any).terms.responsibilities.landlord?.length > 0 ||
						  (contract.contractData as any).terms.landlordResponsibilities?.length > 0) && (
							<div className="mb-4">
								<p className="text-sm font-medium text-gray-700 mb-2">Chủ nhà:</p>
								<ul className="space-y-1">
									{((contract.contractData as any).terms.responsibilities.landlord ||
									  (contract.contractData as any).terms.landlordResponsibilities).map((resp: string, index: number) => (
										<li key={index} className="flex items-start text-sm text-gray-600">
											<span className="text-primary mr-2 flex-shrink-0">•</span>
											<span>{resp}</span>
										</li>
									))}
								</ul>
							</div>
						)}

						{/* Tenant Responsibilities */}
						{((contract.contractData as any).terms.responsibilities.tenant?.length > 0 ||
						  (contract.contractData as any).terms.tenantResponsibilities?.length > 0) && (
							<div>
								<p className="text-sm font-medium text-gray-700 mb-2">Người thuê:</p>
								<ul className="space-y-1">
									{((contract.contractData as any).terms.responsibilities.tenant ||
									  (contract.contractData as any).terms.tenantResponsibilities).map((resp: string, index: number) => (
										<li key={index} className="flex items-start text-sm text-gray-600">
											<span className="text-primary mr-2 flex-shrink-0">•</span>
											<span>{resp}</span>
										</li>
									))}
								</ul>
							</div>
						)}
					</div>
				)}

				{/* Contract Timeline */}
				<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
					<h3 className="font-semibold text-gray-900 mb-3">Thời gian</h3>
					<div className="space-y-3">
						<div>
							<p className="text-xs text-gray-500 mb-1">Ngày tạo</p>
							<p className="text-sm text-gray-900">
								{new Date(contract.createdAt).toLocaleString('vi-VN')}
							</p>
						</div>
						<div>
							<p className="text-xs text-gray-500 mb-1">Cập nhật lần cuối</p>
							<p className="text-sm text-gray-900">
								{new Date(contract.updatedAt).toLocaleString('vi-VN')}
							</p>
						</div>
						{(contract as any).signedAt && (
							<div>
								<p className="text-xs text-gray-500 mb-1">Ngày ký</p>
								<p className="text-sm text-gray-900">
									{new Date((contract as any).signedAt).toLocaleString('vi-VN')}
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Signature Status */}
				<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
					<h3 className="font-semibold text-gray-900 mb-3">Trạng thái ký</h3>
					<div className="space-y-2">
						{contract.landlord && (
							<div className="flex items-center justify-between">
								<div className="flex items-center">
									<Icon icon="zi-user" size={16} className="text-gray-400 mr-2" />
									<span className="text-sm text-gray-600">Chủ nhà</span>
								</div>
								{signatures.some((sig: any) => sig.signerRole === 'landlord') ? (
									<span className="flex items-center text-sm text-green-600">
										<Icon icon="zi-check-circle-solid" size={16} className="mr-1" />
										Đã ký
									</span>
								) : (
									<span className="text-sm text-yellow-600">Chưa ký</span>
								)}
							</div>
						)}
						{contract.tenant && (
							<div className="flex items-center justify-between">
								<div className="flex items-center">
									<Icon icon="zi-user" size={16} className="text-gray-400 mr-2" />
									<span className="text-sm text-gray-600">Người thuê</span>
								</div>
								{signatures.some((sig: any) => sig.signerRole === 'tenant') ? (
									<span className="flex items-center text-sm text-green-600">
										<Icon icon="zi-check-circle-solid" size={16} className="mr-1" />
										Đã ký
									</span>
								) : (
									<span className="text-sm text-yellow-600">Chưa ký</span>
								)}
							</div>
						)}
					</div>
				</div>

				{/* Actions */}
				<div className="space-y-3 mb-6">
					{/* Chỉ hiển thị nút ký nếu: chưa ký và status đang chờ ký */}
					{!hasUserSigned && (contract.status === 'pending_signatures' || contract.status === 'partially_signed') && (
						<>
							{!otpSent ? (
								<Button
									fullWidth
									variant="primary"
									onClick={handleRequestOTP}
									disabled={actionLoading}
								>
									{actionLoading ? 'Đang gửi...' : 'Gửi mã OTP để ký'}
								</Button>
							) : (
								<>
									<input
										type="text"
										placeholder="Nhập mã OTP"
										value={otpCode}
										onChange={(e) => setOtpCode(e.target.value)}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg"
									/>
									<Button
										fullWidth
										variant="primary"
										onClick={handleSign}
										disabled={actionLoading || !otpCode}
									>
										{actionLoading ? 'Đang ký...' : 'Ký hợp đồng'}
									</Button>
								</>
							)}
						</>
					)}
					{hasUserSigned && (contract.status === 'pending_signatures' || contract.status === 'partially_signed') && (
						<div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
							<Icon icon="zi-check-circle-solid" size={24} className="text-green-600 mb-1" />
							<p className="text-sm text-green-700 font-medium">Bạn đã ký hợp đồng này</p>
							<p className="text-xs text-green-600 mt-1">Đang chờ bên còn lại ký</p>
						</div>
					)}
					<Button
						fullWidth
						variant="secondary"
						onClick={handleDownloadPDF}
						disabled={actionLoading}
					>
						<Icon icon="zi-download" className="mr-2" />
						{actionLoading ? 'Đang tạo...' : 'Tải xuống PDF'}
					</Button>
				</div>
			</Box>
		</Page>
	);
};

export default ContractDetailPage;
