function workflowPlanReviewApprovedWR()
{
	
	var emailParams = aa.util.newHashtable();	
	var reportFile = new Array();
	var conArray = getContactArray();
	var conEmail = "";
    var fromEmail = "";
	var emailAddressArray = new Array();
	var combinedEmails = "";

	getRecordParams4Notification(emailParams);
    getWorkflowParams4Notification(emailParams);    
	var waterDistrict = getAppSpecific("Water District", capId);
	var appName = cap.getSpecialText();

	addParameter(emailParams, "$$altID$$", capId.getCustomID());
	addParameter(emailParams, "$$waterdistrict$$", waterDistrict);
	addParameter(emailParams, "$$appname$$", appName);

	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
	}
	for (con in conArray)
	{
		if (!matches(conArray[con].email, null, undefined, ""))
		{
			if (conArray[con].contactType == "Applicant")
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
					//sendNotification("", conEmail, "", "DEQ_WR_PLAN REVIEW APPROVED", emailParams, reportFile);
					emailAddressArray.push(conEmail);
					combinedEmails += conEmail + "; ";
					logDebug("Contact emails list: " + conEmail );
				}  
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
	
	// Send email to each contact separately.
	for (var lp in lpArr)
	{
		if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
		{
			if( lpArr[lp].getLicenseType()== "Community Water Supply")
			{
				var attArray = lpArr[lp].getAttributes();
				if (attArray != null)
				{
					for (var i = 0; i < attArray.length; i++)
					{
						if (attArray[i].getAttributeName() == "CCC REPRESENTATIVE EMAIL")
						{
							var cccRepEm = attArray[i].getAttributeValue();
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
								//sendNotification("", conEmail, "", "DEQ_WR_PLAN REVIEW APPROVED", emailParams, reportFile);
								emailAddressArray.push(conEmail);
								combinedEmails += conEmail + "; ";
								
							}
						}
						
					}
				}
				
				conEmail = lpArr[lp].email;
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
					//sendNotification("", conEmail, "", "DEQ_WR_PLAN REVIEW APPROVED", emailParams, reportFile);
					emailAddressArray.push(conEmail);
					combinedEmails += conEmail + "; ";
					
				}
			}
			else
			{
				conEmail = lpArr[lp].email;
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
					//sendNotification("", conEmail, "", "DEQ_WR_PLAN REVIEW APPROVED", emailParams, reportFile);
					emailAddressArray.push(conEmail);
					combinedEmails += conEmail + "; ";
					
				}
			}
		}
	}

	if (combinedEmails != null)
	{		
		sendNotification("", combinedEmails, "", "DEQ_WR_PLAN REVIEW APPROVED", emailParams, reportFile);
		logDebug("Contact and LP emails list sent: " + combinedEmails );
	}
	sendNotification("", "ada.chan@suffolkcountyny.gov", "", "DEQ_WR_PLAN REVIEW APPROVED", emailParams, reportFile);
	logDebug("Admin semail sent: ");
}