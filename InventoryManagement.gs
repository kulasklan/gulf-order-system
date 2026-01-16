// ==============================================
// INVENTORY MANAGEMENT - AVAILABILITY CALCULATION
// Phase 1a: Calculate and display availability
// ==============================================

/**
 * Get available quantity for a product
 * Formula: ATS = On_Hand + Confirmed_Inbound + InTransit_Inbound - Reserved
 */
function getAvailability(productType, deliveryDate) {
  try {
    Logger.log('=== Getting availability for: ' + productType + ' on ' + deliveryDate);
    
    var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    var inventorySheet = ss.getSheetByName('Inventory');
    var inboundSheet = ss.getSheetByName('Inbound_Shipments');
    var ordersSheet = ss.getSheetByName('Orders');
    
    // STEP 1: Get On-Hand quantity from Inventory sheet
    var onHand = 0;
    var inventoryData = inventorySheet.getDataRange().getValues();
    
    for (var i = 1; i < inventoryData.length; i++) {
      var productName = inventoryData[i][1]; // Column B: Product_Name
      if (productName === productType) {
        onHand = parseFloat(inventoryData[i][2]) || 0; // Column C: On_Hand_Quantity
        Logger.log('On-Hand: ' + onHand);
        break;
      }
    }
    
    // STEP 2: Get Confirmed + In Transit inbound quantity
    var inboundQty = 0;
    if (inboundSheet) {
      var inboundData = inboundSheet.getDataRange().getValues();
      var requestedDate = deliveryDate ? new Date(deliveryDate) : new Date();
      
      for (var i = 1; i < inboundData.length; i++) {
        var inboundProduct = inboundData[i][2]; // Column C: Product_Type
        var inboundStatus = inboundData[i][7]; // Column H: Status
        var plannedArrival = inboundData[i][5]; // Column F: Planned_Arrival_Date
        
        // Only count if:
        // 1. Same product
        // 2. Status is "Confirmed" or "In Transit"
        // 3. Arrives before or on delivery date
        if (inboundProduct === productType && 
            (inboundStatus === 'Confirmed' || inboundStatus === 'In Transit')) {
          
          if (!deliveryDate || !plannedArrival || new Date(plannedArrival) <= requestedDate) {
            var qty = parseFloat(inboundData[i][3]) || 0; // Column D: Quantity
            inboundQty += qty;
            Logger.log('Inbound: +' + qty + ' (Status: ' + inboundStatus + ', Arrival: ' + plannedArrival + ')');
          }
        }
      }
    }
    Logger.log('Total Inbound: ' + inboundQty);
    
    // STEP 3: Get Reserved quantity (approved orders for same product)
    var reserved = 0;
    var ordersData = ordersSheet.getDataRange().getValues();
    
    for (var i = 1; i < ordersData.length; i++) {
      var orderProduct = ordersData[i][5]; // Column F: Product_Type
      var orderStatus = ordersData[i][19]; // Column T: Status
      var reservedQty = ordersData[i][43]; // Column AR: Reserved_Quantity
      
      // Only count approved orders with reserved quantity
      if (orderProduct === productType && 
          orderStatus === 'Approved' && 
          reservedQty && reservedQty > 0) {
        reserved += parseFloat(reservedQty);
      }
    }
    Logger.log('Reserved: ' + reserved);
    
    // STEP 4: Calculate Available-to-Sell (ATS)
    var ats = onHand + inboundQty - reserved;
    Logger.log('ATS = ' + onHand + ' + ' + inboundQty + ' - ' + reserved + ' = ' + ats);
    
    // Return availability info
    return createJsonResponse({
      success: true,
      productType: productType,
      onHand: onHand,
      inbound: inboundQty,
      reserved: reserved,
      available: ats,
      unit: 'L'
    });
    
  } catch (error) {
    Logger.log('ERROR getting availability: ' + error.toString());
    return createJsonResponse({
      success: false,
      error: error.toString(),
      available: 0
    });
  }
}

/**
 * Get availability for all products (for dashboard)
 */
function getAllAvailability() {
  try {
    Logger.log('=== Getting availability for all products');
    
    var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    var inventorySheet = ss.getSheetByName('Inventory');
    var inventoryData = inventorySheet.getDataRange().getValues();
    
    var results = [];
    
    // Loop through all products in Inventory
    for (var i = 1; i < inventoryData.length; i++) {
      var productName = inventoryData[i][1]; // Column B: Product_Name
      
      if (productName) {
        // Get availability for this product
        var avail = getAvailability(productName, null);
        var availData = JSON.parse(avail.getContent());
        
        if (availData.success) {
          results.push({
            productType: availData.productType,
            onHand: availData.onHand,
            inbound: availData.inbound,
            reserved: availData.reserved,
            available: availData.available,
            unit: availData.unit
          });
        }
      }
    }
    
    Logger.log('Availability calculated for ' + results.length + ' products');
    
    return createJsonResponse({
      success: true,
      products: results
    });
    
  } catch (error) {
    Logger.log('ERROR getting all availability: ' + error.toString());
    return createJsonResponse({
      success: false,
      error: error.toString()
    });
  }
}
