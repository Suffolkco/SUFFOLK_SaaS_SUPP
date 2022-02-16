function workflowPrelimApproval(reportName, reportParamRecID)
{
	var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var reportFile = new Array();
	var conArray = getContactArray();
	var conEmail = "";
    var fromEmail = "";
	var itemCap = aa.cap.getCap(capId).getOutput();
	var alternateID = capId.getCustomID();

	/*
	appTypeResult = itemCap.getCapType();
	appTypeString = appTypeResult.toString(); 
	appTypeArray = appTypeString.split("/");
	if(appTypeArray[0] == "WWM")
	{	

    var alternateID = capId.getCustomID(); 
*/
		reportParams.put(reportParamRecID, alternateID.toString());

		rFile = generateReport(reportName, reportParams, appTypeArray[0])
        logDebug("This is the rFile: " + rFile);           
        
            if (rFile) {
            reportFile.push(rFile);
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
	addACAUrlsVarToEmail(emailParams);
	
	if (conEmail != null)
	{
        sendNotification("", conEmail, "", "DEQ_WWM_PRELIMINARY_REVIEW_APPROVED", emailParams, null);
    }
}

function generateReport(aaReportName,parameters,rModule) {
	var reportName = aaReportName;
      
    report = aa.reportManager.getReportInfoModelByName(reportName);
	report = report.getOutput();
	logDebug("This is the report output: " + report);
  
    report.setModule(rModule);
    report.setCapId(capId);

    report.setReportParameters(parameters);

    var permit = aa.reportManager.hasPermission(reportName,currentUserID);

    if(permit.getOutput().booleanValue()) {
       var reportResult = aa.reportManager.getReportResult(report);
     
       if(reportResult) {
	       reportResult = reportResult.getOutput();
	       var reportFile = aa.reportManager.storeReportToDisk(reportResult);
			logMessage("Report Result: "+ reportResult);
	       reportFile = reportFile.getOutput();
	       return reportFile
       } else {
       		logMessage("Unable to run report: "+ reportName + " for Admin" + systemUserObj);
       		return false;
       }
    } else {
         logMessage("No permission to report: "+ reportName + " for Admin" + systemUserObj);
         return false;
    }
}