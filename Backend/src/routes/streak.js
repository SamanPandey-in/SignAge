/**
 * Streak Routes - Streak management
 */

import express from "express";
import { verifyToken } from "../middleware/auth.js";
import userService from "../services/userService.js";

const router = express.Router();

/**
 * GET /streak
 * Get current streak info
 */
router.get("/", verifyToken, async (req, res) => {
    try {
        const result = await userService.getStreak(req.user.uid);

        if (result.success) {
            res.json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (error) {
        console.error("Error getting streak:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

/**
 * POST /streak/update
 * Update streak on practice
 */
router.post("/update", verifyToken, async (req, res) => {
    try {
        const result = await userService.updateStreak(req.user.uid);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error updating streak:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

export default router;
