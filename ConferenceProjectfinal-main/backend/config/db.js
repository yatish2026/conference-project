const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Manually load environment variables
dotenv.config({ path: "./backend/.env" });

// Debugging: Check if environment variables are loaded correctly
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("MONGO_LOCAL_URI:", process.env.MONGO_LOCAL_URI);
console.log("MONGO_ATLAS_URI:", process.env.MONGO_ATLAS_URI);

// Determine which MongoDB URI to use
const getMongoURI = () => {
    if (process.env.NODE_ENV === "production") {
        return process.env.MONGO_ATLAS_URI;
    } else {
        return process.env.MONGO_LOCAL_URI;
    }
};

// Connect to MongoDB
const connectDB = async (MONGO_URI = getMongoURI()) => {
    if (!MONGO_URI) {
        console.error("❌ ERROR: MONGO_URI is not defined in .env file");
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            strictQuery: false, // Prevent deprecation warnings
        });
        console.log(`✅ MongoDB Connected: ${MONGO_URI.includes("localhost") ? "Local" : "Atlas"}`);
    } catch (err) {
        console.error("❌ MongoDB Connection Failed:", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
