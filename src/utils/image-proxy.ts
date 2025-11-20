// Image proxy utility for Zalo Mini App compatibility
import { API_CONFIG } from "@/lib/api-client";

/**
 * Process image URL to work with Zalo Mini App
 * Handles CORS, referrer policy, and other compatibility issues
 */
export const processImageUrl = (imageUrl: string | undefined | null): string => {
  // Return placeholder if no image
  if (!imageUrl) {
    return "https://via.placeholder.com/400x300/f0f0f0/999999?text=No+Image";
  }

  // If it's already a valid external URL (not from our API), return as-is
  if (imageUrl.startsWith('http') && !imageUrl.includes('api.trustay.life')) {
    return imageUrl;
  }

  // If it's a relative path from our API, make it absolute
  if (imageUrl.startsWith('/images/') || !imageUrl.startsWith('http')) {
    const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/images/${imageUrl}`;
    return `${API_CONFIG.BASE_URL}${cleanPath}`;
  }

  // For our API images, we might need to proxy them through a service
  // or add specific parameters for Zalo Mini App compatibility
  if (imageUrl.includes('api.trustay.life')) {
    // Option 1: Add query parameters that help with Zalo Mini App
    const url = new URL(imageUrl);
    url.searchParams.set('zmp', '1'); // Mark as Zalo Mini App request
    url.searchParams.set('t', Date.now().toString()); // Cache busting
    return url.toString();
  }

  return imageUrl;
};

/**
 * Create optimized image URL with size parameters
 */
export const createOptimizedImageUrl = (
  imageUrl: string | undefined | null,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
  }
): string => {
  const processedUrl = processImageUrl(imageUrl);
  
  if (!options || !processedUrl.includes('api.trustay.life')) {
    return processedUrl;
  }

  const url = new URL(processedUrl);
  
  if (options.width) {
    url.searchParams.set('w', options.width.toString());
  }
  
  if (options.height) {
    url.searchParams.set('h', options.height.toString());
  }
  
  if (options.quality) {
    url.searchParams.set('q', options.quality.toString());
  }

  return url.toString();
};

/**
 * Fallback image component props
 */
export const getImageProps = (
  imageUrl: string | undefined | null,
  alt: string = "Image",
  options?: {
    width?: number;
    height?: number;
    quality?: number;
  }
) => {
  const src = createOptimizedImageUrl(imageUrl, options);
  
  return {
    src,
    alt,
    onError: (e: any) => {
      // Fallback to placeholder on error
      if (e.target && e.target.src !== "https://via.placeholder.com/400x300/f0f0f0/999999?text=Error") {
        e.target.src = "https://via.placeholder.com/400x300/f0f0f0/999999?text=Error";
      }
    },
    // Add attributes for better Zalo Mini App compatibility
    referrerPolicy: "no-referrer" as const,
  };
};