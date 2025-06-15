const express = require('express');
const multer = require('multer');
const cors = require('cors');
const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
const port = process.env.PORT || 3000;

const upload = multer({ dest: 'uploads/' });

app.post('/api/ocr', upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded.' });

    try {
        const imagePath = path.resolve(__dirname, req.file.path);

        const result = await Tesseract.recognize(imagePath, 'eng');

        const text = result.data.text;
        fs.unlinkSync(imagePath); // Delete image after processing

        // Example parsing (customize this based on real data layout)
        // const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

        // const response = {
        //     raw: text,
        //     full_name: lines[0] || null,
        //     id_number: lines.find(line => line.match(/\d{3}[- ]?\d{4}[- ]?\d{7}[- ]?\d/)) || null,
        //     dob: lines.find(line => line.match(/\d{2}[-/]\d{2}[-/]\d{4}/)) || null,
        //     id_type: 'Emirates ID'
        // };

        const response = {
            name: text.match(/Name\s*[:\-]?\s*(.+)/i)?.[1]?.split(/[\n\r]/)[0].trim(),
            dob: text.match(/(?:Date of Birth|Birth)[\s:]*([0-9]{2}[\/\-][0-9]{2}[\/\-][0-9]{4})/i)?.[1]?.trim(),
            id_number: text.match(/784[-\s]?\d{4}[-\s]?\d{7}[-\s]?\d{1}/)?.[0]?.replace(/\s+/g, ''),
            raw: text
        };

        res.json(response);
    } catch (err) {
        res.status(500).json({ error: 'OCR failed.', details: err.message });
    }
});

app.listen(port, () => {
    console.log(`OCR server running on port ${port}`);
});
