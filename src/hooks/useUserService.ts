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
};

export const usePrivateUserProfile = () => {
	return useQuery({
		queryKey: ['auth', 'me'],
		queryFn: () => getPrivateUserProfile(),
		staleTime: 5 * 60 * 1000, // 5 minutes
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
			// Invalidate current user query (from auth service)
			queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
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
			// Invalidate current user query
			queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
		},
	});
};

// Create address
export const useCreateAddress = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateAddressRequest) => createAddress(data),
		onSuccess: () => {
			// Invalidate current user query
			queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
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
			// Invalidate current user query
			queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
		},
	});
};

// Delete address
export const useDeleteAddress = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (addressId: string) => deleteAddress(addressId),
		onSuccess: () => {
			// Invalidate current user query
			queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
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
			// Invalidate current user query
			queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
		},
	});
};
