//WTUA:DEQ/WWM/COMMERCIAL/APPLICATION
var showDebug = true; 
var maxSeconds = 1;   // 1 seconds	
var emailText = "";
//EHIMS-5261
 // NOI report
 if (wfTask == "Plans Coordination" && wfStatus == "Internal Review")
{
	var reportParams1 = aa.util.newHashtable();
	reportParams1.put("RECORD_ID", capId.getCustomID());
	thisReport = 'Notice of Incomplete Script';
	// NOI report - from reportParams in the earlier loop.                           
	rFile = generateReport(thisReport, reportParams1, appTypeArray[0])
	logDebug("This is the NOI report: " + rFile);  
	thisFileDocArray = rFile.split("\\\\");	
	fileName = thisFileDocArray[1, thisFileDocArray.length - 1];		
	logDebug("fileName: " + fileName);
	var splitter = 'DEQWWM'
	var indexOf = fileName.indexOf(splitter);
	fileName = fileName.slice(indexOf+splitter.length);
	logDebug("fileName sliced: " + fileName);
	var docList = getDocumentList();
	
	for (doc in docList)
	{
		if (matches(docList[doc].getDocCategory(), "Notice of Incomplete"))
		{
			logDebug("***");
			debugObject(docList[doc]);
			logDebug("******");
			var docFileName = docList[doc].getFileName();			
			logDebug("*");
			logDebug("document type is: " + docList[doc].getDocCategory()+  ", " + docFileName);
			
			splitter = '/DEQ/WWM/'
			var indexOf = docFileName.indexOf(splitter);
			docFileName = docFileName.slice(indexOf+splitter.length);
			logDebug("docFileName sliced: " + docFileName);

			if (matches(docFileName, fileName))	
			{
				var docType = docList[doc].getDocCategory();								
				logDebug("******");					
				//it's the combination of two characters. So for first two zeros, 
				//it's the permission for Registered ACA Users, so if you set it to 00, no permission, set it to 11 and they have the permission. 
				//Then second two zeros are for CAP Creator and so forth.

				docList[doc].setViewTitleRole("0000000001");
				aa.document.updateDocument(docList[doc]);	
			}
		}
	}
}
//EHIMS-5151: 
// Get workflow history to make sure only the very first time we are at this task, we proceed:
//If workflow is approved, add 3 years to the Expiration date//
if (wfTask == "Plans Coordination" && wfStatus == "Approved")
{
	
	var wfHist = aa.workflow.getWorkflowHistory(capId, null);
	var wfHistArray = [];
	var count = 0;
	if (wfHist.getSuccess())
	{
		wfHist = wfHist.getOutput();	
		logDebug("Number of workflow history found for " + wfTask + " is " + wfHist.length);
		for (var h in wfHist)
		{
			if (wfHist[h].getTaskDescription() == "Plans Coordination" && wfHist[h].getDisposition() == "Approved")
			{
				count++;
				logDebug("Found history step: Count " + count + ": " + wfHist[h].getStepNumber() + ", " + wfHist[h].getProcessID() + ", " +
				wfHist[h].getTaskDescription() + ", " + wfHist[h].getDisposition());
			}
		}
		
	}
	var prelimCondTxt = AInfo["Permit Conditions Text"];
	if (!matches(prelimCondTxt, null, undefined, ""))				
	{
		workflowPrelimApprovalWithPin("WWM Permit Conditions", "WWM Permit Conditions Script", "RECORDID");
	}

	//workflowPrelimApproval("WWM Permit Conditions Script", "RECORDID");
	if (count == 1)
	{		
		//EHIMS-5151: Only if the workflow is the very first time, we add 3 years to the Expiration date//		
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
			logDebug("Setting new expiration date to: " + dateMMDDYYY + " and Pending renewal status.");
		}
		
	}
	else
	{
		logDebug("This is not the very first Plans Coordination and Approved task. Skip setting expiration date.")
	}
}
if (wfTask == "Inspections" &&  (wfStatus == "Inspection Failure" || wfStatus == "Inspection Failure- I/A Installed"))
{
	var resultComments = latestInspectionResultWithComments();

	if (resultComments)
	{
		workflowInspectionResultedWWM("Inspection Corrections Required Script", "RECORDID");
	}
}
if (wfStatus == "Partial Final Approval")
{
	workflowPartialReviewApproved();	
}

if (wfTask == "Inspections" && wfStatus == "Complete")
{		
	var completed = latestCompletedInspection();
	if (completed)
	{
		workflowInspectionResultedWWM("Inspection Completion Notice Script", "RECORD_ID");
	}
}
if (wfTask == "Application Review")
{
	if (wfStatus == "Awaiting Client Reply")
	{
		//wwmWorkflowAdditionalInfo("Notice of Incomplete Submission Script", "RecordID");
		var submissionNoticeTxt = AInfo["Submission Rejection Text"];
		if (!matches(submissionNoticeTxt, null, undefined, ""))				
		{
			wwmWorkflowAdditionalInfoWithPin("Notice of Incomplete Submission", "Notice of Incomplete Submission Script", "RecordID");
		}
		else
		{
			logDebug("prelimNoticeTxt is null or empty: " + submissionNoticeTxt);
		}
	}
	
} 
logDebug("wfTask is: " + wfTask);
logDebug("wfStatus is: " + wfStatus);

if (wfTask == "Final Review" && wfStatus == "Create STP Monitoring Record") 
{
	logDebug("Line 73");
	var methSew = AInfo["Method of Sewage Disposal"];

	logDebug("methSew:" + methSew);
	if (methSew == "Construct an STP")
	{
		logDebug("Line 79: Construct an STP");
		var parentId = getParent();
		var stpId = createChild("DEQ", "WWM", "STP", "Monitoring", "Sewage Treatment Plant Application", parentId);	
		if (stpId != null)
		{
			var nameInd = getAppSpecific("Name of Industrial Park, Subdivision, and/or Shopping Center", capId);
			logDebug("Name of..... is " + nameInd);
			editAppSpecific("STP Name Industrial Park", nameInd, stpId);
			logDebug("STP Name Industrial Park: " + stpId);
			logDebug("Copy Owner " + capId + "and" + stpId);
			copyOwner(capId, stpId);
		//	copyParcels(capId, stpId);
		//	copyContacts(capId, stpId);
		//	copyDocumentsToCapID(capId, stpId);
		logDebug("Copy lp " + capId + "and" + stpId);
			copyLicensedProf(capId, stpId);
			logDebug("Update complete status");
			updateAppStatus("Complete");
		}
	}
}

if (wfTask == "Plans Coordination" && wfStatus == "Plan Revisions Needed")
{
	var notOK = isTaskStatus("WWM Review", "Not OK");
	logDebug("Is this okay? : " + notOK);
	if(notOK)
	{
		//wwmWorkflowAdditionalInfo("Notice of Incomplete Script", "RECORD_ID");
		var prelimNoticeTxt = AInfo["Preliminary Notice Text"];
		if (!matches(prelimNoticeTxt, null, undefined, ""))				
		{
			wwmWorkflowAdditionalInfoWithPin("Notice of Incomplete", "Notice of Incomplete Script", "RECORD_ID");
		}
	}
}

if ((wfTask == "Final Review" && wfStatus == "Awaiting Client Reply") ||
    (wfTask == "Inspections" && wfStatus == "Awaiting Client Reply"))
    {
		//wwmWorkflowAdditionalInfo("Notice of Incomplete Final Script", "RecordID");
		var finalNoticeTxt = AInfo["Final Notice Text"];
		if (!matches(finalNoticeTxt, null, undefined, ""))				
		{
			/*do 
			{
				// nothing
			}
			while (elapsed() < maxSeconds);
			
			logDebug("Elapsed: " + elapsed());*/
			wwmWorkflowAdditionalInfoWithPin("Notice of Incomplete Final", "Notice of Incomplete Final Script", "RecordID");
			
			
			
		}
	}
if (wfTask == "Final Review" && wfStatus == "Approved")
	{
		//workflowFinalReviewApprovedWWM();
		workflowFinalReviewApprovedWWMWithPin();
	}

	if (wfTask == "Final Review" && wfStatus == "Awaiting O&M Contract")
{
	var contactResult = aa.people.getCapContactByCapID(capId);
	var capContacts = contactResult.getOutput();
	var allEmail = "";
	//getting all contact emails
	for (c in capContacts)
	{
		if (!matches(capContacts[c].email, null, undefined, ""))
		{
			allEmail += capContacts[c].email + ";";
		}
	}
	var lpResult = aa.licenseScript.getLicenseProf(capId);
	if (lpResult.getSuccess())
	{
		var lpArr = lpResult.getOutput();

		//getting all LP emails
		for (var lp in lpArr)
		{
			if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
			{
				allEmail += lpArr[lp].email + ";";
			}
		}
	}
	else 
	{
		logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage());
	}
	var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
	if (capParcelResult.getSuccess())
	{
		logDebug("capparcelresult is successful");
		var Parcels = capParcelResult.getOutput().toArray();
		for (zz in Parcels)
		{
			var parcelNumber = Parcels[zz].getParcelNumber();
		}
		logDebug("parcelnumber is " + parcelNumber);

	}
	var vEParams = aa.util.newHashtable();
	var addrResult = getAddressInALineCustom(capId);
	var altId = capId.getCustomID();
	addParameter(vEParams, "$$altID$$", getAppSpecific("IA Number"));
	addParameter(vEParams, "$$address$$", addrResult);
	var iaNumberToCheck = getAppSpecific("IA Number", capId);
	logDebug("ianumbertocheck is: " + iaNumberToCheck);
	if (!matches(iaNumberToCheck, null, "", undefined))
	{
	var iaNumberToFind = aa.cap.getCapID(iaNumberToCheck).getOutput();
	logDebug("ianumbertofind is: " + iaNumberToFind);
	}
	if (!matches(iaNumberToFind, null, "", undefined))
	{
	var pin = getAppSpecific("IA PIN Number", iaNumberToFind);
	logDebug("pin is: " + pin);
	}
	addParameter(vEParams, "$$pin$$", pin);
	addParameter(vEParams, "$$wwmAltID$$", altId);
	addParameter(vEParams, "$$Parcel$$", parcelNumber);
	sendNotification("", allEmail, "", "DEQ_IA_APPLICATION_NOTIFICATION", vEParams, null);
}



function loadTaskSpecific(wfName,itemName)  // optional: itemCap
{
var updated = false;
var i=0;
itemCap = capId;
if (arguments.length == 4) itemCap = arguments[3]; // use cap ID specified in args
//
// Get the workflows
//
var workflowResult = aa.workflow.getTaskItems(itemCap, wfName, null, null, null, null);
if (workflowResult.getSuccess())
	wfObj = workflowResult.getOutput();
else
	{ logDebug("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage()); return false; }

//
// Loop through workflow tasks
//
for (i in wfObj)
	{
	fTask = wfObj[i];
	stepnumber = fTask.getStepNumber();
	processID = fTask.getProcessID();
	if (wfName.equals(fTask.getTaskDescription())) // Found the right Workflow Task
		{
	TSIResult = aa.taskSpecificInfo.getTaskSpecifiInfoByDesc(itemCap,processID,stepnumber,itemName);
		if (TSIResult.getSuccess())
			{
			var TSI = TSIResult.getOutput();
			if (TSI != null)
				{
				var TSIArray = new Array();
				TSInfoModel = TSI.getTaskSpecificInfoModel();
				var readValue = TSInfoModel.getChecklistComment();
				return readValue;
				}
			else
				logDebug("No task specific info field called "+itemName+" found for task "+wfName);
				return null
			}
		else
			{
			logDebug("**ERROR: Failed to get Task Specific Info objects: " + TSIResult.getErrorMessage());
			return null
			}
		}  // found workflow task
	} // each task
	return null
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

			if (insps[i].getInspectionDate() != null && insps[i].inspection.getResultComment() != null &&
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


function elapsed() 
{
	var thisDate = new Date();
	var thisTime = thisDate.getTime();
	return ((thisTime - startTime) / 1000)
}



function CompareDate(dateOne, dateTwo) {    
	
	if (dateOne > dateTwo) {    
		logDebug("Date One is greater than Date Two.");    
	 }else {    
		logDebug("Date Two is greater than Date One.");    
	 }    
 }    


function convertDate(thisDate)
	{

	if (typeof(thisDate) == "string")
		{
		var retVal = new Date(String(thisDate));
		if (!retVal.toString().equals("Invalid Date"))
			return retVal;
		}

	if (typeof(thisDate)== "object")
		{

		if (!thisDate.getClass) // object without getClass, assume that this is a javascript date already
			{
			return thisDate;
			}

		if (thisDate.getClass().toString().equals("class com.accela.aa.emse.dom.ScriptDateTime"))
			{
			return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
			}
			
		if (thisDate.getClass().toString().equals("class com.accela.aa.emse.util.ScriptDateTime"))
			{
			return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
			}			

		if (thisDate.getClass().toString().equals("class java.util.Date"))
			{
			return new Date(thisDate.getTime());
			}

		if (thisDate.getClass().toString().equals("class java.lang.String"))
			{
			return new Date(String(thisDate));
			}
		if (thisDate.getClass().toString().equals("class java.sql.Timestamp"))
			{
			return new Date(thisDate.getMonth() + "/" + thisDate.getDate() + "/" + thisDate.getYear());
			}
		}

	if (typeof(thisDate) == "number")
		{
		return new Date(thisDate);  // assume milliseconds
		}

	logDebug("**WARNING** convertDate cannot parse date : " + thisDate);
	return null;

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

function latestCompletedInspection()
{
	var insps;
	var inspCompleted = false;
	var inspections = aa.inspection.getInspections(capId);
	var shortestdays = null;
	var inspIdToUse;

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

			if (insps[i].getInspectionDate() != null)
			{
				var inspDate = new Date(insps[i].getInspectionDate().getMonth() + "/" + insps[i].getInspectionDate().getDayOfMonth() + "/" + insps[i].getInspectionDate().getYear());
				logDebugLocal("inspDate: " + inspDate);			
	
				var year = insps[i].getInspectionDate().getYear();
				var month = insps[i].getInspectionDate().getMonth();
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
				logDebugLocal("Latest inspection ID is: " + inspIdToUse + ", Inspection date: " + shortestdays + " with status: " + insps[i].getInspectionStatus());								
			}
		}	

		// Only look at the most recent inspection with status "Incomplete"
		var inspResultObj = aa.inspection.getInspection(capId, inspIdToUse);
		logDebugLocal("Inspection ID:" + inspIdToUse);		

		if (inspResultObj.getSuccess()) 
		{
			var inspObj = inspResultObj.getOutput();
			logDebugLocal("Inspection Status:" + inspObj.getInspectionStatus());	
			if (inspObj && inspObj.getInspectionStatus() == "Complete")
			{
				inspCompleted = true;
				logDebugLocal("Inspection ID is used:" + inspIdToUse);		
			}
		}
	}
	return inspCompleted;
}

function latestInspectionResultWithComments()
{
	var insps;
	var inspResultComments = false;
	var inspections = aa.inspection.getInspections(capId);
	var shortestdays = null;
	var inspIdToUse = null;
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
				var month = insps[i].getInspectionDate().getMonth();
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
				logDebugLocal("Latest inspection ID is: " + inspIdToUse + ", Inspection date: " + shortestdays + " with status: " + insps[i].getInspectionStatus());								
			}
		}	

		// Only look at the most recent inspection with status "Incomplete"
		if (inspIdToUse != null)
		{
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
	}
	return inspResultComments;
}

function dateDifference(date1, date2)
{
    return (convertDate(date2).getTime() - convertDate(date1).getTime()) / (1000 * 60 * 60 * 24);
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

//FUNCTION NAME: copyDocumentsToCapID
function copyDocumentsToCapID(fromCapID, toCapID)
{

var opDocArray = aa.document.getDocumentListByEntity(fromCapID.toString(),"CAP").getOutput();
var vDocArray = opDocArray.toArray();
for (var vCounter in vDocArray)
{
var vDoc = vDocArray[vCounter];
aa.document.createDocumentAssociation(vDoc, toCapID.toString(), "CAP");
}

}
//END FUNCTION NAME: copyDocumentsToCapID

//FUNCTION NAME: copyPORDocs
function copyPORDocs(ipFromCapID,ipToCapID)
{
var vDocList = aa.document.getDocumentListByEntity(ipFromCapID,"CAP").getOutput();
if (vDocList)
{
for (var vCounter = 0; vCounter < vDocList.size(); vCounter++)
{
var vDocModel = vDocList.get(vCounter);
var vDocGroup = vDocModel.docGroup;
var vDocCat = vDocModel.docCategory;
if (vDocGroup != "COMMON" || vDocCat != "Proof of Record")
continue;
vDocModel.setCapID(ipToCapID);
vDocModel.setEntityID(ipToCapID.toString());
aa.document.createDocument(vDocModel);
}
}
}
//END FUNCTION NAME: copyPORDocs

function getDocumentList()
{
    // Returns an array of documentmodels if any
    // returns an empty array if no documents

    var docListArray = new Array();

    docListResult = aa.document.getCapDocumentList(capId, currentUserID);

    if (docListResult.getSuccess())
    {
        docListArray = docListResult.getOutput();
    }
    return docListArray;
}

function generateReportLocal(aaReportName,parameters,rModule) {
	var reportName = aaReportName;
      
    report = aa.reportManager.getReportInfoModelByName(reportName);
    report = report.getOutput();
    
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
