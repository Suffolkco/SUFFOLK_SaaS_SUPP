//PRA:DEQ/WR/Commercial/Application
if (publicUser)
{ 
    // EHIMS-4832: Resubmission after user already submitted.
    if  (itemCapType == "DEQ/WWM/Residence/Application" || 
        itemCapType == "DEQ/WWM/Subdivision/Application" ||        
        itemCapType == "DEQ/WWM/Commercial/Application")
    {
        if (getAppStatus() == "Resubmitted" || getAppStatus() == "Review in Process" )
        {
            // Send email, set a flag
            editAppSpecific("New Documents Uploaded", 'CHECKED', capId);
            
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
