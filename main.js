// ============================================
// MAIN APPLICATION INITIALIZATION
// js/main.js
// ============================================

/**
 * Initialize the application after login
 */
async function initializeSystem() {
    try {
        console.log('🚀 Initializing Gulf Order Management System...');
        
        // Load all data from Google Sheets
        await window.loadData();
        console.log('✅ Data loaded');
        
        // Render tab navigation for current user's department
        window.renderTabNavigation();
        console.log('✅ Tab navigation rendered');
        
        // Update badge counts
        window.updateBadgeDisplays();
        console.log('✅ Badge displays updated');
        
        // Start auto-refresh (2-minute intervals)
        window.startAutoRefresh();
        console.log('✅ Auto-refresh started');
        
        // Load default view based on department
        loadDefaultView();
        console.log('✅ Default view loaded');
        
        console.log('🎉 System initialized successfully!');
        
    } catch (error) {
        console.error('❌ Error initializing system:', error);
        alert('Error initializing system. Please refresh the page.');
    }
}

/**
 * Load default view based on user's department
 */
function loadDefaultView() {
    const department = window.currentUser.department;
    
    switch (department) {
        case window.CONFIG.DEPARTMENTS.MANAGEMENT:
            window.switchTab('pendingApproval');
            break;
            
        case window.CONFIG.DEPARTMENTS.SALES:
            window.switchTab('myOrders');
            break;
            
        case window.CONFIG.DEPARTMENTS.FINANCE:
            window.switchTab('needsDocs');
            break;
            
        case window.CONFIG.DEPARTMENTS.TRANSPORT:
            window.switchTab('forAssigning');
            break;
            
        case window.CONFIG.DEPARTMENTS.WAREHOUSE:
            window.switchTab('needsProcessing');
            break;
            
        default:
            console.error('Unknown department:', department);
            window.switchTab('pendingApproval');
    }
}

/**
 * Handle successful login
 */
async function onLoginSuccess(user) {
    window.currentUser = user;
    
    // Hide login screen
    document.getElementById('loginScreen').style.display = 'none';
    
    // Show dashboard
    document.getElementById('dashboardScreen').style.display = 'block';
    
    // Update user info display
    updateUserInfoDisplay();
    
    // Initialize system
    await initializeSystem();
}

/**
 * Update user info display in header
 */
function updateUserInfoDisplay() {
    const userInfoElement = document.getElementById('userInfo');
    
    userInfoElement.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem;">
            <span style="color: white;">
                👤 ${window.currentUser.name} (${window.currentUser.department})
            </span>
            <button class="btn btn-secondary" onclick="logout()" style="padding: 0.5rem 1rem;">
                Logout
            </button>
        </div>
    `;
}

/**
 * Handle logout
 */
function logout() {
    if (!confirm('Are you sure you want to logout?')) {
        return;
    }
    
    // Stop auto-refresh
    window.stopAutoRefresh();
    
    // Clear user data
    window.currentUser = null;
    window.ordersData = [];
    window.clientsData = [];
    window.driversData = [];
    window.transportCompaniesData = [];
    
    // Hide dashboard
    document.getElementById('dashboardScreen').style.display = 'none';
    
    // Show login screen
    document.getElementById('loginScreen').style.display = 'block';
    
    console.log('👋 Logged out successfully');
}

/**
 * Check if user has permission
 */
function hasPermission(permissionType) {
    if (!window.currentUser) return false;
    
    const allowedDepartments = window.CONFIG.PERMISSIONS[permissionType];
    return allowedDepartments && allowedDepartments.includes(window.currentUser.department);
}

/**
 * Check if current user can see margin
 */
function canSeeMargin() {
    return hasPermission('SEE_MARGIN');
}

/**
 * Global error handler
 */
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    
    // Log to console but don't show alert for every error
    // Only critical errors should show alerts
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
});

/**
 * Check for updates periodically
 * This can be used to show notification if data structure changes
 */
function checkForUpdates() {
    // Check if CONFIG version has changed
    const currentVersion = localStorage.getItem('systemVersion');
    const latestVersion = '2.0.0'; // Update this when you make breaking changes
    
    if (currentVersion !== latestVersion) {
        console.log('🔄 System updated to version ' + latestVersion);
        localStorage.setItem('systemVersion', latestVersion);
        
        // Could show a notification here
        if (currentVersion) {
            console.log('⚠️ Please refresh if you experience any issues');
        }
    }
}

/**
 * Performance monitoring (optional)
 */
function logPerformance() {
    if (window.performance) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log('📊 Page load time:', pageLoadTime + 'ms');
    }
}

// Run initialization when page loads
window.addEventListener('load', function() {
    console.log('🌐 Page loaded');
    
    // Check for updates
    checkForUpdates();
    
    // Log performance
    logPerformance();
    
    // Show login screen initially
    document.getElementById('loginScreen').style.display = 'block';
    document.getElementById('dashboardScreen').style.display = 'none';
    
    console.log('✅ Ready for login');
});

// Export main functions to window
window.mainApp = {
    initializeSystem,
    onLoginSuccess,
    logout,
    hasPermission,
    canSeeMargin
};

console.log('✅ Main application loaded');
