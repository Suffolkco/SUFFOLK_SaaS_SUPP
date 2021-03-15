
var capAddresses = null;  
var parentCapId = getParentCapID4Renewal();
var b1ExpResult = aa.expiration.getLicensesByCapID(parentCapId);

var s_result = aa.address.getAddressByCapId(capId);
if(s_result.getSuccess())
{
	capAddresses = s_result.getOutput();	
}

if (wfTask == "Renewal Review" && wfStatus == "Awaiting Client Reply")
{
	logDebug("Renewal Review and PIncomplete.");          
	logDebug("In this loop Comments:" + wfComment);
	
	if (wfComment == null)
	{
		logDebug("Comments are empty.");
		workflowAwaitingClientOPC(" ", capAddresses);
	}
	else
	{
		logDebug("Comments are: " + wfComment);
		workflowAwaitingClientOPC(wfComment, capAddresses);
	}		
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
if (wfTask == "Renewal Review" && wfStatus == "Complete")
{
    if (b1ExpResult.getSuccess())
    {
        b1Exp = b1ExpResult.getOutput();
        curExp = b1Exp.getExpDate();         
        expDateCon = new Date(curExp.getMonth() + "/" + curExp.getDayOfMonth() + "/" + curExp.getYear());
        logDebug("Current expiration converted is: " + expDateCon);
        var year = expDateCon.getFullYear();
        var month = expDateCon.getMonth();
        var day = expDateCon.getDate();
        var newDate = new Date(year + 1, month, day);
        var dateMMDDYYYY = jsDateToMMDDYYYY(newDate);
        dateMMDDYYYY = aa.date.parseDate(dateMMDDYYYY);
        b1Exp.setExpDate(dateMMDDYYYY);
        b1Exp.setExpStatus("Pending");
        aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
        logDebug("Expiration of parent has been updated to + 1 year");	
    }
    var projIncomplete = aa.cap.getProjectByChildCapID(capId, "Renewal", "Incomplete");
    logDebug("Proj Inc " + projIncomplete.getSuccess());
    if(projIncomplete.getSuccess())
    {
        var projInc = projIncomplete.getOutput();
        for (var pi in projInc)
        {
            parentCapId = projInc[pi].getProjectID();
            logDebug("parentCapId: " + parentCapId);
            projInc[pi].setStatus("Complete");
            var updateResult = aa.cap.updateProject(projInc[pi]);
        }
    }     
}



