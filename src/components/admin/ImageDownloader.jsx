import React, { useState, useEffect } from 'react';
import { Download, Loader, FileDown, Image, AlertCircle } from 'lucide-react';
import { saveOrderImagesAsZip } from '../../utils/firebaseStorageUtils';
import { getDownloadURL, ref } from 'firebase/storage';
import { getDoc, doc } from 'firebase/firestore';
import { db, storage } from '../../lib/firebase';

const ImageDownloader = ({ order, orderId, buttonText = "Download Images" }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [noImages, setNoImages] = useState(false);

  // Reset error when props change
  useEffect(() => {
    setError(null);
    setNoImages(false);
  }, [order, orderId]);

  const downloadOrderImages = async () => {
    // We can work with either an order object or just an order ID
    if (!order && !orderId) {
      setError("No order information provided");
      return;
    }
    
    // Use orderId directly if provided, otherwise get it from order object
    const orderID = orderId || (order && order.id);
    
    console.log("ImageDownloader - Attempting download with order ID:", orderID);

    setIsDownloading(true);
    setProgress(0);
    setError(null);
    setNoImages(false);

    try {
      // First, check if we need to fetch the order from Firestore to get image paths
      let orderData = order;
      let imagePaths = [];
      
      // If we don't have the full order data or need to ensure we have the latest data
      if (!orderData || !orderData.images) {
        try {
          console.log("Fetching order from Firestore to check for image paths");
          const orderDoc = await getDoc(doc(db, 'orders', orderID));
          
          if (orderDoc.exists()) {
            orderData = { ...orderDoc.data(), id: orderID };
            console.log("Found order document:", orderData);
          } else {
            console.log("Order document not found in Firestore");
          }
        } catch (fetchErr) {
          console.error("Error fetching order:", fetchErr);
        }
      }
      
      // Check if the order has an images array directly attached
      if (orderData && Array.isArray(orderData.images)) {
        console.log("Found images array in order document:", orderData.images.length);
        imagePaths = orderData.images
          .map(img => typeof img === 'string' ? img : (img.path || img.storagePath))
          .filter(Boolean);
        
        if (imagePaths.length > 0) {
          console.log("Found valid image paths:", imagePaths);
          
          // Create direct download using these paths
          try {
            // Download each image and create a zip
            let downloadProgress = 0;
            onProgress(0);
            
            // Download each image from its path
            const imagePromises = imagePaths.map(async (path, index) => {
              try {
                const storageRef = ref(storage, path);
                const url = await getDownloadURL(storageRef);
                
                // Report progress
                downloadProgress += 100 / imagePaths.length;
                setProgress(Math.min(90, downloadProgress)); // Cap at 90% until zip is created
                
                return {
                  url,
                  path,
                  name: `image_${index + 1}.jpg`
                };
              } catch (err) {
                console.warn(`Could not download image from path: ${path}`, err);
                return null;
              }
            });
            
            const downloadedImages = (await Promise.all(imagePromises)).filter(Boolean);
            
            if (downloadedImages.length === 0) {
              throw new Error('Failed to download any images');
            }
            
            // Create and download zip file
            // (You'll need to implement this part with your existing zip creation logic)
            // For example:
            // const zipBlob = await createZipFromImages(downloadedImages);
            // downloadZipFile(zipBlob, `order_${orderID}_images.zip`);
            
            // For now, we'll use the existing utility
            await saveOrderImagesAsZip(
              { id: orderID, imageArray: downloadedImages }, // Pass a custom format
              setProgress,
              () => {
                setProgress(100);
                setTimeout(() => {
                  setIsDownloading(false);
                  setProgress(0);
                }, 1000);
              },
              (innerError) => {
                console.error("Error in custom zip creation:", innerError);
                setError(`Error creating zip file: ${innerError.message}`);
                setIsDownloading(false);
              }
            );
            
            return; // Exit early if successful
          } catch (directErr) {
            console.error("Error in direct download approach:", directErr);
            // Fall through to standard approach
          }
        }
      }
      
      // Try with standard approach if direct download didn't succeed
      try {
        // We need a valid order object for getOrderImages function
        // If we only have ID but no valid order object, create a minimal one
        const validOrderObject = orderData || { 
          id: orderID,
          items: [{ id: orderID }] // Minimal items array to pass validation
        };
        
        await saveOrderImagesAsZip(
          validOrderObject,
          setProgress,
          () => {
            setProgress(100);
            setTimeout(() => {
              setIsDownloading(false);
              setProgress(0);
            }, 1000);
          },
          (error) => {
            console.error("Error in saveOrderImagesAsZip:", error);
            
            if (error.message.includes("No images found") || 
                error.message.includes("Invalid order data")) {
              setNoImages(true);
            } else {
              setError(`Error downloading images: ${error.message}`);
            }
            
            setIsDownloading(false);
          }
        );
      } catch (standardErr) {
        console.error("Error in standard approach:", standardErr);
        setNoImages(true);
        setIsDownloading(false);
      }
      
    } catch (err) {
      console.error("Error downloading images:", err);
      
      if (err.message.includes("No images found")) {
        setNoImages(true);
      } else {
        setError(`Error downloading images: ${err.message}`);
      }
      
      setIsDownloading(false);
    }
  };

  return (
    <div className="inline-flex flex-col items-center">
      <button
        onClick={downloadOrderImages}
        disabled={isDownloading}
        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-70 relative"
        aria-label="Download images"
        title="Download all images for this order"
      >
        {isDownloading ? (
          <>
            <Loader className="h-4 w-4 mr-2 animate-spin" />
            {progress < 100 ? `Downloading ${Math.round(progress)}%` : "Finalizing..."}
          </>
        ) : (
          <>
            <FileDown className="h-4 w-4 mr-2" />
            {buttonText}
          </>
        )}
        
        {/* Visual Progress Bar */}
        {isDownloading && (
          <div className="absolute left-0 bottom-0 h-1 bg-white/30 rounded-b-md" 
               style={{ width: `${progress}%`, transition: 'width 0.3s ease-in-out' }}></div>
        )}
      </button>
      
      {error && (
        <div className="text-destructive text-xs mt-2 text-center bg-destructive/10 px-2 py-1 rounded-md flex items-center">
          <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
          {error}
        </div>
      )}
      
      {noImages && (
        <div className="mt-2 text-amber-600 text-xs text-center bg-amber-50 px-3 py-1.5 rounded-md flex items-center">
          <Image className="h-3 w-3 mr-1 flex-shrink-0" />
          <div>
            <p>No images found for this order.</p>
            <p className="text-xs">Images may have been deleted or may not have been uploaded yet.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageDownloader;