//DUA:DEQ/WR/Residence/Application
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
    // EHIMS-5036     
    
    var body = "appStatus: " + appStatus + " capId: " + capId + " Complete cap? " + cap.isCompleteCap();

    aa.sendMail("noreplyehims@suffolkcountyny.gov","ada.chan@suffolkcountyny.gov", "", "DUA WWM Resid App", body);

    if (appStatus != "Received" && appStatus != "Resubmitted" && !matches(appStatus, null, undefined, "", "null")) 
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

