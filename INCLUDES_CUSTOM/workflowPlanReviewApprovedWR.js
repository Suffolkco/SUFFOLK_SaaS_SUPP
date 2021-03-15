function workflowPlanReviewApprovedWR()
{
	
	var emailParams = aa.util.newHashtable();	
	var reportFile = new Array();
	var conArray = getContactArray();
	var conEmail = "";
    var fromEmail = "";
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
					sendNotification("", conEmail, "", "DEQ_WR_PLAN REVIEW APPROVED", emailParams, reportFile);
					emailAddressArray.push(conEmail);
					logDebug("email sending: " + conEmail );
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
								sendNotification("", conEmail, "", "DEQ_WR_PLAN REVIEW APPROVED", emailParams, reportFile);
								emailAddressArray.push(conEmail);
								logDebug("CCC email sending: " + conEmail );
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
					sendNotification("", conEmail, "", "DEQ_WR_PLAN REVIEW APPROVED", emailParams, reportFile);
					emailAddressArray.push(conEmail);
					logDebug("LP email sending: " + conEmail );
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
					sendNotification("", conEmail, "", "DEQ_WR_PLAN REVIEW APPROVED", emailParams, reportFile);
					emailAddressArray.push(conEmail);
					logDebug("Other LP email sending: " + conEmail );
				}
			}
		}
	}

}