//PRA:DEQ/WR/Residence/Application
if (publicUser)
{ 
   try
   {
   // EHIMS-4832: Resubmission after user already submitted.
   if (getAppStatus(capId) == "Resubmitted" || getAppStatus(capId) == "Review in Process" || getAppStatus(capId) == "Pending")
   {
       // 1. Set a flag
       editAppSpecific("New Documents Uploaded", 'CHECKED', capId);
         
       // 2. Send email to Record Assignee                       
       var cdScriptObjResult = aa.cap.getCapDetail(capId);
       if (!cdScriptObjResult.getSuccess())           
       { 
        logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ;
      }

       var cdScriptObj = cdScriptObjResult.getOutput();

       if (!cdScriptObj)           
        { logDebug("**ERROR: No cap detail script object") ; 
        
    }

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
}
catch (err)
{
    message += "A system error has occured: " + err.message;
	debug = debug + " Additional Information Required: " + err.message;
    aa.sendMail("noreplyehims@suffolkcountyny.gov","ada.chan@suffolkcountyny.gov", "", "PRA RES debug", debug);
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
  
    // EHIMS-5036
    var appStatus = getAppStatus(capId);   

    var body = "appStatus: " + appStatus + " capId: " + capId + " Complete cap? " + cap.isCompleteCap() + "Assigned ID: " + assignedUserid;

    aa.sendMail("noreplyehims@suffolkcountyny.gov","ada.chan@suffolkcountyny.gov", "", "PRA WWM Resid App", body);

    
    // Only if the application has been reviewed
    if(appStatus != "Resubmitted" && appStatus != "Received" && !matches(appStatus, null, undefined, "", "null")) 
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
