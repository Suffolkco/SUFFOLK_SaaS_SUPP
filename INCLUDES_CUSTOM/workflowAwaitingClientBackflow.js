function workflowAwaitingClientBackflow()
{
	var emailParams = aa.util.newHashtable();
	var conArray = getContactArray();
	var conEmail = "";
    var emailAddressArray = new Array();
    
    var shortNotes = getShortNotes(capId);

    getRecordParams4Notification(emailParams);
    getWorkflowParams4Notification(emailParams);
    addParameter(emailParams, "$$altID$$", capId.getCustomID());
    addParameter(emailParams, "$$shortNotes$$", shortNotes);
    
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
                sendNotification("", conEmail, "", "DEQ_WR_AWAITING CLIENT REPLY", emailParams, null);
                emailAddressArray.push(conEmail);
                logDebug("email sending: " + conEmail );
            }
		}
    }

    var lpResult = aa.licenseScript.getLicenseProf(capId);
    if (lpResult.getSuccess())
    { 
        var lpArr = lpResult.getOutput();
        for (var lp in lpArr)
        {
            var attArray = lpArr[lp].getAttributes();            
            if (attArray != null)
            {
                for (var i = 0; i < attArray.length; i++)
                {
                    if (attArray[i].getAttributeName() == "CCC REPRESENTATIVE EMAIL")
                    {
                        var cccRepEm = attArray[i].getAttributeValue();
                        
                        if (!matches(cccRepEm, null, undefined, ""))
                        {
                            conEmail = cccRepEm;
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
                                sendNotification("", conEmail, "", "DEQ_WR_AWAITING CLIENT REPLY", emailParams, null);
                                emailAddressArray.push(conEmail);
                                logDebug("email sending: " + conEmail );
                            }
                        }
                    }													
                }
            }	
            if(lpArr[lp].getLicenseType()== "Engineer" || lpArr[lp].getLicenseType()== "Architect")
            {
                conEmail = lpArr[lp].getEmail()

                if (!matches(conEmail, null, undefined, ""))               
                {                    
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
                        sendNotification("", conEmail, "", "DEQ_WR_AWAITING CLIENT REPLY", emailParams, null);
                        emailAddressArray.push(conEmail);
                        logDebug("email sending: " + conEmail );
                    }                
                  
                }
            }            
            
        }
    }
    else 
    { 
        logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
    }
}