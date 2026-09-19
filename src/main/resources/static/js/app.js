// FoodRescue Application Logic & SPA Routing with Bilingual Localization
let currentUser = null;
let authToken = localStorage.getItem('foodrescue_token');
let chartInstance1 = null;
let chartInstance2 = null;
let notifPollInterval = null;
let currentViewHandler = null;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize localization state & static DOM translations
    const savedLang = localStorage.getItem('foodrescue_lang') || 'en';
    changeLanguage(savedLang);

    initApp();

    // Attach form listeners
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
    document.getElementById('addFoodForm')?.addEventListener('submit', handleAddFood);
    document.getElementById('sendToFarmerForm')?.addEventListener('submit', handleSendToFarmerSubmit);
    document.getElementById('farmerRequestForm')?.addEventListener('submit', handleFarmerRequestSubmit);
    document.getElementById('allocateReceiverForm')?.addEventListener('submit', handleAllocateReceiverSubmit);
});

// Refresh the current view when language changes
function refreshCurrentView() {
    applyStaticTranslations();
    if (currentUser) {
        document.getElementById('userRoleBadge').textContent = formatRole(currentUser.role);
        buildSidebarMenu();
        if (typeof currentViewHandler === 'function') {
            currentViewHandler();
        }
    }
}

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
                showToast(t('toast.sessionExpired'), 'warning');
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
    applyStaticTranslations();
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
    if (role === 'ROLE_ADMIN') return t('role.ADMIN');
    if (role === 'ROLE_DONOR') return t('role.DONOR');
    if (role === 'ROLE_RECEIVER') return t('role.RECEIVER');
    if (role === 'ROLE_FARMER') return t('role.FARMER');
    return role;
}

function formatCategory(category) {
    if (!category) return '';
    return t('category.' + category);
}

// Build Role-Based Sidebar Navigation
function buildSidebarMenu() {
    const menu = document.getElementById('sidebarMenu');
    menu.innerHTML = '';

    const role = currentUser.role;

    if (role === 'ROLE_ADMIN') {
        menu.innerHTML = `
            <li class="nav-item"><a class="nav-link active" onclick="loadDashboard()"><i class="fa-solid fa-chart-pie"></i> ${t('sidebar.adminDashboard')}</a></li>
            <li class="nav-item"><a class="nav-link" onclick="loadFoodRecords()"><i class="fa-solid fa-boxes-stacked"></i> ${t('sidebar.allFoodTracking')}</a></li>
            <li class="nav-item"><a class="nav-link text-warning fw-bold" onclick="loadExpiredFood()"><i class="fa-solid fa-triangle-exclamation"></i> ${t('sidebar.expiredFoodMgmt')}</a></li>
            <li class="nav-item"><a class="nav-link" onclick="loadFoodRequests()"><i class="fa-solid fa-hand-holding-heart"></i> ${t('sidebar.receiverFoodRequests')}</a></li>
            <li class="nav-item"><a class="nav-link" onclick="loadAdminFarmerRequests()"><i class="fa-solid fa-tractor"></i> ${t('sidebar.farmerFoodRequests')}</a></li>
            <li class="nav-item"><a class="nav-link" onclick="loadDonors()"><i class="fa-solid fa-building"></i> ${t('sidebar.registeredDonors')}</a></li>
            <li class="nav-item"><a class="nav-link" onclick="loadReceivers()"><i class="fa-solid fa-house-heart"></i> ${t('sidebar.registeredReceivers')}</a></li>
            <li class="nav-item"><a class="nav-link" onclick="loadFarmers()"><i class="fa-solid fa-wheat-awn"></i> ${t('sidebar.registeredFarmers')}</a></li>
            <li class="nav-item"><a class="nav-link" onclick="loadAllHistory()"><i class="fa-solid fa-clock-rotate-left"></i> ${t('sidebar.fullHistory')}</a></li>
            <li class="nav-item"><a class="nav-link" onclick="loadReports()"><i class="fa-solid fa-file-invoice"></i> ${t('sidebar.reports')}</a></li>
        `;
    } else if (role === 'ROLE_DONOR') {
        menu.innerHTML = `
            <li class="nav-item"><a class="nav-link active" onclick="loadDonorDashboard()"><i class="fa-solid fa-gauge"></i> ${t('sidebar.donorDashboard')}</a></li>
            <li class="nav-item"><a class="nav-link" onclick="openAddFoodModal()"><i class="fa-solid fa-plus-circle"></i> ${t('sidebar.addFood')}</a></li>
            <li class="nav-item"><a class="nav-link" onclick="loadMyDonations()"><i class="fa-solid fa-utensils"></i> ${t('sidebar.myDonations')}</a></li>
        `;
    } else if (role === 'ROLE_RECEIVER') {
        menu.innerHTML = `
            <li class="nav-item"><a class="nav-link active" onclick="loadAvailableFood()"><i class="fa-solid fa-store"></i> ${t('sidebar.availableFood')}</a></li>
            <li class="nav-item"><a class="nav-link" onclick="loadMyRequests()"><i class="fa-solid fa-heart-pulse"></i> ${t('sidebar.myRequests')}</a></li>
        `;
    } else if (role === 'ROLE_FARMER') {
        menu.innerHTML = `
            <li class="nav-item"><a class="nav-link active" onclick="loadFarmerDashboard()"><i class="fa-solid fa-gauge"></i> ${t('sidebar.farmerDashboard')}</a></li>
            <li class="nav-item"><a class="nav-link text-warning fw-bold" onclick="loadFarmerExpiredFoods()"><i class="fa-solid fa-triangle-exclamation"></i> ${t('sidebar.farmerExpiredFoods')}</a></li>
            <li class="nav-item"><a class="nav-link" onclick="loadMyFarmerRequests()"><i class="fa-solid fa-tractor"></i> ${t('sidebar.farmerMyRequests')}</a></li>
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
            showToast(t('toast.welcome', [res.fullName]), 'success');
            showAppScreen();
        }
    } catch (err) {
        showToast(t('toast.loginFailed'), 'danger');
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
            showToast(t('toast.registerSuccess'), 'success');
            showAppScreen();
        }
    } catch (err) {
        showToast(t('toast.registerFailed', [err.message]), 'danger');
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

    currentViewHandler = () => loadDashboard();
    setPageTitle(t('dashboard.adminTitle'));
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
                        <span class="stat-label">${t('dashboard.totalDonations')}</span>
                        <div class="icon-shape bg-success bg-opacity-10 text-success"><i class="fa-solid fa-hand-holding-heart"></i></div>
                    </div>
                    <div class="stat-number">${stats.totalDonations}</div>
                    <div class="small text-muted">${t('dashboard.totalKg', [stats.totalQuantityDonatedKg])}</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="stat-label">${t('dashboard.availableFood')}</span>
                        <div class="icon-shape bg-primary bg-opacity-10 text-primary"><i class="fa-solid fa-store"></i></div>
                    </div>
                    <div class="stat-number">${stats.availableFoodCount}</div>
                    <div class="small text-muted">${t('dashboard.readyForAlloc')}</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="stat-label">${t('dashboard.distributedFood')}</span>
                        <div class="icon-shape bg-info bg-opacity-10 text-info"><i class="fa-solid fa-truck-ramp-box"></i></div>
                    </div>
                    <div class="stat-number">${stats.distributedFoodCount}</div>
                    <div class="small text-muted">${t('dashboard.distributedKg', [stats.totalQuantityDistributedKg])}</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card border-warning">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="stat-label text-danger">${t('dashboard.expiredFarmerFood')}</span>
                        <div class="icon-shape bg-warning bg-opacity-10 text-warning"><i class="fa-solid fa-triangle-exclamation"></i></div>
                    </div>
                    <div class="stat-number text-warning">${stats.expiredFoodCount + stats.sentToFarmersCount}</div>
                    <div class="small text-muted">${t('dashboard.redirectedFarmer', [stats.sentToFarmersCount])}</div>
                </div>
            </div>
        </div>

        <div class="row g-3 mb-4">
            <div class="col-md-4">
                <div class="stat-card">
                    <span class="stat-label">${t('dashboard.regDonors')}</span>
                    <div class="stat-number text-success">${stats.totalDonors}</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stat-card">
                    <span class="stat-label">${t('dashboard.regReceivers')}</span>
                    <div class="stat-number text-primary">${stats.totalReceivers}</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stat-card">
                    <span class="stat-label">${t('dashboard.regFarmers')}</span>
                    <div class="stat-number text-warning">${stats.totalFarmers}</div>
                </div>
            </div>
        </div>

        <!-- Analytical Charts Row -->
        <div class="row g-4">
            <div class="col-md-8">
                <div class="card border-0 shadow-sm rounded-4 p-4">
                    <h5 class="fw-bold text-dark mb-3"><i class="fa-solid fa-chart-line text-success me-2"></i>${t('dashboard.chartDonatedVsDist')}</h5>
                    <canvas id="donationChart" height="140"></canvas>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card border-0 shadow-sm rounded-4 p-4">
                    <h5 class="fw-bold text-dark mb-3"><i class="fa-solid fa-chart-pie text-primary me-2"></i>${t('dashboard.chartCategory')}</h5>
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
                    { label: t('dashboard.chartDonatedLabel'), data: donatedData, backgroundColor: '#10b981' },
                    { label: t('dashboard.chartDistributedLabel'), data: distributedData, backgroundColor: '#3b82f6' }
                ]
            },
            options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
        });
    }

    const ctx2 = document.getElementById('categoryChart')?.getContext('2d');
    if (ctx2 && stats.categoryBreakdown) {
        const categoryKeys = Object.keys(stats.categoryBreakdown);
        const translatedCatLabels = categoryKeys.map(k => formatCategory(k) || k);

        chartInstance2 = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: translatedCatLabels,
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
    currentViewHandler = () => loadDonorDashboard();
    setPageTitle(t('donor.portalTitle'));
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
            showToast(t('toast.foodAdded'), 'success');
            bootstrap.Modal.getInstance(document.getElementById('addFoodModal')).hide();
            document.getElementById('addFoodForm').reset();
            loadMyDonations();
        }
    } catch (err) {
        showToast(t('toast.foodAddError', [err.message]), 'danger');
    }
}

async function loadMyDonations() {
    currentViewHandler = () => loadMyDonations();
    setPageTitle(t('donor.myDonationsTitle'));
    const main = document.getElementById('mainContent');

    const foods = await apiFetch('/api/foods/my-donations');
    if (!foods) return;

    main.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <h5 class="fw-bold text-dark mb-1"><i class="fa-solid fa-list-check me-2 text-success"></i>${t('donor.recordsCount', [foods.length])}</h5>
                <p class="text-muted small mb-0">${t('donor.manageDescription')}</p>
            </div>
            <button class="btn btn-success fw-bold" onclick="openAddFoodModal()"><i class="fa-solid fa-plus-circle me-1"></i>${t('donor.donateBtn')}</button>
        </div>

        ${foods.length === 0 ? `
            <div class="card border-0 shadow-sm rounded-4 p-5 text-center text-muted">
                <i class="fa-solid fa-bowl-food fa-3x mb-3 text-success opacity-50"></i>
                <h5>${t('donor.noDonations')}</h5>
                <p class="mb-3">${t('donor.noDonationsSub')}</p>
                <div>
                    <button class="btn btn-success fw-bold" onclick="openAddFoodModal()"><i class="fa-solid fa-plus-circle me-1"></i>${t('donor.donateBtn')}</button>
                </div>
            </div>
        ` : `
            <div class="card border-0 shadow-sm rounded-4 p-3 mb-4">
                <div class="table-responsive">
                    <table class="table table-hover table-custom align-middle">
                        <thead>
                            <tr>
                                <th>${t('th.code')}</th>
                                <th>${t('th.foodName')}</th>
                                <th>${t('th.category')}</th>
                                <th>${t('th.quantity')}</th>
                                <th>${t('th.remaining')}</th>
                                <th>${t('th.expiryDate')}</th>
                                <th>${t('th.status')}</th>
                                <th>${t('th.actions')}</th>
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
                                        <td><span class="badge bg-light text-dark">${formatCategory(f.category)}</span></td>
                                        <td>${f.quantity} ${f.unit}</td>
                                        <td class="fw-bold text-primary">${f.remainingQuantity != null ? f.remainingQuantity : f.quantity} ${f.unit}</td>
                                        <td>${formatDate(f.expiryDate)}</td>
                                        <td>${renderStatusBadge(f.status)}</td>
                                        <td>
                                            <div class="d-flex align-items-center gap-1">
                                                <button class="btn btn-outline-dark btn-sm fw-semibold" onclick="viewFoodHistory(${f.id})" title="${t('btn.viewHistory')}">
                                                    <i class="fa-solid fa-clock-rotate-left"></i>
                                                </button>

                                                ${canRemove ? `
                                                    <button class="btn btn-outline-danger btn-sm fw-semibold" onclick="openRemoveFoodModal(${f.id}, '${escapeQuote(f.foodName)}')" title="${t('donor.removeFoodTitle')}">
                                                        <i class="fa-solid fa-trash me-1"></i>${t('donor.removeBtn')}
                                                    </button>
                                                ` : f.status === 'REMOVED' ? `
                                                    <span class="badge bg-secondary">${t('donor.removed')}</span>
                                                ` : `
                                                    <span class="d-inline-block" tabindex="0" data-bs-toggle="tooltip" title="${t('donor.lockedNotice')}">
                                                        <button class="btn btn-outline-secondary btn-sm" disabled style="pointer-events: none;">
                                                            <i class="fa-solid fa-lock me-1"></i>${t('donor.locked')}
                                                        </button>
                                                    </span>
                                                `}
                                            </div>
                                            ${!canRemove && f.status !== 'REMOVED' && isAvailable && hasRequests ? `
                                                <div class="extra-small text-danger mt-1" style="font-size:0.75rem;">
                                                    <i class="fa-solid fa-info-circle me-1"></i>${t('donor.requestExists')}
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
    document.getElementById('removeFoodNameText').textContent = t('donor.removeFoodConfirm', [foodName]);
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
            showToast(t('toast.foodRemoved'), 'success');
            bootstrap.Modal.getInstance(document.getElementById('removeFoodModal')).hide();
            loadMyDonations();
        }
    } catch (err) {
        showToast(t('toast.foodRemoveError', [err.message]), 'danger');
    }
}

// -------------------------------------------------------------
// 3. FARMER PORTAL & BIO-RECYCLING (Features #2, #18)
// -------------------------------------------------------------
async function loadFarmerDashboard() {
    currentViewHandler = () => loadFarmerDashboard();
    setPageTitle(t('farmer.dashboardTitle'));
    const main = document.getElementById('mainContent');
    main.innerHTML = `<div class="text-center py-5"><div class="spinner-border text-success"></div></div>`;

    const stats = await apiFetch('/api/farmer/dashboard-stats');
    if (!stats) return;

    main.innerHTML = `
        <div class="row g-3 mb-4">
            <div class="col-md-4">
                <div class="stat-card">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="stat-label">${t('farmer.statBioRecycled')}</span>
                        <div class="icon-shape bg-warning bg-opacity-10 text-warning"><i class="fa-solid fa-tractor"></i></div>
                    </div>
                    <div class="stat-number text-warning">${stats.totalBioRecycledKg} kg</div>
                    <div class="small text-muted">${t('farmer.statComposted')}</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stat-card">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="stat-label">${t('farmer.statActiveReq')}</span>
                        <div class="icon-shape bg-primary bg-opacity-10 text-primary"><i class="fa-solid fa-file-signature"></i></div>
                    </div>
                    <div class="stat-number text-primary">${stats.activeRequestsCount}</div>
                    <div class="small text-muted">${t('farmer.statUnderReview')}</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stat-card">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="stat-label">${t('farmer.statExpiredAvailable')}</span>
                        <div class="icon-shape bg-danger bg-opacity-10 text-danger"><i class="fa-solid fa-triangle-exclamation"></i></div>
                    </div>
                    <div class="stat-number text-danger">${stats.availableExpiredKg} kg</div>
                    <div class="small text-muted">${t('farmer.statAwaitingRedirect')}</div>
                </div>
            </div>
        </div>

        <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="fw-bold text-dark mb-1"><i class="fa-solid fa-recycle text-warning me-2"></i>${t('farmer.quickActionHeader')}</h5>
                    <p class="text-muted small mb-0">${t('farmer.quickActionDesc')}</p>
                </div>
                <button class="btn btn-warning fw-bold text-dark" onclick="loadFarmerExpiredFoods()">
                    <i class="fa-solid fa-tractor me-1"></i>${t('farmer.browseExpiredBtn')}
                </button>
            </div>
        </div>

        <!-- Recent Farmer Activity -->
        <div class="card border-0 shadow-sm rounded-4 p-3">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold text-dark mb-0">${t('farmer.myRequestsTitle', [stats.recentRequests?.length || 0])}</h5>
                <button class="btn btn-outline-success btn-sm fw-bold" onclick="loadMyFarmerRequests()">${t('btn.viewHistory')}</button>
            </div>
            ${!stats.recentRequests || stats.recentRequests.length === 0 ? `
                <div class="text-center text-muted py-4">
                    <i class="fa-solid fa-seedling fa-2x mb-2 text-warning opacity-50"></i>
                    <p class="mb-0">${t('farmer.noRequests')}</p>
                </div>
            ` : `
                <div class="table-responsive">
                    <table class="table table-hover table-custom align-middle">
                        <thead>
                            <tr>
                                <th>${t('th.code')}</th>
                                <th>${t('th.foodName')}</th>
                                <th>${t('th.requestedQty')}</th>
                                <th>${t('th.intendedUse')}</th>
                                <th>${t('th.status')}</th>
                                <th>${t('th.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${stats.recentRequests.map(r => `
                                <tr>
                                    <td class="fw-bold text-success">${r.foodCode}</td>
                                    <td class="fw-bold">${r.foodName}</td>
                                    <td>${r.requestedQuantity} ${r.unit}</td>
                                    <td><span class="badge bg-light text-dark">${r.intendedUse || 'Composting'}</span></td>
                                    <td>${renderFarmerStatusBadge(r.status)}</td>
                                    <td>
                                        ${r.status === 'ASSIGNED' ? `
                                            <button class="btn btn-outline-primary btn-sm fw-bold" onclick="markFarmerCollected(${r.id})">
                                                <i class="fa-solid fa-truck-pickup me-1"></i>${t('farmer.markCollectedBtn')}
                                            </button>
                                        ` : r.status === 'COLLECTED' ? `
                                            <button class="btn btn-success btn-sm fw-bold" onclick="markFarmerCompleted(${r.id})">
                                                <i class="fa-solid fa-check me-1"></i>${t('farmer.markCompletedBtn')}
                                            </button>
                                        ` : `
                                            <span class="text-muted small">${formatDate(r.createdAt)}</span>
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

async function loadFarmerExpiredFoods() {
    currentViewHandler = () => loadFarmerExpiredFoods();
    setPageTitle(t('farmer.expiredTitle'));
    const main = document.getElementById('mainContent');

    const foods = await apiFetch('/api/farmer/expired-foods');
    if (!foods) return;

    main.innerHTML = `
        <div class="alert alert-warning border-0 shadow-sm rounded-4 mb-4 d-flex align-items-center gap-3">
            <i class="fa-solid fa-triangle-exclamation fa-2x text-warning"></i>
            <div>
                <h6 class="fw-bold mb-1">${t('farmer.safetyAlert')}</h6>
                <p class="mb-0 small text-muted">${t('farmer.expiredSubtitle')}</p>
            </div>
        </div>

        ${foods.length === 0 ? `
            <div class="card border-0 shadow-sm rounded-4 p-5 text-center text-muted">
                <i class="fa-solid fa-wheat-awn-circle-exclamation fa-3x mb-3 text-warning opacity-50"></i>
                <h5>${t('farmer.noExpired')}</h5>
                <p class="mb-0">${t('farmer.noExpiredSub')}</p>
            </div>
        ` : `
            <div class="row g-3">
                ${foods.map(f => `
                    <div class="col-md-6 col-lg-4">
                        <div class="card border-0 shadow-sm rounded-4 h-100 p-3 food-card">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <span class="badge bg-danger bg-opacity-10 text-danger fw-bold"><i class="fa-solid fa-clock-rotate-left me-1"></i>${t('status.EXPIRED')}</span>
                                <span class="badge bg-light text-dark">${formatCategory(f.category)}</span>
                            </div>
                            <h5 class="fw-bold text-dark mb-1">${f.foodName}</h5>
                            <p class="text-muted small mb-2"><i class="fa-solid fa-hashtag me-1 text-success"></i>${f.foodCode}</p>

                            <div class="bg-light rounded-3 p-2 mb-3">
                                <div class="d-flex justify-content-between small text-muted mb-1">
                                    <span>${t('receiver.donorLabel')}</span>
                                    <span class="fw-semibold text-dark">${f.donorName || 'Registered Donor'}</span>
                                </div>
                                <div class="d-flex justify-content-between small text-muted mb-1">
                                    <span>${t('receiver.availableQty')}</span>
                                    <span class="fw-bold text-warning">${f.remainingQuantity != null ? f.remainingQuantity : f.quantity} ${f.unit}</span>
                                </div>
                                <div class="d-flex justify-content-between small text-muted mb-1">
                                    <span>${t('receiver.expires')}</span>
                                    <span class="text-danger fw-semibold">${formatDate(f.expiryDate)}</span>
                                </div>
                                <div class="d-flex justify-content-between small text-muted">
                                    <span>${t('receiver.pickup')}</span>
                                    <span class="text-truncate" style="max-width: 140px;">${f.pickupLocation || 'Pickup Dock'}</span>
                                </div>
                            </div>

                            <button class="btn btn-warning w-100 fw-bold text-dark mt-auto" onclick="openFarmerRequestModal(${f.id}, '${escapeQuote(f.foodName)}', ${f.remainingQuantity != null ? f.remainingQuantity : f.quantity}, '${f.unit}')">
                                <i class="fa-solid fa-tractor me-1"></i>${t('farmer.requestExpiredBtn')}
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `}
    `;
}

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
    const foodId = document.getElementById('reqFoodId').value;
    const qty = parseFloat(document.getElementById('reqQuantity').value);
    const reason = document.getElementById('reqReason').value;

    try {
        const res = await apiFetch(`/api/farmer/request/${foodId}`, {
            method: 'POST',
            body: JSON.stringify({
                requestedQuantity: qty,
                intendedUse: reason
            })
        });
        if (res) {
            showToast(t('toast.farmerReqSubmitted'), 'success');
            bootstrap.Modal.getInstance(document.getElementById('farmerRequestModal')).hide();
            loadMyFarmerRequests();
        }
    } catch (err) {
        showToast(t('toast.farmerReqError', [err.message]), 'danger');
    }
}

async function loadMyFarmerRequests() {
    currentViewHandler = () => loadMyFarmerRequests();
    setPageTitle(t('sidebar.farmerMyRequests'));
    const main = document.getElementById('mainContent');

    const requests = await apiFetch('/api/farmer/my-requests');
    if (!requests) return;

    main.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <h5 class="fw-bold text-dark mb-1"><i class="fa-solid fa-tractor text-warning me-2"></i>${t('farmer.myRequestsTitle', [requests.length])}</h5>
                <p class="text-muted small mb-0">${t('farmer.myRequestsSubtitle')}</p>
            </div>
            <button class="btn btn-warning fw-bold text-dark" onclick="loadFarmerExpiredFoods()"><i class="fa-solid fa-plus-circle me-1"></i>${t('farmer.browseExpiredBtn')}</button>
        </div>

        ${requests.length === 0 ? `
            <div class="card border-0 shadow-sm rounded-4 p-5 text-center text-muted">
                <i class="fa-solid fa-tractor fa-3x mb-3 text-warning opacity-50"></i>
                <h5>${t('farmer.noRequests')}</h5>
                <p class="mb-3">${t('farmer.noRequestsSub')}</p>
                <div>
                    <button class="btn btn-warning fw-bold text-dark" onclick="loadFarmerExpiredFoods()"><i class="fa-solid fa-tractor me-1"></i>${t('farmer.browseExpiredBtn')}</button>
                </div>
            </div>
        ` : `
            <div class="card border-0 shadow-sm rounded-4 p-3 mb-4">
                <div class="table-responsive">
                    <table class="table table-hover table-custom align-middle">
                        <thead>
                            <tr>
                                <th>${t('th.code')}</th>
                                <th>${t('th.foodName')}</th>
                                <th>${t('th.requestedQty')}</th>
                                <th>${t('th.intendedUse')}</th>
                                <th>${t('th.status')}</th>
                                <th>${t('th.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${requests.map(r => `
                                <tr>
                                    <td class="fw-bold text-success">${r.foodCode}</td>
                                    <td class="fw-bold">${r.foodName}</td>
                                    <td>${r.requestedQuantity} ${r.unit}</td>
                                    <td><span class="badge bg-light text-dark">${r.intendedUse || 'Composting'}</span></td>
                                    <td>${renderFarmerStatusBadge(r.status)}</td>
                                    <td>
                                        ${r.status === 'ASSIGNED' ? `
                                            <button class="btn btn-outline-primary btn-sm fw-bold" onclick="markFarmerCollected(${r.id})">
                                                <i class="fa-solid fa-truck-pickup me-1"></i>${t('farmer.markCollectedBtn')}
                                            </button>
                                        ` : r.status === 'COLLECTED' ? `
                                            <button class="btn btn-success btn-sm fw-bold" onclick="markFarmerCompleted(${r.id})">
                                                <i class="fa-solid fa-check me-1"></i>${t('farmer.markCompletedBtn')}
                                            </button>
                                        ` : r.status === 'COMPLETED' ? `
                                            <span class="badge bg-success"><i class="fa-solid fa-check me-1"></i>${t('farmer.completedNotice')}</span>
                                        ` : `
                                            <span class="text-muted small">${formatDate(r.createdAt)}</span>
                                        `}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `}
    `;
}

async function markFarmerCollected(id) {
    try {
        const res = await apiFetch(`/api/farmer/requests/${id}/collect`, { method: 'PUT' });
        if (res) {
            showToast(t('toast.farmerCollected'), 'success');
            loadMyFarmerRequests();
        }
    } catch (err) {
        showToast(err.message, 'danger');
    }
}

async function markFarmerCompleted(id) {
    try {
        const res = await apiFetch(`/api/farmer/requests/${id}/complete`, { method: 'PUT' });
        if (res) {
            showToast(t('toast.farmerCompleted'), 'success');
            loadMyFarmerRequests();
        }
    } catch (err) {
        showToast(err.message, 'danger');
    }
}

// Admin View: Manage Farmer Requests (Feature #2, #18)
async function loadAdminFarmerRequests() {
    currentViewHandler = () => loadAdminFarmerRequests();
    setPageTitle(t('admin.farmerReqTitle'));
    const main = document.getElementById('mainContent');

    const requests = await apiFetch('/api/farmer/admin-requests');
    if (!requests) return;

    main.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <h5 class="fw-bold text-dark mb-1"><i class="fa-solid fa-tractor text-warning me-2"></i>${t('admin.farmerReqTitle')} (${requests.length})</h5>
                <p class="text-muted small mb-0">${t('admin.farmerReqSubtitle')}</p>
            </div>
        </div>

        ${requests.length === 0 ? `
            <div class="card border-0 shadow-sm rounded-4 p-5 text-center text-muted">
                <i class="fa-solid fa-seedling fa-3x mb-3 text-warning opacity-50"></i>
                <h5>${t('admin.noFarmerReq')}</h5>
                <p class="mb-0">${t('admin.noFarmerReqSub')}</p>
            </div>
        ` : `
            <div class="card border-0 shadow-sm rounded-4 p-3 mb-4">
                <div class="table-responsive">
                    <table class="table table-hover table-custom align-middle">
                        <thead>
                            <tr>
                                <th>${t('th.code')}</th>
                                <th>${t('th.foodName')}</th>
                                <th>${t('th.farmer')}</th>
                                <th>${t('th.requestedQty')}</th>
                                <th>${t('th.intendedUse')}</th>
                                <th>${t('th.status')}</th>
                                <th>${t('th.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${requests.map(r => `
                                <tr>
                                    <td class="fw-bold text-success">${r.foodCode}</td>
                                    <td class="fw-bold">${r.foodName}</td>
                                    <td>
                                        <div class="fw-semibold text-dark">${r.farmerName}</div>
                                        <div class="extra-small text-muted">${r.farmerPhone || ''}</div>
                                    </td>
                                    <td>${r.requestedQuantity} ${r.unit}</td>
                                    <td><span class="badge bg-light text-dark">${r.intendedUse || 'Organic Soil Composting'}</span></td>
                                    <td>${renderFarmerStatusBadge(r.status)}</td>
                                    <td>
                                        ${r.status === 'PENDING' ? `
                                            <div class="btn-group btn-group-sm">
                                                <button class="btn btn-success fw-bold" onclick="adminApproveFarmerRequest(${r.id})">
                                                    <i class="fa-solid fa-check me-1"></i>${t('btn.approve')}
                                                </button>
                                                <button class="btn btn-outline-danger fw-bold" onclick="adminRejectFarmerRequest(${r.id})">
                                                    <i class="fa-solid fa-xmark me-1"></i>${t('btn.reject')}
                                                </button>
                                            </div>
                                        ` : `
                                            <span class="text-muted small">${formatDate(r.createdAt)}</span>
                                        `}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `}
    `;
}

async function adminApproveFarmerRequest(id) {
    try {
        const res = await apiFetch(`/api/farmer/requests/${id}/approve`, { method: 'PUT' });
        if (res) {
            showToast(t('toast.farmerApproved'), 'success');
            loadAdminFarmerRequests();
        }
    } catch (err) {
        showToast(err.message, 'danger');
    }
}

async function adminRejectFarmerRequest(id) {
    if (!confirm(t('toast.rejectConfirm'))) return;
    try {
        const res = await apiFetch(`/api/farmer/requests/${id}/reject`, { method: 'PUT' });
        if (res) {
            showToast(t('toast.farmerRejected'), 'info');
            loadAdminFarmerRequests();
        }
    } catch (err) {
        showToast(err.message, 'danger');
    }
}

// -------------------------------------------------------------
// 4. RECEIVER PORTAL & AVAILABLE FOOD LISTINGS (Features #11, #12, #13)
// -------------------------------------------------------------
async function loadAvailableFood() {
    currentViewHandler = () => loadAvailableFood();
    setPageTitle(t('receiver.availableTitle'));
    const main = document.getElementById('mainContent');

    const foods = await apiFetch('/api/foods/available');
    if (!foods) return;

    main.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <h5 class="fw-bold text-dark mb-1"><i class="fa-solid fa-store text-success me-2"></i>${t('receiver.availableTitle')} (${foods.length})</h5>
                <p class="text-muted small mb-0">${t('receiver.availableSubtitle')}</p>
            </div>
        </div>

        ${foods.length === 0 ? `
            <div class="card border-0 shadow-sm rounded-4 p-5 text-center text-muted">
                <i class="fa-solid fa-box-open fa-3x mb-3 text-success opacity-50"></i>
                <h5>${t('receiver.noFoodTitle')}</h5>
                <p class="mb-0">${t('receiver.noFoodSub')}</p>
            </div>
        ` : `
            <div class="row g-3">
                ${foods.map(f => `
                    <div class="col-md-6 col-lg-4">
                        <div class="card border-0 shadow-sm rounded-4 h-100 p-3 food-card">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <span class="badge bg-success bg-opacity-10 text-success fw-bold"><i class="fa-solid fa-circle-check me-1"></i>${t('status.AVAILABLE')}</span>
                                <span class="badge bg-light text-dark">${formatCategory(f.category)}</span>
                            </div>
                            <h5 class="fw-bold text-dark mb-1">${f.foodName}</h5>
                            <p class="text-muted small mb-2"><i class="fa-solid fa-hashtag me-1 text-success"></i>${f.foodCode}</p>

                            <div class="bg-light rounded-3 p-2 mb-3">
                                <div class="d-flex justify-content-between small text-muted mb-1">
                                    <span>${t('receiver.donorLabel')}</span>
                                    <span class="fw-semibold text-dark">${f.donorName || 'Registered Donor'}</span>
                                </div>
                                <div class="d-flex justify-content-between small text-muted mb-1">
                                    <span>${t('receiver.availableQty')}</span>
                                    <span class="fw-bold text-primary">${f.remainingQuantity != null ? f.remainingQuantity : f.quantity} ${f.unit}</span>
                                </div>
                                <div class="d-flex justify-content-between small text-muted mb-1">
                                    <span>${t('receiver.expires')}</span>
                                    <span class="text-danger fw-semibold">${formatDate(f.expiryDate)}</span>
                                </div>
                                <div class="d-flex justify-content-between small text-muted">
                                    <span>${t('receiver.pickup')}</span>
                                    <span class="text-truncate" style="max-width: 140px;">${f.pickupLocation || 'Main Kitchen'}</span>
                                </div>
                            </div>

                            <button class="btn btn-success w-100 fw-bold mt-auto" onclick="requestFoodItem(${f.id}, '${escapeQuote(f.foodName)}', ${f.remainingQuantity != null ? f.remainingQuantity : f.quantity}, '${f.unit}')">
                                <i class="fa-solid fa-hand-holding-heart me-1"></i>${t('receiver.requestFoodBtn')}
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `}
    `;
}

async function requestFoodItem(foodId, foodName, maxQty, unit = 'units') {
    const qtyStr = prompt(t('receiver.requestPrompt', [maxQty, unit]), maxQty);
    if (!qtyStr) return;

    const qty = parseFloat(qtyStr);
    if (isNaN(qty) || qty <= 0 || qty > maxQty) {
        showToast(t('toast.enterValidQty', [maxQty, unit]), 'warning');
        return;
    }

    try {
        const res = await apiFetch(`/api/requests/food/${foodId}`, {
            method: 'POST',
            body: JSON.stringify({
                requestedQuantity: qty,
                notes: 'Food rescue request submitted.'
            })
        });
        if (res) {
            showToast(t('toast.requestSubmitted'), 'success');
            loadMyRequests();
        }
    } catch (err) {
        showToast(t('toast.requestError', [err.message]), 'danger');
    }
}

// -------------------------------------------------------------
// 5. RECEIVER STATUS TRACKING STEPPER & ACTIONS (Features #12, #13, #21)
// -------------------------------------------------------------
async function loadMyRequests() {
    currentViewHandler = () => loadMyRequests();
    setPageTitle(t('receiver.myRequestsTitle'));
    const main = document.getElementById('mainContent');

    const requests = await apiFetch('/api/requests/my-requests');
    if (!requests) return;

    main.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <h5 class="fw-bold text-dark mb-1"><i class="fa-solid fa-heart-pulse text-success me-2"></i>${t('receiver.requestsCount', [requests.length])}</h5>
                <p class="text-muted small mb-0">${t('receiver.requestsSubtitle')}</p>
            </div>
            <button class="btn btn-success fw-bold" onclick="loadAvailableFood()"><i class="fa-solid fa-store me-1"></i>${t('receiver.browseFoodBtn')}</button>
        </div>

        ${requests.length === 0 ? `
            <div class="card border-0 shadow-sm rounded-4 p-5 text-center text-muted">
                <i class="fa-solid fa-hand-holding-heart fa-3x mb-3 text-success opacity-50"></i>
                <h5>${t('receiver.noRequests')}</h5>
                <p class="mb-3">${t('receiver.noRequestsSub')}</p>
                <div>
                    <button class="btn btn-success fw-bold" onclick="loadAvailableFood()"><i class="fa-solid fa-store me-1"></i>${t('receiver.browseFoodBtn')}</button>
                </div>
            </div>
        ` : `
            <div class="d-flex flex-column gap-3 mb-4">
                ${requests.map(r => `
                    <div class="card border-0 shadow-sm rounded-4 p-4">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <span class="badge bg-light text-success fw-bold me-2"><i class="fa-solid fa-hashtag me-1"></i>${r.foodCode || 'REQ'}</span>
                                <h5 class="fw-bold text-dark d-inline-block mb-0">${r.foodName}</h5>
                                <div class="text-muted small mt-1">${t('receiver.requestedQtyLabel', [r.requestedQuantity, r.unit || 'kg'])} &bull; ${t('th.requestedDate')}: ${formatDate(r.createdAt)}</div>
                            </div>
                            <div>${renderRequestStatusBadge(r.status)}</div>
                        </div>

                        <!-- Modern Visual Progress Stepper -->
                        <div class="my-3">
                            ${renderRequestStepper(r.status)}
                        </div>

                        <!-- Pickup & Allocation Details Banner -->
                        ${r.status === 'ALLOCATED' || r.status === 'READY_FOR_PICKUP' || r.status === 'PICKED_UP' || r.status === 'COMPLETED' ? `
                            <div class="bg-light rounded-3 p-3 mt-2 d-flex flex-wrap justify-content-between align-items-center">
                                <div class="small">
                                    <div class="text-muted"><i class="fa-solid fa-location-dot text-danger me-1"></i><strong>${t('receiver.pickupLoc')}</strong> ${r.pickupLocation || 'Main Dock'}</div>
                                    <div class="text-muted mt-1"><i class="fa-solid fa-calendar-check text-primary me-1"></i><strong>${t('receiver.pickupAt')}</strong> ${formatDate(r.pickupScheduledDate)}</div>
                                </div>
                                <div class="mt-2 mt-md-0">
                                    ${r.status === 'READY_FOR_PICKUP' ? `
                                        <button class="btn btn-primary btn-sm fw-bold" onclick="receiverMarkPickedUp(${r.id})">
                                            <i class="fa-solid fa-truck-pickup me-1"></i>${t('receiver.markPickedUpBtn')}
                                        </button>
                                    ` : r.status === 'PICKED_UP' ? `
                                        <button class="btn btn-success btn-sm fw-bold" onclick="receiverMarkCompleted(${r.id})">
                                            <i class="fa-solid fa-circle-check me-1"></i>${t('receiver.markCompletedBtn')}
                                        </button>
                                    ` : r.status === 'COMPLETED' ? `
                                        <span class="badge bg-success p-2"><i class="fa-solid fa-heart me-1"></i>${t('receiver.completedSuccess')}</span>
                                    ` : ''}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `}
    `;
}

function renderRequestStepper(status) {
    const steps = [
        { key: 'REQUESTED', label: t('receiver.stepRequested'), icon: 'fa-file-circle-plus' },
        { key: 'APPROVED', label: t('receiver.stepApproved'), icon: 'fa-thumbs-up' },
        { key: 'ALLOCATED', label: t('receiver.stepAllocated'), icon: 'fa-box-open' },
        { key: 'READY_FOR_PICKUP', label: t('receiver.stepReady'), icon: 'fa-bell' },
        { key: 'PICKED_UP', label: t('receiver.stepPickedUp'), icon: 'fa-truck-pickup' },
        { key: 'COMPLETED', label: t('receiver.stepCompleted'), icon: 'fa-circle-check' }
    ];

    if (status === 'REJECTED') {
        return `
            <div class="alert alert-danger mb-0 py-2 small d-flex align-items-center gap-2">
                <i class="fa-solid fa-circle-xmark fa-lg"></i>
                <span>${t('receiver.stepRejected')}</span>
            </div>
        `;
    }

    const stepOrder = ['PENDING', 'APPROVED', 'ALLOCATED', 'READY_FOR_PICKUP', 'PICKED_UP', 'COMPLETED'];
    let currentIdx = stepOrder.indexOf(status);
    if (currentIdx === -1) currentIdx = 0;

    return `
        <div class="stepper-wrapper">
            ${steps.map((step, idx) => {
        let isDone = idx < currentIdx;
        let isCurrent = idx === currentIdx;
        let stateClass = isDone ? 'completed' : isCurrent ? 'active' : 'pending';

        return `
                    <div class="stepper-item ${stateClass}">
                        <div class="step-counter"><i class="fa-solid ${step.icon}"></i></div>
                        <div class="step-name">${step.label}</div>
                    </div>
                `;
    }).join('')}
        </div>
    `;
}

async function receiverMarkPickedUp(requestId) {
    try {
        const res = await apiFetch(`/api/requests/${requestId}/pickup`, { method: 'PUT' });
        if (res) {
            showToast(t('toast.pickedUp'), 'success');
            loadMyRequests();
        }
    } catch (err) {
        showToast(err.message, 'danger');
    }
}

async function receiverMarkCompleted(requestId) {
    try {
        const res = await apiFetch(`/api/requests/${requestId}/complete`, { method: 'PUT' });
        if (res) {
            showToast(t('toast.completed'), 'success');
            loadMyRequests();
        }
    } catch (err) {
        showToast(err.message, 'danger');
    }
}

// -------------------------------------------------------------
// 6. ADMIN RECEIVER REQUESTS ALLOCATION (Features #11, #12, #21)
// -------------------------------------------------------------
async function loadFoodRequests() {
    currentViewHandler = () => loadFoodRequests();
    setPageTitle(t('admin.receiverReqTitle'));
    const main = document.getElementById('mainContent');

    const requests = await apiFetch('/api/requests');
    if (!requests) return;

    main.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <h5 class="fw-bold text-dark mb-1"><i class="fa-solid fa-hand-holding-heart text-success me-2"></i>${t('admin.receiverReqTitle')} (${requests.length})</h5>
                <p class="text-muted small mb-0">${t('admin.receiverReqSubtitle')}</p>
            </div>
        </div>

        ${requests.length === 0 ? `
            <div class="card border-0 shadow-sm rounded-4 p-5 text-center text-muted">
                <i class="fa-solid fa-inbox fa-3x mb-3 text-success opacity-50"></i>
                <h5>${t('admin.noReceiverReq')}</h5>
                <p class="mb-0">${t('admin.noReceiverReqSub')}</p>
            </div>
        ` : `
            <div class="card border-0 shadow-sm rounded-4 p-3 mb-4">
                <div class="table-responsive">
                    <table class="table table-hover table-custom align-middle">
                        <thead>
                            <tr>
                                <th>${t('th.code')}</th>
                                <th>${t('th.foodName')}</th>
                                <th>${t('th.receiver')}</th>
                                <th>${t('th.requestedQty')}</th>
                                <th>${t('th.status')}</th>
                                <th>${t('th.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${requests.map(r => `
                                <tr>
                                    <td class="fw-bold text-success">${r.foodCode || 'REQ'}</td>
                                    <td class="fw-bold">${r.foodName}</td>
                                    <td>
                                        <div class="fw-semibold text-dark">${r.receiverName}</div>
                                        <div class="extra-small text-muted">${r.receiverPhone || ''}</div>
                                    </td>
                                    <td>${r.requestedQuantity} ${r.unit || 'kg'}</td>
                                    <td>${renderRequestStatusBadge(r.status)}</td>
                                    <td>
                                        ${r.status === 'PENDING' ? `
                                            <div class="btn-group btn-group-sm">
                                                <button class="btn btn-success fw-bold" onclick="approveRequest(${r.id})">
                                                    <i class="fa-solid fa-check me-1"></i>${t('btn.approve')}
                                                </button>
                                                <button class="btn btn-outline-danger fw-bold" onclick="rejectRequest(${r.id})">
                                                    <i class="fa-solid fa-xmark me-1"></i>${t('btn.reject')}
                                                </button>
                                            </div>
                                        ` : r.status === 'APPROVED' ? `
                                            <button class="btn btn-primary btn-sm fw-bold" onclick="openAllocateReceiverModal(${r.id}, '${escapeQuote(r.foodName)}', '${escapeQuote(r.receiverName)}')">
                                                <i class="fa-solid fa-box-open me-1"></i>${t('btn.allocate')}
                                            </button>
                                        ` : r.status === 'ALLOCATED' ? `
                                            <button class="btn btn-warning btn-sm fw-bold text-dark" onclick="adminMarkReadyForPickup(${r.id})">
                                                <i class="fa-solid fa-bell me-1"></i>${t('btn.readyForPickup')}
                                            </button>
                                        ` : `
                                            <span class="text-muted small">${formatDate(r.createdAt)}</span>
                                        `}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `}
    `;
}

async function approveRequest(id) {
    try {
        const res = await apiFetch(`/api/requests/${id}/approve`, { method: 'PUT' });
        if (res) {
            showToast(t('toast.requestApproved'), 'success');
            loadFoodRequests();
        }
    } catch (err) {
        showToast(err.message, 'danger');
    }
}

function openAllocateReceiverModal(requestId, foodName, receiverName) {
    document.getElementById('allocRequestId').value = requestId;
    document.getElementById('allocInfo').value = `${foodName} -> ${receiverName}`;
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 12);
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
        const res = await apiFetch(`/api/requests/${requestId}/allocate`, {
            method: 'PUT',
            body: JSON.stringify({
                pickupLocation: location,
                scheduledDate: date
            })
        });
        if (res) {
            showToast(t('toast.requestAllocated'), 'success');
            bootstrap.Modal.getInstance(document.getElementById('allocateReceiverModal')).hide();
            loadFoodRequests();
        }
    } catch (err) {
        showToast(err.message, 'danger');
    }
}

async function adminMarkReadyForPickup(id) {
    try {
        const res = await apiFetch(`/api/requests/${id}/ready`, { method: 'PUT' });
        if (res) {
            showToast(t('toast.readyForPickup'), 'success');
            loadFoodRequests();
        }
    } catch (err) {
        showToast(err.message, 'danger');
    }
}

async function rejectRequest(id) {
    if (!confirm(t('toast.rejectConfirm'))) return;
    try {
        const res = await apiFetch(`/api/requests/${id}/reject`, { method: 'PUT' });
        if (res) {
            showToast(t('toast.requestRejected'), 'info');
            loadFoodRequests();
        }
    } catch (err) {
        showToast(err.message, 'danger');
    }
}

// -------------------------------------------------------------
// 7. ALL FOOD RECORDS & EXPIRED FOOD MANAGEMENT (Features #17, #18, #19, #20, #21)
// -------------------------------------------------------------
async function loadFoodRecords(filterStatus = 'ALL') {
    currentViewHandler = () => loadFoodRecords(filterStatus);
    setPageTitle(t('admin.foodRecordsTitle'));
    const main = document.getElementById('mainContent');

    const foods = await apiFetch('/api/foods');
    if (!foods) return;

    let filtered = foods;
    if (filterStatus !== 'ALL') {
        filtered = foods.filter(f => f.status === filterStatus);
    }

    main.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <h5 class="fw-bold text-dark mb-1"><i class="fa-solid fa-boxes-stacked text-success me-2"></i>${t('admin.foodRecordsTitle')} (${filtered.length})</h5>
                <p class="text-muted small mb-0">${t('admin.foodRecordsSubtitle')}</p>
            </div>
        </div>

        <!-- Filter Badges -->
        <div class="d-flex flex-wrap gap-2 mb-3">
            <button class="btn btn-sm ${filterStatus === 'ALL' ? 'btn-dark' : 'btn-outline-secondary'}" onclick="loadFoodRecords('ALL')">${t('admin.filterAll', [foods.length])}</button>
            <button class="btn btn-sm ${filterStatus === 'AVAILABLE' ? 'btn-success' : 'btn-outline-success'}" onclick="loadFoodRecords('AVAILABLE')">${t('admin.filterAvailable', [foods.filter(f => f.status === 'AVAILABLE').length])}</button>
            <button class="btn btn-sm ${filterStatus === 'REQUESTED' ? 'btn-primary' : 'btn-outline-primary'}" onclick="loadFoodRecords('REQUESTED')">${t('admin.filterRequested', [foods.filter(f => f.status === 'REQUESTED').length])}</button>
            <button class="btn btn-sm ${filterStatus === 'ALLOCATED' ? 'btn-info text-white' : 'btn-outline-info'}" onclick="loadFoodRecords('ALLOCATED')">${t('admin.filterAllocated', [foods.filter(f => f.status === 'ALLOCATED').length])}</button>
            <button class="btn btn-sm ${filterStatus === 'DISTRIBUTED' ? 'btn-success' : 'btn-outline-success'}" onclick="loadFoodRecords('DISTRIBUTED')">${t('admin.filterDistributed', [foods.filter(f => f.status === 'DISTRIBUTED').length])}</button>
            <button class="btn btn-sm ${filterStatus === 'EXPIRED' ? 'btn-danger' : 'btn-outline-danger'}" onclick="loadFoodRecords('EXPIRED')">${t('admin.filterExpired', [foods.filter(f => f.status === 'EXPIRED').length])}</button>
            <button class="btn btn-sm ${filterStatus === 'SENT_TO_FARMER' ? 'btn-warning text-dark' : 'btn-outline-warning'}" onclick="loadFoodRecords('SENT_TO_FARMER')">${t('admin.filterFarmer', [foods.filter(f => f.status === 'SENT_TO_FARMER').length])}</button>
        </div>

        ${renderFoodTableHtml(filtered, true)}
    `;
}

function renderFoodTableHtml(foods, isAdmin = false) {
    if (!foods || foods.length === 0) {
        return `
            <div class="card border-0 shadow-sm rounded-4 p-5 text-center text-muted">
                <i class="fa-solid fa-box-open fa-3x mb-3 text-muted opacity-50"></i>
                <h5>No food records match the selected filter</h5>
            </div>
        `;
    }

    return `
        <div class="card border-0 shadow-sm rounded-4 p-3 mb-4">
            <div class="table-responsive">
                <table class="table table-hover table-custom align-middle">
                    <thead>
                        <tr>
                            <th>${t('th.code')}</th>
                            <th>${t('th.foodName')}</th>
                            <th>${t('th.donor')}</th>
                            <th>${t('th.category')}</th>
                            <th>${t('th.quantity')}</th>
                            <th>${t('th.remaining')}</th>
                            <th>${t('th.expiryDate')}</th>
                            <th>${t('th.status')}</th>
                            <th>${t('th.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${foods.map(f => `
                            <tr>
                                <td class="fw-bold text-success">${f.foodCode}</td>
                                <td class="fw-bold">${f.foodName}</td>
                                <td>${f.donorName || 'Donor'}</td>
                                <td><span class="badge bg-light text-dark">${formatCategory(f.category)}</span></td>
                                <td>${f.quantity} ${f.unit}</td>
                                <td class="fw-bold text-primary">${f.remainingQuantity != null ? f.remainingQuantity : f.quantity} ${f.unit}</td>
                                <td>${formatDate(f.expiryDate)}</td>
                                <td>${renderStatusBadge(f.status)}</td>
                                <td>
                                    <div class="d-flex align-items-center gap-1">
                                        <button class="btn btn-outline-dark btn-sm fw-semibold" onclick="viewFoodHistory(${f.id})" title="${t('btn.viewHistory')}">
                                            <i class="fa-solid fa-clock-rotate-left"></i>
                                        </button>
                                        ${isAdmin && f.status === 'EXPIRED' ? `
                                            <button class="btn btn-warning btn-sm fw-bold text-dark" onclick="openSendToFarmerModal(${f.id}, '${escapeQuote(f.foodName)}', '${escapeQuote(f.pickupLocation)}')">
                                                <i class="fa-solid fa-tractor me-1"></i>${t('admin.sendToFarmerBtn')}
                                            </button>
                                        ` : ''}
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Expired Food Management View (Feature #2, #18)
async function loadExpiredFood() {
    currentViewHandler = () => loadExpiredFood();
    setPageTitle(t('admin.expiredMgmtTitle'));
    const main = document.getElementById('mainContent');

    const foods = await apiFetch('/api/foods/expired');
    if (!foods) return;

    main.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <h5 class="fw-bold text-dark mb-1"><i class="fa-solid fa-triangle-exclamation text-danger me-2"></i>${t('admin.expiredMgmtTitle')} (${foods.length})</h5>
                <p class="text-muted small mb-0">${t('admin.expiredMgmtSubtitle')}</p>
            </div>
        </div>

        <div class="alert alert-danger border-0 shadow-sm rounded-4 mb-4 d-flex align-items-center gap-3">
            <i class="fa-solid fa-ban fa-2x text-danger"></i>
            <div>
                <h6 class="fw-bold mb-1">${t('admin.safetyRuleBanner')}</h6>
                <p class="mb-0 small text-muted">${t('admin.expiredMgmtSubtitle')}</p>
            </div>
        </div>

        ${foods.length === 0 ? `
            <div class="card border-0 shadow-sm rounded-4 p-5 text-center text-muted">
                <i class="fa-solid fa-shield-check fa-3x mb-3 text-success opacity-50"></i>
                <h5>${t('admin.noExpiredAdmin')}</h5>
                <p class="mb-0">${t('admin.noExpiredAdminSub')}</p>
            </div>
        ` : `
            <div class="card border-0 shadow-sm rounded-4 p-3 mb-4">
                <div class="table-responsive">
                    <table class="table table-hover table-custom align-middle">
                        <thead>
                            <tr>
                                <th>${t('th.code')}</th>
                                <th>${t('th.foodName')}</th>
                                <th>${t('th.donor')}</th>
                                <th>${t('th.quantity')}</th>
                                <th>${t('th.expiryDate')}</th>
                                <th>${t('th.status')}</th>
                                <th>${t('th.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${foods.map(f => `
                                <tr>
                                    <td class="fw-bold text-success">${f.foodCode}</td>
                                    <td class="fw-bold text-danger">${f.foodName}</td>
                                    <td>${f.donorName || 'Donor'}</td>
                                    <td>${f.remainingQuantity != null ? f.remainingQuantity : f.quantity} ${f.unit}</td>
                                    <td class="text-danger fw-semibold">${formatDate(f.expiryDate)}</td>
                                    <td>${renderStatusBadge(f.status)}</td>
                                    <td>
                                        <div class="d-flex align-items-center gap-1">
                                            <button class="btn btn-outline-dark btn-sm fw-semibold" onclick="viewFoodHistory(${f.id})" title="${t('btn.viewHistory')}">
                                                <i class="fa-solid fa-clock-rotate-left"></i>
                                            </button>
                                            ${f.status === 'EXPIRED' ? `
                                                <button class="btn btn-warning btn-sm fw-bold text-dark" onclick="openSendToFarmerModal(${f.id}, '${escapeQuote(f.foodName)}', '${escapeQuote(f.pickupLocation)}')">
                                                    <i class="fa-solid fa-tractor me-1"></i>${t('admin.sendToFarmerBtn')}
                                                </button>
                                            ` : f.status === 'SENT_TO_FARMER' ? `
                                                <span class="badge bg-warning text-dark">${t('admin.alreadySentFarmer')}</span>
                                            ` : ''}
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `}
    `;
}

// Open Send to Farmer Modal (Admin Feature #2, #18)
async function openSendToFarmerModal(foodId, foodName, pickupLoc) {
    document.getElementById('farmerFoodId').value = foodId;
    document.getElementById('farmerFoodName').value = foodName;
    document.getElementById('farmerPickupLocation').value = pickupLoc || 'Main Rear Dock';

    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 12);
    document.getElementById('farmerPickupDate').value = tomorrow.toISOString().slice(0, 16);

    const farmerSelect = document.getElementById('farmerSelect');
    farmerSelect.innerHTML = `<option value="">${t('modal.loadingFarmers')}</option>`;

    const modal = new bootstrap.Modal(document.getElementById('sendToFarmerModal'));
    modal.show();

    const farmers = await apiFetch('/api/users/farmers');
    if (farmers && farmers.length > 0) {
        farmerSelect.innerHTML = farmers.map(f => {
            const u = f.user || {};
            return `<option value="${u.id}">${f.farmName || u.fullName} (${f.farmLocation || 'Farm'})</option>`;
        }).join('');
    } else {
        farmerSelect.innerHTML = `<option value="">No registered farmers found</option>`;
    }
}

async function handleSendToFarmerSubmit(e) {
    e.preventDefault();
    const foodId = document.getElementById('farmerFoodId').value;
    const farmerId = document.getElementById('farmerSelect').value;
    const loc = document.getElementById('farmerPickupLocation').value;
    const date = document.getElementById('farmerPickupDate').value;
    const notes = document.getElementById('farmerNotes').value;

    if (!farmerId) {
        showToast(t('toast.fillAllFields'), 'warning');
        return;
    }

    try {
        const res = await apiFetch(`/api/foods/${foodId}/send-to-farmer`, {
            method: 'PUT',
            body: JSON.stringify({
                farmerId: parseInt(farmerId),
                pickupLocation: loc,
                pickupDate: date,
                notes: notes
            })
        });
        if (res) {
            showToast(t('toast.sentToFarmerSuccess'), 'success');
            bootstrap.Modal.getInstance(document.getElementById('sendToFarmerModal')).hide();
            loadExpiredFood();
        }
    } catch (err) {
        showToast(err.message, 'danger');
    }
}

// -------------------------------------------------------------
// 8. FOOD LIFECYCLE AUDIT TRAIL MODAL & FULL HISTORY (Feature #20, #21)
// -------------------------------------------------------------
async function viewFoodHistory(foodId) {
    const history = await apiFetch(`/api/foods/${foodId}/history`);
    if (!history) return;

    const modalContent = document.getElementById('historyModalContent');

    if (history.length === 0) {
        modalContent.innerHTML = `<div class="text-center text-muted py-4"><p class="mb-0">${t('modal.noHistoryFood')}</p></div>`;
    } else {
        const first = history[0];
        modalContent.innerHTML = `
            <div class="mb-3 bg-light rounded-3 p-3">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="fw-bold mb-1">${t('modal.foodItemHistory')} <span class="text-success">${first.foodName}</span></h6>
                        <span class="small text-muted">${t('modal.code')} ${first.foodCode}</span>
                    </div>
                    <div>
                        <span class="small text-muted me-1">${t('modal.currentStatus')}</span>
                        ${renderStatusBadge(history[history.length - 1].newStatus)}
                    </div>
                </div>
            </div>

            <div class="timeline">
                ${history.map((h, i) => `
                    <div class="timeline-item pb-3 mb-3 border-bottom position-relative ps-4">
                        <div class="position-absolute start-0 top-0 mt-1">
                            <span class="badge rounded-circle bg-success p-2">&bull;</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="fw-bold text-dark">${h.action}</span>
                            <span class="extra-small text-muted" style="font-size:0.75rem;">${formatDate(h.timestamp)}</span>
                        </div>
                        <div class="d-flex align-items-center gap-2 mt-1 mb-1">
                            <span class="small text-muted">${h.previousStatus ? renderStatusBadge(h.previousStatus) : '<span class="badge bg-light text-dark">NONE</span>'}</span>
                            <i class="fa-solid fa-arrow-right extra-small text-muted"></i>
                            <span class="small">${renderStatusBadge(h.newStatus)}</span>
                        </div>
                        <div class="extra-small text-muted" style="font-size:0.8rem;">
                            <i class="fa-solid fa-user-gear me-1"></i>${h.performedBy || 'System'} ${h.performedByRole ? `<span class="badge bg-light text-dark">${formatRole('ROLE_' + h.performedByRole) || h.performedByRole}</span>` : ''}
                        </div>
                        ${h.remarks ? `<div class="small text-muted mt-1 bg-white p-2 rounded border">${h.remarks}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    const modal = new bootstrap.Modal(document.getElementById('historyModal'));
    modal.show();
}

async function loadAllHistory() {
    currentViewHandler = () => loadAllHistory();
    setPageTitle(t('admin.allHistoryTitle'));
    const main = document.getElementById('mainContent');

    const history = await apiFetch('/api/foods/history/all');
    if (!history) return;

    main.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <h5 class="fw-bold text-dark mb-1"><i class="fa-solid fa-clock-rotate-left text-success me-2"></i>${t('admin.allHistoryTitle')} (${history.length})</h5>
                <p class="text-muted small mb-0">${t('admin.allHistorySubtitle')}</p>
            </div>
        </div>

        <div class="card border-0 shadow-sm rounded-4 p-3 mb-4">
            <div class="table-responsive">
                <table class="table table-hover table-custom align-middle">
                    <thead>
                        <tr>
                            <th>${t('th.code')}</th>
                            <th>${t('th.foodName')}</th>
                            <th>${t('th.action')}</th>
                            <th>${t('th.prevStatus')}</th>
                            <th>${t('th.newStatus')}</th>
                            <th>${t('th.performedBy')}</th>
                            <th>${t('th.timestamp')}</th>
                            <th>${t('th.remarks')}</th>
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
                                <td>${h.performedBy || 'System'} ${h.performedByRole ? `<span class="badge bg-light text-dark ms-1">${formatRole('ROLE_' + h.performedByRole) || h.performedByRole}</span>` : ''}</td>
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
                    <span class="fw-bold">${t('nav.notifications')} (${list.length})</span>
                    <button class="btn btn-link btn-sm p-0 text-decoration-none text-success small" onclick="markAllNotificationsAsRead()">${t('nav.markAllRead')}</button>
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
                    <span class="fw-bold">${t('nav.notifications')}</span>
                </li>
                <li class="text-muted small text-center py-3">${t('nav.noNotifications')}</li>
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
    } catch (e) { }
}

async function markAllNotificationsAsRead() {
    try {
        await apiFetch('/api/notifications/read-all', { method: 'PUT' });
        showToast(t('toast.allNotifRead'), 'success');
        loadNotifications();
    } catch (e) {
        showToast(t('toast.notifReadFail'), 'danger');
    }
}

// -------------------------------------------------------------
// 10. USER DIRECTORY & REPORTS
// -------------------------------------------------------------
async function loadDonors() {
    currentViewHandler = () => loadDonors();
    setPageTitle(t('admin.donorsTitle'));
    const list = await apiFetch('/api/users/donors');
    renderUserList(t('sidebar.registeredDonors'), list, [t('th.org'), t('th.fullName'), t('th.email'), t('th.phone'), t('th.address')]);
}

async function loadReceivers() {
    currentViewHandler = () => loadReceivers();
    setPageTitle(t('admin.receiversTitle'));
    const list = await apiFetch('/api/users/receivers');
    renderUserList(t('sidebar.registeredReceivers'), list, [t('th.institution'), t('th.reqFood'), t('th.fullName'), t('th.email'), t('th.phone')]);
}

async function loadFarmers() {
    currentViewHandler = () => loadFarmers();
    setPageTitle(t('admin.farmersTitle'));
    const list = await apiFetch('/api/users/farmers');
    renderUserList(t('sidebar.registeredFarmers'), list, [t('th.farmName'), t('th.location'), t('th.capacity'), t('th.fullName'), t('th.phone')]);
}

function renderUserList(title, list, headers) {
    const main = document.getElementById('mainContent');
    if (!list) return;

    main.innerHTML = `
        <div class="card border-0 shadow-sm rounded-4 p-3 mb-4">
            <h5 class="fw-bold text-dark mb-3"><i class="fa-solid fa-users text-success me-2"></i>${title} (${list.length})</h5>
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
    currentViewHandler = () => loadReports();
    setPageTitle(t('admin.reportsTitle'));
    const main = document.getElementById('mainContent');

    const report = await apiFetch('/api/reports/monthly');
    if (!report) return;

    main.innerHTML = `
        <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 class="fw-bold text-dark mb-1">${t('admin.monthlyReport')}</h4>
                    <span class="badge bg-success">${report.reportPeriod}</span>
                </div>
                <a href="/api/reports/csv${authToken ? '?token=' + encodeURIComponent(authToken) : ''}" class="btn btn-outline-success fw-bold" target="_blank">
                    <i class="fa-solid fa-file-csv me-1"></i> ${t('admin.exportCsv')}
                </a>
            </div>

            <div class="row g-3 mb-4">
                <div class="col-md-3">
                    <div class="stat-card">
                        <span class="stat-label">${t('admin.totalDonated')}</span>
                        <div class="stat-number text-success">${report.totalDonatedKg} kg</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card">
                        <span class="stat-label">${t('admin.totalDistributed')}</span>
                        <div class="stat-number text-primary">${report.totalDistributedKg} kg</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card">
                        <span class="stat-label">${t('admin.sentToFarmers')}</span>
                        <div class="stat-number text-warning">${report.totalSentToFarmersKg} kg</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card bg-success text-white">
                        <span class="stat-label text-white-50">${t('admin.wasteReduction')}</span>
                        <div class="stat-number text-white">${report.wasteReductionPercentage}%</div>
                        <div class="small">${t('admin.foodSavedFromLandfill', [report.totalSavedKg])}</div>
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
    const locale = getCurrentLanguage() === 'ta' ? 'ta-IN' : 'en-US';
    return d.toLocaleString(locale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function renderStatusBadge(status) {
    const text = t('status.' + status) || status || 'N/A';
    switch (status) {
        case 'AVAILABLE': return `<span class="badge badge-available">${text}</span>`;
        case 'REQUESTED': return `<span class="badge badge-requested">${text}</span>`;
        case 'APPROVED': return `<span class="badge badge-approved">${text}</span>`;
        case 'ALLOCATED': return `<span class="badge badge-allocated">${text}</span>`;
        case 'READY_FOR_PICKUP': return `<span class="badge badge-ready-pickup">${text}</span>`;
        case 'PICKED_UP': return `<span class="badge badge-picked-up">${text}</span>`;
        case 'DISTRIBUTED': return `<span class="badge badge-distributed">${text}</span>`;
        case 'EXPIRED': return `<span class="badge badge-expired">${text}</span>`;
        case 'SENT_TO_FARMER': return `<span class="badge badge-farmer">${text}</span>`;
        case 'COMPLETED': return `<span class="badge badge-completed">${text}</span>`;
        case 'REMOVED': return `<span class="badge badge-removed">${text}</span>`;
        case 'REJECTED': return `<span class="badge badge-rejected">${text}</span>`;
        default: return `<span class="badge bg-secondary">${text}</span>`;
    }
}

function renderRequestStatusBadge(status) {
    const text = t('status.' + status) || status || 'N/A';
    switch (status) {
        case 'PENDING': return `<span class="badge bg-warning text-dark"><i class="fa-solid fa-clock me-1"></i>${text}</span>`;
        case 'APPROVED': return `<span class="badge bg-success"><i class="fa-solid fa-check me-1"></i>${text}</span>`;
        case 'ALLOCATED': return `<span class="badge bg-info text-dark"><i class="fa-solid fa-box-open me-1"></i>${text}</span>`;
        case 'READY_FOR_PICKUP': return `<span class="badge badge-ready-pickup"><i class="fa-solid fa-bell me-1"></i>${text}</span>`;
        case 'PICKED_UP': return `<span class="badge badge-picked-up"><i class="fa-solid fa-truck-pickup me-1"></i>${text}</span>`;
        case 'COMPLETED': return `<span class="badge bg-success"><i class="fa-solid fa-circle-check me-1"></i>${text}</span>`;
        case 'REJECTED': return `<span class="badge bg-danger"><i class="fa-solid fa-xmark me-1"></i>${text}</span>`;
        default: return `<span class="badge bg-secondary">${text}</span>`;
    }
}

function renderFarmerStatusBadge(status) {
    const text = t('status.' + status) || status || 'N/A';
    switch (status) {
        case 'PENDING': return `<span class="badge bg-warning text-dark"><i class="fa-solid fa-clock me-1"></i>${text}</span>`;
        case 'APPROVED': return `<span class="badge bg-success"><i class="fa-solid fa-check me-1"></i>${text}</span>`;
        case 'ACCEPTED': return `<span class="badge bg-success"><i class="fa-solid fa-check me-1"></i>${text}</span>`;
        case 'ASSIGNED': return `<span class="badge bg-info text-dark"><i class="fa-solid fa-tractor me-1"></i>${text}</span>`;
        case 'COLLECTED': return `<span class="badge badge-picked-up"><i class="fa-solid fa-truck-pickup me-1"></i>${text}</span>`;
        case 'COMPLETED': return `<span class="badge bg-dark"><i class="fa-solid fa-circle-check me-1"></i>${text}</span>`;
        case 'REJECTED': return `<span class="badge bg-danger"><i class="fa-solid fa-xmark me-1"></i>${text}</span>`;
        default: return `<span class="badge bg-secondary">${text}</span>`;
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
