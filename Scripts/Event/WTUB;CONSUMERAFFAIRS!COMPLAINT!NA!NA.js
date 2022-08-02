
// WTUB;CONSUMERAFFAIRS!COMPLAINT!NA!NA.js
showMessage=true;
showDebug=true;

if (wfTask == "Assignment" && wfStatus == "Assigned")
{
    
    // DAP-508: When Greg changes the workflow Assignment -> Assigned task in the workflow, 
    // email to the complainant with attachment
    if (currentUserID == 'GSPENCER' || currentUserID == 'ACHAN')
    {
        // Block update if the record has not been assigned

        //1. Check if the record has been assigned
        var cdScriptObjResult = aa.cap.getCapDetail(capId);
        if (!cdScriptObjResult.getSuccess())
            { logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ; }

        var cdScriptObj = cdScriptObjResult.getOutput();

        if (!cdScriptObj)
            { logDebug("**ERROR: No cap detail script object") ; }

        cd = cdScriptObj.getCapDetailModel();

        // Record Assigned to
        var assignedUserid = cd.getAsgnStaff();
        if (assignedUserid !=  null)
        {
            iNameResult = aa.person.getUser(assignedUserid) 
            if(iNameResult.getSuccess())
            {
            assignedUser = iNameResult.getOutput();     
            logDebug("Assigned user: " + assignedUser.getFirstName() + " " + assignedUser.getLastName());
            }
        }
        else
        {
            cancel = true;
            showMessage = true;
            comment("This Complaint Record cannot be set to assigned until the record has been assigned. Please confirm if the record has been assigned.");
        }
    } 
    
} 


