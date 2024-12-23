// DOCKET-29

if (wfTask == "Enter Hearing Info" && wfStatus == "Complete")
{		
    var licenseNumber = AInfo["Updated.License Number"];

    if (!matches(licenseNumber, null, ""))
    {
        licenseCapId = getApplication(licenseNumber);
        if (!licenseCapId)
        {    
            cancel = true;
            showMessage = true;
            comment("The License Number entered '" + licenseNumber + "' is invalid. Please enter a valid License Number.");
        }
    }

	var complaintNumber = AInfo["Updated.Complaint Number"];
    if (!matches(complaintNumber, undefined, null, ""))
    {
        cmpCapId = getApplication(complaintNumber);
        if (!cmpCapId)   
        {
            cancel = true;
            showMessage = true;
            comment("The Complaint Number entered '" + complaintNumber + "' is invalid. Please enter a valid Complaint Number.");
        }
    }


    // DOCKET - 23/30: Custom Field required fields
    /*if (getAppSpecific("Consumer Attorney Present", capId) == null || 
    getAppSpecific("Vendor Present", capId) == null || 
    getAppSpecific("Consumer Present", capId) == null || 
    getAppSpecific("Vendor Witnesses", capId) == null || 
    getAppSpecific("Consumer Witnesses", capId) == null || 
    getAppSpecific("Translator Used", capId) == null)
    {
    
        cancel = true;
        showMessage = true;
        comment("Hearing section in ASI/Custom Field must be filled in. Please go to Custom Field tab to input all values.");
        
    }*/
}
// DOCKET #12: Block the workflow task "Create Violation Cheat Sheet" from proceeding if all documents have not been attached.
if (wfTask == "Create Violation Cheatsheet" && wfStatus == "Complete")
{
    /* As per Greg, do not check for all document attached 

    exhibitA = determineDocumentAttached("Contract");
    exhibitB = determineDocumentAttached("Canceled Checks");
    exhibitC = determineDocumentAttached("Affidavit of Service");
    exhibitD = determineDocumentAttached("DMV Search");
    exhibitE = determineDocumentAttached("TLO Search");
    exhibitF = determineDocumentAttached("NYS DOS Search");
    exhibitG = determineDocumentAttached("DBA Search Cert. County Clerk");
    exhibitH = determineDocumentAttached("Consumer Complaint Form");
    exhibitI = determineDocumentAttached("Judgment");
    exhibitJ = determineDocumentAttached("License Search Printout");
    exhibitK = determineDocumentAttached("2nd Vendor Estimates");
    exhibitL = determineDocumentAttached("Past NOD for 2nd Counts");
    exhibitM = determineDocumentAttached("Town Building Dept. Inspection Certificates");

    if (!exhibitA || !exhibitB || !exhibitC || !exhibitD || !exhibitE || !exhibitF || !exhibitG || !exhibitH ||
        !exhibitI || !exhibitJ || !exhibitK || !exhibitL || !exhibitM)
    {
        cancel = true;
        showMessage = true;
       
        comment("All Exhibit document types have not been attached: ");
        if (!exhibitA) {comment("Missing Exhibit document: Contract");}
        if (!exhibitB) {comment("Missing Exhibit document: Canceled Checks");}
        if (!exhibitC) {comment("Missing Exhibit document: Affidavit of Service");}
        if (!exhibitD) {comment("Missing Exhibit document: DMV Search");}
        if (!exhibitE) {comment("Missing Exhibit document: TLO Search");}
        if (!exhibitF) {comment("Missing Exhibit document: NYS DOS Search");}
        if (!exhibitG) {comment("Missing Exhibit document: DBA Search Cert. County Clerk");}
        if (!exhibitH) {comment("Missing Exhibit document: Consumer Complaint Form");}
        if (!exhibitI) {comment("Missing Exhibit document: Judgment");}
        if (!exhibitJ) {comment("Missing Exhibit document: License Search Printout");}
        if (!exhibitK) {comment("Missing Exhibit document: 2nd Vendor Estimates");}
        if (!exhibitL) {comment("Missing Exhibit document: Past NOD for 2nd Counts");}
        if (!exhibitM) {comment("Town Building Dept. Inspection Certificates");}
         
    } */
    
}
// DOCKET-59: Block the workflow if the hearing information has not been filled in
else if (wfTask == "Create Violations" && wfStatus == "Complete")
{
     // DOCKET #9: lBlock letter has not been mailed
    /*var a63 =  AInfo["A63 Licensed"]
	var a64 =  AInfo["A64 Unlicensed"]
	var a65 =  AInfo["A65 Unlicensed"]
    var a66 =  AInfo["A66 Unlicensed"]
    var a67 =  AInfo["A67 Adjournment Letter"]
    var a67a = AInfo["A67a COVID19 Adjournment Letter"]
    var a68 =  AInfo["A68 Adjournment Letter"]
    var a69 =  AInfo["A69 Notification"]
    var a70 =  AInfo["A70 Notification"]
    var a71 =  AInfo["A71 Notification"]
    var a72 =  AInfo["A72 Notification"]
    var a73 =  AInfo["A73 Adjournment Letter"]
    var a74 =  AInfo["A74 Adjournment Letter"]
    var a75 =  AInfo["A75 Adjournment Letter"]
    var a76 =  AInfo["A76 Adjournment Letter"]*/

    var a63 = AInfo["Updated.A63 Licensed"];
    var a64 = AInfo["Updated.A64 Unlicensed"];
    var a65 = AInfo["Updated.A65 Licensed"];
    var a66 = AInfo["Updated.A66 Unlicensed"];
    var a67 = AInfo["Updated.A67 Adjournment Letter"];
    var a67a = AInfo["Updated.A67a COVID19 Adjournment Letter"];
    var a68 = AInfo["Updated.A68 Adjournment Letter"];
    var a69 = AInfo["Updated.A69 Notification"];
    var a70 = AInfo["Updated.A70 Notification"];
    var a71 = AInfo["Updated.A71 Notification"];
    var a72 = AInfo["Updated.A72 Notification"];
    var a73 = AInfo["Updated.A73 Adjournment Letter"];
    var a74 = AInfo["Updated.A74 Adjournment Letter"];
    var a75 = AInfo["Updated.A75 Adjournment Letter"];
    var a76 = AInfo["Updated.A76 Adjournment Letter"];
    var enf = AInfo["Updated.Enforcement"];

    logDebug("Enforcement: " + enf);

	if ((a63 == 'CHECKED' || a64 == 'CHECKED' || a65 == 'CHECKED' || a66 == 'CHECKED' || a67 == 'CHECKED' || a67a == 'CHECKED' ||
    a68 == 'CHECKED' || a69 == 'CHECKED' || a70 == 'CHECKED' || a71 == 'CHECKED'
    || a72 == 'CHECKED' || a73 == 'CHECKED' || a74 == 'CHECKED'
    || a75 == 'CHECKED' || a76 == 'CHECKED') 
    || enf == 'CHECKED')
    {
        // Letter checkbox has been checked.
    }
    else
	{		
		cancel = true;
		showMessage = true;
		comment("At least one letter has to be mailed. Please check the respective letter choices to indicate. Unable to proceed.");		
    }
		
    /*
    if (getAppSpecific("Hearing Date", capId) == null || 
    getAppSpecific("Hearing Time", capId) == null || 
    getAppSpecific("Pre-Hearing Conference Date", capId) == null || 
    getAppSpecific("Pre-Hearing Conference Time", capId)== null)
    {    
        cancel = true;
        showMessage = true;
        logDebug(getAppSpecific("Hearing Date", capId) + getAppSpecific("Hearing Time", capId) + getAppSpecific("Pre-Hearing Conference Date", capId) + getAppSpecific("Pre-Hearing Conference Time", capId))
        comment("Violation Information section in ASI/Custom Field must be filled in. Please go to Custom Field tab to input all values.");
        
    } */
}
// DOCKET#57: Block workflow update on Hearing Report task if there is no hearing officer report
else if (wfTask == "Hearing Report" && wfStatus == "Complete")
{
    //Check if the Hearing Report has not been attached
    offCheck = determineDocumentAttached("Hearing Officer Report and Recommendation");
    
    if(!offCheck)
    {
        cancel = true;
        showMessage = true;
        comment("No Hearing Officer Report and Recommendation document has been attached. Please attach document before proceeding. Unable to move to the next task.");
    }
}
// DOCKET #7: Docket Type Script: Block to proceed if AOS has not been scanned at workflow task Notice of Hearing -> next step
else if (wfTask == "Notice of Hearing" && wfStatus == "Complete")
{
    //Check if the AOS has not been scanned 
    var aosChecked =  AInfo["Updated.Affidavit of Service"]
    logDebug("aosChecked: " + aosChecked);

    if (aosChecked == 'Yes')
    {

        aosCheck = determineDocumentAttached("Affidavit of Service");
        
        if(!aosCheck)
        {
            cancel = true;
            showMessage = true;
            comment("No AOS document has been attached. Please attach Affidavit of Service document before proceeding. Unable to move to the next task.");
        }
    }  


}

else if (wfTask == "Hearing")
{
    //Check if the Waiver has not been scanned 
    var waiverChecked =  AInfo["Updated.Waiver"]
    logDebug("waiverChecked: " + waiverChecked);

    if (waiverChecked == 'Yes')
    {
        waiverAttachmentCheck = determineDocumentAttached("Waiver");

        if (!waiverAttachmentCheck)
        {
            cancel = true;
            showMessage = true;
            comment("No Waiver has been attached. Please upload before proceeding. Unable to move to the next task.");
        }
    }

    
    //Check if the AOD has not been scanned 
    var aodChecked =  AInfo["Updated.AOD"]
    logDebug("aodChecked: " + aodChecked);

    if (aodChecked == 'Yes')
    {
        aodAttachmentCheck = determineDocumentAttached("AOD");

        if (!aodAttachmentCheck)
        {
            cancel = true;
            showMessage = true;
            comment("No AOD has been attached. Please upload before proceeding. Unable to move to the next task.");
        }
    }


    // DOCKET #6: At Hearing, WTUA to block from proceeding if audio recording has not been attached
    // only need to do it in configuration. No need to script this
    /*if(wfStatus == "Full Hearing" || wfStatus == "Default")
    {
        //Check if the audio hearing has not been scanned 
        audioCheck = determineDocumentAttached("Audio Hearing Recording");

        if(!audioCheck)
        {
            cancel = true;
            showMessage = true;
            comment("No audio hearing recording has been attached. Please upload before proceeding. Unable to move to the next task.");
        }     
    }
    */
}

function determineDocumentAttached(docType) 
{
    var docList = aa.document.getDocumentListByEntity(capId, "CAP");
    if (docList.getSuccess()) 
	{
        docsOut = docList.getOutput();
		//logDebug("Docs Out " + docsOut.isEmpty());
        if (docsOut.isEmpty()) 
		{
            logDebug("here");
            return false;
        }
        else 
		{
            attach = false;
            docsOuti = docsOut.iterator();
            while (docsOuti.hasNext()) 
			{
                doc = docsOuti.next();
				//debugObject(doc);
                docCat = doc.getDocCategory();
                if (docCat != null)
                {
                    if (docCat.equals(docType)) 
                    {
                        attach = true;
                    }
                 }
            }
            if (attach) 
			{
                return true;
            }
            else 
			{
                return false;
            }
        }
    }
    else 
	{
        return false;
    }
}
function debugObject(object) {
    var output = '';
    for (property in object) {
        output += "<font color=red>" + property + "</font>" + ': ' + "<bold>" + object[property] + "</bold>" + '; ' + "<BR>";
    }
    logDebug(output);
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