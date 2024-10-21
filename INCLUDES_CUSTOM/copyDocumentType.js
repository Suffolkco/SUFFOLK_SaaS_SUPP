function copyDocumentType(pFromCapId, pToCapId, documentType)
{
    //Copies all attachments (documents) from pFromCapId to pToCapId
    var categoryArray = new Array();

    // third optional parameter is comma delimited list of categories to copy.
    if (arguments.length > 2)
    {
        categoryList = arguments[2];
        categoryArray = categoryList.split(",");
    }

    var docList = getDocumentList(pFromCapId);
    var docDates = [];
    var maxDate;
    var docNo;
    for (doc in docList)
    {
        if (matches(docList[doc].getDocCategory(), documentType))
        {
            logDebug("document type is: " + docList[doc].getDocCategory() + " and upload datetime of document is: " + docList[doc].getFileUpLoadDate().getTime());
            docDates.push(docList[doc].getFileUpLoadDate().getTime());
            maxDate = Math.max.apply(null, docDates);
            logDebug("maxdate is: " + maxDate);

            if (docList[doc].getFileUpLoadDate().getTime() == maxDate)
            {
                var docType = docList[doc].getDocCategory();
                var docFileName = docList[doc].getFileName();
                docNo = docList[doc].getDocumentNo();
               
                logDebug("Max time found: " + maxDate);
                logDebug("The latest file is: " + docNo + ', ' + docFileName);
            }
        }
    }

    var capDocResult = aa.document.getDocumentListByEntity(pFromCapId, "CAP");
    if (capDocResult.getSuccess())
    {
        if (capDocResult.getOutput().size() > 0)
        {
            for (docInx = 0; docInx < capDocResult.getOutput().size(); docInx++)
            {
                var documentObject = capDocResult.getOutput().get(docInx);
                currDocCat = "" + documentObject.getDocCategory();

                
				logDebug("Document Number: " + documentObject.getDocumentNo());
                logDebug("Document Category: " + currDocCat)
                logDebug("Compare doc number: " + documentObject.getDocumentNo() + " vs. " + docNo);

				if (currDocCat == documentType && maxDate == documentObject.getFileUpLoadDate().getTime() && 
                documentObject.getDocumentNo() == docNo) {

                    logDebug("Copy this document : " + docNo + " to " + pToCapId);

                    if (categoryArray.length == 0 || exists(currDocCat, categoryArray))
                    {
                        // download the document content
                        var useDefaultUserPassword = true;
                        //If useDefaultUserPassword = true, there is no need to set user name & password, but if useDefaultUserPassword = false, we need define EDMS user name & password.
                        var EMDSUsername = null;
                        var EMDSPassword = null;
                        var path = null;
                        var downloadResult = aa.document.downloadFile2Disk(documentObject, documentObject.getModuleName(), EMDSUsername, EMDSPassword, useDefaultUserPassword);
                        if (downloadResult.getSuccess())
                        {
                            path = downloadResult.getOutput();
                        }
                        var tmpEntId = pToCapId.getID1() + "-" + pToCapId.getID2() + "-" + pToCapId.getID3();
                        documentObject.setDocumentNo(null);
                        documentObject.setCapID(pToCapId)
                        documentObject.setEntityID(tmpEntId);

                        // Open and process file
                        try
                        {
                            if (path != null && path != "")
                            {
                                // put together the document content - use java.io.FileInputStream
                                var newContentModel = aa.document.newDocumentContentModel().getOutput();
                                inputstream = aa.io.FileInputStream(path);
                                newContentModel.setDocInputStream(inputstream);
                                documentObject.setDocumentContent(newContentModel);
                                var newDocResult = aa.document.createDocument(documentObject);
                                if (newDocResult.getSuccess())
                                {
                                    newDocResult.getOutput();
                                    logDebug("Successfully copied document: " + documentObject.getFileName() + " From: " + pFromCapId.getCustomID() + " To: " + pToCapId.getCustomID());
                                }
                                else
                                {
                                    logDebug("Failed to copy document: " + documentObject.getFileName());
                                    logDebug(newDocResult.getErrorMessage());
                                }
                            }
                        }
                        catch (err)
                        {
                            logDebug("Error copying document: " + err.message);
                            return false;
                        }
                    }
                }
            } // end for loop
        }
    }
}

function getDocumentList() {
	// Returns an array of documentmodels if any
	// returns an empty array if no documents
	itemCapId = (arguments.length == 1) ? arguments[0] : capId;
	var docListArray = new Array();

	docListResult = aa.document.getCapDocumentList(itemCapId,"ADMIN");

	if (docListResult.getSuccess()) {		
		docListArray = docListResult.getOutput();
	}
	return docListArray;
}