// ============================================
// CONFIGURATION
// js/config.js
// ============================================

// API Configuration
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzLh-Z6trPUdNIqkE-gYqhb74voXIuQkHbv9hhWV0fTUYLUkeFWrQdWHZfTckpv4L-k/exec';
const SPREADSHEET_ID = '1DKSvHw4PNHB3MXjd-j2p2cHdAh6EjmKpKE1SFfC39xQ';
const API_KEY = 'AIzaSyCl1Yt4XhgEJPgmCb-FxwO0fHI5h8-LU6Q';

// Date Filter Options
const DATE_FILTERS = {
    TODAY: 'today',
    LAST_7_DAYS: '7days',
    LAST_30_DAYS: '30days',
    CUSTOM: 'custom'
};

// Status Values
const ORDER_STATUS = {
    PENDING_APPROVAL: 'Pending Approval',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    TRUCK_ASSIGNED: 'Truck Assigned',
    IN_WAREHOUSE: 'In Warehouse',
    LOADING: 'Loading',
    LEFT_WAREHOUSE: 'Left Warehouse',
    DELIVERED: 'Delivered',
    DISPUTED: 'Disputed',
    RESOLVED: 'Resolved'
};

// Department Names
const DEPARTMENTS = {
    MANAGEMENT: 'Management',
    SALES: 'Sales',
    FINANCE: 'Finance',
    TRANSPORT: 'Transport',
    WAREHOUSE: 'Warehouse'
};

// Status Colors
const STATUS_COLORS = {
    'Pending Approval': 'status-pending',
    'Approved': 'status-approved',
    'Rejected': 'status-rejected',
    'Truck Assigned': 'status-transport',
    'In Warehouse': 'status-warehouse',
    'Loading': 'status-loading',
    'Left Warehouse': 'status-transit',
    'Delivered': 'status-delivered',
    'Disputed': 'status-disputed',
    'Resolved': 'status-resolved'
};

// Document Types
const DOCUMENT_TYPES = {
    ISPRATNICA: 'Ispratnica',
    CMR: 'CMR',
    POD: 'POD',
    INVOICE: 'Invoice',
    PROFORMA: 'Proforma',
    CONTRACT: 'Contract',
    OTHER: 'Other'
};

// Measurement Methods
const MEASUREMENT_METHODS = {
    PROTOMETER: 'Protometer',
    SCALE: 'Scale'
};

// Resolution Levels
const RESOLUTION_LEVELS = {
    UNDER_50: '<50L',
    UNDER_100: '<100L',
    OVER_100: '>100L'
};

// User Permissions
const PERMISSIONS = {
    SEE_MARGIN: [DEPARTMENTS.MANAGEMENT, DEPARTMENTS.SALES, DEPARTMENTS.FINANCE],
    APPROVE_ORDERS: [DEPARTMENTS.MANAGEMENT],
    REJECT_ORDERS: [DEPARTMENTS.MANAGEMENT],
    CREATE_ORDERS: [DEPARTMENTS.SALES],
    ASSIGN_TRANSPORT: [DEPARTMENTS.TRANSPORT],
    MARK_DELIVERED: [DEPARTMENTS.TRANSPORT],
    REPORT_DISPUTE: [DEPARTMENTS.TRANSPORT],
    RESOLVE_DISPUTE: [DEPARTMENTS.MANAGEMENT],
    ENTER_PROFORMA: [DEPARTMENTS.FINANCE],
    ENTER_INVOICE: [DEPARTMENTS.FINANCE],
    UPDATE_WAREHOUSE_STATUS: [DEPARTMENTS.WAREHOUSE],
    UPLOAD_DOCUMENTS: [DEPARTMENTS.TRANSPORT, DEPARTMENTS.WAREHOUSE]
};

// Export for use in other files
window.CONFIG = {
    APPS_SCRIPT_URL,
    SPREADSHEET_ID,
    API_KEY,
    DATE_FILTERS,
    ORDER_STATUS,
    DEPARTMENTS,
    STATUS_COLORS,
    DOCUMENT_TYPES,
    MEASUREMENT_METHODS,
    RESOLUTION_LEVELS,
    PERMISSIONS
};

console.log('✅ Configuration loaded');
