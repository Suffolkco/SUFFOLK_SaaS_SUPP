function workflowPrelimApprovalWithPin(reportName, reportNameAttachToRecord, reportParamRecID)
{	
	var conEmail = "";
    var fromEmail = "";
	var itemCap = aa.cap.getCap(capId).getOutput();
	var alternateID = capId.getCustomID();
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

                logDebug("Local Contact sequence number: " + peop.contactSeqNumber);

                 // Did we already send email to the same reference contact? 
                // We only want to send if we have not already done so
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
                   
                    var emailParams = aa.util.newHashtable();	
                    var reportParams = aa.util.newHashtable();
                    var reportFile = new Array();	
                    reportParams.put(reportParamRecID, alternateID.toString());

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

                    // WWM Permit Conditions Script 
                    rFile = generateReport(thisReport, reportParams, appTypeArray[0])
                    logDebug("This is the WWM Permit Conditions Script : " + rFile);           
                    
                    if (rFile) {
                    reportFile.push(rFile);
                    }

                    saveToRecord = false;
                    
                    // No public user linkage, send also the ACA Pin instruction letter
                    if (!hasPublicUser && workflowHistoryPinSent == false)  
                    {
                        if (refSeqNumber)
                        {
                            logDebug("Couldn't find public user ref contact ID" + refSeqNumber + ". We never sent ACA letter neither.") ;
                        }
                

                        logDebug("Local Contact sequence number: " + localContactSeqNumber);

                        // PIN report with record id and contact type as params                
                        var reportParams1 = aa.util.newHashtable();
                        reportParams1.put("RecordID", alternateID.toString());
                        reportParams1.put("ContactType", contactType);
                        // Local contact ID
                        localCId = conArray[con].getCapContactModel().getPeople().getContactSeqNumber();			
                        reportParams1.put("ContactID", localCId);

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
                        addACAUrlsVarToEmail(emailParams);
                        conEmail = peop.getEmail();
                        if (conEmail != null)
                        {
                            // Add email to the array so we do not send duplicate email.
                            for (x in emailAddressArray)
                            {
                                if (emailAddressArray[x] == peop.getEmail())
                                {
                                    emailSent = true;
                                    logDebug("Found: " + peop.getEmail() + " in the array. Not sending email again.");
                                }
                                if (matches(emailAddressArray[x], peop.getEmail()))
                                {
                                    emailSent = true;
                                    logDebug("Found: " + peop.getEmail() + " in the array. Not sending email again.");
                                }
                            }                                                  
                            if (!emailSent)
                            {
                                sendNotification("", conEmail, "", "DEQ_WWM_PRELIMINARY_REVIEW_APPROVED_WITH_ACA_PIN", emailParams, reportFile);
                                emailAddressArray.push(peop.getEmail());
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
                            logDebug("Number of entries in Local Contact Numbers Sent:" + tempListArray.length);         
                            
                            if (tempList == null || tempListArray.length == 0)
                            {
                                // We are putting the local contact number in 
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
                        addACAUrlsVarToEmail(emailParams);
                        if (conEmail != null)
                        {
                            // Add email to the array so we do not send duplicate email.
                            for (x in emailAddressArray)
                            {
                                if (emailAddressArray[x] == peop.getEmail())
                                {
                                    emailSent = true;
                                    logDebug("Found: " + peop.getEmail() + " in the array. Not sending email again.");
                                }
                                if (matches(emailAddressArray[x], peop.getEmail()))
                                {
                                    emailSent = true;
                                    logDebug("Found: " + peop.getEmail() + " in the array. Not sending email again.");
                                
                                }
                                
                            }
                            if (!emailSent)
                            {
                                sendNotification("", conEmail, "", "DEQ_WWM_PRELIMINARY_REVIEW_APPROVED", emailParams, reportFile);
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
    lpReportParams.put(reportParamRecID, alternateID.toString());
    // NOI report
    rFile = generateReport(reportName,lpReportParams, appTypeArray[0])
    logDebug("This is the rFile: " + rFile);           
    
    if (rFile) {
        lpReportFile.push(rFile);
    }


	getRecordParams4Notification(lpEmailParams);
    getWorkflowParams4Notification(lpEmailParams);
    
    //addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
    addParameter(lpEmailParams, "$$altID$$", capId.getCustomID());
    addParameter(lpEmailParams, "$$shortNotes$$", shortNotes);
    addACAUrlsVarToEmail(lpEmailParams);
    if (!matches(lpEmail, null, undefined, ""))	
	{
        logDebug("Found: " + lpEmail + " lp email in the array.");
        sendNotification("", lpEmail, "", "DEQ_WWM_PRELIMINARY_REVIEW_APPROVED", lpEmailParams, null);
    }
}

function generateReport(aaReportName,parameters,rModule) {
	var reportName = aaReportName;
      
    report = aa.reportManager.getReportInfoModelByName(reportName);
	report = report.getOutput();
	logDebug("This is the report output: " + report);
  
    report.setModule(rModule);
    report.setCapId(capId);

    report.setReportParameters(parameters);

    var permit = aa.reportManager.hasPermission(reportName,currentUserID);

    if(permit.getOutput().booleanValue()) {
       var reportResult = aa.reportManager.getReportResult(report);
     
       if(reportResult) {
	       reportResult = reportResult.getOutput();
	       var reportFile = aa.reportManager.storeReportToDisk(reportResult);
			logMessage("Report Result: "+ reportResult);
	       reportFile = reportFile.getOutput();
	       return reportFile
       } else {
       		logMessage("Unable to run report: "+ reportName + " for Admin" + systemUserObj);
       		return false;
       }
    } else {
         logMessage("No permission to report: "+ reportName + " for Admin" + systemUserObj);
         return false;
    }
}