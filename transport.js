// ============================================
// TRANSPORT DEPARTMENT VIEWS
// js/views/transport.js
// ============================================

/**
 * Load For Assigning tab (Transport)
 * Shows approved orders waiting for driver assignment
 */
function loadForAssigning() {
    let orders = window.ordersData.filter(o => 
        o.status === window.CONFIG.ORDER_STATUS.APPROVED && !o.driverName
    );
    orders = window.filterOrdersByDate(orders);
    
    const container = document.getElementById('tabContent');
    
    if (orders.length === 0) {
        container.innerHTML = `
            <p style="text-align:center; padding: 2rem; color: #6B7280;">
                No orders waiting for driver assignment
            </p>
        `;
        return;
    }
    
    let html = `
        <h2 style="color: var(--primary); margin-bottom: 1rem;">
            🚛 Orders Waiting for Driver Assignment (${orders.length})
        </h2>
    `;
    
    orders.forEach(order => {
        html += window.renderOrderCard(order, {
            showMargin: false, // Transport can't see margin
            buttons: [
                {
                    label: '🚛 Assign Driver & Truck',
                    class: 'btn-primary',
                    onClick: `showTransportAssignmentForm('${order.orderID}')`
                },
                {
                    label: 'View Details',
                    class: 'btn-secondary',
                    onClick: `viewOrderDetails('${order.orderID}')`
                }
            ]
        });
    });
    
    container.innerHTML = html;
}

/**
 * Load Assigned Orders tab (Transport)
 * Shows orders in progress (Truck Assigned → Left Warehouse)
 */
function loadAssignedOrders() {
    let orders = window.ordersData.filter(o => 
        o.driverName && (
            o.status === window.CONFIG.ORDER_STATUS.TRUCK_ASSIGNED ||
            o.status === window.CONFIG.ORDER_STATUS.IN_WAREHOUSE ||
            o.status === window.CONFIG.ORDER_STATUS.LOADING ||
            o.status === window.CONFIG.ORDER_STATUS.LEFT_WAREHOUSE
        )
    );
    orders = window.filterOrdersByDate(orders);
    
    const container = document.getElementById('tabContent');
    
    if (orders.length === 0) {
        container.innerHTML = `
            <p style="text-align:center; padding: 2rem; color: #6B7280;">
                No orders currently in progress
            </p>
        `;
        return;
    }
    
    let html = `
        <h2 style="color: #059669; margin-bottom: 1rem;">
            🚚 Orders In Progress (${orders.length})
        </h2>
    `;
    
    orders.forEach(order => {
        const canMarkDelivered = order.status === window.CONFIG.ORDER_STATUS.LEFT_WAREHOUSE;
        
        const buttons = [
            {
                label: 'View Details',
                class: 'btn-secondary',
                onClick: `viewOrderDetails('${order.orderID}')`
            }
        ];
        
        if (canMarkDelivered) {
            buttons.unshift(
                {
                    label: '✅ Mark as Delivered',
                    class: 'btn-success',
                    onClick: `markAsDelivered('${order.orderID}')`
                },
                {
                    label: '⚠️ Report Dispute',
                    class: 'btn-warning',
                    onClick: `showDisputeForm('${order.orderID}', '${order.quantity}', '${order.clientName}')`
                }
            );
        }
        
        html += window.renderOrderCard(order, {
            showMargin: false,
            showDriver: true,
            buttons: buttons,
            borderColor: '#059669'
        });
    });
    
    container.innerHTML = html;
}

/**
 * Load Transport Disputed tab
 * Shows disputed orders awaiting Management resolution
 */
function loadTransportDisputed() {
    let orders = window.ordersData.filter(o => 
        o.status === window.CONFIG.ORDER_STATUS.DISPUTED && o.driverName
    );
    orders = window.filterOrdersByDate(orders);
    
    const container = document.getElementById('tabContent');
    
    if (orders.length === 0) {
        container.innerHTML = `
            <p style="text-align:center; padding: 2rem; color: #6B7280;">
                No disputed orders
            </p>
        `;
        return;
    }
    
    let html = `
        <h2 style="color: #F59E0B; margin-bottom: 1rem;">
            ⚠️ Disputed Orders (${orders.length}) - Awaiting Management Resolution
        </h2>
    `;
    
    orders.forEach(order => {
        html += window.renderDisputeCard(order, {
            showResolutionButton: false // Only Management can resolve
        });
    });
    
    container.innerHTML = html;
}

/**
 * Load Transport Finished tab
 * Shows completed deliveries (Delivered + Resolved)
 */
function loadTransportFinished() {
    let orders = window.ordersData.filter(o => 
        o.driverName && (
            o.status === window.CONFIG.ORDER_STATUS.DELIVERED || 
            o.status === window.CONFIG.ORDER_STATUS.RESOLVED
        )
    );
    orders = window.filterOrdersByDate(orders);
    
    const container = document.getElementById('tabContent');
    
    if (orders.length === 0) {
        container.innerHTML = `
            <p style="text-align:center; padding: 2rem; color: #6B7280;">
                No finished orders
            </p>
        `;
        return;
    }
    
    let html = `
        <h2 style="color: #6B7280; margin-bottom: 1rem;">
            🏁 Completed Deliveries (${orders.length})
        </h2>
    `;
    
    orders.forEach(order => {
        html += window.renderOrderCard(order, {
            showMargin: false,
            showDriver: true,
            showResolutionInfo: order.status === window.CONFIG.ORDER_STATUS.RESOLVED,
            background: '#F9FAFB',
            buttons: [
                {
                    label: 'View Details',
                    class: 'btn-secondary',
                    onClick: `viewOrderDetails('${order.orderID}')`
                }
            ]
        });
    });
    
    container.innerHTML = html;
}

/**
 * Show transport assignment form
 */
function showTransportAssignmentForm(orderID) {
    window.openModal('Assign Driver & Truck', `
        <form id="transportAssignmentForm">
            <input type="hidden" id="assignOrderID" value="${orderID}">
            
            <div class="form-group">
                <label>Driver Name *</label>
                <select id="driverName" required>
                    <option value="">Select driver...</option>
                    <!-- Populated from driversData -->
                </select>
            </div>
            
            <div class="form-group">
                <label>Truck Plate *</label>
                <input type="text" id="truckPlate" required>
            </div>
            
            <div class="form-group">
                <label>Transport Company *</label>
                <select id="transportCompany" required>
                    <option value="">Select company...</option>
                    <!-- Populated from transportCompaniesData -->
                </select>
            </div>
            
            <div class="form-group">
                <label>Estimated Delivery Date *</label>
                <input type="date" id="estimatedDelivery" required>
            </div>
            
            <div class="form-group">
                <label>Notes</label>
                <textarea id="assignmentNote" rows="2"></textarea>
            </div>
            
            <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                <button type="submit" class="btn btn-primary" style="flex: 1;">
                    Assign Transport
                </button>
                <button type="button" class="btn btn-secondary" onclick="window.closeModal()" style="flex: 1;">
                    Cancel
                </button>
            </div>
        </form>
    `);
    
    // Populate driver dropdown
    const driverSelect = document.getElementById('driverName');
    window.driversData.forEach(driver => {
        const option = document.createElement('option');
        option.value = driver.name;
        option.textContent = driver.name;
        driverSelect.appendChild(option);
    });
    
    // Populate transport company dropdown
    const companySelect = document.getElementById('transportCompany');
    window.transportCompaniesData.forEach(company => {
        const option = document.createElement('option');
        option.value = company.name;
        option.textContent = company.name;
        companySelect.appendChild(option);
    });
    
    // Handle form submission
    document.getElementById('transportAssignmentForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await window.submitTransportAssignment();
    });
}

/**
 * Submit transport assignment
 */
async function submitTransportAssignment() {
    const orderID = document.getElementById('assignOrderID').value;
    const driverName = document.getElementById('driverName').value;
    const truckPlate = document.getElementById('truckPlate').value;
    const transportCompany = document.getElementById('transportCompany').value;
    const estimatedDelivery = document.getElementById('estimatedDelivery').value;
    const note = document.getElementById('assignmentNote').value;
    
    try {
        await fetch(window.CONFIG.APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'assignTransport',
                orderID: orderID,
                transportUserID: window.currentUser.id,
                driverName: driverName,
                truckPlate: truckPlate,
                transportCompany: transportCompany,
                estimatedDelivery: estimatedDelivery,
                note: note
            })
        });
        
        alert('✅ Transport assigned successfully!');
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        await window.loadData();
        window.closeModal();
        window.updateBadgeDisplays();
        loadForAssigning(); // Reload current tab
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error assigning transport');
    }
}

// Export functions to window for global access
window.transportViews = {
    loadForAssigning,
    loadAssignedOrders,
    loadTransportDisputed,
    loadTransportFinished,
    showTransportAssignmentForm
};

console.log('✅ Transport views loaded');
