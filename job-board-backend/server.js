const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const corsOptions = {
  origin: "https://job-board-frontend-snowy.vercel.app", // Replace with your frontend Vercel URL
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB Connection Singleton
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    console.log("Reusing existing MongoDB connection");
    return cachedDb;
  }
  console.log("Establishing new MongoDB connection");
  const db = await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/job-board",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30s timeout
      maxPoolSize: 5, // Smaller pool for serverless
      socketTimeoutMS: 60000, // 60s socket timeout
      connectTimeoutMS: 30000, // 30s connection timeout
      retryWrites: true,
      w: "majority",
    }
  );
  cachedDb = db;
  console.log("MongoDB connected");
  return db;
}

// Root Route
app.get("/", (req, res) => {
  res.json({
    message:
      "Job Board Backend API is running. Use /api/jobs to access job listings.",
  });
});

// Job Schema
const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    type: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "jobs" }
);

const Job = mongoose.model("Job", jobSchema);

// Middleware to ensure DB connection
const ensureDbConnected = async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error("Database connection error:", err);
    res
      .status(500)
      .json({ error: "Database connection failed", details: err.message });
  }
};

// API Routes
app.get("/api/jobs", ensureDbConnected, async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
        ],
      };
    }
    const jobs = await Job.find(query);
    res.json(jobs);
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch jobs", details: err.message });
  }
});

app.get("/api/jobs/:id", ensureDbConnected, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(job);
  } catch (err) {
    console.error("Error fetching job:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch job", details: err.message });
  }
});

app.post("/api/jobs", ensureDbConnected, async (req, res) => {
  try {
    const { title, company, type, location, description } = req.body;
    if (!title || !company || !type || !location || !description) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const job = new Job({ title, company, type, location, description });
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    console.error("Error creating job:", err);
    res
      .status(500)
      .json({ error: "Failed to create job", details: err.message });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Server error", details: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
