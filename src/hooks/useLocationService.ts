import { useQuery } from '@tanstack/react-query';
import {
	getProvinces,
	getDistrictsByProvince,
	getWardsByDistrict,
	getDistrictById,
	getWardById,
} from '@/services/location-service';

// Query keys
export const locationKeys = {
	all: ['locations'] as const,
	provinces: () => [...locationKeys.all, 'provinces'] as const,
	districts: (provinceId?: string | number) => [...locationKeys.all, 'districts', provinceId] as const,
	wards: (districtId?: string | number) => [...locationKeys.all, 'wards', districtId] as const,
	districtDetail: (id: number) => [...locationKeys.all, 'district', id] as const,
	wardDetail: (id: number) => [...locationKeys.all, 'ward', id] as const,
};

// Get all provinces
export const useProvinces = () => {
	return useQuery({
		queryKey: locationKeys.provinces(),
		queryFn: getProvinces,
		staleTime: 24 * 60 * 60 * 1000, // 24 hours - location data rarely changes
	});
};

// Get districts by province
export const useDistricts = (provinceId?: string | number, enabled = true) => {
	return useQuery({
		queryKey: locationKeys.districts(provinceId),
		queryFn: () => getDistrictsByProvince(provinceId!),
		enabled: enabled && !!provinceId,
		staleTime: 24 * 60 * 60 * 1000,
	});
};

// Get wards by district
export const useWards = (districtId?: string | number, enabled = true) => {
	return useQuery({
		queryKey: locationKeys.wards(districtId),
		queryFn: () => getWardsByDistrict(districtId!),
		enabled: enabled && !!districtId,
		staleTime: 24 * 60 * 60 * 1000,
	});
};

// Get district by ID
export const useDistrict = (districtId: number, enabled = true) => {
	return useQuery({
		queryKey: locationKeys.districtDetail(districtId),
		queryFn: () => getDistrictById(districtId),
		enabled: enabled && !!districtId,
		staleTime: 24 * 60 * 60 * 1000,
	});
};

// Get ward by ID
export const useWard = (wardId: number, enabled = true) => {
	return useQuery({
		queryKey: locationKeys.wardDetail(wardId),
		queryFn: () => getWardById(wardId),
		enabled: enabled && !!wardId,
		staleTime: 24 * 60 * 60 * 1000,
	});
};
