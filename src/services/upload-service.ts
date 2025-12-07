import { apiClient } from '../lib/api-client';

// Upload response types
export interface UploadResponse {
	imagePath: string;
	savedToDb: boolean;
}

export interface BulkUploadResponse {
	results: Array<{
		imagePath: string;
		savedToDb: boolean;
	}>;
	total: number;
}

/**
 * Upload a single image file
 * @param file - The image file to upload
 * @param altText - Alt text for the image
 * @returns Promise<UploadResponse>
 */
export const uploadSingleImage = async (file: File, altText?: string): Promise<UploadResponse> => {
	try {
		const formData = new FormData();
		formData.append('file', file);
		if (altText) {
			formData.append('altText', altText);
		}

		const response = await apiClient.post<UploadResponse>('/api/upload', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});

		return response.data;
	} catch (error: unknown) {
		console.error('Failed to upload image:', error);
		throw new Error('Failed to upload image');
	}
};

/**
 * Upload multiple image files
 * @param files - Array of image files to upload
 * @param altTexts - Array of alt texts for the images (optional)
 * @returns Promise<BulkUploadResponse>
 */
export const uploadBulkImages = async (
	files: File[],
	altTexts?: string[],
): Promise<BulkUploadResponse> => {
	try {
		const formData = new FormData();

		// Append all files
		files.forEach((file) => {
			formData.append('files', file);
		});

		// Append each alt text as a separate array entry
		if (altTexts && altTexts.length > 0) {
			altTexts.forEach((altText) => {
				formData.append('altTexts[]', altText);
			});
		}

		const response = await apiClient.post<BulkUploadResponse>('/api/upload/bulk', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
			timeout: 60000, // 60 seconds for bulk upload (increased from default 10s)
		});

		return response.data;
	} catch (error: unknown) {
		console.error('Failed to upload images:', error);

		// Handle specific error types
		if (error && typeof error === 'object' && 'code' in error) {
			const axiosError = error as { code?: string; response?: { status?: number } };

			if (axiosError.code === 'ECONNABORTED') {
				throw new Error('TIMEOUT');
			}
			if (axiosError.response?.status === 413) {
				throw new Error('FILE_TOO_LARGE');
			}
		}

		throw new Error('UPLOAD_FAILED');
	}
};
