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
    logDebug("capId.getCustomID(: " + capId.getCustomID());  

    if (contractId != capId.getCustomID())
    {
		var vSQL0 = "SELECT B1.B1_ALT_ID as recordNumber FROM B1PERMIT B1 WHERE B1.B1_ALT_ID = '" + contractId + "'";
		logDebugLocal(vSQL0);

		// SQL to pull active OPC site records that has NO child Tank records		
		var vRecordID = doSQLSelect_local(vSQL0);  	
				
		logDebugLocal("Pulling number of records with matching new alt id:" +  vRecordID.length);
		// Only there is no existing custom ID already in the system
		if (vRecordID.length > 0)
        {
            showMessage = true;
		    comment("Please confirm the Contract ID. There is another contract ID with the same number already in the system.");
            cancel = true;

        }
   }
}


