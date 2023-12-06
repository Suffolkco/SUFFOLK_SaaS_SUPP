var contractId = getAppSpecific("Contract ID", capId);
logDebug("contract id: " + contractId);  


newId = capId.getCustomID() + "-MON";
result = aa.cap.updateCapAltID(capId, newId);
editAppSpecific("Contract ID", contractId, capId); 

if (result.getSuccess())
        logDebug("Successfully updated alt Id to: " + newId);
    else
        logDebug("Problem updating alt Id: " + result.getErrorMessage());

// Get cap by custom alt ID
contractParent = getApplication(contractId);
logInfo("Retrieving ID for application AltID: " + contractId);
// Relate contract as parent
if (contractParent) {
  addParent(contractParent);
}