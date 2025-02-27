import React, { useState } from 'react';
import { Download, Loader, FileDown } from 'lucide-react';
import { saveOrderImagesAsZip } from '../../utils/firebaseStorageUtils';

const ImageDownloader = ({ order, buttonText = "Download Images" }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const downloadOrderImages = async () => {
    if (!order || !order.items || order.items.length === 0) {
      setError("No images found in this order");
      return;
    }

    setIsDownloading(true);
    setProgress(0);
    setError(null);

    try {
      // Use the utility function to handle all the download logic
      await saveOrderImagesAsZip(
        order,
        // Progress callback
        (progressValue) => {
          setProgress(progressValue);
        },
        // Complete callback
        () => {
          setProgress(100);
          setTimeout(() => {
            setIsDownloading(false);
            setProgress(0);
          }, 1000);
        },
        // Error callback
        (error) => {
          setError(`Error downloading images: ${error.message}`);
          setIsDownloading(false);
        }
      );
    } catch (err) {
      console.error("Error downloading images:", err);
      setError(`Error downloading images: ${err.message}`);
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
        <div className="text-destructive text-xs mt-2 text-center bg-destructive/10 px-2 py-1 rounded-md">{error}</div>
      )}
    </div>
  );
};

export default ImageDownloader;