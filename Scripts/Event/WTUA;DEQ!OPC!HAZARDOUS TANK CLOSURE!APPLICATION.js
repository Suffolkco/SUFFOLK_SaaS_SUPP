var s_result = aa.address.getAddressByCapId(capId);
var capAddresses = null;  

if(s_result.getSuccess())
{
	capAddresses = s_result.getOutput();
}

if (wfTask == 'Plans Coordination' && wfStatus == 'Approved')     
{	
	workflowPlansCoordinationApproved(capAddresses);			
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
else if (wfTask == "Inspections" && wfStatus == "Plan Changed")
{ 
	logDebug("Hazardous Tank Application in Inspection and Plan Changed.");  
	logDebug("wfComment: " + wfComment);
		
	if (wfComment == null)
	{
		workflowInspectionPlanChangedOPC(" ", capAddresses);
		logDebug("Comments are empty.");
	}
	else
	{
		logDebug("Comments are: " + wfComment);
		workflowInspectionPlanChangedOPC(wfComment, capAddresses);
	}

	updateTask("Plans Distribution", "Awaiting Client Reply", "Plan corrections submitted by Applicant", "Plan corrections submitted by Applicant");              
	logDebug("done in Inspections.")
}