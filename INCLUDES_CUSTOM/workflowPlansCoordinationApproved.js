function workflowPlansCoordinationApproved(capAddresses)
{
	var emailParams = aa.util.newHashtable();	
	var reportFile = new Array();
	var conArray = getContactArray();
	var conEmail = "";
	var fromEmail = "";
	var shortNotes = getShortNotes(capId);
	logDebug("My short notes are: " + shortNotes);
	
	if (capAddresses == null || capAddresses.length == 0)
    {
        logDebug("WARNING: no addresses on this CAP:" + capId);
        capAddresses = null;
	}  

	var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
	acaSite = acaSite.substr(0, acaSite.toUpperCase().indexOf("/ADMIN"));
	var projectName = workDescGet(capId);
	
	
    if (capAddresses != null || capAddresses.length > 0)
    {
		for (loopk in capAddresses)
		{
			sourceAddressfModel = capAddresses[loopk];	
			
			//debugObject(sourceAddressfModel);

			address1 = sourceAddressfModel.getAddressLine1();
			streetNumber = sourceAddressfModel.getHouseNumberStart();
			streetName = sourceAddressfModel.getStreetName();
			streetType = sourceAddressfModel.getStreetSuffix();
			city =sourceAddressfModel.getCity();
			state = sourceAddressfModel.getState();
			zip = sourceAddressfModel.getZip();

			addParameter(emailParams, "$$altID$$", capId.getCustomID());
			addParameter(emailParams, "$$shortnotes$$", shortNotes);
			addParameter(emailParams, "$$streetNumber$$", streetNumber);
			addParameter(emailParams, "$$streetName$$", streetName);
			addParameter(emailParams, "$$streetType$$", streetType);
			addParameter(emailParams, "$$city$$", city);
			addParameter(emailParams, "$$state$$", state);
			addParameter(emailParams, "$$zip$$", zip);	                                                    		
			addParameter(emailParams, "$$acaURL$$", acaSite);
			
		}
	}

	for (con in conArray)
	{
		if (!matches(conArray[con].email, null, undefined, ""))
		{
			conEmail += conArray[con].email + "; ";				
			
		}
	}

	var lpResult = aa.licenseScript.getLicenseProf(capId);
	if (lpResult.getSuccess())
	{ 
		var lpArr = lpResult.getOutput();  
	} 
	else 
	{ 
		logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
	}
	for (var lp in lpArr)
	{
		if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
		{
			conEmail += lpArr[lp].getEmail() + "; ";
		}
	}
	getRecordParams4Notification(emailParams);
    getWorkflowParams4Notification(emailParams);

	if (conEmail != null)
	{
		if (appTypeArray[2] == "Swimming Pool")
		{
			sendNotification("", conEmail, "", "DEQ_OPC_PLANCOORDINATIONAPPROVED_POOL", emailParams, reportFile);
		}
		else
		{
			sendNotification("", conEmail, "", "DEQ_OPC_PLANCOORDINATIONAPPROVED", emailParams, reportFile);
		}
		logDebug("We're in OPC");
	}
    
}
function debugObject(object) {
	var output = ''; 
	for (property in object) { 
	  output += "<font color=red>" + property + "</font>" + ': ' + "<bold>" + object[property] + "</bold>" +'; ' + "<BR>"; 
	} 
	logDebug(output);
} 
