//PRA:DEQ/WR/Residence/Application
if (publicUser)
{ 
    // EHIMS-4832: Resubmission after user already submitted.    
    if (isTaskActive("Plans Coordination") || 
    getAppStatus() == "Resubmitted" || getAppStatus() == "Review in Process")
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
                }                    
            }
        }      
      
    }
    if (isTaskActive("Application Review") && isTaskStatus("Application Review","Awaiting Client Reply"))
    {
        updateTask("Application Review", "Resubmitted", "Additional payment submitted by Applicant", "Additional payment submitted by Applicant");        
    }

    if (isTaskActive("Plans Distribution") && isTaskStatus("Plans Distribution","Awaiting Client Reply"))
    {
        updateTask("Plans Distribution", "Resubmitted", "Additional payment submitted by Applicant", "Additional payment submitted by Applicant");       
    }

    if (isTaskActive("Inspections"))
    {
        updateTask("Inspections", "Resubmitted", "Additional payment submitted by Applicant", "Additional payment submitted by Applicant");        
    }

    if (isTaskActive("Final Review") && isTaskStatus("Final Review","Awaiting Client Reply"))
    {
        updateTask("Final Review", "Resubmitted", "Additional payment submitted by Applicant", "Additional payment submitted by Applicant");       
    }

    var appStatus = getAppStatus(capId);
    
    // Only if the application has been reviewed
    if(appStatus != "Received")
    {
        updateAppStatus("Resubmitted");
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

function editAppSpecific(itemName, itemValue) // optional: itemCap
{
	var itemCap = capId;
	var itemGroup = null;
	if (arguments.length == 3)
		itemCap = arguments[2]; // use cap ID specified in args
	if (useAppSpecificGroupName) {
		if (itemName.indexOf(".") < 0) {
			//logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true");
			return false
		}
		itemGroup = itemName.substr(0, itemName.indexOf("."));
		itemName = itemName.substr(itemName.indexOf(".") + 1);
	}
	var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(itemCap, itemName, itemValue, itemGroup);
	if (appSpecInfoResult.getSuccess()) {
		if (arguments.length < 3) //If no capId passed update the ASI Array
			AInfo[itemName] = itemValue;
	} else {
		//logDebug("WARNING: " + itemName + " was not updated.");
	}
}
