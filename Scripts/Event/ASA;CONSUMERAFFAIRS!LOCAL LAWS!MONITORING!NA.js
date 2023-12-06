// Retrieve contract ID from custom field
var contractId = getAppSpecific("Contract ID", capId);
logDebug("contract id: " + contractId);  

var customId = capId.getCustomID();

// Get cap by custom alt ID
contractParent = getApplication(contractId);
logDebug("Retrieving ID for contract AltID: " + contractId);

if(!matches(contractId,null,undefined,""))
{
  customId = contractId 
}

// Contract record exists
if (contractParent) {
  logDebug("Found contract ID and relate");
  addParent(contractParent);

  // Update custom field on new record
  editAppSpecific("Contract ID", contractId, capId);      

  newId = customId + "-MON";

  // Update current record to new custom ID 
  result = aa.cap.updateCapAltID(capId, newId);
  if (result.getSuccess())
  logDebug("Successfully updated alt Id to: " + newId);
  else
  logDebug("Problem updating alt Id: " + result.getErrorMessage());     

}

 


    
        

