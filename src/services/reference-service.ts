import { apiClient, extractErrorMessage } from '@/lib/api-client';

// ========================
// Types for Reference Data
// ========================

export interface Amenity {
	id: string;
	name: string;
	category: string;
	description?: string;
	icon?: string;
	sortOrder?: number;
	isActive: boolean;
}

export interface CostType {
	id: string;
	name: string;
	category: string;
	unit?: string;
	description?: string;
	sortOrder?: number;
	isActive: boolean;
}

export interface Rule {
	id: string;
	name: string;
	type: string;
	category?: string;
	description?: string;
	sortOrder?: number;
	isActive: boolean;
}

export interface AppEnums {
	roomTypes: string[];
	roomStatuses: string[];
	contractStatuses: string[];
	billStatuses: string[];
	paymentMethods: string[];
	genders: string[];
	roles: string[];
	issueStatuses: string[];
	issuePriorities: string[];
	[key: string]: string[];
}

// ========================
// Reference Service Functions
// ========================

/**
 * Get all amenities with optional category filter
 */
export const getAmenities = async (category?: string): Promise<Amenity[]> => {
	try {
		const endpoint = category
			? `/api/reference/amenities?category=${category}`
			: '/api/reference/amenities';

		const response = await apiClient.get<Amenity[]>(endpoint);
		return response.data;
	} catch (error) {
		console.error('Error getting amenities:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải danh sách tiện ích'));
	}
};

/**
 * Get all cost types with optional category filter
 */
export const getCostTypes = async (category?: string): Promise<CostType[]> => {
	try {
		const endpoint = category
			? `/api/reference/cost-types?category=${category}`
			: '/api/reference/cost-types';

		const response = await apiClient.get<CostType[]>(endpoint);
		return response.data;
	} catch (error) {
		console.error('Error getting cost types:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải danh sách loại chi phí'));
	}
};

/**
 * Get all rules with optional category filter
 */
export const getRules = async (category?: string): Promise<Rule[]> => {
	try {
		const endpoint = category
			? `/api/reference/rules?category=${category}`
			: '/api/reference/rules';

		const response = await apiClient.get<Rule[]>(endpoint);
		return response.data;
	} catch (error) {
		console.error('Error getting rules:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải danh sách quy định'));
	}
};

/**
 * Get all application enums
 */
export const getAppEnums = async (): Promise<AppEnums> => {
	try {
		const response = await apiClient.get<AppEnums>('/api/reference/enums');
		return response.data;
	} catch (error) {
		console.error('Error getting app enums:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải danh sách enums'));
	}
};
