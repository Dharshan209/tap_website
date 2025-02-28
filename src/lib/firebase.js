import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  connectAuthEmulator,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
  setLogLevel 
} from 'firebase/firestore';
import { 
  getStorage, 
  connectStorageEmulator 
} from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate Firebase configuration
const validateFirebaseConfig = (config) => {
  const requiredKeys = [
    'apiKey', 'authDomain', 'projectId', 
    'storageBucket', 'messagingSenderId', 'appId'
  ];

  const missingKeys = requiredKeys.filter(key => !config[key]);
  
  if (missingKeys.length > 0) {
    console.error('Missing Firebase configuration keys:', missingKeys);
    throw new Error('Invalid Firebase configuration. Check your environment variables.');
  }
};

// Validate config before initialization
validateFirebaseConfig(firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Configure logging levels
if (import.meta.env.DEV) {
  // More verbose logging in development
  setLogLevel('debug');
}

// Connect to Firebase emulators in development environment
const connectEmulators = () => {
  const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';
  
  if (useEmulators) {
    console.log('🔌 Connecting to Firebase Emulators');
    
    try {
      connectAuthEmulator(auth, 'http://localhost:9099');
      connectFirestoreEmulator(db, 'localhost', 8080);
      connectStorageEmulator(storage, 'localhost', 9199);
      
      console.log('✅ Firebase emulators connected successfully');
    } catch (error) {
      console.error('❌ Failed to connect to Firebase emulators:', error);
    }
  }
};

// Enable offline persistence for Firestore in production
const enablePersistence = () => {
  if (import.meta.env.PROD) {
    enableIndexedDbPersistence(db)
      .catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('Firestore persistence: Multiple tabs open');
        } else if (err.code === 'unimplemented') {
          console.warn('Browser does not support Firestore persistence');
        }
      });
  }
};

// Monitor authentication state changes
const monitorAuthState = () => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('👤 User logged in:', user.email);
    } else {
      console.log('🚪 User logged out');
    }
  });
};

// Initialize emulators and persistence
connectEmulators();
enablePersistence();

// Only monitor auth state in development
if (import.meta.env.DEV) {
  monitorAuthState();
}

// Export Firebase services
export { auth, db, storage };
export default app;