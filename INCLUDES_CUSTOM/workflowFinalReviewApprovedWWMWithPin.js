function workflowFinalReviewApprovedWWMWithPin()
{
	var conEmail = "";
    var fromEmail = ""; 
    var shortNotes = getShortNotes(capId);
	var itemCap = aa.cap.getCap(capId).getOutput();
	appTypeResult = itemCap.getCapType();
	appTypeString = appTypeResult.toString(); 
	appTypeArray = appTypeString.split("/");
    var alternateID = capId.getCustomID();  
  
    
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
                    var reportFile = new Array();	
                                                                            
                    // EHIMS-5117
                    var docList = getDocumentList();
                    var docDates = [];
                    var maxDate;

                    for (doc in docList)
                    {
                        if (matches(docList[doc].getDocCategory(), "SCDHS Final Approval"))
                        {
                            logDebug("document type is: " + docList[doc].getDocCategory() + " and upload datetime of document is: " + docList[doc].getFileUpLoadDate().getTime());
                            docDates.push(docList[doc].getFileUpLoadDate().getTime());
                            maxDate = Math.max.apply(null, docDates);
                            logDebug("maxdate is: " + maxDate);

                            if (docList[doc].getFileUpLoadDate().getTime() == maxDate)
                            {
                                var docType = docList[doc].getDocCategory();
                                var docFileName = docList[doc].getFileName();
                            }
                        }
                    }

                    //preparing most recent sketch document for email attachment
                    var docToSend = prepareDocumentForEmailAttachment(capId, "SCDHS Final Approval", docFileName);
                    logDebug("docToSend" + docToSend);
                    docToSend = docToSend === null ? [] : [docToSend];
                    if (!matches(docToSend, null, undefined, ""))
                    {
                        reportFile.push(docToSend);         
                        
                        //EHIMS-5224: If it has a child IA app, copy document to child as well     
                        logDebug("appTypeString" + appTypeString);                  
                        (appTypeString != "DEQ/WWM/Subdivision/Application")
                        {
                            var childArray = getChildren("DEQ/Ecology/IA/Application", capId)
                            for(x in childArray){
                                var iaCapId = childArray[x];
                                logDebug("iaCapId: " + iaCapId);
                                copyDocumentType(capId, iaCapId, "SCDHS Final Approval");                            
                            }
                        }
                       
                    }

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
                                sendNotification("", conEmail, "", "DEQ_WWM_FINAL REVIEW APPROVED", emailParams, reportFile);
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
                                sendNotification("", conEmail, "", "DEQ_WWM_FINAL REVIEW APPROVED", emailParams, reportFile);
                                emailAddressArray.push(peop.getEmail());
                                
                            }
                        }

                    }
                }
                else
                {
                    if (refSeqNumber != null || refSeqNumber != "")
                    {
                        logDebug("Same Email address has been found in the contacts for: " + refSeqNumber + ". Skip sending to the same email address.");     
                    }
                }
                                           		
            
            }
        }		
    }
       

// EHIMS-5041: No LP
/*
 var lpEmail = "";
 var lpEmailParams = aa.util.newHashtable();	
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
    
	getRecordParams4Notification(lpEmailParams);
    getWorkflowParams4Notification(lpEmailParams);
	logDebug("Emails" + lpEmail);	

    addParameter(lpEmailParams, "$$altID$$", capId.getCustomID());
    addParameter(lpEmailParams, "$$shortNotes$$", shortNotes);
    addACAUrlsVarToEmail(lpEmailParams);

	if (lpEmail != null)
	{
		sendNotification("", lpEmail, "", "DEQ_WWM_FINAL REVIEW APPROVED", lpEmailParams, lpReportFile);
	} */
}

/*
 * find a document on record and download it on disk, preparing it to be used on email attachment.
 * at least documentType or documentFileName should be passed, search priority for documentType.
 *
 * @param itemCapId capId for record
 * @param documentType {String} document type to find on record, pass null or empty to ignore
 * @param documentFileName {String} file name of the document to find, pass null or empty to ignore
 *
 * @returns {String} full path of the document if found, otherwise null
 */
function prepareDocumentForEmailAttachment(itemCapId, documentType, documentFileName) {
    if ((!documentType || documentType == "" || documentType == null) && (!documentFileName || documentFileName == "" || documentFileName == null))
    {
        logDebug("**WARN at least docType or docName should be provided, abort...!");
        return null;
    }
    var documents = aa.document.getCapDocumentList(itemCapId, aa.getAuditID());
    if (!documents.getSuccess())
    {
        logDebug("**WARN get cap documents error:" + documents.getErrorMessage());
        return null;
    } //get docs error
    documents = documents.getOutput();
    //sort (from new to old)
    documents.sort(function (d1, d2) {
        if (d1.getFileUpLoadDate().getTime() > d2.getFileUpLoadDate().getTime())
            return -1;
        else if (d1.getFileUpLoadDate().getTime() < d2.getFileUpLoadDate().getTime())
            return 1;
        else
            return 0;
    });
    //find doc by type or name
    var docToPrepare = null;
    for (var d in documents)
    {
        var catt = documents[d].getDocCategory();
        var namee = documents[d].getFileName();
        if (documentType && documentType != null && documentType != "" && documentType == catt)
        {
            docToPrepare = documents[d];
            break;
        }
        if (documentFileName && documentFileName != null && documentFileName != "" && namee.indexOf(documentFileName) > -1)
        {
            docToPrepare = documents[d];
            break;
        }
    } //for all docs
    //download to disk
    if (docToPrepare == null)
    {
        logDebug("**WARN No documents of type or name found");
        return null;
    } //no docs of type or name
    var thisCap = aa.cap.getCap(itemCapId).getOutput();
    var moduleName = thisCap.getCapType().getGroup();
    var toClear = docToPrepare.getFileName();
    toClear = toClear.replace("/", "-").replace("\\", "-").replace("?", "-").replace("%", "-").replace("*", "-").replace(":", "-").replace("|", "-").replace('"', "").replace("'", "").replace("<", "-").replace(">", "-").replace(" ", "_");
    docToPrepare.setFileName(toClear);
    var downloadRes = aa.document.downloadFile2Disk(docToPrepare, moduleName, "", "", true);
    if (downloadRes.getSuccess() && downloadRes.getOutput())
    {
        return downloadRes.getOutput().toString();
    } else
    {
        logDebug("**WARN document download failed, " + docToPrepare.getFileName());
        logDebug(downloadRes.getErrorMessage());
        return null;
    } //download failed
    return null;
}