import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { useFirestore } from '../hooks/useFirestore';
import { useAuth } from '../hooks/useAuth';
import { 
  ShoppingCart, 
  AlertTriangle, 
  LayoutGrid, 
  Layers, 
  Check, 
  ArrowRight,
  CheckCircle, 
  Info,
  Upload,
  Image
} from 'lucide-react';

// Import components
import BookCustomizationForm from '../components/product/BookCustomizationForm';
import { ProductImageSection } from '../components/product/image-handling';

// Book price constants in rupees
const BOOK_PRICES = {
  realistic: 2499, // Realistic Story - requires 10 to 15 images
  animated: 1499,  // Animated Story - requires only 1 image
};

const ProductPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addBook } = useCart();
  const { addDocument } = useFirestore('books');
  const { user } = useAuth();
  
  // Reference to track when uploads should start
  const uploadTriggerRef = useRef(false);
  
  // State for uploaded images
  const [images, setImages] = useState([]);
  const [uploadError, setUploadError] = useState('');
  const [uploadComplete, setUploadComplete] = useState(false);
  
  // Clear session storage on first load or page refresh
  useEffect(() => {
    // Clear uploaded images from session storage when component mounts
    if (sessionStorage.getItem('tap-artwork-temp')) {
      sessionStorage.removeItem('tap-artwork-temp');
      console.log('Cleared temporary artwork from session storage');
    }
  }, []);
  
  // State for form data
  const [formData, setFormData] = useState({
    childName: '',
    age: '',
    notes: '',
    bookType: 'realistic',  // 'realistic' or 'animated'
    storyOption: 'template',      // 'template', 'custom', or template ID for predefined templates
    customStory: '',        // for user's own story text
    selectedTemplate: 'template1', // Default selected template
  });
  
  // State for form validation errors
  const [formErrors, setFormErrors] = useState({});
  
  // State for active section on mobile
  const [activeSection, setActiveSection] = useState('upload'); // 'upload', 'customize', 'preview'
  
  // State for loading during submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for success message
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // State to control upload trigger
  const [triggerUpload, setTriggerUpload] = useState(false);
  
  // Effect to validate uploads based on book type
useEffect(() => {
  // For animated story, we need exactly 1 image
  // For realistic story, we need between 10-15 images
  let isValid = false;
  let errorMessage = '';
  
  if (formData.bookType === 'animated') {
    if (images.length > 1) {
      errorMessage = 'Animated Story requires exactly 1 image. Please remove extra images.';
    } else if (images.length < 1) {
      errorMessage = 'Please upload 1 image for your Animated Story.';
    } else if (images.length === 1 && !images[0].uploadComplete && images[0].storageUrl) {
      // Fix for images that have URLs but aren't marked as complete
      const updatedImages = [...images];
      updatedImages[0] = {...updatedImages[0], uploadComplete: true};
      setImages(updatedImages);
      isValid = true;
    } else if (images.length === 1 && !images[0].uploadComplete) {
      errorMessage = 'Image upload in progress... Please wait.';
    } else {
      isValid = true;
    }
  } else { // realistic
    if (images.length > 15) {
      errorMessage = 'Maximum 15 images allowed. Please remove extra images.';
    } else if (images.length < 10) {
      const remaining = 10 - images.length;
      errorMessage = `Please upload at least 10 images (${remaining} more needed).`;
    } else {
      // Fix for images that have URLs but aren't marked as complete
      const incompleteWithUrls = images.filter(img => !img.uploadComplete && img.storageUrl);
      if (incompleteWithUrls.length > 0) {
        const updatedImages = images.map(img => 
          (img.storageUrl && !img.uploadComplete) ? {...img, uploadComplete: true} : img
        );
        setImages(updatedImages);
        
        if (updatedImages.every(img => img.uploadComplete || img.storageUrl)) {
          isValid = true;
        }
      } else if (!images.every(img => img.uploadComplete)) {
        // Calculate how many are still uploading
        const pendingCount = images.filter(img => !img.uploadComplete).length;
        errorMessage = `${pendingCount} image${pendingCount > 1 ? 's' : ''} still uploading. Please wait until all uploads complete.`;
      } else {
        isValid = true;
      }
    }
  }
  
  setUploadComplete(isValid);
  setUploadError(errorMessage);
  
  // Clean up beforeunload handler when component unmounts
  return () => {
    window.onbeforeunload = null;
  };
}, [images, formData.bookType]);
  
  // Handle form validation
  const validateForm = () => {
    const errors = {};
    
    // Validate image count
    if (formData.bookType === 'animated') {
      if (images.length !== 1) {
        setUploadError('Animated Story requires exactly 1 image.');
        errors.images = true;
      }
    } else { // realistic
      if (images.length < 10) {
        setUploadError(`Please upload at least 10 images (${10 - images.length} more needed).`);
        errors.images = true;
      } else if (images.length > 15) {
        setUploadError('Maximum 15 images allowed. Please remove extra images.');
        errors.images = true;
      }
    }
    
    // Validate name
    if (!formData.childName.trim()) {
      errors.childName = 'Name is required';
    }
    
    // Validate story option
    if (formData.storyOption === 'custom' && !formData.customStory.trim()) {
      errors.customStory = 'Please provide your custom story';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle moving to the next section
  const handleContinue = () => {
    if (activeSection === 'upload') {
      // Validate image uploads based on book type
      let isValid = false;
      
      if (formData.bookType === 'animated') {
        if (images.length === 1) {
          // For animated books, one image is enough
          isValid = true;
          
          // If the image has a storage URL but isn't marked complete, fix it
          if (images[0].storageUrl && !images[0].uploadComplete) {
            const updatedImages = [...images];
            updatedImages[0] = {...updatedImages[0], uploadComplete: true};
            setImages(updatedImages);
          }
        } else {
          setUploadError('Animated Story requires exactly 1 image.');
        }
      } else { // realistic
        if (images.length >= 10 && images.length <= 15) {
          // For realistic books, check if all images with URLs are properly marked as complete
          const hasIncomplete = images.some(img => img.storageUrl && !img.uploadComplete);
          
          if (hasIncomplete) {
            // Fix any images that have URLs but aren't marked complete
            const updatedImages = images.map(img => 
              img.storageUrl && !img.uploadComplete ? {...img, uploadComplete: true} : img
            );
            setImages(updatedImages);
          }
          
          // Check if there are still images being uploaded
          const stillUploading = updatedImages ? 
            updatedImages.some(img => !img.uploadComplete && !img.storageUrl) : 
            images.some(img => !img.uploadComplete && !img.storageUrl);
          
          if (!stillUploading) {
            isValid = true;
          } else {
            setUploadError('Please wait for all images to finish uploading.');
          }
        } else if (images.length < 10) {
          setUploadError(`Please upload at least 10 images (${10 - images.length} more needed).`);
        } else {
          setUploadError('Maximum 15 images allowed. Please remove extra images.');
        }
      }
      
      if (isValid) {
        // Trigger any pending uploads when moving to the next section
        setTriggerUpload(true);
        
        // Move to the customize section after a small delay to allow uploads to start
        setTimeout(() => {
          setActiveSection('customize');
        }, 300);
      }
    } else if (activeSection === 'customize') {
      // Validate customization form
      const errors = {};
      
      if (!formData.childName.trim()) {
        errors.childName = 'Name is required';
      }
      
      // Validate story option
      if (formData.storyOption === 'custom' && !formData.customStory.trim()) {
        errors.customStory = 'Please provide your custom story';
      }
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      
      // Double check upload status one more time before proceeding
      const allComplete = images.every(img => img.uploadComplete || img.storageUrl);
      if (!allComplete) {
        // Fix any issues with upload status
        const updatedImages = images.map(img => 
          img.storageUrl ? {...img, uploadComplete: true} : img
        );
        setImages(updatedImages);
        setUploadComplete(true);
      }
      
      // Move to the cart section directly (no preview)
      handleAddToCart();
    }
  };
  
  // Handle Add to Cart
  const handleAddToCart = async () => {
    // Force mark all images as complete (whether with URLs or in session storage)
    const hasIncompleteImages = images.some(img => 
      (img.storageUrl && !img.uploadComplete) || 
      (img.storedInSession && !img.uploadComplete)
    );
    
    if (hasIncompleteImages) {
      const updatedImages = images.map(img => 
        img.storageUrl || img.storedInSession ? {...img, uploadComplete: true} : img
      );
      setImages(updatedImages);
      setUploadComplete(true);
    }
    
    // Consider all images with storedInSession as valid
    const allImagesValid = images.every(img => 
      img.uploadComplete || img.storageUrl || img.storedInSession
    );
    
    if (!uploadComplete && !allImagesValid) {
      setUploadError('Please wait for all images to finish processing');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create an array of image data - using preview URLs for session-stored images
      const bookImages = images.map((image, index) => ({
        index,
        url: image.storageUrl || image.preview,
        path: image.storagePath || null,
        name: image.name || `image-${index + 1}`,
        size: image.size,
        type: image.type,
        originalName: image.file?.name || image.name || `image-${index + 1}.jpg`,
        storedInSession: image.storedInSession || false
      }));
      
      // Create book data object
      const bookData = {
        userId: user ? user.uid : 'guest',
        childName: formData.childName,
        age: formData.age || null,
        notes: formData.notes || '',
        images: bookImages,
        coverImage: images[0].storageUrl || images[0].preview, // Use preview if no storage URL
        price: BOOK_PRICES[formData.bookType],
        bookType: formData.bookType,
        storyOption: formData.storyOption,
        customStory: formData.storyOption === 'custom' ? formData.customStory : '',
        status: 'draft',
        orderStatus: 'pending', // Will change when ordered
        imageCount: images.length,
        createdAt: new Date().toISOString(),
        customerEmail: user?.email || null,
        storedInSession: images.some(img => img.storedInSession),
        pendingFirebaseUpload: images.some(img => img.storedInSession)
      };
      
      // Generate a local ID for the book
      const localBookId = `book-${Date.now()}`;
      
      // Create cart item data
      const cartItemData = {
        ...bookData,
        id: localBookId,
        type: 'custom-book',
        dateAdded: new Date().toISOString()
      };
      
      // Add to cart
      addBook(cartItemData);
      
      // Show success message
      setShowSuccessMessage(true);
      
      // Keep session storage for now - will be used during checkout
      // But clear any flags for completion as we're considering the process complete
      sessionStorage.removeItem('tap-uploads-complete');
      sessionStorage.removeItem('tap-upload-triggered');
      
      // Force navigation after a short delay to ensure a smooth experience
      setTimeout(() => {
        setShowSuccessMessage(false);
        setIsSubmitting(false);
        navigate('/cart');
      }, 1500);
      
    } catch (error) {
      console.error('Error adding book to cart:', error);
      setIsSubmitting(false);
      setUploadError('Failed to add book to cart. Please try again.');
    }
  };
  
  // Handle image uploads complete
  const handleImagesComplete = (completedImages) => {
    // Ensure all images have the uploadComplete flag set
    const fixedImages = completedImages.map(img => 
      img.storageUrl ? {...img, uploadComplete: true} : img
    );
    
    setImages(fixedImages);
    setUploadComplete(true);
    setUploadError('');
  };

  useEffect(() => {
    // Set a timeout to reset stuck upload state after a reasonable time (e.g., 2 minutes)
    let timeoutId;
    
    if (images.some(img => !img.uploadComplete && !img.storageUrl)) {
      timeoutId = setTimeout(() => {
        // Fix any stuck images that have URLs but aren't marked complete
        const updatedImages = images.map(img => 
          img.storageUrl ? {...img, uploadComplete: true} : img
        );
        
        if (updatedImages.some(img => img.storageUrl)) {
          setImages(updatedImages);
          setUploadComplete(true);
        }
      }, 120000); // 2 minutes
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [images]);
  
  return (
    <div className="min-h-screen py-12">
      <div className="container px-4 md:px-6 mx-auto">
        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Create Your Custom Book</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload your child's artwork, customize your book details, and we'll transform them into a professional storybook.
          </p>
        </div>
        
        
        {/* Authentication Notice - Encourage login */}
        {!user && (
          <div className="mb-8 p-4 bg-primary/5 border border-primary/20 rounded-lg flex items-start gap-3">
            <div className="text-primary bg-primary/10 p-2 rounded-full">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Save your progress by signing in</h3>
              <p className="text-sm text-muted-foreground mt-1">
                <a href="/login" className="text-primary hover:underline">Sign in</a> or <a href="/signup" className="text-primary hover:underline">create an account</a> to save your book and access it later. You'll also be able to track your order.
              </p>
            </div>
          </div>
        )}
        
        {/* Mobile Section Tabs */}
        <div className="md:hidden mb-6">
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button
              className={`flex-1 py-3 text-sm font-medium ${
                activeSection === 'upload'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
              onClick={() => setActiveSection('upload')}
            >
              <span className="flex items-center justify-center">
                <Upload className="h-4 w-4 mr-1.5" />
                Artwork
              </span>
            </button>
            <button
              className={`flex-1 py-3 text-sm font-medium ${
                activeSection === 'customize'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
              onClick={() => setActiveSection('customize')}
            >
              <span className="flex items-center justify-center">
                <Layers className="h-4 w-4 mr-1.5" />
                Details
              </span>
            </button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Uploader Section */}
          <div className={`md:col-span-1 ${activeSection !== 'upload' && 'hidden md:block'}`}>
            <div className="bg-white dark:bg-card p-6 rounded-lg shadow-sm border border-border">
              <div className="flex items-center mb-4">
                <Image className="h-5 w-5 mr-2 text-primary" />
                <h2 className="text-xl font-semibold">Upload Your Artwork</h2>
              </div>
              
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium">Image Requirements</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formData.bookType === 'realistic' 
                        ? 'Upload 10-15 images for your Realistic Story. The more images you provide, the richer your story will be.' 
                        : 'Upload exactly 1 image for your Animated Story. Our AI will create an animated character from this single image.'}
                    </p>
                  </div>
                </div>
              </div>
              
              <ProductImageSection
                onImagesComplete={handleImagesComplete}
                onImagesChange={setImages}
                uploadTriggered={triggerUpload}
                maxImages={formData.bookType === 'realistic' ? 15 : 1}
                minImages={formData.bookType === 'realistic' ? 10 : 1}
              />
              
              {/* Book Type Selection */}
              <div className="mt-8 border-t border-border pt-6">
                <h3 className="text-sm font-medium mb-4">Choose Book Type</h3>
                
                <div className="grid grid-cols-1 gap-3">
                  <label 
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                      formData.bookType === 'realistic'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="bookType"
                      value="realistic"
                      checked={formData.bookType === 'realistic'}
                      onChange={() => setFormData(prev => ({ ...prev, bookType: 'realistic' }))}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                      formData.bookType === 'realistic'
                        ? 'border-primary'
                        : 'border-muted-foreground'
                    }`}>
                      {formData.bookType === 'realistic' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">Realistic Story</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Professional quality with detailed AI-enhanced illustrations (10-15 images)
                      </p>
                    </div>
                    <div className="ml-auto font-bold text-sm">
                      ₹2,499
                    </div>
                  </label>
                  
                  <label 
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                      formData.bookType === 'animated'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="bookType"
                      value="animated"
                      checked={formData.bookType === 'animated'}
                      onChange={() => setFormData(prev => ({ ...prev, bookType: 'animated' }))}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                      formData.bookType === 'animated'
                        ? 'border-primary'
                        : 'border-muted-foreground'
                    }`}>
                      {formData.bookType === 'animated' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">Animated Story</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Colorful animated illustrations generated from a single image
                      </p>
                    </div>
                    <div className="ml-auto font-bold text-sm">
                      ₹1,499
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Book Customization Form Section */}
          <div className={`md:col-span-1 ${activeSection !== 'customize' && 'hidden md:block'}`}>
            <div className="bg-white dark:bg-card p-6 rounded-lg shadow-sm border border-border">
              <div className="flex items-center mb-4">
                <Layers className="h-5 w-5 mr-2 text-primary" />
                <h2 className="text-xl font-semibold">Customize Your Book</h2>
              </div>
              
              <BookCustomizationForm
                formData={formData}
                setFormData={setFormData}
                errors={formErrors}
              />
              
              {/* Price and Add to Cart */}
              <div className="mt-8 p-4 bg-muted/30 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">
                      {formData.bookType === 'realistic' ? 'Realistic Storybook' : 'Cartoon-Style Book'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formData.bookType === 'realistic' 
                        ? 'Hardcover, 20 pages, 10-15 images' 
                        : 'Hardcover, 16 pages, cartoon style'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold">₹{BOOK_PRICES[formData.bookType].toLocaleString('en-IN')}</span>
                    <p className="text-xs text-muted-foreground">Free shipping</p>
                  </div>
                </div>
                
                {/* Warning about incomplete form */}
                {(uploadError || Object.keys(formErrors).length > 0) && (
                  <div className="mb-4 p-3 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500 rounded-md text-sm flex items-start">
                    <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Please complete the following:</p>
                      <ul className="mt-1 ml-5 list-disc text-xs space-y-1">
                        {uploadError && <li>{uploadError}</li>}
                        {formErrors.childName && <li>Enter name</li>}
                        {formErrors.customStory && <li>Provide your custom story</li>}
                      </ul>
                    </div>
                  </div>
                )}
                
                {/* Success Message */}
                <AnimatePresence>
                  {showSuccessMessage && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 p-3 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500 rounded-md text-sm flex items-center"
                    >
                      <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span>Book added to cart successfully!</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isSubmitting || showSuccessMessage || (!uploadComplete && !images.every(img => img.storageUrl || img.uploadComplete))}
                  className="w-full h-12 flex items-center justify-center rounded-md bg-primary px-6 font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding to Cart...
                    </>
                  ) : showSuccessMessage ? (
                    <>
                      <Check className="mr-2 h-5 w-5" />
                      Added to Cart
                    </>
                  ) : (!uploadComplete && images.some(img => !img.uploadComplete && !img.storageUrl)) ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Waiting for uploads...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart • ₹{BOOK_PRICES[formData.bookType].toLocaleString('en-IN')}
                    </>
                  )}
                </button>
                
                {/* Additional Information */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    All books include professional printing, binding, and free shipping.
                  </p>
                </div>
              </div>
              
              {/* Process Steps */}
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-3">What happens next?</h3>
                <ol className="relative border-l border-muted-foreground/20 pl-6 space-y-6 text-sm">
                  <li className="relative">
                    <div className="absolute -left-[23px] bg-primary h-4 w-4 rounded-full"></div>
                    <h4 className="font-medium">Order Processing</h4>
                    <p className="text-muted-foreground mt-1">
                      After checkout, our AI system will process your artwork and generate a custom story.
                    </p>
                  </li>
                  <li className="relative">
                    <div className="absolute -left-[23px] bg-muted-foreground/40 h-4 w-4 rounded-full"></div>
                    <h4 className="font-medium">Book Production</h4>
                    <p className="text-muted-foreground mt-1">
                      Your storybook will be professionally printed and bound with high-quality materials.
                    </p>
                  </li>
                  <li className="relative">
                    <div className="absolute -left-[23px] bg-muted-foreground/40 h-4 w-4 rounded-full"></div>
                    <h4 className="font-medium">Shipping</h4>
                    <p className="text-muted-foreground mt-1">
                      The finished book will be carefully packaged and shipped to your door within 7-10 business days.
                    </p>
                  </li>
                </ol>
              </div>
              
              {/* Learn More */}
              <div className="mt-8 p-4 border border-border rounded-lg bg-muted/10">
                <h3 className="text-sm font-medium mb-2">Questions about the process?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Learn more about how we create your custom storybooks and what makes them special.
                </p>
                <button className="inline-flex items-center text-sm text-primary hover:underline">
                  Learn about our process
                  <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation Buttons */}
        <div className="md:hidden flex justify-between mt-8">
          {activeSection === 'upload' ? (
            <div></div>
          ) : (
            <button
              onClick={() => {
                setActiveSection('upload');
              }}
              className="px-4 py-2 border border-input rounded-md text-sm font-medium"
            >
              Previous
            </button>
          )}
          
          <button
            onClick={activeSection === 'customize' ? handleAddToCart : handleContinue}
            disabled={isSubmitting || (!uploadComplete && !images.every(img => img.storageUrl || img.uploadComplete))}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50 disabled:pointer-events-none"
            data-upload-trigger={activeSection === 'upload' ? 'true' : undefined}
          >
            {isSubmitting ? 'Adding...' : 
             ((!uploadComplete && images.some(img => !img.uploadComplete && !img.storageUrl)) ? 'Uploading...' : 
              activeSection === 'customize' ? 'Add to Cart' : 'Continue')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;