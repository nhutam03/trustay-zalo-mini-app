import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	getPublicUserProfile,
	getPrivateUserProfile,
	updateUserProfile,
	changePassword,
	uploadAvatar,
	createAddress,
	updateAddress,
	deleteAddress,
	requestChangeEmail,
	confirmChangeEmail,
	type PublicUserProfile,
	type PrivateUserProfile,
	type UpdateProfileRequest,
	type ChangePasswordRequest,
	type CreateAddressRequest,
	type UpdateAddressRequest,
} from '@/services/user-service';

// Query keys
export const userKeys = {
	all: ['users'] as const,
	publicProfile: (userId: string) => [...userKeys.all, 'public', userId] as const,
	privateProfile: () => [...userKeys.all, 'private', 'me'] as const, // Riêng biệt với auth
};

// Get private user profile (FULL DATA - for Profile Page)
// AUTO-FETCH when component mounts
// API: /api/users/profile (full data)
export const usePrivateUserProfile = (options?: { enabled?: boolean }) => {
	return useQuery({
		queryKey: userKeys.privateProfile(),
		queryFn: () => getPrivateUserProfile(),
		staleTime: 5 * 60 * 1000, // 5 minutes
		enabled: options?.enabled ?? true, // Auto-fetch khi component mount, có thể override
		refetchOnMount: true, // Fetch lại mỗi khi vào page
		refetchOnWindowFocus: false, // Không fetch khi focus window
	});
}

// Get public user profile
export const usePublicUserProfile = (userId: string | undefined) => {
	return useQuery({
		queryKey: userKeys.publicProfile(userId || ''),
		queryFn: () => getPublicUserProfile(userId!),
		enabled: !!userId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};

// Update user profile
export const useUpdateUserProfile = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdateProfileRequest) => updateUserProfile(data),
		onSuccess: () => {
			// Invalidate cả auth và private profile
			queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
			queryClient.invalidateQueries({ queryKey: userKeys.privateProfile() });
		},
	});
};

// Change password
export const useChangePassword = () => {
	return useMutation({
		mutationFn: (data: ChangePasswordRequest) => changePassword(data),
	});
};

// Upload avatar
export const useUploadAvatar = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (file: File) => uploadAvatar(file),
		onSuccess: () => {
			// Invalidate cả auth và private profile
			queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
			queryClient.invalidateQueries({ queryKey: userKeys.privateProfile() });
		},
	});
};

// Create address
export const useCreateAddress = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateAddressRequest) => createAddress(data),
		onSuccess: () => {
			// Address chỉ ảnh hưởng private profile (không có trong auth/me)
			queryClient.invalidateQueries({ queryKey: userKeys.privateProfile() });
		},
	});
};

// Update address
export const useUpdateAddress = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ addressId, data }: { addressId: string; data: UpdateAddressRequest }) =>
			updateAddress(addressId, data),
		onSuccess: () => {
			// Address chỉ ảnh hưởng private profile
			queryClient.invalidateQueries({ queryKey: userKeys.privateProfile() });
		},
	});
};

// Delete address
export const useDeleteAddress = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (addressId: string) => deleteAddress(addressId),
		onSuccess: () => {
			// Address chỉ ảnh hưởng private profile
			queryClient.invalidateQueries({ queryKey: userKeys.privateProfile() });
		},
	});
};

// Request change email
export const useRequestChangeEmail = () => {
	return useMutation({
		mutationFn: (newEmail: string) => requestChangeEmail(newEmail),
	});
};

// Confirm change email
export const useConfirmChangeEmail = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ newEmail, otp }: { newEmail: string; otp: string }) =>
			confirmChangeEmail(newEmail, otp),
		onSuccess: () => {
			// Email change ảnh hưởng cả auth và profile
			queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
			queryClient.invalidateQueries({ queryKey: userKeys.privateProfile() });
		},
	});
};
