// FoodRescue Application Logic & SPA Routing
let currentUser = null;
let authToken = localStorage.getItem('foodrescue_token');
let chartInstance1 = null;
let chartInstance2 = null;

document.addEventListener('DOMContentLoaded', () => {
    initApp();

    // Attach form listeners
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('addFoodForm').addEventListener('submit', handleAddFood);
    document.getElementById('sendToFarmerForm').addEventListener('submit', handleSendToFarmerSubmit);
});

// Toggle dynamic fields during registration
function toggleRegFields() {
    const role = document.getElementById('regRole').value;
    document.getElementById('donorFields').classList.add('d-none');
    document.getElementById('receiverFields').classList.add('d-none');
    document.getElementById('farmerFields').classList.add('d-none');

    if (role === 'ROLE_DONOR') document.getElementById('donorFields').classList.remove('d-none');
    else if (role === 'ROLE_RECEIVER') document.getElementById('receiverFields').classList.remove('d-none');
    else if (role === 'ROLE_FARMER') document.getElementById('farmerFields').classList.remove('d-none');
}

// API Helper Wrapper
async function apiFetch(url, options = {}) {
    options.headers = options.headers || {};
    if (authToken) {
        options.headers['Authorization'] = `Bearer ${authToken}`;
    }
    options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';

    try {
        const res = await fetch(url, options);
        if (res.status === 401 || res.status === 403) {
            if (authToken) {
                showToast('Session expired. Please log in again.', 'warning');
                logout();
            }
            return null;
        }
        if (!res.ok) {
            const errData = await res.json().catch(() => ({ message: 'Server error' }));
            throw new Error(errData.message || `Error ${res.status}`);
        }
        if (res.headers.get('content-type')?.includes('application/json')) {
            return await res.json();
        }
        return await res.text();
    } catch (err) {
        showToast(err.message, 'danger');
        throw err;
    }
}

// Check auth state on startup
async function initApp() {
    if (!authToken) {
        showAuthScreen();
        return;
    }
    try {
        const user = await apiFetch('/api/auth/me');
        if (user && user.id) {
            currentUser = user;
            showAppScreen();
        } else {
            showAuthScreen();
        }
    } catch (e) {
        showAuthScreen();
    }
}

function showAuthScreen() {
    document.getElementById('authScreen').classList.remove('d-none');
    document.getElementById('appScreen').classList.add('d-none');
}

function showAppScreen() {
    document.getElementById('authScreen').classList.add('d-none');
    document.getElementById('appScreen').classList.remove('d-none');

    document.getElementById('userDisplayName').textContent = currentUser.fullName || currentUser.username;
    document.getElementById('userRoleBadge').textContent = formatRole(currentUser.role);

    buildSidebarMenu();
    loadNotifications();

    // Route to default dashboard for role
    loadDashboard();
}

function formatRole(role) {
    if (role === 'ROLE_ADMIN') return 'ADMIN';
    if (role === 'ROLE_DONOR') return 'DONOR';
    if (role === 'ROLE_RECEIVER') return 'RECEIVER';
    if (role === 'ROLE_FARMER') return 'FARMER';
    return role;
}

// Build Role-Based Sidebar Navigation
function buildSidebarMenu() {
    const menu = document.getElementById('sidebarMenu');
    menu.innerHTML = '';

    const role = currentUser.role;

    if (role === 'ROLE_ADMIN') {
        menu.innerHTML = `
            <li class="nav-item"><a class="nav-link active" onclick="loadDashboard()"><i class="fa-solid fa-chart-pie"></i> Admin Dashboard</a></li>
            <li class="nav-item"><a class="nav-link" onclick="loadFoodRecords()"><i class="fa-solid fa-boxes-stacked"></i> All Food Records</a></li>
            <li class="nav-item"><a class="nav-link text-warning fw-bold" onclick="loadExpiredFood()"><i class="fa-solid fa-triangle-exclamation"></i> Expired Food Management</a></li>
            <li class="nav-item"><a class="nav-link" onclick="loadFoodRequests()"><i class="fa-solid fa-hand-holding-heart"></i> Food Requests</a></li>
            <li class="nav-item"><a class="nav-link" onclick="loadFarmerAllocations()"><i class="fa-solid fa-tractor"></i> Farmer Allocations</a></li>
            <li class="nav-item"><a class="nav-link" onclick="loadDonors()"><i class="fa-solid fa-building"></i> Donors</a></li>
            <li class="nav-item"><a class="nav-link" onclick="loadReceivers()"><i class="fa-solid fa-house-heart"></i> Receivers</a></li>
            <li class="nav-item"><a class="nav-link" onclick="loadFarmers()"><i class="fa-solid fa-wheat-awn"></i> Farmers</a></li>
            <li class="nav-item"><a class="nav-link" onclick="loadAllHistory()"><i class="fa-solid fa-clock-rotate-left"></i> Full History Audit Log</a></li>
            <li class="nav-item"><a class="nav-link" onclick="loadReports()"><i class="fa-solid fa-file-invoice"></i> Reports & Analytics</a></li>
        `;
    } else if (role === 'ROLE_DONOR') {
        menu.innerHTML = `
            <li class="nav-item"><a class="nav-link active" onclick="loadDonorDashboard()"><i class="fa-solid fa-gauge"></i> Donor Dashboard</a></li>
            <li class="nav-item"><a class="nav-link" onclick="openAddFoodModal()"><i class="fa-solid fa-plus-circle"></i> Add Food Donation</a></li>
            <li class="nav-item"><a class="nav-link" onclick="loadMyDonations()"><i class="fa-solid fa-utensils"></i> My Donated Food</a></li>
        `;
    } else if (role === 'ROLE_RECEIVER') {
        menu.innerHTML = `
            <li class="nav-item"><a class="nav-link active" onclick="loadAvailableFood()"><i class="fa-solid fa-store"></i> Available Food Listings</a></li>
            <li class="nav-item"><a class="nav-link" onclick="loadMyRequests()"><i class="fa-solid fa-heart-pulse"></i> My Requests</a></li>
            <li class="nav-item"><a class="nav-link" onclick="loadMyAllocations()"><i class="fa-solid fa-box-open"></i> Received / Allocated Food</a></li>
        `;
    } else if (role === 'ROLE_FARMER') {
        menu.innerHTML = `
            <li class="nav-item"><a class="nav-link active" onclick="loadFarmerDashboard()"><i class="fa-solid fa-tractor"></i> Farmer Allocations</a></li>
        `;
    }

    // Attach active state handler
    menu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            menu.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

// Quick Demo Login Helper
async function quickLogin(username, password) {
    document.getElementById('loginUsername').value = username;
    document.getElementById('loginPassword').value = password;
    document.getElementById('loginForm').dispatchEvent(new Event('submit'));
}

async function handleLogin(e) {
    e.preventDefault();
    const u = document.getElementById('loginUsername').value;
    const p = document.getElementById('loginPassword').value;

    try {
        const res = await apiFetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ usernameOrEmail: u, password: p })
        });
        if (res && res.token) {
            authToken = res.token;
            localStorage.setItem('foodrescue_token', authToken);
            currentUser = {
                id: res.userId,
                username: res.username,
                email: res.email,
                fullName: res.fullName,
                role: res.role
            };
            showToast('Welcome back, ' + res.fullName, 'success');
            showAppScreen();
        }
    } catch (err) {
        showToast('Login failed. Please check credentials.', 'danger');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const payload = {
        role: document.getElementById('regRole').value,
        username: document.getElementById('regUsername').value,
        fullName: document.getElementById('regFullName').value,
        email: document.getElementById('regEmail').value,
        phone: document.getElementById('regPhone').value,
        address: document.getElementById('regAddress').value,
        password: document.getElementById('regPassword').value,
        organizationName: document.getElementById('regOrgName').value,
        requiredFoodType: document.getElementById('regFoodType').value,
        farmName: document.getElementById('regFarmName').value,
        farmLocation: document.getElementById('regFarmLocation').value,
        landCapacity: document.getElementById('regLandCapacity').value
    };

    try {
        const res = await apiFetch('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        if (res && res.token) {
            authToken = res.token;
            localStorage.setItem('foodrescue_token', authToken);
            currentUser = {
                id: res.userId,
                username: res.username,
                email: res.email,
                fullName: res.fullName,
                role: res.role
            };
            showToast('Account registered successfully!', 'success');
            showAppScreen();
        }
    } catch (err) {
        showToast('Registration failed: ' + err.message, 'danger');
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('foodrescue_token');
    showAuthScreen();
}

// -------------------------------------------------------------
// VIEWS IMPLEMENTATION
// -------------------------------------------------------------

function setPageTitle(title) {
    document.getElementById('pageTitle').textContent = title;
}

// 1. ADMIN DASHBOARD
async function loadDashboard() {
    if (currentUser.role !== 'ROLE_ADMIN') {
        if (currentUser.role === 'ROLE_DONOR') return loadDonorDashboard();
        if (currentUser.role === 'ROLE_RECEIVER') return loadAvailableFood();
        if (currentUser.role === 'ROLE_FARMER') return loadFarmerDashboard();
    }

    setPageTitle('Admin Executive Dashboard');
    const main = document.getElementById('mainContent');

    main.innerHTML = `<div class="text-center py-5"><div class="spinner-border text-success"></div></div>`;

    const stats = await apiFetch('/api/reports/dashboard-stats');
    if (!stats) return;

    main.innerHTML = `
        <!-- Summary Cards Grid -->
        <div class="row g-3 mb-4">
            <div class="col-md-3">
                <div class="stat-card">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="stat-label">Total Donations</span>
                        <div class="icon-shape bg-success bg-opacity-10 text-success"><i class="fa-solid fa-hand-holding-heart"></i></div>
                    </div>
                    <div class="stat-number">${stats.totalDonations}</div>
                    <div class="small text-muted">${stats.totalQuantityDonatedKg} kg total</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="stat-label">Available Food</span>
                        <div class="icon-shape bg-primary bg-opacity-10 text-primary"><i class="fa-solid fa-store"></i></div>
                    </div>
                    <div class="stat-number">${stats.availableFoodCount}</div>
                    <div class="small text-muted">Ready for allocation</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="stat-label">Distributed Food</span>
                        <div class="icon-shape bg-info bg-opacity-10 text-info"><i class="fa-solid fa-truck-ramp-box"></i></div>
                    </div>
                    <div class="stat-number">${stats.distributedFoodCount}</div>
                    <div class="small text-muted">${stats.totalQuantityDistributedKg} kg distributed</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card border-warning">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="stat-label text-danger">Expired / Farmer Food</span>
                        <div class="icon-shape bg-warning bg-opacity-10 text-warning"><i class="fa-solid fa-triangle-exclamation"></i></div>
                    </div>
                    <div class="stat-number text-warning">${stats.expiredFoodCount + stats.sentToFarmersCount}</div>
                    <div class="small text-muted">${stats.sentToFarmersCount} redirected to farmers</div>
                </div>
            </div>
        </div>

        <div class="row g-3 mb-4">
            <div class="col-md-4">
                <div class="stat-card">
                    <span class="stat-label">Registered Donors</span>
                    <div class="stat-number text-success">${stats.totalDonors}</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stat-card">
                    <span class="stat-label">Registered Receivers</span>
                    <div class="stat-number text-primary">${stats.totalReceivers}</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stat-card">
                    <span class="stat-label">Registered Farmers</span>
                    <div class="stat-number text-warning">${stats.totalFarmers}</div>
                </div>
            </div>
        </div>

        <!-- Analytical Charts Row -->
        <div class="row g-4">
            <div class="col-md-8">
                <div class="card border-0 shadow-sm rounded-4 p-4">
                    <h5 class="fw-bold text-dark mb-3"><i class="fa-solid fa-chart-line text-success me-2"></i>Donated vs Distributed Trends (kg)</h5>
                    <canvas id="donationChart" height="140"></canvas>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card border-0 shadow-sm rounded-4 p-4">
                    <h5 class="fw-bold text-dark mb-3"><i class="fa-solid fa-chart-pie text-primary me-2"></i>Category Breakdown</h5>
                    <canvas id="categoryChart" height="240"></canvas>
                </div>
            </div>
        </div>
    `;

    renderDashboardCharts(stats);
}

function renderDashboardCharts(stats) {
    if (chartInstance1) chartInstance1.destroy();
    if (chartInstance2) chartInstance2.destroy();

    const ctx1 = document.getElementById('donationChart')?.getContext('2d');
    if (ctx1) {
        const labels = Object.keys(stats.monthlyDonationsKg || { 'Aug 2026': 0 });
        const donatedData = Object.values(stats.monthlyDonationsKg || { 'Aug 2026': 0 });
        const distributedData = Object.values(stats.monthlyDistributedKg || { 'Aug 2026': 0 });

        chartInstance1 = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Donated (kg)', data: donatedData, backgroundColor: '#10b981' },
                    { label: 'Distributed / Saved (kg)', data: distributedData, backgroundColor: '#3b82f6' }
                ]
            },
            options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
        });
    }

    const ctx2 = document.getElementById('categoryChart')?.getContext('2d');
    if (ctx2 && stats.categoryBreakdown) {
        chartInstance2 = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: Object.keys(stats.categoryBreakdown),
                datasets: [{
                    data: Object.values(stats.categoryBreakdown),
                    backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b']
                }]
            },
            options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
        });
    }
}

// 2. DONOR DASHBOARD & ADD FOOD
async function loadDonorDashboard() {
    setPageTitle('Donor Portal');
    await loadMyDonations();
}

function openAddFoodModal() {
    const modal = new bootstrap.Modal(document.getElementById('addFoodModal'));
    // set default expiry date to 24 hours from now
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);
    document.getElementById('foodExpiryDate').value = tomorrow.toISOString().slice(0, 16);
    modal.show();
}

async function handleAddFood(e) {
    e.preventDefault();
    const payload = {
        foodName: document.getElementById('foodName').value,
        category: document.getElementById('foodCategory').value,
        quantity: parseFloat(document.getElementById('foodQuantity').value),
        unit: document.getElementById('foodUnit').value,
        expiryDate: document.getElementById('foodExpiryDate').value,
        foodCondition: document.getElementById('foodCondition').value,
        storageCondition: document.getElementById('storageCondition').value,
        pickupLocation: document.getElementById('pickupLocation').value,
        description: document.getElementById('foodDescription').value
    };

    try {
        const res = await apiFetch('/api/foods', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        if (res) {
            showToast('Food donation registered successfully!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('addFoodModal')).hide();
            document.getElementById('addFoodForm').reset();
            loadMyDonations();
        }
    } catch (err) {
        showToast('Error adding food: ' + err.message, 'danger');
    }
}

async function loadMyDonations() {
    setPageTitle('My Donated Food Items');
    const main = document.getElementById('mainContent');

    const foods = await apiFetch('/api/foods/my-donations');
    if (!foods) return;

    main.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold text-dark mb-0"><i class="fa-solid fa-list-check me-2"></i>My Donation Records</h5>
            <button class="btn btn-success fw-bold" onclick="openAddFoodModal()"><i class="fa-solid fa-plus-circle me-1"></i>Donate Food</button>
        </div>
        ${renderFoodTableHtml(foods, false)}
    `;
}

// 3. EXPIRED FOOD MANAGEMENT (CRITICAL FEATURE REQUIREMENT #9, 10, 12)
async function loadExpiredFood() {
    setPageTitle('Expired Food Management (Non-Human Redistribution)');
    const main = document.getElementById('mainContent');

    const expiredFoods = await apiFetch('/api/foods/expired');
    if (!expiredFoods) return;

    main.innerHTML = `
        <!-- Mandatory Food Safety Rule Notice (Requirement #12) -->
        <div class="safety-banner">
            <div class="d-flex align-items-center gap-3">
                <i class="fa-solid fa-shield-virus fa-2x text-warning"></i>
                <div>
                    <h5><i class="fa-solid fa-triangle-exclamation me-1"></i> Food Safety Compliance Notice</h5>
                    <p class="mb-0 fw-semibold">
                        Expired food must not be distributed to people. It can only be redirected through an approved non-human-use workflow, subject to applicable local food-safety and agricultural rules.
                    </p>
                </div>
            </div>
        </div>

        <div class="card border-0 shadow-sm rounded-4 p-3 mb-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold text-danger mb-0"><i class="fa-solid fa-clock me-2"></i>Expired Food Items Requiring Action (${expiredFoods.length})</h5>
            </div>
            
            ${expiredFoods.length === 0 ? `
                <div class="text-center py-5 text-muted">
                    <i class="fa-solid fa-circle-check fa-3x text-success mb-2"></i>
                    <p>No expired food items currently waiting for assignment.</p>
                </div>
            ` : `
                <div class="table-responsive">
                    <table class="table table-hover table-custom align-middle">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Food Name</th>
                                <th>Category</th>
                                <th>Quantity</th>
                                <th>Donor</th>
                                <th>Expiry Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${expiredFoods.map(f => `
                                <tr>
                                    <td class="fw-bold text-success">${f.foodCode}</td>
                                    <td class="fw-bold">${f.foodName}</td>
                                    <td><span class="badge bg-light text-dark">${f.category}</span></td>
                                    <td>${f.quantity} ${f.unit}</td>
                                    <td>${f.donorName || 'N/A'}</td>
                                    <td class="text-danger fw-semibold">${formatDate(f.expiryDate)}</td>
                                    <td><span class="badge badge-expired">EXPIRED</span></td>
                                    <td>
                                        <button class="btn btn-warning btn-sm fw-bold text-dark" onclick="openSendToFarmerModal(${f.id}, '${escapeQuote(f.foodName)}', '${escapeQuote(f.pickupLocation)}')">
                                            <i class="fa-solid fa-tractor me-1"></i>Send to Farmer
                                        </button>
                                        <button class="btn btn-outline-secondary btn-sm ms-1" onclick="viewFoodHistory(${f.id})">
                                            <i class="fa-solid fa-history"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `}
        </div>
    `;
}

// Open modal to assign expired food to farmer
async function openSendToFarmerModal(foodId, foodName, pickupLoc) {
    document.getElementById('farmerFoodId').value = foodId;
    document.getElementById('farmerFoodName').value = foodName;
    document.getElementById('farmerPickupLocation').value = pickupLoc || '';

    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);
    document.getElementById('farmerPickupDate').value = tomorrow.toISOString().slice(0, 16);

    const farmers = await apiFetch('/api/users/farmers');
    const select = document.getElementById('farmerSelect');
    select.innerHTML = '<option value="">-- Select Farmer --</option>';

    if (farmers && farmers.length > 0) {
        farmers.forEach(f => {
            select.innerHTML += `<option value="${f.user.id}">${f.user.fullName} (${f.farmName || 'Farm'}) - ${f.landCapacity || 'Capacity'}</option>`;
        });
    }

    const modal = new bootstrap.Modal(document.getElementById('sendToFarmerModal'));
    modal.show();
}

async function handleSendToFarmerSubmit(e) {
    e.preventDefault();
    const payload = {
        foodItemId: parseInt(document.getElementById('farmerFoodId').value),
        farmerUserId: parseInt(document.getElementById('farmerSelect').value),
        pickupLocation: document.getElementById('farmerPickupLocation').value,
        pickupDate: document.getElementById('farmerPickupDate').value,
        notes: document.getElementById('farmerNotes').value
    };

    try {
        const res = await apiFetch('/api/farmer-allocations', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        if (res) {
            showToast('Expired food successfully assigned to Farmer for non-human workflow!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('sendToFarmerModal')).hide();
            loadExpiredFood();
        }
    } catch (err) {
        showToast('Error assigning to farmer: ' + err.message, 'danger');
    }
}

// 4. FARMER PORTAL & ALLOCATIONS
async function loadFarmerDashboard() {
    setPageTitle('Farmer Non-Human Food Allocation Portal');
    const main = document.getElementById('mainContent');

    const allocations = await apiFetch('/api/farmer-allocations/my-allocations');
    if (!allocations) return;

    main.innerHTML = `
        <div class="safety-banner">
            <h6 class="fw-bold mb-1"><i class="fa-solid fa-wheat-awn me-2"></i>Approved Non-Human Use Workflow</h6>
            <p class="mb-0 small">Allocated expired food items are strictly intended for agricultural composting, livestock feed (where permitted), or bio-recycling purposes.</p>
        </div>

        <div class="card border-0 shadow-sm rounded-4 p-3 mb-4">
            <h5 class="fw-bold text-dark mb-3"><i class="fa-solid fa-tractor text-success me-2"></i>Assigned Expired Food Allocations (${allocations.length})</h5>
            
            ${allocations.length === 0 ? `
                <div class="text-center py-5 text-muted">
                    <i class="fa-solid fa-box-open fa-3x mb-2"></i>
                    <p>No food allocations currently assigned to your farm.</p>
                </div>
            ` : `
                <div class="table-responsive">
                    <table class="table table-hover table-custom align-middle">
                        <thead>
                            <tr>
                                <th>Food Code</th>
                                <th>Food Name</th>
                                <th>Category</th>
                                <th>Quantity</th>
                                <th>Pickup Location</th>
                                <th>Pickup Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${allocations.map(a => `
                                <tr>
                                    <td class="fw-bold text-success">${a.foodCode}</td>
                                    <td class="fw-bold">${a.foodName}</td>
                                    <td><span class="badge bg-light text-dark">${a.category}</span></td>
                                    <td>${a.quantity} ${a.unit}</td>
                                    <td>${a.pickupLocation}</td>
                                    <td>${formatDate(a.pickupDate)}</td>
                                    <td>${renderFarmerStatusBadge(a.status)}</td>
                                    <td>
                                        ${a.status === 'PENDING' ? `
                                            <button class="btn btn-success btn-sm fw-bold me-1" onclick="respondFarmerAllocation(${a.id}, 'ACCEPTED')"><i class="fa-solid fa-check me-1"></i>Accept</button>
                                            <button class="btn btn-outline-danger btn-sm" onclick="respondFarmerAllocation(${a.id}, 'REJECTED')"><i class="fa-solid fa-xmark me-1"></i>Decline</button>
                                        ` : a.status === 'ACCEPTED' ? `
                                            <button class="btn btn-primary btn-sm fw-bold" onclick="completeFarmerAllocation(${a.id})"><i class="fa-solid fa-circle-check me-1"></i>Mark Collected</button>
                                        ` : `
                                            <span class="text-muted small">No action needed</span>
                                        `}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `}
        </div>
    `;
}

async function respondFarmerAllocation(id, status) {
    try {
        const res = await apiFetch(`/api/farmer-allocations/${id}/respond?status=${status}`, { method: 'PUT' });
        if (res) {
            showToast(`Allocation ${status.toLowerCase()} successfully!`, 'success');
            loadFarmerDashboard();
        }
    } catch (err) {
        showToast('Action failed: ' + err.message, 'danger');
    }
}

async function completeFarmerAllocation(id) {
    try {
        const res = await apiFetch(`/api/farmer-allocations/${id}/complete`, { method: 'PUT' });
        if (res) {
            showToast('Allocation marked COMPLETED!', 'success');
            loadFarmerDashboard();
        }
    } catch (err) {
        showToast('Action failed: ' + err.message, 'danger');
    }
}

// 5. RECEIVER PORTAL & AVAILABLE FOOD LISTINGS
async function loadAvailableFood() {
    setPageTitle('Available Food Donations for Rescue');
    const main = document.getElementById('mainContent');

    const foods = await apiFetch('/api/foods/available');
    if (!foods) return;

    main.innerHTML = `
        <div class="card border-0 shadow-sm rounded-4 p-3 mb-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold text-dark mb-0"><i class="fa-solid fa-utensils text-success me-2"></i>Available Surplus Food Listings (${foods.length})</h5>
            </div>
            
            ${foods.length === 0 ? `
                <div class="text-center py-5 text-muted">
                    <i class="fa-solid fa-bowl-food fa-3x mb-2"></i>
                    <p>No available food items at this moment. Please check back soon!</p>
                </div>
            ` : `
                <div class="row g-3">
                    ${foods.map(f => `
                        <div class="col-md-6 col-lg-4">
                            <div class="card h-100 border-0 shadow-sm rounded-4">
                                <div class="card-body d-flex flex-column">
                                    <div class="d-flex justify-content-between align-items-start mb-2">
                                        <span class="badge bg-success bg-opacity-10 text-success fw-bold">${f.foodCode}</span>
                                        <span class="badge badge-available">${f.category}</span>
                                    </div>
                                    <h5 class="card-title fw-bold text-dark">${f.foodName}</h5>
                                    <p class="text-muted small mb-2">${f.description || 'No detailed description provided.'}</p>
                                    
                                    <div class="mt-auto pt-2 border-top">
                                        <div class="d-flex justify-content-between small text-muted mb-1">
                                            <span><i class="fa-solid fa-weight-hanging me-1"></i>Quantity:</span>
                                            <strong class="text-dark">${f.quantity} ${f.unit}</strong>
                                        </div>
                                        <div class="d-flex justify-content-between small text-muted mb-1">
                                            <span><i class="fa-solid fa-clock me-1"></i>Expires:</span>
                                            <strong class="text-danger">${formatDate(f.expiryDate)}</strong>
                                        </div>
                                        <div class="d-flex justify-content-between small text-muted mb-3">
                                            <span><i class="fa-solid fa-location-dot me-1"></i>Location:</span>
                                            <strong class="text-dark text-truncate" style="max-width: 140px;">${f.pickupLocation}</strong>
                                        </div>
                                        <button class="btn btn-success w-100 fw-bold" onclick="requestFoodItem(${f.id}, '${escapeQuote(f.foodName)}', ${f.quantity})">
                                            <i class="fa-solid fa-hand-holding-heart me-1"></i>Request Food
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `;
}

async function requestFoodItem(foodId, foodName, maxQty) {
    const qty = prompt(`Enter quantity to request for "${foodName}" (Max: ${maxQty}):`, maxQty);
    if (!qty || isNaN(qty) || parseFloat(qty) <= 0) return;

    if (parseFloat(qty) > maxQty) {
        alert(`Requested quantity cannot exceed ${maxQty}`);
        return;
    }

    try {
        const res = await apiFetch('/api/food-requests', {
            method: 'POST',
            body: JSON.stringify({
                foodItemId: foodId,
                requestedQuantity: parseFloat(qty),
                notes: 'Requested via Receiver portal'
            })
        });
        if (res) {
            showToast('Food request submitted successfully to Admin!', 'success');
            loadAvailableFood();
        }
    } catch (err) {
        showToast('Request failed: ' + err.message, 'danger');
    }
}

// 6. ALL FOOD RECORDS & HISTORY AUDIT TRAIL
async function loadFoodRecords() {
    setPageTitle('All System Food Records');
    const main = document.getElementById('mainContent');

    const foods = await apiFetch('/api/foods');
    if (!foods) return;

    main.innerHTML = `
        <div class="card border-0 shadow-sm rounded-4 p-3 mb-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold text-dark mb-0"><i class="fa-solid fa-boxes-stacked text-success me-2"></i>Complete Food Inventory (${foods.length})</h5>
            </div>
            ${renderFoodTableHtml(foods, true)}
        </div>
    `;
}

function renderFoodTableHtml(foods, isAdmin = false) {
    if (!foods || foods.length === 0) {
        return `<div class="text-center py-4 text-muted">No food records found.</div>`;
    }

    return `
        <div class="table-responsive">
            <table class="table table-hover table-custom align-middle">
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Food Name</th>
                        <th>Category</th>
                        <th>Quantity</th>
                        <th>Donor</th>
                        <th>Expiry Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${foods.map(f => `
                        <tr>
                            <td class="fw-bold text-success">${f.foodCode}</td>
                            <td class="fw-bold">${f.foodName}</td>
                            <td><span class="badge bg-light text-dark">${f.category}</span></td>
                            <td>${f.quantity} ${f.unit}</td>
                            <td>${f.donorName || 'N/A'}</td>
                            <td>${formatDate(f.expiryDate)}</td>
                            <td>${renderStatusBadge(f.status)}</td>
                            <td>
                                <button class="btn btn-outline-dark btn-sm fw-semibold" onclick="viewFoodHistory(${f.id})">
                                    <i class="fa-solid fa-clock-rotate-left me-1"></i>History
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// View History Audit Trail Modal (Requirement #15)
async function viewFoodHistory(foodId) {
    const historyList = await apiFetch(`/api/food-history/${foodId}`);
    const modalContent = document.getElementById('historyModalContent');

    if (!historyList || historyList.length === 0) {
        modalContent.innerHTML = `<p class="text-muted text-center py-3">No history logs recorded for this item.</p>`;
    } else {
        const itemInfo = historyList[0];
        modalContent.innerHTML = `
            <div class="mb-3 border-bottom pb-2">
                <h6 class="fw-bold text-success mb-1">${itemInfo.foodCode} - ${itemInfo.foodName}</h6>
                <div class="small text-muted">Immutable System Audit Trail</div>
            </div>
            <div class="timeline">
                ${historyList.map(h => `
                    <div class="timeline-item ${h.newStatus === 'EXPIRED' ? 'expired' : h.newStatus === 'SENT_TO_FARMER' ? 'farmer' : ''}">
                        <div class="d-flex justify-content-between align-items-center">
                            <strong class="text-dark">${h.action.replace(/_/g, ' ')}</strong>
                            <span class="badge bg-light text-muted">${formatDate(h.timestamp)}</span>
                        </div>
                        <div class="small text-muted mt-1">
                            Transition: <span class="badge badge-available">${h.previousStatus || 'NEW'}</span> &rarr; <span class="badge badge-allocated">${h.newStatus}</span>
                        </div>
                        <div class="small mt-1"><strong>By:</strong> ${h.performedBy || 'System'}</div>
                        ${h.remarks ? `<div class="small text-secondary fst-italic mt-1">${h.remarks}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    const modal = new bootstrap.Modal(document.getElementById('historyModal'));
    modal.show();
}

// 7. FOOD REQUESTS MANAGEMENT (ADMIN)
async function loadFoodRequests() {
    setPageTitle('Food Requests Management');
    const main = document.getElementById('mainContent');

    const requests = await apiFetch('/api/food-requests');
    if (!requests) return;

    main.innerHTML = `
        <div class="card border-0 shadow-sm rounded-4 p-3 mb-4">
            <h5 class="fw-bold text-dark mb-3"><i class="fa-solid fa-hand-holding-heart text-success me-2"></i>Receiver Food Requests (${requests.length})</h5>
            
            <div class="table-responsive">
                <table class="table table-hover table-custom align-middle">
                    <thead>
                        <tr>
                            <th>Food Code</th>
                            <th>Food Name</th>
                            <th>Receiver</th>
                            <th>Requested Qty</th>
                            <th>Available Qty</th>
                            <th>Request Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${requests.map(r => `
                            <tr>
                                <td class="fw-bold text-success">${r.foodCode}</td>
                                <td class="fw-bold">${r.foodName}</td>
                                <td>${r.receiverName} (${r.receiverOrganization || 'N/A'})</td>
                                <td>${r.requestedQuantity} ${r.unit}</td>
                                <td>${r.totalAvailableQuantity} ${r.unit}</td>
                                <td>${formatDate(r.requestDate)}</td>
                                <td><span class="badge bg-info text-dark">${r.status}</span></td>
                                <td>
                                    ${r.status === 'PENDING' ? `
                                        <button class="btn btn-success btn-sm fw-bold me-1" onclick="approveRequest(${r.id})"><i class="fa-solid fa-check me-1"></i>Approve</button>
                                        <button class="btn btn-outline-danger btn-sm" onclick="rejectRequest(${r.id})"><i class="fa-solid fa-xmark me-1"></i>Reject</button>
                                    ` : `
                                        <span class="text-muted small">Processed</span>
                                    `}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

async function approveRequest(id) {
    try {
        const res = await apiFetch(`/api/food-requests/${id}/approve`, { method: 'PUT' });
        if (res) {
            showToast('Request approved successfully!', 'success');
            loadFoodRequests();
        }
    } catch (err) {
        showToast('Approval failed: ' + err.message, 'danger');
    }
}

async function rejectRequest(id) {
    try {
        const res = await apiFetch(`/api/food-requests/${id}/reject`, { method: 'PUT' });
        if (res) {
            showToast('Request rejected.', 'warning');
            loadFoodRequests();
        }
    } catch (err) {
        showToast('Rejection failed: ' + err.message, 'danger');
    }
}

// 8. FARMER ALLOCATIONS MANAGEMENT (ADMIN)
async function loadFarmerAllocations() {
    setPageTitle('Farmer Expired-Food Allocations (Non-Human Workflow)');
    const main = document.getElementById('mainContent');

    const allocations = await apiFetch('/api/farmer-allocations');
    if (!allocations) return;

    main.innerHTML = `
        <div class="card border-0 shadow-sm rounded-4 p-3 mb-4">
            <h5 class="fw-bold text-dark mb-3"><i class="fa-solid fa-tractor text-warning me-2"></i>All Farmer Expired-Food Allocations (${allocations.length})</h5>
            
            <div class="table-responsive">
                <table class="table table-hover table-custom align-middle">
                    <thead>
                        <tr>
                            <th>Food Code</th>
                            <th>Food Name</th>
                            <th>Farmer</th>
                            <th>Quantity</th>
                            <th>Pickup Location</th>
                            <th>Status</th>
                            <th>Allocated At</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${allocations.map(a => `
                            <tr>
                                <td class="fw-bold text-success">${a.foodCode}</td>
                                <td class="fw-bold">${a.foodName}</td>
                                <td>${a.farmerName} (${a.farmName || 'Farm'})</td>
                                <td>${a.quantity} ${a.unit}</td>
                                <td>${a.pickupLocation}</td>
                                <td>${renderFarmerStatusBadge(a.status)}</td>
                                <td>${formatDate(a.allocatedAt)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// 9. DONORS / RECEIVERS / FARMERS LIST
async function loadDonors() {
    setPageTitle('Registered Donors');
    const list = await apiFetch('/api/users/donors');
    renderUserList('Donors', list, ['Organization', 'Full Name', 'Email', 'Phone', 'Address']);
}

async function loadReceivers() {
    setPageTitle('Registered Receivers');
    const list = await apiFetch('/api/users/receivers');
    renderUserList('Receivers', list, ['Institution / Shelter', 'Required Food', 'Full Name', 'Email', 'Phone']);
}

async function loadFarmers() {
    setPageTitle('Registered Farmers');
    const list = await apiFetch('/api/users/farmers');
    renderUserList('Farmers', list, ['Farm Name', 'Location', 'Capacity', 'Full Name', 'Phone']);
}

function renderUserList(title, list, headers) {
    const main = document.getElementById('mainContent');
    if (!list) return;

    main.innerHTML = `
        <div class="card border-0 shadow-sm rounded-4 p-3 mb-4">
            <h5 class="fw-bold text-dark mb-3"><i class="fa-solid fa-users text-success me-2"></i>Registered ${title} (${list.length})</h5>
            <div class="table-responsive">
                <table class="table table-hover table-custom align-middle">
                    <thead>
                        <tr>
                            ${headers.map(h => `<th>${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${list.map(item => {
                            const u = item.user || {};
                            return `
                                <tr>
                                    <td class="fw-bold">${item.organizationName || item.farmName || u.fullName}</td>
                                    <td>${item.requiredFoodType || item.farmLocation || u.fullName}</td>
                                    <td>${item.landCapacity || u.email}</td>
                                    <td>${u.phone || 'N/A'}</td>
                                    <td>${u.address || 'N/A'}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// 10. REPORTS & ANALYTICS VIEW
async function loadReports() {
    setPageTitle('System Impact Reports & Analytics');
    const main = document.getElementById('mainContent');

    const report = await apiFetch('/api/reports/monthly');
    if (!report) return;

    main.innerHTML = `
        <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 class="fw-bold text-dark mb-1">Monthly Waste Reduction & Rescue Report</h4>
                    <span class="badge bg-success">${report.reportPeriod}</span>
                </div>
                <a href="/api/reports/csv" class="btn btn-outline-success fw-bold" target="_blank">
                    <i class="fa-solid fa-file-csv me-1"></i> Export Report (CSV)
                </a>
            </div>

            <div class="row g-3 mb-4">
                <div class="col-md-3">
                    <div class="stat-card">
                        <span class="stat-label">Total Donated</span>
                        <div class="stat-number text-success">${report.totalDonatedKg} kg</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card">
                        <span class="stat-label">Total Distributed</span>
                        <div class="stat-number text-primary">${report.totalDistributedKg} kg</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card">
                        <span class="stat-label">Sent to Farmers</span>
                        <div class="stat-number text-warning">${report.totalSentToFarmersKg} kg</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card bg-success text-white">
                        <span class="stat-label text-white-50">Waste Reduction %</span>
                        <div class="stat-number text-white">${report.wasteReductionPercentage}%</div>
                        <div class="small">${report.totalSavedKg} kg food saved from land fill</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 11. AUDIT HISTORY ALL
async function loadAllHistory() {
    setPageTitle('Full System Audit History');
    const main = document.getElementById('mainContent');

    const history = await apiFetch('/api/food-history/all');
    if (!history) return;

    main.innerHTML = `
        <div class="card border-0 shadow-sm rounded-4 p-3 mb-4">
            <h5 class="fw-bold text-dark mb-3"><i class="fa-solid fa-clock-rotate-left text-success me-2"></i>Full System Audit Trail (${history.length})</h5>
            <div class="table-responsive">
                <table class="table table-hover table-custom align-middle">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Food Name</th>
                            <th>Action</th>
                            <th>Previous Status</th>
                            <th>New Status</th>
                            <th>Performed By</th>
                            <th>Timestamp</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${history.map(h => `
                            <tr>
                                <td class="fw-bold text-success">${h.foodCode}</td>
                                <td>${h.foodName}</td>
                                <td><span class="badge bg-secondary">${h.action}</span></td>
                                <td><span class="badge badge-available">${h.previousStatus || 'NONE'}</span></td>
                                <td><span class="badge badge-allocated">${h.newStatus}</span></td>
                                <td>${h.performedBy || 'System'}</td>
                                <td>${formatDate(h.timestamp)}</td>
                                <td class="small text-muted">${h.remarks || ''}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// 12. NOTIFICATIONS LOAD
async function loadNotifications() {
    const list = await apiFetch('/api/notifications');
    const notifContainer = document.getElementById('notifList');
    const badge = document.getElementById('notifBadgeCount');

    if (list && list.length > 0) {
        const unreadCount = list.filter(n => !n.isRead).length;
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.classList.remove('d-none');
        } else {
            badge.classList.add('d-none');
        }

        notifContainer.innerHTML = `<li class="dropdown-header fw-bold border-bottom pb-2">Notifications (${list.length})</li>`;
        list.slice(0, 5).forEach(n => {
            notifContainer.innerHTML += `
                <li class="p-2 border-bottom ${n.isRead ? '' : 'bg-light'}">
                    <div class="fw-bold small text-dark">${n.title}</div>
                    <div class="small text-muted text-wrap">${n.message}</div>
                    <div class="text-end extra-small text-muted" style="font-size:0.75rem;">${formatDate(n.createdAt)}</div>
                </li>
            `;
        });
    }
}

// UTILITY HELPERS
function formatDate(dtStr) {
    if (!dtStr) return 'N/A';
    const d = new Date(dtStr);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function renderStatusBadge(status) {
    switch (status) {
        case 'AVAILABLE': return '<span class="badge badge-available">AVAILABLE</span>';
        case 'REQUESTED': return '<span class="badge badge-requested">REQUESTED</span>';
        case 'ALLOCATED': return '<span class="badge badge-allocated">ALLOCATED</span>';
        case 'DISTRIBUTED': return '<span class="badge badge-distributed">DISTRIBUTED</span>';
        case 'EXPIRED': return '<span class="badge badge-expired">EXPIRED</span>';
        case 'SENT_TO_FARMER': return '<span class="badge badge-farmer">SENT TO FARMER</span>';
        case 'COMPLETED': return '<span class="badge badge-completed">COMPLETED</span>';
        default: return `<span class="badge bg-secondary">${status}</span>`;
    }
}

function renderFarmerStatusBadge(status) {
    switch (status) {
        case 'PENDING': return '<span class="badge bg-warning text-dark">PENDING</span>';
        case 'ACCEPTED': return '<span class="badge bg-success">ACCEPTED</span>';
        case 'REJECTED': return '<span class="badge bg-danger">DECLINED</span>';
        case 'COMPLETED': return '<span class="badge bg-dark">COLLECTED</span>';
        default: return `<span class="badge bg-secondary">${status}</span>`;
    }
}

function escapeQuote(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'");
}

function showToast(msg, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const id = 'toast_' + Date.now();
    const toastHtml = `
        <div id="${id}" class="toast align-items-center text-white bg-${type} border-0 show shadow" role="alert">
            <div class="d-flex">
                <div class="toast-body fw-semibold">${msg}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    setTimeout(() => {
        const elem = document.getElementById(id);
        if (elem) elem.remove();
    }, 4000);
}
