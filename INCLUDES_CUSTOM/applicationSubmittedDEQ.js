function applicationSubmittedDEQ()
{
	var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var reportFile = new Array();
	var conArray;
	try
	{
		conArray= getContactArray();
	}
	catch (ex)
	{
		logDebug("**ERROR** runtime error " + ex.message);
	}
	var conEmail = "";
    var fromEmail = "";
    
	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
	}
	if (conArray != null)
	{
		for (con in conArray)
		{
			if (!matches(conArray[con].email, null, undefined, ""))
			{
				conEmail += conArray[con].email + "; ";
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
    //getWorkflowParams4Notification(emailParams);
    
    //addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
    addParameter(emailParams, "$$altID$$", capId.getCustomID());
	if (conEmail != null)
	{
		///sendNotification("", conEmail, "", "DEQ_APPLICATION_SUBMITTAL", emailParams, reportFile);
	}
}
//push