function workflowInspectionResultedWWM(reportName, reportParamRecID)
{
	var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var reportFile = new Array();

	var conEmail = "";
    var fromEmail = "";
    var itemCap = aa.cap.getCap(capId).getOutput();
	appTypeResult = itemCap.getCapType();
	appTypeString = appTypeResult.toString(); 
	appTypeArray = appTypeString.split("/");
    var alternateID = capId.getCustomID();

		reportParams.put(reportParamRecID, alternateID.toString());

		rFile = generateReport(reportName,reportParams, appTypeArray[0])
        logDebug("This is the rFile: " + rFile);           
        
            if (rFile) {
            reportFile.push(rFile);
            }
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
