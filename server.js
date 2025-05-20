const express = require('express');
const multer = require('multer');
const STL = require('stl-js');
const path = require('path');
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Serve frontend files from the root directory
app.use(express.static(path.join(__dirname, '..')));

// Handle STL file upload
app.post('/upload', upload.single('stlFile'), (req, res) => {
    if (!req.file || !req.file.originalname.endsWith('.stl')) {
        return res.status(400).json({ error: 'Please upload a valid STL file.' });
    }

    try {
        // Parse STL file
        const stlData = STL.parse(req.file.buffer.toString('utf8'));
        let volume = 0;

        // Calculate volume using tetrahedron method
        if (stlData && stlData.facets) {
            stlData.facets.forEach(facet => {
                const v1 = facet.verts[0];
                const v2 = facet.verts[1];
                const v3 = facet.verts[2];
                // Signed tetrahedron volume (1/6 * |a · (b × c)|)
                const cross = [
                    v2[1] * v3[2] - v2[2] * v3[1],
                    v2[2] * v3[0] - v2[0] * v3[2],
                    v2[0] * v3[1] - v2[1] * v3[0]
                ];
                const dot = v1[0] * cross[0] + v1[1] * cross[1] + v1[2] * cross[2];
                volume += Math.abs(dot) / 6;
            });
        }

        const cost = volume * 0.20; // $0.20 per cubic mm

        res.json({
            volume: volume,
            cost: cost
        });
    } catch (error) {
        res.status(500).json({ error: 'Error processing STL file.' });
    }
});

// Use Render's provided port or fallback to 3000 for local development
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});