import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, CheckCircle, AlertCircle } from 'lucide-react';
import EnhancedImageUploader from './EnhancedImageUploader';
import ImageGallery from './ImageGallery';
import { useAuth } from '../../hooks/useAuth';

// Session storage key to persist uploads
const STORAGE_KEY = 'tap-artwork-uploads';

const ProductImageSection = ({ onImagesComplete, onImagesChange, uploadTriggered = false, maxImages = 15, minImages = 10 }) => {
  const { user } = useAuth();
  
  // State
  const [images, setImages] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [internalUploadTriggered, setInternalUploadTriggered] = useState(false);
  
  // Load saved images from session storage on initial render
  useEffect(() => {
    try {
      // First try to load from temporary session storage (pre-upload)
      const tempImages = sessionStorage.getItem('tap-artwork-temp');
      if (tempImages) {
        const parsedTempImages = JSON.parse(tempImages);
        if (Array.isArray(parsedTempImages) && parsedTempImages.length > 0) {
          // These are images stored directly in session without Firebase upload
          setImages(parsedTempImages);
          return;
        }
      }
      
      // Fall back to previously loaded images if no temp images
      const savedImages = sessionStorage.getItem(STORAGE_KEY);
      if (savedImages) {
        const parsedImages = JSON.parse(savedImages);
        if (Array.isArray(parsedImages)) {
          // Validate and filter only properly uploaded images
          const validImages = parsedImages.filter(img => 
            img.id && 
            (img.storageUrl || img.storedInSession) && 
            (img.uploadComplete === true || img.storedInSession)
          );
          if (validImages.length > 0) {
            setImages(validImages);
          }
        }
      }
    } catch (error) {
      console.error('Error loading images:', error);
    }
  }, []);

  // Save only completed images to session storage
  useEffect(() => {
    const completedImages = images.filter(img => img.uploadComplete);
    
    if (completedImages.length > 0) {
      
      const saveData = completedImages.map(img => ({
        id: img.id,
        name: img.name,
        size: img.size,
        type: img.type,
        uploadComplete: true, // Ensure this is explicitly true
        storageUrl: img.storageUrl,
        storagePath: img.storagePath,
        createdAt: img.createdAt,
        // Do not include file object
      }));
      
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    
    if (onImagesChange) {
      onImagesChange(images);
    }
  }, [images, onImagesChange]);

  // Detect already completed uploads on component load
  useEffect(() => {
    // Check if uploads were previously completed
    const uploadsCompleted = sessionStorage.getItem('tap-uploads-complete') === 'true';
    
    // Also verify that all current images are marked as uploaded
    const allImagesComplete = images.length > 0 && images.every(img => img.uploadComplete);
    
    if (uploadsCompleted && allImagesComplete) {
      console.log('Restoring previous upload completion state');
      setIsComplete(true);
      if (onImagesComplete && !isComplete) {
        onImagesComplete(images);
      }
    }
  }, [images, onImagesComplete, isComplete]);

  // Handle image uploads complete
  const handleUploadsComplete = (uploadedImages) => {
    console.log('Upload completion detected, total images:', uploadedImages.length);
    
    // Double check that all images are actually marked as uploaded
    const allCompleted = uploadedImages.every(img => img.uploadComplete);
    
    if (allCompleted) {
      console.log('All uploads verified as complete');
      setIsComplete(true);
      
      // Store completion in session storage to persist across page refreshes
      sessionStorage.setItem('tap-uploads-complete', 'true');
      
      if (onImagesComplete) {
        onImagesComplete(uploadedImages);
      }
    } else {
      console.warn('Upload completion called but some images are not marked as complete');
      // Try again after a short delay in case Firebase is still finalizing
      setTimeout(() => {
        const updatedComplete = uploadedImages.every(img => img.uploadComplete);
        if (updatedComplete) {
          console.log('Uploads verified as complete after delay');
          setIsComplete(true);
          if (onImagesComplete) {
            onImagesComplete(uploadedImages);
          }
        }
      }, 1000);
    }
  };
  
  // Open gallery view
  const openGallery = (index = 0) => {
    setGalleryIndex(index);
    setShowGallery(true);
  };
  
  // Fix for seamless uploads - ensures uploaded images are properly marked
  useEffect(() => {
    if (images.length > 0) {
      // Check if any images need their completion status fixed or are stored in session
      const needsFix = images.some(img => 
        (img.storageUrl && !img.uploadComplete) || 
        (img.storedInSession && !img.uploadComplete)
      );
      
      if (needsFix) {
          setImages(prevImages => 
          prevImages.map(img => 
            img.storageUrl || img.storedInSession ? {...img, uploadComplete: true} : img
          )
        );
      }
    }
  }, [images]);
  
  // Check if uploads can be triggered (have required number of images)
  const canTriggerUpload = images.length >= minImages && images.length <= maxImages;
  
  // Handle upload triggers
  useEffect(() => {
    if (!uploadTriggered && !internalUploadTriggered) return;
    
    // If uploads are already complete, just notify parent
    if (images.length >= minImages && images.length <= maxImages) {
      // Fix any images that have URLs but aren't marked as complete
      const needsFix = images.some(img => img.storageUrl && !img.uploadComplete);
      
      if (needsFix) {
        const fixedImages = images.map(img => 
          img.storageUrl ? {...img, uploadComplete: true} : img
        );
        setImages(fixedImages);
        
        // Check if all images are now complete
        if (fixedImages.every(img => img.uploadComplete)) {
          if (onImagesComplete) {
            onImagesComplete(fixedImages);
          }
          return;
        }
      } else if (images.every(img => img.uploadComplete)) {
        if (onImagesComplete) {
          onImagesComplete(images);
        }
        return;
      }
    }
    
    // Set a flag in session storage to indicate upload is in progress
    sessionStorage.setItem('tap-upload-triggered', 'true');
    
    // Reset the internal trigger if needed
    if (internalUploadTriggered) {
      setInternalUploadTriggered(false);
    }
  }, [uploadTriggered, internalUploadTriggered, images, onImagesComplete, minImages]);

  // Register the upload trigger function with the parent
  useEffect(() => {
    if (!onImagesComplete) return;
    
    // We need to make our triggerUpload function available to the parent component
    const parentComponent = document.querySelector('[data-upload-trigger]');
    if (parentComponent) {
      const triggerUploadHandler = () => {
        if (canTriggerUpload) {
          setInternalUploadTriggered(true);
        }
      };
      
      parentComponent.addEventListener('click', triggerUploadHandler);
      
      return () => {
        parentComponent.removeEventListener('click', triggerUploadHandler);
      };
    }
  }, [onImagesComplete, canTriggerUpload]);

  return (
    <div className="space-y-6">
      <EnhancedImageUploader
        images={images}
        setImages={setImages}
        uploadPath={`artwork/${user?.uid || 'guest'}`}
        onUploadsComplete={handleUploadsComplete}
        uploadImmediately={false}
        uploadTriggered={uploadTriggered || internalUploadTriggered}
      />
      
      {/* Status Section */}
      {images.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`p-4 rounded-lg border ${
            isComplete
              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900'
              : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900'
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className={`mt-0.5 p-1.5 rounded-full ${
              isComplete ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
            }`}>
              {isComplete ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
            </div>
            
            <div className="flex-1">
              <h3 className={`text-base font-medium ${
                isComplete ? 'text-green-800 dark:text-green-200' : 'text-amber-800 dark:text-amber-200'
              }`}>
                {isComplete 
                  ? 'All Images Uploaded Successfully!' 
                  : (images.length >= minImages && images.length <= maxImages)
                    ? 'Ready to Upload - Click Continue to Proceed' 
                    : 'Image Selection in Progress'}
              </h3>
              
              <p className={`text-sm mt-1 ${
                isComplete ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'
              }`}>
                {isComplete
                  ? 'Your artwork is ready for book creation. You can now proceed to the next step.'
                  : (images.length >= minImages && images.length <= maxImages)
                    ? 'Your selected images will be uploaded when you click Continue.'
                    : minImages === maxImages 
                      ? `${images.length} of ${minImages} images selected. Please select exactly ${minImages} image${minImages > 1 ? 's' : ''}.`
                      : `${images.length} image${images.length !== 1 ? 's' : ''} selected. Please select between ${minImages} and ${maxImages} images.`
                }
              </p>
              
              {images.length > 0 && (
                <div className="mt-3">
                  <button
                    onClick={() => openGallery(0)}
                    className="inline-flex items-center text-sm font-medium hover:underline"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {isComplete ? 'View Uploaded Images' : 'View Selected Images'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Image Gallery Modal */}
      {showGallery && (
        <ImageGallery
          images={images}
          initialIndex={galleryIndex}
          onClose={() => setShowGallery(false)}
        />
      )}
    </div>
  );
};

export default ProductImageSection;