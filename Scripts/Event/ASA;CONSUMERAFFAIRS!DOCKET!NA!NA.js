//ASA;CONSUMERAFFAIRS!DOCKET!NA!NA
try {

	var currentUserID = aa.env.getValue("CurrentUserID");

	// DOCKET -22 Email vendor the docket application has been created
	if (!publicUser)
	{
		include("CA_SEND_VENDOR_EMAIL");
	}

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

		// Record Assigned to
		var assignedUserid = cd.getAsgnStaff();
		if (assignedUserid ==  null)
		{			
			cd.setAsgnStaff(thisUser);

			cdWrite = aa.cap.editCapDetail(cd)

			if (cdWrite.getSuccess())
				{ logDebug("Assigned CAP to " + thisUser) }
			else
				{ logDebug("**ERROR writing capdetail : " + cdWrite.getErrorMessage()) ; }
		}
	}

}
catch(err){
	logDebug("**WARN: Error in ASA updating short notes and address -  " + err.message);
}
