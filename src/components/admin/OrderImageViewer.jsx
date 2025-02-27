import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut, Loader } from 'lucide-react';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../../lib/firebase';

const OrderImageViewer = ({ order, onClose }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Fetch all images for this order
  useEffect(() => {
    const fetchImages = async () => {
      if (!order || !order.items || order.items.length === 0) {
        setError("No images found in this order");
        setLoading(false);
        return;
      }

      try {
        const allImages = [];
        
        // Collect all image paths from all items
        for (const item of order.items) {
          if (item.images && Array.isArray(item.images)) {
            for (const image of item.images) {
              if (image.path) {
                try {
                  // Create a reference to the image in Firebase Storage
                  const storageRef = ref(storage, image.path);
                  
                  // Get download URL
                  const url = await getDownloadURL(storageRef);
                  
                  // Add to our collection
                  allImages.push({
                    url,
                    name: image.originalName || image.name || 'Image',
                    path: image.path
                  });
                } catch (imageError) {
                  console.error(`Error fetching image ${image.path}:`, imageError);
                  // Continue with other images rather than failing completely
                }
              }
            }
          }
        }

        if (allImages.length === 0) {
          setError("No images found for this order");
        } else {
          setImages(allImages);
        }
      } catch (err) {
        console.error("Error fetching images:", err);
        setError(`Error loading images: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (order) {
      fetchImages();
    }
  }, [order]);

  // Navigate between images
  const goToNextImage = () => {
    setZoomLevel(1); // Reset zoom when changing images
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevImage = () => {
    setZoomLevel(1); // Reset zoom when changing images
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Zoom controls
  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  };

  // Download current image
  const downloadImage = async () => {
    if (!images[currentImageIndex]) return;
    
    try {
      const image = images[currentImageIndex];
      const response = await fetch(image.url);
      const blob = await response.blob();
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = image.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error downloading image:", err);
      setError(`Error downloading image: ${err.message}`);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowRight':
          goToNextImage();
          break;
        case 'ArrowLeft':
          goToPrevImage();
          break;
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
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
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentImageIndex, images.length, onClose]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="text-white text-center">
          <Loader className="h-10 w-10 mx-auto animate-spin mb-4" />
          <p>Loading images...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="bg-background p-6 rounded-lg max-w-md">
          <h3 className="text-xl font-bold mb-4">Error</h3>
          <p className="text-destructive mb-6">{error}</p>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="bg-background p-6 rounded-lg max-w-md">
          <h3 className="text-xl font-bold mb-4">No Images Found</h3>
          <p className="mb-6">There are no images available for this order.</p>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentImage = images[currentImageIndex];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90">
      {/* Header/Toolbar */}
      <div className="w-full bg-background/10 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <h3 className="text-white font-medium flex items-center">
          <span className="text-white/70 mr-2">Image {currentImageIndex + 1} of {images.length}:</span>
          {currentImage.name}
        </h3>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={zoomOut}
            className="p-1.5 rounded-full text-white hover:bg-white/20 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          
          <div className="text-white/70 text-sm w-12 text-center">
            {Math.round(zoomLevel * 100)}%
          </div>
          
          <button
            onClick={zoomIn}
            className="p-1.5 rounded-full text-white hover:bg-white/20 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          
          <button
            onClick={downloadImage}
            className="p-1.5 rounded-full text-white hover:bg-white/20 transition-colors relative group"
            title="Download this image"
          >
            <Download className="h-5 w-5" />
            <div className="absolute bottom-full right-0 mb-2 w-32 bg-black py-1 px-2 text-xs rounded invisible group-hover:visible">
              Download this image
            </div>
          </button>
          
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white hover:bg-white/20 transition-colors"
            title="Close viewer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Main Image Viewer */}
      <div className="flex-1 w-full flex items-center justify-center overflow-hidden relative">
        {/* Previous Image Button */}
        <button
          onClick={goToPrevImage}
          className="absolute left-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
          title="Previous image"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        
        {/* Image */}
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ cursor: zoomLevel > 1 ? 'move' : 'auto' }}
        >
          <img
            src={currentImage.url}
            alt={currentImage.name}
            className="transition-transform duration-200 max-h-full"
            style={{ transform: `scale(${zoomLevel})` }}
          />
        </div>
        
        {/* Next Image Button */}
        <button
          onClick={goToNextImage}
          className="absolute right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
          title="Next image"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
      
      {/* Thumbnails */}
      <div className="w-full bg-black/50 p-3 overflow-x-auto">
        <div className="flex space-x-2 justify-center">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-16 w-16 flex-shrink-0 rounded-md overflow-hidden transition-all ${
                currentImageIndex === index 
                  ? 'ring-2 ring-primary scale-105' 
                  : 'opacity-70 hover:opacity-100'
              }`}
              title={image.name}
            >
              <img 
                src={image.url} 
                alt={`Thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderImageViewer;