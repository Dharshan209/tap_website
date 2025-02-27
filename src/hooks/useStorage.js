import { useState, useCallback, useEffect } from 'react';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject, 
  listAll,
  getMetadata,
  updateMetadata
} from 'firebase/storage';
import { storage } from '../lib/firebase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Custom hook for Firebase Storage operations
 */
export const useStorage = () => {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [url, setUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTasks, setUploadTasks] = useState({});

  // Clear any error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clean up any resources when the component unmounts
  useEffect(() => {
    return () => {
      // Cancel any ongoing upload tasks
      Object.values(uploadTasks).forEach(task => {
        if (task && typeof task.cancel === 'function') {
          task.cancel();
        }
      });
    };
  }, [uploadTasks]);

  /**
   * Generate a unique filename
   * @param {string} originalName - Original file name
   * @returns {string} - Unique filename
   */
  const generateUniqueFilename = useCallback((originalName) => {
    const extension = originalName.split('.').pop();
    return `${uuidv4()}.${extension}`;
  }, []);

  /**
   * Upload a file to Firebase Storage
   * @param {File} file - The file to upload
   * @param {string} path - The storage path
   * @param {Object} metadata - Optional metadata
   * @param {function} onProgress - Optional progress callback
   * @returns {Promise<Object>} - Upload result with URL and metadata
   */
  const uploadFile = useCallback(async (
    file, 
    path = 'uploads', 
    metadata = {}, 
    onProgress = null
  ) => {
    if (!file) {
      const error = new Error('No file provided');
      console.error('Upload error:', error);
      setError(error.message);
      throw error;
    }
    
    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      const error = new Error(`File size exceeds 5MB limit. File: ${file.name}, Size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      console.error('Upload error:', error);
      setError(error.message);
      throw error;
    }
    
    // Reset states
    setProgress(0);
    setError(null);
    setUrl(null);
    setIsUploading(true);
    
    try {
      // Validate path - ensure user is authenticated if needed
      if (path.includes('undefined') || path.includes('null')) {
        throw new Error('Invalid storage path. Authentication may be required.');
      }
      
      // Generate a unique filename to prevent collisions
      const filename = generateUniqueFilename(file.name);
      const fullPath = `${path}/${filename}`;
      
      const storageRef = ref(storage, fullPath);
      
      // Create file metadata including the content type
      const fileMetadata = {
        contentType: file.type,
        customMetadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          size: file.size.toString(),
          ...metadata.customMetadata
        },
        ...metadata
      };
      
      // Start the upload task
      const uploadTask = uploadBytesResumable(storageRef, file, fileMetadata);
      
      // Store the upload task for potential cancellation
      const taskId = uuidv4();
      setUploadTasks(prev => ({ ...prev, [taskId]: uploadTask }));
      
      // Return a promise that resolves with the download URL when complete
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          // Progress tracking
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress(progress);
            
            if (onProgress) {
              onProgress(progress, snapshot);
            }
          },
          // Error handling
          (error) => {
            console.error(`Upload error for ${file.name}:`, error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            console.error('Error server response:', error.serverResponse);
            
            // Provide more user-friendly error messages based on error code
            let userMessage = error.message;
            
            if (error.code === 'storage/unauthorized') {
              userMessage = 'You need to be logged in to upload files. Please sign in and try again.';
            } else if (error.code === 'storage/quota-exceeded') {
              userMessage = 'Storage quota exceeded. Please contact support.';
            } else if (error.code === 'storage/retry-limit-exceeded') {
              userMessage = 'Network error. Please check your internet connection and try again.';
            } else if (error.code === 'storage/invalid-format') {
              userMessage = 'Invalid file format. Please use JPG, PNG, GIF, or WebP files.';
            } else if (error.code === 'storage/canceled') {
              userMessage = 'Upload was cancelled.';
            }
            
            setError(userMessage);
            setIsUploading(false);
            
            // Remove the task from the tasks list
            setUploadTasks(prev => {
              const updated = { ...prev };
              delete updated[taskId];
              return updated;
            });
            
            reject(new Error(userMessage));
          },
          // Upload complete
          async () => {
            try {
              // Get download URL
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              setUrl(downloadUrl);
              
              // Get the metadata
              const metadata = await getMetadata(uploadTask.snapshot.ref);
              
              // Result object
              const result = {
                url: downloadUrl,
                path: fullPath,
                filename,
                ref: uploadTask.snapshot.ref,
                metadata,
                originalName: file.name,
                contentType: file.type,
                size: file.size,
                uploadedAt: new Date().toISOString()
              };
              
              setIsUploading(false);
              
              // Remove the task from the tasks list
              setUploadTasks(prev => {
                const updated = { ...prev };
                delete updated[taskId];
                return updated;
              });
              
              resolve(result);
            } catch (error) {
              console.error(`Error finalizing upload for ${file.name}:`, error);
              setError(error.message);
              setIsUploading(false);
              
              // Remove the task from the tasks list
              setUploadTasks(prev => {
                const updated = { ...prev };
                delete updated[taskId];
                return updated;
              });
              
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error(`Unexpected error in uploadFile for ${file.name}:`, error);
      setError(error.message);
      setIsUploading(false);
      throw error;
    }
  }, [generateUniqueFilename]);

  /**
   * Upload multiple files to Firebase Storage with parallel processing
   * @param {Array<File>} files - Array of files to upload
   * @param {string} path - The storage path
   * @param {Object} metadata - Optional metadata
   * @param {function} onProgress - Optional overall progress callback
   * @param {function} onFileProgress - Optional per-file progress callback
   * @param {number} concurrency - Maximum number of concurrent uploads (default: 3)
   * @returns {Promise<Array<Object>>} - Array of upload results
   */
  const uploadMultipleFiles = useCallback(async (
    files, 
    path = 'uploads', 
    metadata = {}, 
    onProgress = null,
    onFileProgress = null,
    concurrency = 3
  ) => {
    if (!files || !files.length) {
      const error = new Error('No files provided');
      setError(error.message);
      throw error;
    }
    
    // Track progress of each file
    const fileProgressMap = new Map();
    const results = new Array(files.length);
    let completedCount = 0;
    
    // Function to calculate and report overall progress
    const updateOverallProgress = () => {
      if (!onProgress) return;
      
      let totalProgress = 0;
      fileProgressMap.forEach(progress => {
        totalProgress += progress;
      });
      
      // Calculate weighted progress based on completed files and in-progress files
      const overallProgress = (
        (completedCount * 100) + totalProgress
      ) / files.length;
      
      onProgress(Math.min(overallProgress, 99.9)); // Cap at 99.9% until truly done
    };
    
    // Process files in batches with limited concurrency
    try {
      // Create a queue of files to process
      const queue = [...files];
      const activeUploads = new Set();
      const results = [];
      
      // Process queue until empty
      while (queue.length > 0 || activeUploads.size > 0) {
        // Fill up to concurrency limit
        while (queue.length > 0 && activeUploads.size < concurrency) {
          const file = queue.shift();
          const fileIndex = files.indexOf(file);
          
          // Initialize progress tracking for this file
          fileProgressMap.set(fileIndex, 0);
          
          // Create file metadata with index information
          const fileMetadata = {
            ...metadata,
            customMetadata: {
              ...metadata.customMetadata,
              fileIndex: fileIndex.toString(),
              totalFiles: files.length.toString(),
              fileName: file.name,
            }
          };
          
          // Custom progress tracker for this file
          const fileProgressTracker = (progress, snapshot) => {
            fileProgressMap.set(fileIndex, progress);
            
            if (onFileProgress) {
              onFileProgress(progress, fileIndex, file, snapshot);
            }
            
            updateOverallProgress();
          };
          
          // Create upload promise
          const uploadPromise = (async () => {
            try {
              // Upload the file
              const result = await uploadFile(file, path, fileMetadata, fileProgressTracker);
              
              // Mark as completed
              completedCount++;
              fileProgressMap.set(fileIndex, 100);
              updateOverallProgress();
              
              return { index: fileIndex, result, status: 'success' };
            } catch (error) {
              return { 
                index: fileIndex, 
                error, 
                status: 'error',
                file,
              };
            } finally {
              activeUploads.delete(uploadPromise);
            }
          })();
          
          // Add to active uploads
          activeUploads.add(uploadPromise);
          
          // Add to results
          results.push(uploadPromise);
        }
        
        // Wait for at least one upload to complete if we're at concurrency limit
        if (activeUploads.size >= concurrency || queue.length === 0) {
          await Promise.race(activeUploads);
        }
      }
      
      // Wait for all promises to resolve
      const uploadResults = await Promise.all(results);
      
      // Check for errors
      const errors = uploadResults.filter(r => r.status === 'error');
      if (errors.length > 0) {
        const errorMessage = `${errors.length} of ${files.length} uploads failed`;
        setError(errorMessage);
        
        // Include the first error message for more context
        if (errors[0].error) {
          console.warn('First upload error:', errors[0].error);
        }
      }
      
      // Sort results by original index and extract result objects
      return uploadResults
        .filter(r => r.status === 'success')
        .sort((a, b) => a.index - b.index)
        .map(r => r.result);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [uploadFile]);

  /**
   * Delete a file from Firebase Storage
   * @param {string} path - Full path to the file
   * @returns {Promise<boolean>} - Success status
   */
  const deleteFile = useCallback(async (path) => {
    setError(null);
    
    try {
      if (!path) {
        throw new Error('No file path provided');
      }
      
      const fileRef = ref(storage, path);
      await deleteObject(fileRef);
      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  /**
   * Delete multiple files from Firebase Storage
   * @param {Array<string>} paths - Array of file paths
   * @returns {Promise<Array<boolean>>} - Array of success statuses
   */
  const deleteMultipleFiles = useCallback(async (paths) => {
    setError(null);
    
    if (!paths || !paths.length) {
      return [];
    }
    
    try {
      const results = await Promise.all(
        paths.map(async (path) => {
          try {
            await deleteFile(path);
            return true;
          } catch (error) {
            console.error(`Error deleting file ${path}:`, error);
            return false;
          }
        })
      );
      
      return results;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [deleteFile]);

  /**
   * Get download URL for a file
   * @param {string} path - Full path to the file
   * @returns {Promise<string>} - Download URL
   */
  const getFileUrl = useCallback(async (path) => {
    setError(null);
    
    try {
      if (!path) {
        throw new Error('No file path provided');
      }
      
      const fileRef = ref(storage, path);
      const url = await getDownloadURL(fileRef);
      return url;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  /**
   * List all files in a directory
   * @param {string} path - Directory path
   * @returns {Promise<Array<Object>>} - Array of file references
   */
  const listFiles = useCallback(async (path) => {
    setError(null);
    
    try {
      if (!path) {
        throw new Error('No path provided');
      }
      
      const directoryRef = ref(storage, path);
      const res = await listAll(directoryRef);
      
      // Get file details (URLs and metadata) for each item
      const filePromises = res.items.map(async (itemRef) => {
        try {
          const url = await getDownloadURL(itemRef);
          const metadata = await getMetadata(itemRef);
          
          return {
            name: itemRef.name,
            fullPath: itemRef.fullPath,
            url,
            metadata,
            ref: itemRef
          };
        } catch (error) {
          console.error(`Error getting details for ${itemRef.fullPath}:`, error);
          return {
            name: itemRef.name,
            fullPath: itemRef.fullPath,
            error: error.message,
            ref: itemRef
          };
        }
      });
      
      const files = await Promise.all(filePromises);
      return files;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  /**
   * Update metadata for a file
   * @param {string} path - Full path to the file
   * @param {Object} newMetadata - New metadata to set
   * @returns {Promise<Object>} - Updated metadata
   */
  const updateFileMetadata = useCallback(async (path, newMetadata) => {
    setError(null);
    
    try {
      if (!path) {
        throw new Error('No file path provided');
      }
      
      if (!newMetadata) {
        throw new Error('No metadata provided');
      }
      
      const fileRef = ref(storage, path);
      const updatedMetadata = await updateMetadata(fileRef, newMetadata);
      return updatedMetadata;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  return {
    progress,
    error,
    url,
    isUploading,
    clearError,
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    deleteMultipleFiles,
    getFileUrl,
    listFiles,
    updateFileMetadata
  };
};