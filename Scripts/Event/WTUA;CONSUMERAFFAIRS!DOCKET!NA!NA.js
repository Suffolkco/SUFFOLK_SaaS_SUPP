//WTUA;CONSUMERAFFAIRS!DOCKET!NA!NA
showDebug = true;

// DOCKET #19: Look up custom field entry to relate Complaints and License Records
if (wfTask == 'Enter Hearing Info' && wfStatus == 'Complete')
{
	// Link Complaint and License Number
	include("CA_LINK_LICENSE_NUMBER");


	//DOCKET #29: Update License Status
	// Get license Number
	include("CA_UPDATE_LICENSE_STATUS");

	

	//DOCKET #11: Add a meeting in calendar based on the hearing time and date
	//MeetingScript

}
//DOCKET #8: Script to create violation automatically based on the violation cheatsheet custom list
else if (wfTask == 'Create Violations' && wfStatus == 'Complete')
{
	//Consumer Info
	//Vendor Info
	//Violation Date
	//Case Number
	//Charge
	//Reference Violation Number
	logDebug("Loading cheat sheet");

	//1.  How to convert Vendor Info text field into Violation record? Which field to map to?
	//2. Same as vendor Info
	//3. Violation Date -> Custom Field VIOLATION INFORMAIONT -> Date of Violation?
	//4.  What is Case number map to in violation record
	cheatSheet = loadASITable("VIOLATION CHEAT SHEET")
   //logDebug("Amount of swimming pools on this record are: " + swimPools.length);
   

   for (c in cheatSheet)
   {
	
		var item = cheatSheet[c]["Item"];
	   var vioDate = cheatSheet[c]["Violation Date"];
	   var occDate = cheatSheet[c]["Occurence Date"];
	   var caseNo = cheatSheet[c]["Case Number"];	  
	   var caseNo = cheatSheet[c]["Case Number"];
	   var charge = cheatSheet[c]["Charge"];
	   var createVio = cheatSheet[c]["Create Violation"];
	   var vioNo = cheatSheet[c]["Reference Violation Number"];
	   var withdrawVio = cheatSheet[c]["Withdraw Violation"];	   
	   var abbDesc = cheatSheet[c]["Abbreviated Description"];

	   logDebug("vioNo: " + vioNo);
	   logDebug("createVio: " + createVio);
	   // Only if they enable the flag and the field is empty
	   if (createVio == 'CHECKED' && vioNo == null)
	   {
			var violationChild = createChildLocal("ConsumerAffairs", "Docket", "NA", "NA");
			if (violationChild != null)
			{		
				logDebug("createVio: " + vioDate);
				editAppSpecific("Date of Violation(Occurence)", vioDate, violationChild);     							
				copyContacts(capId, violationChild);
				
				// Put the newly created violation record ID back to the cheat sheet
				vioAltId = violationChild.getCustomID();
				logDebug("vioAltId: " + vioAltId);
				
				//function editASITableRowViaRowIdentifer(tableCapId, tableName, editName, editValue, rowValue, rowIdentifier) {
				editASITableRowViaRowIdentifer(capId, "VIOLATION CHEAT SHEET", "Reference Violation Number", vioAltId, item, "Item");
				
			}
		}
		if (withdrawVio == 'CHECKED') // What do we do here? Unrelated or just set the Violation status to be withdraw?
		{
			// 
		}
	}


}
// DOCKET #52: A script to send notification to account (Greg, Matt, Danielle, Carolyn, James)clerks/director of the unit. License to “Revoke” automatically and notify James and Matt on licensing?
else if (wfTask == "Hearing")
{
	if (wfStatus == "Withdrawn" || wfStatus == "AOD" || wfStatus == "Licensed Waiver" || wfStatus == "Unlicensed Waiver")
	{	
		// What template to use? 
	}
}
//DOCKET # 39 Script to assign the record to the director automatically if the status is set to “Review for Amendment”
else if (wfStatus == "Review for Amendment")
{	
	var cdScriptObjResult = aa.cap.getCapDetail(capId);
	if (!cdScriptObjResult.getSuccess())
		{ logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ; }

	var cdScriptObj = cdScriptObjResult.getOutput();

	if (!cdScriptObj)
		{ logDebug("**ERROR: No cap detail script object") ; }

	cd = cdScriptObj.getCapDetailModel();

	// Record Assigned to
	assignUserID = 'JANDREWS';
	iNameResult = aa.person.getUser(assignUserID) 
	if(iNameResult.getSuccess())
	{
		assignedUser = iNameResult.getOutput();     
		logDebug("Assigned user: " + assignedUser.getFirstName() + " " + assignedUser.getLastName());	
		cd.setAsgnStaff(assignedUser);
		cdWrite = aa.cap.editCapDetail(cd)

		if (cdWrite.getSuccess())
			{ logDebug("Assigned CAP to " +assignedUser.getFirstName() + " " + assignedUser.getLastName()); }
		else
			{ logDebug("**ERROR writing capdetail : " + cdWrite.getErrorMessage()) ; }
	}
	
}
// DOCKET # 54 @NOD task, a script to automatically populate the Payment due date
else if (wfTask == "Director Review" && wfStatus == "Complete")
{
	var startDate = new Date();
	var startTime = startDate.getTime();
	var todayDate = (startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear();

	editAppSpecific("Payment Due Date", todayDate);
}
// DOCKET #42: Email the vendor the task has been set to 'Complete'
else if (wfTask == 'NOD' && wfStatus == 'Complete')
{
	include("CA_SEND_VENDOR_EMAIL_TASK_COMPLETED");
}
// DOCKET #15: Send email notification when payment has been made
else if (wfTask == 'Payment')
{
	if (wfStatus == 'Paid-Online' || wfStatus == 'Paid')
	{
		//Email notification that payment has been submitted online. Account clerks, all directors 
		//(Supervisors – Greg, Danielle, Matt…etc. when someone pay online when it is in collections external.   
	}
	else if (wfStatus == 'Withdrawn' || wfStatus == 'Partial')//!!!! Partial is missing in workflow
	{
		// send an email to the vendor and investigator and account clerk (Mary) that partial payment has been received.  
	}
	else if (wfStatus == 'NOD Payment Agreement')
	{

	}
} 

function createChildLocal(grp, typ, stype, cat, desc) // optional parent capId
{
    //
    // creates the new application and returns the capID object
    //

    var itemCap = capId
    if (arguments.length > 5) itemCap = arguments[5]; // use cap ID specified in args

    var appCreateResult = aa.cap.createApp(grp, typ, stype, cat, desc);
    logDebug("creating cap " + grp + "/" + typ + "/" + stype + "/" + cat);
    if (appCreateResult.getSuccess())
    {
        var newId = appCreateResult.getOutput();
        logDebug("cap " + grp + "/" + typ + "/" + stype + "/" + cat + " created successfully ");

        // create Detail Record
        capModel = aa.cap.newCapScriptModel().getOutput();
        capDetailModel = capModel.getCapModel().getCapDetailModel();
        capDetailModel.setCapID(newId);
        aa.cap.createCapDetail(capDetailModel);

        var newObj = aa.cap.getCap(newId).getOutput();	//Cap object
        var result = aa.cap.createAppHierarchy(itemCap, newId);
        if (result.getSuccess())
            logDebug("Child application successfully linked");
        else
            logDebug("Could not link applications");

       
			return newId;
    }
    else
    {
        logDebug("**ERROR: adding child App: " + appCreateResult.getErrorMessage());
    }
}