function workflowInspectionResulted()
{
	var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var reportFile = new Array();
	var conEmail = "";
    var fromEmail = "";
		
		var capContResult = aa.people.getCapContactByCapID(capId);

		if (capContResult.getSuccess()) {
			conArray = capContResult.getOutput();
		} else {
			retVal = false;
		}
	
	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
	}
	for (con in conArray)
	{		
		cont = conArray[con];				
		peop = cont.getPeople();

		if (peop.getAuditStatus() != "I")
		{
			if (!matches(peop.getEmail(), null, undefined, ""))
			{
				conEmail += peop.getEmail() + "; ";
        }
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
    
    //addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
    addParameter(emailParams, "$$altID$$", capId.getCustomID());
	if (conEmail != null)
	{
        sendNotification("", conEmail, "", "DEQ_WWM_INSPECTIONRESULT", emailParams, reportFile);
    }
}
