function workflowFoodReviewCompleteWWM(reportName, reportParamRecID)
{
	var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var reportFile = new Array();
	var conArray = getContactArray();
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

	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
	}
	for (con in conArray)
	{
		if (conArray[con].contactType == "Applicant")
		{
			conEmail += conArray[con].email + "; ";
        }
    
	}
	getRecordParams4Notification(emailParams);
    getWorkflowParams4Notification(emailParams);
    
    //addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
    addParameter(emailParams, "$$altID$$", capId.getCustomID());
	if (conEmail != null)
	{
        sendNotification("", conEmail, "", "DEQ_WWM_FOOD_REVIEW_COMPLETE", emailParams, reportFile);
    }
    logDebug(conEmail + "is the e-mail address.");
}
