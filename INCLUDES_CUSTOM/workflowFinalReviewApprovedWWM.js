function workflowFinalReviewApprovedWWM()
{
	var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var reportFile = new Array();
	var conArray = getContactArray();
	var conEmail = "";
    var fromEmail = ""; 
    
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
	// EHIMS-5041 
	/*
	for (var lp in lpArr)
	{
		if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
		{
			conEmail += lpArr[lp].getEmail() + "; ";
		}
	}*/
	getRecordParams4Notification(emailParams);
    getWorkflowParams4Notification(emailParams);    
    //addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
    addParameter(emailParams, "$$altID$$", capId.getCustomID());
	var shortNotes = getShortNotes(capId);
	addParameter(emailParams, "$$shortNotes$$", shortNotes);
	addACAUrlsVarToEmail(emailParams);

	if (conEmail != null)
	{
		sendNotification("", conEmail, "", "DEQ_WWM_FINAL REVIEW APPROVED", emailParams, reportFile);
	}
}