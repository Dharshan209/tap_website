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
            // Continue processing other images
          }
        }
      }
    }
    
    // Also check for single coverImage
    if (item.storagePath) {
      try {
        const url = await getImageUrl(item.storagePath);
        
        // Get metadata
        const storageRef = ref(storage, item.storagePath);
        const metadata = await getMetadata(storageRef);
        
        images.push({
          url,
          path: item.storagePath,
          name: item.name || `cover_${images.length + 1}.jpg`,
          metadata,
          item: {
            id: item.id,
            childName: item.childName
          }
        });
      } catch (error) {
        // Continue processing
      }
    }
  }

  return images;
};

/**
 * Get all images based on order ID from Firebase Storage
 * @param {string} orderId - The order ID to search for in metadata
 * @returns {Promise<Array>} Array of image objects with URLs
 */
export const getImagesByOrderId = async (orderId) => {
  if (!orderId) {
    throw new Error('Order ID is required');
  }
  
  try {
    console.log(`Searching for images with orderId: ${orderId}`);
    
    // First get all images from the artwork directory
    const artworkRef = ref(storage, 'artwork');
    const allFolders = await listAll(artworkRef);
    console.log(`Found ${allFolders.prefixes.length} user folders to check`);
    
    // Array to hold all matching images
    const matchingImages = [];
    
    // For debugging purposes
    const checkedFiles = [];
    const foundMetadata = [];
    
    // For each user folder, check all files
    for (const userFolder of allFolders.prefixes) {
      console.log(`Checking folder: ${userFolder.fullPath}`);
      let userFiles;
      try {
        userFiles = await listAll(userFolder);
        console.log(`Found ${userFiles.items.length} files in ${userFolder.fullPath}`);
      } catch (err) {
        console.warn(`Error listing files in ${userFolder.fullPath}:`, err);
        continue;
      }
      
      // For each file, check metadata
      for (const fileRef of userFiles.items) {
        try {
          checkedFiles.push(fileRef.fullPath);
          const metadata = await getMetadata(fileRef);
          
          // Log metadata for debugging
          if (metadata.customMetadata) {
            foundMetadata.push({
              path: fileRef.fullPath,
              metadata: metadata.customMetadata
            });
          }
          
          // Check if metadata contains this order ID
          if (metadata.customMetadata && 
              (metadata.customMetadata.orderId === orderId || 
               metadata.customMetadata.orderTemp === orderId)) {
            
            console.log(`Found matching image: ${fileRef.fullPath}`);
            
            // Get download URL
            const url = await getDownloadURL(fileRef);
            
            // Add to matching images
            matchingImages.push({
              url,
              path: fileRef.fullPath,
              name: metadata.customMetadata.originalName || metadata.name || fileRef.name,
              metadata,
              uploadedAt: metadata.customMetadata.uploadTimestamp || metadata.timeCreated
            });
          }
        } catch (error) {
          // Skip this file and continue
          console.warn(`Error processing file ${fileRef.fullPath}:`, error);
        }
      }
    }
    
    console.log(`Checked ${checkedFiles.length} files for order ID: ${orderId}`);
    console.log(`Found ${foundMetadata.length} files with custom metadata`);
    
    if (foundMetadata.length > 0) {
      console.log("Metadata samples:", foundMetadata.slice(0, 5));
    }
    
    if (matchingImages.length === 0) {
      // If no images found, try a broader search
      console.log("No images found with exact orderID. Trying broader search...");
      
      // Look through all files and check if any contains the order ID as a substring
      for (const filePath of checkedFiles) {
        if (filePath.includes(orderId)) {
          try {
            console.log(`Found file path containing order ID: ${filePath}`);
            const fileRef = ref(storage, filePath);
            const url = await getDownloadURL(fileRef);
            
            matchingImages.push({
              url,
              path: filePath,
              name: filePath.split('/').pop() || 'image.jpg',
              uploadedAt: new Date().toISOString()
            });
          } catch (err) {
            console.warn(`Error getting download URL for ${filePath}:`, err);
          }
        }
      }
    }
    
    return matchingImages;
  } catch (error) {
    console.error('Error fetching images by order ID:', error);
    throw error;
  }
};

/**
 * Download all images from an order as a zip file
 * @param {Object|string} orderOrId - Order object or order ID
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Blob>} Zip file as blob
 */
export const downloadOrderImagesAsZip = async (orderOrId, onProgress = () => {}) => {
  try {
    let images = [];
    let orderId;
    let order = null;
    
    // Determine order info and ID
    if (typeof orderOrId === 'string') {
      // It's an order ID
      orderId = orderOrId;
      console.log("Working with order ID:", orderId);
    } else if (orderOrId && orderOrId.id) {
      // It's an order object
      order = orderOrId;
      orderId = orderOrId.id;
      console.log("Working with order object, ID:", orderId);
    } else if (orderOrId) {
      // It might be some other object format
      order = orderOrId;
      orderId = orderOrId.id || orderOrId.orderId || orderOrId._id || null;
      console.log("Working with generic object, ID:", orderId);
    } else {
      throw new Error('Invalid order information provided');
    }
    
    // Try multiple methods to get images
    // Method 1: Get images directly from order object if possible
    if (order && order.items) {
      try {
        images = await getOrderImages(order);
        console.log("Method 1 - Images from order:", images.length);
      } catch (err) {
        console.warn("Error getting images from order object:", err);
      }
    }
    
    // Method 2: Look up images by order ID in metadata
    if (images.length === 0 && orderId) {
      try {
        images = await getImagesByOrderId(orderId);
        console.log("Method 2 - Images from order ID:", images.length);
      } catch (err) {
        console.warn("Error getting images by order ID:", err);
      }
    }
    
    // Method 3: Extract direct image URLs from order items
    if (images.length === 0 && order && order.items) {
      console.log("Method 3 - Checking direct URLs in items");
      const directImages = [];
      
      order.items.forEach(item => {
        try {
          // Check for storagePath
          if (item.storagePath) {
            directImages.push({
              url: item.storageUrl || `https://firebasestorage.googleapis.com/v0/b/your-project.appspot.com/o/${encodeURIComponent(item.storagePath)}?alt=media`,
              path: item.storagePath,
              name: item.name || 'image.jpg'
            });
          }
          // Check for standalone storageUrl
          else if (item.storageUrl) {
            directImages.push({
              url: item.storageUrl,
              path: '',
              name: item.name || 'image.jpg'
            });
          }
          // Check for coverImage URL
          else if (item.coverImage && !item.coverImage.startsWith('data:') && !item.coverImage.startsWith('blob:')) {
            directImages.push({
              url: item.coverImage,
              path: '',
              name: item.name || 'cover.jpg'
            });
          }
        } catch (err) {
          console.warn("Error processing item for direct URLs:", err);
        }
      });
      
      if (directImages.length > 0) {
        images = directImages;
        console.log("Found direct image URLs:", images.length);
      }
    }
    
    // Final check for image availability
    if (images.length === 0) {
      throw new Error('No images found for this order');
    }
    
    // Initialize zip
    const zip = new JSZip();
    const folder = zip.folder(`order_${orderId}_images`);
    
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
        console.warn(`Error processing image ${image.name}:`, error);
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
    throw error;
  }
};

/**
 * Download and save a zip file of order images
 * @param {Object|string} orderOrId - Order object or order ID
 * @param {Function} onProgress - Progress callback
 * @param {Function} onComplete - Completion callback
 * @param {Function} onError - Error callback
 */
export const saveOrderImagesAsZip = async (
  orderInfo, 
  onProgress = () => {}, 
  onComplete = () => {},
  onError = () => {}
) => {
  try {
    // Start progress
    onProgress(0);
    
    let images = [];
    
    // Check if we're using the direct paths approach
    if (typeof orderInfo === 'object' && orderInfo.directImagePaths) {
      // Handle direct paths from order document
      const paths = orderInfo.directImagePaths;
      if (paths.length === 0) {
        throw new Error('No images found in this order');
      }
      
      // Convert paths to image objects
      images = await Promise.all(paths.map(async (path, index) => {
        try {
          const storageRef = ref(storage, path);
          const url = await getDownloadURL(storageRef);
          
          // Try to get metadata if possible
          let metadata = {};
          try {
            metadata = await getMetadata(storageRef);
          } catch (err) {
            console.warn(`Could not get metadata for ${path}`);
          }
          
          return {
            url,
            path,
            name: `image_${index + 1}.jpg`,
            metadata
          };
        } catch (err) {
          console.warn(`Could not get URL for path: ${path}`, err);
          return null;
        }
      }));
      
      // Filter out any null results
      images = images.filter(Boolean);
      
      if (images.length === 0) {
        throw new Error('No images found in this order');
      }
    } else {
      // Use the original approach
      images = await getOrderImages(orderInfo);
    }
    
    if (images.length === 0) {
      throw new Error('No images found in this order');
    }
    
    // Get zip file (code from your existing implementation)
    const zipBlob = await downloadOrderImagesAsZip(images, onProgress);
    
    // Save the file
    saveAs(zipBlob, `order_${typeof orderInfo === 'object' ? orderInfo.id : orderInfo}_images.zip`);
    
    // Complete
    onProgress(100);
    onComplete();
  } catch (error) {
    onError(error);
  }
};