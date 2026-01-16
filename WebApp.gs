// ==============================================
// WEB APP ENTRY POINTS & CORS HANDLER
// ==============================================

/**
 * CORS Helper - Returns JSON response with CORS headers
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * Handle OPTIONS requests (CORS preflight)
 */
function doOptions(e) {
  return createJsonResponse({});
}

/**
 * Handle GET requests - Return all data
 */
function doGet(e) {
  try {
    Logger.log('=== doGet called ===');
    
    const action = e.parameter.action;
    Logger.log('Action: ' + action);
    
    if (action === 'getAllData') {
      return handleGetAllData();
    }
    
    // Default response
    return createJsonResponse({
      status: 'OK',
      message: 'Gulf Order Management API is running',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    Logger.log('ERROR in doGet: ' + error.toString());
    return createJsonResponse({
      success: false,
      error: error.toString()
    });
  }
}

/**
 * Handle POST requests - All actions
 */
function doPost(e) {
  try {
    Logger.log('=== doPost called ===');
    Logger.log('Raw postData: ' + e.postData.contents);
    
    const data = JSON.parse(e.postData.contents);
    Logger.log('Action: ' + data.action);
    
    switch(data.action) {
      case 'createOrder':
        return createOrder(data);
        
      case 'approveOrder':
        return approveOrder(data.orderID, data.approverID, data.note);
        
      case 'rejectOrder':
        return rejectOrder(data.orderID, data.rejecterID, data.reason);
        
      case 'resolveDispute':
        return resolveDispute(data.orderID, data.resolverID, data.resolutionLevel, data.resolutionNotes, data.actionTaken);
        
      case 'enterProforma':
        return enterProforma(data.orderID, data.proformaNumber, data.proformaTotalAmount, data.financeUserID, data.note);
        
      case 'enterInvoice':
        return enterInvoice(data.orderID, data.invoiceNumber, data.invoiceTotalAmount, data.financeUserID, data.note);
        
      case 'assignTransport':
        return assignTransport(data.orderID, data.driverName, data.truckPlate, data.transportCompany, data.estimatedDelivery, data.transportUserID, data.note);
        
      case 'markAsDelivered':
        return markAsDelivered(data.orderID, data.transportUserID, data.note);
        
      case 'markAsDisputed':
        return markAsDisputed(data.orderID, data.transportUserID, data.reason);
        
      case 'updateWarehouseStatus':
        return updateWarehouseStatus(data.orderID, data.status, data.warehouseUserID, data.note);
        
      case 'uploadDocument':
        return uploadDocument(data.orderID, data.fileName, data.fileType, data.documentType, data.fileData, data.uploadedBy);
        
      case 'deleteDocument':
        return deleteDocument(data.orderID, data.fileId, data.deletedBy);
        
      case 'getRegulatoryPrices':
        return getRegulatoryPrices();
        
      case 'updateRegulatoryPrices':
        return updateRegulatoryPrices(data.prices, data.updatedBy);
        
      case 'addOrderNote':
        return addOrderNote(data.orderID, data.note, data.userID, data.userName, data.userDepartment);
        
      case 'getOrderNotes':
        return getOrderNotes(data.orderID);
        
      case 'getAvailability':
        return getAvailability(data.productType, data.deliveryDate);
        
      case 'getAllAvailability':
        return getAllAvailability();
        
      default:
        Logger.log('Unknown action: ' + data.action);
        return createJsonResponse({
          success: false,
          message: 'Unknown action: ' + data.action
        });
    }
    
  } catch (error) {
    Logger.log('ERROR in doPost: ' + error.toString());
    Logger.log('Stack trace: ' + error.stack);
    return createJsonResponse({
      success: false,
      error: error.toString()
    });
  }
}

/**
 * Get all data for frontend
 */
function handleGetAllData() {
  try {
    Logger.log('Getting all data...');
    
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    
    // Get Orders
    const ordersSheet = ss.getSheetByName('Orders');
    const ordersData = ordersSheet.getDataRange().getValues();
    const orders = arrayToObjects(ordersData);
    Logger.log('Loaded ' + orders.length + ' orders');
    
    // Get Clients
    const clientsSheet = ss.getSheetByName('Clients');
    const clientsData = clientsSheet.getDataRange().getValues();
    const clients = arrayToObjects(clientsData);
    Logger.log('Loaded ' + clients.length + ' clients');
    
    // Get Users
    const usersSheet = ss.getSheetByName('Users');
    const usersData = usersSheet.getDataRange().getValues();
    const users = arrayToObjects(usersData);
    Logger.log('Loaded ' + users.length + ' users');
    
    return createJsonResponse({
      success: true,
      users: users,
      orders: orders,
      clients: clients
    });
    
  } catch (error) {
    Logger.log('ERROR in handleGetAllData: ' + error.toString());
    return createJsonResponse({
      success: false,
      error: error.toString()
    });
  }
}

/**
 * Convert 2D array to array of objects
 */
function arrayToObjects(data) {
  if (data.length < 2) return [];
  
  const headers = data[0];
  const result = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const obj = {};
    
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    
    result.push(obj);
  }
  
  return result;
}
