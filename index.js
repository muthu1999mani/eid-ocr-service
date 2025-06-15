const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// Setup file storage
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

        const imagePath = req.file.path;

        const { data: { text } } = await Tesseract.recognize(imagePath, 'eng');

        // Optional: Delete file after processing
        fs.unlinkSync(imagePath);

        // You can add regex here to extract structured data
        res.json({ text });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'OCR processing failed' });
    }
});

app.listen(port, () => {
    console.log(`OCR server running on port ${port}`);
});
