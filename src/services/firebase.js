// src/services/firebase.js

import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD7eaDyXialcBdTwnuykERoymZX6xVULfA",
  authDomain: "signage-4c716.firebaseapp.com",
  projectId: "signage-4c716",
  storageBucket: "signage-4c716.firebasestorage.app",
  messagingSenderId: "327788004598",
  appId: "1:327788004598:web:46ad33a697a31fe75858d7",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

/* ===================== AUTH ===================== */

export const AuthService = {
  login: (email, password) =>
    signInWithEmailAndPassword(auth, email, password),

  signup: (email, password) =>
    createUserWithEmailAndPassword(auth, email, password),

  logout: () => signOut(auth),

  getCurrentUser: () => auth.currentUser,

  onAuthChange: (callback) =>
    onAuthStateChanged(auth, callback),
};

/* ===================== DATABASE ===================== */

export const DatabaseService = {
  async getUserData(userId) {
    const ref = doc(db, "users", userId);
    const snap = await getDoc(ref);
    return snap.exists()
      ? { success: true, data: snap.data() }
      : { success: false };
  },

  async saveUserData(userId, data) {
    const ref = doc(db, "users", userId);
    await setDoc(ref, data, { merge: true });
    return { success: true };
  },

  async updateProgress(userId, progress) {
    const ref = doc(db, "users", userId);
    await updateDoc(ref, { progress });
    return { success: true };
  },
};

/* ===================== UTILS ===================== */

export const isFirebaseReady = () => true;
