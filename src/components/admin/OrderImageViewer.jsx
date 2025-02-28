import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut, Loader, AlertCircle, Image } from 'lucide-react';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { getDefaultImageSrc } from '../../components/ui/default-image';
import { getOrderImages, getImagesByOrderId } from '../../utils/firebaseStorageUtils';

const OrderImageViewer = ({ order, orderId, onClose }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Fetch all images for this order
  useEffect(() => {
    const fetchImages = async () => {
      try {
        let allImages = [];
        
        // If we have an order object with items
        if (order && order.items && order.items.length > 0) {
          console.log("Trying to fetch images from order object");
          try {
            allImages = await getOrderImages(order);
            console.log("Images from order:", allImages.length);
          } catch (err) {
            console.warn("Error getting images from order object:", err);
          }
        } 
        
        // If we have an order ID or if we need to try order ID as a fallback
        if (allImages.length === 0) {
          const id = orderId || (order && order.id);
          if (id) {
            console.log("Trying to fetch images by ID:", id);
            try {
              allImages = await getImagesByOrderId(id);
              console.log("Images from order ID:", allImages.length);
            } catch (err) {
              console.warn("Error getting images by order ID:", err);
            }
          }
        }
        
        // Check item storagePaths directly as a last resort
        if (allImages.length === 0 && order && order.items) {
          console.log("Checking for storagePaths directly in items");
          const storagePathPromises = [];
          
          // Collect all potential image paths
          order.items.forEach(item => {
            if (item.storagePath) {
              console.log("Found storagePath:", item.storagePath);
              storagePathPromises.push(
                getDownloadURL(ref(storage, item.storagePath))
                  .then(url => ({
                    url,
                    path: item.storagePath,
                    name: item.name || 'image.jpg'
                  }))
                  .catch(err => null) // Skip on error
              );
            }
            if (item.storageUrl) {
              console.log("Found storageUrl");
              storagePathPromises.push(Promise.resolve({
                url: item.storageUrl,
                path: item.storagePath || '',
                name: item.name || 'image.jpg'
              }));
            }
            if (item.coverImage && !item.coverImage.startsWith('data:') && !item.coverImage.startsWith('blob:')) {
              console.log("Found coverImage URL");
              storagePathPromises.push(Promise.resolve({
                url: item.coverImage,
                path: '',
                name: item.name || 'cover.jpg'
              }));
            }
          });
          
          // Wait for all promises
          if (storagePathPromises.length > 0) {
            const results = await Promise.all(storagePathPromises);
            allImages = results.filter(Boolean); // Remove nulls
            console.log("Images from direct paths:", allImages.length);
          }
        }
        
        console.log("Total images found:", allImages.length);
        if (allImages.length === 0) {
          setError("No images found for this order");
        } else {
          setImages(allImages);
        }
      } catch (err) {
        console.error("Error in image fetching:", err);
        setError(`Error loading images: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (order || orderId) {
      setLoading(true);
      fetchImages();
    } else {
      setError("No order information provided");
      setLoading(false);
    }
  }, [order, orderId]);

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
      
      // Don't try to download placeholder images
      if (image.isPlaceholder) {
        setError("Cannot download placeholder image");
        return;
      }

      // Create a temporary link element
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = image.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
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
          <p className="text-sm text-white/70 mt-2">This may take a moment while we search for images...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="bg-background p-6 rounded-lg max-w-md">
          <h3 className="text-xl font-bold mb-4 flex items-center text-red-500">
            <AlertCircle className="h-6 w-6 mr-2" />
            Error Loading Images
          </h3>
          <p className="text-destructive mb-4">{error}</p>
          
          <div className="bg-amber-50 p-4 rounded-md mb-6">
            <h4 className="font-medium text-amber-800 mb-2">Possible solutions:</h4>
            <ul className="list-disc pl-5 text-sm space-y-1 text-amber-700">
              <li>The images may not have been uploaded yet</li>
              <li>Images might have been uploaded under a different order ID</li>
              <li>Images might have been deleted or moved</li>
              <li>There might be network connectivity issues</li>
            </ul>
          </div>
          
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
          <h3 className="text-xl font-bold mb-4 flex items-center text-amber-600">
            <Image className="h-6 w-6 mr-2" />
            No Images Found
          </h3>
          <p className="mb-4">There are no images available for this order.</p>
          
          <div className="bg-amber-50 p-4 rounded-md mb-6">
            <h4 className="font-medium text-amber-800 mb-2">Possible reasons:</h4>
            <ul className="list-disc pl-5 text-sm space-y-1 text-amber-700">
              <li>Images may not have been uploaded with this order yet</li>
              <li>Images might have been stored under a different order ID</li>
              <li>Images might have been manually removed</li>
              <li>User may have skipped uploading images to this order</li>
            </ul>
          </div>
          
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
            className={`transition-transform duration-200 max-h-full ${currentImage.isPlaceholder ? 'opacity-50' : ''}`}
            style={{ transform: `scale(${zoomLevel})` }}
            onError={(e) => {
              e.target.src = getDefaultImageSrc('image');
              e.target.classList.add('opacity-50');
            }}
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
                className={`h-full w-full object-cover ${image.isPlaceholder ? 'opacity-50' : ''}`}
                onError={(e) => {
                  e.target.src = getDefaultImageSrc('image');
                  e.target.classList.add('opacity-50');
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderImageViewer;