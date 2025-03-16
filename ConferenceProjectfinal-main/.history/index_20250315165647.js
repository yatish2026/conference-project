require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./backend/config/db");
const registrationRoutes = require("./backend/routes/registrationRoutes");
const contactRoutes = require("./backend/routes/contactRoutes");
const Contact = require("./backend/models/Contact");
const paperRoutes = require("./backend/routes/paperRoutes");
const multer = require("multer");
// const path = require("path");


// Configure Multer Storage
const storage = multer.memoryStorage({
    destination: function(req, file, cb) {
        cb(null, "uploads/"); // Save files to 'uploads/' directory
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

// Initialize Multer
const upload = multer({ storage: storage });

// Serve uploaded files

const app = express();

// Middleware
// app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // If you're sending JSON data

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/conferenceDB";

connectDB();

app.use(express.static(path.join(__dirname, "frontend", "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "public", "home.html"));
});

app.use("/api/registrations", registrationRoutes);
app.use("/api/contact", contactRoutes);
app.use("/submit", paperRoutes);


app.post('/api/contact/contacts', async(req, res) => {
    const { user_name, user_email, user_phone, user_message } = req.body;

    try {
        // Create a new contact document
        const newContact = new Contact({
            name: user_name,
            email: user_email,
            phone: user_phone,
            message: user_message
        });

        // Save the contact to the database
        await newContact.save();

        // Respond back to the client
        res.status(200).send('Form submitted and data saved successfully!');
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).send('An error occurred while saving the data.');
    }
});
//     try {
//         console.log("📩 Form Data Received:", req.body);
//         console.log("📄 Uploaded File:", req.file);

//         if (!req.file) {
//             throw new Error("No file uploaded!");
//         }

//         res.json({ success: true, message: "Paper submitted successfully!" });

//     } catch (error) {
//         console.error("❌ Error Handling Submission:", error.message);
//         res.status(500).json({ success: false, error: error.message });
//     }
// });
// app.post("/submit/papersubmit", upload.single("file"), (req, res) => {
//     try {
//         console.log("📩 Form Data Received:", req.body);
//         console.log("📄 Uploaded File:", req.file);

//         if (!req.file) {
//             throw new Error("No file uploaded!");
//         }

//         // Example: Convert file buffer to Base64 (if you want to store it in MongoDB)
//         const fileBase64 = req.file.buffer.toString("base64");

//         res.json({
//             success: true,
//             message: "Paper submitted successfully!",
//             filename: req.file.originalname,
//             mimetype: req.file.mimetype,
//             size: req.file.size,
//             fileBase64: fileBase64.substring(0, 100) + "..." // Preview of file data
//         });

//     } catch (error) {
//         console.error("❌ Error Handling Submission:", error.message);
//         res.status(500).json({ success: false, error: error.message });
//     }
// });
const Paper = require("./backend/models/Paper"); // Import Paper model

app.post("/submit/papersubmit", upload.single("file"), async(req, res) => {
    try {
        console.log("📩 Form Data Received:", req.body);
        console.log("📄 Uploaded File:", req.file);

        if (!req.file) {
            throw new Error("No file uploaded!");
        }

        // Convert file buffer to Base64
        const fileBase64 = req.file.buffer.toString("base64");

        // Store in MongoDB
        const newPaper = new Paper({
            name: req.body.name,
            institution: req.body.institution,
            title: req.body.title,
            email: req.body.email,
            phone: req.body.phone,
            research_area: req.body.research_area,
            journal: req.body.journal,
            country: req.body.country,
            filename: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            fileBase64: fileBase64 // Save file as Base64
        });

        await newPaper.save(); // Save document in MongoDB

        res.json({
            success: true,
            message: "Paper submitted successfully!",
            paperId: newPaper._id // Return saved paper ID
        });

    } catch (error) {
        console.error("❌ Error Handling Submission:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});
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
            fileBase64: paper.fileBase64
        });

    } catch (error) {
        console.error("❌ Error Fetching Paper:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});