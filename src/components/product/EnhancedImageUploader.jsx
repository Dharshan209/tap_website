import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Upload, 
  Image, 
  AlertCircle, 
  Trash2, 
  Check, 
  ArrowUp, 
  ArrowDown, 
  Loader2 
} from 'lucide-react';
import { useStorage } from '../../hooks/useStorage';
import { useAuth } from '../../hooks/useAuth';

const DEFAULT_MAX_IMAGES = 15;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
};

const EnhancedImageUploader = ({ 
  images = [], 
  setImages, 
  uploadPath = 'artwork',
  onUploadsComplete,
  uploadImmediately = false,
  uploadTriggered = false,
  maxImages = DEFAULT_MAX_IMAGES,
  minImages = 1
}) => {
  const { user } = useAuth();
  const { 
    uploadFile, 
    progress, 
    isUploading, 
    error: uploadError,
    deleteFile 
  } = useStorage();
  
  // Local state
  const [error, setError] = useState('');
  const [currentUploads, setCurrentUploads] = useState({});
  const [uploadQueue, setUploadQueue] = useState([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [uploadStarted, setUploadStarted] = useState(false);
  
  const getUserUploadPath = useCallback(() => {
    if (!user) {
      console.warn('User not authenticated, using guest path');
      return `${uploadPath}/guest-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
    return `${uploadPath}/${user.uid}`;
  }, [user, uploadPath]);
  
  // React to uploadTriggered prop from parent
  useEffect(() => {
    if (uploadTriggered && !uploadStarted) {
      
      // First, fix any images that have URLs but aren't marked complete
      const hasIncompleteWithUrls = images.some(img => img.storageUrl && !img.uploadComplete);
      
      if (hasIncompleteWithUrls) {
        const fixedImages = images.map(img => 
          img.storageUrl ? {...img, uploadComplete: true} : img
        );
        setImages(fixedImages);
        
        // If all images are now complete after fixing, notify parent
        if (fixedImages.every(img => img.uploadComplete)) {
          if (onUploadsComplete) {
            onUploadsComplete(fixedImages);
            return;
          }
        }
      }
      
      // Only include images with files that haven't been uploaded
      const imagesToUpload = images.filter(img => 
        !img.uploadComplete && 
        img.file instanceof File // Ensure valid File object exists
      );
      
      
      if (imagesToUpload.length > 0) {
        setUploadQueue(prev => [...prev, ...imagesToUpload]);
        setUploadStarted(true);
      } else if (images.every(img => img.uploadComplete || img.storageUrl)) {
        // Images are already complete or have storage URLs
        if (onUploadsComplete) {
          onUploadsComplete(images);
        }
      } else if (images.length === 0) {
        // No images to upload
      } else {
        // Some images aren't complete and don't have files
      }
    }
  }, [uploadTriggered, uploadStarted, images, onUploadsComplete]);

  // Process upload queue with parallel uploads
  useEffect(() => {
    if (uploadQueue.length === 0 || isProcessingQueue) return;
    
    const processQueue = async () => {
      setIsProcessingQueue(true);
      
      // Maximum concurrent uploads - using 3 for balance between speed and reliability
      const MAX_CONCURRENT = 3;
      
      try {
        // Take files from queue (up to MAX_CONCURRENT)
        const filesToUpload = uploadQueue.slice(0, MAX_CONCURRENT);
        
        // Mark files as uploading in UI
        filesToUpload.forEach(fileToUpload => {
          if (!fileToUpload?.file) return;
          
          setCurrentUploads(prev => ({
            ...prev,
            [fileToUpload.id]: {
              file: fileToUpload,
              progress: 0,
              status: 'uploading'
            }
          }));
        });
        
        // Create upload promises for each file
        const uploadPromises = filesToUpload.map(async (fileToUpload) => {
          try {
            // Skip if file doesn't exist
            if (!fileToUpload?.file) {
              console.error('Skipping upload - No file found:', fileToUpload.id);
              return { 
                id: fileToUpload.id, 
                status: 'error', 
                error: 'No file found' 
              };
            }
            
            // Include orderId in the metadata if available from the file or sessionStorage
            const orderId = fileToUpload.orderId || sessionStorage.getItem('current-order-id');
            
            // Custom progress tracker for this file
            const onProgress = (progress) => {
              setCurrentUploads(prev => ({
                ...prev,
                [fileToUpload.id]: {
                  ...prev[fileToUpload.id],
                  progress
                }
              }));
            };
            
            // Upload the file with progress tracking
            const result = await uploadFile(
              fileToUpload.file,
              getUserUploadPath(),
              { 
                customMetadata: { 
                  userId: user?.uid || 'anonymous',
                  orderId: orderId || 'pending',
                  uploadTimestamp: new Date().toISOString()
                } 
              },
              onProgress
            );
            
            // Create enhanced image with upload info
            const enhancedImage = {
              ...fileToUpload,
              storageUrl: result.url,
              storagePath: result.path,
              uploadComplete: true
            };
            
            // Update image in the images array
            setImages(prevImages => {
              const updatedImages = prevImages.map(img => 
                img.id === fileToUpload.id ? enhancedImage : img
              );
              return updatedImages;
            });
            
            // Mark as complete in UI
            setCurrentUploads(prev => ({
              ...prev,
              [fileToUpload.id]: {
                ...prev[fileToUpload.id],
                progress: 100,
                status: 'complete'
              }
            }));
            
            return { id: fileToUpload.id, status: 'success', result };
          } catch (err) {
            console.error(`Upload error for ${fileToUpload.id}:`, err);
            
            // Mark as error in UI
            setCurrentUploads(prev => ({
              ...prev,
              [fileToUpload.id]: {
                ...prev[fileToUpload.id],
                status: 'error',
                error: err.message
              }
            }));
            
            return { id: fileToUpload.id, status: 'error', error: err.message };
          }
        });
        
        // Wait for all uploads to complete
        const results = await Promise.all(uploadPromises);
        
        // Remove processed files from queue
        setUploadQueue(prev => 
          prev.filter(item => !results.some(r => r.id === item.id))
        );
        
        // If there are errors, show the first one
        const firstError = results.find(r => r.status === 'error');
        if (firstError) {
          setError(`Upload failed: ${firstError.error}`);
        } else {
          // Clear any previous errors if all successful
          setError('');
        }
        
      } catch (err) {
        console.error('Upload batch error:', err);
        setError(`Upload failed: ${err.message}`);
      } finally {
        setIsProcessingQueue(false);
      }
    };
    
    processQueue();
  }, [uploadQueue, isProcessingQueue, uploadFile, setImages, getUserUploadPath, user]);
  
  // New useEffect for primary completion check
// In EnhancedImageUploader.jsx
useEffect(() => {
  // Check completion status
  if (uploadStarted && images.length > 0) {
    // Fix for images with URLs but not marked as complete
    const needsFix = images.some(img => img.storageUrl && !img.uploadComplete);
    
    if (needsFix) {
      // Fix the image statuses first
      const fixedImages = images.map(img => 
        img.storageUrl ? {...img, uploadComplete: true} : img
      );
      setImages(fixedImages);
      
      // After fixing, check if we can now consider all uploads complete
      if (fixedImages.every(img => img.uploadComplete || img.storageUrl)) {
        // Add a forced delay to ensure state updates are processed
        setTimeout(() => {
          if (onUploadsComplete) {
            onUploadsComplete(fixedImages);
          }
          setUploadStarted(false);
        }, 500);
      }
    } else {
      // Regular completion check
      const allComplete = images.every(img => img.uploadComplete || img.storageUrl);
      const isIdle = !isProcessingQueue && uploadQueue.length === 0;
      
      if (allComplete && isIdle && onUploadsComplete) {
        // Add a forced delay
        setTimeout(() => {
          onUploadsComplete(images);
          setUploadStarted(false);
        }, 500);
      }
    }
  }
}, [uploadStarted, images, isProcessingQueue, uploadQueue.length, onUploadsComplete]);
  
  // Modified existing completion effect (secondary check)
  useEffect(() => {
    // Fix any images that have storage URLs but aren't marked as complete
    const needsCompletionFix = images.some(img => img.storageUrl && !img.uploadComplete);
    if (needsCompletionFix) {
      setImages(prevImages => 
        prevImages.map(img => img.storageUrl ? {...img, uploadComplete: true} : img)
      );
    }

    // Now check if we need to signal completion
    if (
      uploadStarted &&
      images.length >= minImages && 
      images.length <= maxImages && 
      (images.every(img => img.uploadComplete || img.storageUrl)) && 
      uploadQueue.length === 0 && 
      !isProcessingQueue &&
      onUploadsComplete &&
      Object.keys(currentUploads).length === 0
    ) {
      // Add a small delay to ensure all state updates are processed
      setTimeout(() => {
        const fixedImages = images.map(img => 
          img.storageUrl ? {...img, uploadComplete: true} : img
        );
        onUploadsComplete(fixedImages);
      }, 500);
    }
  }, [images, uploadQueue, isProcessingQueue, onUploadsComplete, uploadStarted, currentUploads, minImages, maxImages]);
  
  // Add window beforeunload handler
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isProcessingQueue || uploadQueue.length > 0 || 
          (images.length > 0 && !images.every(img => img.uploadComplete))) {
        const message = "You have uploads in progress. Leaving now may result in data loss. Are you sure you want to leave?";
        e.returnValue = message;
        
        // Clear session storage on page refresh/navigation
        if (sessionStorage.getItem('tap-artwork-temp')) {
          sessionStorage.removeItem('tap-artwork-temp');
        }
        
        return message;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Also clear session storage when component unmounts
      if (sessionStorage.getItem('tap-artwork-temp')) {
        sessionStorage.removeItem('tap-artwork-temp');
      }
    };
  }, [images, isProcessingQueue, uploadQueue.length]);
  
  // Handle file drop with image compression
  const onDrop = useCallback(
    async (acceptedFiles) => {
      // Clear previous errors
      setError('');
      
      // Check if we're already at max images
      if (images.length >= maxImages) {
        setError(`Maximum ${maxImages} images allowed`);
        return;
      }
      
      // Check how many more images we can add
      const remainingSlots = maxImages - images.length;
      const filesToAdd = acceptedFiles.slice(0, remainingSlots);
      
      // Add loading indicator while processing
      setIsProcessingQueue(true);
      
      try {
        // Process files with potential compression
        const processedImages = await Promise.all(filesToAdd.map(async (file) => {
          // Check file size
          if (file.size > MAX_FILE_SIZE) {
            // Attempt to compress large images
            if (file.type.startsWith('image/')) {
              try {
                // Create preview URL
                const previewUrl = URL.createObjectURL(file);
                
                // Create image object with temporary status
                const tempImageObj = {
                  id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                  preview: previewUrl,
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  uploadComplete: false,
                  createdAt: new Date().toISOString(),
                  storedInSession: true,
                  isCompressing: true,
                  orderId: sessionStorage.getItem('current-order-id') || null,
                };
                
                // Compress the image using canvas
                const compressedFile = await new Promise((resolve, reject) => {
                  const img = new Image();
                  img.onload = () => {
                    // Create canvas for compression
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    // Calculate new dimensions while maintaining aspect ratio
                    const MAX_WIDTH = 1800;
                    const MAX_HEIGHT = 1800;
                    
                    if (width > height) {
                      if (width > MAX_WIDTH) {
                        height = Math.round(height * (MAX_WIDTH / width));
                        width = MAX_WIDTH;
                      }
                    } else {
                      if (height > MAX_HEIGHT) {
                        width = Math.round(width * (MAX_HEIGHT / height));
                        height = MAX_HEIGHT;
                      }
                    }
                    
                    // Set canvas dimensions
                    canvas.width = width;
                    canvas.height = height;
                    
                    // Draw and compress
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to blob with reduced quality
                    canvas.toBlob((blob) => {
                      if (blob) {
                        // Create new file from blob
                        const compressedFile = new File(
                          [blob], 
                          file.name, 
                          { type: 'image/jpeg', lastModified: Date.now() }
                        );
                        
                        // Check if compression actually reduced the size
                        if (compressedFile.size < file.size && compressedFile.size <= MAX_FILE_SIZE) {
                          resolve(compressedFile);
                        } else {
                          // If compression didn't help enough, reject
                          reject(new Error(`File "${file.name}" still exceeds 5MB after compression`));
                        }
                      } else {
                        reject(new Error('Compression failed'));
                      }
                    }, 'image/jpeg', 0.7); // Adjust quality as needed
                  };
                  
                  img.onerror = () => {
                    reject(new Error(`Failed to load image: ${file.name}`));
                  };
                  
                  img.src = previewUrl;
                }).catch(err => {
                  console.warn('Image compression failed:', err);
                  throw new Error(`File "${file.name}" exceeds the 5MB size limit and couldn't be compressed`);
                });
                
                // Create image object with compressed file and preview URL
                const imageObj = {
                  ...tempImageObj,
                  file: compressedFile,
                  size: compressedFile.size,
                  isCompressing: false,
                  wasCompressed: true,
                };
                
                return imageObj;
              } catch (err) {
                console.warn('Compression error:', err);
                setError(err.message);
                return null;
              }
            } else {
              setError(`File "${file.name}" exceeds the 5MB size limit`);
              return null;
            }
          }
          
          // For smaller files, just create the image object normally
          const previewUrl = URL.createObjectURL(file);
          
          // Create image object
          const imageObj = {
            id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            file,
            preview: previewUrl,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadComplete: false,
            createdAt: new Date().toISOString(),
            storedInSession: true,
            orderId: sessionStorage.getItem('current-order-id') || null,
          };
          
          return imageObj;
        }));
        
        // Filter out null entries (files that were too large and couldn't be compressed)
        const newImages = processedImages.filter(Boolean);
        
        if (newImages.length > 0) {
          // Add to images state
          setImages((prevImages) => [...prevImages, ...newImages]);
          
          // Queue uploads
          setUploadQueue(prev => [...prev, ...newImages]);
          
          // Store in session storage
          try {
            const storedImages = JSON.parse(sessionStorage.getItem('tap-artwork-temp') || '[]');
            const updatedStorage = [...storedImages, ...newImages.map(img => ({
              id: img.id,
              name: img.name,
              size: img.size,
              type: img.type,
              preview: img.preview,
              createdAt: img.createdAt,
              storedInSession: true,
              wasCompressed: img.wasCompressed,
              orderId: sessionStorage.getItem('current-order-id') || null,
            }))];
            sessionStorage.setItem('tap-artwork-temp', JSON.stringify(updatedStorage));
          } catch (err) {
            console.error('Error storing images in session:', err);
          }
          
          // If we couldn't add all files due to the limit, show a message
          if (acceptedFiles.length > remainingSlots) {
            setError(`Only added ${remainingSlots} images. Maximum ${maxImages} images allowed.`);
          }
        }
      } catch (err) {
        console.error('Error processing files:', err);
        setError(`Error processing files: ${err.message}`);
      } finally {
        setIsProcessingQueue(false);
      }
    },
    [images, setImages, maxImages]
  );
  
  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
  });
  
  // Handle file rejection errors
  useEffect(() => {
    if (fileRejections.length > 0) {
      const rejectionErrors = fileRejections.map(({ file, errors }) => {
        return errors.map(e => {
          if (e.code === 'file-too-large') {
            return `File "${file.name}" is too large. Max size is 5MB.`;
          }
          if (e.code === 'file-invalid-type') {
            return `File "${file.name}" has an invalid type. Accepted types: JPG, PNG, GIF, WebP.`;
          }
          return e.message;
        }).join(', ');
      }).join('; ');
      
      setError(rejectionErrors);
    }
  }, [fileRejections]);
  
  // Handle removing an image
  const removeImage = async (id) => {
    // Find the image
    const imageToRemove = images.find(img => img.id === id);
    
    // If the image was uploaded, delete it from storage
    if (imageToRemove && imageToRemove.uploadComplete && imageToRemove.storagePath) {
      try {
        await deleteFile(imageToRemove.storagePath);
      } catch (err) {
        console.error('Error deleting file from storage:', err);
        // Continue with removal from state even if storage delete fails
      }
    }
    
    // Remove from queue if it's there
    setUploadQueue(prev => prev.filter(item => item.id !== id));
    
    // Remove from current uploads
    setCurrentUploads(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
    
    // Remove from images state
    setImages((prevImages) => {
      const updatedImages = prevImages.filter((image) => image.id !== id);
      
      // Clear error message when removing images
      if (updatedImages.length < maxImages) {
        setError('');
      }
      
      return updatedImages;
    });
    
    // Cleanup preview URL to prevent memory leaks
    if (imageToRemove && imageToRemove.preview) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
  };
  
  // Handle reordering images (move up/down)
  const reorderImage = (id, direction) => {
    setImages(prevImages => {
      const index = prevImages.findIndex(img => img.id === id);
      
      // If image not found or trying to move first item up or last item down
      if (
        index === -1 || 
        (direction === 'up' && index === 0) || 
        (direction === 'down' && index === prevImages.length - 1)
      ) {
        return prevImages;
      }
      
      // Create a new array with the reordered images
      const newImages = [...prevImages];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      // Swap the images
      [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
      
      return newImages;
    });
  };
  
  // Get upload progress for an image
  const getImageProgress = (id) => {
    if (currentUploads[id]) {
      return currentUploads[id].progress;
    }
    return 0;
  };
  
  // Get upload status for an image
  const getImageStatus = (id) => {
    if (images.find(img => img.id === id)?.uploadComplete) {
      return 'complete';
    }
    
    if (currentUploads[id]) {
      return currentUploads[id].status;
    }
    
    if (uploadQueue.some(item => item.id === id)) {
      return 'queued';
    }
    
    if (uploadStarted) {
      return 'pending';
    }
    
    return 'selected';
  };
  
  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      images.forEach(image => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, [images]);
  
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">Upload Artwork</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {minImages === maxImages 
              ? `Upload exactly ${minImages} image${minImages > 1 ? 's' : ''} to create your storybook`
              : `Upload ${minImages}-${maxImages} images to create your storybook`}
          </p>
        </div>
        <div className="flex items-center text-sm font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
          <span className={images.length >= minImages && images.length <= maxImages ? 'text-primary' : ''}>
            {images.length}
          </span>
          <span>/</span>
          <span>{maxImages}</span>
        </div>
      </div>
      
      {/* Error message */}
      {(error || uploadError) && (
        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error || uploadError}</span>
        </div>
      )}
      
      {/* Processing status with enhanced progress bar */}
      {isProcessingQueue && (
        <div className="flex flex-col gap-2 p-4 text-sm text-primary bg-primary/10 rounded-md">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
            <div>
              <span className="font-medium">Uploading images in parallel... Please don't close this page.</span>
              <div className="text-xs mt-1">Leaving now may result in data loss. Please wait until all uploads complete.</div>
            </div>
          </div>
          
          {/* Overall progress visualization */}
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Upload progress:</span>
              <span>{Math.round((Object.values(currentUploads).reduce((sum, item) => sum + (item.progress || 0), 0) / 
                (Object.keys(currentUploads).length * 100)) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-primary/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ 
                  width: `${(Object.values(currentUploads).reduce((sum, item) => sum + (item.progress || 0), 0) / 
                  (Object.keys(currentUploads).length * 100)) * 100}%` 
                }}
              />
            </div>
            <div className="text-xs mt-1.5 text-primary/80">
              {Object.values(currentUploads).filter(item => item.status === 'complete').length} of {Object.keys(currentUploads).length} files complete
            </div>
          </div>
        </div>
      )}
      
      {/* Network warning if applicable */}
      {(isProcessingQueue || uploadQueue.length > 0) && navigator.onLine === false && (
        <div className="flex items-center gap-2 p-3 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-300 rounded-md mt-3">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>Your device appears to be offline. Uploads will resume when your connection is restored.</span>
        </div>
      )}
      
      {/* Dropzone with enhanced UI */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 transition-all duration-300 text-center cursor-pointer ${
          isDragActive
            ? 'border-primary bg-primary/5 scale-[0.99] shadow-inner'
            : 'border-border hover:border-primary/50 hover:bg-muted/50 hover:shadow-md'
        } ${images.length >= maxImages ? 'opacity-50 pointer-events-none' : ''}`}
        aria-label={isDragActive ? "Drop images here" : "Drag & drop upload area"}
        aria-disabled={images.length >= maxImages}
      >
        <input {...getInputProps()} aria-label="File input" />
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className={`p-3 rounded-full transition-all duration-300 ${
            isDragActive 
              ? 'bg-primary/20 text-primary scale-110' 
              : 'bg-primary/10 text-primary'
          }`}>
            <Upload className={`h-6 w-6 ${isDragActive ? 'animate-bounce' : ''}`} aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {isDragActive
                ? 'Drop the images here'
                : 'Drag & drop images here or click to browse'}
            </p>
            <p className="text-xs text-muted-foreground">
              Supports JPG, PNG, GIF, WebP (max 5MB each)
            </p>
            
            {/* Badge with auto-compression hint */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 justify-center">
              <p className="text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2 py-1 rounded">
                File size limit: 5MB per image
              </p>
              <p className="text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded">
                Large images auto-compressed
              </p>
            </div>
            
            {/* Show reminder about upload behavior */}
            {!uploadImmediately && !uploadStarted && images.length > 0 && (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                Images will be uploaded when you click Continue
              </p>
            )}
            
            {/* Upload status indicator */}
            {images.length > 0 && (
              <div className="mt-3 flex items-center justify-center gap-2">
                <div className="h-2 bg-muted rounded-full overflow-hidden w-32">
                  <div 
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${(images.length / maxImages) * 100}%` }}
                  />
                </div>
                <p className="text-xs font-medium text-primary">
                  {images.length}/{maxImages}
                </p>
                {images.filter(img => img.uploadComplete).length > 0 && 
                  <span className="text-xs text-green-600">
                    ({images.filter(img => img.uploadComplete).length} uploaded)
                  </span>
                }
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Image Previews */}
      {images.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3">
            {uploadStarted ? "Uploading Images" : "Selected Images"}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <AnimatePresence initial={false}>
              {images.map((image, index) => {
                const status = getImageStatus(image.id);
                
                return (
                  <motion.div
                    key={image.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className={`relative rounded-md overflow-hidden border group ${
                      status === 'error' 
                        ? 'border-destructive bg-destructive/5'
                        : 'border-border'
                    }`}
                  >
                    <div className="aspect-square relative">
                      {/* Image Preview */}
                      <div className="h-full w-full bg-muted">
                      {image.preview || image.storageUrl ? (
                        <img
                          src={image.storageUrl || image.preview}
                          alt={`Artwork ${index + 1}`}
                          className={`w-full h-full object-cover ${image.isCompressing ? 'opacity-50' : ''}`}
                          loading="lazy"
                          onError={(e) => {
                            // Log error but avoid console.error in production
                            if (process.env.NODE_ENV !== 'production') {
                              console.warn(`Failed to load image: ${image.name}`);
                            }
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjgwIiB5PSI4MCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzg4OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgYWxpZ25tZW50LWJhc2VsaW5lPSJtaWRkbGUiPkltYWdlIGxvYWQgZXJyb3I8L3RleHQ+PC9zdmc+';
                            e.target.alt = `Failed to load image ${index + 1}`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                          <span className="text-xs">No Preview</span>
                        </div>
                      )}
                      
                      {/* Compression indicator */}
                      {image.isCompressing && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
                          <div className="flex flex-col items-center text-primary">
                            <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                            <span className="text-xs mt-2">Compressing...</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Compressed badge */}
                      {image.wasCompressed && !image.isCompressing && (
                        <div className="absolute bottom-2 left-2 bg-green-500/80 text-white text-xs px-1.5 py-0.5 rounded-sm backdrop-blur-sm">
                          Compressed
                        </div>
                      )}
                      </div>
                      
                      {/* Image number badge */}
                      <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm text-xs font-medium px-1.5 py-0.5 rounded">
                        {index + 1}
                      </div>
                      
                      {/* Upload Status Indicator */}
                      {status !== 'selected' && status !== 'complete' && (
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
                          {status === 'uploading' && (
                            <div className="flex flex-col items-center">
                              <div className="relative h-12 w-12">
                                <svg className="h-12 w-12" viewBox="0 0 36 36">
                                  <circle
                                    cx="18"
                                    cy="18"
                                    r="16"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="text-muted-foreground/20"
                                  />
                                  <circle
                                    cx="18"
                                    cy="18"
                                    r="16"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeDasharray="100"
                                    strokeDashoffset={100 - (getImageProgress(image.id) || 0)}
                                    className="text-primary transform origin-center -rotate-90"
                                  />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-xs font-medium">{Math.round(getImageProgress(image.id) || 0)}%</span>
                                </div>
                              </div>
                              <span className="text-xs mt-2">Uploading...</span>
                            </div>
                          )}
                          
                          {status === 'queued' && (
                            <div className="flex flex-col items-center">
                              <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                              <span className="text-xs mt-2">Queued</span>
                            </div>
                          )}
                          
                          {status === 'pending' && (
                            <div className="flex flex-col items-center">
                              <div className="h-8 w-8 border-2 border-yellow-300 border-t-yellow-500 rounded-full animate-spin"></div>
                              <span className="text-xs mt-2">Pending...</span>
                            </div>
                          )}
                          
                          {status === 'error' && (
                            <div className="flex flex-col items-center">
                              <AlertCircle className="h-8 w-8 text-destructive" />
                              <span className="text-xs mt-2 text-destructive">Upload Failed</span>
                              {currentUploads[image.id]?.error && (
                                <span className="text-xs mt-1 text-destructive text-center max-w-[90%]">
                                  {typeof currentUploads[image.id].error === 'string' 
                                    ? currentUploads[image.id].error 
                                    : 'Check your connection and try again'}
                                </span>
                              )}
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Add back to queue to retry
                                  if (!uploadQueue.some(item => item.id === image.id)) {
                                    setUploadQueue(prev => [...prev, image]);
                                  }
                                }}
                                className="mt-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded"
                              >
                                Retry
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Move Up Button (hide for first image) */}
                        {index > 0 && !uploadStarted && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              reorderImage(image.id, 'up');
                            }}
                            className="bg-background/80 backdrop-blur-sm text-foreground p-1 rounded-full hover:bg-background"
                            aria-label="Move image up"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                        )}
                        
                        {/* Move Down Button (hide for last image) */}
                        {index < images.length - 1 && !uploadStarted && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              reorderImage(image.id, 'down');
                            }}
                            className="bg-background/80 backdrop-blur-sm text-foreground p-1 rounded-full hover:bg-background"
                            aria-label="Move image down"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                        )}
                        
                        {/* Remove Button (only show if not uploading) */}
                        {!uploadStarted && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(image.id);
                            }}
                            className="bg-background/80 backdrop-blur-sm text-destructive p-1 rounded-full hover:bg-background"
                            aria-label="Remove image"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      
                      {/* Upload complete indicator */}
                      {status === 'complete' && (
                        <div className="absolute bottom-2 right-2 bg-green-500 text-white p-1 rounded-full">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {/* Empty slots */}
            {images.length < maxImages &&
              Array.from({ length: maxImages - images.length }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="border border-dashed border-border rounded-md flex items-center justify-center aspect-square"
                >
                  <div className="text-muted-foreground flex flex-col items-center">
                    <Image className="h-6 w-6 mb-1 opacity-40" />
                    <span className="text-xs">{images.length + index + 1}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedImageUploader;