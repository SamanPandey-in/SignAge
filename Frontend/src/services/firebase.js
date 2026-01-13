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
  arrayUnion,
  increment,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

/* ===================== DATABASE SERVICE (defined first) ===================== */

/**
 * Default user schema matching the database specification
 */
const getDefaultUserData = (userId, email, displayName) => ({
  userId,
  email: email || "",
  displayName: displayName || "User",
  photoURL: null,
  createdAt: serverTimestamp(),
  lastLoginAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  progress: {
    completedLessons: [],
    currentLesson: "lesson_1",
    inProgressLessons: [],
    totalScore: 0,
    totalStars: 0,
    streak: 0,
    longestStreak: 0,
    todayProgress: 0,
    lastPracticeDate: null,
    totalPracticeTime: 0,
    lessonsCompleted: 0,
    signsLearned: 0,
    practiceSessionsCount: 0,
    averageAccuracy: 0,
    bestAccuracy: 0,
  },
  settings: {
    practiceReminders: true,
    achievementNotifications: true,
    soundEnabled: true,
    musicEnabled: false,
    hapticEnabled: true,
    theme: "light",
    language: "en",
    dailyGoal: 20,
    difficultyLevel: "beginner",
  },
  accountType: "email",
  isEmailVerified: false,
  isPremium: false,
  premiumUntil: null,
});

export const DatabaseService = {
  async createUser(userId, email, displayName) {
    try {
      const ref = doc(db, "users", userId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        await updateDoc(ref, {
          lastLoginAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return { success: true, message: "User exists, updated login time" };
      }

      const userData = getDefaultUserData(userId, email, displayName);
      await setDoc(ref, userData);
      return { success: true, message: "User created" };
    } catch (error) {
      console.error("Error creating user:", error);
      return { success: false, error: error.message };
    }
  },

  async getUserData(userId) {
    try {
      const ref = doc(db, "users", userId);
      const snap = await getDoc(ref);
      return snap.exists()
        ? { success: true, data: snap.data() }
        : { success: false };
    } catch (error) {
      console.error("Error getting user data:", error);
      return { success: false, error: error.message };
    }
  },

  async saveUserData(userId, data) {
    try {
      const ref = doc(db, "users", userId);
      await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
      return { success: true };
    } catch (error) {
      console.error("Error saving user data:", error);
      return { success: false, error: error.message };
    }
  },

  async updateProgress(userId, progress) {
    try {
      const ref = doc(db, "users", userId);
      await updateDoc(ref, { progress, updatedAt: serverTimestamp() });
      return { success: true };
    } catch (error) {
      console.error("Error updating progress:", error);
      return { success: false, error: error.message };
    }
  },

  async getCompletedLessons(userId) {
    try {
      const ref = doc(db, "users", userId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        return { success: true, lessons: [] };
      }

      const progress = snap.data().progress || {};
      return { success: true, lessons: progress.completedLessons || [] };
    } catch (error) {
      console.error("Error getting completed lessons:", error);
      return { success: false, lessons: [], error: error.message };
    }
  },

  async markLessonCompleted(userId, lessonId, score = 0, stars = 0, signsLearned = 0) {
    try {
      const ref = doc(db, "users", userId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        return { success: false, error: "User not found" };
      }

      const currentData = snap.data();
      const completedLessons = currentData.progress?.completedLessons || [];

      if (completedLessons.includes(lessonId)) {
        return { success: true, message: "Lesson already completed" };
      }

      await updateDoc(ref, {
        "progress.completedLessons": arrayUnion(lessonId),
        "progress.totalScore": increment(score),
        "progress.totalStars": increment(stars),
        "progress.lessonsCompleted": increment(1),
        "progress.signsLearned": increment(signsLearned),
        "progress.lastPracticeDate": serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await this.updateStreak(userId);

      return { success: true, message: "Lesson completed" };
    } catch (error) {
      console.error("Error marking lesson completed:", error);
      return { success: false, error: error.message };
    }
  },

  async updateStreak(userId) {
    try {
      const ref = doc(db, "users", userId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        return { success: false, error: "User not found" };
      }

      const userData = snap.data();
      const lastPracticeDate = userData.progress?.lastPracticeDate?.toDate();
      const currentStreak = userData.progress?.streak || 0;
      const longestStreak = userData.progress?.longestStreak || 0;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      let newStreak = currentStreak;

      if (lastPracticeDate) {
        const lastPractice = new Date(
          lastPracticeDate.getFullYear(),
          lastPracticeDate.getMonth(),
          lastPracticeDate.getDate()
        );

        const diffDays = Math.floor((today - lastPractice) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          newStreak = currentStreak || 1;
        } else if (diffDays === 1) {
          newStreak = currentStreak + 1;
        } else {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      const newLongestStreak = Math.max(newStreak, longestStreak);

      await updateDoc(ref, {
        "progress.streak": newStreak,
        "progress.longestStreak": newLongestStreak,
        "progress.lastPracticeDate": serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return { success: true, streak: newStreak };
    } catch (error) {
      console.error("Error updating streak:", error);
      return { success: false, error: error.message };
    }
  },

  async updateSettings(userId, settings) {
    try {
      const ref = doc(db, "users", userId);

      const updates = { updatedAt: serverTimestamp() };
      for (const [key, value] of Object.entries(settings)) {
        updates[`settings.${key}`] = value;
      }

      await updateDoc(ref, updates);
      return { success: true };
    } catch (error) {
      console.error("Error updating settings:", error);
      return { success: false, error: error.message };
    }
  },

  async updateTodayProgress(userId, progressPercent) {
    try {
      const ref = doc(db, "users", userId);
      await updateDoc(ref, {
        "progress.todayProgress": Math.min(progressPercent, 100),
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error("Error updating today progress:", error);
      return { success: false, error: error.message };
    }
  },

  async addPracticeTime(userId, minutes) {
    try {
      const ref = doc(db, "users", userId);
      await updateDoc(ref, {
        "progress.totalPracticeTime": increment(minutes),
        "progress.practiceSessionsCount": increment(1),
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error("Error adding practice time:", error);
      return { success: false, error: error.message };
    }
  },

  async getUserStats(userId) {
    try {
      const ref = doc(db, "users", userId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        return {
          success: true,
          stats: {
            lessonsCompleted: 0,
            totalPracticeTime: 0,
            totalStars: 0,
            streak: 0,
            todayProgress: 0,
          },
        };
      }

      const progress = snap.data().progress || {};
      return {
        success: true,
        stats: {
          lessonsCompleted: progress.lessonsCompleted || 0,
          totalPracticeTime: progress.totalPracticeTime || 0,
          totalStars: progress.totalStars || 0,
          streak: progress.streak || 0,
          todayProgress: progress.todayProgress || 0,
        },
      };
    } catch (error) {
      console.error("Error getting user stats:", error);
      return { success: false, error: error.message };
    }
  },
};

/* ===================== AUTH ===================== */

export const AuthService = {
  login: async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await DatabaseService.createUser(userCredential.user.uid, email, userCredential.user.displayName || "User");
    return userCredential;
  },

  signup: async (email, password, displayName = "User") => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await DatabaseService.createUser(userCredential.user.uid, email, displayName);
    return userCredential;
  },

  logout: () => signOut(auth),

  getCurrentUser: () => auth.currentUser,

  onAuthChange: (callback) =>
    onAuthStateChanged(auth, callback),
};

/* ===================== UTILS ===================== */

export const isFirebaseReady = () => true;
