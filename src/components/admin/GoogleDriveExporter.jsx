import React, { useState } from 'react';
import { CloudUpload, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { getOrderImages } from '../../utils/firebaseStorageUtils';

// This component handles exporting order images to Google Drive
// This frontend component would need to be paired with a backend Cloud Function
// that handles the actual Google Drive API integration

const GoogleDriveExporter = ({ order, buttonText = "Export to Google Drive" }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [driveUrl, setDriveUrl] = useState(null);

  const exportToDrive = async () => {
    if (!order || !order.id) {
      setError("Invalid order data");
      return;
    }

    setIsExporting(true);
    setProgress(0);
    setError(null);
    setSuccess(false);
    setDriveUrl(null);

    try {
      // Step 1: Fetch all the image data from Firebase Storage
      setProgress(10);
      const images = await getOrderImages(order);
      
      if (images.length === 0) {
        throw new Error("No images found in this order");
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