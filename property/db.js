const admin = require('firebase-admin');
const bcrypt = require('bcrypt');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Seed default admin user if not exists
async function seedDefaultAdmin() {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('username', '==', 'admin').get();
  
  if (snapshot.empty) {
    const hash = bcrypt.hashSync('admin123', 10);
    // Explicitly set ID for easy lookup, or let it auto-generate. Auto-generate is fine.
    await usersRef.add({
      username: 'admin',
      password: hash
    });
    console.log('Default admin created (admin / admin123) in Firestore');
  }
}

// Seed initial properties if empty
async function seedProperties() {
  const propsRef = db.collection('properties');
  const snapshot = await propsRef.limit(1).get();
  
  if (snapshot.empty) {
    const defaultProperties = [
      { title: 'Oceanview Modern Villa', price: '₹4.5 Cr', location: 'North Goa, India', beds: 4, baths: 3, sqft: '3,200', type: 'sale', image: 'images/property-villa.png' },
      { title: 'Aurora Sky Apartments', price: '₹85,000 /month', location: 'Bandra West, Mumbai', beds: 3, baths: 2, sqft: '1,800', type: 'rent', image: 'images/property-apartment.png' },
      { title: 'Skyline Penthouse Suite', price: '₹8.2 Cr', location: 'Golf Course Road, Gurugram', beds: 5, baths: 4, sqft: '5,400', type: 'sale', image: 'images/property-penthouse.png' },
      { title: 'Heritage Brick Townhouse', price: '₹2.8 Cr', location: 'Koregaon Park, Pune', beds: 3, baths: 2, sqft: '2,400', type: 'sale', image: 'images/property-townhouse.png' },
      { title: 'Premium Office Space', price: '₹1,20,000 /month', location: 'Whitefield, Bangalore', beds: 0, baths: 3, sqft: '4,000', type: 'rent', image: 'images/property-commercial.png' },
      { title: 'Paradise Garden Villa', price: '₹6.5 Cr', location: 'Jubilee Hills, Hyderabad', beds: 6, baths: 5, sqft: '7,200', type: 'sale', image: 'images/property-villa.png' }
    ];
    
    for (const prop of defaultProperties) {
      await propsRef.add(prop);
    }
    console.log('Firestore seeded with initial properties.');
  }
}

seedDefaultAdmin().catch(console.error);
seedProperties().catch(console.error);

module.exports = db;
