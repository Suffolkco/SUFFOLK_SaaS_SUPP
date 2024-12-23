//ASA;CONSUMERAFFAIRS!DOCKET!NA!NA
try {

	if (!publicUser) {
	var currentUserID = aa.env.getValue("CurrentUserID");

	// DOCKET -22 Email vendor the docket application has been created
	// Greg will let us know if we need to send email to the vendor. Comment it for now.
	//include("CA_SEND_VENDOR_EMAIL");
	
	
	// DOCKET -21 Assign record to the creator after submission
	var thisUser = currentUserID;
	logDebug("currentUserID: " + currentUserID);			

	var userObj = aa.person.getUser(thisUser);
	if (!userObj.getSuccess())
	{
		logDebug("Could not find user to assign to");		
	}
	else
	{
		//1. Check if the record has been assigned
		var cdScriptObjResult = aa.cap.getCapDetail(capId);
		if (!cdScriptObjResult.getSuccess())
			{ logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ; }

		var cdScriptObj = cdScriptObjResult.getOutput();

		if (!cdScriptObj)
			{ logDebug("**ERROR: No cap detail script object") ; }

		cd = cdScriptObj.getCapDetailModel();
		var assignedUser = aa.person.getUser(thisUser).getOutput();
		// Record Assigned to	
		if (assignedUser !=  null)
		{	
			logDebug("Dept: " + assignedUser.getDeptOfUser());			
			cd.setAsgnDept(assignedUser.getDeptOfUser());	
			cd.setAsgnStaff(thisUser);

			cdWrite = aa.cap.editCapDetail(cd)

			if (cdWrite.getSuccess())
				{ logDebug("Assigned CAP to " + thisUser) }
			else
				{ logDebug("**ERROR writing capdetail : " + cdWrite.getErrorMessage()) ; }
		}

		logDebug("updateCapDetailsResult at record: " + cdWrite.getSuccess());

	}

}
}
catch(err){
	logDebug("**WARN: Error in ASA assigning -  " + err.message);
}

