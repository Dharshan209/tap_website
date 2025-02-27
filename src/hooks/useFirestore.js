import { useState, useCallback, useEffect } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  endBefore,
  limitToLast,
  serverTimestamp,
  onSnapshot,
  Timestamp,
  setDoc,
  writeBatch,
  DocumentReference,
  CollectionReference,
  Query
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Utility function to convert Firestore timestamps
const convertTimestamp = (timestamp) => {
  if (!timestamp) return null;
  
  try {
    return timestamp instanceof Timestamp 
      ? timestamp.toDate().toISOString() 
      : timestamp;
  } catch (error) {
    console.warn('Timestamp conversion error:', error);
    return null;
  }
};

// Advanced query builder to handle complex queries
const buildFirestoreQuery = (
  collectionRef,
  queryConstraints = [],
  orderConstraints = [],
  limitConstraint = null,
  cursorConstraints = {}
) => {
  let q = collectionRef;
  
  // Apply where constraints
  if (queryConstraints && queryConstraints.length > 0) {
    q = query(
      q,
      ...queryConstraints.map(({ field, operator, value }) => 
        where(field, operator, value)
      )
    );
  }
  
  // Apply order constraints
  if (orderConstraints && orderConstraints.length > 0) {
    q = query(
      q,
      ...orderConstraints.map(({ field, direction = 'asc' }) => 
        orderBy(field, direction)
      )
    );
  }
  
  // Apply cursor constraints
  if (cursorConstraints.startAfter) {
    q = query(q, startAfter(cursorConstraints.startAfter));
  }
  
  if (cursorConstraints.endBefore) {
    q = query(q, endBefore(cursorConstraints.endBefore));
  }
  
  // Apply limit
  if (limitConstraint) {
    q = query(q, limit(limitConstraint));
  }
  
  return q;
};

// Enhanced Firestore hook with comprehensive functionality
export const useFirestore = (collectionName) => {
  // State management
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalDocuments: 0,
    hasMore: false
  });

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Create a new document with optional custom ID
  const addDocument = useCallback(async (documentData, customId = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const dataWithTimestamps = {
        ...documentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      let docRef;
      if (customId) {
        docRef = doc(db, collectionName, customId);
        await setDoc(docRef, dataWithTimestamps);
      } else {
        docRef = await addDoc(collection(db, collectionName), dataWithTimestamps);
      }
      
      setLoading(false);
      return { 
        id: docRef.id, 
        ...dataWithTimestamps 
      };
    } catch (err) {
      console.error(`Error adding document to ${collectionName}:`, err);
      setError({
        message: 'Failed to add document',
        details: err.message
      });
      setLoading(false);
      throw err;
    }
  }, [collectionName]);

  // Update an existing document
  const updateDocument = useCallback(async (documentId, updateData) => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, collectionName, documentId);
      
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error(`Error updating document in ${collectionName}:`, err);
      setError({
        message: 'Failed to update document',
        details: err.message
      });
      setLoading(false);
      throw err;
    }
  }, [collectionName]);

  // Delete a document
  const deleteDocument = useCallback(async (documentId) => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, collectionName, documentId);
      await deleteDoc(docRef);
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error(`Error deleting document from ${collectionName}:`, err);
      setError({
        message: 'Failed to delete document',
        details: err.message
      });
      setLoading(false);
      throw err;
    }
  }, [collectionName]);

  // Get a single document
  const getDocument = useCallback(async (documentId) => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLoading(false);
        return {
          id: docSnap.id,
          ...data,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt)
        };
      } else {
        setError({ message: 'Document not found' });
        setLoading(false);
        return null;
      }
    } catch (err) {
      console.error(`Error getting document from ${collectionName}:`, err);
      setError({
        message: 'Failed to fetch document',
        details: err.message
      });
      setLoading(false);
      throw err;
    }
  }, [collectionName]);

  // Advanced document querying
  const getDocuments = useCallback(async (
    queryOptions = {
      constraints: [],
      orderBy: [],
      limit: 10,
      startAfter: null,
      endBefore: null
    }
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const collectionRef = collection(db, collectionName);
      
      const q = buildFirestoreQuery(
        collectionRef,
        queryOptions.constraints,
        queryOptions.orderBy,
        queryOptions.limit,
        {
          startAfter: queryOptions.startAfter,
          endBefore: queryOptions.endBefore
        }
      );
      
      const querySnapshot = await getDocs(q);
      
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt)
      }));
      
      // Update pagination state
      setPagination(prev => ({
        ...prev,
        totalDocuments: documents.length,
        hasMore: documents.length === queryOptions.limit
      }));
      
      setData(documents);
      setLoading(false);
      return documents;
    } catch (err) {
      console.error(`Error querying ${collectionName}:`, err);
      setError({
        message: 'Failed to fetch documents',
        details: err.message
      });
      setLoading(false);
      throw err;
    }
  }, [collectionName]);

  // Real-time document listener
  const subscribeToDocument = useCallback((documentId, callback) => {
    const docRef = doc(db, collectionName, documentId);
    
    const unsubscribe = onSnapshot(
      docRef, 
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const processedDoc = {
            id: doc.id,
            ...data,
            createdAt: convertTimestamp(data.createdAt),
            updatedAt: convertTimestamp(data.updatedAt)
          };
          
          callback(null, processedDoc);
        } else {
          callback(new Error('Document does not exist'), null);
        }
      },
      (error) => {
        console.error('Document subscription error:', error);
        callback(error, null);
      }
    );
    
    return unsubscribe;
  }, [collectionName]);

  // Real-time collection listener
  const subscribeToCollection = useCallback((
    queryOptions = {
      constraints: [],
      orderBy: [],
      limit: 10
    },
    callback
  ) => {
    const collectionRef = collection(db, collectionName);
    
    const q = buildFirestoreQuery(
      collectionRef,
      queryOptions.constraints,
      queryOptions.orderBy,
      queryOptions.limit
    );
    
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const documents = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: convertTimestamp(doc.data().createdAt),
          updatedAt: convertTimestamp(doc.data().updatedAt)
        }));
        
        callback(null, documents);
      },
      (error) => {
        console.error('Collection subscription error:', error);
        callback(error, null);
      }
    );
    
    return unsubscribe;
  }, [collectionName]);

  // Batch write operations
  const batchWrite = useCallback(async (operations) => {
    setLoading(true);
    setError(null);
    
    try {
      const batch = writeBatch(db);
      
      operations.forEach(({ type, id, data }) => {
        const docRef = doc(db, collectionName, id);
        
        switch (type) {
          case 'create':
            batch.set(docRef, {
              ...data,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            break;
          case 'update':
            batch.update(docRef, {
              ...data,
              updatedAt: serverTimestamp()
            });
            break;
          case 'delete':
            batch.delete(docRef);
            break;
          default:
            throw new Error(`Invalid batch operation type: ${type}`);
        }
      });
      
      await batch.commit();
      setLoading(false);
      return true;
    } catch (err) {
      console.error(`Batch write error in ${collectionName}:`, err);
      setError({
        message: 'Batch write failed',
        details: err.message
      });
      setLoading(false);
      throw err;
    }
  }, [collectionName]);

  return {
    // Data state
    data,
    loading,
    error,
    pagination,
    
    // Methods
    clearError,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocument,
    getDocuments,
    subscribeToDocument,
    subscribeToCollection,
    batchWrite
  };
};