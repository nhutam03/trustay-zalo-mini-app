import { useMutation } from '@tanstack/react-query';
import { uploadSingleImage, uploadBulkImages, type UploadResponse, type BulkUploadResponse } from '@/services/upload-service';

/**
 * Hook for uploading a single image
 * @returns Mutation for uploading single image
 */
export const useUploadSingleImage = () => {
	return useMutation({
		mutationFn: ({ file, altText }: { file: File; altText?: string }) =>
			uploadSingleImage(file, altText),
	});
};

/**
 * Hook for uploading multiple images
 * @returns Mutation for uploading multiple images
 */
export const useUploadBulkImages = () => {
	return useMutation({
		mutationFn: ({ files, altTexts }: { files: File[]; altTexts?: string[] }) =>
			uploadBulkImages(files, altTexts),
	});
};
