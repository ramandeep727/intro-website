import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore, collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
const IMGBB_API_KEY = "4e624a70eb5c79eacee2df392c148ae5";

const firebaseConfig = {
  apiKey: "AIzaSyDP8G0jodxv4Ms_gI4cOD3ncud8mH4264o",
  authDomain: "property-website-c80bc.firebaseapp.com",
  projectId: "property-website-c80bc",
  storageBucket: "property-website-c80bc.firebasestorage.app",
  messagingSenderId: "846629944582",
  appId: "1:846629944582:web:35421c66bcfcb35b2f3287"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// Using ImgBB instead of Firebase Storage for free image hosting

document.addEventListener('DOMContentLoaded', () => {
    
    const loginSection = document.getElementById('loginSection');
    const dashboardSection = document.getElementById('dashboardSection');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');
    
    const adminPropertiesTable = document.getElementById('adminPropertiesTable');
    
    const propertyModal = document.getElementById('propertyModal');
    const addPropertyBtn = document.getElementById('addPropertyBtn');
    const closeModal = document.getElementById('closeModal');
    const propertyForm = document.getElementById('propertyForm');
    const modalTitle = document.getElementById('modalTitle');
    
    // Auth State Observer
    onAuthStateChanged(auth, (user) => {
        if (user) {
            showDashboard();
        } else {
            showLogin();
        }
    });

    // --- Authentication ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Firebase expects email instead of generic username. We format it if user typed "admin"
        const email = username.includes('@') ? username : `${username}@prestige.com`;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            loginError.textContent = '';
        } catch (err) {
            loginError.textContent = 'Invalid credentials or user not found.';
            console.error(err);
        }
    });

    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
        } catch (err) {
            console.error('Error signing out', err);
        }
    });

    function showDashboard() {
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        fetchAdminProperties();
    }
    
    function showLogin() {
        loginSection.style.display = 'flex';
        dashboardSection.style.display = 'none';
        loginForm.reset();
    }

    // --- Properties Management ---
    async function fetchAdminProperties() {
        try {
            const querySnapshot = await getDocs(collection(db, "properties"));
            const properties = [];
            querySnapshot.forEach((doc) => {
                properties.push({ id: doc.id, ...doc.data() });
            });
            
            adminPropertiesTable.innerHTML = '';
            
            properties.forEach(prop => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><img src="${prop.image}" alt="${prop.title}"></td>
                    <td>${prop.title}</td>
                    <td>${prop.location}</td>
                    <td>${prop.price}</td>
                    <td><span class="property-card-badge ${prop.type === 'rent' ? 'rent' : ''}" style="position: static;">For ${prop.type === 'sale' ? 'Sale' : 'Rent'}</span></td>
                    <td class="action-btns">
                        <button class="btn btn-outline btn-sm edit-btn" data-id="${prop.id}">Edit</button>
                        <button class="btn btn-primary btn-sm delete-btn" data-id="${prop.id}" style="background: #ef4444; border-color: #ef4444; color: white;">Delete</button>
                    </td>
                `;
                adminPropertiesTable.appendChild(tr);
            });

            // Attach event listeners to buttons
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => openEditModal(e.target.getAttribute('data-id')));
            });
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => deleteProperty(e.target.getAttribute('data-id')));
            });

        } catch (err) {
            console.error('Failed to fetch properties', err);
        }
    }

    // --- Modal Logic ---
    addPropertyBtn.addEventListener('click', () => {
        propertyForm.reset();
        document.getElementById('propId').value = '';
        document.getElementById('currentImagePreview').innerHTML = '';
        modalTitle.textContent = 'Add New Property';
        propertyModal.classList.add('show');
    });

    closeModal.addEventListener('click', () => {
        propertyModal.classList.remove('show');
    });

    window.addEventListener('click', (e) => {
        if (e.target === propertyModal) {
            propertyModal.classList.remove('show');
        }
    });

    async function openEditModal(id) {
        try {
            const docRef = doc(db, "properties", id);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const prop = docSnap.data();
                document.getElementById('propId').value = docSnap.id;
                document.getElementById('propTitle').value = prop.title;
                document.getElementById('propPrice').value = prop.price;
                document.getElementById('propType').value = prop.type;
                document.getElementById('propLocation').value = prop.location;
                document.getElementById('propBeds').value = prop.beds;
                document.getElementById('propBaths').value = prop.baths;
                document.getElementById('propSqft').value = prop.sqft ? prop.sqft.replace(/,/g, '') : '';
                
                document.getElementById('currentImagePreview').innerHTML = `
                    <p>Current Image:</p>
                    <img src="${prop.image}" alt="Current" style="width: 100px; border-radius: 4px;">
                `;
                // Save current image URL to a hidden attribute so we can keep it if no new file is selected
                document.getElementById('currentImagePreview').setAttribute('data-url', prop.image);
                
                modalTitle.textContent = 'Edit Property';
                propertyModal.classList.add('show');
            }
        } catch (err) {
            console.error('Failed to fetch property details', err);
        }
    }

    propertyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('propId').value;
        const isEdit = !!id;
        
        const title = document.getElementById('propTitle').value;
        const price = document.getElementById('propPrice').value;
        const type = document.getElementById('propType').value;
        const location = document.getElementById('propLocation').value;
        const beds = document.getElementById('propBeds').value;
        const baths = document.getElementById('propBaths').value;
        
        let sqftVal = document.getElementById('propSqft').value;
        if (!sqftVal.includes(',')) {
            sqftVal = Number(sqftVal).toLocaleString('en-US');
        }
        
        let imageUrl = '';
        const imageFile = document.getElementById('propImage').files[0];
        
        const submitBtn = propertyForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;

        try {
            if (imageFile) {
                // Upload to ImgBB
                const imgData = new FormData();
                imgData.append('image', imageFile);
                
                const imgRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                    method: 'POST',
                    body: imgData
                });
                const imgJson = await imgRes.json();
                
                if (imgJson.success) {
                    imageUrl = imgJson.data.url;
                } else {
                    throw new Error(imgJson.error?.message || "Failed to upload image to ImgBB");
                }
            } else if (isEdit) {
                // Use existing image URL
                imageUrl = document.getElementById('currentImagePreview').getAttribute('data-url');
            } else {
                alert("Please select an image.");
                submitBtn.textContent = 'Save Property';
                submitBtn.disabled = false;
                return;
            }

            const propertyData = {
                title, price, type, location, beds: parseInt(beds)||0, baths: parseInt(baths)||0, sqft: sqftVal, image: imageUrl
            };

            if (isEdit) {
                const docRef = doc(db, "properties", id);
                await updateDoc(docRef, propertyData);
            } else {
                propertyData.createdAt = Date.now();
                await addDoc(collection(db, "properties"), propertyData);
            }

            propertyModal.classList.remove('show');
            fetchAdminProperties();
        } catch (err) {
            console.error('Error saving property', err);
            alert('Error saving property: ' + err.message);
        } finally {
            submitBtn.textContent = 'Save Property';
            submitBtn.disabled = false;
        }
    });

    async function deleteProperty(id) {
        if (!confirm('Are you sure you want to delete this property?')) return;
        
        try {
            await deleteDoc(doc(db, "properties", id));
            fetchAdminProperties();
        } catch (err) {
            console.error('Error deleting property', err);
            alert('Failed to delete property: ' + err.message);
        }
    }

});
