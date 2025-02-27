import { ref, getDownloadURL, listAll, getMetadata } from 'firebase/storage';
import { storage } from '../lib/firebase';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Get download URL for a file in Firebase Storage
 * @param {string} path - Path to the file in storage
 * @returns {Promise<string>} Download URL
 */
export const getImageUrl = async (path) => {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error(`Error getting URL for ${path}:`, error);
    throw error;
  }
};

/**
 * Get all images from a specific order
 * @param {Object} order - Order object containing image paths
 * @returns {Promise<Array>} Array of image objects with URLs
 */
export const getOrderImages = async (order) => {
  if (!order || !order.items || !Array.isArray(order.items)) {
    throw new Error('Invalid order data');
  }

  const images = [];
  
  // Extract image paths from all order items
  for (const item of order.items) {
    if (item.images && Array.isArray(item.images)) {
      for (const image of item.images) {
        if (image.path) {
          try {
            const url = await getImageUrl(image.path);
            
            // Get metadata if needed
            const storageRef = ref(storage, image.path);
            const metadata = await getMetadata(storageRef);
            
            images.push({
              url,
              path: image.path,
              name: image.originalName || image.name || `image_${images.length + 1}.jpg`,
              metadata,
              item: {
                id: item.id,
                childName: item.childName
              }
            });
          } catch (error) {
            console.error(`Error processing image ${image.path}:`, error);
            // Continue processing other images
          }
        }
      }
    }
  }

  return images;
};

/**
 * Download all images from an order as a zip file
 * @param {Object} order - Order object
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Blob>} Zip file as blob
 */
export const downloadOrderImagesAsZip = async (order, onProgress = () => {}) => {
  try {
    // Get all images
    const images = await getOrderImages(order);
    
    if (images.length === 0) {
      throw new Error('No images found in this order');
    }
    
    // Initialize zip
    const zip = new JSZip();
    const folder = zip.folder(`order_${order.id}_images`);
    
    // Download and add each image to zip
    let completedCount = 0;
    const totalImages = images.length;
    
    // Create an array of promises for fetching all images
    const imagePromises = images.map(async (image, index) => {
      try {
        // Fetch the image
        const response = await fetch(image.url);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        
        // Get the image as blob
        const blob = await response.blob();
        
        // Add to zip
        folder.file(image.name, blob);
        
        // Update progress
        completedCount++;
        onProgress((completedCount / totalImages) * 100);
        
        return true;
      } catch (error) {
        console.error(`Error processing image ${index}:`, error);
        return false;
      }
    });
    
    // Wait for all images to be processed
    await Promise.all(imagePromises);
    
    // Generate zip file
    const zipBlob = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6
      }
    }, (metadata) => {
      // This callback reports the compression progress
      onProgress(90 + (metadata.percent / 10)); // Use the last 10% for compression
    });
    
    // Return the zip blob
    return zipBlob;
  } catch (error) {
    console.error('Error creating zip file:', error);
    throw error;
  }
};

/**
 * Download and save a zip file of order images
 * @param {Object} order - Order object
 * @param {Function} onProgress - Progress callback
 * @param {Function} onComplete - Completion callback
 * @param {Function} onError - Error callback
 */
export const saveOrderImagesAsZip = async (
  order, 
  onProgress = () => {}, 
  onComplete = () => {},
  onError = () => {}
) => {
  try {
    // Start progress
    onProgress(0);
    
    // Get zip file
    const zipBlob = await downloadOrderImagesAsZip(order, onProgress);
    
    // Save the file
    saveAs(zipBlob, `order_${order.id}_images.zip`);
    
    // Complete
    onProgress(100);
    onComplete();
  } catch (error) {
    console.error('Error saving zip file:', error);
    onError(error);
  }
};