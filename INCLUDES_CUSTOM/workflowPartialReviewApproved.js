function workflowPartialReviewApproved()
{
	var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var reportFile = new Array();
	var conArray = getContactArray();
	var conEmail = "";
    var fromEmail = ""; 
    
	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
	}
	for (con in conArray)
	{
		if (!matches(conArray[con].email, null, undefined, ""))
		{
			conEmail += conArray[con].email + "; ";
		}
	}

	// EHIMS-5117
	var docList = getDocumentList();
	var docDates = [];
	var maxDate;

	for (doc in docList)
	{
		if (matches(docList[doc].getDocCategory(), "SCDHS Partial Final Approval"))
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
	var docToSend = prepareDocumentForEmailAttachment(capId, "SCDHS Partial Final Approval", docFileName);
	logDebug("docToSend" + docToSend);
	docToSend = docToSend === null ? [] : [docToSend];
	if (!matches(docToSend, null, undefined, ""))
	{
		reportFile.push(docToSend);
	}

	//EHIMS-5041: No LP
	/*var lpResult = aa.licenseScript.getLicenseProf(capId);
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
			conEmail += lpArr[lp].getEmail() + "; ";
		}
	} */
	getRecordParams4Notification(emailParams);
    getWorkflowParams4Notification(emailParams);    
    //addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
    addParameter(emailParams, "$$altID$$", capId.getCustomID());
	var shortNotes = getShortNotes(capId);
	addParameter(emailParams, "$$shortNotes$$", shortNotes);	
	addACAUrlsVarToEmail(emailParams);

	if (conEmail != null)
	{
		sendNotification("", conEmail, "", "DEQ_WWM_PARTIAL_FINAL_REVIEW", emailParams, reportFile);
	}
}

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
    toClear = toClear.replace("/", "-").replace("\\", "-").replace("?", "-").replace("%", "-").replace("*", "-").replace(":", "-").replace("|", "-").replace('"', "").replace("'", "").replace("<", "-").replace(">", "-").replace(".", "").replace(" ", "_");
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