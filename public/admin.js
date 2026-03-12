// =============================================
//  STAYFIND — ADMIN/MANAGEMENT LOGIC
// =============================================

// ---- DATA ----
let ADMIN_DATA = {
    pending: [
        { id: 201, date: "2024-03-11", owner: "Suresh Raina", hostel: "Stadium Boys PG", city: "Chennai", rooms: 8, rent: 7000 },
        { id: 202, date: "2024-03-12", owner: "Anita Desai", hostel: "Creative Women's Guest House", city: "Delhi", rooms: 12, rent: 9000 },
        { id: 203, date: "2024-03-12", owner: "Ravi Kumar", hostel: "The Urban Nest", city: "Mumbai", rooms: 5, rent: 12000 }
    ],
    hostels: [
        { uid: "SF-001", name: "GreenLeaf Boys PG", owner: "Ravi Kumar", city: "Bengaluru", tenants: 12, status: "Active" },
        { uid: "SF-002", name: "Sunrise Women's Hostel", owner: "Ravi Kumar", city: "Pune", tenants: 16, status: "Active" },
        { uid: "SF-003", name: "Royal Stay PG", owner: "Vikram Singh", city: "Hyderabad", tenants: 45, status: "Active" },
        { uid: "SF-004", name: "Comfort Living", owner: "Meera Nair", city: "Kochi", tenants: 0, status: "Suspended" }
    ],
    complaints: [
        { ticket: "T-501", resident: "Aman Gupta", hostel: "GreenLeaf Boys PG", subject: "WiFi not working", priority: "High", status: "Open" },
        { ticket: "T-502", resident: "Priya Das", hostel: "Sunrise Women's Hostel", subject: "Water heater issue", priority: "Medium", status: "Resolved" }
    ]
};

// ---- AUTH API INTEGRATION ----
let adminToken = localStorage.getItem('stayfind_admin_token');

async function apiFetch(endpoint, method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`;
    
    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);
    
    const res = await fetch(`/api${endpoint}`, config);
    if (!res.ok) {
        if (res.status === 401) { adminLogout(); throw new Error('Session expired'); }
        const err = await res.json();
        throw new Error(err.message || 'API Error');
    }
    return res.json();
}

async function adminLogin() {
    const id = document.getElementById('admin-id').value;
    const pin = document.getElementById('admin-pin').value;
    
    // In a real app we'd map this to email/pass, for this quick conversion we'll mock login
    // assuming the generic auth flow is hit with a master admin account
    try {
        const data = await apiFetch('/auth/login', 'POST', { email: id, password: pin });
        if (data.role !== 'admin') throw new Error('Unauthorized Access');
        
        localStorage.setItem('stayfind_admin_token', data.token);
        adminToken = data.token;
        
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('portal-app').style.display = 'flex';
        initAdminPortal();
        showToast("Access Granted. Welcome, Administrator.", "success");
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function adminLogout() {
    localStorage.removeItem('stayfind_admin_token');
    adminToken = null;
    location.reload();
}

function checkAdminAuth() {
    if (adminToken) {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('portal-app').style.display = 'flex';
        initAdminPortal();
    }
}

// ---- NAVIGATION ----
function showPage(pageId) {
    const pages = ['overview', 'approvals', 'all-hostels', 'all-tenants', 'complaints'];
    pages.forEach(p => {
        const el = document.getElementById('page-' + p);
        if (el) el.style.display = 'none';
        const navEl = document.getElementById('nav-' + p);
        if (navEl) navEl.classList.remove('active');
    });

    document.getElementById('page-' + pageId).style.display = 'block';
    const activeNav = document.getElementById('nav-' + pageId);
    if (activeNav) activeNav.classList.add('active');

    const titles = {
        overview: "Master Overview",
        approvals: "Property Approvals",
        'all-hostels': "Global Property Master",
        complaints: "Resident Support & Complaints"
    };
    document.getElementById('page-title').textContent = titles[pageId] || "Admin Portal";

    if (pageId === 'overview') renderOverview();
    if (pageId === 'approvals') renderApprovals();
    if (pageId === 'all-hostels') renderAllHostels();
    if (pageId === 'complaints') renderComplaints();
}

// ---- UI LOGIC ----
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
    document.getElementById('main-content').classList.toggle('sidebar-collapsed');
}

function showToast(msg, type = 'info') {
    const t = document.getElementById('portal-toast');
    t.innerHTML = `<span>${type === 'success' ? '✅' : '🛡️'}</span> ${msg}`;
    t.className = 'portal-toast show ' + type;
    setTimeout(() => t.classList.remove('show'), 3000);
}

// ---- PAGES ----
async function renderOverview() {
    try {
        const stats = await apiFetch('/admin/stats');
        document.getElementById('stat-pending').textContent = stats.pendingReviews;
        
        // Mocking recent approvals/tickets for UI until full CRUD is built for them
        const body = document.getElementById('recent-approvals-body');
        body.innerHTML = ADMIN_DATA.pending.slice(0, 3).map(p => `
            <tr>
                <td class="td-bold">${p.owner}</td>
                <td>${p.hostel}</td>
                <td>${p.city}</td>
                <td><button class="btn btn-sm btn-outline" onclick="showPage('approvals')">Review</button></td>
            </tr>
        `).join('');

        const list = document.getElementById('active-tickets-list');
        list.innerHTML = ADMIN_DATA.complaints.map(c => `
            <div style="padding:1rem; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center">
                <div>
                    <div style="font-weight:700; font-size:0.88rem">${c.subject}</div>
                    <div style="font-size:0.75rem; color:var(--text-faint)">${c.hostel} • ${c.resident}</div>
                </div>
                <span class="badge ${c.priority === 'High' ? 'badge-red' : 'badge-yellow'}">${c.priority}</span>
            </div>
        `).join('');
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function renderApprovals() {
    const body = document.getElementById('pending-hostels-body');
    if (ADMIN_DATA.pending.length === 0) {
        body.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:3rem">No pending approvals</td></tr>';
        return;
    }
    body.innerHTML = ADMIN_DATA.pending.map(p => `
        <tr>
            <td>${p.date}</td>
            <td class="td-bold">${p.owner}</td>
            <td>${p.hostel}</td>
            <td><span class="badge badge-gray">${p.rooms} Rooms • ₹${p.rent}</span></td>
            <td>
                <button class="btn btn-sm btn-green" onclick="handleAction(${p.id}, 'approve')">Approve</button>
                <button class="btn btn-sm btn-red" onclick="handleAction(${p.id}, 'reject')">Reject</button>
            </td>
        </tr>
    `).join('');
}

function handleAction(id, action) {
    const p = ADMIN_DATA.pending.find(x => x.id === id);
    if (action === 'approve') {
        showToast(`Property "${p.hostel}" has been approved!`, "success");
        ADMIN_DATA.hostels.push({ uid: "SF-" + (100 + id), name: p.hostel, owner: p.owner, city: p.city, tenants: 0, status: "Active" });
    } else {
        showToast(`Property "${p.hostel}" has been rejected.`, "error");
    }
    ADMIN_DATA.pending = ADMIN_DATA.pending.filter(x => x.id !== id);
    document.getElementById('approval-badge').textContent = ADMIN_DATA.pending.length;
    renderApprovals();
    renderOverview();
}

function renderAllHostels() {
    const body = document.getElementById('all-hostels-body');
    body.innerHTML = ADMIN_DATA.hostels.map(h => `
        <tr>
            <td class="td-muted">${h.uid}</td>
            <td class="td-bold">${h.name}</td>
            <td>${h.owner}</td>
            <td>${h.city}</td>
            <td>${h.tenants}</td>
            <td><span class="badge ${h.status === 'Active' ? 'badge-green' : 'badge-red'}">${h.status}</span></td>
        </tr>
    `).join('');
}

function renderComplaints() {
    const body = document.getElementById('complaints-body');
    body.innerHTML = ADMIN_DATA.complaints.map(c => `
        <tr>
            <td class="td-muted">${c.ticket}</td>
            <td>${c.resident}</td>
            <td>${c.hostel}</td>
            <td>${c.subject}</td>
            <td><span class="badge ${c.priority === 'High' ? 'badge-red' : 'badge-yellow'}">${c.priority}</span></td>
            <td><span class="badge ${c.status === 'Resolved' ? 'badge-green' : 'badge-blue'}">${c.status}</span></td>
        </tr>
    `).join('');
}

// ---- INIT ----
function initAdminPortal() {
    renderOverview();
    document.getElementById('approval-badge').textContent = ADMIN_DATA.pending.length;
}

checkAdminAuth();
