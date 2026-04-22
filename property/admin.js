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
    
    const token = localStorage.getItem('adminToken');
    
    // Check if already logged in
    if (token) {
        showDashboard();
    }

    // --- Authentication ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                localStorage.setItem('adminToken', data.token);
                showDashboard();
            } else {
                loginError.textContent = data.error || 'Login failed';
            }
        } catch (err) {
            loginError.textContent = 'Server error. Try again.';
        }
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('adminToken');
        loginSection.style.display = 'flex';
        dashboardSection.style.display = 'none';
        loginForm.reset();
        loginError.textContent = '';
    });

    function showDashboard() {
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        fetchAdminProperties();
    }

    // --- Properties Management ---
    async function fetchAdminProperties() {
        try {
            const res = await fetch('/api/properties', { cache: 'no-store' });
            const properties = await res.json();
            
            adminPropertiesTable.innerHTML = '';
            
            properties.forEach(prop => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><img src="/${prop.image}" alt="${prop.title}"></td>
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
            const res = await fetch(`/api/properties/${id}`);
            const prop = await res.json();
            
            document.getElementById('propId').value = prop.id;
            document.getElementById('propTitle').value = prop.title;
            document.getElementById('propPrice').value = prop.price;
            document.getElementById('propType').value = prop.type;
            document.getElementById('propLocation').value = prop.location;
            document.getElementById('propBeds').value = prop.beds;
            document.getElementById('propBaths').value = prop.baths;
            document.getElementById('propSqft').value = prop.sqft.replace(/,/g, '');
            
            document.getElementById('currentImagePreview').innerHTML = `
                <p>Current Image:</p>
                <img src="/${prop.image}" alt="Current" style="width: 100px; border-radius: 4px;">
            `;
            
            modalTitle.textContent = 'Edit Property';
            propertyModal.classList.add('show');
        } catch (err) {
            console.error('Failed to fetch property details', err);
        }
    }

    propertyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('propId').value;
        const isEdit = !!id;
        const token = localStorage.getItem('adminToken');
        
        const formData = new FormData();
        formData.append('title', document.getElementById('propTitle').value);
        formData.append('price', document.getElementById('propPrice').value);
        formData.append('type', document.getElementById('propType').value);
        formData.append('location', document.getElementById('propLocation').value);
        formData.append('beds', document.getElementById('propBeds').value);
        formData.append('baths', document.getElementById('propBaths').value);
        // Format sqft to add comma if not present (simple formatting)
        let sqftVal = document.getElementById('propSqft').value;
        if (!sqftVal.includes(',')) {
            sqftVal = Number(sqftVal).toLocaleString('en-US');
        }
        formData.append('sqft', sqftVal);
        
        const imageFile = document.getElementById('propImage').files[0];
        if (imageFile) {
            formData.append('image', imageFile);
        } else if (!isEdit) {
            alert("Please select an image.");
            return;
        }

        try {
            const url = isEdit ? `/api/properties/${id}` : '/api/properties';
            const method = isEdit ? 'PUT' : 'POST';
            
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                propertyModal.classList.remove('show');
                fetchAdminProperties();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to save property');
                if (res.status === 401 || res.status === 403) {
                     logoutBtn.click(); // Force logout on invalid token
                }
            }
        } catch (err) {
            console.error('Error saving property', err);
            alert('Server error.');
        }
    });

    async function deleteProperty(id) {
        if (!confirm('Are you sure you want to delete this property?')) return;
        
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch(`/api/properties/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (res.ok) {
                fetchAdminProperties();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete property');
                if (res.status === 401 || res.status === 403) {
                     logoutBtn.click();
                }
            }
        } catch (err) {
            console.error('Error deleting property', err);
        }
    }

});
