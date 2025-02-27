import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  updateEmail as firebaseUpdateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

// Create the auth context
const AuthContext = createContext();

// Auth provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Clear error
  const clearError = () => setError(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setLoading(true);
      try {
        if (authUser) {
          // User is signed in
          setUser(authUser);
          
          // Get user profile data from Firestore
          const userDocRef = doc(db, 'users', authUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            // User profile exists
            const userData = userDoc.data();
            setUserProfile(userData);
            
            // Check if user is admin
            setIsAdmin(userData.isAdmin === true);
          } else {
            // Create new user profile
            const newUserData = {
              email: authUser.email,
              displayName: authUser.displayName || '',
              photoURL: authUser.photoURL || '',
              createdAt: serverTimestamp(),
              isAdmin: false,
              lastLogin: serverTimestamp()
            };
            
            await setDoc(userDocRef, newUserData);
            setUserProfile(newUserData);
            setIsAdmin(false);
          }
        } else {
          // User is signed out
          setUser(null);
          setUserProfile(null);
          setIsAdmin(false);
        }
      } catch (err) {
        // Handle auth state change error more gracefully
        setError('Authentication service is temporarily unavailable');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sign up a new user
  const signup = async (email, password, displayName) => {
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      if (displayName) {
        await firebaseUpdateProfile(userCredential.user, { displayName });
      }
      
      // Send email verification
      await sendEmailVerification(userCredential.user);
      
      // Create user profile in Firestore
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        email,
        displayName: displayName || '',
        photoURL: '',
        createdAt: serverTimestamp(),
        isAdmin: false,
        lastLogin: serverTimestamp()
      });
      
      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if this is a new user
      const userDocRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Create user profile in Firestore
        await setDoc(userDocRef, {
          email: result.user.email,
          displayName: result.user.displayName || '',
          photoURL: result.user.photoURL || '',
          createdAt: serverTimestamp(),
          isAdmin: false,
          lastLogin: serverTimestamp()
        });
      } else {
        // Update last login time
        await updateDoc(userDocRef, {
          lastLogin: serverTimestamp()
        });
      }
      
      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign in existing user
  const login = async (email, password) => {
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login time
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await updateDoc(userDocRef, {
        lastLogin: serverTimestamp()
      });
      
      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign out
  const logout = async () => {
    setError(null);
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    setError(null);
    try {
      // Update Firebase Auth profile
      await firebaseUpdateProfile(auth.currentUser, updates);
      
      // Update Firestore profile
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          ...updates
        });
      }
      
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Update email
  const updateEmail = async (newEmail) => {
    setError(null);
    try {
      // Update Firebase Auth email
      await firebaseUpdateEmail(auth.currentUser, newEmail);
      
      // Update Firestore profile
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, {
        email: newEmail,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          email: newEmail
        });
      }
      
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Reauthenticate user (required for sensitive operations)
  const reauthenticate = async (password) => {
    setError(null);
    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        password
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Context value
  const value = {
    user,
    userProfile,
    loading,
    error,
    isAdmin,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    updateEmail,
    reauthenticate,
    signInWithGoogle,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};