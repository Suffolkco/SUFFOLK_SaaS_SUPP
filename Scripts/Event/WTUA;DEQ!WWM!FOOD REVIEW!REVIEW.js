var showDebug = false;
 
// EHIMS-831
if (wfTask == "Review" && (wfStatus == "Complete" || wfStatus == "OWM Review Required"))
{    
    //logDebug(wfComment + "is the value of wfComment.");
    //if (wfComment !== null)
    {
        logDebug("A report will be fired, with the Standard Comment inside.")
        workflowFoodReviewCompleteWWMLocal("Food Review Notice Script", "RecordID");       
              
    }
    
}

function workflowFoodReviewCompleteWWMLocal(reportName, reportParamRecID)
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

     // Save to record   
     var rFile = new Array();          
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
        conEmail += conArray[con].email + "; ";
	}
	getRecordParams4Notification(emailParams);
    getWorkflowParams4Notification(emailParams);
    
    //addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
    addParameter(emailParams, "$$altID$$", capId.getCustomID());
	if (conEmail != null)
	{
        sendNotification("", conEmail, "", "DEQ_WWM_FOOD_REVIEW_REQUIRED", emailParams, reportFile);
    }
    logDebug(conEmail + "is the e-mail address.");
}

