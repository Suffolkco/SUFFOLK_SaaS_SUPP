var contractId = getAppSpecific("Contract ID", capId);
logDebug("contract id: " + contractId);  

newId = capId.getCustomID() + "-EX";
result = aa.cap.updateCapAltID(capId, newId);

editAppSpecific("Contract ID", contractId, capId); 

if (result.getSuccess())
        logDebug("Successfully updated alt Id to: " + newId);
    else
        logDebug("Problem updating alt Id: " + result.getErrorMessage());
    