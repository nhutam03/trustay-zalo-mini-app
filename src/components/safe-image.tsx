import React, { useState } from "react";
import { getImageProps } from "@/utils/image-proxy";

interface SafeImageProps {
  src: string | undefined | null;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Safe Image component that handles loading states and errors gracefully
 * Optimized for Zalo Mini App compatibility
 */
const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = "",
  width,
  height,
  quality = 75,
  onLoad,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const imageProps = getImageProps(src, alt, { width, height, quality });

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  return (
    <div className={`relative ${className}`}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-xs">Loading...</div>
        </div>
      )}
      
      <img
        {...imageProps}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onLoad={handleLoad}
        onError={(e) => {
          handleError();
          // Call the original onError from getImageProps if it exists
          if (imageProps.onError) {
            imageProps.onError(e);
          }
        }}
      />
    </div>
  );
};

export default SafeImage;