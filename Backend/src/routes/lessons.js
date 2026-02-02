import express from "express";
import { db } from "../firebase.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    const snapshot = await db.collection("lessons").get();
    const lessons = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(lessons);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch lessons" });
  }
});

export default router;
