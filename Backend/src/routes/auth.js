/**
 * Auth Routes - User profile management
 */

import express from "express";
import { verifyToken } from "../middleware/auth.js";
import userService from "../services/userService.js";

const router = express.Router();

/**
 * POST /auth/register
 * Create user profile on signup (or update last login if exists)
 */
router.post("/register", verifyToken, async (req, res) => {
    try {
        const { uid, email, name } = req.user;
        const displayName = req.body.displayName || name || "User";

        const result = await userService.createUser(uid, email, displayName);

        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error in register:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

/**
 * GET /auth/profile
 * Get current user profile
 */
router.get("/profile", verifyToken, async (req, res) => {
    try {
        const result = await userService.getUser(req.user.uid);

        if (result.success) {
            res.json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (error) {
        console.error("Error getting profile:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

/**
 * PUT /auth/profile
 * Update user profile
 */
router.put("/profile", verifyToken, async (req, res) => {
    try {
        const { displayName, photoURL } = req.body;
        const updates = {};

        if (displayName) updates.displayName = displayName;
        if (photoURL) updates.photoURL = photoURL;

        const result = await userService.updateUserProfile(req.user.uid, updates);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

/**
 * PUT /auth/settings
 * Update user settings
 */
router.put("/settings", verifyToken, async (req, res) => {
    try {
        const settings = req.body;
        const result = await userService.updateSettings(req.user.uid, settings);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error updating settings:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

export default router;
