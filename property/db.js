const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )`, (err) => {
      if (!err) {
        // Create default admin user if not exists
        const insert = 'INSERT INTO users (username, password) VALUES (?, ?)';
        const hash = bcrypt.hashSync('admin123', 10);
        db.run(insert, ['admin', hash], (err) => {
            if (!err) {
                console.log('Default admin created (admin / admin123)');
            }
        });
      }
    });

    db.run(`CREATE TABLE IF NOT EXISTS properties (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            price TEXT,
            location TEXT,
            beds INTEGER,
            baths INTEGER,
            sqft TEXT,
            type TEXT, -- sale or rent
            image TEXT
        )`, (err) => {
        if (!err) {
            // Seed properties if empty
            db.get("SELECT COUNT(*) AS count FROM properties", (err, row) => {
                if (row && row.count === 0) {
                    const insert = `INSERT INTO properties (title, price, location, beds, baths, sqft, type, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                    db.run(insert, ['Oceanview Modern Villa', '₹4.5 Cr', 'North Goa, India', 4, 3, '3,200', 'sale', 'images/property-villa.png']);
                    db.run(insert, ['Aurora Sky Apartments', '₹85,000 /month', 'Bandra West, Mumbai', 3, 2, '1,800', 'rent', 'images/property-apartment.png']);
                    db.run(insert, ['Skyline Penthouse Suite', '₹8.2 Cr', 'Golf Course Road, Gurugram', 5, 4, '5,400', 'sale', 'images/property-penthouse.png']);
                    db.run(insert, ['Heritage Brick Townhouse', '₹2.8 Cr', 'Koregaon Park, Pune', 3, 2, '2,400', 'sale', 'images/property-townhouse.png']);
                    db.run(insert, ['Premium Office Space', '₹1,20,000 /month', 'Whitefield, Bangalore', 0, 3, '4,000', 'rent', 'images/property-commercial.png']);
                    db.run(insert, ['Paradise Garden Villa', '₹6.5 Cr', 'Jubilee Hills, Hyderabad', 6, 5, '7,200', 'sale', 'images/property-villa.png']);
                    console.log('Database seeded with initial properties.');
                }
            });
        }
    });
  }
});

module.exports = db;
