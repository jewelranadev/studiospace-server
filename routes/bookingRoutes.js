import express from "express";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "../config/db.js";
import { verifyAuth } from "../middleware/verifyAuth.js";

const router = express.Router();

// Create Booking
router.post("/", verifyAuth, async (req, res) => {
  try {
    const secret = req.headers["x-internal-api-key"];
    const userEmail = req.user.email;

    if (secret !== process.env.INTERNAL_API_SECRET) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized request",
      });
    }

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "User email is required",
      });
    }

    const { studioId, date, startTime, endTime } = req.body;

    if (!studioId || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "All booking fields are required",
      });
    }

    if (!ObjectId.isValid(studioId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid studio ID",
      });
    }

    
    if (
      typeof startTime !== "string" ||
      typeof endTime !== "string" ||
      !/^\d{2}:\d{2}$/.test(startTime) ||
      !/^\d{2}:\d{2}$/.test(endTime)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking time",
      });
    }

    const start = startTime.split(":").map(Number);
    const end = endTime.split(":").map(Number);

    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];

    if (
      start[0] > 23 ||
      start[1] > 59 ||
      end[0] > 23 ||
      end[1] > 59 ||
      startMinutes >= endMinutes
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking time",
      });
    }

    const db = await connectToDatabase();

    const studio = await db.collection("studios").findOne({
      _id: new ObjectId(studioId),
    });

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Studio not found",
      });
    }

    const existingBooking = await db.collection("bookings").findOne({
      studioId: new ObjectId(studioId),
      date,
      status: { $ne: "cancelled" },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: "This time slot is already booked",
      });
    }

    const totalHours = (endMinutes - startMinutes) / 60;
    const totalPrice = totalHours * Number(studio.hourlyRate);

    const booking = {
      studioId: new ObjectId(studioId),
      studioTitle: studio.title,
      userEmail,
      hostEmail: studio.hostEmail,
      date,
      startTime,
      endTime,
      totalHours,
      totalPrice,
      status: "pending",
      createdAt: new Date(),
    };

    const result = await db.collection("bookings").insertOne(booking);

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: {
        ...booking,
        _id: result.insertedId,
      },
    });
  } catch (error) {
    console.error("Create Booking Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create booking",
    });
  }
});

// My Bookings
router.get("/my-bookings", async (req, res) => {
  try {
    const secret = req.headers["x-internal-api-key"];
    const userEmail = req.headers["x-user-email"];

    if (secret !== process.env.INTERNAL_API_SECRET) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized request",
      });
    }

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "User email is required",
      });
    }

    const db = await connectToDatabase();

    const bookings = await db
      .collection("bookings")
      .find({ userEmail })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("My Bookings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
});

// Host Bookings
router.get("/host-bookings", async (req, res) => {
  try {
    const secret = req.headers["x-internal-api-key"];
    const userEmail = req.headers["x-user-email"];

    if (secret !== process.env.INTERNAL_API_SECRET) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized request",
      });
    }

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "User email is required",
      });
    }

    const db = await connectToDatabase();

    const bookings = await db
      .collection("bookings")
      .find({ hostEmail: userEmail })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Host Bookings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch host bookings",
    });
  }
});

// PATCH - Cancel Booking
router.patch("/:id/cancel", async (req, res) => {
  try {
    const secret = req.headers["x-internal-api-key"];
    const userEmail = req.headers["x-user-email"];
    const { id } = req.params;

    if (secret !== process.env.INTERNAL_API_SECRET) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized request",
      });
    }

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "User email is required",
      });
    }

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const db = await connectToDatabase();

    const result = await db.collection("bookings").updateOne(
      {
        _id: new ObjectId(id),
        userEmail,
        status: "pending",
      },
      {
        $set: {
          status: "cancelled",
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or cannot be cancelled",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel Booking Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
    });
  }
});

// PATCH - Confirm Booking (host only)
router.patch("/:id/confirm", async (req, res) => {
  try {
    const secret = req.headers["x-internal-api-key"];
    const userEmail = req.headers["x-user-email"];
    const { id } = req.params;

    if (secret !== process.env.INTERNAL_API_SECRET) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized request",
      });
    }

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "User email is required",
      });
    }

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const db = await connectToDatabase();

    const booking = await db.collection("bookings").findOne({
      _id: new ObjectId(id),
      status: "pending",
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Pending booking not found",
      });
    }

    const studio = await db.collection("studios").findOne({
      _id: new ObjectId(booking.studioId),
      hostEmail: userEmail,
    });

    if (!studio) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to confirm this booking",
      });
    }

    await db.collection("bookings").updateOne(
      { _id: new ObjectId(id), status: "pending" },
      {
        $set: {
          status: "confirmed",
          updatedAt: new Date(),
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Booking confirmed successfully",
    });
  } catch (error) {
    console.error("Confirm Booking Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to confirm booking",
    });
  }
});

export default router;