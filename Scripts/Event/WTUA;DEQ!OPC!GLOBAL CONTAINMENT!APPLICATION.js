var capAddresses = null;  

if (wfTask == "Inspections" && wfStatus == "Plan Changed")
{
	updateTask("Plans Distribution", "Awaiting Client Reply", "Plan corrections submitted by Applicant", "Plan corrections submitted by Applicant");
	workflowPlanRevisionsNeeded(" ", capAddresses);
} 

// Set expiration date to be one year after the approved date
var todaysDate = new Date();
var dateCon = (todaysDate.getMonth() + 1) + "/" + todaysDate.getDate() + "/" + todaysDate.getFullYear();
var dateAdd = addDays(dateCon, 365);
var dateMMDDYYY = jsDateToMMDDYYYY(dateAdd);
var b1ExpResult = aa.expiration.getLicensesByCapID(capId);
var capAddresses = null;  
var s_result = aa.address.getAddressByCapId(capId);
if(s_result.getSuccess())
{
	capAddresses = s_result.getOutput();	
}

if (wfTask == "Plans Coordination" && wfStatus == "Approved")
{    
	// Send email notification
	workflowPlansCoordinationApproved(capAddresses);			
	
    if (b1ExpResult.getSuccess())
    {
        b1Exp = b1ExpResult.getOutput();
        dateMMDDYYY = aa.date.parseDate(dateMMDDYYY);
        b1Exp.setExpDate(dateMMDDYYY);
        b1Exp.setExpStatus("Pending");
        aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
    }

	// EHIMS-5290: compare and copy contact
  copyAndCompareContacts();	
	
}
else if (wfTask == 'Plans Coordination' && wfStatus == 'Plan Revisions Needed')     
{
	logDebug("Plans coordination and Plan Revisions Needed.");          
	logDebug("In this loop Comments:" + wfComment);
	
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
else if (wfTask == 'Inspections' && wfStatus == 'Plan Changed')     
{
	logDebug("Inspections and Plan Changed.");          
	logDebug("In this loop Comments:" + wfComment);
	
	if (wfComment == null)
	{
		logDebug("Comments are empty.");
		workflowInspectionPlanChangedOPC(" ", capAddresses);
	}
	else
	{
		logDebug("Comments are: " + wfComment);
		workflowInspectionPlanChangedOPC(wfComment, capAddresses);
	}		
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
