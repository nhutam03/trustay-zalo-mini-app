import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	autoGenerateContract,
	getMyContracts,
	getContractById,
	requestSigningOTP,
	signContract,
	generateContractPDF,
	activateContract,
	deleteContract,
} from '@/services/contract-service';

// Query keys
export const contractKeys = {
	all: ['contracts'] as const,
	lists: () => [...contractKeys.all, 'list'] as const,
	list: (params?: Record<string, any>) => [...contractKeys.lists(), params] as const,
	details: () => [...contractKeys.all, 'detail'] as const,
	detail: (id: string) => [...contractKeys.details(), id] as const,
};

// Get my contracts
export const useMyContracts = (params?: { page?: number; limit?: number; status?: string }) => {
	return useQuery({
		queryKey: contractKeys.list(params),
		queryFn: () => getMyContracts(params),
		staleTime: 60 * 1000, // 1 minute
	});
};

// Get contract by ID
export const useContractById = (id: string | undefined) => {
	return useQuery({
		queryKey: contractKeys.detail(id || ''),
		queryFn: () => getContractById(id!),
		enabled: !!id,
		staleTime: 60 * 1000,
	});
};

// Auto-generate contract from rental
export const useAutoGenerateContract = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			rentalId,
			additionalContractData,
		}: {
			rentalId: string;
			additionalContractData?: string | object;
		}) => autoGenerateContract(rentalId, additionalContractData),
		onSuccess: () => {
			// Invalidate contracts list
			queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
		},
	});
};

// Request signing OTP
export const useRequestSigningOTP = () => {
	return useMutation({
		mutationFn: (contractId: string) => requestSigningOTP(contractId),
	});
};

// Sign contract
export const useSignContract = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			contractId,
			signatureData,
			otpCode,
		}: {
			contractId: string;
			signatureData: string;
			otpCode?: string;
		}) => signContract(contractId, signatureData, otpCode),
		onSuccess: (_, variables) => {
			// Invalidate the specific contract and contracts list
			queryClient.invalidateQueries({ queryKey: contractKeys.detail(variables.contractId) });
			queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
		},
	});
};

// Generate contract PDF
export const useGenerateContractPDF = () => {
	return useMutation({
		mutationFn: ({
			contractId,
			options,
		}: {
			contractId: string;
			options?: {
				includeSignatures?: boolean;
				format?: string;
				printBackground?: boolean;
			};
		}) => generateContractPDF(contractId, options),
	});
};

// Activate contract
export const useActivateContract = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (contractId: string) => activateContract(contractId),
		onSuccess: (_, contractId) => {
			// Invalidate the specific contract and contracts list
			queryClient.invalidateQueries({ queryKey: contractKeys.detail(contractId) });
			queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
		},
	});
};

// Delete contract
export const useDeleteContract = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (contractId: string) => deleteContract(contractId),
		onSuccess: () => {
			// Invalidate contracts list
			queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
		},
	});
};
