    //WTUA:DEQ/WWM/SHIP/APPLICATION

    var contactResult = aa.people.getCapContactByCapID(capId);
    var capContacts = contactResult.getOutput();
    var addrResult = getAddressInALine(capId);
    var vEParams = aa.util.newHashtable();
    var addrResult = getAddressInALine(capId);
    addParameter(vEParams, "$$altID$$", capId.getCustomID());
    addParameter(vEParams, "$$address$$", addrResult);
    addParameter(vEParams, "$$wfComment$$", wfComment);
    var propOwnerEmail = "";
    for (c in capContacts)
    {
        if (matches(capContacts[c].getCapContactModel().getContactType(), "Property Owner"))
        {
            if (!matches(capContacts[c].email, null, undefined, ""))
            {
                propOwnerEmail += capContacts[c].email + ";"
                addParameter(vEParams, "$$FullNameBusName$$", capContacts[c].getCapContactModel().getContactName());
            }
        }
    }
    var conEmail = "";
    var appEmail = "";
    var homEmail = "";
    var homeOwnerName = "";
    var conArray = getContactArray(capId);
    var capIDString = capId.getCustomID();

    for (con in conArray)
    {
        if (!matches(conArray[con].email, null, undefined, "")) 
        {
            if (conArray[con].contactType == "Applicant") 
            {
                conEmail += conArray[con].email + ",";
                appEmail += conArray[con].email + ",";
                //logDebug("I'm getting contact");
            }
        }
    }

    for (con in conArray)
    {
        if (!matches(conArray[con].email, null, undefined, "")) 
        {
            if (conArray[con].contactType == "Homeowner") 
            {
                conEmail += conArray[con].email + ",";
                homEmail += conArray[con].email + ",";
                homeOwnerName += conArray[con].firstName + " " + conArray[con].lastName;
                logDebug("homeowner name is: " + homeOwnerName);
                //logDebug("I'm getting contact");
                addParameter(vEParams, "$$homeowner$$", homeOwnerName);
            }
        }
    }

    var otpReportParams = aa.util.newHashtable();
    var rcReportParams = aa.util.newHashtable();
    var otpReportFile = new Array();
    var rcReportFile = new Array();
    var alternateID = capId.getCustomID();

    addParameter(otpReportParams, "RecordId", alternateID.toString());
    addParameter(rcReportParams, "RecordId", alternateID.toString());

    //Application Review
    if (wfTask == "Application Review")
    {
        if (wfStatus == "Pending Review")
        {
            //sendNotification("", conEmail, "", "DEQ_SHIP_APPLICATION_RECEIVED", vEParams, null);
            //sendNotification("", conEmail, "", "DEQ_SHIP_SANI_RETRO_PROPOSED", vEParams, null);
            //may not be needed if these are sending on submittal
        }
        if (wfStatus == "I/A OWTS")
        {
            sendNotification("", appEmail, "", "DEQ_SHIP_FIELD_CONSULT_REQUIRED", vEParams, null);
        }
        if (wfStatus == "Conventional - Inspection Required")
        {
            sendNotification("", appEmail, "", "DEQ_SHIP_INSPECTION_REQUIRED", vEParams, null);
        }
        if (wfStatus == "Conventional - OK to Proceed")
        {
            if (AInfo["I/A OWTS Installation"] == "CHECKED")
            {
                otpReportFile = generateReportBatch(capId, "OK to Proceed", 'DEQ', otpReportParams)
                logDebug("This is the rFile: " + otpReportFile);

                if (otpReportFile)
                {
                    var otpRFiles = new Array();
                    var docList = getDocumentList();
                    var docDates = [];
                    var maxDate;

                    for (doc in docList)
                    {
                        if (matches(docList[doc].getDocCategory(), "Design Professional Sketch", "Preliminary Sketch"))
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
                    var docToSend = prepareDocumentForEmailAttachment(capId, docType, docFileName);

                    logDebug("docToSend" + docToSend);
                    docToSend = docToSend === null ? [] : [docToSend];
                    otpRFiles.push(docToSend);
                    otpRFiles.push(otpReportFile);
                }
                sendNotification("", conEmail, "", "DEQ_SHIP_14_DAY_OK_PROCEED", vEParams, otpRFiles);
            }
        }
        if (wfStatus == "Full Permit Required" || wfStatus == "Withdrawn")
        {
            closeTask("Application Review", "Full Permit Required", "", "");
            deactivateTask("Field Consult Required");
            deactivateTask("Residential Provisional Phase");
            deactivateTask("Grant Review");
        }
    }

    //Field Consult Required
    if (wfTask == "Field Consult Required")
    {
        if (wfStatus == "Incomplete")
        {
            sendNotification("", appEmail, "", "DEQ_SHIP_FIELD_CONSULT_REQUIRED", vEParams, null);
        }

        if (wfStatus == "Complete")
        {
            if (AInfo["I/A OWTS Installation"] == "CHECKED")
            {
                otpReportFile = generateReportBatch(capId, "OK to Proceed", 'DEQ', otpReportParams)
                logDebug("This is the rFile: " + otpReportFile);

                if (otpReportFile)
                {
                    var otpRFiles = new Array();
                    var docList = getDocumentList();
                    var docDates = [];
                    var maxDate;

                    for (doc in docList)
                    {
                        if (matches(docList[doc].getDocCategory(), "Design Professional Sketch", "Preliminary Sketch"))
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
                    var docToSend = prepareDocumentForEmailAttachment(capId, "Preliminary Sketch", docFileName);

                    logDebug("docToSend" + docToSend);
                    docToSend = docToSend === null ? [] : [docToSend];
                    otpRFiles.push(docToSend);
                    otpRFiles.push(otpReportFile);
                }
                sendNotification("", conEmail, "", "DEQ_SHIP_14_DAY_OK_PROCEED", vEParams, otpRFiles);
            }
        }

        if (wfStatus == "Waived")
        {
            sendNotification("", homEmail, "", "DEQ_SHIP_SANI_RETRO_PROPOSED", vEParams, null);
        }

    }

    //Preliminary Sketch Review
    if (wfTask == "Preliminary Sketch Review")
    {
        if (wfStatus == "OK to Proceed") 
        {
            sendNotification("", appEmail, "", "DEQ_SHIP_OK_PENDING_GRANT_REVIEW", vEParams, null);
        }
        if (wfStatus == "Inspection Required Prior to Install") 
        {
            sendNotification("", appEmail, "", "DEQ_SHIP_INSPECTION_REQUIRED", vEParams, null);
        }
        if (wfStatus == "Inspection Required Prior to Backfill")
        {
            sendNotification("", appEmail, "", "DEQ_SHIP_INSPECTION_REQUIRED_BACKFILL", vEParams, null);
        }
        if (matches(wfStatus, "OK to Proceed", "Inspection Required Prior to Install", "Inspection Required Prior to Backfill"))
        {
            var wfHist = aa.workflow.getWorkflowHistory(capId, null);
            var wfDates = [];
            var maxWfDate;
            var tasksCompleted = false;

            if (wfHist.getSuccess())
            {
                wfHist = wfHist.getOutput();
            } else
            {
                wfHist = new Array();
            }
            for (var h in wfHist)
            {
                if (wfHist[h].getTaskDescription() == "Grant Review")
                {
                    logDebug("epoch milliseconds of status date is: " + wfHist[h].getDispositionDate().getEpochMilliseconds());

                    wfDates.push(wfHist[h].getDispositionDate().getEpochMilliseconds());
                    maxWfDate = Math.max.apply(null, wfDates);
                    logDebug("maxWfdate is: " + maxWfDate);

                    if (matches(wfHist[h].getDisposition(), "No Application Received", "Not Eligible", "OK to Proceed") && maxWfDate == wfHist[h].getDispositionDate().getEpochMilliseconds())
                    {
                        tasksCompleted = true;
                        logDebug("tasks look good");
                    }

                }
            }
            if (tasksCompleted)
            {
                if (wfStatus == "OK to Proceed")
                {
                    closeTask("Inspections", "No Inspections Needed", "", "");
                }
                if (wfStatus == "Inspection Required Prior to Install")
                {
                    updateTask("Inspections", "Inspection Required Prior to Install", "", "");
                }
                if (wfStatus == "Inspection Required Prior to Backfill")
                {
                    updateTask("Inspections", "Inspection Required Prior to Backfill", "", "");
                }
            }
        }
        if (matches(wfStatus, "Full Permit Required", "Withdrawn"))
        {
            closeTask("Preliminary Sketch Review", "Full Permit Required", "", "");
            deactivateTask("Inspections");
            deactivateTask("Final Review");
        }
    }

    //Grant Review
    if (wfTask == "Grant Review")
    {
        if (wfStatus == "Awaiting Client Reply")
        {
            sendNotification("", appEmail, "", "DEQ_SHIP_14_DAY_DOC_REQUESTED", vEParams, null);
        }
        if (matches(wfStatus, "No Application Received", "Not Eligible", "OK to Proceed"))
        {
            var wfHist = aa.workflow.getWorkflowHistory(capId, null);
            var wfDates = [];
            var maxWfDate;
            var tasksCompleted = false;

            if (wfHist.getSuccess())
            {
                wfHist = wfHist.getOutput();
            } else
            {
                wfHist = new Array();
            }
            for (var h in wfHist)
            {
                if (wfHist[h].getTaskDescription() == "Preliminary Sketch Review")
                {
                    wfDates.push(wfHist[h].getDispositionDate().getEpochMilliseconds());
                    maxWfDate = Math.max.apply(null, wfDates);
                    logDebug("maxWfdate is: " + maxWfDate);

                    if (matches(wfHist[h].getDisposition(), "OK to Proceed", "Inspection Required Prior to Install", "Inspection Required Prior to Backfill") && maxWfDate == wfHist[h].getDispositionDate().getEpochMilliseconds())
                    {
                        tasksCompleted = true;
                        logDebug("tasks look good");
                    }
                    if (tasksCompleted)
                    {
                        if (wfHist[h].getDisposition() == "OK to Proceed")
                        {
                            closeTask("Inspections", "No Inspections Needed", "", "");
                        }
                        if (wfHist[h].getDisposition() == "Inspection Required Prior to Install")
                        {
                            updateTask("Inspections", "Inspection Required Prior to Install", "", "");
                        }
                        if (wfHist[h].getDisposition() == "Inspection Required Prior to Backfill")
                        {
                            updateTask("Inspections", "Inspection Required Prior to Backfill", "", "");
                        }
                    }
                }
            }
        }
        if (matches(wfStatus, "OK to Proceed", "Awaiting Client Reply", "Awaiting Grant Issuance"))
        {
            editAppSpecific("Part of Septic Improvement Program(SIP)", "Yes")
        }
        if (matches(wfStatus, "No Application Received", "Not Eligible"))
        {
            editAppSpecific("Part of Septic Improvement Program(SIP)", "No")
        }
        if (wfStatus == "OK to Proceed")
        {
            if (AInfo["I/A OWTS Installation"] == "CHECKED")
            {
                otpReportFile = generateReportBatch(capId, "OK to Proceed", 'DEQ', otpReportParams);
                logDebug("This is the rFile: " + otpReportFile);
                var otpRFiles = new Array();

                if (otpReportFile)
                {
                    var docList = getDocumentList();
                    var docDates = [];
                    var maxDate;

                    for (doc in docList)
                    {
                        if (matches(docList[doc].getDocCategory(), "Design Professional Sketch", "Preliminary Sketch"))
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
                    var docToSend = prepareDocumentForEmailAttachment(capId, "Preliminary Sketch", docFileName);

                    logDebug("docToSend" + docToSend);
                    docToSend = docToSend === null ? [] : [docToSend];
                    otpRFiles.push(docToSend);
                    otpRFiles.push(otpReportFile);
                }
                sendNotification("", conEmail, "", "DEQ_SHIP_14_DAY_OK_PROCEED", vEParams, otpRFiles);
            }
        }
    }

    //Inspections
    if (wfTask == "Inspections")
    {
        if (wfStatus == "Inspection Failure")
        {
            sendNotification("", appEmail, "", "DEQ_SHIP_INSPECTION_FAILURE", vEParams, null);
        }

        if (wfStatus == "Inspection Required Prior to Install")
        {
            sendNotification("", appEmail, "", "DEQ_SHIP_INSPECTION_REQUIRED", vEParams, null);
        }

        if (wfStatus == "Inspection Required Prior to Backfill")
        {
            sendNotification("", appEmail, "", "DEQ_SHIP_INSPECTION_REQUIRED_BACKFILL", vEParams, null);
        }
        if (wfStatus == "Complete")
        {
            if (AInfo["I/A OWTS Installation"] == "CHECKED")
            {
                otpReportFile = generateReportBatch(capId, "OK to Proceed", 'DEQ', otpReportParams)
                logDebug("This is the rFile: " + otpReportFile);

                if (otpReportFile)
                {
                    var otpRFiles = new Array();
                    var docList = getDocumentList();
                    var docDates = [];
                    var maxDate;

                    for (doc in docList)
                    {
                        if (matches(docList[doc].getDocCategory(), "Design Professional Sketch", "Preliminary Sketch"))
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
                    var docToSend = prepareDocumentForEmailAttachment(capId, "Preliminary Sketch", docFileName);

                    logDebug("docToSend" + docToSend);
                    docToSend = docToSend === null ? [] : [docToSend];
                    otpRFiles.push(docToSend);
                    otpRFiles.push(otpReportFile);
                }
                sendNotification("", conEmail, "", "DEQ_SHIP_14_DAY_OK_PROCEED", vEParams, otpRFiles);
            }
        }

    }

    //Final Review
    if (wfTask == "Final Review")
    {
        if (wfStatus == "Registration Complete")
        {
            var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
            if (capParcelResult.getSuccess())
            {
                var Parcels = capParcelResult.getOutput().toArray();
                for (zz in Parcels)
                {
                    var parcelNumber = Parcels[zz].getParcelNumber();
                    logDebug("parcelNumber = " + parcelNumber);
                    addParameter(vEParams, "$$Parcel$$", parcelNumber);
                }
            }
            sendNotification("", propOwnerEmail, "", "DEQ_SANITARY_REPLACEMENT", vEParams, null);

            if (AInfo["I/A OWTS Installation"] == "CHECKED")
            {
                rcReportFile = generateReportBatch(capId, "Registration Complete Report", 'DEQ', rcReportParams)
                logDebug("This is the rFile: " + rcReportFile);

                if (rcReportFile)
                {
                    var rcRFiles = new Array();
                    var docList = getDocumentList();
                    var docDates = [];
                    var maxDate;

                    for (doc in docList)
                    {
                        if (matches(docList[doc].getDocCategory(), "Design Professional Sketch", "Preliminary Sketch"))
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
                    var docToSend = prepareDocumentForEmailAttachment(capId, "Preliminary Sketch", docFileName);

                    logDebug("docToSend" + docToSend);
                    docToSend = docToSend === null ? [] : [docToSend];
                    rcRFiles.push(docToSend);
                    rcRFiles.push(rcReportFile);
                }
                sendNotification("", appEmail, "", "DEQ_SHIP_REGISTRATION_COMPLETE", vEParams, rcRFiles);
            }
        }
    }

    //General
    if (wfStatus == "No Inspection Needed" || wfStatus == "Complete")
    {
        sendNotification("", appEmail, "", "DEQ_SHIP_14_DAY_OK_PROCEED", vEParams, null);
    }

    if (wfTask != "Grant Review" && (wfStatus == "Awaiting Client Reply" || wfStatus == "Plan Revision Required"))
    {
        sendNotification("", appEmail, "", "DEQ_SHIP_ADDITIONAL_DOCUMENTS", vEParams, null);
    }

    if (wfStatus == "Full Permit Required")
    {
        sendNotification("", appEmail, "", "DEQ_SHIP_FULL_PERMIT_REQUIRED", vEParams, null);
    }

    if (wfStatus == "Withdrawn")
    {
        sendNotification("", appEmail, "", "DEQ_SHIP_WITHDRAWN", vEParams, null);
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
    function getAddressInALine(capId) {

        var capAddrResult = aa.address.getAddressByCapId(capId);
        var addressToUse = null;
        var strAddress = "";

        if (capAddrResult.getSuccess())
        {
            var addresses = capAddrResult.getOutput();
            if (addresses)
            {
                for (zz in addresses)
                {
                    capAddress = addresses[zz];
                    if (capAddress.getPrimaryFlag() && capAddress.getPrimaryFlag().equals("Y"))
                        addressToUse = capAddress;
                }
                if (addressToUse == null)
                    addressToUse = addresses[0];

                if (addressToUse)
                {
                    strAddress = addressToUse.getHouseNumberStart();
                    var addPart = addressToUse.getStreetDirection();
                    if (addPart && addPart != "")
                        strAddress += " " + addPart;
                    var addPart = addressToUse.getStreetName();
                    if (addPart && addPart != "")
                        strAddress += " " + addPart;
                    var addPart = addressToUse.getStreetSuffix();
                    if (addPart && addPart != "")
                        strAddress += " " + addPart;
                    var addPart = addressToUse.getCity();
                    if (addPart && addPart != "")
                        strAddress += " " + addPart + ",";
                    var addPart = addressToUse.getState();
                    if (addPart && addPart != "")
                        strAddress += " " + addPart;
                    var addPart = addressToUse.getZip();
                    if (addPart && addPart != "")
                        strAddress += " " + addPart;
                    return strAddress
                }
            }
        }
        return null;
    }
    function generateReportBatch(itemCap, reportName, module, parameters)
    {
        //returns the report file which can be attached to an email.
        var user = currentUserID; // Setting the User Name
        var report = aa.reportManager.getReportInfoModelByName(reportName);
        if (!report.getSuccess() || report.getOutput() == null)
        {
            logDebug("**WARN report generation failed, missing report or incorrect name: " + reportName);
            return false;
        }
        report = report.getOutput();
        report.setModule(module);
        report.setCapId(itemCap); //CSG Updated from itemCap.getCustomID() to just itemCap so the file would save to Record
        report.setReportParameters(parameters);
    
        var permit = aa.reportManager.hasPermission(reportName, user);
    
        if (permit.getOutput().booleanValue())
        {
            var reportResult = aa.reportManager.getReportResult(report);
            if (reportResult.getSuccess())
            {
                reportOutput = reportResult.getOutput();
                var reportFile = aa.reportManager.storeReportToDisk(reportOutput);
                reportFile = reportFile.getOutput();
                return reportFile;
            } else
            {
                logDebug("**WARN System failed get report: " + reportResult.getErrorType() + ":" + reportResult.getErrorMessage());
                return false;
            }
        } else
        {
            logDebug("You have no permission.");
            return false;
        }
    }