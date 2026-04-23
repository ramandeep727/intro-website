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
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const snapshot = await db.collection('users').where('username', '==', username).get();
        if (snapshot.empty) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        
        let user;
        snapshot.forEach(doc => { user = { id: doc.id, ...doc.data() }; });
        
        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        
        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ token, username: user.username });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all properties
app.get('/api/properties', async (req, res) => {
    res.set('Cache-Control', 'no-store');
    try {
        const snapshot = await db.collection('properties').get();
        const properties = [];
        snapshot.forEach(doc => {
            properties.push({ id: doc.id, ...doc.data() });
        });
        res.json(properties);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single property
app.get('/api/properties/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const doc = await db.collection('properties').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Property not found' });
        }
        res.json({ id: doc.id, ...doc.data() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add property (Protected)
app.post('/api/properties', authenticateToken, upload.single('image'), async (req, res) => {
    const { title, price, location, beds, baths, sqft, type } = req.body;
    let imagePath = req.file ? 'uploads/' + req.file.filename : null;

    if (!imagePath && req.body.imageUrl) {
        imagePath = req.body.imageUrl;
    }

    try {
        const newProperty = {
            title, price, location, 
            beds: parseInt(beds) || 0, 
            baths: parseInt(baths) || 0, 
            sqft, type, 
            image: imagePath,
            createdAt: Date.now()
        };
        const docRef = await db.collection('properties').add(newProperty);
        res.status(201).json({ id: docRef.id, message: 'Property added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update property (Protected)
app.put('/api/properties/:id', authenticateToken, upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { title, price, location, beds, baths, sqft, type } = req.body;
    
    try {
        const updateData = {
            title, price, location, 
            beds: parseInt(beds) || 0, 
            baths: parseInt(baths) || 0, 
            sqft, type
        };

        if (req.file) {
            updateData.image = 'uploads/' + req.file.filename;
        } else if (req.body.imageUrl) {
            updateData.image = req.body.imageUrl;
        }

        await db.collection('properties').doc(id).update(updateData);
        res.json({ message: 'Property updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete property (Protected)
app.delete('/api/properties/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await db.collection('properties').doc(id).delete();
        res.json({ message: 'Property deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fallback route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
