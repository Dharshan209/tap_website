import React, { useState } from 'react';
import { CloudUpload, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { getOrderImages, getImagesByOrderId } from '../../utils/firebaseStorageUtils';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../../lib/firebase';

// This component handles exporting order images to Google Drive
// This frontend component would need to be paired with a backend Cloud Function
// that handles the actual Google Drive API integration

const GoogleDriveExporter = ({ order, orderId, buttonText = "Export to Google Drive" }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [driveUrl, setDriveUrl] = useState(null);

  const exportToDrive = async () => {
    // We can work with either an order object or just an order ID
    if ((!order && !orderId) || (order && !order.id && !orderId)) {
      setError("No valid order information provided");
      return;
    }
    
    const id = orderId || (order && order.id);

    setIsExporting(true);
    setProgress(0);
    setError(null);
    setSuccess(false);
    setDriveUrl(null);

    try {
      // Step 1: Fetch all the image data from Firebase Storage
      setProgress(10);
      let images = [];
      
      // Try different methods to get images
      if (order && order.items) {
        try {
          images = await getOrderImages(order);
          console.log("Images from order:", images.length);
        } catch (err) {
          console.warn("Error getting images from order object:", err);
        }
      }
      
      // If no images found directly in order, try using ID to find them
      if (images.length === 0) {
        const id = orderId || (order && order.id);
        if (id) {
          try {
            images = await getImagesByOrderId(id);
            console.log("Images from order ID:", images.length);
          } catch (err) {
            console.warn("Error getting images by order ID:", err);
          }
        }
      }
      
      // Check item storagePaths directly as a last resort
      if (images.length === 0 && order && order.items) {
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
          images = results.filter(Boolean); // Remove nulls
          console.log("Images from direct paths:", images.length);
        }
      }
      
      console.log("Total images found:", images.length);
      if (images.length === 0) {
        throw new Error("No images found for this order");
      }
      
      setProgress(30);
      
      // Step 2: Call the backend API to handle Google Drive upload
      // This would be a Cloud Function that takes care of:
      // - Authenticating with Google Drive API
      // - Creating a folder with the order ID as name
      // - Uploading each image to that folder
      // - Returning the folder URL
      
      // Mock API call (replace with actual implementation)
      const response = await fetch('/api/export-to-drive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          images: images.map(img => ({
            path: img.path,
            name: img.name
          })),
          customerInfo: {
            name: order.shippingDetails?.fullName || 'Customer',
            email: order.shippingDetails?.email || 'Unknown'
          }
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to export to Google Drive');
      }
      
      const result = await response.json();
      setProgress(90);
      
      // Success! 
      setDriveUrl(result.folderUrl);
      setSuccess(true);
      setProgress(100);
    } catch (err) {
      console.error("Error exporting to Google Drive:", err);
      setError(err.message || 'An error occurred during export');
    } finally {
      // Keep success message visible, but eventually hide the loading state
      setTimeout(() => {
        setIsExporting(false);
      }, 1000);
    }
  };

  return (
    <div>
      <button
        onClick={exportToDrive}
        disabled={isExporting}
        className="inline-flex items-center justify-center rounded-md bg-green-600 hover:bg-green-700 px-4 py-2 text-sm font-medium text-white shadow transition-colors disabled:opacity-70"
      >
        {isExporting ? (
          <>
            <Loader className="h-4 w-4 mr-2 animate-spin" />
            {progress < 100 ? `Exporting ${Math.round(progress)}%` : "Finalizing..."}
          </>
        ) : (
          <>
            <CloudUpload className="h-4 w-4 mr-2" />
            {buttonText}
          </>
        )}
      </button>
      
      {error && (
        <div className="mt-2 p-2 bg-destructive/10 text-destructive text-sm rounded-md flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      {success && driveUrl && (
        <div className="mt-2 p-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-sm rounded-md flex items-center">
          <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <div>
            <p>Successfully exported to Google Drive!</p>
            <a 
              href={driveUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary/90"
            >
              Open in Google Drive
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleDriveExporter;