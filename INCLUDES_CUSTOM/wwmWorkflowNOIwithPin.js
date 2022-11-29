function wwmWorkflowNOIwithPin(reportName, reportNameAttachToRecord, reportParamArray)
{	
	var conEmail = "";
    var fromEmail = "";
    var shortNotes = getShortNotes(capId);
	var itemCap = aa.cap.getCap(capId).getOutput();
	appTypeResult = itemCap.getCapType();
	appTypeString = appTypeResult.toString(); 
	appTypeArray = appTypeString.split("/");
    var alternateID = capId.getCustomID();
    saveToRecord = true;
    var thisReport = "";

	var capContResult = aa.people.getCapContactByCapID(capId);

	if (capContResult.getSuccess()) {
		conArray = capContResult.getOutput();
	} else {
		retVal = false;
	}

	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
    }
    
    var emailArray = new Array();
    var emailAddressArray = new Array();
    var pinSentList = AInfo["Local Contact Numbers Sent"];
    var pinSentRefArray ="";
    if (pinSentList != null)
    {
      pinSentRefArray = pinSentList.toString().split(",");
    }

	for (con in conArray)
	{				
		cont = conArray[con];				
		peop = cont.getPeople();
       
        logDebug("Email: " + peop.getEmail());      
        logDebug("Audit Status: " + peop.getAuditStatus());      
        var hasPublicUser = false;
        var emailSent = false;
		if (peop.getAuditStatus() != "I") 
        {        
			if (!matches(peop.getEmail(), null, undefined, ""))
			{				
                contactType = conArray[con].getCapContactModel().getPeople().getContactType();
                logDebug("Contact: " + contactType);              
                if (contactType== "Agent" || contactType == "Applicant" || contactType== "Designer" || contactType == "Property Owner")
                {

                    // Check to see if the users have public account linkage already.
                    var refSeqNumber  = conArray[con].getCapContactModel().getRefContactNumber();
                    
                    if (!refSeqNumber)
                    {
                        logDebug("Check null for Reference sequence number: " + refSeqNumber);
                    }
                    else
                    {
                        logDebug("Reference sequence number Test: " + aa.util.parseLong(refSeqNumber));     
                    }
                    
                    logDebug("Custom field ACA PIN Sent: " + AInfo["Pin Sent"]);      
                       
                    var found = false;

                    if (refSeqNumber)
                    {
                        for (num in emailArray)
                        {
                            if (emailArray[num] == refSeqNumber)
                            {
                                found = true;
                                logDebug("Found: " + refSeqNumber + " in the array.");
                            }
                        }
                    }
                    // Did we already send email to the same reference contact? 
                    // We only want to send if we have not already done so
                  // Add this later to check for custom field: if (AInfo["Pin Sent"] != "Yes")
                    if (!found)
                    {
                        if (refSeqNumber)
                        {
                            emailArray.push(refSeqNumber);
                            logDebug("Push email array in: " + refSeqNumber + "Length" + emailArray.length);

                            logDebug("Email Array does not have existing ref contact ID: " + refSeqNumber);      

                            var s_publicUserResult = aa.publicUser.getPublicUserListByContactNBR(aa.util.parseLong(refSeqNumber));

                            //var getUserResult = aa.publicUser.getPublicUserByEmail(con.getEmail())
                            //if (getUserResult.getSuccess() && getUserResult.getOutput()) {
                            //var userModel = getUserResult.getOutput();

                            // Check to see if the contact has public user associated with it already.
                            if (s_publicUserResult.getSuccess()) {
                                var fpublicUsers = s_publicUserResult.getOutput();
                                if (fpublicUsers == null || fpublicUsers.size() == 0) 
                                {
                                    hasPublicUser = false;
                                
                                } 
                                else 
                                {
                                    hasPublicUser = true;
                                    logDebug("The contact("+refSeqNumber+") is associated with "+fpublicUsers.size()+" public users.");
                                
                                }
                            } 
                            else { 
                                hasPublicUser = false;
                                logMessage("**ERROR: Failed to get public user by contact number: " + s_publicUserResult.getErrorMessage());
                        
                            }
                        }   

                        // Check to see if we sent the PIN previously in the workflow history
                        var localContactSeqNumber = peop.contactSeqNumber;
                        var workflowHistoryPinSent = false;
                        
                        for (sent in pinSentRefArray)
                        {
                            if (pinSentRefArray[sent] == localContactSeqNumber)
                            {
                                workflowHistoryPinSent = true;
                                logDebug(localContactSeqNumber + "has received PIN letter previously in the workflow history.");
                                logDebug("We are not attaching PIN letter again to: " + localContactSeqNumber);
                            }
                        }
                        //pubusers = aa.publicUser.getPublicUserListByLicenseSeqNBR(licenseNumber).getOutput().toArray();

                        var emailParams = aa.util.newHashtable();	
                        //var reportParams = aa.util.newHashtable();
                        var reportFile = new Array();	
                        //reportParams.put("RecordID", alternateID.toString());
                        
                        if (saveToRecord)
                        {
                            thisReport = reportNameAttachToRecord;
                            logDebug("This is the report will save to record: " + thisReport);
                        }
                        else
                        {
                            thisReport = reportName;
                            logDebug("This is the report that should not be saved: " + thisReport);
                        }

                        
                        saveToRecord = false;
                        
                        // No public user linkage, send also the ACA Pin instruction letter
                        if (!hasPublicUser && workflowHistoryPinSent == false)  
                        {
                            if (refSeqNumber)
                            {
                                logDebug("Couldn't find public user ref contact ID" + refSeqNumber + ". We never sent ACA letter neither.") ;
                            }       
                            // PIN report with record id and contact type as params                
                            var reportParams1 = aa.util.newHashtable();
                            reportParams1.put("RecordID", alternateID.toString());
                            reportParams1.put("ContactType", contactType);
                            // Local contact ID
                            localCId = conArray[con].getCapContactModel().getPeople().getContactSeqNumber();			
                            reportParams1.put("ContactID", localCId);
                        
                            // NOI report - from reportParams in the earlier loop.                           
                            rFile = generateReport(thisReport, reportParamArray, appTypeArray[0])
                            logDebug("This is the NOI report: " + rFile);           
                            
                            if (rFile) {
                            reportFile.push(rFile);
                            }
                            // ACA PIN - from reportParams1 above.      
                            rFile = generateReport("ACA Registration Pins-WWM",reportParams1, appTypeArray[0])
                            
                            logDebug("This is the ACA Pin File we are emailing: " + rFile);           
                        
                            if (rFile) {
                                reportFile.push(rFile);
                            }

                            getRecordParams4Notification(emailParams);
                            getWorkflowParams4Notification(emailParams);
                            logDebug("Email:" + peop.getEmail());                       
                            addParameter(emailParams, "$$altID$$", capId.getCustomID());
                            addParameter(emailParams, "$$shortNotes$$", shortNotes);

                            conEmail = peop.getEmail();
                            if (conEmail != null)
                            {
                                logDebug("emailAddressArray.length:" + emailAddressArray.length);

                                // Add email to the array so we do not send duplicate email.
                                for (x in emailAddressArray)
                                {
                                    logDebug("Checking peop.getEmail(): " + peop.getEmail());
                                    logDebug("Checking emailAddressArray[x]: " + emailAddressArray[x]);

                                    if (matches(emailAddressArray[x], peop.getEmail()))
                                    {
                                        emailSent = true;
                                        logDebug("Found: " + peop.getEmail() + " in the array. Not sending email again.");
                                    }

                                    if (emailAddressArray[x] == peop.getEmail())
                                    {
                                        emailSent = true;
                                        logDebug("Matched: " + peop.getEmail() + " in the array. Not sending email again.");
                                    }
                                }                  
                                logDebug("emailSent: " + emailSent);                                

                                if (!emailSent)
                                {
                                    sendNotification("", conEmail, "", "DEQ_WWM_AWAITING CLIENT REPLY_WITH_ACA_PIN", emailParams, reportFile);
                                    emailAddressArray.push(peop.getEmail());
                                    logDebug("Push email: " + peop.getEmail() + " to emailAddressArray.");
                                }
                                editAppSpecific("Pin Sent", "Yes");
                                // Append the ref conference in the list.
                                var tempList = AInfo["Local Contact Numbers Sent"];
                                var tempListArray = "";
                                if (tempList != null)
                                {
                                  tempListArray = tempList.toString().split(",");
                                }
                                logDebug("Custom Field Local Contact Numbers Sent value: " + tempList);         
                                logDebug("Number of entries in Local Contact Numbers Sent Sent:" + tempListArray.length);         
                               
                                if (tempList == null || tempListArray.length == 0)
                                {
                                    editAppSpecific("Local Contact Numbers Sent", localContactSeqNumber);
                                    logDebug("Update custom Field Local Contact Numbers Sent to: " + localContactSeqNumber);         
                                }
                                else   // Append comma
                                {
                                    appendSeqNumber = tempList + "," + localContactSeqNumber;
                                    editAppSpecific("Local Contact Numbers Sent", appendSeqNumber);
                                    logDebug("Update custom Field Local Contact Numbers Sent to: " + appendSeqNumber);         
                                }
                            }
                        }
                        else 
                        {                                                   
                            conEmail = peop.getEmail();                                                                 
                            getRecordParams4Notification(emailParams);
                            getWorkflowParams4Notification(emailParams);                         
            
                            logDebug("Send standard report to contact without the PIN Letter: " + conEmail);
                            addParameter(emailParams, "$$altID$$", capId.getCustomID());
                            addParameter(emailParams, "$$shortNotes$$", shortNotes);
                            if (conEmail != null)
                            {
                                logDebug("emailAddressArray.length:" + emailAddressArray.length);
                              
                                for (x in emailAddressArray)
                                {
                                    logDebug("Checking emailAddressArray: " + peop.getEmail());
                                    logDebug("Checking emailAddressArray[x]: " + emailAddressArray[x]);

                                    if (matches(emailAddressArray[x], peop.getEmail()))
                                    {
                                        emailSent = true;
                                        logDebug("Found: " + peop.getEmail() + " in the array. Skip sending email.");
                                    }
                                    if (emailAddressArray[x] == peop.getEmail())
                                    {
                                        emailSent = true;
                                        logDebug("Matched: " + peop.getEmail() + " in the array. Not sending email again.");
                                    }
                                }

                                logDebug("emailSent: " + emailSent);          

                                if (!emailSent)
                                {
                                      // NOI report
                                    rFile = generateReport(thisReport, reportParamArray, appTypeArray[0])
                                    logDebug("This is the NOI report: " + rFile);           

                                    if (rFile) {
                                    reportFile.push(rFile);
                                    }
                                    sendNotification("", conEmail, "", "DEQ_WWM_AWAITING CLIENT REPLY", emailParams, reportFile);
                                    emailAddressArray.push(peop.getEmail());                                  
                                    logDebug("Push email: " + peop.getEmail() + " to emailAddressArray.");
                                }
                            }
                        }
                    }
                    else
                    {
                        if (refSeqNumber)
                        {
                            logDebug("Same Email address has been found in the contacts for: " + refSeqNumber + ". Skip sending to the same email address.");     
                        }
                    }
                }                             		
            
            }
        }		
    }
       

    var lpEmail = "";
	var lpResult = aa.licenseScript.getLicenseProf(capId);
	if (lpResult.getSuccess())
	{ 
		var lpArr = lpResult.getOutput();  
	} 
	else 
	{ 
		logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
	}
    
    for (var lp in lpArr)
	{
		if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
		{
			lpEmail += lpArr[lp].getEmail() + "; ";
		}
    }
    
    var lpEmailParams = aa.util.newHashtable();	
    var lpReportParams = aa.util.newHashtable();
    var lpReportFile = new Array();	
    lpReportParams.put("RecordID", alternateID.toString());
    // NOI report
    rFile = generateReport(reportName,lpReportParams, appTypeArray[0])
    logDebug("This is the rFile: " + rFile);           
    
    if (rFile) {
        lpReportFile.push(rFile);
    }

	getRecordParams4Notification(lpEmailParams);
    getWorkflowParams4Notification(lpEmailParams);
	logDebug("Emails" + lpEmail);	
	//addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
	logDebug("If this is showing up, you're a winner!");
    addParameter(lpEmailParams, "$$altID$$", capId.getCustomID());
    addParameter(lpEmailParams, "$$shortNotes$$", shortNotes);
	if (lpEmail != null)
	{
		sendNotification("", lpEmail, "", "DEQ_WWM_AWAITING CLIENT REPLY", lpEmailParams, lpReportFile);
	}
}

