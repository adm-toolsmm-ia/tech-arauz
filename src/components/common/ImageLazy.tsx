/**
 * ImageLazy Component
 * Lazy loads images using Intersection Observer API
 */

'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ImageLazyProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
}

export function ImageLazy({
  src,
  alt,
  width,
  height,
  className,
  placeholder,
  onLoad,
}: ImageLazyProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [imageSrc, setImageSrc] = React.useState<string>(placeholder || '');
  const imgRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Load the actual image
          setImageSrc(src);
          observer.unobserve(entry.target);
          onLoad?.();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
      },
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [src, onLoad]);

  return (
    <div
      ref={imgRef}
      className={cn('relative overflow-hidden bg-muted', className)}
      style={{ aspectRatio: width && height ? width / height : 'auto' }}
    >
      {imageSrc && (
        <Image
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            'h-full w-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
          )}
          onLoadingComplete={() => setIsLoaded(true)}
          loading="lazy"
        />
      )}

      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </div>
  );
}
