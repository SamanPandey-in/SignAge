/**
 * User Service - Complete Firestore CRUD operations for users
 * Following the SignAge Database Architecture specification
 */

import { db } from "../firebase.js";
import admin from "firebase-admin";

const FieldValue = admin.firestore.FieldValue;

/**
 * Default user schema with all required fields
 */
const getDefaultUserData = (userId, email, displayName) => ({
    // Identification
    userId,
    email: email || "",
    displayName: displayName || "User",
    photoURL: null,

    // Timestamps
    createdAt: FieldValue.serverTimestamp(),
    lastLoginAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),

    // Learning Progress
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

    // User Settings
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

    // Metadata
    accountType: "email",
    isEmailVerified: false,
    isPremium: false,
    premiumUntil: null,
});

/**
 * Create a new user document in Firestore
 */
export const createUser = async (userId, email, displayName) => {
    try {
        const userRef = db.collection("users").doc(userId);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            // User already exists, just update lastLoginAt
            await userRef.update({
                lastLoginAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            });
            return { success: true, message: "User already exists, updated login time", data: userDoc.data() };
        }

        // Create new user with default schema
        const userData = getDefaultUserData(userId, email, displayName);
        await userRef.set(userData);

        return { success: true, message: "User created successfully", data: userData };
    } catch (error) {
        console.error("Error creating user:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Get user document by ID
 */
export const getUser = async (userId) => {
    try {
        const userRef = db.collection("users").doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return { success: false, error: "User not found" };
        }

        return { success: true, data: userDoc.data() };
    } catch (error) {
        console.error("Error getting user:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, profileData) => {
    try {
        const userRef = db.collection("users").doc(userId);

        const updates = {
            ...profileData,
            updatedAt: FieldValue.serverTimestamp(),
        };

        await userRef.update(updates);
        return { success: true, message: "Profile updated" };
    } catch (error) {
        console.error("Error updating profile:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Get user's progress data
 */
export const getUserProgress = async (userId) => {
    try {
        const userDoc = await db.collection("users").doc(userId).get();

        if (!userDoc.exists) {
            return { success: false, error: "User not found" };
        }

        return { success: true, data: userDoc.data().progress };
    } catch (error) {
        console.error("Error getting progress:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Get list of completed lesson IDs
 */
export const getCompletedLessons = async (userId) => {
    try {
        const userDoc = await db.collection("users").doc(userId).get();

        if (!userDoc.exists) {
            return { success: true, lessons: [] };
        }

        const progress = userDoc.data().progress || {};
        return { success: true, lessons: progress.completedLessons || [] };
    } catch (error) {
        console.error("Error getting completed lessons:", error);
        return { success: false, error: error.message, lessons: [] };
    }
};

/**
 * Mark a lesson as completed
 */
export const markLessonCompleted = async (userId, lessonId, score = 0, stars = 0, signsLearned = 0) => {
    try {
        const userRef = db.collection("users").doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return { success: false, error: "User not found" };
        }

        const currentData = userDoc.data();
        const completedLessons = currentData.progress?.completedLessons || [];

        // Check if lesson already completed
        if (completedLessons.includes(lessonId)) {
            // Just update score if better
            return { success: true, message: "Lesson already completed" };
        }

        // Update progress
        await userRef.update({
            "progress.completedLessons": FieldValue.arrayUnion(lessonId),
            "progress.totalScore": FieldValue.increment(score),
            "progress.totalStars": FieldValue.increment(stars),
            "progress.lessonsCompleted": FieldValue.increment(1),
            "progress.signsLearned": FieldValue.increment(signsLearned),
            "progress.lastPracticeDate": FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });

        // Update streak
        await updateStreak(userId);

        return { success: true, message: "Lesson completed successfully" };
    } catch (error) {
        console.error("Error marking lesson completed:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Update user streak based on last practice date
 */
export const updateStreak = async (userId) => {
    try {
        const userRef = db.collection("users").doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return { success: false, error: "User not found" };
        }

        const userData = userDoc.data();
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
                // Same day, streak stays the same
                newStreak = currentStreak;
            } else if (diffDays === 1) {
                // Consecutive day, increment streak
                newStreak = currentStreak + 1;
            } else {
                // Streak broken, reset to 1
                newStreak = 1;
            }
        } else {
            // First practice ever
            newStreak = 1;
        }

        const newLongestStreak = Math.max(newStreak, longestStreak);

        await userRef.update({
            "progress.streak": newStreak,
            "progress.longestStreak": newLongestStreak,
            "progress.lastPracticeDate": FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });

        return { success: true, streak: newStreak, longestStreak: newLongestStreak };
    } catch (error) {
        console.error("Error updating streak:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Get streak info
 */
export const getStreak = async (userId) => {
    try {
        const userDoc = await db.collection("users").doc(userId).get();

        if (!userDoc.exists) {
            return { success: true, streak: 0, longestStreak: 0 };
        }

        const progress = userDoc.data().progress || {};
        return {
            success: true,
            streak: progress.streak || 0,
            longestStreak: progress.longestStreak || 0,
            lastPracticeDate: progress.lastPracticeDate || null,
        };
    } catch (error) {
        console.error("Error getting streak:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Update user settings
 */
export const updateSettings = async (userId, settings) => {
    try {
        const userRef = db.collection("users").doc(userId);

        const updates = {};
        for (const [key, value] of Object.entries(settings)) {
            updates[`settings.${key}`] = value;
        }
        updates.updatedAt = FieldValue.serverTimestamp();

        await userRef.update(updates);
        return { success: true, message: "Settings updated" };
    } catch (error) {
        console.error("Error updating settings:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Update today's progress percentage
 */
export const updateTodayProgress = async (userId, progressPercent) => {
    try {
        const userRef = db.collection("users").doc(userId);

        await userRef.update({
            "progress.todayProgress": Math.min(progressPercent, 100),
            updatedAt: FieldValue.serverTimestamp(),
        });

        return { success: true };
    } catch (error) {
        console.error("Error updating today progress:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Add practice time in minutes
 */
export const addPracticeTime = async (userId, minutes) => {
    try {
        const userRef = db.collection("users").doc(userId);

        await userRef.update({
            "progress.totalPracticeTime": FieldValue.increment(minutes),
            "progress.practiceSessionsCount": FieldValue.increment(1),
            updatedAt: FieldValue.serverTimestamp(),
        });

        return { success: true };
    } catch (error) {
        console.error("Error adding practice time:", error);
        return { success: false, error: error.message };
    }
};

export default {
    createUser,
    getUser,
    updateUserProfile,
    getUserProgress,
    getCompletedLessons,
    markLessonCompleted,
    updateStreak,
    getStreak,
    updateSettings,
    updateTodayProgress,
    addPracticeTime,
};
