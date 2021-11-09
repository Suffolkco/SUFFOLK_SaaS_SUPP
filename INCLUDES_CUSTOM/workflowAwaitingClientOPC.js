function workflowAwaitingClientOPC(wfComments, capAddresses)
{
    logDebug("We're in OPC");

	var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var reportFile = new Array();
	var conArray = getContactArray();
	var conEmail = "";
	var fromEmail = "";
	var address1;				
	var city;
	var state;
	var zip;		

	var shortNotes = getShortNotes(capId);
	logDebug("My short notes are: " + shortNotes);
	
	if (capAddresses == null || capAddresses.length == 0)
    {
        logDebug("WARNING: no addresses on this CAP:" + capId);
        capAddresses = null;
    }   


	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
    }
      
     
    getRecordParams4Notification(emailParams);
    getWorkflowParams4Notification(emailParams);
     
	//addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
	addParameter(emailParams, "$$CAPAlias$$", cap.getCapType().getAlias());
	addParameter(emailParams, "$$altID$$", capId.getCustomID());
    addParameter(emailParams, "$$shortNotes$$", shortNotes); 
	addParameter(emailParams, "$$wfComments$$", wfComments);	
	// As a test

	var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
	acaSite = acaSite.substr(0, acaSite.toUpperCase().indexOf("/ADMIN"));
	//Save Record Direct URL
	addParameter(emailParams, "$$ACAURL$$", acaSite + getACAUrl());
	//addParameter(emailParams, "$$ACAURL$$", getACARecordURL()); 

	if (capAddresses != null)
    {
        addParameter(emailParams, "$$address$$", capAddresses[0]);
    }	

	for (con in conArray)
	{
		
		if (!matches(conArray[con].email, null, undefined, ""))
		{
			
			conEmail += conArray[con].email + "; ";
		}

		/*if (!matches(conArray[con].email, null, undefined, ""))
		{
			conEmail = conArray[con].email;
			
			address1 = conArray[con].addressLine1;				
			city = conArray[con].city;
			state = conArray[con].state;
			zip = conArray[con].zip;		
	
			addParameter(emailParams, "$$address1$$", address1);
			addParameter(emailParams, "$$city$$", city);
			addParameter(emailParams, "$$state$$", state);
			addParameter(emailParams, "$$zip$$", zip);	           
                                                
		}*/
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

	if (conEmail != null)
	{
		logDebug("Email addresses: " + conEmail);
		sendNotification("", conEmail, "", "DEQ_OPC_AWAITINGCLIENTREPLY", emailParams, reportFile);	
	}

	
}
function getACARecordURL() {

	itemCap = (arguments.length == 2) ? arguments[1] : capId;		
	var enableCustomWrapper = lookup("ACA_CONFIGS","ENABLE_CUSTOMIZATION_PER_PAGE");
	var acaRecordUrl = "";
	var id1 = itemCap.ID1;
	var id2 = itemCap.ID2;
	var id3 = itemCap.ID3;
	// MODIFY THIS It's in PROD!!!
	acaUrl = "https://aca.suffolkcountyny.gov/CitizenAccess/Cap/CapDetail.aspx?"
	var itemCapModel = aa.cap.getCap(capId).getOutput().getCapModel();
	acaRecordUrl = acaUrl + "/urlrouting.ashx?type=1000";   
	acaRecordUrl += "&Module=" + itemCapModel.getModuleName();
	acaRecordUrl += "&capID1=" + id1 + "&capID2=" + id2 + "&capID3=" + id3;
	acaRecordUrl += "&agencyCode=" + aa.getServiceProviderCode();
	if(matches(enableCustomWrapper,"Yes","YES")){
			 acaRecordUrl += "&FromACA=Y";
			logDebug("ACA record Url is:" + acaRecordUrl); 
			return acaRecordUrl;
		}
} 