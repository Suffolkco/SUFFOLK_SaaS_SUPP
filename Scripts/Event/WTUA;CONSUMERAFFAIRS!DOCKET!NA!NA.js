//WTUA;CONSUMERAFFAIRS!DOCKET!NA!NA
showDebug = true;

// DOCKET #19: Look up custom field entry to relate Complaints and License Records
if (wfTask == 'Enter Hearing Info' && wfStatus == 'Complete')
{

	var licenseNumber = loadTaskSpecific(wfTask, "License Number");
	var complaintNumber = loadTaskSpecific(wfTask, "Complaint Number");
	logDebug("licenseNumber TSI: " + licenseNumber);
	logDebug("complaintNumber TSI: " + complaintNumber);
	
	
	// License is always the parent. Link Docket and Complaint Number as the child of license
	if (licenseNumber != null || complaintNumber != null)
	{		
		// Map the TSI to ASI as well.
		editAppSpecific("License Number", licenseNumber, capId);	
		editAppSpecific("Complaint Number", complaintNumber, capId);

		logDebug("license number ASI 1: " + loadAppSpecific("License Number"));
		logDebug("complaint number ASI 1: " + loadAppSpecific("Complaint Number"));

		include("CA_LINK_LICENSE_NUMBER");
	}

	// Map All TSI to ASI as well.
	editAppSpecific("Hearing Date", loadTaskSpecific(wfTask, "Hearing Date"), capId);	
	editAppSpecific("Hearing Time", loadTaskSpecific(wfTask, "Hearing Time"), capId);

	editAppSpecific("Pre-Hearing Conference Date", loadTaskSpecific(wfTask, "Pre-Hearing Conference Date"), capId);	
	editAppSpecific("Pre-Hearing Conference Time", loadTaskSpecific(wfTask, "Pre-Hearing Conference Time"), capId);

	
	editAppSpecific("License Expiration Date", loadTaskSpecific(wfTask, "License Expiration Date"), capId);

	editAppSpecific("Payment Due Date", loadTaskSpecific(wfTask, "Payment Due Date"), capId);	
	editAppSpecific("License Obtained Due Date", loadTaskSpecific(wfTask, "License Obtained Due Date"), capId);

	


	//DOCKET #29: Update License Status
	if (licenseNumber != null)
	{
		var licenseNumber = getAppSpecific("License Number", capId);
		logDebug("licenseNumber ASI: " + licenseNumber);

		// This is pulling the license number from ASI License Number which we have already mapped.
		include("CA_UPDATE_LICENSE_STATUS");
		var licenseStatus = getAppSpecific("License Status", capId);
		logDebug("licenseStatus ASI: " + licenseStatus);

		editTaskSpecific(wfTask, "License Status", licenseStatus, capId);

		// The CA_UPDATE_LICENSE_STATUS already set the ASI field.
		//editAppSpecific("License Status", loadTaskSpecific(wfTask, "License Status"), capId);	

	}
	

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
   
   var complaintNumber = getAppSpecific("Complaint Number", capId);
   logDebug("complaintNumber: " + complaintNumber);
	// License as Parent -> Complaint -> Violation
	var capComplaintResult = aa.cap.getCapID(complaintNumber);

	cmpCapId = getApplication(complaintNumber);

	logDebug("cmpCapId " + cmpCapId);
   for (c in cheatSheet)
   {
	
		var item = cheatSheet[c]["Item"];
	   var vioDate = cheatSheet[c]["Violation Date"];
	   var occDate = cheatSheet[c]["Occurence Date"];
	   var caseNo = cheatSheet[c]["Case Number"];	  
	  
	   var charge = cheatSheet[c]["Charge"];
	   var createVio = cheatSheet[c]["Create Violation"];
	   var vioNo = cheatSheet[c]["Reference Violation Number"];
	    
	   var abbDesc = cheatSheet[c]["Abbreviated Description"];

	   logDebug("vioNo: " + vioNo);
	   logDebug("createVio: " + createVio);
	   // Only if they enable the flag and the field is empty
	   if (createVio == 'CHECKED' && (vioNo == null || vioNo == ""))
	   {
			if (capComplaintResult.getSuccess()) {
				cmpCapId = capComplaintResult.getOutput();		
				logDebug("cmpCapId: " + cmpCapId);			
			}
			
			var violationChild = createChildLocal("ConsumerAffairs", "Violation", "NA", "NA", cmpCapId);
			if (violationChild != null)
			{		
				logDebug("Violation date: " + vioDate);
				editAppSpecific("Date of Violation(Occurence)", vioDate, violationChild);     							
				copyContacts(capId, violationChild);
				
				// Put the newly created violation record ID back to the cheat sheet
				vioAltId = violationChild.getCustomID();
				logDebug("vioAltId: " + vioAltId);
				
				//function editASITableRowViaRowIdentifer(tableCapId, tableName, editName, editValue, rowValue, rowIdentifier) {
				editASITableRowViaRowIdentifer(capId, "VIOLATION CHEAT SHEET", "Reference Violation Number", vioAltId, item, "Item");
				editASITableRowViaRowIdentifer(capId, "VIOLATION CHEAT SHEET", "Case Number", complaintNumber, item, "Item");
				
			}
		}
		
		
	}


}
// DOCKET #52: A script to send notification to account (Greg, Matt, Danielle, Carolyn, James)clerks/director of the unit. License to “Revoke” automatically and notify James and Matt on licensing?
else if (wfTask == "Hearing")
{
	if (wfStatus == "Withdrawn" || wfStatus == "AOD" || wfStatus == "Licensed Waiver" || wfStatus == "Unlicensed Waiver")
	{	
		var staffEmailsToSend = lookup("DCA_Docket_Email_List", "All");   	
		sendNotification("", staffEmailsToSend, "", "DCA_DOCKET_HEARING", emailParams, null);	
		
	}

	// Map All TSI to ASI as well.
	editAppSpecific("Vendor Attorney Present", loadTaskSpecific(wfTask, "Vendor Attorney Present"), capId);	
	editAppSpecific("Consumer Attorney Present", loadTaskSpecific(wfTask, "Consumer Attorney Present"), capId);
	editAppSpecific("Vendor Present", loadTaskSpecific(wfTask, "Vendor Present"), capId);	
	editAppSpecific("Consumer Present", loadTaskSpecific(wfTask, "Consumer Present"), capId);	
	editAppSpecific("Vendor Witnesses", loadTaskSpecific(wfTask, "Vendor Witnesses"), capId);
	editAppSpecific("Consumer Witnessess", loadTaskSpecific(wfTask, "Consumer Witnessess"), capId);	
	editAppSpecific("Translator Used", loadTaskSpecific(wfTask, "Translator Used"), capId);

	editAppSpecific("Waiver Due Date Amount", loadTaskSpecific(wfTask, "Waiver Due Date Amount"), capId);
	editAppSpecific("Number of Default Hearings", loadTaskSpecific(wfTask, "Number of Default Hearings"), capId);
	editAppSpecific("Waiver Due Date License", loadTaskSpecific(wfTask, "Waiver Due Date License"), capId);
	editAppSpecific("Settlement Due Date", loadTaskSpecific(wfTask, "Settlement Due Date"), capId);
	editAppSpecific("Number of Full Hearings", loadTaskSpecific(wfTask, "Number of Full Hearings"), capId);
	editAppSpecific("AOD Date Signed", loadTaskSpecific(wfTask, "AOD Date Signed"), capId);
	editAppSpecific("AOD Date Due Amount", loadTaskSpecific(wfTask, "AOD Date Due Amount"), capId);

	editAppSpecific("A63 Unlicensed", loadTaskSpecific(wfTask, "A63 Unlicensed"));
	editAppSpecific("A64 Unlicensed", loadTaskSpecific(wfTask, "A64 Unlicensed"));
	editAppSpecific("A65 Licensed", loadTaskSpecific(wfTask, "A65 Licensed"));
	editAppSpecific("A66 Unlicensed", loadTaskSpecific(wfTask, "A66 Unlicensed"));
	editAppSpecific("A67 Adjournment Letter", loadTaskSpecific(wfTask, "A67 Adjournment Letter"));
	editAppSpecific("A67a COVID19 Adjournment Letter", loadTaskSpecific(wfTask, "A67a COVID19 Adjournment Letter"));
	editAppSpecific("A68 Adjournment Letter", loadTaskSpecific(wfTask, "A68 Adjournment Letter"));
	editAppSpecific("A69 Notification", loadTaskSpecific(wfTask, "A69 Notification"));
	editAppSpecific("A63 Unlicensed", loadTaskSpecific(wfTask, "A70 Notification"));
	editAppSpecific("A71 Notification", loadTaskSpecific(wfTask, "A71 Notification"))
	editAppSpecific("A72 Notification", loadTaskSpecific(wfTask, "A72 Notification"))
	editAppSpecific("A73 Adjournment Letter", loadTaskSpecific(wfTask, "A73 Adjournment Letter"))
	editAppSpecific("A74 Adjournment Letter", loadTaskSpecific(wfTask, "A74 Adjournment Letter"))
	editAppSpecific("A75 Adjournment Letter", loadTaskSpecific(wfTask, "A75 Adjournment Letter"))
	editAppSpecific("A76 Adjournment Letter", loadTaskSpecific(wfTask, "A76 Adjournment Letter"))
    

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

	editTaskSpecific("Director Review", "Payment Due Date", todayDate);
	editAppSpecific("Payment Due Date", todayDate);
}
// DOCKET #42: Email the vendor the task has been set to 'Complete'
else if (wfTask == 'NOD' && wfStatus == 'Complete')
{
	include("CA_SEND_VENDOR_EMAIL_TASK_COMPLETED");
	// Automatically update the Payment Due Date + 40!!!!!!!!!!!!!!!!!!! To do Ada
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

function loadTaskSpecific(wfName,itemName)  // optional: itemCap
{
	var updated = false;
	var i=0;
	itemCap = capId;
	if (arguments.length == 4) itemCap = arguments[3]; // use cap ID specified in args
	//
	// Get the workflows
	//
	var workflowResult = aa.workflow.getTaskItems(itemCap, wfName, null, null, null, null);
	if (workflowResult.getSuccess())
		wfObj = workflowResult.getOutput();
	else
		{ logDebug("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage()); return false; }

	//
	// Loop through workflow tasks
	//
	for (i in wfObj)
		{
		fTask = wfObj[i];
		stepnumber = fTask.getStepNumber();
		processID = fTask.getProcessID();
		if (wfName.equals(fTask.getTaskDescription())) // Found the right Workflow Task
			{
		TSIResult = aa.taskSpecificInfo.getTaskSpecifiInfoByDesc(itemCap,processID,stepnumber,itemName);
			if (TSIResult.getSuccess())
				{
				var TSI = TSIResult.getOutput();
				if (TSI != null)
					{
					var TSIArray = new Array();
					TSInfoModel = TSI.getTaskSpecificInfoModel();
					var readValue = TSInfoModel.getChecklistComment();
					return readValue;
					}
				else
					logDebug("No task specific info field called "+itemName+" found for task "+wfName);
					return null
				}
			else
				{
				logDebug("**ERROR: Failed to get Task Specific Info objects: " + TSIResult.getErrorMessage());
				return null
				}
			}  // found workflow task
		} // each task
		return null
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