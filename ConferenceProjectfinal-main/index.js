require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const fs = require("fs");
const multer = require("multer");

// Import Database & Routes
const connectDB = require("./backend/config/db");
const registrationRoutes = require("./backend/routes/registrationRoutes");
const contactRoutes = require("./backend/routes/contactRoutes");
const paperRoutes = require("./backend/routes/paperRoutes");
const Contact = require("./backend/models/Contact");
const Paper = require("./backend/models/Paper"); 

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer Storage (Save files physically)
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});
const upload = multer({ storage });

// Initialize Express
const app = express();

// Middleware (Order Matters)
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/conferenceDB";
connectDB(MONGO_URI);

// Serve static frontend files
app.use(express.static(path.join(__dirname, "frontend", "public")));

// Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "public", "home.html"));
});
app.use("/api/registrations", registrationRoutes);
app.use("/api/contact", contactRoutes);
app.use("/submit", paperRoutes);

// Contact Form Submission
app.post('/api/contact/contacts', async(req, res) => {
    try {
        const { user_name, user_email, user_phone, user_message } = req.body;

        const newContact = new Contact({
            name: user_name,
            email: user_email,
            phone: user_phone,
            message: user_message
        });

        await newContact.save();
        res.status(200).send('Form submitted and data saved successfully!');
    } catch (error) {
        console.error('❌ Error saving data:', error);
        res.status(500).send('An error occurred while saving the data.');
    }
});

// Paper Submission Route
app.post("/submit/papersubmit", upload.single("file"), async(req, res) => {
    try {
        console.log("📩 Form Data Received:", req.body);
        console.log("📄 Uploaded File:", req.file);

        if (!req.file) {
            throw new Error("No file uploaded!");
        }

        const newPaper = new Paper({
            name: req.body.name,
            institution: req.body.institution,
            title: req.body.title,
            email: req.body.email,
            phone: req.body.phone,
            research_area: req.body.research_area,
            journal: req.body.journal,
            country: req.body.country,
            filename: req.file.filename,
            mimetype: req.file.mimetype,
            size: req.file.size,
            filePath: `/uploads/${req.file.filename}` // Store file path
        });

        await newPaper.save();
        res.json({ success: true, message: "Paper submitted successfully!", paperId: newPaper._id });

    } catch (error) {
        console.error("❌ Error Handling Submission:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Retrieve Paper Submission
app.get("/papers/:id", async(req, res) => {
    try {
        const paper = await Paper.findById(req.params.id);

        if (!paper) {
            return res.status(404).json({ success: false, message: "Paper not found" });
        }

        res.json({
            success: true,
            filename: paper.filename,
            mimetype: paper.mimetype,
            size: paper.size,
            filePath: paper.filePath
        });

    } catch (error) {
        console.error("❌ Error Fetching Paper:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start Server
const PORT = process.env.PORT || 1001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
