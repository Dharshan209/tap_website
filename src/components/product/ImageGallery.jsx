import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut, Maximize, Minimize } from 'lucide-react';

const ImageGallery = ({ images, onClose, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isMaxZoomed, setIsMaxZoomed] = useState(false);
  
  // Initialize with the right image
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          navigateGallery('prev');
          break;
        case 'ArrowRight':
          navigateGallery('next');
          break;
        case 'Escape':
          if (isFullscreen) {
            exitFullscreen();
          } else {
            onClose();
          }
          break;
        case 'f':
          toggleFullscreen();
          break;
        case '+':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, images.length, isFullscreen, zoomLevel, onClose]);
  
  // Navigate to previous or next image
  const navigateGallery = (direction) => {
    // Reset zoom when changing images
    if (zoomLevel !== 1) {
      setZoomLevel(1);
      setIsMaxZoomed(false);
    }
    
    if (direction === 'prev') {
      setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    } else {
      setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    }
  };
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };
  
  // Enter fullscreen mode
  const enterFullscreen = () => {
    const element = document.documentElement;
    
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
    
    setIsFullscreen(true);
  };
  
  // Exit fullscreen mode
  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    
    setIsFullscreen(false);
  };
  
  // Zoom functions with improved user experience
  const zoomIn = () => {
    if (zoomLevel < 3) {
      setZoomLevel(prev => {
        const newZoom = Math.min(3, prev + 0.5);
        setIsMaxZoomed(newZoom >= 3);
        return newZoom;
      });
    }
  };
  
  const zoomOut = () => {
    if (zoomLevel > 1) {
      setZoomLevel(prev => {
        const newZoom = Math.max(1, prev - 0.5);
        setIsMaxZoomed(false);
        return newZoom;
      });
    }
  };
  
  // Download current image
  const downloadImage = () => {
    const currentImage = images[currentIndex];
    
    // Use storage URL if available, otherwise use preview
    const imageUrl = currentImage.storageUrl || currentImage.preview;
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = currentImage.name || `artwork-${currentIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Current image
  const currentImage = images[currentIndex];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      {/* Overlay */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      />
      
      {/* Main content */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {/* Top toolbar */}
        <div className="flex items-center justify-between p-4 bg-black/30 backdrop-blur-sm">
          <div className="text-white">
            <h3 className="text-lg font-medium">
              {currentImage?.name || `Image ${currentIndex + 1} of ${images.length}`}
            </h3>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Download button */}
            <button
              onClick={downloadImage}
              className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
              aria-label="Download image"
            >
              <Download className="h-5 w-5" />
            </button>
            
            {/* Zoom buttons */}
            <button
              onClick={zoomOut}
              disabled={zoomLevel <= 1}
              className={`p-2 rounded-full hover:bg-white/10 text-white transition-colors ${
                zoomLevel <= 1 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              aria-label="Zoom out"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            
            <button
              onClick={zoomIn}
              disabled={isMaxZoomed}
              className={`p-2 rounded-full hover:bg-white/10 text-white transition-colors ${
                isMaxZoomed ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              aria-label="Zoom in"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            
            {/* Fullscreen button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </button>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
              aria-label="Close gallery"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Image container */}
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-full max-h-full flex items-center justify-center"
              style={{
                cursor: zoomLevel > 1 ? 'move' : 'auto',
              }}
            >
              <img
                src={currentImage?.storageUrl || currentImage?.preview}
                alt={currentImage?.name || `Artwork ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain transition-transform duration-300"
                style={{
                  transform: `scale(${zoomLevel})`,
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => navigateGallery('prev')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            <button
              onClick={() => navigateGallery('next')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
        
        {/* Bottom toolbar with thumbnails */}
        <div className="p-3 bg-black/30 backdrop-blur-sm overflow-x-auto">
          <div className="flex space-x-2 justify-center">
            {images.map((image, index) => (
              <button
                key={image.id || index}
                onClick={() => setCurrentIndex(index)}
                className={`relative h-16 w-16 flex-shrink-0 rounded overflow-hidden border-2 transition-colors ${
                  index === currentIndex ? 'border-primary' : 'border-transparent hover:border-white/50'
                }`}
              >
                <img
                  src={image.storageUrl || image.preview}
                  alt={`Thumbnail ${index + 1}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    console.warn(`Failed to load thumbnail: ${index + 1}`);
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjgwIiB5PSI4MCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzg4OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgYWxpZ25tZW50LWJhc2VsaW5lPSJtaWRkbGUiPkltYWdlIGVycm9yPC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;