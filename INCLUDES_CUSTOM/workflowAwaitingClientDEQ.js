function workflowAwaitingClientDEQ()
{
	var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var reportFile = new Array();
	var conArray = getContactArray();
	var conEmail = "";
	var fromEmail = "";
	var itemCap = aa.cap.getCap(capId).getOutput();
	var appTypeResult = itemCap.getCapType();
	var appTypeString = appTypeResult.toString(); 
	var appTypeArray = appTypeString.split("/");
	showDebug = false;
	var emailAddressArray = new Array();

	getRecordParams4Notification(emailParams);
    getWorkflowParams4Notification(emailParams);   
	addParameter(emailParams, "$$altID$$", capId.getCustomID());
    
	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
	}
	for (con in conArray)
	{
		if (!matches(conArray[con].email, null, undefined, ""))
		{
			conEmail = conArray[con].email;
			var emailSent = false;
			for (x in emailAddressArray)
            {
                if (matches(emailAddressArray[x], conEmail))
                {
                    emailSent = true;
                    logDebug("Found: " + conEmail + " in the array. Not sending email again.");
                }
            }   
            if (!emailSent)
            {
				sendNotification("", conEmail, "", "DEQ_WWM_AWAITING CLIENT REPLY", emailParams, reportFile);
				emailAddressArray.push(conEmail);
                logDebug("email sending: " + conEmail );
			}
		}
	}

	// EHIMS-5041
	var itemCapType = aa.cap.getCap(capId).getOutput().getCapType().toString();
	if(!matches(itemCapType, "DEQ/WWM/Residence/Application", "DEQ/WWM/Commercial/Application"))
	{
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
				conEmail = lpArr[lp].getEmail();
				var emailSent = false;
				for (x in emailAddressArray)
				{
					if (matches(emailAddressArray[x], conEmail))
					{
						emailSent = true;
						logDebug("Found: " + conEmail + " in the array. Not sending email again.");
					}
				}
				if (!emailSent)
				{
					sendNotification("", conEmail, "", "DEQ_WWM_AWAITING CLIENT REPLY", emailParams, reportFile);
					emailAddressArray.push(conEmail);
					logDebug("email sending: " + conEmail );
				}
			} 
		}
	}
	
	/*
	if (appTypeArray[1] == "WWM")
	{
		if (conEmail != null)
		{
		sendNotification("", conEmail, "", "DEQ_WWM_AWAITING CLIENT REPLY", emailParams, reportFile);
		logDebug("We're in WWM");
		}
	}
	
	else if (appTypeArray[1] == "WR")
	{
		if (conEmail != null)
		{
		sendNotification("", conEmail, "", "DEQ_WR_AWAITING CLIENT REPLY", emailParams, reportFile);
		logDebug("We're in WR");
		}
	}

	else if (appTypeArray[1] == "Ecology")
	{
		if (conEmail != null)
		{
		sendNotification("", conEmail, "", "DEQ_WWM_AWAITING CLIENT REPLY", emailParams, reportFile);
		logDebug("We're in Ecology");
		}
	}
	else
	{
		if (conEmail != null)
		{
		sendNotification("", conEmail, "", "DEQ_WWM_AWAITING CLIENT REPLY", emailParams, reportFile);
		logDebug("We're in General");
		}
	} */
} 