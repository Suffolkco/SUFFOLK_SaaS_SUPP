//WTUA:DEQ/WWM/SUBDIVISION/APPLICATION
var showDebug = false; 

if (wfTask == "Application Review" && wfStatus == "Awaiting Client Reply")
{
    var submissionNoticeTxt = AInfo["Submission Rejection Text"];
    if (!matches(submissionNoticeTxt, null, undefined, ""))				
    {
        wwmWorkflowAdditionalInfo("Notice of Incomplete Submission Script", "RecordID");
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
if (wfTask == "Plans Coordination" && wfStatus == "Approved")
	{
        //workflowApprovalToConstruct();
        workflowApprovalToConstructWithPin();
	}
if (wfTask == "Inspections" && wfStatus == "Inspection Failure")
{
    var resultComments = inspectionResultComments();

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
if (wfTask == "Final Review" && wfStatus == "Approved")
	{
        //workflowFinalReviewApprovedWWM(); 
        workflowFinalReviewApprovedWWMWithPin();
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

function matches(eVal, argList) {
    for (var i = 1; i < arguments.length; i++) {
        if (arguments[i] == eVal) {
            return true;
        }
    }
    return false;
} 
function inspectionCompleted()
{
    var insps;
    var inspectionCompleted = false;
    var inspections = aa.inspection.getInspections(capId);
    logDebug("Has Inspections: " + inspections.getSuccess());
    if (inspections.getSuccess()) 
    {
        insps = inspections.getOutput();
        for (i in insps) 
        {			
            if (insp[i].getInspectionDate() != null && insps[i].getInspectionStatus() == "Complete")
            {
                logDebug("Inspection Date:" + insp[i].getInspectionDate());
                inspectionCompleted = true;
            }
            else
            {
                inspectionCompleted = false;
                break;
            }
            
        }
    
    }
    else
    {
        inspectionCompleted = false;
    }
    return inspectionCompleted;
}