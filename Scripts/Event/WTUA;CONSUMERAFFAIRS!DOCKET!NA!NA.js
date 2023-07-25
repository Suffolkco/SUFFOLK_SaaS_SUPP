//WTUA;CONSUMERAFFAIRS!DOCKET!NA!NA
showDebug = true;
var emailParams = aa.util.newHashtable();
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
		if (licenseNumber != null)
			editAppSpecific("License Number", licenseNumber, capId);	
		if (complaintNumber != null)
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

	editAppSpecific("No Pre-Hearing Conference", loadTaskSpecific(wfTask, "No Pre-Hearing Conference"), capId);	
	
	editAppSpecific("License Expiration Date", loadTaskSpecific(wfTask, "License Expiration Date"), capId);



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
else if (wfTask == "Create Violation Cheatsheet" && wfStatus == "Complete" )
{
	editAppSpecific("All required exhibit documents have been attached", loadTaskSpecific(wfTask, "All required exhibit documents have been attached"), capId);	
	editAppSpecific("Number of exhibit entered", loadTaskSpecific(wfTask, "Number of exhibit entered"), capId);	
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
	if (!matches(complaintNumber, undefined, null, ""))
	{
		
			// License as Parent(if exists) -> Complaint -> Violation(child) (Violationa and docket are siplings)
			var capComplaintResult = aa.cap.getCapID(complaintNumber);

			cmpCapId = getApplication(complaintNumber);

			logDebug("cmpCapId " + cmpCapId);
	}

	// Docket Custom Fields to copy to Violation
	var docHearingDate = getAppSpecific("Hearing Date", capId);
	var docHearingTime = getAppSpecific("Hearing Time", capId);
	var docPreConfDate = getAppSpecific("Pre-Hearing Conference Date", capId);
	var docPreConfTime = getAppSpecific("Pre-Hearing Conference Time", capId);

   for (c in cheatSheet)
   {
	
		var item = cheatSheet[c]["Item"];
	   var vioDate = cheatSheet[c]["Violation Date"];
	   var occDate = cheatSheet[c]["Occurrence Date"];
	   var caseNo = cheatSheet[c]["Case Number"];	  
	  
	   var charge = cheatSheet[c]["Law"];
	   var createVio = cheatSheet[c]["Create Violation"];
	   var vioNo = cheatSheet[c]["Reference Violation Number"];
	    
	   var abbDesc = cheatSheet[c]["Abbreviated Description"];
	   var desc = cheatSheet[c]["Description"];
	   var maxPenalty = cheatSheet[c]["Max Penalty"];
	   var reducedPenalty = cheatSheet[c]["Reduced Penalty"];

	   logDebug("vioNo: " + vioNo);
	   logDebug("createVio: " + createVio);
	   // Only if they enable the flag and the field is empty
	   if (createVio == 'CHECKED' && (vioNo == null || vioNo == ""))
	   {
		var violationChild;

			// Set Complaint as parent if exist. DKT and violation are siplings and are child of complaint. License is the grandparent.
			if (!matches(complaintNumber, undefined, null, ""))
			{
				violationChild = createChildLocal("ConsumerAffairs", "Violation", "NA", "NA", cmpCapId);
				logDebug("Complaint Record as parent. Violation as child.");
			}
			else if (!matches(licenseNumber, undefined, null, ""))// No complaint record, can only be the child of license
			{
				var capLicResult = aa.cap.getCapID(licenseNumber);
				licCapId = getApplication(licenseNumber);
				violationChild = createChildLocal("ConsumerAffairs", "Violation", "NA", "NA", licCapId);

				logDebug("License Record as parent. No Complaint Record. Violation as child.");

			}
			else // No complaint nor license. Can only relate to Dkt
			{
				violationChild = createChildLocal("ConsumerAffairs", "Violation", "NA", "NA", capId);
				logDebug("Docket Record as parent. No Complaint Record nor license. Violation as child.");
			}

			if (violationChild != null)
			{		
				var success = deactivateAllActiveTasks(violationChild);
				logDebug("Deactive success? " + success);
				logDebug("Violation date: " + vioDate);
				editAppSpecific("Date of Violation", vioDate, violationChild); 
				editAppSpecific("Hearing Date", docHearingDate, violationChild); 
				editAppSpecific("Hearing Time", docHearingTime, violationChild); 
				editAppSpecific("Pre-Conference Date", docPreConfDate, violationChild); 
				editAppSpecific("Pre-Conference Time", docPreConfTime, violationChild); 

				copyContacts(capId, violationChild);
				
				
				// Add law and penalty information to violation asitable as well
				
				logDebug("Law: " + charge);              
				logDebug("Violation Description: " + desc);
				logDebug("Abbreviated Description: " + abbDesc);             
				logDebug("Max Penalty: " + maxPenalty);                
				logDebug("Reduced Penalty: " + reducedPenalty);       		
				var newVioResultsTable = new Array();				
				var newRow = new Array();
				newRow["Law"] = charge;
				newRow["Violation Description"] = desc;
				newRow["Abbreviated Description"] = abbDesc;
				newRow["Max Penalty"] = maxPenalty;
				newRow["Reduced Penalty"] = reducedPenalty;								
				newVioResultsTable.push(newRow);			
				logDebug("Add Row to : " + violationChild);       			
				addRowToASITable("POTENTIAL VIOLATION", newRow, violationChild);

				// Put the newly created violation record ID back to the cheat sheet
				vioAltId = violationChild.getCustomID();
				logDebug("vioAltId: " + vioAltId);
				
				//function editASITableRowViaRowIdentifer(tableCapId, tableName, editName, editValue, rowValue, rowIdentifier) {
				editASITableRowViaRowIdentifer(capId, "VIOLATION CHEAT SHEET", "Reference Violation Number", vioAltId, item, "Item");
				editASITableRowViaRowIdentifer(capId, "VIOLATION CHEAT SHEET", "Case Number", complaintNumber, item, "Item");
				
				
			}
		}
		
		
	}

	// VENODR
	editAppSpecific("A63 Licensed", loadTaskSpecific(wfTask, "A63 Licensed"));
	editAppSpecific("A64 Unlicensed", loadTaskSpecific(wfTask, "A64 Unlicensed"));
	editAppSpecific("A65 Licensed", loadTaskSpecific(wfTask, "A65 Licensed"));
	editAppSpecific("A66 Unlicensed", loadTaskSpecific(wfTask, "A66 Unlicensed"));
	editAppSpecific("A67 Adjournment Letter", loadTaskSpecific(wfTask, "A67 Adjournment Letter"));
	editAppSpecific("A67a COVID19 Adjournment Letter", loadTaskSpecific(wfTask, "A67a COVID19 Adjournment Letter"));
	editAppSpecific("A68 Adjournment Letter", loadTaskSpecific(wfTask, "A68 Adjournment Letter"));

	//CONSUMERS
	editAppSpecific("A69 Notification", loadTaskSpecific(wfTask, "A69 Notification"));
	editAppSpecific("A70 Notification", loadTaskSpecific(wfTask, "A70 Notification"));
	editAppSpecific("A71 Notification", loadTaskSpecific(wfTask, "A71 Notification"))
	editAppSpecific("A72 Notification", loadTaskSpecific(wfTask, "A72 Notification"))
	editAppSpecific("A73 Adjournment Letter", loadTaskSpecific(wfTask, "A73 Adjournment Letter"))
	editAppSpecific("A74 Adjournment Letter", loadTaskSpecific(wfTask, "A74 Adjournment Letter"))
	editAppSpecific("A75 Adjournment Letter", loadTaskSpecific(wfTask, "A75 Adjournment Letter"))
	editAppSpecific("A76 Adjournment Letter", loadTaskSpecific(wfTask, "A76 Adjournment Letter"))

}
else if (wfTask == "Notice of Hearing" && wfStatus == "Complete")
{
    editAppSpecific("Mailed Letter", loadTaskSpecific(wfTask, "Mailed Letter"));
	editAppSpecific("Affidavit of Service", loadTaskSpecific(wfTask, "Affidavit of Service"));

}

// DOCKET #52: A script to send notification to account (Greg, Matt, Danielle, Carolyn, James)clerks/director of the unit. License to “Revoke” automatically and notify James and Matt on licensing?
else if (wfTask == "Hearing")
{
	if (wfStatus == "Withdrawn" || wfStatus == "AOD" || wfStatus == "Licensed Waiver" || wfStatus == "Unlicensed Waiver")
	{	
		// Uncomment when ready to go live
		//var staffEmailsToSend = lookup("DCA_Docket_Email_List", "All");   	
		var staffEmailsToSend = lookup("DCA_Docket_Email_List", "Investigations");   	
		sendNotification("", staffEmailsToSend, "", "DCA_DOCKET_HEARING", emailParams, null);	
		
	}
	if (wfStatus == "Licensed Waiver" || wfStatus == "Unlicensed Waiver")
	{
		var nodDate = AInfo["NOD Date"];
		var nodeAmt = AInfo["NOD Amount"];
		var nodDueDate = AInfo["NOD Amount Due Date"];
		editAppSpecific("NOD Date", nodDate);
		editAppSpecific("NOD Amount", nodeAmt);
		editAppSpecific("NOD Amount Due Date", nodDueDate);

		logDebug("nodDate :" + nodDate);
		logDebug("nodeAmt: " +  nodeAmt);
		logDebug("nodDueDate: " + nodDueDate);

		var startDate = new Date();
		var startTime = startDate.getTime();
		var todayDate = (startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear();	
		var dateAdd = addDays(todayDate, 30);
		var dateMMDDYYY = jsDateToMMDDYYYY(dateAdd);  

		editAppSpecific("Payment Due Date", dateMMDDYYY);
		editTaskSpecific("NOD", "Payment Due Date", dateMMDDYYY, capId);
		editAppSpecific("Payment Due Date", loadTaskSpecific(wfTask, "Payment Due Date"), capId);	

		// TO DO: Attached the waiver report too
		sendVendorEmail(nodDate, nodeAmt, nodDueDate, dateMMDDYYY);

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

	
	editAppSpecific("License Obtained Due Date", loadTaskSpecific(wfTask, "License Obtained Due Date"), capId);
	   
	editAppSpecific("Waiver", loadTaskSpecific(wfTask, "Waiver"), capId);
	editAppSpecific("AOD", loadTaskSpecific(wfTask, "AOD"), capId);

}
else if (wfTask == "Hearing Report")
{
	editAppSpecific("Hearing Officers", loadTaskSpecific(wfTask, "Hearing Officers"), capId);		
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
// DOCKET #42: Email the vendor the task has been set to 'Complete'
else if (wfTask == 'NOD' && wfStatus == 'Complete')
{

	var nodDate = AInfo["NOD Date"];
	var nodeAmt = AInfo["NOD Amount"];
	var nodDueDate = AInfo["NOD Amount Due Date"];
	editAppSpecific("NOD Date", nodDate);
	editAppSpecific("NOD Amount", nodeAmt);
	editAppSpecific("NOD Amount Due Date", nodDueDate);

	logDebug("nodDate :" + nodDate);
	logDebug("nodeAmt: " +  nodeAmt);
	logDebug("nodDueDate: " + nodDueDate);

	var startDate = new Date();
	var startTime = startDate.getTime();
	var todayDate = (startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear();	
	var dateAdd = addDays(todayDate, 30);
	var dateMMDDYYY = jsDateToMMDDYYYY(dateAdd);  

	editAppSpecific("Payment Due Date", dateMMDDYYY);
	editTaskSpecific("NOD", "Payment Due Date", dateMMDDYYY, capId);
	editAppSpecific("Payment Due Date", loadTaskSpecific(wfTask, "Payment Due Date"), capId);	

	sendVendorEmail(nodDate, nodeAmt, nodDueDate, dateMMDDYYY);

	
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

function addRowToASITable(tableName, tableValues) //optional capId
{
    //tableName is the name of the ASI table
    //tableValues is an associative array of values.  All elements must be either a string or asiTableVal object
    itemCap = capId
    if (arguments.length > 2)
    {
        itemCap = arguments[2]; //use capId specified in args
    }
    var tssmResult = aa.appSpecificTableScript.getAppSpecificTableModel(itemCap, tableName);
    if (!tssmResult.getSuccess())
    {
        logDebug("**WARNING: error retrieving app specific table " + tableName + " " + tssmResult.getErrorMessage());
        return false;
    }
    var tssm = tssmResult.getOutput();
    var tsm = tssm.getAppSpecificTableModel();
    var fld = tsm.getTableField();
    var col = tsm.getColumns();
    var fld_readonly = tsm.getReadonlyField(); //get ReadOnly property
    var coli = col.iterator();
    while (coli.hasNext())
    {
        colname = coli.next();
        if (!tableValues[colname.getColumnName()]) 
        {
            logDebug("Value in " + colname.getColumnName() + " - " + tableValues[colname.getColumnName()]);
            logDebug("addToASITable: null or undefined value supplied for column " + colname.getColumnName() + ", setting to empty string");
            tableValues[colname.getColumnName()] = "";
        }
        if (typeof (tableValues[colname.getColumnName()].fieldValue) != "undefined")
        {
            fld.add(tableValues[colname.getColumnName()].fieldValue);
            fld_readonly.add(tableValues[colname.getColumnName()].readOnly);
        }
        else // we are passed a string
        {
            fld.add(tableValues[colname.getColumnName()]);
            fld_readonly.add(null);
        }
    }
    tsm.setTableField(fld);
    tsm.setReadonlyField(fld_readonly); // set readonly field
    addResult = aa.appSpecificTableScript.editAppSpecificTableInfos(tsm, itemCap, currentUserID);
    if (!addResult.getSuccess())
    {
        logDebug("**WARNING: error adding record to ASI Table:  " + tableName + " " + addResult.getErrorMessage());
        return false;
    }
    else
    {
        logDebug("Successfully added record to ASI Table: " + tableName);
    }
}

function sendVendorEmail(nodDate, nodAmt, nodDueDate, paymentDueDate)
{
	// Send email notification to Vendor task has been completed
	var emailText = ""
		var emailParams = aa.util.newHashtable();
		var reportFile = new Array();
			
		var contactType = "Vendor";
		var contactInfo = getContactInfo(contactType, capId);
		if(contactInfo == false){
			logDebug("No vendor contact exists on this record");
		}else{
			
			var vAddrLine1 = contactInfo[0];
			var vCity = contactInfo[1];
			var vState = contactInfo[2];
			var vZip = contactInfo[3];
			var vAddress = new Array();
			vAddress.push(vAddrLine1);
			vAddress.push(vCity);
			vAddress.push(vState);
			vAddress.push(vZip);
			logDebug("Address: " + vAddrLine1 + ", City: " +  vCity + ", State: " +  vState + ", Zip: " +  vZip);
			// copy Vendor name, org name & phone to short notes
			var fName = contactInfo[4];
			var lName = contactInfo[5];					
			var email = contactInfo[8];	
	
			var startDate = new Date();
			var startTime = startDate.getTime(); // Start timer
			var todayDate = (startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear();
	
			getRecordParams4Notification(emailParams);
			addParameter(emailParams, "$$altID$$", capId.getCustomID());
			addParameter(emailParams, "$$name$$", fName + " " + lName);
			addParameter(emailParams, "$$address", vAddrLine1);
			addParameter(emailParams, "$$city$$", vCity);
			addParameter(emailParams, "$$state$$", vState);
			addParameter(emailParams, "$$zip$$", vZip);
			addParameter(emailParams, "$$date$$", todayDate);		
	
			addParameter(emailParams, "$$nodDate$$", nodDate);
			addParameter(emailParams, "$$nodAmt$$", nodAmt);
			addParameter(emailParams, "$$nodAmtDue$$", nodDueDate);
			addParameter(emailParams, "$$paymentDueDate$$", paymentDueDate);
			var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
			acaSite = acaSite.substr(0, acaSite.toUpperCase().indexOf("/ADMIN"));

			logDebug("acaSite: " + acaSite);
			//Save Base ACA URL
			addParameter(emailParams, "$$acaURL$$", acaSite);
			//Save Record Direct URL
			logDebug("acaRecordURL: " + acaSite + getACAUrl());
			addParameter(emailParams, "$$acaRecordURL$$", acaSite + getACAUrl());		
			addACAUrlsVarToEmail(emailParams);
	
	
			var success = sendNotification("", email, "", "DCA_DOCKET_VENDOR_TASK_COMPLETE_NOTIFICATION", emailParams, reportFile);	
			logDebug("success:" + success + ", to: " + email);	
		}	
		
}

function getContactInfo(cType, capId) {
	var returnArray = new Array();
	var haveCType = false;
	
	var contModel = null; 
	var consResult = aa.people.getCapContactByCapID(capId);	
	if (consResult.getSuccess()) {
		var cons = consResult.getOutput();
		for (thisCon in cons) {
			var capContactType = cons[thisCon].getCapContactModel().getPeople().getContactType();
			if (capContactType == cType) {				
				var contModel = cons[thisCon].getCapContactModel(); 
				
				var firstName = contModel.getFirstName();
				var lastName = contModel.getLastName();
				var business = contModel.getBusinessName();
				var phone = contModel.getPhone1();
				var addr1 = contModel.getAddressLine1();
				var city = contModel.getCity();
				var state = contModel.getState();
				var zip = contModel.getZip();
				var email = contModel.getPeople().getEmail();

			
				// build returnArray
				returnArray.push(addr1);
				returnArray.push(city);
				returnArray.push(state);
				returnArray.push(zip);
				returnArray.push(firstName);
				returnArray.push(lastName);
				returnArray.push(business);
				returnArray.push(phone);
				returnArray.push(email);
				return returnArray;
				haveCType = true;
			}
		}
	}
	if (haveCType == false){
		return false;
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
function addDays(date, days) 
{
	var result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

function deactivateAllActiveTasks(targetCapId) {
    var t = aa.workflow.getTasks(targetCapId);
    if (t.getSuccess())
        wfObj = t.getOutput();
    else
    {
        logDebug("**INFO: deactivateAllActiveTasks() Failed to get workflow Tasks: " + t.getErrorMessage());
        return false;
    }
    for (i in wfObj)
    {
        fTask = wfObj[i];
        if (fTask.getActiveFlag().equals("Y"))
        {
            var deact = aa.workflow.adjustTask(targetCapId, fTask.getStepNumber(), "N", fTask.getCompleteFlag(), null, null);
            if (!deact.getSuccess())
            {
                logDebug("**INFO: deactivateAllActiveTasks() Failed " + deact.getErrorMessage());
            }
			else
			{			
				logDebug("deactived: " + fTask.getTaskDescription());
			}
        }
    }
    return true;
}