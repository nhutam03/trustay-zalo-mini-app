import { apiClient, extractErrorMessage } from '@/lib/api-client';

// Types
export interface Contract {
	id: string;
	landlordId: string;
	tenantId: string;
	roomInstanceId: string;
	contractType: string;
	startDate: string;
	endDate: string;
	monthlyRent: number;
	depositAmount: number;
	status: 'draft' | 'pending_signatures' | 'active' | 'terminated' | 'expired';
	contractData?: Record<string, unknown>;
	createdAt: string;
	updatedAt: string;
	landlord?: {
		id: string;
		firstName: string;
		lastName: string;
		fullName: string;
		email: string;
		phone?: string;
	};
	tenant?: {
		id: string;
		firstName: string;
		lastName: string;
		fullName: string;
		email: string;
		phone?: string;
	};
	room?: {
		id: string;
		name: string;
		roomName: string;
		roomNumber: string;
		roomType: string;
		areaSqm: number;
		buildingName: string;
	};
}

export interface PaginatedContractResponse {
	data: Contract[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

// Auto-generate contract from rental (Landlord only)
export const autoGenerateContract = async (
	rentalId: string,
	additionalContractData?: string | object
): Promise<{ data: Contract }> => {
	try {
		let requestData = {};

		if (additionalContractData) {
			if (typeof additionalContractData === 'string') {
				try {
					requestData = JSON.parse(additionalContractData);
				} catch {
					requestData = { additionalTerms: additionalContractData };
				}
			} else {
				requestData = additionalContractData;
			}
		}

		const response = await apiClient.post<{ data: Contract }>(
			`/api/contracts/from-rental/${rentalId}`,
			requestData
		);
		return response.data;
	} catch (error) {
		console.error('Error auto-generating contract:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tạo hợp đồng tự động'));
	}
};

// Get contracts based on user role
export const getMyContracts = async (params?: {
	page?: number;
	limit?: number;
	status?: string;
}): Promise<PaginatedContractResponse> => {
	try {
		const queryParams = new URLSearchParams();
		if (params?.page) queryParams.append('page', String(params.page));
		if (params?.limit) queryParams.append('limit', String(params.limit));
		if (params?.status) queryParams.append('status', params.status);

		const endpoint = `/api/contracts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
		const response = await apiClient.get<Contract[] | PaginatedContractResponse>(endpoint);

		// Backend trả về array trực tiếp, cần wrap lại
		if (Array.isArray(response.data)) {
			return {
				data: response.data,
				meta: {
					total: response.data.length,
					page: params?.page || 1,
					limit: params?.limit || 10,
					totalPages: Math.ceil(response.data.length / (params?.limit || 10)),
				},
			};
		}
		return response.data as PaginatedContractResponse;
	} catch (error) {
		console.error('Error getting my contracts:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải danh sách hợp đồng'));
	}
};

// Get contract details by ID
export const getContractById = async (id: string): Promise<{ data: Contract }> => {
	try {
		const response = await apiClient.get<{ data: Contract }>(`/api/contracts/${id}`);
		return response.data;
	} catch (error) {
		console.error('Error getting contract by ID:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải chi tiết hợp đồng'));
	}
};

// Request OTP for contract signing
export const requestSigningOTP = async (contractId: string): Promise<{ message: string }> => {
	try {
		const response = await apiClient.post<{ message: string }>(
			`/api/contracts/${contractId}/send-otp`
		);
		return response.data;
	} catch (error) {
		console.error('Error requesting signing OTP:', error);
		throw new Error(extractErrorMessage(error, 'Không thể gửi mã OTP'));
	}
};

// Sign contract (Landlord or Tenant)
export const signContract = async (
	contractId: string,
	signatureData: string,
	otpCode?: string
): Promise<{ data: Contract }> => {
	try {
		const response = await apiClient.post<{ data: Contract }>(
			`/api/contracts/${contractId}/sign`,
			{
				signatureImage: signatureData,
				otpCode: otpCode || '123456',
			}
		);
		return response.data;
	} catch (error) {
		console.error('Error signing contract:', error);
		throw new Error(extractErrorMessage(error, 'Không thể ký hợp đồng'));
	}
};

// Generate contract PDF
export const generateContractPDF = async (
	contractId: string,
	options?: {
		includeSignatures?: boolean;
		format?: string;
		printBackground?: boolean;
	}
): Promise<{ pdfUrl?: string; downloadUrl?: string; hash?: string; message: string }> => {
	try {
		const response = await apiClient.post<{
			pdfUrl?: string;
			downloadUrl?: string;
			hash?: string;
			message: string;
		}>(`/api/contracts/${contractId}/pdf`, {
			includeSignatures: options?.includeSignatures ?? true,
			options: {
				format: options?.format || 'A4',
				printBackground: options?.printBackground ?? true,
			},
		});
		return response.data;
	} catch (error) {
		console.error('Error generating contract PDF:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tạo PDF hợp đồng'));
	}
};

// Activate contract
export const activateContract = async (contractId: string): Promise<{ data: Contract }> => {
	try {
		const response = await apiClient.post<{ data: Contract }>(
			`/api/contracts/${contractId}/activate`
		);
		return response.data;
	} catch (error) {
		console.error('Error activating contract:', error);
		throw new Error(extractErrorMessage(error, 'Không thể kích hoạt hợp đồng'));
	}
};

// Delete contract (Landlord only - draft status only)
export const deleteContract = async (contractId: string): Promise<{ message: string }> => {
	try {
		const response = await apiClient.delete<{ message: string }>(
			`/api/contracts/${contractId}`
		);
		return response.data;
	} catch (error) {
		console.error('Error deleting contract:', error);
		throw new Error(extractErrorMessage(error, 'Không thể xóa hợp đồng'));
	}
};
