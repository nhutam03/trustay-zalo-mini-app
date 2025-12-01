import { apiClient, extractErrorMessage } from '@/lib/api-client';

// ========================
// Types for Verification
// ========================

export interface SendVerificationRequest {
	type: 'email' | 'phone';
	email?: string;
	phone?: string;
}

export interface SendVerificationResponse {
	message: string;
	verificationId: string;
	expiresInMinutes: number;
	remainingAttempts: number;
}

export interface VerifyCodeRequest {
	type: 'email' | 'phone';
	email?: string;
	phone?: string;
	code: string;
}

export interface VerifyCodeResponse {
	message: string;
}

// ========================
// Verification Service Functions
// ========================

/**
 * Send verification code to email or phone
 */
export const sendVerificationCode = async (
	request: SendVerificationRequest,
): Promise<SendVerificationResponse> => {
	try {
		const response = await apiClient.post<SendVerificationResponse>(
			'/api/verification/send',
			request,
		);
		return response.data;
	} catch (error) {
		console.error('Error sending verification code:', error);
		throw new Error(extractErrorMessage(error, 'Có lỗi xảy ra khi gửi mã xác thực'));
	}
};

/**
 * Verify the code sent to email or phone
 */
export const verifyCode = async (request: VerifyCodeRequest): Promise<VerifyCodeResponse> => {
	try {
		const response = await apiClient.post<VerifyCodeResponse>(
			'/api/verification/verify',
			request,
		);
		return response.data;
	} catch (error) {
		console.error('Error verifying code:', error);
		throw new Error(extractErrorMessage(error, 'Mã xác thực không chính xác'));
	}
};
