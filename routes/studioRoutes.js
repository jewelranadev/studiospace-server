import express from "express";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "../config/db.js";

const router = express.Router();


router.post("/", async (req, res) => {
  try {
    // Verify internal API request
    const secret = req.headers["x-internal-api-key"];

    if (
      !process.env.INTERNAL_API_SECRET ||
      secret !== process.env.INTERNAL_API_SECRET
    ) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized request",
      });
    }

    const {
      title,
      category,
      hourlyRate,
      securityDeposit,
      maxCapacity,
      location,
      image,
      amenities,
      overview,
      hostName,
      hostEmail,
    } = req.body;

    // Required field validation
    if (
      !title ||
      !category ||
      !location ||
      !image ||
      !overview ||
      !hostName ||
      !hostEmail
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Number validation
    const rate = Number(hourlyRate);
    const deposit = Number(securityDeposit);
    const capacity = Number(maxCapacity);

    if (
      !Number.isFinite(rate) ||
      rate <= 0 ||
      !Number.isFinite(deposit) ||
      deposit < 0 ||
      !Number.isInteger(capacity) ||
      capacity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid studio pricing or capacity",
      });
    }

    if (!Array.isArray(amenities) || amenities.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please add at least one studio amenity",
      });
    }

    // Prepare studio data
    const newStudio = {
      title: title.trim(),
      category,
      hourlyRate: rate,
      securityDeposit: deposit,
      maxCapacity: capacity,
      location: location.trim(),
      image: image.trim(),
      amenities,
      overview: overview.trim(),
      hostName,
      hostEmail,
      rating: 0,
      createdAt: new Date(),
    };

    // Save to MongoDB
    const db = await connectToDatabase();

    const result = await db
      .collection("studios")
      .insertOne(newStudio);

    return res.status(201).json({
      success: true,
      message: "Studio created successfully",
      data: {
        ...newStudio,
        _id: result.insertedId,
      },
    });
  } catch (error) {
    console.error("Create Studio Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create studio",
    });
  }
});

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