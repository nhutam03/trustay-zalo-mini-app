import { apiClient, extractErrorMessage } from '@/lib/api-client';

// ========================
// Types for Location
// ========================

export interface Province {
	id: number;
	name: string;
	code: string;
	nameEn?: string;
	fullName?: string;
	fullNameEn?: string;
	codeName?: string;
}

export interface District {
	id: number;
	provinceId: number;
	name: string;
	code?: string;
	nameEn?: string;
	fullName?: string;
	fullNameEn?: string;
	codeName?: string;
}

export interface Ward {
	id: number;
	districtId: number;
	name: string;
	code?: string;
	nameEn?: string;
	fullName?: string;
	fullNameEn?: string;
	codeName?: string;
}

// ========================
// Location Service Functions
// ========================

/**
 * Get all provinces in Vietnam
 */
export const getProvinces = async (): Promise<Province[]> => {
	try {
		const response = await apiClient.get<Province[]>('/api/provinces');
		return response.data;
	} catch (error) {
		console.error('Error getting provinces:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải danh sách tỉnh/thành phố'));
	}
};

/**
 * Get districts by province ID
 */
export const getDistrictsByProvince = async (provinceId: string | number): Promise<District[]> => {
	try {
		const response = await apiClient.get<District[]>(`/api/districts?provinceId=${provinceId}`);
		return response.data;
	} catch (error) {
		console.error('Error getting districts:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải danh sách quận/huyện'));
	}
};

/**
 * Get wards by district ID
 */
export const getWardsByDistrict = async (districtId: string | number): Promise<Ward[]> => {
	try {
		const response = await apiClient.get<Ward[]>(`/api/wards?districtId=${districtId}`);
		return response.data;
	} catch (error) {
		console.error('Error getting wards:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải danh sách phường/xã'));
	}
};

/**
 * Get district by ID
 */
export const getDistrictById = async (districtId: number): Promise<District> => {
	try {
		const response = await apiClient.get<District>(`/api/districts/${districtId}`);
		return response.data;
	} catch (error) {
		console.error('Error getting district by ID:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải thông tin quận/huyện'));
	}
};

/**
 * Get ward by ID
 */
export const getWardById = async (wardId: number): Promise<Ward> => {
	try {
		const response = await apiClient.get<Ward>(`/api/wards/${wardId}`);
		return response.data;
	} catch (error) {
		console.error('Error getting ward by ID:', error);
		throw new Error(extractErrorMessage(error, 'Không thể tải thông tin phường/xã'));
	}
};
