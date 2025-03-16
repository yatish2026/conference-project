const mongoose = require("mongoose");
require("dotenv").config(); // Ensure dotenv is loaded

// Debugging: Log .env values to check if they are loaded
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("MONGO_LOCAL_URI:", process.env.MONGO_LOCAL_URI);
console.log("MONGO_ATLAS_URI:", process.env.MONGO_ATLAS_URI);

// Choose the correct MongoDB URI
const MONGO_URI = process.env.NODE_ENV === "production" ?
    process.env.MONGO_ATLAS_URI // Use Atlas for production
    :
    process.env.MONGO_LOCAL_URI; // Use local MongoDB in development

if (!MONGO_URI) {
    console.error("❌ ERROR: MONGO_URI is not defined in .env file");
    process.exit(1);
}

const connectDB = async() => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`✅ MongoDB Connected Successfully to ${MONGO_URI.includes("localhost") ? "Local" : "Atlas"}`);
    } catch (err) {
        console.error("❌ MongoDB Connection Failed:", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;