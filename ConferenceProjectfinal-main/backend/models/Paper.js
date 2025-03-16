const mongoose = require("mongoose");

const paperSchema = new mongoose.Schema({
    name: String,
    institution: String,
    title: String,
    email: String,
    phone: String,
    research_area: String,
    journal: String,
    country: String,
    filename: String,
    mimetype: String,
    size: Number,
    filePath: String // Store file location instead of Base64
});

module.exports = mongoose.model("Paper", paperSchema);
