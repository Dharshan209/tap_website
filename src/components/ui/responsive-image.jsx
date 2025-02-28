import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';
import DefaultImage, { getDefaultImageSrc } from './default-image';

/**
 * ResponsiveImage - Enhanced image component with loading states, error handling, and progressive loading
 * 
 * Features:
 * - Loading animation
 * - Error state with fallback
 * - Lazy loading with option to prioritize
 * - Configurable blur-up effect
 * - Aspect ratio preservation
 * - Placeholder during loading
 */
const ResponsiveImage = ({
  src,
  alt,
  className,
  imgClassName,
  width,
  height,
  priority = false,
  placeholder = 'empty', // 'empty', 'blur', 'data', or a color like 'bg-primary/10'
  blurDataURL,
  aspectRatio,
  loadingIcon = true,
  fallbackSrc,
  fallbackType = 'image', // image, product, avatar, book
  objectFit = 'cover',
  onLoad,
  onError,
  ...props
}) => {
  const [loading, setLoading] = useState(!priority);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Reset loading state when src changes
  useEffect(() => {
    if (src) {
      setLoading(!priority);
      setError(false);
      setLoaded(false);
    }
  }, [src, priority]);

  // Handle load event
  const handleLoad = (e) => {
    setLoading(false);
    setLoaded(true);
    onLoad?.(e);
  };

  // Handle error event
  const handleError = (e) => {
    setLoading(false);
    setError(true);
    onError?.(e);
  };

  // Determine aspect ratio style based on props or defaults
  const aspectRatioStyle = aspectRatio
    ? { aspectRatio }
    : width && height
    ? { aspectRatio: `${width} / ${height}` }
    : {};

  // Get placeholder based on type
  const getPlaceholderStyles = () => {
    if (placeholder === 'blur' && blurDataURL) {
      return { backgroundImage: `url(${blurDataURL})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    } else if (placeholder === 'data' && props.blurDataURL) {
      return { backgroundImage: `url(${props.blurDataURL})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    } else if (placeholder.startsWith('bg-')) {
      return {}; // Will be handled by className
    }
    return {};
  };

  // Determine placeholder class
  const placeholderClass = placeholder.startsWith('bg-') 
    ? placeholder 
    : placeholder === 'empty' 
    ? 'bg-muted/50' 
    : '';

  return (
    <div
      className={cn(
        'overflow-hidden relative flex items-center justify-center',
        placeholderClass,
        className
      )}
      style={{
        ...aspectRatioStyle,
        ...getPlaceholderStyles()
      }}
      {...props}
    >
      {/* Loading animation */}
      {loading && loadingIcon && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20 z-10">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground/60" />
        </div>
      )}

      {/* Error state */}
      {error && !fallbackSrc && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/30 z-10">
          <DefaultImage type={fallbackType} size="medium" />
          <span className="text-xs text-muted-foreground mt-2">Failed to load image</span>
        </div>
      )}

      {/* Actual image */}
      {src && !error && (
        <img
          src={src}
          alt={alt || ''}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0',
            imgClassName
          )}
          style={{
            objectFit,
            width: '100%',
            height: '100%'
          }}
        />
      )}

      {/* Fallback image when error occurs */}
      {error && (
        <img
          src={fallbackSrc || getDefaultImageSrc(fallbackType)}
          alt={alt || 'Image fallback'}
          width={width}
          height={height}
          className={cn('w-full h-full object-cover', imgClassName)}
        />
      )}
    </div>
  );
};

export default ResponsiveImage;