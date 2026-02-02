import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import lessonRoutes from "./routes/lessons.js";
import authRoutes from "./routes/auth.js";
import progressRoutes from "./routes/progress.js";
import streakRoutes from "./routes/streak.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("SignAge backend running 🚀");
});
app.use("/lessons", lessonRoutes);
app.use("/auth", authRoutes);
app.use("/progress", progressRoutes);
app.use("/streak", streakRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
