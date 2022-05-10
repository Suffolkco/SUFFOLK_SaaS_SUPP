//DUA:DEQ/WR/Commericial/Application
if (publicUser)
{ 
    
    var appStatus = getAppStatus(capId);
               
    if (isTaskActive("Application Review") && appStatus != "Received")   
    {
        updateTask("Application Review", "Resubmitted", "Additional information submitted by Applicant", "Additional information submitted by Applicant");
        updateAppStatus("Resubmitted");
    }

    if (isTaskActive("Plans Distribution") && isTaskStatus("Plans Distribution","Awaiting Client Reply"))
    {
        updateTask("Plans Distribution", "Resubmitted", "Additional information submitted by Applicant", "Additional information submitted by Applicant");
        updateAppStatus("Resubmitted");
    }

    if (isTaskActive("Inspections"))
    {
        updateTask("Inspections", "Resubmitted", "Additional information submitted by Applicant", "Additional information submitted by Applicant");
        updateAppStatus("Resubmitted");
    }

    if (isTaskActive("Final Review"))
    {
        updateTask("Final Review", "Resubmitted", "Additional information submitted by Applicant", "Additional information submitted by Applicant");
        updateAppStatus("Resubmitted");
    }

    if (appStatus == "Awaiting Client Reply")
    {
        updateAppStatus("Resubmitted");        
    }

    // EHIMS-4832: Resubmission after user already submitted.
    if (isTaskActive("Plans Coordination") || 
        appStatus == "Resubmitted" || 
        appStatus == "Review in Process")
    {
        // 1. Set a flag
        editAppSpecific("New Documents Uploaded", 'CHECKED', capId);
        
        // 2. Send email to Record Assignee                       
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
                var emailParams = aa.util.newHashtable();
                var reportFile = new Array();
                getRecordParams4Notification(emailParams);   
                addParameter(emailParams, "$$assignedUser$$",assignedUser.getFirstName() + " " + assignedUser.getLastName());                 
                addParameter(emailParams, "$$altID$$", capId.getCustomID());
                if (assignedUser.getEmail() != null)
                {
                    sendNotification("", assignedUser.getEmail() , "", "DEQ_WWM_REVIEW_REQUIRED", emailParams, reportFile);
                    logDebug("Email Sent here***************");
                    logDebug("Info: " + isTaskActive("Plans Coordination") + getAppStatus())
                }                    
            }
        }             
        
    }
}

function getAppStatus() {
	var itemCap = capId;
	if (arguments.length == 1) itemCap = arguments[0]; // use cap ID specified in args

	var appStatus = null;
   var capResult = aa.cap.getCap(itemCap);
   if (capResult.getSuccess()) {
      licCap = capResult.getOutput();
      if (licCap != null) {
         appStatus = "" + licCap.getCapStatus();
      }
   } else {
		logDebug("ERROR: Failed to get app status: " + capResult.getErrorMessage());
	}
	return appStatus;
}


function logDebug(dstr)
{
	//if (showDebug.substring(0,1).toUpperCase().equals("Y"))
	if(showDebug)
	{
		aa.print(dstr)
		emailText+= dstr + "<br>";
		aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"),dstr)
	}
}

