import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	login,
	logout,
	getCurrentUser,
	isAuthenticated,
	checkAuthStatus,
	refreshToken,
	sendPhoneVerification,
	verifyPhoneCode,
	registerWithVerification,
	registerWithZaloToken,
	loginWithZaloToken,
	getZaloUserInfo,
	getZaloAccessToken,
	type UserProfile,
	type RegisterRequest,
	type AuthResponse,
} from '@/services/auth-service';

// Query keys
export const authKeys = {
	all: ['auth'] as const,
	me: () => [...authKeys.all, 'me'] as const,
	status: () => [...authKeys.all, 'status'] as const,
	zaloInfo: () => [...authKeys.all, 'zalo-info'] as const,
};

// Get current user
// CHÚ Ý: Hook này CHỈ nên dùng để lấy data từ cache (set bởi AuthProvider)
// KHÔNG tự động fetch để tránh race condition và request bị cancelled
export const useCurrentUser = () => {
	return useQuery({
		queryKey: authKeys.me(),
		queryFn: getCurrentUser,
		enabled: false, // DISABLE auto-fetch, chỉ lấy từ cache
		staleTime: Infinity, // Cache mãi mãi, chỉ invalidate khi logout/login
		retry: false,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});
};

// Check auth status
export const useAuthStatus = () => {
	return useQuery({
		queryKey: authKeys.status(),
		queryFn: checkAuthStatus,
		staleTime: 5 * 60 * 1000,
		retry: false,
	});
};

// Get Zalo user info
export const useZaloUserInfo = () => {
	return useQuery({
		queryKey: authKeys.zaloInfo(),
		queryFn: () => getZaloUserInfo(),
		enabled: false, // Only fetch when manually triggered
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};

// Login
export const useLogin = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ identifier, password }: { identifier: string; password: string }) =>
			login(identifier, password),
		onSuccess: (data) => {
			// Set current user in cache
			queryClient.setQueryData(authKeys.me(), data.user);
			queryClient.invalidateQueries({ queryKey: authKeys.status() });
		},
	});
};

// Login with Zalo token
export const useLoginWithZaloToken = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (accessToken: string) => loginWithZaloToken(accessToken),
		onSuccess: (data) => {
			queryClient.setQueryData(authKeys.me(), data.user);
			queryClient.invalidateQueries({ queryKey: authKeys.status() });
		},
	});
};

// Logout
export const useLogout = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: logout,
		onSuccess: () => {
			// Clear all auth-related cache
			queryClient.removeQueries({ queryKey: authKeys.all });
			queryClient.clear();
		},
	});
};

// Refresh token
export const useRefreshToken = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: refreshToken,
		onSuccess: (data) => {
			queryClient.setQueryData(authKeys.me(), data.user);
		},
	});
};

// Send phone verification
export const useSendPhoneVerification = () => {
	return useMutation({
		mutationFn: (phone: string) => sendPhoneVerification(phone),
	});
};

// Verify phone code
export const useVerifyPhoneCode = () => {
	return useMutation({
		mutationFn: ({ phone, code }: { phone: string; code?: string }) =>
			verifyPhoneCode(phone, code),
	});
};

// Register with verification
export const useRegisterWithVerification = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			userData,
			verificationToken,
		}: {
			userData: RegisterRequest;
			verificationToken: string;
		}) => registerWithVerification(userData, verificationToken),
		onSuccess: (data) => {
			queryClient.setQueryData(authKeys.me(), data.user);
			queryClient.invalidateQueries({ queryKey: authKeys.status() });
		},
	});
};

// Register with Zalo token
export const useRegisterWithZaloToken = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			accessToken,
			additionalData,
		}: {
			accessToken: string;
			additionalData?: {
				role?: 'tenant' | 'landlord';
				gender?: 'male' | 'female' | 'other';
			};
		}) => registerWithZaloToken(accessToken, additionalData),
		onSuccess: (data) => {
			queryClient.setQueryData(authKeys.me(), data.user);
			queryClient.invalidateQueries({ queryKey: authKeys.status() });
		},
	});
};
