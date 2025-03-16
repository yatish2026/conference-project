const Paper = require("../models/Paper");

// Handle Paper Submission
exports.submitPaper = async (req, res) => {
    try {
        const { name, institution, title, email, phone, research_area, journal, country } = req.body;
        const filePath = req.file ? req.file.path : null;

        if (!filePath) {
            return res.status(400).json({ error: "File upload failed" });
        }

        const newPaper = new Paper({
            name,
            institution,
            title,
            email,
            phone,
            research_area,
            journal,
            country,
            filePath
        });

        await newPaper.save();
        res.status(201).json({ message: "Paper submitted successfully!", paper: newPaper });
    } catch (error) {
        console.error("Error submitting paper:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
