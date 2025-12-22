/**
 * Firebase Service
 * Handles all Firebase operations including authentication, database, and storage
 * Contains placeholder configuration for local development
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  updateDoc,
  query,
  where 
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Firebase Configuration
 * TODO: Replace these placeholder values with your actual Firebase config
 * Get these values from Firebase Console > Project Settings > Your Apps
 */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Flag to check if Firebase is properly configured
const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";

// Initialize Firebase only if configured
let app = null;
let auth = null;
let db = null;
let storage = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error);
  }
} else {
  console.warn('⚠️ Firebase not configured. Using local mock data.');
}

/**
 * Local mock data for development without Firebase
 */
const localUserData = {
  userId: 'local_user_001',
  email: 'demo@signage.com',
  displayName: 'Demo User',
  progress: {
    completedLessons: [],
    currentLesson: 'lesson_1',
    totalScore: 0,
    streak: 0,
  },
  settings: {
    soundEnabled: true,
    hapticEnabled: true,
    practiceReminders: true,
  },
};

/**
 * Authentication Service
 */
export class AuthService {
  /**
   * Sign in anonymously (for guest users)
   * @returns {Promise<Object>} User object
   */
  static async signInAnonymously() {
    if (isFirebaseConfigured && auth) {
      try {
        const userCredential = await signInAnonymously(auth);
        return {
          success: true,
          user: userCredential.user,
        };
      } catch (error) {
        console.error('Error signing in anonymously:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    } else {
      // Return mock user for local development
      return {
        success: true,
        user: localUserData,
      };
    }
  }

  /**
   * Sign in with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User object
   */
  static async signInWithEmail(email, password) {
    if (isFirebaseConfigured && auth) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return {
          success: true,
          user: userCredential.user,
        };
      } catch (error) {
        console.error('Error signing in:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    } else {
      // Return mock user for local development
      return {
        success: true,
        user: localUserData,
      };
    }
  }

  /**
   * Create new user account
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User object
   */
  static async createAccount(email, password) {
    if (isFirebaseConfigured && auth) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return {
          success: true,
          user: userCredential.user,
        };
      } catch (error) {
        console.error('Error creating account:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    } else {
      // Return mock user for local development
      return {
        success: true,
        user: { ...localUserData, email },
      };
    }
  }

  /**
   * Sign out current user
   * @returns {Promise<Object>} Success status
   */
  static async signOut() {
    if (isFirebaseConfigured && auth) {
      try {
        await firebaseSignOut(auth);
        return { success: true };
      } catch (error) {
        console.error('Error signing out:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    } else {
      return { success: true };
    }
  }

  /**
   * Get current user
   * @returns {Object|null} Current user object
   */
  static getCurrentUser() {
    if (isFirebaseConfigured && auth) {
      return auth.currentUser;
    } else {
      return localUserData;
    }
  }

  /**
   * Listen to auth state changes
   * @param {Function} callback - Callback function to handle auth state
   * @returns {Function} Unsubscribe function
   */
  static onAuthStateChanged(callback) {
    if (isFirebaseConfigured && auth) {
      return onAuthStateChanged(auth, callback);
    } else {
      // For local development, immediately call callback with mock user
      setTimeout(() => callback(localUserData), 0);
      return () => {}; // Return empty unsubscribe function
    }
  }
}

/**
 * Database Service
 * Handles all Firestore database operations
 */
export class DatabaseService {
  /**
   * Save or update user data
   * @param {string} userId - User ID
   * @param {Object} data - User data to save
   * @returns {Promise<Object>} Success status
   */
  static async saveUserData(userId, data) {
    if (isFirebaseConfigured && db) {
      try {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, data, { merge: true });
        return { success: true };
      } catch (error) {
        console.error('Error saving user data:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    } else {
      // Update local mock data
      Object.assign(localUserData, data);
      console.log('📝 Local data updated:', localUserData);
      return { success: true };
    }
  }

  /**
   * Get user data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User data
   */
  static async getUserData(userId) {
    if (isFirebaseConfigured && db) {
      try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          return {
            success: true,
            data: userSnap.data(),
          };
        } else {
          return {
            success: false,
            error: 'User not found',
          };
        }
      } catch (error) {
        console.error('Error getting user data:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    } else {
      // Return local mock data
      return {
        success: true,
        data: localUserData,
      };
    }
  }

  /**
   * Update user progress
   * @param {string} userId - User ID
   * @param {Object} progress - Progress data
   * @returns {Promise<Object>} Success status
   */
  static async updateProgress(userId, progress) {
    if (isFirebaseConfigured && db) {
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { progress });
        return { success: true };
      } catch (error) {
        console.error('Error updating progress:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    } else {
      // Update local mock progress
      localUserData.progress = { ...localUserData.progress, ...progress };
      console.log('📊 Progress updated:', localUserData.progress);
      return { success: true };
    }
  }

  /**
   * Get user's completed lessons
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Array of completed lesson IDs
   */
  static async getCompletedLessons(userId) {
    if (isFirebaseConfigured && db) {
      try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          return {
            success: true,
            lessons: data.progress?.completedLessons || [],
          };
        } else {
          return {
            success: true,
            lessons: [],
          };
        }
      } catch (error) {
        console.error('Error getting completed lessons:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    } else {
      // Return local mock completed lessons
      return {
        success: true,
        lessons: localUserData.progress.completedLessons,
      };
    }
  }
}

/**
 * Storage Service
 * Handles file uploads and downloads
 */
export class StorageService {
  /**
   * Upload file to storage
   * @param {string} path - Storage path
   * @param {Blob} file - File to upload
   * @returns {Promise<Object>} Download URL
   */
  static async uploadFile(path, file) {
    if (isFirebaseConfigured && storage) {
      try {
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        return {
          success: true,
          url: downloadURL,
        };
      } catch (error) {
        console.error('Error uploading file:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    } else {
      // Return mock URL for local development
      console.log('📤 Mock file upload:', path);
      return {
        success: true,
        url: `local://storage/${path}`,
      };
    }
  }

  /**
   * Get download URL for a file
   * @param {string} path - Storage path
   * @returns {Promise<Object>} Download URL
   */
  static async getFileURL(path) {
    if (isFirebaseConfigured && storage) {
      try {
        const storageRef = ref(storage, path);
        const downloadURL = await getDownloadURL(storageRef);
        return {
          success: true,
          url: downloadURL,
        };
      } catch (error) {
        console.error('Error getting file URL:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    } else {
      // Return mock URL for local development
      return {
        success: true,
        url: `local://storage/${path}`,
      };
    }
  }
}

/**
 * Check if Firebase is configured
 * @returns {boolean} True if Firebase is configured
 */
export const isFirebaseReady = () => isFirebaseConfigured;

/**
 * Get local user data (for development)
 * @returns {Object} Local user data
 */
export const getLocalUserData = () => ({ ...localUserData });

export { auth, db, storage };
