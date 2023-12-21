//ASIUA;CONSUMERAFFAIRS!LOCAL LAWS!~!~!

var itemCap = aa.cap.getCap(capId).getOutput();
var appTypeResult = itemCap.getCapType();
var appTypeString = appTypeResult.toString(); 
var appTypeArray = appTypeString.split("/");
var tag = "";

var contractId = getAppSpecific("Contract ID");
logDebug("contract id: " + contractId);  

// For new contract, we update the contract ID and altid and its child.
if (appTypeArray[3] == "New Contract")
{   		
    logDebug("capId.getCustomID(): " + capId.getCustomID());  

    if (contractId != capId.getCustomID())
    {
		recordID = getApplication(contractId);

        if (recordID)
        {
            showMessage = true;
            comment("Please confirm the Contract ID " + contractId + " . This contract ID already exists in the system.");
            cancel = true;        
        }
    }
}


