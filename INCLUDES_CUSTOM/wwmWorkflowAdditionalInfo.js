function wwmWorkflowAdditionalInfo(reportName, reportParamRecID)
{
	var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var reportFile = new Array();
	var conArray = getContactArray();
	var conEmail = "";
    var fromEmail = "";
	var itemCap = aa.cap.getCap(capId).getOutput();
	appTypeResult = itemCap.getCapType();
	appTypeString = appTypeResult.toString(); 
	appTypeArray = appTypeString.split("/");
    var alternateID = capId.getCustomID();

		reportParams.put(reportParamRecID, alternateID.toString());

		rFile = generateReport(reportName,reportParams, appTypeArray[0])
        logDebug("This is the rFile: " + rFile);           
        
            if (rFile) {
            reportFile.push(rFile);
            }


	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
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
	logDebug("Test" + conEmail);
	
	//addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
	logDebug("If this is showing up, you're a winner!");
    addParameter(emailParams, "$$altID$$", capId.getCustomID());
	if (conEmail != null)
	{
		sendNotification("", conEmail, "", "DEQ_WWM_AWAITING CLIENT REPLY", emailParams, reportFile);
	}
}