// Retrieve contract ID from custom field
var contractId = getAppSpecific("Contract ID", capId);
logDebug("contract id: " + contractId);  
newId = contractId + "-LH";

// Update current record to new custom ID 
result = aa.cap.updateCapAltID(capId, newId);
if (result.getSuccess())
        logDebug("Successfully updated alt Id to: " + newId);
    else
        logDebug("Problem updating alt Id: " + result.getErrorMessage());

// Update custom field on new record
editAppSpecific("Contract ID", contractId, capId);      

// Get cap by custom alt ID
contractParent = getApplication(contractId);
logDebug("Retrieving ID for application AltID: " + contractId);
// Relate contract as parent
if (contractParent) {
  addParent(contractParent);
}
    
        

