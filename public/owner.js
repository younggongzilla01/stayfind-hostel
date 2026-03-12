// =============================================
//  STAYFIND — OWNER PORTAL LOGIC
// =============================================

// ---- DATA ----
let OWNER_DATA = {
    name: "Ravi Kumar",
    avatar: "RK",
    hostels: [
        { id: 101, name: "GreenLeaf Boys PG", city: "Bengaluru", area: "Koramangala", gender: "male", status: "Active", tenants: 12, rent: 8500 },
        { id: 102, name: "Sunrise Women's Hostel", city: "Pune", area: "Viman Nagar", gender: "female", status: "Active", tenants: 16, rent: 7500 },
        { id: 103, name: "The Urban Nest", city: "Mumbai", area: "Bandra", gender: "coed", status: "Pending", tenants: 0, rent: 12000 }
    ],
    rooms: [
        { id: 1, hostelId: 101, number: "101", type: "Triple Shared", beds: [
            { id: 1, status: "occupied", student: "Aman Gupta" },
            { id: 2, status: "occupied", student: "Rahul Singh" },
            { id: 3, status: "available", student: null }
        ]},
        { id: 2, hostelId: 101, number: "102", type: "Double Shared", beds: [
            { id: 4, status: "occupied", student: "Vikram Roy" },
            { id: 5, status: "occupied", student: "Sanjay Jha" }
        ]},
        { id: 3, hostelId: 101, number: "103", type: "Private", beds: [
            { id: 6, status: "occupied", student: "Karan Mehra" }
        ]},
        { id: 4, hostelId: 102, number: "201", type: "Double Shared", beds: [
            { id: 7, status: "occupied", student: "Priya Das" },
            { id: 8, status: "available", student: null }
        ]}
    ],
    residents: [
        { id: 1, name: "Aman Gupta", room: "101", hostelId: 101, joinDate: "2024-01-10", rentStatus: "Paid", phone: "+91 91234 56789" },
        { id: 2, name: "Rahul Singh", room: "101", hostelId: 101, joinDate: "2024-02-15", rentStatus: "Pending", phone: "+91 98765 43210" },
        { id: 3, name: "Vikram Roy", room: "102", hostelId: 101, joinDate: "2023-11-20", rentStatus: "Paid", phone: "+91 99887 76655" },
        { id: 4, name: "Sanjay Jha", room: "102", hostelId: 101, joinDate: "2024-03-01", rentStatus: "Overdue", phone: "+91 90000 11111" }
    ],
    payments: [
        { id: 1, student: "Aman Gupta", room: "101", month: "March 2024", amount: 8500, status: "Paid" },
        { id: 2, student: "Rahul Singh", room: "101", month: "March 2024", amount: 8500, status: "Pending" },
        { id: 3, student: "Sanjay Jha", room: "102", month: "March 2024", amount: 8500, status: "Overdue" }
    ],
    inquiries: [
        { id: 1, name: "Aditya Verma", hostel: "GreenLeaf Boys PG", message: "Is a private room available from next month?", date: "2024-03-10", status: "new" },
        { id: 2, name: "Sanya Malhotra", hostel: "Sunrise Women's Hostel", message: "Interested in the double sharing room. Can I visit tomorrow?", date: "2024-03-09", status: "replied" }
    ]
};

// ---- AUTH API INTEGRATION ----
let ownerToken = localStorage.getItem('stayfind_token');
let ownerProfile = null;

async function apiFetch(endpoint, method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (ownerToken) headers['Authorization'] = `Bearer ${ownerToken}`;
    
    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);
    
    const res = await fetch(`/api${endpoint}`, config);
    if (!res.ok) {
        if (res.status === 401) { ownerLogout(); throw new Error('Session expired'); }
        const err = await res.json();
        throw new Error(err.message || 'API Error');
    }
    return res.json();
}

async function ownerLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password')?.value || 'password'; // Assuming password field exists or mocked

    if (!email) return showToast('Email required', 'error');

    try {
        const data = await apiFetch('/auth/login', 'POST', { email, password });
        localStorage.setItem('stayfind_token', data.token);
        ownerToken = data.token;
        ownerProfile = data;
        OWNER_DATA.name = data.name;
        
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('portal-app').style.display = 'flex';
        initPortal();
        showToast(`Welcome back, ${data.name}!`, "success");
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function ownerRegister() {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password')?.value || 'password';
    const phone = document.getElementById('reg-phone')?.value || '';

    if (!name || !email) return showToast('Name and Email required', 'error');

    try {
        const data = await apiFetch('/auth/register', 'POST', { name, email, password, phone, role: 'owner' });
        localStorage.setItem('stayfind_token', data.token);
        ownerToken = data.token;
        ownerProfile = data;
        OWNER_DATA.name = data.name;
        
        switchAuthTab('login');
        showToast(`Registered successfully. Please log in!`, "success");
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function ownerLogout() {
    localStorage.removeItem('stayfind_token');
    ownerToken = null;
    ownerProfile = null;
    location.reload();
}

function checkAuth() {
    if (ownerToken) {
        // Optimistic UI load
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('portal-app').style.display = 'flex';
        initPortal();
    } else {
        document.getElementById('auth-screen').style.display = 'flex';
        document.getElementById('portal-app').style.display = 'none';
    }
}

// ---- NAVIGATION ----
function showPage(pageId) {
    const pages = [
        'dashboard', 'rooms', 'residents', 'my-hostels', 
        'add-hostel', 'inquiries', 'reviews', 'payments', 
        'earnings', 'invoices'
    ];
    
    pages.forEach(p => {
        const el = document.getElementById('page-' + p);
        if (el) el.style.display = 'none';
        const navEl = document.getElementById('nav-' + p);
        if (navEl) navEl.classList.remove('active');
    });

    document.getElementById('page-' + pageId).style.display = 'block';
    const activeNav = document.getElementById('nav-' + pageId);
    if (activeNav) activeNav.classList.add('active');

    // Breadcrumb & Title
    const titles = {
        dashboard: "Dashboard Overview",
        rooms: "Room & Bed Management",
        residents: "Student Residents",
        'my-hostels': "My List Hostels",
        'add-hostel': "List New Hostel",
        inquiries: "Tenant Inquiries",
        reviews: "Property Reviews",
        payments: "Payment Tracking",
        earnings: "Earnings Report",
        invoices: "Invoice History"
    };

    document.getElementById('page-title').textContent = titles[pageId] || "Portal";
    
    // Page specific initialization
    if (pageId === 'rooms') loadRoomManagement();
    if (pageId === 'residents') loadResidents();
    if (pageId === 'payments') loadPayments();
    if (pageId === 'dashboard') loadDashboard();
    if (pageId === 'my-hostels') renderMyHostels();
    if (pageId === 'inquiries') renderInquiries();

    if (window.innerWidth <= 768) closeMobileSidebar();
}

// ---- UI COMPONENTS ----
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const main = document.getElementById('main-content');
    sidebar.classList.toggle('collapsed');
    main.classList.toggle('sidebar-collapsed');
}

function openMobileSidebar() {
    document.getElementById('sidebar').classList.add('mobile-open');
    document.getElementById('mobile-overlay').classList.add('show');
}

function closeMobileSidebar() {
    document.getElementById('sidebar').classList.remove('mobile-open');
    document.getElementById('mobile-overlay').classList.remove('show');
}

function showToast(msg, type = 'info') {
    const t = document.getElementById('portal-toast');
    t.innerHTML = `<span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span> ${msg}`;
    t.className = 'portal-toast show ' + type;
    setTimeout(() => t.classList.remove('show'), 3000);
}

// ---- DASHBOARD ----
async function loadDashboard() {
    try {
        const hostels = await apiFetch('/owner/hostels');
        OWNER_DATA.hostels = hostels; // Cache for other tabs
        
        renderDashboardHostels(hostels);
        renderRecentInquiries(); // Still static for now
        
        // Update Stats
        document.getElementById('stat-total-hostels').textContent = hostels.length;
        
        // Chart simulation
        const ctx = document.getElementById('owner-earnings-chart').getContext('2d');
        drawSimpleChart(ctx, [1.2, 1.4, 1.1, 1.6, 1.8, 1.5]);
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function renderDashboardHostels(hostels) {
    const body = document.getElementById('dashboard-hostels-body');
    if(hostels.length === 0) {
        body.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem">No hostels added yet. Add one!</td></tr>';
        return;
    }
    body.innerHTML = hostels.slice(0, 5).map(h => `
        <tr>
            <td class="td-bold">${h.name}</td>
            <td>${h.gender.charAt(0).toUpperCase() + h.gender.slice(1)}</td>
            <td>₹${h.rent || 'N/A'}</td>
            <td><span class="badge ${h.status === 'Active' ? 'badge-green' : 'badge-yellow'}"><span class="badge-dot"></span>${h.status}</span></td>
            <td><button class="btn btn-sm btn-ghost" onclick="showPage('my-hostels')">View</button></td>
        </tr>
    `).join('');
}

function renderRecentInquiries() {
    const list = document.getElementById('recent-inquiries-list');
    list.innerHTML = OWNER_DATA.inquiries.map(i => `
        <div style="padding:1rem; border-bottom:1px solid var(--border)">
            <div style="display:flex; justify-content:space-between; margin-bottom:4px">
                <strong style="font-size:0.9rem">${i.name}</strong>
                <span class="td-muted">${i.date}</span>
            </div>
            <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:8px">${i.message}</p>
            <div style="display:flex; justify-content:space-between; align-items:center">
                <span class="badge ${i.status==='new' ? 'badge-orange' : 'badge-blue'}">${i.status}</span>
                <button class="btn btn-sm btn-outline" onclick="openReplyModal(${i.id})">Reply</button>
            </div>
        </div>
    `).join('');
}

// ---- ROOM MANAGEMENT ----
function loadRoomManagement() {
    const grid = document.getElementById('room-management-grid');
    const hostelFilter = document.getElementById('room-hostel-filter');
    
    // Fill filter if empty
    if (hostelFilter.options.length === 1) {
        OWNER_DATA.hostels.forEach(h => {
            const opt = document.createElement('option');
            opt.value = h.id;
            opt.textContent = h.name;
            hostelFilter.appendChild(opt);
        });
    }

    const selectedHostelId = parseInt(hostelFilter.value);
    const rooms = selectedHostelId ? OWNER_DATA.rooms.filter(r => r.hostelId === selectedHostelId) : OWNER_DATA.rooms;

    if (rooms.length === 0) {
        grid.innerHTML = '<div class="empty-state"><div class="emoji">🏚️</div><h3>No rooms found</h3><p>Use the filter or add rooms to your hostel.</p></div>';
        return;
    }

    grid.innerHTML = rooms.map(r => `
        <div class="room-box">
            <div class="room-header">
                <span class="room-number">Room ${r.number}</span>
                <span class="badge badge-gray">${r.type}</span>
            </div>
            <div class="bed-container">
                ${r.beds.map(b => `
                    <div class="bed-icon ${b.status === 'occupied' ? 'bed-occupied' : 'bed-available'}" 
                         title="${b.student || 'Available Bed'}" 
                         onclick="toggleBedStatus(${r.id}, ${b.id})">
                        🛏️
                    </div>
                `).join('')}
            </div>
            <div style="margin-top:1rem; font-size:0.75rem; color:var(--text-faint)">
                Click bed to toggle status
            </div>
        </div>
    `).join('');
}

let currentBedAction = null;

function toggleBedStatus(roomId, bedId) {
    const room = OWNER_DATA.rooms.find(r => r.id === roomId);
    const bed = room.beds.find(b => b.id === bedId);
    
    currentBedAction = { roomId, bedId };
    
    if (bed.status === 'occupied') {
        currentBedAction.action = 'unassign';
        document.getElementById('bed-modal-title').textContent = "Vacate Bed";
        document.getElementById('bed-modal-body').innerHTML = `
            <p style="margin-bottom:1rem">Are you sure you want to remove <strong>${bed.student}</strong> from this bed and mark it as available?</p>
        `;
        document.getElementById('bed-modal-footer').innerHTML = `
            <button class="btn btn-ghost" onclick="closeModal('bed-modal')">Cancel</button>
            <button class="btn btn-primary" style="background:var(--red);border-color:var(--red)" onclick="confirmBedAction()">Yes, Vacate</button>
        `;
    } else {
        currentBedAction.action = 'assign';
        document.getElementById('bed-modal-title').textContent = "Assign Bed";
        document.getElementById('bed-modal-body').innerHTML = `
            <div class="form-group" style="margin-bottom:0">
                <label class="form-label">Student Name</label>
                <input type="text" class="form-input" id="bed-student-name" placeholder="Enter student name..." />
            </div>
        `;
        document.getElementById('bed-modal-footer').innerHTML = `
            <button class="btn btn-ghost" onclick="closeModal('bed-modal')">Cancel</button>
            <button class="btn btn-primary" onclick="confirmBedAction()">Assign Bed</button>
        `;
    }
    
    document.getElementById('bed-modal').classList.add('open');
}

function confirmBedAction() {
    if (!currentBedAction) return;
    const room = OWNER_DATA.rooms.find(r => r.id === currentBedAction.roomId);
    const bed = room.beds.find(b => b.id === currentBedAction.bedId);
    
    if (currentBedAction.action === 'unassign') {
        bed.status = 'available';
        bed.student = null;
        showToast("Bed is now available", "success");
    } else {
        const studentName = document.getElementById('bed-student-name').value;
        if (!studentName) return showToast("Please enter a student name.", "error");
        bed.status = 'occupied';
        bed.student = studentName;
        showToast("Bed assigned to " + studentName, "success");
    }
    
    closeModal('bed-modal');
    loadRoomManagement();
}

// ---- RESIDENTS ----
function loadResidents() {
    const body = document.getElementById('residents-table-body');
    body.innerHTML = OWNER_DATA.residents.map(r => `
        <tr>
            <td class="td-bold">${r.name}</td>
            <td>Room ${r.room}</td>
            <td>${r.joinDate}</td>
            <td><span class="badge ${r.rentStatus === 'Paid' ? 'badge-green' : r.rentStatus === 'Pending' ? 'badge-yellow' : 'badge-red'}">${r.rentStatus}</span></td>
            <td>${r.phone}</td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="showToast('Calling ${r.name}...','info')">📞</button>
                <button class="btn btn-sm btn-ghost" onclick="showToast('Messaging ${r.name}...','info')">💬</button>
            </td>
        </tr>
    `).join('');
}

// ---- PAYMENTS ----
function loadPayments() {
    const body = document.getElementById('payments-table-body');
    body.innerHTML = OWNER_DATA.payments.map(p => `
        <tr>
            <td class="td-bold">${p.student}</td>
            <td>Room ${p.room}</td>
            <td>${p.month}</td>
            <td>₹${p.amount.toLocaleString()}</td>
            <td><span class="badge ${p.status === 'Paid' ? 'badge-green' : p.status === 'Pending' ? 'badge-yellow' : 'badge-red'}">${p.status}</span></td>
            <td>
                ${p.status !== 'Paid' ? `<button class="btn btn-sm btn-primary" onclick="sendPaymentReminder('${p.student}')">Send Reminder 🔔</button>` : `<span class="td-muted">Complete</span>`}
            </td>
        </tr>
    `).join('');
}

function sendPaymentReminder(student) {
    showToast(`🔔 Payment reminder sent to ${student}!`, "success");
}

// ---- MY HOSTELS ----
async function renderMyHostels() {
    try {
        const hostels = await apiFetch('/owner/hostels');
        const body = document.getElementById('my-hostels-body');
        
        if (hostels.length === 0) {
            body.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem">No hostels found.</td></tr>';
            return;
        }

        body.innerHTML = hostels.map(h => `
            <tr>
                <td class="td-bold">${h.name}</td>
                <td>${h.area}, ${h.city}</td>
                <td>${h.rooms && h.rooms.length > 0 ? h.rooms[0].type : 'N/A'}</td>
                <td>₹${h.rent || 'N/A'}</td>
                <td>0</td>
                <td><span class="badge ${h.status === 'Active' ? 'badge-green' : 'badge-yellow'}">${h.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="editHostel('${h._id}')">Edit</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// ---- WIZARD ----
let currentWizardStep = 1;
function wizardNext(step) {
    if (step === 1) {
        if (!document.getElementById('w-name').value || !document.getElementById('w-city').value) {
            return showToast("Please fill all required fields (*)", "error");
        }
    }
    document.getElementById(`wizard-step-${step}`).style.display = 'none';
    document.getElementById(`wizard-step-${step+1}`).style.display = 'block';
    document.getElementById(`sc-${step}`).classList.add('done');
    document.getElementById(`sc-${step}`).classList.remove('active');
    document.getElementById(`sl-${step}`).classList.add('done');
    document.getElementById(`sc-${step+1}`).classList.add('active');
    currentWizardStep = step + 1;
    if (currentWizardStep === 4) renderReview();
}

function wizardPrev(step) {
    document.getElementById(`wizard-step-${step}`).style.display = 'none';
    document.getElementById(`wizard-step-${step-1}`).style.display = 'block';
    document.getElementById(`sc-${step}`).classList.remove('active');
    document.getElementById(`sc-${step-1}`).classList.add('active');
    document.getElementById(`sc-${step-1}`).classList.remove('done');
    document.getElementById(`sl-${step-1}`).classList.remove('done');
}

function addRoomEntry() {
    const html = `
    <div class="room-entry" style="background:var(--dark-3);border:1px solid var(--border);border-radius:var(--radius);padding:1.25rem;margin-bottom:1rem">
        <div class="form-row">
            <div class="form-group" style="margin-bottom:0">
                <label class="form-label">Room Type</label>
                <select class="form-select room-type-sel">
                    <option>Dormitory</option><option>Private Room</option><option>Shared Room</option><option>Suite</option>
                </select>
            </div>
            <div class="form-group" style="margin-bottom:0">
                <label class="form-label">Monthly Rent (₹)</label>
                <input type="number" class="form-input room-rent" placeholder="e.g. 6500" />
            </div>
        </div>
    </div>`;
    document.getElementById('room-entries').insertAdjacentHTML('beforeend', html);
}

function renderReview() {
    const name = document.getElementById('w-name').value;
    const city = document.getElementById('w-city').value;
    const area = document.getElementById('w-area').value;
    const type = document.getElementById('w-type').value;
    const gender = document.getElementById('w-gender').value;
    
    document.getElementById('review-preview').innerHTML = `
        <div style="font-size:1.1rem; font-weight:700; color:var(--white); margin-bottom:0.75rem">${name} (${type})</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; font-size:0.88rem">
            <div><span style="color:var(--text-faint)">Location:</span> ${area}, ${city}</div>
            <div><span style="color:var(--text-faint)">Gender:</span> ${gender}</div>
        </div>
    `;
}

function updatePhotoPreview() {
    const input = document.getElementById('w-photos');
    const preview = document.getElementById('photo-preview-list');
    preview.innerHTML = '';
    
    if (input.files && input.files.length > 0) {
        if(input.files.length > 5) {
            showToast("Maximum 5 photos allowed", "error");
            input.value = "";
            return;
        }
        Array.from(input.files).forEach(file => {
            const chip = document.createElement('div');
            chip.style.cssText = 'background:rgba(255,255,255,0.1);padding:4px 8px;border-radius:4px;font-size:0.8rem;';
            chip.innerText = file.name;
            preview.appendChild(chip);
        });
    }
}

async function submitHostel() {
    // Step 1 Info
    const name = document.getElementById('w-name').value;
    const city = document.getElementById('w-city').value;
    const area = document.getElementById('w-area').value;
    const address = document.getElementById('w-address').value;
    const pinCode = document.getElementById('w-pincode')?.value || '';
    const propertyType = document.getElementById('w-type')?.value || 'Building';
    const gender = document.getElementById('w-gender').value;

    // Step 3 Info
    const foodAvl = document.getElementById('w-food-avl')?.value === 'Yes';
    const meals = [];
    if(document.getElementById('w-food-bf')?.checked) meals.push('Breakfast');
    if(document.getElementById('w-food-lun')?.checked) meals.push('Lunch');
    if(document.getElementById('w-food-din')?.checked) meals.push('Dinner');

    const waterSupply = document.getElementById('w-water')?.value || '24/7';
    const facilities = [];
    if(document.getElementById('w-water-hot')?.checked) facilities.push('Hot Water');
    if(document.getElementById('w-water-cold')?.checked) facilities.push('Cold Water');
    
    document.querySelectorAll('.fac-cb:checked').forEach(cb => {
        facilities.push(cb.value);
    });

    const rules = document.getElementById('w-rules')?.value || '';
    
    // Photo Upload Process
    let uploadedPhotoUrls = [];
    const photoInput = document.getElementById('w-photos');
    
    if (photoInput.files && photoInput.files.length > 0) {
        showToast("Uploading photos to Cloudinary...", "info");
        const formData = new FormData();
        Array.from(photoInput.files).forEach(f => formData.append('photos', f));
        
        try {
            // we use direct fetch because apiFetch assumes JSON
            const uploadRes = await fetch(`${API_BASE}/owner/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${ownerToken}` },
                body: formData
            });
            const uploadData = await uploadRes.json();
            if(!uploadRes.ok) throw new Error(uploadData.message || "Upload failed");
            uploadedPhotoUrls = uploadData.urls;
        } catch (upErr) {
            showToast(upErr.message, 'error');
            return; // halt hostel submission if upload fails
        }
    }

    try {
        const payload = { 
            name, city, area, address, pinCode, propertyType, gender,
            food: { available: foodAvl, meals },
            waterSupply,
            facilities,
            rules,
            photos: uploadedPhotoUrls,
            status: "Pending"
        };
        const newHostel = await apiFetch('/owner/hostels', 'POST', payload);
        
        showToast("Listing submitted for review!", "success");
        setTimeout(() => {
            currentWizardStep = 1;
            wizardPrev(4); wizardPrev(3); wizardPrev(2); // reset UI
            document.getElementById('w-name').value = '';
            showPage('dashboard');
        }, 1500);
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// ---- UTILS ----
function drawSimpleChart(ctx, data) {
    const w =ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.clearRect(0,0,w,h);
    const barW = (w / data.length) - 20;
    const max = Math.max(...data);
    data.forEach((val, i) => {
        const barH = (val / max) * (h - 40);
        ctx.fillStyle = i === data.length - 1 ? '#f97316' : '#2d3141';
        ctx.fillRect(i * (barW + 20), h - barH, barW, barH);
    });
}

function openReplyModal(id) {
    const inq = OWNER_DATA.inquiries.find(i => i.id === id);
    document.getElementById('inquiry-preview-text').textContent = `From: ${inq.name} - "${inq.message}"`;
    document.getElementById('reply-modal').classList.add('open');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('open');
}

function sendReply() {
    showToast("Reply sent to tenant!", "success");
    closeModal('reply-modal');
}

function switchAuthTab(type) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + type).classList.add('active');
    document.getElementById('login-form').style.display = type === 'login' ? 'block' : 'none';
    document.getElementById('register-form').style.display = type === 'register' ? 'block' : 'none';
}

// ---- INIT ----
checkAuth();
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        document.getElementById('mobile-overlay').classList.remove('show');
        document.getElementById('sidebar').classList.remove('mobile-open');
    }
});
