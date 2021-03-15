
if (publicUser) {

	aa.cap.updateAccessByACA(capId, "N");

		// ASI Table
	var pinTable = loadASITable("ACA REGISTRATION");

	for (var p in pinTable)
	{
		var pin = pinTable[p]["PIN"];
		var recordId = pinTable[p]["Record ID"];
		var id = pinTable[p]["Contact ID"];
		var licCap = aa.cap.getCapID(parseInt(pin)).getOutput();
		var contactID = parseInt(id);
		var recordIdString = recordId.toString();  

		var capIDString = licCap.getCustomID();     

		logDebug(pin + "," + recordId + "," + id + "," + licCap);

		logDebug("Switch to upper case: " + recordIdString.toUpperCase());
		var recordIdUpperCase = recordIdString.toUpperCase();

		if (licCap)
		{
			logDebug("CapIdString: " + capIDString + ", Record ID: " + recordId);
			if (matches(capIDString, recordIdUpperCase))
			{			
				logDebug("Matching:" + capIDString + "," + recordIdUpperCase);  
				editContactToSpecifcRecord(licCap, contactID, null);		
								
				// Set description
				updateWorkDesc("See FAQ for details. No further steps required.");        
				// Update Project Name
				var projectName = "DO NOT SUBMIT UNDER THIS APPLICATION - SUBMIT UNDER " + capIDString;
				// On ACA, this is short note
				updateShortNotes(projectName);        
				// On ACA, this is project name
				editAppName(projectName);
			}	
		}
	}
	// Below is for single entry from ACA custom field
	/*
	var pin = aa.cap.getCapID(parseInt(AInfo["PIN"])).getOutput();
    var recordId = AInfo["Record ID"];
    var contactID = parseInt(AInfo["Contact ID"]);
    var capIDString = pin.getCustomID();     
    logDebug("Info: " + capIDString + "," + recordId + "," + contactID);

	if (pin) 
	{
		if (matches(capIDString, recordId))
		{			
			logDebug("Matching:" + capIDString + "," + recordId);  
			editContactToSpecifcRecord(pin, contactID);				
		}	
	}
	*/

}


function matches(eVal, argList) {
	for (var i = 1; i < arguments.length; i++) {
		if (arguments[i] == eVal) {
			return true;
		}
	}
	return false;
} 



