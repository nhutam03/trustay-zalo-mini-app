import { useQuery } from '@tanstack/react-query';
import {
	getAmenities,
	getCostTypes,
	getRules,
	getAppEnums,
} from '@/services/reference-service';

// Query keys
export const referenceKeys = {
	all: ['reference'] as const,
	amenities: (category?: string) => [...referenceKeys.all, 'amenities', category] as const,
	costTypes: (category?: string) => [...referenceKeys.all, 'cost-types', category] as const,
	rules: (category?: string) => [...referenceKeys.all, 'rules', category] as const,
	enums: () => [...referenceKeys.all, 'enums'] as const,
};

// Get amenities
export const useAmenities = (category?: string) => {
	return useQuery({
		queryKey: referenceKeys.amenities(category),
		queryFn: () => getAmenities(category),
		staleTime: 24 * 60 * 60 * 1000, // 24 hours - reference data rarely changes
	});
};

// Get cost types
export const useCostTypes = (category?: string) => {
	return useQuery({
		queryKey: referenceKeys.costTypes(category),
		queryFn: () => getCostTypes(category),
		staleTime: 24 * 60 * 60 * 1000,
	});
};

// Get rules
export const useRules = (category?: string) => {
	return useQuery({
		queryKey: referenceKeys.rules(category),
		queryFn: () => getRules(category),
		staleTime: 24 * 60 * 60 * 1000,
	});
};

// Get app enums
export const useAppEnums = () => {
	return useQuery({
		queryKey: referenceKeys.enums(),
		queryFn: getAppEnums,
		staleTime: 24 * 60 * 60 * 1000,
	});
};
