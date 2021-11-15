//WTUA:DEQ/WWM/RESIDENCE/APPLICATION
var showDebug = true; 
var maxSeconds = 1;   // 1 seconds	
var emailText = "";
var sewMeth = AInfo["Method of Sewage Disposal"];
//If workflow is approved, add 3 years to the Expiration date//
if (wfTask == "Plans Coordination" && wfStatus == "Approved")
{
    b1ExpResult = aa.expiration.getLicensesByCapID(capId)
    if (b1ExpResult.getSuccess())
    {
        b1Exp = b1ExpResult.getOutput();
        var todaysDate = new Date();
        var todDateCon = (todaysDate.getMonth() + 1) + "/" + todaysDate.getDate() + "/" + (todaysDate.getFullYear());
        //logDebug("This is the current month: " + todaysDate.getMonth());
        //logDebug("This is the current day: " + todaysDate.getDate());
        //logDebug("This is the current year: " + todaysDate.getFullYear());
        b1Exp = b1ExpResult.getOutput();
        var dateAdd = addDays(todDateCon, 1095);
        var dateMMDDYYY = jsDateToMMDDYYYY(dateAdd);

        dateMMDDYYY = aa.date.parseDate(dateMMDDYYY);
		b1Exp.setExpDate(dateMMDDYYY);
		b1Exp.setExpStatus("Pending");
        aa.expiration.editB1Expiration(b1Exp.getB1Expiration());       
    }
}
if (wfTask == "Inspections" &&  (wfStatus == "Inspection Failure" || wfStatus == "Inspection Failure- I/A Installed"))
{
	var resultComments = latestInspectionResultWithComments();

	if (resultComments)
	{
		workflowInspectionResultedWWM("Inspection Corrections Required", "RECORDID");
	}
}
/*if (wfTask == "Inspections" && wfStatus == "Partial Final Approval")
    {
        THIS IS FORTHCOMING
	} 
*/

if (wfTask == "Inspections" && wfStatus == "Complete")
{
	var completed = inspectionCompleted();
	if (completed)
	{

	workflowInspectionResultedWWM("Inspection Completion Notice", "RECORD_ID");
	}
}
if (wfTask == "Application Review" && wfStatus == "Awaiting Client Reply")
{
	//wwmWorkflowAdditionalInfo("Notice of Incomplete Submission Script", "RecordID");
	var submissionNoticeTxt = AInfo["Submission Rejection Text"];
	if (!matches(submissionNoticeTxt, null, undefined, ""))				
	{
		wwmWorkflowAdditionalInfoWithPin("Notice of Incomplete Submission", "Notice of Incomplete Submission Script", "RecordID");
	}
}
if (wfTask == "Plans Coordination" && wfStatus == "Plan Revisions Needed")
{
	var notOK = isTaskStatus("WWM Review", "Not OK");
	logDebug("Is this okay? : " + notOK);
	if(notOK)
	{
		var prelimNoticeTxt = AInfo["Preliminary Notice Text"];
		if (!matches(prelimNoticeTxt, null, undefined, ""))				
		{
		//wwmWorkflowAdditionalInfo("Notice of Incomplete Script", "RECORD_ID");
			wwmWorkflowAdditionalInfoWithPin("Notice of Incomplete", "Notice of Incomplete Script", "RECORD_ID");
		}
	}
}
if (wfTask == "Plans Coordination" && wfStatus == "Approved")
	{
		//workflowPrelimApproval("WWM Permit Conditions Script", "RECORDID");
		var prelimCondTxt = AInfo["Permit Conditions Text"];
		if (!matches(prelimCondTxt, null, undefined, ""))				
		{
			workflowPrelimApprovalWithPin("WWM Permit Conditions", "WWM Permit Conditions Script", "RECORDID");
		}
	}
	
if ((wfTask == "Final Review" && wfStatus == "Awaiting Client Reply") ||
(wfTask == "Inspections" && wfStatus == "Awaiting Client Reply"))
{
	//wwmWorkflowAdditionalInfo("Notice of Incomplete Final Script", "RecordID");
	var finalNoticeTxt = AInfo["Final Notice Text"];
	if (!matches(finalNoticeTxt, null, undefined, ""))				
	{
		do 
		{
			// nothing
		}
		while (elapsed() < maxSeconds);
		
		logDebug("Elapsed: " + elapsed());
	
		wwmWorkflowAdditionalInfoWithPin("Notice of Incomplete Final", "Notice of Incomplete Final Script", "RecordID");
	
	}
}
if (wfTask == "Final Review" && wfStatus == "Approved")
	{
		//workflowFinalReviewApprovedWWM();
		workflowFinalReviewApprovedWWMWithPin();
	}
function logDebugLocal(dstr)
{
	if (showDebug)
	{
		aa.print(dstr)
		emailText += dstr + "<br>";
		aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr)
	}
}

function latestInspectionResultWithComments()
{
	var insps;
	var inspResultComments = false;
	var inspections = aa.inspection.getInspections(capId);
	var shortestdays = null;
	var inspIdToUse;
	var inspStatus;

	logDebugLocal("Has Inspections: " + inspections.getSuccess());
	if (inspections.getSuccess()) 
	{
		insps = inspections.getOutput();
		
		// Get the latest inspection
		for (i in insps) 
		{				
			logDebugLocal("inspection comment: " + insps[i].getInspectionComments());
			logDebugLocal("Inspection Date:" + insps[i].getInspectionDate());
			logDebugLocal("getInspectionStatus: " + insps[i].getInspectionStatus());		
			logDebugLocal("comment?: " + insps[i].inspection.getResultComment());

			if (insps[i].getInspectionDate() != null && insps[i].inspection.getResultComment() != null)
			{
				var inspDate = new Date(insps[i].getInspectionDate().getMonth() + "/" + insps[i].getInspectionDate().getDayOfMonth() + "/" + insps[i].getInspectionDate().getYear());
				logDebugLocal("inspDate: " + inspDate);			
	
				var year = insps[i].getInspectionDate().getYear();
				var month = insps[i].getInspectionDate().getMonth() - 1;
				var day = insps[i].getInspectionDate().getDayOfMonth();
				var hr = insps[i].getInspectionDate().getHourOfDay();
				var min = insps[i].getInspectionDate().getMinute();
				var sec = insps[i].getInspectionDate().getSecond();
				var todaysDate = new Date();			
				var todDateCon = (todaysDate.getMonth() + 1) + "/" + todaysDate.getDate() + "/" + (todaysDate.getFullYear());
				
				var inspectionDateCon = month + "/" + day + "/" + year;
				
				logDebug("Today Date is: " + todDateCon + ". Inspection Date is: " + inspectionDateCon);					
				var dateDiff = parseFloat(dateDifference(inspectionDateCon, todDateCon));
				logDebug("Day difference is: " + dateDiff);
				

				if (shortestdays == null || (dateDiff < shortestdays))
				{
					inspIdToUse = insps[i].getIdNumber();
					logDebug("getIDNumber: " + inspIdToUse);
					logDebug("Date difference is: " + dateDiff + " which is shorter than: " + shortestdays);					
					shortestdays = dateDiff;	
				}				
				
							
			}	
			if (shortestdays != null)
			{
				logDebugLocal("Latest inspection ID is: " + inspIdToUse + ", Inspection date: " + shortestdays + " with status: " + inspStatus);								
			}
		}	

		// Only look at the most recent inspection with status "Incomplete"
		var inspResultObj = aa.inspection.getInspection(capId, inspIdToUse);
		logDebugLocal("Inspection ID:" + inspIdToUse);		

		if (inspResultObj.getSuccess()) 
		{
			var inspObj = inspResultObj.getOutput();
			logDebugLocal("Inspection Status:" + inspObj.getInspectionStatus());	
			if (inspObj && inspObj.getInspectionStatus() == "Incomplete")
			{
				inspResultComments = true;
				logDebugLocal("Inspection ID is used:" + inspIdToUse);		
			}
		}
	}
	return inspResultComments;
}

function inspectionResultComments()
{
	var insps;
	var inspResultComments = false;
	var inspections = aa.inspection.getInspections(capId);
	var latestInspDate = null;
	var inspIdToUse;

	logDebug("Has Inspections: " + inspections.getSuccess());
	if (inspections.getSuccess()) 
	{
		insps = inspections.getOutput();
		
		// Get the latest inspection
		for (i in insps) 
		{				
			logDebug("inspection comment: " + insps[i].getInspectionComments());
			logDebug("Inspection Date:" + insps[i].getInspectionDate());
			logDebug("getInspectionStatus: " + insps[i].getInspectionStatus());		
			logDebug("comment?: " + insps[i].inspection.getResultComment());

			if (insps[i].getInspectionDate() != null && insps[i].inspection.getResultComment() != null &
			insps[i].getInspectionStatus() == "Incomplete")
			{
				var inspDate = new Date(insps[i].getInspectionDate().getMonth() + "/" + insps[i].getInspectionDate().getDayOfMonth() + "/" + insps[i].getInspectionDate().getYear());
				logDebug("inspDate: " + inspDate);			
	
				var year = insps[i].getInspectionDate().getYear();
				var month = insps[i].getInspectionDate().getMonth() - 1;
				var day = insps[i].getInspectionDate().getDayOfMonth();
				var hr = insps[i].getInspectionDate().getHourOfDay();
				var min = insps[i].getInspectionDate().getMinute();
				var sec = insps[i].getInspectionDate().getSecond();
				logDebug("year, month, day, hr, min, sec:" + year + "," + month + "," + day + "," + hr + "," + min + "," + sec);
				var newDate = new Date(year, month, day, hr, min, sec);
				logDebug("newDate:" + newDate);

				if (latestInspDate == null || (latestInspDate > newDate))
				{
					inspIdToUse = insps[i].getIdNumber();
					logDebug("getIDNumber: " + inspIdToUse);
					logDebug("latestInspDate: " + latestInspDate);
					logDebug("newDate: " + newDate);
					latestInspDate = newDate;
					logDebug("latestInspDate is greater than newDate");
					inspResultComments = true;
				}				
			}					
		}	
	}
	
	return inspResultComments;
}

function inspectionCompleted()
{
	var insps;
	var inspCompleted = false;
	var inspections = aa.inspection.getInspections(capId);
	logDebug("Has Inspections: " + inspections.getSuccess());
	if (inspections.getSuccess()) 
	{
		insps = inspections.getOutput();
		for (i in insps) 
		{			
			logDebug("getInspectionDate: " + insps[i].getInspectionDate());
			logDebug("getInspectionStatus: " + insps[i].getInspectionStatus());
			if (insps[i].getInspectionDate() != null && insps[i].getInspectionStatus() == "Complete")
			{
				logDebug("Inspection Date:" + insps[i].getInspectionDate());
				inspCompleted = true;
			}
			else
			{
				inspCompleted = false;
				break;
			}
			
		}
	
	}
	else
	{
		inspCompleted = false;
	}
	return inspCompleted;
}

function elapsed() {
	var thisDate = new Date();
	var thisTime = thisDate.getTime();
	return ((thisTime - startTime) / 1000)
}

function matches(eVal, argList) {
	for (var i = 1; i < arguments.length; i++) {
		if (arguments[i] == eVal) {
			return true;
		}
	}
	return false;
} 
function addDays(date, days) 
{
	var result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}
function jsDateToMMDDYYYY(pJavaScriptDate) {
	//converts javascript date to string in MM/DD/YYYY format
	if (pJavaScriptDate != null) {
		if (Date.prototype.isPrototypeOf(pJavaScriptDate)) {
			return (pJavaScriptDate.getMonth() + 1).toString() + "/" + pJavaScriptDate.getDate() + "/" + pJavaScriptDate.getFullYear();
		} else {
			logDebug("Parameter is not a javascript date");
			return ("INVALID JAVASCRIPT DATE");
		}
	} else {
		logDebug("Parameter is null");
		return ("NULL PARAMETER VALUE");
	}
}
function dateAddMonths(pDate, pMonths) {
	// Adds specified # of months (pMonths) to pDate and returns new date as string in format MM/DD/YYYY
	// If pDate is null, uses current date
	// pMonths can be positive (to add) or negative (to subtract) integer
	// If pDate is on the last day of the month, the new date will also be end of month.
	// If pDate is not the last day of the month, the new date will have the same day of month, unless such a day doesn't exist in the month, 
	// in which case the new date will be on the last day of the month
	if (!pDate) {
		baseDate = new Date();
	} else {
		baseDate = convertDate(pDate);
	}
	var day = baseDate.getDate();
	baseDate.setMonth(baseDate.getMonth() + pMonths);
	if (baseDate.getDate() < day) {
		baseDate.setDate(1);
		baseDate.setDate(baseDate.getDate() - 1);
		}
	return ((baseDate.getMonth() + 1) + "/" + baseDate.getDate() + "/" + baseDate.getFullYear());
}

function convertDate(thisDate) {
	//converts date to javascript date
	if (typeof(thisDate) == "string") {
		var retVal = new Date(String(thisDate));
		if (!retVal.toString().equals("Invalid Date"))
		return retVal;
	}
	if (typeof(thisDate)== "object") {
		if (!thisDate.getClass) {// object without getClass, assume that this is a javascript date already 
			return thisDate;
		}
		if (thisDate.getClass().toString().equals("class com.accela.aa.emse.dom.ScriptDateTime")) {
			return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
		}
		if (thisDate.getClass().toString().equals("class java.util.Date")) {
			return new Date(thisDate.getTime());
		}
		if (thisDate.getClass().toString().equals("class java.lang.String")) {
			return new Date(String(thisDate));
		}
	}
	if (typeof(thisDate) == "number") {
		return new Date(thisDate);  // assume milliseconds
	}
	logDebug("**WARNING** convertDate cannot parse date : " + thisDate);
	return null;
}
//push