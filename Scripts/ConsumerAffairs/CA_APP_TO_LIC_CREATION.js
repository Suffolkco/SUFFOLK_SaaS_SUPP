
//Purpose: Create License and link to Application as Parent, update Expiration date to "Expiration Date" field from application
//Author: RLittlefield
if (wfTask == "Issuance" && wfStatus == "Issued")
{
    //Creating License
    var result = aa.cap.createApp(appTypeArray[0], appTypeArray[1], appTypeArray[2], "NA", '');
    //if the final parameter above causes an error, enter either the alias of the record or a comment
    if (result.getSuccess())
    {
        var parentOut = result.getOutput();
        var parentId = aa.cap.getCapID(parentOut.getID1(), parentOut.getID2(), parentOut.getID3()).getOutput();
        var linkResult = aa.cap.createAppHierarchy(parentId, capId);
        if (linkResult.getSuccess())
        {
            logDebug("Successfully linked to Application : " + capIDString);
            //Copying relevant info from Application to License
            copyContacts(capId, parentId);
            copyASIFields(capId, parentId);
            copyASITables(capId, parentId);
            copyDocumentsLOCAL(capId, parentId);
            aa.cap.updateAccessByACA(capId, "N");
            //Updating Expiration Date of License
            var expDate = getAppSpecific("Expiration Date", capId);
            expDate = new Date(expDate)
            var newExpDate = (expDate.getMonth() + 1) + "/" + 1 + "/" + (expDate.getYear() + 2);
            if (expDate != null)
            {
                var b1ExpResult = aa.expiration.getLicensesByCapID(parentId);
                if (b1ExpResult.getSuccess())
                {
                    var b1Exp = b1ExpResult.getOutput();
                    b1Exp.setExpStatus("Active");
                    b1Exp.setExpDate(aa.date.parseDate(newExpDate));
                    editAppSpecific("Expiration Date", newExpDate);
                    aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
                }
            }
            //Giving user Access to License in ACA
            var capResult = aa.cap.getCap(parentId).getOutput();
            var capModelResult = capResult.getCapModel();
            var pUser = capModelResult.getCreatedBy();
            var publicUserModelResult = aa.publicUser.getPublicUserByPUser(pUser);
            if (!publicUserModelResult.getSuccess() || !publicUserModelResult.getOutput())
            {
                logDebug("**WARNING** couldn't find public user " + publicUser + " " + publicUserModelResult.getErrorMessage());
            }
            else
            {
                var userSeqNum = publicUserModelResult.getOutput().getUserSeqNum();
                var attachResult = aa.cap.updateCreatedAccessBy4ACA(parentId, 'PUBLICUSER' + userSeqNum, 'Y', 'Y');
            }
        }
        else
        {
            logDebug("**ERROR: linking to application to (" + capIDString + "): " + linkResult.getErrorMessage());
        }
    }
}


function copyDocumentsLOCAL(pFromCapId, pToCapId)
{
    //Copies all attachments (documents) from pFromCapId to pToCapId
    var categoryArray = new Array();

    // third optional parameter is comma delimited list of categories to copy.
    if (arguments.length > 2)
    {
        categoryList = arguments[2];
        categoryArray = categoryList.split(",");
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
                            inputstream = new java.io.FileInputStream(path);
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
            } // end for loop
        }
    }
}