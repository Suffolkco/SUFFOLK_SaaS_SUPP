function workflowPlanReviewApprovedBackflow()
{    
    var emailParams = aa.util.newHashtable();	
	var reportFile = new Array();
	var conArray = getContactArray();
	var conEmail = "";
	var fromEmail = "";
	var emailAddressArray = new Array();
    showDebug = true;
    
	var shortNotes = getShortNotes(capId);
	getRecordParams4Notification(emailParams);
    getWorkflowParams4Notification(emailParams);    

	addParameter(emailParams, "$$altID$$", capId.getCustomID());
    addParameter(emailParams, "$$shortNotes$$", shortNotes);

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
                var address1 = conArray[con].addressLine1;		
                var address2 = conArray[con].addressLine2;				
                var city = conArray[con].city;
               
                addParameter(emailParams, "$$address1$$", address1);
                addParameter(emailParams, "$$address2$$", address2);
                addParameter(emailParams, "$$city$$", city);
                
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

				logDebug("Time to send applicant: " + startDate.toLocaleTimeString());
				if (!emailSent)
				{
					sendNotification("", conEmail, "", "DEQ_WR_PLAN REVIEW BACKFLOW APPROVED", emailParams, reportFile);
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
								licProfScriptModel = lpArr[lp];
								logDebug("Address1:" + licProfScriptModel.getAddress1());
								logDebug("Address2:" + licProfScriptModel.getAddress2());
								var address1 = licProfScriptModel.getAddress1();		
								var address2 = licProfScriptModel.getAddress2();				
								var city = lpArr[lp].city;
							
								logDebug("address1: " + address1);
								logDebug("address2: " + address2);
								logDebug("city"  + city);
								addParameter(emailParams, "$$address1$$", address1);
								addParameter(emailParams, "$$address2$$", address2);
								addParameter(emailParams, "$$city$$", city);
								
								logDebug("Time to send CCC emails: " + startDate.toLocaleTimeString());
								sendNotification("", conEmail, "", "DEQ_WR_PLAN REVIEW BACKFLOW APPROVED", emailParams, reportFile);
								emailAddressArray.push(conEmail);
								logDebug("CCC email sending: " + conEmail );
							}
                            
                           
						}
						
					}
				}
			}
			if( lpArr[lp].getLicenseType()== "Engineer" || lpArr[lp].getLicenseType()== "Architect")
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
						licProfScriptModel = lpArr[lp];
						logDebug("Address1:" + licProfScriptModel.getAddress1());
						logDebug("Address2:" + licProfScriptModel.getAddress2());
						var address1 = licProfScriptModel.getAddress1();		
						var address2 = licProfScriptModel.getAddress2();				
						var city = lpArr[lp].city;
						
						logDebug("address1: " + address1);
						logDebug("address2: " + address2);
						logDebug("city"  + city);
						addParameter(emailParams, "$$address1$$", address1);
						addParameter(emailParams, "$$address2$$", address2);
						addParameter(emailParams, "$$city$$", city);

						logDebug("Time to send other LP emails: " + startDate.toLocaleTimeString());
						sendNotification("", conEmail, "", "DEQ_WR_PLAN REVIEW BACKFLOW APPROVED", emailParams, reportFile);
						emailAddressArray.push(conEmail);
						logDebug("Other LP email sending: " + conEmail );
					}
                }
			}
		}	
}

