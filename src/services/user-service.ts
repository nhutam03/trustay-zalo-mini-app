import { apiClient, extractErrorMessage } from '@/lib/api-client';

// Types
export interface UpdateProfileRequest {
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string;
	gender?: 'male' | 'female' | 'other';
	dateOfBirth?: string;
	bio?: string;
	idCardNumber?: string;
	bankAccount?: string;
	bankName?: string;
}

export interface ChangePasswordRequest {
	oldPassword: string;
	newPassword: string;
}

export interface CreateAddressRequest {
	addressLine1: string;
	addressLine2?: string;
	provinceId: number;
	districtId: number;
	wardId?: number;
	isDefault?: boolean;
}

export interface UpdateAddressRequest {
	addressLine1?: string;
	addressLine2?: string;
	provinceId?: number;
	districtId?: number;
	wardId?: number;
	isDefault?: boolean;
}

export interface PublicUserProfile {
	id: string;
	firstName: string;
	lastName: string;
	avatarUrl?: string;
	bio?: string;
	role: 'tenant' | 'landlord';
	verifiedPhone: boolean;
	verifiedEmail: boolean;
	verifiedIdentity: boolean;
}

// Get public user profile by ID (no authentication required)
export const getPublicUserProfile = async (userId: string): Promise<PublicUserProfile> => {
	try {
		const response = await apiClient.get<PublicUserProfile>(
			`/api/users/public/${userId}`
		);
		return response.data;
	} catch (error) {
		console.error('Error getting public user profile:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải thông tin người dùng'));
	}
};

// Update user profile
export const updateUserProfile = async (
	profileData: UpdateProfileRequest
): Promise<void> => {
	try {
		await apiClient.put('/api/users/profile', profileData);
	} catch (error) {
		console.error('Error updating profile:', error);
		throw new Error(extractErrorMessage(error, 'Không thể cập nhật thông tin'));
	}
};

// Change user password
export const changePassword = async (
	passwordData: ChangePasswordRequest
): Promise<{ message: string }> => {
	try {
		const response = await apiClient.put<{ message: string }>(
			'/api/auth/change-password',
			passwordData
		);
		return response.data;
	} catch (error) {
		console.error('Error changing password:', error);
		throw new Error(extractErrorMessage(error, 'Không thể đổi mật khẩu'));
	}
};

// Upload user avatar
export const uploadAvatar = async (file: File): Promise<{ avatarUrl: string }> => {
	try {
		const formData = new FormData();
		formData.append('file', file);

		const response = await apiClient.put<{ avatarUrl: string }>(
			'/api/users/avatar',
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error('Error uploading avatar:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải ảnh đại diện'));
	}
};

// Create address
export const createAddress = async (
	addressData: CreateAddressRequest
): Promise<{ id: string; message: string }> => {
	try {
		const response = await apiClient.post<{ id: string; message: string }>(
			'/api/users/addresses',
			addressData
		);
		return response.data;
	} catch (error) {
		console.error('Error creating address:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tạo địa chỉ'));
	}
};

// Update address
export const updateAddress = async (
	addressId: string,
	addressData: UpdateAddressRequest
): Promise<{ message: string }> => {
	try {
		const response = await apiClient.put<{ message: string }>(
			`/api/users/addresses/${addressId}`,
			addressData
		);
		return response.data;
	} catch (error) {
		console.error('Error updating address:', error);
		throw new Error(extractErrorMessage(error, 'Không thể cập nhật địa chỉ'));
	}
};

// Delete address
export const deleteAddress = async (addressId: string): Promise<{ message: string }> => {
	try {
		const response = await apiClient.delete<{ message: string }>(
			`/api/users/addresses/${addressId}`
		);
		return response.data;
	} catch (error) {
		console.error('Error deleting address:', error);
		throw new Error(extractErrorMessage(error, 'Không thể xóa địa chỉ'));
	}
};

// Request change email - Step 1: Send OTP to new email
export const requestChangeEmail = async (newEmail: string): Promise<{ message: string }> => {
	try {
		const response = await apiClient.post<{ message: string }>(
			'/api/users/request-change-email',
			{ newEmail }
		);
		return response.data;
	} catch (error) {
		console.error('Error requesting change email:', error);
		throw new Error(extractErrorMessage(error, 'Không thể gửi yêu cầu đổi email'));
	}
};

// Confirm change email - Step 2: Verify OTP and update email
export const confirmChangeEmail = async (
	newEmail: string,
	otp: string
): Promise<{ message: string }> => {
	try {
		const response = await apiClient.post<{ message: string }>(
			'/api/users/confirm-change-email',
			{ newEmail, otp }
		);
		return response.data;
	} catch (error) {
		console.error('Error confirming change email:', error);
		throw new Error(extractErrorMessage(error, 'Không thể xác nhận đổi email'));
	}
};
