import express from "express";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "../config/db.js";

const router = express.Router();

// Get Featured Studios
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

// Get All Studios with Category Filtering
router.get("/", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const { category } = req.query;

    const filter = category ? { category } : {};

    const studios = await db
      .collection("studios")
      .find(filter)
      .sort({ _id: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      message: "Studios fetched successfully",
      data: studios,
    });
  } catch (error) {
    console.error("All Studios Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch studios",
    });
  }
});

// Get Single Studio by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid studio ID",
      });
    }

    const db = await connectToDatabase();

    const studio = await db.collection("studios").findOne({
      _id: new ObjectId(id),
    });

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Studio not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Studio fetched successfully",
      data: studio,
    });
  } catch (error) {
    console.error("Single Studio Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch studio",
    });
  }
});

export default router;