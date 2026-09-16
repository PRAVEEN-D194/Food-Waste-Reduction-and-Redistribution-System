// FoodRescue Application Logic & SPA Routing
let currentUser = null;
let authToken = localStorage.getItem('foodrescue_token');
let chartInstance1 = null;
let chartInstance2 = null;
let notifPollInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    initApp();

    // Attach form listeners
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
    document.getElementById('addFoodForm')?.addEventListener('submit', handleAddFood);
    document.getElementById('sendToFarmerForm')?.addEventListener('submit', handleSendToFarmerSubmit);
    document.getElementById('farmerRequestForm')?.addEventListener('submit', handleFarmerRequestSubmit);
    document.getElementById('allocateReceiverForm')?.addEventListener('submit', handleAllocateReceiverSubmit);
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
            if (authToken && url === '/api/auth/me') {
                showToast('Session expired. Please log in again.', 'warning');
                logout();
                return null;
            }
        }
        if (!res.ok) {
            const errData = await res.json().catch(() => ({ message: 'Server error (' + res.status + ')' }));
            const err = new Error(errData.message || `Error ${res.status}`);
            err.status = res.status;
            err.data = errData;
            throw err;
        }
        if (res.headers.get('content-type')?.includes('application/json')) {
            return await res.json();
        }
        return await res.text();
    } catch (err) {
        if (!options.silent) {
            showToast(err.message, 'danger');
        }
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
        const user = await apiFetch('/api/auth/me', { silent: true });
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
    if (notifPollInterval) clearInterval(notifPollInterval);
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

    if (notifPollInterval) clearInterval(notifPollInterval);
    notifPollInterval = setInterval(loadNotifications, 15000);

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
            <li class="nav-item"><a class="nav-link" onclick="loadFoodRecords()"><i class="fa-solid fa-boxes-stacked"></i> All Food Tracking</a></li>
            <li class="nav-item"><a class="nav-link text-warning fw-bold" onclick="loadExpiredFood()"><i class="fa-solid fa-triangle-exclamation"></i> Expired Food Management</a></li>
            <li class="nav-item"><a class="nav-link" onclick="loadFoodRequests()"><i class="fa-solid fa-hand-holding-heart"></i> Receiver Food Requests</a></li>
            <li class="nav-item"><a class="nav-link" onclick="loadAdminFarmerRequests()"><i class="fa-solid fa-tractor"></i> Farmer Food Requests</a></li>
            <li class="nav-item"><a class="nav-link" onclick="loadDonors()"><i class="fa-solid fa-building"></i> Registered Donors</a></li>
            <li class="nav-item"><a class="nav-link" onclick="loadReceivers()"><i class="fa-solid fa-house-heart"></i> Registered Receivers</a></li>
            <li class="nav-item"><a class="nav-link" onclick="loadFarmers()"><i class="fa-solid fa-wheat-awn"></i> Registered Farmers</a></li>
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
            <li class="nav-item"><a class="nav-link" onclick="loadMyRequests()"><i class="fa-solid fa-heart-pulse"></i> My Food Requests</a></li>
            <li class="nav-item"><a class="nav-link" onclick="loadMyAllocations()"><i class="fa-solid fa-box-open"></i> Allocated & Received Food</a></li>
        `;
    } else if (role === 'ROLE_FARMER') {
        menu.innerHTML = `
            <li class="nav-item"><a class="nav-link active" onclick="loadFarmerDashboard()"><i class="fa-solid fa-gauge"></i> Farmer Dashboard</a></li>
            <li class="nav-item"><a class="nav-link text-warning fw-bold" onclick="loadFarmerExpiredFoods()"><i class="fa-solid fa-triangle-exclamation"></i> Expired Foods Available</a></li>
            <li class="nav-item"><a class="nav-link" onclick="loadMyFarmerRequests()"><i class="fa-solid fa-tractor"></i> My Food Requests</a></li>
        `;
    }

    // Attach active state handler
    menu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
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
    if (notifPollInterval) clearInterval(notifPollInterval);
    showAuthScreen();
}

function setPageTitle(title) {
    document.getElementById('pageTitle').textContent = title;
}

// -------------------------------------------------------------
// 1. ADMIN DASHBOARD
// -------------------------------------------------------------
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

// -------------------------------------------------------------
// 2. DONOR PORTAL & ADD / REMOVE FOOD (Features #8, #9, #10, #11)
// -------------------------------------------------------------
async function loadDonorDashboard() {
    setPageTitle('Donor Portal');
    await loadMyDonations();
}

function openAddFoodModal() {
    const modal = new bootstrap.Modal(document.getElementById('addFoodModal'));
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
            showToast('Food donation registered successfully (Status: AVAILABLE)!', 'success');
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
            <div>
                <h5 class="fw-bold text-dark mb-1"><i class="fa-solid fa-list-check me-2 text-success"></i>My Donation Records (${foods.length})</h5>
                <p class="text-muted small mb-0">Manage your active donations. Food can be removed only while still AVAILABLE and before any receiver requests it.</p>
            </div>
            <button class="btn btn-success fw-bold" onclick="openAddFoodModal()"><i class="fa-solid fa-plus-circle me-1"></i>Donate Food</button>
        </div>

        ${foods.length === 0 ? `
            <div class="card border-0 shadow-sm rounded-4 p-5 text-center text-muted">
                <i class="fa-solid fa-bowl-food fa-3x mb-3 text-success opacity-50"></i>
                <h5>No food donations yet</h5>
                <p class="mb-3">Start by registering your first surplus food donation!</p>
                <div>
                    <button class="btn btn-success fw-bold" onclick="openAddFoodModal()"><i class="fa-solid fa-plus-circle me-1"></i>Donate Food</button>
                </div>
            </div>
        ` : `
            <div class="card border-0 shadow-sm rounded-4 p-3 mb-4">
                <div class="table-responsive">
                    <table class="table table-hover table-custom align-middle">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Food Name</th>
                                <th>Category</th>
                                <th>Quantity</th>
                                <th>Remaining</th>
                                <th>Expiry Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${foods.map(f => {
                                const isAvailable = (f.status === 'AVAILABLE');
                                const hasRequests = (f.hasReceiverRequests === true);
                                const canRemove = isAvailable && !hasRequests;

                                return `
                                    <tr>
                                        <td class="fw-bold text-success">${f.foodCode}</td>
                                        <td class="fw-bold">${f.foodName}</td>
                                        <td><span class="badge bg-light text-dark">${f.category}</span></td>
                                        <td>${f.quantity} ${f.unit}</td>
                                        <td class="fw-bold text-primary">${f.remainingQuantity != null ? f.remainingQuantity : f.quantity} ${f.unit}</td>
                                        <td>${formatDate(f.expiryDate)}</td>
                                        <td>${renderStatusBadge(f.status)}</td>
                                        <td>
                                            <div class="d-flex align-items-center gap-1">
                                                <button class="btn btn-outline-dark btn-sm fw-semibold" onclick="viewFoodHistory(${f.id})" title="View Audit Trail">
                                                    <i class="fa-solid fa-clock-rotate-left"></i>
                                                </button>

                                                ${canRemove ? `
                                                    <button class="btn btn-outline-danger btn-sm fw-semibold" onclick="openRemoveFoodModal(${f.id}, '${escapeQuote(f.foodName)}')" title="Remove Food Donation">
                                                        <i class="fa-solid fa-trash me-1"></i>Remove Food
                                                    </button>
                                                ` : f.status === 'REMOVED' ? `
                                                    <span class="badge bg-secondary">Removed</span>
                                                ` : `
                                                    <span class="d-inline-block" tabindex="0" data-bs-toggle="tooltip" title="This food cannot be removed because a receiver has already requested it.">
                                                        <button class="btn btn-outline-secondary btn-sm" disabled style="pointer-events: none;">
                                                            <i class="fa-solid fa-lock me-1"></i>Locked
                                                        </button>
                                                    </span>
                                                `}
                                            </div>
                                            ${!canRemove && f.status !== 'REMOVED' && isAvailable && hasRequests ? `
                                                <div class="extra-small text-danger mt-1" style="font-size:0.75rem;">
                                                    <i class="fa-solid fa-info-circle me-1"></i>Receiver request exists
                                                </div>
                                            ` : ''}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `}
    `;
}

// Open Remove Food Confirmation Modal (Feature #8, #9, #21)
function openRemoveFoodModal(foodId, foodName) {
    document.getElementById('removeFoodId').value = foodId;
    document.getElementById('removeFoodNameText').textContent = `Are you sure you want to remove "${foodName}"? This food will be removed from your active donations.`;
    const modal = new bootstrap.Modal(document.getElementById('removeFoodModal'));
    modal.show();
}

async function confirmRemoveFoodAction() {
    const foodId = document.getElementById('removeFoodId').value;
    try {
        const res = await apiFetch(`/api/foods/${foodId}`, {
            method: 'DELETE'
        });
        if (res) {
            showToast('Food donation removed successfully.', 'success');
            bootstrap.Modal.getInstance(document.getElementById('removeFoodModal')).hide();
            loadMyDonations();
        }
    } catch (err) {
        if (err.status === 409) {
            showToast('Food cannot be removed because a receiver request already exists.', 'danger');
        } else {
            showToast('Failed to remove food: ' + err.message, 'danger');
        }
        bootstrap.Modal.getInstance(document.getElementById('removeFoodModal')).hide();
    }
}

// -------------------------------------------------------------
// 3. FARMER DASHBOARD & EXPIRED FOOD REDISTRIBUTION (Features #1, #2, #4, #18, #19)
// -------------------------------------------------------------
async function loadFarmerDashboard() {
    setPageTitle('Farmer Dashboard - Agricultural & Composting Redistribution');
    const main = document.getElementById('mainContent');
    main.innerHTML = `<div class="text-center py-5"><div class="spinner-border text-warning"></div></div>`;

    const stats = await apiFetch('/api/farmer/dashboard-stats');
    if (!stats) return;

    main.innerHTML = `
        <!-- Mandatory Safety Disclaimer Notice (Feature #18) -->
        <div class="safety-banner">
            <div class="d-flex align-items-center gap-3">
                <i class="fa-solid fa-shield-virus fa-2x text-warning"></i>
                <div>
                    <h5 class="mb-1"><i class="fa-solid fa-triangle-exclamation me-1"></i> Agricultural & Non-Human Redistribution Compliance</h5>
                    <p class="mb-0 fw-semibold">
                        Expired food is not available for human consumption. Any agricultural, composting, animal-feed, or other non-human use must follow applicable local safety and regulatory requirements.
                    </p>
                </div>
            </div>
        </div>

        <!-- 5 Dashboard Cards (Feature #1) -->
        <div class="row g-3 mb-4">
            <div class="col-md-4 col-lg">
                <div class="stat-card border-danger cursor-pointer" onclick="loadFarmerExpiredFoods()">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="stat-label text-danger">Expired Foods Available</span>
                        <div class="icon-shape bg-danger bg-opacity-10 text-danger"><i class="fa-solid fa-triangle-exclamation"></i></div>
                    </div>
                    <div class="stat-number text-danger">${stats.expiredFoodsAvailable}</div>
                    <div class="small text-muted">Ready to request</div>
                </div>
            </div>
            <div class="col-md-4 col-lg">
                <div class="stat-card cursor-pointer" onclick="loadMyFarmerRequests()">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="stat-label">My Food Requests</span>
                        <div class="icon-shape bg-primary bg-opacity-10 text-primary"><i class="fa-solid fa-file-lines"></i></div>
                    </div>
                    <div class="stat-number text-primary">${stats.myFoodRequests}</div>
                    <div class="small text-muted">Submitted requests</div>
                </div>
            </div>
            <div class="col-md-4 col-lg">
                <div class="stat-card border-success cursor-pointer" onclick="loadMyFarmerRequests()">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="stat-label text-success">Approved Requests</span>
                        <div class="icon-shape bg-success bg-opacity-10 text-success"><i class="fa-solid fa-circle-check"></i></div>
                    </div>
                    <div class="stat-number text-success">${stats.approvedRequests}</div>
                    <div class="small text-muted">Approved by admin</div>
                </div>
            </div>
            <div class="col-md-6 col-lg">
                <div class="stat-card border-warning cursor-pointer" onclick="loadMyFarmerRequests()">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="stat-label text-warning">Assigned Foods</span>
                        <div class="icon-shape bg-warning bg-opacity-10 text-warning"><i class="fa-solid fa-tractor"></i></div>
                    </div>
                    <div class="stat-number text-warning">${stats.assignedFoods}</div>
                    <div class="small text-muted">Ready for pickup/assigned</div>
                </div>
            </div>
            <div class="col-md-6 col-lg">
                <div class="stat-card border-dark cursor-pointer" onclick="loadMyFarmerRequests()">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="stat-label text-dark">Completed Collections</span>
                        <div class="icon-shape bg-dark bg-opacity-10 text-dark"><i class="fa-solid fa-check-double"></i></div>
                    </div>
                    <div class="stat-number text-dark">${stats.completedCollections}</div>
                    <div class="small text-muted">Recycled & composted</div>
                </div>
            </div>
        </div>

        <div class="row g-3">
            <div class="col-md-6">
                <div class="card border-0 shadow-sm rounded-4 p-4 h-100">
                    <h5 class="fw-bold text-dark mb-3"><i class="fa-solid fa-bolt text-warning me-2"></i>Quick Actions</h5>
                    <div class="d-grid gap-2">
                        <button class="btn btn-warning fw-bold text-dark py-2" onclick="loadFarmerExpiredFoods()">
                            <i class="fa-solid fa-magnifying-glass me-2"></i>Browse Expired Foods Available
                        </button>
                        <button class="btn btn-outline-success fw-bold py-2" onclick="loadMyFarmerRequests()">
                            <i class="fa-solid fa-list-check me-2"></i>Track My Requests & Collections
                        </button>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card border-0 shadow-sm rounded-4 p-4 h-100">
                    <h5 class="fw-bold text-dark mb-2"><i class="fa-solid fa-leaf text-success me-2"></i>Approved Non-Human Uses</h5>
                    <ul class="text-muted small mb-0 ps-3">
                        <li><strong>Organic Composting:</strong> Nutrient-rich soil enrichment for agriculture.</li>
                        <li><strong>Bio-Energy & Bio-Gas:</strong> Anaerobic digestion and renewable power.</li>
                        <li><strong>Approved Animal Feed:</strong> Regulatory compliant feed where permissible.</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

// Farmer: Browse Expired Foods (Feature #2, #18)
async function loadFarmerExpiredFoods() {
    setPageTitle('Expired Foods Available for Farmer Request');
    const main = document.getElementById('mainContent');

    const expiredFoods = await apiFetch('/api/farmer/expired-foods');
    if (!expiredFoods) return;

    main.innerHTML = `
        <div class="safety-banner">
            <h5 class="mb-1"><i class="fa-solid fa-triangle-exclamation me-1"></i> Food Safety Compliance Notice</h5>
            <p class="mb-0 fw-semibold">
                Expired food is not available for human consumption. Any agricultural, composting, animal-feed, or other non-human use must follow applicable local safety and regulatory requirements.
            </p>
        </div>

        <div class="card border-0 shadow-sm rounded-4 p-3 mb-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold text-danger mb-0"><i class="fa-solid fa-boxes-stacked me-2"></i>Expired Foods Available (${expiredFoods.length})</h5>
            </div>
            
            ${expiredFoods.length === 0 ? `
                <div class="text-center py-5 text-muted">
                    <i class="fa-solid fa-circle-check fa-3x text-success mb-2"></i>
                    <p class="mb-0">No expired food items currently available for request.</p>
                </div>
            ` : `
                <div class="table-responsive">
                    <table class="table table-hover table-custom align-middle">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Food Name</th>
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
                                    <td>${f.quantity} ${f.unit}</td>
                                    <td>${f.donorName || 'N/A'}</td>
                                    <td class="text-danger fw-semibold">${formatDate(f.expiryDate)}</td>
                                    <td><span class="badge badge-expired">EXPIRED</span></td>
                                    <td>
                                        <button class="btn btn-warning btn-sm fw-bold text-dark" onclick="openFarmerRequestModal(${f.id}, '${escapeQuote(f.foodName)}', ${f.quantity}, '${f.unit}')">
                                            <i class="fa-solid fa-hand-holding-hand me-1"></i>Request Food
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

// Open Farmer Request Modal (Feature #2)
function openFarmerRequestModal(foodId, foodName, availableQty, unit) {
    document.getElementById('reqFoodId').value = foodId;
    document.getElementById('reqFoodName').value = foodName;
    document.getElementById('reqAvailableQty').value = `${availableQty} ${unit}`;
    document.getElementById('reqQuantity').value = availableQty;
    document.getElementById('reqQuantity').max = availableQty;

    const modal = new bootstrap.Modal(document.getElementById('farmerRequestModal'));
    modal.show();
}

async function handleFarmerRequestSubmit(e) {
    e.preventDefault();
    const foodId = parseInt(document.getElementById('reqFoodId').value);
    const quantity = parseFloat(document.getElementById('reqQuantity').value);
    const reason = document.getElementById('reqReason').value;

    try {
        const res = await apiFetch('/api/farmer/food-requests', {
            method: 'POST',
            body: JSON.stringify({
                foodItemId: foodId,
                quantity: quantity,
                reason: reason
            })
        });
        if (res) {
            showToast('Expired food request submitted to Admin successfully!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('farmerRequestModal')).hide();
            loadMyFarmerRequests();
        }
    } catch (err) {
        showToast('Request submission failed: ' + err.message, 'danger');
    }
}

// Farmer: Track Own Food Requests & Collection (Feature #19)
async function loadMyFarmerRequests() {
    setPageTitle('My Expired Food Requests & Collection Tracking');
    const main = document.getElementById('mainContent');

    const requests = await apiFetch('/api/farmer/food-requests');
    if (!requests) return;

    main.innerHTML = `
        <div class="card border-0 shadow-sm rounded-4 p-3 mb-4">
            <h5 class="fw-bold text-dark mb-3"><i class="fa-solid fa-tractor text-success me-2"></i>My Requests & Assigned Allocations (${requests.length})</h5>
            
            ${requests.length === 0 ? `
                <div class="text-center py-5 text-muted">
                    <i class="fa-solid fa-tractor fa-3x mb-2 text-secondary opacity-50"></i>
                    <p class="mb-0">You haven't requested any expired food items yet. Browse <strong>Expired Foods Available</strong> to submit requests!</p>
                </div>
            ` : `
                <div class="table-responsive">
                    <table class="table table-hover table-custom align-middle">
                        <thead>
                            <tr>
                                <th>Food Code</th>
                                <th>Food Name</th>
                                <th>Quantity</th>
                                <th>Request Date</th>
                                <th>Reason / Intended Use</th>
                                <th>Pickup Location</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${requests.map(r => `
                                <tr>
                                    <td class="fw-bold text-success">${r.foodCode}</td>
                                    <td class="fw-bold">${r.foodName}</td>
                                    <td>${r.quantity} ${r.unit}</td>
                                    <td>${formatDate(r.requestDate || r.allocatedAt)}</td>
                                    <td class="small">${r.reason || 'Composting'}</td>
                                    <td>${r.pickupLocation || 'Pending Assignment'}</td>
                                    <td>${renderFarmerStatusBadge(r.status)}</td>
                                    <td>
                                        ${(r.status === 'APPROVED' || r.status === 'ASSIGNED') ? `
                                            <button class="btn btn-primary btn-sm fw-bold me-1" onclick="markFarmerCollected(${r.id})">
                                                <i class="fa-solid fa-truck-pickup me-1"></i>Mark as Collected
                                            </button>
                                        ` : r.status === 'COLLECTED' ? `
                                            <button class="btn btn-success btn-sm fw-bold me-1" onclick="markFarmerCompleted(${r.id})">
                                                <i class="fa-solid fa-check-double me-1"></i>Mark Completed
                                            </button>
                                        ` : r.status === 'COMPLETED' ? `
                                            <span class="badge bg-success bg-opacity-10 text-success fw-semibold"><i class="fa-solid fa-circle-check me-1"></i>Completed</span>
                                        ` : r.status === 'PENDING' ? `
                                            <span class="badge bg-warning text-dark"><i class="fa-solid fa-clock me-1"></i>Awaiting Admin Approval</span>
                                        ` : `
                                            <span class="text-muted small">Processed</span>
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

async function markFarmerCollected(id) {
    try {
        const res = await apiFetch(`/api/farmer/food-requests/${id}/collect`, { method: 'PUT' });
        if (res) {
            showToast('Food marked as COLLECTED from pickup location!', 'success');
            loadMyFarmerRequests();
        }
    } catch (err) {
        showToast('Action failed: ' + err.message, 'danger');
    }
}

async function markFarmerCompleted(id) {
    try {
        const res = await apiFetch(`/api/farmer/food-requests/${id}/complete`, { method: 'PUT' });
        if (res) {
            showToast('Food marked as COMPLETED (Recycled / Composted)!', 'success');
            loadMyFarmerRequests();
        }
    } catch (err) {
        showToast('Action failed: ' + err.message, 'danger');
    }
}

// -------------------------------------------------------------
// 4. ADMIN: MANAGE FARMER FOOD REQUESTS (Feature #3, #4)
// -------------------------------------------------------------
async function loadAdminFarmerRequests() {
    setPageTitle('Admin - Manage Farmer Food Requests');
    const main = document.getElementById('mainContent');

    const requests = await apiFetch('/api/admin/farmer-requests');
    if (!requests) return;

    main.innerHTML = `
        <div class="safety-banner">
            <h5 class="mb-1"><i class="fa-solid fa-triangle-exclamation me-1"></i> Expired Food Redistribution Rule</h5>
            <p class="mb-0 small fw-semibold">
                Approving a farmer request transitions the food status to <strong>SENT_TO_FARMER</strong> and assigns it for agricultural/composting recycling.
            </p>
        </div>

        <div class="card border-0 shadow-sm rounded-4 p-3 mb-4">
            <h5 class="fw-bold text-dark mb-3"><i class="fa-solid fa-tractor text-warning me-2"></i>Farmer Food Requests (${requests.length})</h5>
            
            ${requests.length === 0 ? `
                <div class="text-center py-5 text-muted">
                    <p class="mb-0">No farmer requests found.</p>
                </div>
            ` : `
                <div class="table-responsive">
                    <table class="table table-hover table-custom align-middle">
                        <thead>
                            <tr>
                                <th>Food</th>
                                <th>Farmer</th>
                                <th>Quantity</th>
                                <th>Request Date</th>
                                <th>Reason / Approved Use</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${requests.map(r => `
                                <tr>
                                    <td class="fw-bold">${r.foodName} <span class="badge bg-light text-success">${r.foodCode}</span></td>
                                    <td>${r.farmerName} (${r.farmName || 'Farm'})</td>
                                    <td class="fw-bold">${r.quantity} ${r.unit}</td>
                                    <td>${formatDate(r.requestDate || r.allocatedAt)}</td>
                                    <td class="small">${r.reason || 'Composting'}</td>
                                    <td>${renderFarmerStatusBadge(r.status)}</td>
                                    <td>
                                        ${r.status === 'PENDING' ? `
                                            <button class="btn btn-success btn-sm fw-bold me-1" onclick="adminApproveFarmerRequest(${r.id})">
                                                <i class="fa-solid fa-check me-1"></i>Approve
                                            </button>
                                            <button class="btn btn-outline-danger btn-sm" onclick="adminRejectFarmerRequest(${r.id})">
                                                <i class="fa-solid fa-xmark me-1"></i>Reject
                                            </button>
                                        ` : `
                                            <button class="btn btn-outline-secondary btn-sm" onclick="viewFoodHistory(${r.foodItemId})">
                                                <i class="fa-solid fa-history me-1"></i>History
                                            </button>
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

async function adminApproveFarmerRequest(id) {
    try {
        const res = await apiFetch(`/api/admin/farmer-requests/${id}/approve`, { method: 'PUT' });
        if (res) {
            showToast('Farmer request approved. Food status updated to SENT_TO_FARMER!', 'success');
            loadAdminFarmerRequests();
        }
    } catch (err) {
        showToast('Approval failed: ' + err.message, 'danger');
    }
}

async function adminRejectFarmerRequest(id) {
    try {
        const res = await apiFetch(`/api/admin/farmer-requests/${id}/reject`, { method: 'PUT' });
        if (res) {
            showToast('Farmer request rejected.', 'warning');
            loadAdminFarmerRequests();
        }
    } catch (err) {
        showToast('Rejection failed: ' + err.message, 'danger');
    }
}

// -------------------------------------------------------------
// 5. RECEIVER PORTAL & REQUEST TRACKING (Features #5, #6, #7, #17)
// -------------------------------------------------------------
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
                                            <span><i class="fa-solid fa-weight-hanging me-1"></i>Available Qty:</span>
                                            <strong class="text-success">${f.remainingQuantity != null ? f.remainingQuantity : f.quantity} ${f.unit}</strong>
                                        </div>
                                        <div class="d-flex justify-content-between small text-muted mb-1">
                                            <span><i class="fa-solid fa-clock me-1"></i>Expires:</span>
                                            <strong class="text-danger">${formatDate(f.expiryDate)}</strong>
                                        </div>
                                        <div class="d-flex justify-content-between small text-muted mb-3">
                                            <span><i class="fa-solid fa-location-dot me-1"></i>Location:</span>
                                            <strong class="text-dark text-truncate" style="max-width: 140px;">${f.pickupLocation}</strong>
                                        </div>
                                        <button class="btn btn-success w-100 fw-bold" onclick="requestFoodItem(${f.id}, '${escapeQuote(f.foodName)}', ${f.remainingQuantity != null ? f.remainingQuantity : f.quantity})">
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
    const qtyInput = prompt(`Enter quantity to request for "${foodName}" (Max Available: ${maxQty}):`, maxQty);
    if (qtyInput === null) return;

    const qty = parseFloat(qtyInput);
    if (isNaN(qty) || qty <= 0) {
        showToast('Please enter a valid positive quantity.', 'warning');
        return;
    }

    if (qty > maxQty) {
        showToast(`Requested quantity cannot exceed available quantity (${maxQty}).`, 'warning');
        return;
    }

    try {
        const res = await apiFetch('/api/food-requests', {
            method: 'POST',
            body: JSON.stringify({
                foodItemId: parseInt(foodId, 10),
                requestedQuantity: qty,
                notes: 'Requested via Receiver portal'
            })
        });
        if (res) {
            showToast('Food request submitted successfully! Tracking initiated.', 'success');
            loadMyRequests();
        }
    } catch (err) {
        showToast('Request failed: ' + err.message, 'danger');
    }
}

// Receiver: My Food Requests with 6-Stage Visual Stepper (Feature #5, #6)
async function loadMyRequests() {
    setPageTitle('My Food Requests - Request Tracking Lifecycle');
    const main = document.getElementById('mainContent');

    const requests = await apiFetch('/api/food-requests/my-requests');
    if (!requests) return;

    main.innerHTML = `
        <div class="card border-0 shadow-sm rounded-4 p-3 mb-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold text-dark mb-0"><i class="fa-solid fa-heart-pulse text-success me-2"></i>My Food Requests & Stage Tracking (${requests.length})</h5>
                <button class="btn btn-outline-success btn-sm fw-bold" onclick="loadAvailableFood()"><i class="fa-solid fa-plus me-1"></i>Request More Food</button>
            </div>
            
            ${requests.length === 0 ? `
                <div class="text-center py-5 text-muted">
                    <i class="fa-solid fa-hand-holding-heart fa-3x mb-2 text-secondary opacity-50"></i>
                    <p class="mb-0">You haven't requested any food items yet. Browse <strong>Available Food Listings</strong> to submit requests!</p>
                </div>
            ` : `
                <div class="d-flex flex-column gap-3">
                    ${requests.map(r => `
                        <div class="card border border-light-subtle rounded-4 p-3 shadow-sm">
                            <div class="d-flex flex-wrap justify-content-between align-items-center border-bottom pb-2 mb-2">
                                <div>
                                    <span class="badge bg-success bg-opacity-10 text-success fw-bold me-2">${r.foodCode || 'FOOD'}</span>
                                    <strong class="fs-6 text-dark">${r.foodName}</strong>
                                    <span class="badge bg-light text-dark ms-2">${r.requestedQuantity} ${r.unit || 'kg'}</span>
                                </div>
                                <div class="text-muted small">
                                    Requested: <strong>${formatDate(r.requestDate)}</strong>
                                </div>
                            </div>

                            <!-- 6-STAGE VISUAL PROGRESS / STEPPER COMPONENT (Feature #6) -->
                            ${renderRequestStepper(r.status)}

                            <div class="d-flex flex-wrap justify-content-between align-items-center mt-3 pt-2 border-top">
                                <div class="small text-muted">
                                    ${r.pickupLocation ? `<span><i class="fa-solid fa-location-dot text-danger me-1"></i>Pickup Location: <strong>${r.pickupLocation}</strong></span>` : ''}
                                    ${r.pickupDate ? `<span class="ms-3"><i class="fa-solid fa-calendar-check text-primary me-1"></i>Scheduled: <strong>${formatDate(r.pickupDate)}</strong></span>` : ''}
                                </div>
                                <div>
                                    ${(r.status === 'ALLOCATED' || r.status === 'READY_FOR_PICKUP') ? `
                                        <button class="btn btn-primary btn-sm fw-bold" onclick="receiverMarkPickedUp(${r.id})">
                                            <i class="fa-solid fa-truck-pickup me-1"></i>Mark as Picked Up
                                        </button>
                                    ` : r.status === 'PICKED_UP' ? `
                                        <button class="btn btn-success btn-sm fw-bold" onclick="receiverMarkCompleted(${r.id})">
                                            <i class="fa-solid fa-check-double me-1"></i>Mark as Completed
                                        </button>
                                    ` : r.status === 'COMPLETED' ? `
                                        <span class="badge bg-success"><i class="fa-solid fa-circle-check me-1"></i>Workflow Completed</span>
                                    ` : r.status === 'REJECTED' ? `
                                        <span class="badge bg-danger"><i class="fa-solid fa-xmark me-1"></i>Request Rejected</span>
                                    ` : `
                                        <span class="badge bg-warning text-dark"><i class="fa-solid fa-clock me-1"></i>Under Admin Review</span>
                                    `}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `;
}

// 6-Stage Stepper Component Generator (Feature #6)
function renderRequestStepper(status) {
    const stages = [
        { key: 'PENDING', label: 'Requested' },
        { key: 'APPROVED', label: 'Approved' },
        { key: 'ALLOCATED', label: 'Allocated' },
        { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup' },
        { key: 'PICKED_UP', label: 'Picked Up' },
        { key: 'COMPLETED', label: 'Completed' }
    ];

    if (status === 'REJECTED') {
        return `
            <div class="stepper-wrapper">
                <div class="stepper-item completed">
                    <div class="step-counter"><i class="fa-solid fa-check"></i></div>
                    <div class="step-name">Requested</div>
                </div>
                <div class="stepper-item rejected">
                    <div class="step-counter"><i class="fa-solid fa-xmark"></i></div>
                    <div class="step-name">Rejected</div>
                </div>
            </div>
        `;
    }

    const stageRank = {
        'PENDING': 1,
        'APPROVED': 2,
        'ALLOCATED': 3,
        'READY_FOR_PICKUP': 4,
        'PICKED_UP': 5,
        'COMPLETED': 6
    };

    const currentRank = stageRank[status] || 1;

    return `
        <div class="stepper-wrapper">
            ${stages.map((st, index) => {
                const rank = index + 1;
                let stepClass = '';
                let iconContent = rank;

                if (rank < currentRank) {
                    stepClass = 'completed';
                    iconContent = '<i class="fa-solid fa-check"></i>';
                } else if (rank === currentRank) {
                    stepClass = 'active';
                    iconContent = '<i class="fa-solid fa-circle-dot"></i>';
                }

                return `
                    <div class="stepper-item ${stepClass}">
                        <div class="step-counter">${iconContent}</div>
                        <div class="step-name">${st.label}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

async function receiverMarkPickedUp(requestId) {
    try {
        const res = await apiFetch(`/api/food-requests/${requestId}/picked-up`, { method: 'PUT' });
        if (res) {
            showToast('Food marked as Picked Up / In-Transit!', 'success');
            loadMyRequests();
        }
    } catch (err) {
        showToast('Update failed: ' + err.message, 'danger');
    }
}

async function receiverMarkCompleted(requestId) {
    try {
        const res = await apiFetch(`/api/food-requests/${requestId}/complete`, { method: 'PUT' });
        if (res) {
            showToast('Food request marked as Completed & Distributed!', 'success');
            loadMyRequests();
        }
    } catch (err) {
        showToast('Update failed: ' + err.message, 'danger');
    }
}

async function loadMyAllocations() {
    setPageTitle('Allocated & Received Food Items');
    await loadMyRequests();
}

// -------------------------------------------------------------
// 6. ADMIN: FOOD REQUESTS MANAGEMENT (Receiver Requests)
// -------------------------------------------------------------
async function loadFoodRequests() {
    setPageTitle('Receiver Food Requests Management');
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
                                <td class="fw-bold">${r.requestedQuantity} ${r.unit}</td>
                                <td>${r.totalAvailableQuantity} ${r.unit}</td>
                                <td>${formatDate(r.requestDate)}</td>
                                <td>${renderRequestStatusBadge(r.status)}</td>
                                <td>
                                    ${r.status === 'PENDING' ? `
                                        <button class="btn btn-success btn-sm fw-bold me-1" onclick="approveRequest(${r.id})"><i class="fa-solid fa-check me-1"></i>Approve</button>
                                        <button class="btn btn-outline-danger btn-sm" onclick="rejectRequest(${r.id})"><i class="fa-solid fa-xmark me-1"></i>Reject</button>
                                    ` : r.status === 'APPROVED' ? `
                                        <button class="btn btn-primary btn-sm fw-bold me-1" onclick="openAllocateReceiverModal(${r.id}, '${escapeQuote(r.foodName)}', '${escapeQuote(r.receiverName)}')">
                                            <i class="fa-solid fa-box-open me-1"></i>Allocate
                                        </button>
                                    ` : r.status === 'ALLOCATED' ? `
                                        <button class="btn btn-info btn-sm fw-bold text-white me-1" onclick="adminMarkReadyForPickup(${r.id})">
                                            <i class="fa-solid fa-bell me-1"></i>Ready for Pickup
                                        </button>
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

function openAllocateReceiverModal(requestId, foodName, receiverName) {
    document.getElementById('allocRequestId').value = requestId;
    document.getElementById('allocInfo').value = `${foodName} -> ${receiverName}`;
    document.getElementById('allocPickupLocation').value = 'Main Distribution Warehouse';

    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);
    document.getElementById('allocPickupDate').value = tomorrow.toISOString().slice(0, 16);

    const modal = new bootstrap.Modal(document.getElementById('allocateReceiverModal'));
    modal.show();
}

async function handleAllocateReceiverSubmit(e) {
    e.preventDefault();
    const requestId = document.getElementById('allocRequestId').value;
    const location = document.getElementById('allocPickupLocation').value;
    const date = document.getElementById('allocPickupDate').value;

    try {
        const res = await apiFetch(`/api/food-requests/${requestId}/allocate`, {
            method: 'PUT',
            body: JSON.stringify({ pickupLocation: location, pickupDate: date })
        });
        if (res) {
            showToast('Food allocated successfully!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('allocateReceiverModal')).hide();
            loadFoodRequests();
        }
    } catch (err) {
        showToast('Allocation failed: ' + err.message, 'danger');
    }
}

async function adminMarkReadyForPickup(id) {
    try {
        const res = await apiFetch(`/api/food-requests/${id}/ready-for-pickup`, { method: 'PUT' });
        if (res) {
            showToast('Marked ready for pickup. Notification sent to receiver!', 'success');
            loadFoodRequests();
        }
    } catch (err) {
        showToast('Action failed: ' + err.message, 'danger');
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

// -------------------------------------------------------------
// 7. ADMIN: COMPLETE FOOD TRACKING (Feature #16)
// -------------------------------------------------------------
async function loadFoodRecords(filterStatus = 'ALL') {
    setPageTitle('Admin - Complete Food Tracking Lifecycle');
    const main = document.getElementById('mainContent');

    const foods = await apiFetch('/api/foods');
    if (!foods) return;

    const filterList = [
        'ALL', 'AVAILABLE', 'REQUESTED', 'APPROVED', 'ALLOCATED',
        'READY_FOR_PICKUP', 'PICKED_UP', 'COMPLETED', 'EXPIRED', 'SENT_TO_FARMER', 'REMOVED'
    ];

    const filteredFoods = (filterStatus === 'ALL') ? foods : foods.filter(f => f.status === filterStatus);

    main.innerHTML = `
        <div class="card border-0 shadow-sm rounded-4 p-3 mb-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold text-dark mb-0"><i class="fa-solid fa-boxes-stacked text-success me-2"></i>System Food Inventory & Lifecycle Tracking</h5>
            </div>

            <!-- Status Filter Pills (Feature #16) -->
            <div class="nav nav-pills nav-pills-custom mb-3">
                ${filterList.map(st => `
                    <button class="nav-link ${filterStatus === st ? 'active' : ''}" onclick="loadFoodRecords('${st}')">
                        ${st.replace(/_/g, ' ')}
                    </button>
                `).join('')}
            </div>

            ${renderFoodTableHtml(filteredFoods, true)}
        </div>
    `;
}

function renderFoodTableHtml(foods, isAdmin = false) {
    if (!foods || foods.length === 0) {
        return `<div class="text-center py-4 text-muted">No food records found for this filter.</div>`;
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
                        <th>Remaining</th>
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
                            <td class="fw-bold text-primary">${f.remainingQuantity != null ? f.remainingQuantity : f.quantity} ${f.unit}</td>
                            <td>${f.donorName || 'N/A'}</td>
                            <td>${formatDate(f.expiryDate)}</td>
                            <td>${renderStatusBadge(f.status)}</td>
                            <td>
                                <button class="btn btn-outline-dark btn-sm fw-semibold" onclick="viewFoodHistory(${f.id})">
                                    <i class="fa-solid fa-clock-rotate-left me-1"></i>Timeline
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Expired Food Management for Admin
async function loadExpiredFood() {
    setPageTitle('Expired Food Management (Non-Human Redistribution)');
    const main = document.getElementById('mainContent');

    const expiredFoods = await apiFetch('/api/foods/expired');
    if (!expiredFoods) return;

    main.innerHTML = `
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

// -------------------------------------------------------------
// 8. AUDIT HISTORY TIMELINE (Features #12, #13)
// -------------------------------------------------------------
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
                <div class="small text-muted">Complete Immutable System Lifecycle Audit Trail</div>
            </div>
            <div class="timeline">
                ${historyList.map(h => `
                    <div class="timeline-item ${h.newStatus === 'EXPIRED' ? 'expired' : h.newStatus === 'SENT_TO_FARMER' ? 'farmer' : h.newStatus === 'REMOVED' ? 'removed' : ''}">
                        <div class="d-flex justify-content-between align-items-center">
                            <strong class="text-dark">${(h.action || '').replace(/_/g, ' ')}</strong>
                            <span class="badge bg-light text-muted">${formatDate(h.timestamp)}</span>
                        </div>
                        <div class="small text-muted mt-1">
                            Status Transition: <span class="badge badge-available">${h.previousStatus || 'NEW'}</span> &rarr; ${renderStatusBadge(h.newStatus)}
                        </div>
                        <div class="small mt-1"><strong>Performed By:</strong> ${h.performedBy || 'System'} ${h.performedByRole ? `<span class="badge bg-secondary ms-1">${h.performedByRole}</span>` : ''}</div>
                        ${h.remarks ? `<div class="small text-secondary fst-italic mt-1">${h.remarks}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    const modal = new bootstrap.Modal(document.getElementById('historyModal'));
    modal.show();
}

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
                                <td>${h.previousStatus ? renderStatusBadge(h.previousStatus) : '<span class="badge bg-light text-dark">NONE</span>'}</td>
                                <td>${renderStatusBadge(h.newStatus)}</td>
                                <td>${h.performedBy || 'System'} ${h.performedByRole ? `<span class="badge bg-light text-dark ms-1">${h.performedByRole}</span>` : ''}</td>
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

// -------------------------------------------------------------
// 9. NOTIFICATIONS MANAGEMENT (Features #14, #15)
// -------------------------------------------------------------
async function loadNotifications() {
    if (!authToken) return;
    try {
        const list = await apiFetch('/api/notifications', { silent: true });
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

            notifContainer.innerHTML = `
                <li class="dropdown-header d-flex justify-content-between align-items-center border-bottom pb-2">
                    <span class="fw-bold">Notifications (${list.length})</span>
                    <button class="btn btn-link btn-sm p-0 text-decoration-none text-success small" onclick="markAllNotificationsAsRead()">Mark All as Read</button>
                </li>
            `;

            list.slice(0, 7).forEach(n => {
                notifContainer.innerHTML += `
                    <li class="p-2 border-bottom notif-item ${n.isRead ? '' : 'unread'}">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="fw-bold small text-dark">${n.title}</div>
                            ${!n.isRead ? `<button class="btn btn-link btn-sm p-0 text-muted extra-small" onclick="markNotificationAsRead(${n.id})" title="Mark as Read"><i class="fa-solid fa-check"></i></button>` : ''}
                        </div>
                        <div class="small text-muted text-wrap">${n.message}</div>
                        <div class="text-end extra-small text-muted mt-1" style="font-size:0.75rem;">${formatDate(n.createdAt)}</div>
                    </li>
                `;
            });
        } else {
            badge.classList.add('d-none');
            notifContainer.innerHTML = `
                <li class="dropdown-header d-flex justify-content-between align-items-center border-bottom pb-2">
                    <span class="fw-bold">Notifications</span>
                </li>
                <li class="text-muted small text-center py-3">No new notifications</li>
            `;
        }
    } catch (e) {
        // silent catch
    }
}

async function markNotificationAsRead(id) {
    try {
        await apiFetch(`/api/notifications/${id}/read`, { method: 'PUT', silent: true });
        loadNotifications();
    } catch (e) {}
}

async function markAllNotificationsAsRead() {
    try {
        await apiFetch('/api/notifications/read-all', { method: 'PUT' });
        showToast('All notifications marked as read', 'success');
        loadNotifications();
    } catch (e) {
        showToast('Failed to mark all as read', 'danger');
    }
}

// -------------------------------------------------------------
// 10. USER DIRECTORY & REPORTS
// -------------------------------------------------------------
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
                        <div class="small">${report.totalSavedKg} kg food saved from landfill</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// -------------------------------------------------------------
// STATUS BADGES & UTILITY HELPERS (Feature #21)
// -------------------------------------------------------------
function formatDate(dtStr) {
    if (!dtStr) return 'N/A';
    const d = new Date(dtStr);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function renderStatusBadge(status) {
    switch (status) {
        case 'AVAILABLE': return '<span class="badge badge-available">AVAILABLE</span>';
        case 'REQUESTED': return '<span class="badge badge-requested">REQUESTED</span>';
        case 'APPROVED': return '<span class="badge badge-approved">APPROVED</span>';
        case 'ALLOCATED': return '<span class="badge badge-allocated">ALLOCATED</span>';
        case 'READY_FOR_PICKUP': return '<span class="badge badge-ready-pickup">READY FOR PICKUP</span>';
        case 'PICKED_UP': return '<span class="badge badge-picked-up">PICKED UP</span>';
        case 'DISTRIBUTED': return '<span class="badge badge-distributed">DISTRIBUTED</span>';
        case 'EXPIRED': return '<span class="badge badge-expired">EXPIRED</span>';
        case 'SENT_TO_FARMER': return '<span class="badge badge-farmer">SENT TO FARMER</span>';
        case 'COMPLETED': return '<span class="badge badge-completed">COMPLETED</span>';
        case 'REMOVED': return '<span class="badge badge-removed">REMOVED</span>';
        case 'REJECTED': return '<span class="badge badge-rejected">REJECTED</span>';
        default: return `<span class="badge bg-secondary">${status || 'N/A'}</span>`;
    }
}

function renderRequestStatusBadge(status) {
    switch (status) {
        case 'PENDING': return '<span class="badge bg-warning text-dark"><i class="fa-solid fa-clock me-1"></i>Pending</span>';
        case 'APPROVED': return '<span class="badge bg-success"><i class="fa-solid fa-check me-1"></i>Approved</span>';
        case 'ALLOCATED': return '<span class="badge bg-info text-dark"><i class="fa-solid fa-box-open me-1"></i>Allocated</span>';
        case 'READY_FOR_PICKUP': return '<span class="badge badge-ready-pickup"><i class="fa-solid fa-bell me-1"></i>Ready for Pickup</span>';
        case 'PICKED_UP': return '<span class="badge badge-picked-up"><i class="fa-solid fa-truck-pickup me-1"></i>Picked Up</span>';
        case 'COMPLETED': return '<span class="badge bg-success"><i class="fa-solid fa-circle-check me-1"></i>Completed</span>';
        case 'REJECTED': return '<span class="badge bg-danger"><i class="fa-solid fa-xmark me-1"></i>Rejected</span>';
        default: return `<span class="badge bg-secondary">${status || 'N/A'}</span>`;
    }
}

function renderFarmerStatusBadge(status) {
    switch (status) {
        case 'PENDING': return '<span class="badge bg-warning text-dark"><i class="fa-solid fa-clock me-1"></i>PENDING</span>';
        case 'APPROVED': return '<span class="badge bg-success"><i class="fa-solid fa-check me-1"></i>APPROVED</span>';
        case 'ACCEPTED': return '<span class="badge bg-success"><i class="fa-solid fa-check me-1"></i>ACCEPTED</span>';
        case 'ASSIGNED': return '<span class="badge bg-info text-dark"><i class="fa-solid fa-tractor me-1"></i>ASSIGNED</span>';
        case 'COLLECTED': return '<span class="badge badge-picked-up"><i class="fa-solid fa-truck-pickup me-1"></i>COLLECTED</span>';
        case 'COMPLETED': return '<span class="badge bg-dark"><i class="fa-solid fa-circle-check me-1"></i>COMPLETED</span>';
        case 'REJECTED': return '<span class="badge bg-danger"><i class="fa-solid fa-xmark me-1"></i>REJECTED</span>';
        default: return `<span class="badge bg-secondary">${status || 'N/A'}</span>`;
    }
}

function escapeQuote(str) {
    if (!str) return '';
    return String(str).replace(/'/g, "\\'");
}

function showToast(msg, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
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
