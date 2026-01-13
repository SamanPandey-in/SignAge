/**
 * Progress Routes - Learning progress tracking
 */

import express from "express";
import { verifyToken } from "../middleware/auth.js";
import userService from "../services/userService.js";

const router = express.Router();

/**
 * GET /progress
 * Get user's complete learning progress
 */
router.get("/", verifyToken, async (req, res) => {
    try {
        const result = await userService.getUserProgress(req.user.uid);

        if (result.success) {
            res.json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (error) {
        console.error("Error getting progress:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

/**
 * GET /progress/completed-lessons
 * Get list of completed lesson IDs
 */
router.get("/completed-lessons", verifyToken, async (req, res) => {
    try {
        const result = await userService.getCompletedLessons(req.user.uid);
        res.json(result);
    } catch (error) {
        console.error("Error getting completed lessons:", error);
        res.status(500).json({ success: false, error: "Server error", lessons: [] });
    }
});

/**
 * POST /progress/lesson
 * Mark a lesson as completed
 */
router.post("/lesson", verifyToken, async (req, res) => {
    try {
        const { lessonId, score = 0, stars = 0, signsLearned = 0 } = req.body;

        if (!lessonId) {
            return res.status(400).json({ success: false, error: "lessonId is required" });
        }

        const result = await userService.markLessonCompleted(
            req.user.uid,
            lessonId,
            score,
            stars,
            signsLearned
        );

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error marking lesson completed:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

/**
 * PUT /progress/today
 * Update today's progress percentage
 */
router.put("/today", verifyToken, async (req, res) => {
    try {
        const { progress } = req.body;

        if (typeof progress !== "number") {
            return res.status(400).json({ success: false, error: "progress must be a number" });
        }

        const result = await userService.updateTodayProgress(req.user.uid, progress);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error updating today's progress:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

/**
 * POST /progress/practice-time
 * Add practice time in minutes
 */
router.post("/practice-time", verifyToken, async (req, res) => {
    try {
        const { minutes } = req.body;

        if (typeof minutes !== "number" || minutes < 0) {
            return res.status(400).json({ success: false, error: "minutes must be a positive number" });
        }

        const result = await userService.addPracticeTime(req.user.uid, minutes);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error adding practice time:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

export default router;
