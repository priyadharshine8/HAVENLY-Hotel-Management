
const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
require("dotenv").config();

const app = express();
const pool = require("./db");
const { randomUUID } = require("crypto");

app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer image storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${randomUUID()}${extension}`);
  },
});

// Allow only image files
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, WEBP and GIF images are allowed"));
    }
  },
});

app.get("/", (req, res) => {
  res.send("HAVENLY Backend is running!");
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "HAVENLY API is working!",
  });
});

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      success: true,
      message: "PostgreSQL connected successfully!",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// Upload hotel image
app.post("/api/upload", (req, res) => {
  upload.single("image")(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image",
      });
    }

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully!",
      image: `/uploads/${req.file.filename}`,
    });
  });
});

// GET all hotels
app.get("/api/hotels", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM hotels ORDER BY created_at DESC"
    );

    const hotels = result.rows.map((hotel) => ({
      id: hotel.id,
      title: hotel.title,
      location: hotel.location,
      description: hotel.description,
      latitude: hotel.latitude,
      longitude: hotel.longitude,
      price: Number(hotel.price),
      image: hotel.image,
      reviews: hotel.reviews,
      tourSections: hotel.tour_sections,
    }));

    res.json({
      success: true,
      hotels,
    });
  } catch (error) {
    console.error("GET hotels error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch hotels",
    });
  }
});

// POST - Add hotel
app.post("/api/hotels", async (req, res) => {
  try {
    const {
      title,
      location,
      description,
      latitude,
      longitude,
      price,
      image,
      reviews,
      tourSections,
    } = req.body;

    if (!title || !location || price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: "Title, location and price are required",
      });
    }

    if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a positive number",
      });
    }

    const id = req.body.id || randomUUID();

    const result = await pool.query(
      `INSERT INTO hotels
      (id, title, location, description, latitude, longitude,
       price, image, reviews, tour_sections)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb)
      RETURNING *`,
      [
        id,
        title,
        location,
        description || "",
        latitude ?? null,
        longitude ?? null,
        Number(price),
        image || "",
        JSON.stringify(reviews || []),
        JSON.stringify(tourSections || []),
      ]
    );

    const hotel = result.rows[0];

    res.status(201).json({
      success: true,
      message: "Hotel added successfully!",
      hotel: {
        ...hotel,
        price: Number(hotel.price),
        tourSections: hotel.tour_sections,
      },
    });
  } catch (error) {
    console.error("POST hotels error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to add hotel",
    });
  }
});

// PUT - Update hotel
app.put("/api/hotels/:id", async (req, res) => {
  try {
    const {
      title,
      location,
      description,
      latitude,
      longitude,
      price,
      image,
      reviews,
      tourSections,
    } = req.body;

    if (!title || !location || price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: "Title, location and price are required",
      });
    }

    if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a positive number",
      });
    }

    const result = await pool.query(
      `UPDATE hotels SET
        title = $1,
        location = $2,
        description = $3,
        latitude = $4,
        longitude = $5,
        price = $6,
        image = $7,
        reviews = $8::jsonb,
        tour_sections = $9::jsonb
      WHERE id = $10
      RETURNING *`,
      [
        title,
        location,
        description || "",
        latitude ?? null,
        longitude ?? null,
        Number(price),
        image || "",
        JSON.stringify(reviews || []),
        JSON.stringify(tourSections || []),
        req.params.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    res.json({
      success: true,
      message: "Hotel updated successfully!",
      hotel: result.rows[0],
    });
  } catch (error) {
    console.error("PUT hotels error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update hotel",
    });
  }
});

// DELETE - Remove hotel
app.delete("/api/hotels/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM hotels WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    res.json({
      success: true,
      message: "Hotel deleted successfully!",
    });
  } catch (error) {
    console.error("DELETE hotels error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete hotel",
    });
  }
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`HAVENLY server running on port ${PORT}`);
});
