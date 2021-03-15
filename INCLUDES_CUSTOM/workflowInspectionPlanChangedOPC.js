function workflowInspectionPlanChangedOPC(wfComments, capAddresses)
{
	var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var reportFile = new Array();
	var conArray = getContactArray();
	var conEmail = "";
	var fromEmail = "";
	var shortNotes = getShortNotes(capId);
	logDebug("My short notes are in workflowInspectionPlanChangedOPC: " + shortNotes);
	
	if (capAddresses == null || capAddresses.length == 0)
    {
        logDebug("WARNING: no addresses on this CAP:" + capId);
        capAddresses = null;
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
    
    //addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
	addParameter(emailParams, "$$altID$$", capId.getCustomID());
	addParameter(emailParams, "$$shortNotes$$", shortNotes);
	addParameter(emailParams, "$$wfComments$$", wfComments);

    if (conEmail != null)
    {
        addParameter(emailParams, "$$CAPAlias$$", cap.getCapType().getAlias());
        if (capAddresses != null)
        {
            addParameter(emailParams, "$$address$$", capAddresses[0]);
        }
        sendNotification("", conEmail, "", "DEQ_OPC_REVISED_TO_APPROVEDPLAN_NEEDED", emailParams, reportFile);
        logDebug("We're in OPC");
    }
	
	
}