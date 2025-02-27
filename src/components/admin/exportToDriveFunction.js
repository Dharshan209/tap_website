const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { google } = require('googleapis');
const stream = require('stream');
const fetch = require('node-fetch');

admin.initializeApp();

// Set up Google OAuth2 credentials
// You need to create a service account and generate credentials in the Google Cloud Console
// Then store these credentials securely in Firebase Functions config
const setupGoogleAuth = () => {
  const credentials = functions.config().googleapi || {};
  
  if (!credentials.client_email || !credentials.private_key) {
    throw new Error('Google API credentials not configured');
  }
  
  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  
  return auth;
};

// Create a folder in Google Drive
const createDriveFolder = async (auth, folderName) => {
  const drive = google.drive({ version: 'v3', auth });
  
  const fileMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };
  
  const response = await drive.files.create({
    resource: fileMetadata,
    fields: 'id,webViewLink',
  });
  
  return response.data;
};

// Upload a file to a Google Drive folder
const uploadFileToDrive = async (auth, folderID, fileName, fileStream, mimeType) => {
  const drive = google.drive({ version: 'v3', auth });
  
  const fileMetadata = {
    name: fileName,
    parents: [folderID],
  };
  
  const media = {
    mimeType,
    body: fileStream,
  };
  
  const response = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id,webViewLink',
  });
  
  return response.data;
};

// Export order images to Google Drive
exports.exportOrderToDrive = functions.https.onCall(async (data, context) => {
  try {
    // Verify authentication
    if (!context.auth) {
      throw new Error('Authentication required');
    }

    // Check if user is admin (optional)
    const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
    if (!userDoc.exists || !userDoc.data().isAdmin) {
      throw new Error('Admin privileges required');
    }
    
    // Extract data
    const { orderId, images, customerInfo } = data;
    
    if (!orderId || !images || !Array.isArray(images) || images.length === 0) {
      throw new Error('Invalid request data');
    }
    
    // Setup Google Auth
    const auth = setupGoogleAuth();
    
    // Create a folder for the order
    const folderName = `Order ${orderId} - ${customerInfo.name || 'Customer'}`;
    const folder = await createDriveFolder(auth, folderName);
    
    // Upload each image to the folder
    const uploadPromises = images.map(async (image) => {
      try {
        // Get download URL from Firebase Storage
        const fileRef = admin.storage().bucket().file(image.path);
        const [downloadUrl] = await fileRef.getSignedUrl({
          action: 'read',
          expires: Date.now() + 5 * 60 * 1000, // 5 minutes
        });
        
        // Fetch the image
        const response = await fetch(downloadUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        
        // Convert to stream
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const bufferStream = new stream.PassThrough();
        bufferStream.end(buffer);
        
        // Determine MIME type
        const mimeType = response.headers.get('content-type') || 'image/jpeg';
        
        // Upload to Drive
        return await uploadFileToDrive(auth, folder.id, image.name, bufferStream, mimeType);
      } catch (error) {
        console.error(`Error uploading image ${image.path}:`, error);
        return { error: error.message, path: image.path };
      }
    });
    
    // Wait for all uploads to complete
    const results = await Promise.all(uploadPromises);
    
    // Make folder accessible via link (optional)
    await google.drive({ version: 'v3', auth }).permissions.create({
      fileId: folder.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });
    
    // Return the folder URL and results
    return {
      success: true,
      folderUrl: folder.webViewLink,
      folderId: folder.id,
      results: results,
    };
    
  } catch (error) {
    console.error('Export to Drive error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});