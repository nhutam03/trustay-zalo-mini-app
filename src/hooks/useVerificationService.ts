import { useMutation } from '@tanstack/react-query';
import {
	sendVerificationCode,
	verifyCode,
} from '@/services/verification-service';
import type {
	SendVerificationRequest,
	VerifyCodeRequest,
} from '@/services/verification-service';

// Send verification code mutation
export const useSendVerificationCode = () => {
	return useMutation({
		mutationFn: (data: SendVerificationRequest) => sendVerificationCode(data),
	});
};

// Verify code mutation
export const useVerifyCode = () => {
	return useMutation({
		mutationFn: (data: VerifyCodeRequest) => verifyCode(data),
	});
};
