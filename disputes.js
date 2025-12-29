// ============================================
// DISPUTE MANAGEMENT FEATURE
// js/features/disputes.js
// ============================================

/**
 * Show enhanced dispute form with measurement tracking
 */
function showDisputeForm(orderID, orderedQuantity, clientName) {
    const formHTML = `
        <h2 style="margin-bottom: 1.5rem; color: var(--danger);">
            ⚠️ Report Delivery Dispute
        </h2>
        <p style="margin-bottom: 1rem; color: #6B7280;">
            <strong>Order:</strong> ${orderID}
        </p>
        <p style="margin-bottom: 1.5rem; color: #6B7280;">
            <strong>Ordered Quantity:</strong> ${orderedQuantity}L
        </p>
        
        <form id="disputeForm" style="display: grid; gap: 1rem;">
            <div class="form-group">
                <label>Client Name *</label>
                <input type="text" id="disputeClientName" value="${clientName}" required>
            </div>
            
            <div class="form-group">
                <label>Actual Quantity Delivered (Liters) *</label>
                <input type="number" id="actualQuantity" step="0.01" required>
            </div>
            
            <div class="form-group">
                <label>Variance (auto-calculated)</label>
                <input type="text" id="varianceDisplay" readonly style="background: #F3F4F6; font-weight: bold;">
            </div>
            
            <div class="form-group">
                <label>Measurement Method *</label>
                <select id="measurementMethod" required onchange="toggleScaleFields()">
                    <option value="">Select method...</option>
                    <option value="${window.CONFIG.MEASUREMENT_METHODS.PROTOMETER}">
                        ${window.CONFIG.MEASUREMENT_METHODS.PROTOMETER}
                    </option>
                    <option value="${window.CONFIG.MEASUREMENT_METHODS.SCALE}">
                        ${window.CONFIG.MEASUREMENT_METHODS.SCALE}
                    </option>
                </select>
            </div>
            
            <div id="scaleFieldsContainer" style="display: none; border-left: 3px solid var(--primary); padding-left: 1rem; margin-left: 1rem;">
                <div class="form-group">
                    <label>Scale Owner *</label>
                    <input type="text" id="scaleOwner" placeholder="e.g., Makpetrol, Client Name">
                </div>
                
                <div class="form-group">
                    <label>Scale Location (City) *</label>
                    <input type="text" id="scaleCity" placeholder="e.g., Skopje, Gevgelija">
                </div>
            </div>
            
            <div class="form-group">
                <label>Dispute Reason *</label>
                <select id="disputeReason" required>
                    <option value="">Select reason...</option>
                    <option value="Short Delivery">Short Delivery</option>
                    <option value="Over Delivery">Over Delivery</option>
                    <option value="Quality Issue">Quality Issue</option>
                    <option value="Wrong Product">Wrong Product</option>
                    <option value="Damaged Delivery">Damaged Delivery</option>
                    <option value="Client Refused">Client Refused</option>
                    <option value="Measurement Discrepancy">Measurement Discrepancy</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Additional Notes</label>
                <textarea id="disputeNotes" rows="3" placeholder="Provide details..."></textarea>
            </div>
            
            <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                <button type="submit" class="btn btn-warning" style="flex: 1;">
                    ⚠️ Submit Dispute
                </button>
                <button type="button" class="btn btn-secondary" onclick="window.closeModal()" style="flex: 1;">
                    Cancel
                </button>
            </div>
        </form>
    `;
    
    window.openModal('Report Dispute', formHTML);
    
    // Calculate variance when actual quantity changes
    document.getElementById('actualQuantity').addEventListener('input', function() {
        calculateVariance(orderedQuantity);
    });
    
    // Handle form submission
    document.getElementById('disputeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitDispute(orderID, orderedQuantity);
    });
}

/**
 * Calculate and display variance
 */
function calculateVariance(orderedQuantity) {
    const actual = parseFloat(document.getElementById('actualQuantity').value) || 0;
    const variance = actual - parseFloat(orderedQuantity);
    const varianceDisplay = document.getElementById('varianceDisplay');
    
    if (variance === 0) {
        varianceDisplay.value = '0 L (No variance)';
        varianceDisplay.style.color = '#059669';
    } else if (variance > 0) {
        varianceDisplay.value = '+' + variance.toFixed(2) + ' L (Over delivery)';
        varianceDisplay.style.color = '#2563EB';
    } else {
        varianceDisplay.value = variance.toFixed(2) + ' L (Short delivery)';
        varianceDisplay.style.color = '#DC2626';
    }
}

/**
 * Toggle scale fields visibility
 */
function toggleScaleFields() {
    const method = document.getElementById('measurementMethod').value;
    const scaleFields = document.getElementById('scaleFieldsContainer');
    const scaleOwner = document.getElementById('scaleOwner');
    const scaleCity = document.getElementById('scaleCity');
    
    if (method === window.CONFIG.MEASUREMENT_METHODS.SCALE) {
        scaleFields.style.display = 'block';
        scaleOwner.required = true;
        scaleCity.required = true;
    } else {
        scaleFields.style.display = 'none';
        scaleOwner.required = false;
        scaleCity.required = false;
        scaleOwner.value = '';
        scaleCity.value = '';
    }
}

/**
 * Submit dispute
 */
async function submitDispute(orderID, orderedQuantity) {
    const actualQuantity = document.getElementById('actualQuantity').value;
    const disputeReason = document.getElementById('disputeReason').value;
    const notes = document.getElementById('disputeNotes').value.trim();
    const clientName = document.getElementById('disputeClientName').value.trim();
    const measurementMethod = document.getElementById('measurementMethod').value;
    const scaleOwner = document.getElementById('scaleOwner').value.trim();
    const scaleCity = document.getElementById('scaleCity').value.trim();
    
    if (!actualQuantity || !disputeReason || !clientName || !measurementMethod) {
        alert('⚠️ Please fill in all required fields');
        return;
    }
    
    // Validate scale fields
    if (measurementMethod === window.CONFIG.MEASUREMENT_METHODS.SCALE) {
        if (!scaleOwner || !scaleCity) {
            alert('⚠️ Please fill in Scale Owner and Location');
            return;
        }
    }
    
    const variance = parseFloat(actualQuantity) - parseFloat(orderedQuantity);
    
    try {
        await fetch(window.CONFIG.APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'markDisputed',
                orderID: orderID,
                transportUserID: window.currentUser.id,
                actualQuantity: actualQuantity,
                varianceLiters: variance.toFixed(2),
                disputeReason: disputeReason,
                notes: notes,
                clientName: clientName,
                measurementMethod: measurementMethod,
                scaleOwner: scaleOwner,
                scaleCity: scaleCity
            })
        });
        
        alert('⚠️ Dispute reported successfully!\n\nManagement will review and resolve.');
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        await window.loadData();
        window.closeModal();
        window.updateBadgeDisplays();
        
        // Reload current view
        if (window.currentView === 'transport') {
            window.switchTab('transportDisputed');
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error reporting dispute');
    }
}

/**
 * Show dispute resolution form (Management only)
 */
function showDisputeResolutionForm(order) {
    if (window.currentUser.department !== window.CONFIG.DEPARTMENTS.MANAGEMENT) {
        alert('⚠️ Only Management can resolve disputes');
        return;
    }
    
    const orderedQty = parseFloat(order.quantity) || 0;
    const actualQty = parseFloat(order.actualQuantity) || 0;
    const variance = parseFloat(order.varianceLiters) || 0;
    const absVariance = Math.abs(variance);
    
    const formHTML = `
        <h2 style="margin-bottom: 1.5rem; color: var(--warning);">
            🔧 Resolve Dispute
        </h2>
        
        <div class="dispute-card" style="margin-bottom: 1.5rem;">
            <h4>⚠️ Dispute Details</h4>
            <div class="dispute-info">
                <p><strong>Order:</strong> ${order.orderID}</p>
                <p><strong>Client:</strong> ${order.disputeClientName || order.clientName}</p>
                <p><strong>Ordered:</strong> ${orderedQty}L | <strong>Actual:</strong> ${actualQty}L</p>
                <p style="color: ${variance < 0 ? '#DC2626' : '#2563EB'};">
                    <strong>Variance:</strong> ${variance > 0 ? '+' : ''}${variance}L
                </p>
                <p><strong>Reason:</strong> ${order.disputeReason}</p>
                <p><strong>Measurement:</strong> ${order.disputeMeasurementMethod}</p>
                ${order.disputeMeasurementMethod === 'Scale' ? `
                    <p><strong>Scale:</strong> ${order.disputeScaleOwner} (${order.disputeScaleCity})</p>
                ` : ''}
                <p><strong>Reported by:</strong> ${order.disputeReportedBy} on ${new Date(order.disputeReportedDate).toLocaleString()}</p>
            </div>
        </div>
        
        <form id="resolutionForm" style="display: grid; gap: 1rem;">
            <div class="form-group">
                <label>Resolution Level * (Variance: ${absVariance.toFixed(2)}L)</label>
                <select id="resolutionLevel" required>
                    <option value="">Select level...</option>
                    <option value="${window.CONFIG.RESOLUTION_LEVELS.UNDER_50}" ${absVariance < 50 ? 'selected' : ''}>
                        Up to 50L variance
                    </option>
                    <option value="${window.CONFIG.RESOLUTION_LEVELS.UNDER_100}" ${absVariance >= 50 && absVariance < 100 ? 'selected' : ''}>
                        50L to 100L variance
                    </option>
                    <option value="${window.CONFIG.RESOLUTION_LEVELS.OVER_100}" ${absVariance >= 100 ? 'selected' : ''}>
                        Above 100L variance
                    </option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Action Taken *</label>
                <select id="actionTaken" required>
                    <option value="">Select action...</option>
                    <option value="Approved Full Variance">Approved Full Variance</option>
                    <option value="Approved Partial Variance">Approved Partial Variance</option>
                    <option value="Client Compensated">Client Compensated</option>
                    <option value="Driver Penalized">Driver Penalized</option>
                    <option value="Measurement Error">Measurement Error - No Action</option>
                    <option value="Administrative Resolution">Administrative Resolution</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Resolution Notes *</label>
                <textarea id="resolutionNotes" rows="4" required placeholder="Explain the resolution..."></textarea>
            </div>
            
            <div style="background: #DBEAFE; border-left: 4px solid #3B82F6; padding: 1rem; border-radius: 4px;">
                <p style="margin: 0; color: #1E40AF; font-size: 0.9rem;">
                    ℹ️ <strong>Note:</strong> This will change status to "Resolved" and move to Finished tab.
                </p>
            </div>
            
            <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                <button type="submit" class="btn btn-success" style="flex: 1;">
                    ✅ Resolve Dispute
                </button>
                <button type="button" class="btn btn-secondary" onclick="window.closeModal()" style="flex: 1;">
                    Cancel
                </button>
            </div>
        </form>
    `;
    
    window.openModal('Resolve Dispute', formHTML);
    
    // Handle form submission
    document.getElementById('resolutionForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitDisputeResolution(order.orderID);
    });
}

/**
 * Submit dispute resolution
 */
async function submitDisputeResolution(orderID) {
    const resolutionLevel = document.getElementById('resolutionLevel').value;
    const actionTaken = document.getElementById('actionTaken').value;
    const resolutionNotes = document.getElementById('resolutionNotes').value.trim();
    
    if (!resolutionLevel || !actionTaken || !resolutionNotes) {
        alert('⚠️ Please fill in all required fields');
        return;
    }
    
    if (!confirm('✅ Confirm Dispute Resolution?\n\nThis will mark as resolved and move to Finished.')) {
        return;
    }
    
    try {
        await fetch(window.CONFIG.APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'resolveDispute',
                orderID: orderID,
                resolverID: window.currentUser.id,
                resolutionLevel: resolutionLevel,
                resolutionNotes: resolutionNotes,
                actionTaken: actionTaken
            })
        });
        
        alert('✅ Dispute resolved successfully!');
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        await window.loadData();
        window.closeModal();
        window.updateBadgeDisplays();
        window.switchTab('resolved');
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error resolving dispute');
    }
}

/**
 * Mark order as delivered (no issues)
 */
async function markAsDelivered(orderID) {
    if (!confirm('✅ Mark this order as Delivered?\n\nThis confirms successful delivery with no issues.')) {
        return;
    }
    
    try {
        await fetch(window.CONFIG.APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'markDelivered',
                orderID: orderID,
                transportUserID: window.currentUser.id
            })
        });
        
        alert('✅ Order marked as Delivered!');
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        await window.loadData();
        window.updateBadgeDisplays();
        
        if (window.currentView === 'transport') {
            window.switchTab('transportFinished');
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error marking as delivered');
    }
}

// Export functions to window
window.disputeFeature = {
    showDisputeForm,
    showDisputeResolutionForm,
    markAsDelivered,
    toggleScaleFields
};

console.log('✅ Dispute feature loaded');
