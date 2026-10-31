// src/components/OptimizedImage.jsx
import { useState, useEffect, useRef, useCallback } from 'react';

// Cache des images chargées
const imageCache = new Map();

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  fallback = null,
  lazy = true,
  width = null,
  height = null,
  objectFit = 'cover'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(!lazy);
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  // Vérifier si l'image est en cache
  const isInCache = useCallback(() => {
    return imageCache.has(src);
  }, [src]);

  // Charger l'image
  const loadImage = useCallback(() => {
    if (isInCache()) {
      setIsLoaded(true);
      return;
    }

    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      imageCache.set(src, img);
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      setHasError(true);
      setIsLoaded(true);
    };
  }, [src, isInCache]);

  // Observer pour le lazy loading
  useEffect(() => {
    if (!lazy) {
      loadImage();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            loadImage();
            observer.disconnect();
          }
        });
      },
      { 
        rootMargin: '50px',
        threshold: 0.01
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, loadImage]);

  // Précharger si déjà visible
  useEffect(() => {
    if (isVisible) {
      loadImage();
    }
  }, [isVisible, loadImage]);

  const imageSrc = hasError ? (fallback || '/placeholder.jpg') : src;

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ 
        minHeight: '50px',
        backgroundColor: '#f5f4f0',
        width: width || '100%',
        height: height || '100%',
      }}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#f5f4f0] via-[#e8e6e0] to-[#f5f4f0] animate-shimmer"></div>
      )}
      
      {isVisible && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          className={`w-full h-full transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            objectFit: objectFit,
            willChange: 'opacity',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            imageRendering: '-webkit-optimize-contrast',
          }}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
        />
      )}
    </div>
  );
};

export default OptimizedImage;