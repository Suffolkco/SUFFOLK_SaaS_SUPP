//WTUA:DEQ/OPC/SWIMMING POOL/APPLICATION

showDebug = false;
var conArray = getContactArray();
var conEmail = "";
var workAppStatus = "Awaiting Client Reply";
var cap;
var emailParams = aa.util.newHashtable();
var reportFile = null;
var altId = capId.getCustomID();
var workflowResult = aa.workflow.getTasks(capId);
var swimPools = loadASITable("SWIMMING POOL INFORMATION");
var totalPools = swimPools.length;
var indoorArray = new Array();
var outdoorArray = new Array();
var capAddresses = null;  
var b1ExpResult = aa.expiration.getLicensesByCapID(capId);
if (b1ExpResult.getSuccess())
{
	b1Exp = b1ExpResult.getOutput();
	var newDate = new Date();
	var todaysDate = new Date();
	var todDateCon = (newDate.getMonth() + 1) + "/" + newDate.getDate() + "/" + (newDate.getFullYear());
	//logDebug("This is the current month: " + newDate.getMonth());
	//logDebug("This is the current day: " + newDate.getDate());
	//logDebug("This is the current year: " + newDate.getFullYear());
	var dateAdd = addDays(todDateCon, 365);
	var dateMMDDYYY = jsDateToMMDDYYYY(dateAdd);

	var year = newDate.getFullYear();
	var yearOne = newDate.getFullYear() + 1;
	var yearTwo = newDate.getFullYear() + 2;

	var newIndExpDate = new Date("12/31" + "/" + year);

	var newIndExpDateSame = (newIndExpDate.getMonth() + 1) + "/" + newIndExpDate.getDate() + "/" + newIndExpDate.getFullYear();

	var newIndExpDateOne = (newIndExpDate.getMonth() + 1) + "/" + newIndExpDate.getDate() + "/" + (newIndExpDate.getFullYear() + 1);

	var newIndExpDateTwo = (newIndExpDate.getMonth() + 1) + "/" + newIndExpDate.getDate() + "/" + (newIndExpDate.getFullYear() + 2);

	var newOutExpDate = new Date("9/30" + "/" + year);

	var newOutExpDateSame = (newOutExpDate.getMonth() + 1) + "/" + newOutExpDate.getDate() + "/" + newOutExpDate.getFullYear();

	var newOutExpDateOne = (newOutExpDate.getMonth() + 1) + "/" + newOutExpDate.getDate() + "/" + (newOutExpDate.getFullYear() + 1);

	var newOutExpDateTwo = (newOutExpDate.getMonth() + 1) + "/" + newOutExpDate.getDate() + "/" + (newOutExpDate.getFullYear() + 2);
}
//logDebug("This is how many rows my table has: " + totalPools);
if(totalPools != null && totalPools >= 1)
{
	for(p in swimPools)
	{
		var poolLoc = swimPools[p]["Location"];
		if (poolLoc == "Indoor")
		{
			//logDebug("Indoor pool!");
			indoorArray.push(poolLoc);
		}
		else
		{
			//logDebug("Outdoor pool!");
			outdoorArray.push(poolLoc);
		}
	} 
}
if ((wfTask == "Plans Distribution" && wfStatus == "Approved") || 
(wfTask == "Plans Coordination" && wfStatus == "Approved"))
{
	dateMMDDYYY = aa.date.parseDate(dateMMDDYYY);
	b1Exp.setExpDate(dateMMDDYYY);
	aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
}
else if (wfTask == "Inspections" && wfStatus == "Modification")
{
    updateFee("SP-AP-AMD", "DEQ_POOLAPP", "FINAL", 1, "Y");
}
else if (wfTask == "Inspections" && wfStatus == "Plan Changed")
{
	updateTask("Plans Distribution", "Awaiting Client Reply", "Plan revisions needed", "Plan revisions needed");
	var s_result = aa.address.getAddressByCapId(capId);
	if(s_result.getSuccess())
	{
		capAddresses = s_result.getOutput();
		if (capAddresses != null)
		{                              
			var output = '';
			for (property in capAddresses) {
				output += "<font color=red>" + property + "</font>" + ': ' + "<bold>" + capAddresses[property] + "</bold>" + '; ' + "<BR>";
			}
			logDebug(output);  
		}
		else
		{
			logDebug("capaddresses is null.");
		}
	}
	for (i in wfObj)
    {
        fTask = wfObj[i];

            if (fTask.getDisposition() != null && fTask.getCompleteFlag() == "N")
            {
                wfComment = fTask.getDispositionComment();               
            }                
	}
	workflowInspectionPlanChangedOPC(wfComment, capAddresses);
}
else if (wfTask == 'Plans Coordination' && wfStatus == 'Plan Revisions Needed')     
{
	logDebug("Plans coordination and Plan Revisions Needed.");          
	logDebug("In this loop Comments:" + wfComment);
	var s_result = aa.address.getAddressByCapId(capId);
	if(s_result.getSuccess())
	{
		capAddresses = s_result.getOutput();
		if (capAddresses != null)
		{                              
			var output = '';
			for (property in capAddresses) {
				output += "<font color=red>" + property + "</font>" + ': ' + "<bold>" + capAddresses[property] + "</bold>" + '; ' + "<BR>";
			}
			logDebug(output);  
		}
		else
		{
			logDebug("capaddresses is null.");
		}		
	}

	if (wfComment == null)
	{
		logDebug("Comments are empty.");
		workflowPlanRevisionsNeeded(" ", capAddresses);
	}
	else
	{
		logDebug("Comments are: " + wfComment);
		workflowPlanRevisionsNeeded(wfComment, capAddresses);
	}		
}
else if (wfTask == "Operation Review" && wfStatus == "Incomplete")
{
	if (workflowResult.getSuccess())
	{
		var wfObj = workflowResult.getOutput();
	}
	else
	{ 
		logDebug("**ERROR: Failed to get workflow object"); 
	}
	for (i in wfObj)
	{
		fTask = wfObj[i];

			if (fTask.getTaskDescription().equals("Operation Review") && fTask.getDisposition() != null && fTask.getDisposition().equals("Incomplete") && fTask.getCompleteFlag() == "N")
			{
				var adhocComs = fTask.getDispositionComment();
				logDebug("Adhoc comments are: " + adhocComs);
			}
		
	}
	getWorkflowParams4Notification(emailParams); 
	addParameter(emailParams, "$$wfComments$$", adhocComs);

	for (con in conArray)
		{
		addParameter(emailParams, "$$altID$$", altId);
		if (conArray[con].contactType == "Applicant")
			{
				conEmail = conArray[con].email + ";";
			}
		}
		if (conEmail != null)
		{
			sendNotification("", conEmail, "", "DEQ_OPC_POOL_REVIEW_INCOMPLETE", emailParams, reportFile);
		}
		else
		{
			logDebug("<b>" + "Contact has no email address.</b>");
		}
	updateAppStatus(workAppStatus, "Set to " + workAppStatus + " by batch process.");
}

if (wfTask == "Operation Review" && wfStatus == "Complete" && balanceDue <= 0)
{
	//logDebug("This is how many pools are in my indoor array: " + indoorArray.length);
	//logDebug("This is how many pools are in my outdoor array: " + outdoorArray.length);
	if (indoorArray.length >=1 && outdoorArray.length == 0)
	{
		if (isEven(year))
		{
			logDebug("We have only indoor pools, updating epiration date to 12/31" + "/" + yearTwo);
			newIndExpDateTwo = aa.date.parseDate(newIndExpDateTwo);
			b1Exp.setExpDate(newIndExpDateTwo);
			b1Exp.setExpStatus("Active");
			aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
		}
		else
		{
			logDebug("We have only indoor pools, updating epiration date to 12/31" + "/" + yearOne);
			newIndExpDateOne = aa.date.parseDate(newIndExpDateOne);
			b1Exp.setExpDate(newIndExpDateOne);
			b1Exp.setExpStatus("Active");
			aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
		}
	}  
	if (outdoorArray.length >=1 && indoorArray.length == 0)
	{
		if (isOdd(year))
		{
			logDebug("We have only outdoor pools, updating epiration date to 9/30" + "/" + yearTwo);
			newOutExpDateTwo = aa.date.parseDate(newOutExpDateTwo);
			b1Exp.setExpDate(newOutExpDateTwo);
			b1Exp.setExpStatus("Active");
			aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
		}
		else
		{
			logDebug("We have only outdoor pools, updating epiration date to 9/30" + "/" + yearOne);
			newOutExpDateOne = aa.date.parseDate(newOutExpDateOne);
			b1Exp.setExpDate(newOutExpDateOne);
			b1Exp.setExpStatus("Active");
			aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
		}
	}
}
if (wfTask == "Final Review" && wfStatus == "Approved")
{
	updateAppStatus("Complete");
}
function isOdd(n) 
{
   return Math.abs(n % 2) == 1;
}
function isEven(n) 
{
    return n % 2 == 0;
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