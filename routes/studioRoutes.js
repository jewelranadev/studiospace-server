import express from "express";
import { connectToDatabase } from "../config/db.js";

const router = express.Router();

// GET Featured Studios
router.get("/featured", async (req, res) => {
  try {
    const db = await connectToDatabase();

    const studios = await db
      .collection("studios")
      .find()
      .sort({ rating: -1 })
      .limit(6)
      .toArray();

    res.status(200).json({
      success: true,
      message: "Featured studios fetched successfully",
      data: studios,
    });
  } catch (error) {
    console.error("Featured Studios Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch featured studios",
    });
  }
});

export default router;