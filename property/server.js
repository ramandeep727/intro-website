const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs');

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'super_secret_property_key_please_change';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}

// Multer setup for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Serve static files (Frontend & Uploads & Images)
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// --- API ROUTES ---

// Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        
        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        
        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ token, username: user.username });
    });
});

// Get all properties
app.get('/api/properties', (req, res) => {
    res.set('Cache-Control', 'no-store');
    db.all('SELECT * FROM properties ORDER BY id DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get single property
app.get('/api/properties/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM properties WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Property not found' });
        }
        res.json(row);
    });
});

// Add property (Protected)
app.post('/api/properties', authenticateToken, upload.single('image'), (req, res) => {
    const { title, price, location, beds, baths, sqft, type } = req.body;
    let imagePath = req.file ? 'uploads/' + req.file.filename : null;

    // If no new image was uploaded but an image URL/path was provided
    if (!imagePath && req.body.imageUrl) {
        imagePath = req.body.imageUrl;
    }

    const insert = `INSERT INTO properties (title, price, location, beds, baths, sqft, type, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(insert, [title, price, location, beds, baths, sqft, type, imagePath], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, message: 'Property added successfully' });
    });
});

// Update property (Protected)
app.put('/api/properties/:id', authenticateToken, upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { title, price, location, beds, baths, sqft, type } = req.body;
    
    // Check if new image was uploaded
    if (req.file) {
        const imagePath = 'uploads/' + req.file.filename;
        const update = `UPDATE properties SET title = ?, price = ?, location = ?, beds = ?, baths = ?, sqft = ?, type = ?, image = ? WHERE id = ?`;
        db.run(update, [title, price, location, beds, baths, sqft, type, imagePath, id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Property updated successfully' });
        });
    } else {
        // Update without changing image, unless imageUrl is provided
        const imagePath = req.body.imageUrl; // In case they provide a static url
        if (imagePath) {
             const update = `UPDATE properties SET title = ?, price = ?, location = ?, beds = ?, baths = ?, sqft = ?, type = ?, image = ? WHERE id = ?`;
             db.run(update, [title, price, location, beds, baths, sqft, type, imagePath, id], function(err) {
                 if (err) return res.status(500).json({ error: err.message });
                 res.json({ message: 'Property updated successfully' });
             });
        } else {
             const update = `UPDATE properties SET title = ?, price = ?, location = ?, beds = ?, baths = ?, sqft = ?, type = ? WHERE id = ?`;
             db.run(update, [title, price, location, beds, baths, sqft, type, id], function(err) {
                 if (err) return res.status(500).json({ error: err.message });
                 res.json({ message: 'Property updated successfully' });
             });
        }
    }
});

// Delete property (Protected)
app.delete('/api/properties/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM properties WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Property deleted successfully' });
    });
});

// Fallback route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
