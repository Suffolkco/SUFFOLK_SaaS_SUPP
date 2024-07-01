//WTUA:DEQ/WWM/SHIP/APPLICATION

//showDebug = true;
var contactResult = aa.people.getCapContactByCapID(capId);
var capContacts = contactResult.getOutput();
var addrResult = getAddressInALine(capId);
var vEParams = aa.util.newHashtable();
var addrResult = getAddressInALine(capId);
addParameter(vEParams, "$$altID$$", capId.getCustomID());
addParameter(vEParams, "$$address$$", addrResult);
addParameter(vEParams, "$$wfComment$$", wfComment);

var propOwnerEmail = "";
var propOwnerName = "";
var allEmail = "";
var agentEmail = "";
var lpEmail = "";

// EHIMS2-289: Get Created By
    var  capDetail = getCapDetailByID(capId);
    var userId = capDetail.getCreateBy();
    var createByUseObj = aa.person.getUser(userId).getOutput();  
    if (createByUseObj != null)
    {
        var userName = createByUseObj.getFirstName() + " " + createByUseObj.getLastName();
        logDebug("userName is: " + userName);
        createByEmail =  createByUseObj.getEmail();           
        logDebug("email address is: " + createByEmail);
    }

for (c in capContacts)
{
    if (matches(capContacts[c].getCapContactModel().getContactType(), "Property Owner"))
    {
        if (!matches(capContacts[c].email, null, undefined, ""))
        {
            allEmail += capContacts[c].email + ";";

            propOwnerEmail += capContacts[c].email + ";"
            propOwnerName += capContacts[c].firstName + " " + capContacts[c].lastName;
            logDebug("propOwner name is: " + propOwnerName);
            addParameter(vEParams, "$$homeowner$$", propOwnerName);
            addParameter(vEParams, "$$FullNameBusName$$", capContacts[c].getCapContactModel().getContactName());
        }
    }
    if (matches(capContacts[c].getCapContactModel().getContactType(), "Agent"))
    {
        if (!matches(capContacts[c].email, null, undefined, ""))
        {
            allEmail += capContacts[c].email + ";";
            agentEmail += capContacts[c].email + ";";
        }
    }
}
var lpResult = aa.licenseScript.getLicenseProf(capId);
if (lpResult.getSuccess())
{
    var lpArr = lpResult.getOutput();

    // Send email to each contact separately.
    for (var lp in lpArr)
    {
        if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
        {
            lpEmail += lpArr[lp].email + ";";
            allEmail += lpArr[lp].email + ";";

        }
    }
}
else 
{
    logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage());
}
var lpAgentEmail;

if (!matches(createByEmail, null, undefined, ""))
{
    lpAgentEmail = agentEmail + lpEmail + createByEmail;
}
else
{
    lpAgentEmail = agentEmail + lpEmail;
}
var capIDString = capId.getCustomID();
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
    if (wfStatus == "I/A OWTS - Consult Required")
    {
        sendNotification("", lpAgentEmail, "", "DEQ_SHIP_FIELD_CONSULT_REQUIRED", vEParams, null);
    }
    if (wfStatus == "I/A OWTS - Consult Waived")
    {
        deactivateTask("Field Consult Required");
        //deactivateTask("Grant Review");
        activateTask("Preliminary Sketch Review");
        updateAppStatus("Pending Review");
    }
    if (wfStatus == "Conventional - Inspection Required")
    {
        //sendNotification("", lpAgentEmail, "", "DEQ_SHIP_INSPECTION_REQUIRED", vEParams, null);
    }
    if (wfStatus == "Conventional - OK to Proceed")
    {
        otpReportFile = generateReportBatch(capId, "SHIP OK to Proceed", 'DEQ', otpReportParams)
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
            if (!matches(docToSend, null, undefined, ""))
            {
                otpRFiles.push(docToSend);
            } otpRFiles.push(otpReportFile);
        }
        sendNotification("", lpAgentEmail, "", "DEQ_SHIP_14_DAY_OK_PROCEED", vEParams, otpRFiles);
    }
    if (wfStatus == "Full Permit Required")
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
        sendNotification("", lpAgentEmail, "", "DEQ_SHIP_FIELD_CONSULT_REQUIRED", vEParams, null);
    }

    if (wfStatus == "Full Permit Required")
    {
        closeTask("Field Consult Required", "Full Permit Required", "", "");
        deactivateAllActiveTasks(capId);
        updateAppStatus("Full OWM Application Required");
    }


    if (wfStatus == "Waived")
    {
        // sendNotification("", propOwnerEmail, "", "DEQ_SHIP_SANI_RETRO_PROPOSED", vEParams, null);
    }

}

//Preliminary Sketch Review
if (wfTask == "Preliminary Sketch Review")
{
    var tasksCompleted = false;

    if (matches(wfStatus, "OK to Proceed", "Inspection Required Prior to Install", "Inspection Required Prior to Backfill"))
    {
        var wfHist = aa.workflow.getWorkflowHistory(capId, null);
        var wfDates = [];
        var maxWfDate;
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
                }

            }
        }
        if (tasksCompleted)
        {
            if (wfStatus == "OK to Proceed")
            {
                sendNotification("", lpAgentEmail, "", "DEQ_SHIP_14_DAY_OK_PROCEED", vEParams, null);
                closeTask("Inspections", "No Inspections Needed", "", "");
                activateTask("Final Review");
                updateAppStatus("OK to Proceed");
            }
            if (wfStatus == "Inspection Required Prior to Install")
            {
                sendNotification("", lpAgentEmail, "", "DEQ_SHIP_INSPECTION_REQUIRED", vEParams, null);
                updateTask("Inspections", "Inspection Required Prior to Install", "", "");
            }
            if (wfStatus == "Inspection Required Prior to Backfill")
            {
                sendNotification("", lpAgentEmail, "", "DEQ_SHIP_INSPECTION_REQUIRED_BACKFILL", vEParams, null);
                updateTask("Inspections", "Inspection Required Prior to Backfill", "", "");
            }
        }
        if (!tasksCompleted)
        {
            if (wfStatus == "Inspection Required Prior to Install")
            {
                sendNotification("", lpAgentEmail, "", "DEQ_SHIP_INSPECTION_REQUIRED", vEParams, null);
                updateAppStatus("Insp Required Pending Grant");
            }
            if (matches(wfStatus, "OK to Proceed", "Inspection Required Prior to Backfill"))
            {
                updateAppStatus("OK Pending Grant Review");
                if (wfStatus == "OK to Proceed") 
                {
                    sendNotification("", lpAgentEmail, "", "DEQ_SHIP_OK_PENDING_GRANT_REVIEW", vEParams, null);
                }
                if (wfStatus == "Inspection Required Prior to Backfill")
                {
                    sendNotification("", lpAgentEmail, "", "DEQ_SHIP_INSPECTION_REQUIRED_BACKFILL", vEParams, null);
                }
            }
            deactivateTask("Inspections");
        }
    }
    if (matches(wfStatus, "Full Permit Required"))
    {
        closeTask("Preliminary Sketch Review", "Full Permit Required", "", "");
        deactivateAllActiveTasks(capId);
    }
}

//Grant Review
if (wfTask == "Grant Review")
{
    if (matches(wfStatus, "No Application Received", "Not Eligible", "OK to Proceed"))
    {
        if (isTaskActive("Field Consult Required"))
        {
            deactivateTask("Inspections");
        }

        var wfHisto = aa.workflow.getWorkflowHistory(capId, null);
        if (wfHisto.getSuccess())
        {
            wfHisto = wfHisto.getOutput();
        } else
        {
            wfHisto = new Array();
        }
        for (var h in wfHisto)
        {
            if (wfHisto[h].getTaskDescription() == "Preliminary Sketch Review")
            {
                if (matches(wfHisto[h].getDisposition(), "OK to Proceed"))
                {
                    updateAppStatus("OK to Proceed");
                }
            }
        }
        if (matches(wfStatus, "No Application Received", "Not Eligible"))
        {
            editAppSpecificLOCAL("Part of Septic Improvement Program(SIP)", "No", capId);
        }

        //End Case of 64
        if (wfStatus == "OK to Proceed")
        {
            editAppSpecificLOCAL("Part of Septic Improvement Program(SIP)", "Yes", capId);
        }
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
                    //Prelim is OK to Proceed
                    if (wfHist[h].getDisposition() == "OK to Proceed")
                    {
                        otpReportFile = generateReportBatch(capId, "SHIP OK to Proceed", 'DEQ', otpReportParams);
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
                            if (!matches(docToSend, null, undefined, ""))
                            {
                                otpRFiles.push(docToSend);
                            } otpRFiles.push(otpReportFile);
                        }
                        sendNotification("", lpAgentEmail, "", "DEQ_SHIP_14_DAY_OK_PROCEED", vEParams, otpRFiles);
                        closeTask("Inspections", "No Inspections Needed", "", "");
                        activateTask("Final Review");
                    }
                    //Prelim task is Inspection Required Prior to Install
                    if (wfHist[h].getDisposition() == "Inspection Required Prior to Install")
                    {
                        //new email template is coming to be sent here (2/17/23)
                        updateTask("Inspections", "Inspection Required Prior to Install", "", "");
                    }
                    //Prelim task is Inspection Required Prior to Backfill
                    if (wfHist[h].getDisposition() == "Inspection Required Prior to Backfill")
                    {
                        //new email template is coming to be sent here (2/17/23)
                        updateTask("Inspections", "Inspection Required Prior to Backfill", "", "");
                    }
                }
                else
                {
                    deactivateTask("Inspections");
                }
            }
        }
    }
    if (matches(wfStatus, "Awaiting Client Reply", "Awaiting Grant Issuance"))
    {
        editAppSpecificLOCAL("Part of Septic Improvement Program(SIP)", "Yes", capId);
    }
}

//Inspections
if (wfTask == "Inspections")
{
    if (wfStatus == "Inspection Failure")
    {
        var InspComment = GetLastInspComment(capId);
        var InspDate = GetLastInspDate(capId);
        addParameter(vEParams, "$$wfComment$$", InspComment);
        addParameter(vEParams, "$$InspDate$$", InspDate);
        addParameter(vEParams, "$$altID$$", capId.getCustomID());
        sendNotification("", lpAgentEmail, "", "DEQ_SHIP_INSPECTION_FAILURE", vEParams, null);
    }
    if (wfStatus == "Inspection Required Prior to Install")
    {
        sendNotification("", lpAgentEmail, "", "DEQ_SHIP_INSPECTION_REQUIRED", vEParams, null);
    }

    if (wfStatus == "Inspection Required Prior to Backfill")
    {
        sendNotification("", lpAgentEmail, "", "DEQ_SHIP_INSPECTION_REQUIRED_BACKFILL", vEParams, null);
    }
    if (wfStatus == "No Inspection Needed")
    {
        otpReportFile = generateReportBatch(capId, "SHIP OK to Proceed", 'DEQ', otpReportParams);
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
            if (!matches(docToSend, null, undefined, ""))
            {
                otpRFiles.push(docToSend);
            } otpRFiles.push(otpReportFile);
        }
        sendNotification("", lpAgentEmail, "", "DEQ_SHIP_14_DAY_OK_PROCEED", vEParams, otpRFiles);
    }
    
    //EHIMS2-303
    if (wfStatus == "Plan Changed")
    {       
        var iaOwts = getAppSpecific("I/A OWTS Installation");
        if (iaOwts == "CHECKED")
        {
            deactivateTask("Inspections");     
            activateTask("Preliminary Sketch Review");
        }
        else
        {
            deactivateTask("Inspections");     
            activateTask("Application Review");
        }
     
    }
}

//Final Review
if (wfTask == "Final Review")
{
    //EHIMS2-303
    if (wfStatus == "Plan Changed")
    {       
        var iaOwts = getAppSpecific("I/A OWTS Installation");
        if (iaOwts == "CHECKED")
        {
            deactivateTask("Final Review");     
            activateTask("Preliminary Sketch Review");
        }
        else
        {
            deactivateTask("Final Review");     
            activateTask("Application Review");
        }
     
    }

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

        //sendNotification("", allEmail, "", "DEQ_SANITARY_REPLACEMENT", vEParams, null);


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
                if (matches(docList[doc].getDocCategory(), "Final Sketch"))
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
            var docToSend = prepareDocumentForEmailAttachment(capId, "Final Sketch", docFileName);

            logDebug("docToSend" + docToSend);
            docToSend = docToSend === null ? [] : [docToSend];
            if (!matches(docToSend, null, undefined, ""))
            {
                rcRFiles.push(docToSend);

                 //EHIMS-5224: If it has a child IA app, copy document to child as well  
                var childArray = getChildren("DEQ/Ecology/IA/Application", capId)
                for(x in childArray){
                    var iaCapId = childArray[x];
                    logDebug("iaCapId: " + iaCapId);
                    logDebug("capId: " + capId);
                    copyDocumentType(capId, iaCapId, "Final Sketch");                            
                }
                 
            }
            rcRFiles.push(rcReportFile);
        }

        //begin SHIP SYSTEM DETAILS check
        var shipSystemTable = loadASITable("SHIP SYSTEM DETAILS", capId);
        var checkIANumber = false;
        if (shipSystemTable.length > 0)
        {
            for (sstrow in shipSystemTable)
            {
                var inspSchedDate = shipSystemTable[sstrow]["Installation Date"];
                var iaManufacturer = shipSystemTable[sstrow]["I/A Manufacturer"];
                var iaModel = shipSystemTable[sstrow]["I/A Model"];
                var iaLeachProduct = shipSystemTable[sstrow]["Leaching Product/Material"];
                var iaLeachOtherType = shipSystemTable[sstrow]["Leaching Type"];
                var iaEffluentPumpPools = shipSystemTable[sstrow]["Effluent Pump"];
                if (iaManufacturer != "N/A") 
                {
                    checkIANumber = true;

                    if (!matches(getAppSpecific("IA Number"), null, undefined, "") && !matches(getAppSpecific("O&M Contract Approved"), null, undefined, "")) 
                    {
                        //updateAppStatus("Registration Complete");
                        closeTask("Final Review", "Registration Complete", "", "");
                        deactivateAllActiveTasks(capId);
                        if (rcRFiles != undefined)
                        {
                            sendNotification("", allEmail, "", "DEQ_SHIP_REGISTRATION_COMPLETE", vEParams, rcRFiles);
                            if (!matches(createByEmail, null, undefined, ""))
                            {
                                sendNotification("", createByEmail, "", "DEQ_SHIP_REGISTRATION_COMPLETE", vEParams, rcRFiles);
                            }
                        }
                    }
                }

                if (iaManufacturer == "N/A") 
                {
                    //Emails should only be sent whe task is deactivated
                    //updateAppStatus("Registration Complete");
                    closeTask("Final Review", "Registration Complete", "", "");
                    deactivateAllActiveTasks(capId);
                    logDebug("rcrfiles is: " + rcRFiles);
                    if (rcRFiles != undefined)
                    {
                        sendNotification("", allEmail, "", "DEQ_SHIP_REGISTRATION_COMPLETE", vEParams, rcRFiles);
                        if (!matches(createByEmail, null, undefined, ""))
                        {
                            sendNotification("", createByEmail, "", "DEQ_SHIP_REGISTRATION_COMPLETE", vEParams, rcRFiles);
                        }
                        //Removed Per Edward's comment
                        //sendNotification("", allEmail, "", "DEQ_SANITARY_REPLACEMENT", vEParams, null);
                    }
                }

            }
            if (checkIANumber)
            {
                var newInspSchedDate = new Date(inspSchedDate);
                var inspSchedDatePlusOne = (newInspSchedDate.getMonth() + 1) + "/" + newInspSchedDate.getDate() + "/" + (newInspSchedDate.getYear() + 1901);
                var inspSchedDatePlusThree = (newInspSchedDate.getMonth() + 1) + "/" + newInspSchedDate.getDate() + "/" + (newInspSchedDate.getYear() + 1903);


                if (!matches(getAppSpecific("IA Number"), null, undefined, "") && matches(getAppSpecific("O&M Contract Approved"), null, undefined, ""))
                {
                    var vEParams = aa.util.newHashtable();
                    var addrResult = getAddressInALine(capId);
                    addParameter(vEParams, "$$altID$$", getAppSpecific("IA Number"));
                    addParameter(vEParams, "$$address$$", addrResult);
                    var iaNumberToCheck = getAppSpecific("IA Number");
                    logDebug("ianumbertocheck is: " + iaNumberToCheck);
                    var iaNumberToFind = aa.cap.getCapID(iaNumberToCheck).getOutput();
                    logDebug("ianumbertofind is: " + iaNumberToFind);
                    var pin = getAppSpecific("IA PIN Number", iaNumberToFind);
                    logDebug("pin is: " + pin);
                    addParameter(vEParams, "$$pin$$", pin);
                    addParameter(vEParams, "$$wwmAltID$$", altId);
                    addParameter(vEParams, "$$Parcel$$", parcelNumber);
                    updateAppStatus("Awaiting O&M Contract");
                    sendNotification("", allEmail, "", "DEQ_IA_APPLICATION_NOTIFICATION", vEParams, null);
                    if (!matches(createByEmail, null, undefined, ""))
                    {
                        sendNotification("", createByEmail, "", "DEQ_IA_APPLICATION_NOTIFICATION", vEParams, null);
                    }
                }

                if (matches(getAppSpecific("IA Number"), null, undefined, ""))
                {
                    var iaNew = createChild("DEQ", "Ecology", "IA", "Application");
                    var iaCustom = iaNew.getCustomID();
                    var getCapResult = aa.cap.getCapIDsByAppSpecificInfoField("Technology Name/Series", iaManufacturer);
                    if (getCapResult.getSuccess())
                    {
                        var apsArray = getCapResult.getOutput();
                        for (aps in apsArray)
                        {
                            myCap = aa.cap.getCap(apsArray[aps].getCapID()).getOutput();
                            logDebug("apsArray = " + apsArray);
                            var relCap = myCap.getCapID();
                            logDebug("relCapID = " + relCap.getCustomID());
                            var relCapID = relCap.getCustomID();
                        }
                    }
                    if (relCap != null)
                    {
                        copyLicensedProfByType(capId, iaNew, ["IA Installer"]);
                        copyLicensedProfByType(relCap, iaNew, ["IA Vendor"]);
                    }
                    else
                    {
                        copyLicensedProfByType(capId, iaNew, ["IA Installer"]);
                    }
                    copyContactsByType(capId, iaNew, ["Property Owner"]);
                    copyAddress(capId, iaNew);
                    copyParcel(capId, iaNew);
                    copyDocumentsToCapID(capId, iaNew);

                    editAppSpecificLOCAL("Installation Date", inspSchedDate, iaNew);
                    editAppSpecificLOCAL("Manufacturer", iaManufacturer, iaNew);
                    editAppSpecificLOCAL("Model", iaModel, iaNew);
                    editAppSpecificLOCAL("WWM Application Number", capIDString, iaNew);
                    editAppSpecificLOCAL("Leaching Manufacturer", iaLeachProduct, iaNew);
                    editAppSpecificLOCAL("Next Sample Date", inspSchedDatePlusThree, iaNew);
                    editAppSpecificLOCAL("Next Service Date", inspSchedDatePlusOne, iaNew);
                    var currentIANumber = getAppSpecific("IA Number", capId);

                    if (matches(currentIANumber, undefined, null, "", " "))
                    {
                        editAppSpecificLOCAL("IA Number", iaCustom, capId)
                    }
                    else
                    {
                        editAppSpecificLOCAL("IA Number", currentIANumber + " " + iaCustom, capId)
                    }
                    var newWorkDesc = "";
                    if (!matches(iaManufacturer, "N/A", undefined, null, " "))
                    {
                        newWorkDesc += iaManufacturer + " ";
                    }
                    if (!matches(iaModel, "N/A", undefined, null, " "))
                    {
                        newWorkDesc += iaModel + " ";
                    }
                    if (!matches(iaLeachOtherType, "N/A", undefined, null, " "))
                    {
                        newWorkDesc += iaLeachOtherType + " ";
                    }
                    if (!matches(iaLeachProduct, "N/A", undefined, null, " "))
                    {
                        newWorkDesc += iaLeachProduct + " ";
                    }
                    logDebug("newworkdesc is: " + newWorkDesc);
                    updateWorkDesc(newWorkDesc, iaNew);
                    editAppName("Installed: " + inspSchedDate, iaNew);


                    if (iaLeachOtherType != null)
                    {
                        editAppSpecificLOCAL("Leaching", iaLeachOtherType, iaNew);
                    }
                    if (iaEffluentPumpPools != null)
                    {
                        editAppSpecificLOCAL("Effluent Pump", iaEffluentPumpPools, iaNew);
                    }
                    var propertyType = getAppSpecific("Select Property Type", capId);
                    if (!matches(propertyType, null, undefined, ""))
                    {
                        editAppSpecificLOCAL("Type", propertyType, iaNew)
                    }
                    var pinNumber = makePIN(8);
                    editAppSpecificLOCAL('IA PIN Number', pinNumber, iaNew)



                    //Start Notification to Parent Contacts/LPs
                    logDebug("capId = " + capId);
                    var AInfo = new Array();
                    logDebug("parentCapId = " + parentCapId);
                    var allEmail = "";
                    logDebug("iaNew =" + iaNew);
                    var pin = getAppSpecific('IA PIN Number', iaNew);
                    logDebug("pin = " + pin);
                    var altId = capId.getCustomID();
                    var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
                    if (capParcelResult.getSuccess())
                    {
                        var Parcels = capParcelResult.getOutput().toArray();
                        for (zz in Parcels)
                        {
                            var parcelNumber = Parcels[zz].getParcelNumber();
                            logDebug("parcelNumber = " + parcelNumber);
                        }
                    }

                    //gathering LPs from parent
                    var licProfResult = aa.licenseScript.getLicenseProf(capId);
                    var capLPs = licProfResult.getOutput();
                    logDebug("CapLPs = " + capLPs);
                    for (l in capLPs)
                    {
                        logDebug("capLPs = " + capLPs[l]);
                        if (!matches(capLPs[l].email, null, undefined, ""))
                        {
                            logDebug("LP emails = " + capLPs[l].email);
                            allEmail += capLPs[l].email + ";"
                            logDebug("allEmail = " + allEmail);
                        }
                    }
                    //gathering contacts from parent
                    var contactResult = aa.people.getCapContactByCapID(capId);
                    var capContacts = contactResult.getOutput();
                    for (c in capContacts)
                    {
                        logDebug("capContacts = " + capContacts[c]);
                        if (!matches(capContacts[c].email, null, undefined, ""))
                        {
                            logDebug("contact emails = " + capContacts[c].email);
                            allEmail += capContacts[c].email + ";"
                            logDebug("allEmail post contacts = " + allEmail);
                        }
                    }


                    //Sending Notification

                    var vEParams = aa.util.newHashtable();
                    var addrResult = getAddressInALine(capId);
                    addParameter(vEParams, "$$altID$$", iaCustom);
                    addParameter(vEParams, "$$address$$", addrResult);
                    addParameter(vEParams, "$$pin$$", pin);
                    addParameter(vEParams, "$$wwmAltID$$", altId);
                    addParameter(vEParams, "$$Parcel$$", parcelNumber);
                    sendNotification("", allEmail, "", "DEQ_IA_APPLICATION_NOTIFICATION", vEParams, null);
                    if (!matches(createByEmail, null, undefined, ""))
                    {
                        sendNotification("", createByEmail, "", "DEQ_IA_APPLICATION_NOTIFICATION", vEParams, null);
                    }
                    updateAppStatus("Awaiting O&M Contract");
                }
            }
        }
    }
    if (wfStatus == "Awaiting Client Reply")
    {
        var shipSystemTable = loadASITable("SHIP SYSTEM DETAILS", capId);
        var checkIANumber = false;
        if (shipSystemTable.length > 0)
        {
            for (sstrow in shipSystemTable)
            {
                var inspSchedDate = shipSystemTable[sstrow]["Installation Date"];
                var iaManufacturer = shipSystemTable[sstrow]["I/A Manufacturer"];
                var iaModel = shipSystemTable[sstrow]["I/A Model"];
                var iaLeachProduct = shipSystemTable[sstrow]["Leaching Product/Material"];
                var iaLeachOtherType = shipSystemTable[sstrow]["Leaching Type"];
                var iaEffluentPumpPools = shipSystemTable[sstrow]["Effluent Pump"];

                if (iaManufacturer != "N/A") 
                {
                    checkIANumber = true;
                }
                //Eduardo Section Jira EHIMS2-93 1.B
                else if (iaManufacturer == "N/A") 
                {
                    updateAppStatus('Documents Requested');
                    checkIANumber = false;
                }
            }
            if (checkIANumber)
            {

                var newInspSchedDate = new Date(inspSchedDate);
                var inspSchedDatePlusOne = (newInspSchedDate.getMonth() + 1) + "/" + newInspSchedDate.getDate() + "/" + (newInspSchedDate.getYear() + 1901);
                var inspSchedDatePlusThree = (newInspSchedDate.getMonth() + 1) + "/" + newInspSchedDate.getDate() + "/" + (newInspSchedDate.getYear() + 1903);

                if (matches(getAppSpecific("IA Number"), null, undefined, ""))
                {
                    var iaNew = createChild("DEQ", "Ecology", "IA", "Application");
                    var iaCustom = iaNew.getCustomID();
                    var getCapResult = aa.cap.getCapIDsByAppSpecificInfoField("Technology Name/Series", iaManufacturer);
                    if (getCapResult.getSuccess())
                    {
                        var apsArray = getCapResult.getOutput();
                        for (aps in apsArray)
                        {
                            myCap = aa.cap.getCap(apsArray[aps].getCapID()).getOutput();
                            logDebug("apsArray = " + apsArray);
                            var relCap = myCap.getCapID();
                            logDebug("relCapID = " + relCap.getCustomID());
                            var relCapID = relCap.getCustomID();
                        }
                    }
                    if (relCap != null)
                    {
                        copyLicensedProfByType(capId, iaNew, ["IA Installer"]);
                        copyLicensedProfByType(relCap, iaNew, ["IA Vendor"]);
                    }
                    else
                    {
                        copyLicensedProfByType(capId, iaNew, ["IA Installer"]);
                    }
                    copyContactsByType(capId, iaNew, ["Property Owner"]);
                    copyAddress(capId, iaNew);
                    copyParcel(capId, iaNew);
                    copyDocumentsToCapID(capId, iaNew);

                    editAppSpecificLOCAL("Installation Date", inspSchedDate, iaNew);
                    editAppSpecificLOCAL("Manufacturer", iaManufacturer, iaNew);
                    editAppSpecificLOCAL("Model", iaModel, iaNew);
                    editAppSpecificLOCAL("WWM Application Number", capIDString, iaNew);
                    editAppSpecificLOCAL("Leaching Manufacturer", iaLeachProduct, iaNew);
                    editAppSpecificLOCAL("Next Sample Date", inspSchedDatePlusThree, iaNew);
                    editAppSpecificLOCAL("Next Service Date", inspSchedDatePlusOne, iaNew);
                    var currentIANumber = getAppSpecific("IA Number", capId);

                    if (matches(currentIANumber, undefined, null, "", " "))
                    {
                        editAppSpecificLOCAL("IA Number", iaCustom, capId)
                    }
                    else
                    {
                        editAppSpecificLOCAL("IA Number", currentIANumber + " " + iaCustom, capId)
                    }
                    var newWorkDesc = "";
                    if (!matches(iaManufacturer, "N/A", undefined, null, " "))
                    {
                        newWorkDesc += iaManufacturer + " ";
                    }
                    if (!matches(iaModel, "N/A", undefined, null, " "))
                    {
                        newWorkDesc += iaModel + " ";
                    }
                    if (!matches(iaLeachOtherType, "N/A", undefined, null, " "))
                    {
                        newWorkDesc += iaLeachOtherType + " ";
                    }
                    if (!matches(iaLeachProduct, "N/A", undefined, null, " "))
                    {
                        newWorkDesc += iaLeachProduct + " ";
                    }
                    logDebug("newworkdesc is: " + newWorkDesc);
                    updateWorkDesc(newWorkDesc, iaNew);
                    editAppName("Installed: " + inspSchedDate, iaNew);


                    if (iaLeachOtherType != null)
                    {
                        editAppSpecificLOCAL("Leaching", iaLeachOtherType, iaNew);
                    }
                    if (iaEffluentPumpPools != null)
                    {
                        editAppSpecificLOCAL("Effluent Pump", iaEffluentPumpPools, iaNew);
                    }
                    var propertyType = getAppSpecific("Select Property Type", capId);
                    if (!matches(propertyType, null, undefined, ""))
                    {
                        editAppSpecificLOCAL("Type", propertyType, iaNew)
                    }
                    var pinNumber = makePIN(8);
                    editAppSpecificLOCAL('IA PIN Number', pinNumber, iaNew)

                    //Start Notification to Parent Contacts/LPs
                    logDebug("capId = " + capId);
                    var AInfo = new Array();
                    logDebug("parentCapId = " + parentCapId);
                    var allEmail = "";
                    logDebug("iaNew =" + iaNew);
                    var pin = getAppSpecific('IA PIN Number', iaNew);
                    logDebug("pin = " + pin);
                    var altId = capId.getCustomID();
                    var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
                    if (capParcelResult.getSuccess())
                    {
                        var Parcels = capParcelResult.getOutput().toArray();
                        for (zz in Parcels)
                        {
                            var parcelNumber = Parcels[zz].getParcelNumber();
                            logDebug("parcelNumber = " + parcelNumber);
                        }
                    }

                    //gathering LPs from parent
                    var licProfResult = aa.licenseScript.getLicenseProf(capId);
                    var capLPs = licProfResult.getOutput();
                    logDebug("CapLPs = " + capLPs);
                    for (l in capLPs)
                    {
                        logDebug("capLPs = " + capLPs[l]);
                        if (!matches(capLPs[l].email, null, undefined, ""))
                        {
                            logDebug("LP emails = " + capLPs[l].email);
                            allEmail += capLPs[l].email + ";"
                            logDebug("allEmail = " + allEmail);
                        }
                    }
                    //gathering contacts from parent
                    var contactResult = aa.people.getCapContactByCapID(capId);
                    var capContacts = contactResult.getOutput();
                    for (c in capContacts)
                    {
                        logDebug("capContacts = " + capContacts[c]);
                        if (!matches(capContacts[c].email, null, undefined, ""))
                        {
                            logDebug("contact emails = " + capContacts[c].email);
                            allEmail += capContacts[c].email + ";"
                            logDebug("allEmail post contacts = " + allEmail);
                        }
                    }
                    //Sending Notification

                    var vEParams = aa.util.newHashtable();
                    var addrResult = getAddressInALine(capId);
                    addParameter(vEParams, "$$altID$$", iaCustom);
                    addParameter(vEParams, "$$address$$", addrResult);
                    addParameter(vEParams, "$$pin$$", pin);
                    addParameter(vEParams, "$$wwmAltID$$", altId);
                    addParameter(vEParams, "$$Parcel$$", parcelNumber);

                    sendNotification("", allEmail, "", "DEQ_IA_APPLICATION_NOTIFICATION", vEParams, null);
                    if (!matches(createByEmail, null, undefined, ""))
                    {
                        sendNotification("", createByEmail, "", "DEQ_IA_APPLICATION_NOTIFICATION", vEParams, null);
                    }
                    if (matches(getAppSpecific("O&M Contract Approved"), null, undefined, ""))
                    {
                        updateAppStatus("Documents Requested");

                    }
                }
            }
        }
    }
}

//General come here
if ((wfStatus == "No Inspection Needed") && (!matches(wfTask, "Field Consult Required", "Inspections")))
{
    otpReportFile = generateReportBatch(capId, "SHIP OK to Proceed", 'DEQ', otpReportParams)
    logDebug("This is the rFile: " + otpReportFile);

    if (otpReportFile)
    {
        var otpRFiles = new Array();
        var docList = getDocumentList();
        var docDates = [];
        var maxDate;
        var docPresent = false;
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
                docPresent = true;
            }
        }
        if (docPresent)
        {
            var docToSend = prepareDocumentForEmailAttachment(capId, "Preliminary Sketch", docFileName);

            logDebug("docToSend" + docToSend);
            docToSend = docToSend === null ? [] : [docToSend];
            if (!matches(docToSend, null, undefined, ""))
            {
                otpRFiles.push(docToSend);
            } otpRFiles.push(otpReportFile);
        }

        sendNotification("", lpAgentEmail, "", "DEQ_SHIP_14_DAY_OK_PROCEED", vEParams, otpRFiles);
    }
}




if (wfTask != "Grant Review" && (wfStatus == "Awaiting Client Reply" || wfStatus == "Plan Revision Required"))
{
    var altId = capId.getCustomID();
    var vEParams = aa.util.newHashtable();
    addParameter(vEParams, "$$altID$$", getAppSpecific("IA Number"));
    addParameter(vEParams, "$$wwmAltID$$", altId);
    addParameter(vEParams, "$$wfComment$$", wfComment);
    sendNotification("", lpAgentEmail, "", "DEQ_SHIP_ADDITIONAL_DOCUMENTS", vEParams, null);
}

if (wfStatus == "Full Permit Required")
{
    sendNotification("", lpAgentEmail, "", "DEQ_SHIP_FULL_PERMIT_REQUIRED", vEParams, null);
}

if (wfStatus == "Withdrawn")
{
    sendNotification("", lpAgentEmail, "", "DEQ_SHIP_WITHDRAWN", vEParams, null);
    deactivateAllActiveTasks(capId);
    updateAppStatus("Withdrawn");
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
function generateReportBatch(itemCap, reportName, module, parameters) {
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
        }
    }
    return true;
}
function copyLicensedProfByType(capIdFrom, capIdTo, typesArray) {
    var n = aa.licenseProfessional.getLicensedProfessionalsByCapID(capIdFrom).getOutput();
    var isByType = typesArray != null && typesArray.length > 0;
    if (n != null)
        for (x in n)
        {
            if (isByType && !arrayContainsValue(typesArray, n[x].getLicenseType()))
            {
                continue;
            }//isByType
            n[x].setCapID(capIdTo);
            aa.licenseProfessional.createLicensedProfessional(n[x]);
        }//for all LPs
    else
        logDebug("No licensed professional on source");
    return true;
}
function arrayContainsValue(ary, value) {
    if (ary != null)
    {
        //if not array, convert to array
        if (!Array.isArray(ary))
        {
            ary = [ary];
        }
        for (t in ary)
        {
            if (ary[t] == value)
            {
                return true;
            }
        }//for all types
    }
    return false;
}
function copyDocumentsToCapID(fromCapID, toCapID) {
    var opDocArray = aa.document.getDocumentListByEntity(fromCapID.toString(), "CAP").getOutput();
    var vDocArray = opDocArray.toArray();
    for (var vCounter in vDocArray)
    {
        var vDoc = vDocArray[vCounter];
        aa.document.createDocumentAssociation(vDoc, toCapID.toString(), "CAP");
    }
}
function makePIN(length) {
    var result = '';
    var characters = 'ABCDEFGHJKMNPQRTWXY2346789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++)
    {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
function editAppSpecificLOCAL(itemName, itemValue)  // optional: itemCap
{
    var itemCap = capId;
    var itemGroup = null;
    if (arguments.length == 3) itemCap = arguments[2]; // use cap ID specified in args

    if (useAppSpecificGroupName)
    {
        if (itemName.indexOf(".") < 0) {logDebug("**WARNING: (editAppSpecific) requires group name prefix when useAppSpecificGroupName is true"); return false}


        itemGroup = itemName.substr(0, itemName.indexOf("."));
        itemName = itemName.substr(itemName.indexOf(".") + 1);
    }
    // change 2/2/2018 - update using: aa.appSpecificInfo.editAppSpecInfoValue(asiField)
    // to avoid issue when updating a blank custom form via script. It was wiping out the field alias 
    // and replacing with the field name

    var asiFieldResult = aa.appSpecificInfo.getByList(itemCap, itemName);
    if (asiFieldResult.getSuccess())
    {
        var asiFieldArray = asiFieldResult.getOutput();
        if (asiFieldArray.length > 0)
        {
            var asiField = asiFieldArray[0];
            if (asiField)
            {
                var origAsiValue = asiField.getChecklistComment();
                asiField.setChecklistComment(itemValue);

                var updateFieldResult = aa.appSpecificInfo.editAppSpecInfoValue(asiField);
                if (updateFieldResult.getSuccess())
                {
                    logDebug("Successfully updated custom field on record: " + itemCap.getCustomID() + " on " + itemName + " with value: " + itemValue);
                    if (arguments.length < 3) //If no capId passed update the ASI Array
                        AInfo[itemName] = itemValue;
                }
                else {logDebug("WARNING: (editAppSpecific) " + itemName + " was not updated.");}
            }
            else {logDebug("WARNING: (editAppSpecific) " + itemName + " was not updated.");}
        }
    }
    else
    {
        logDebug("ERROR: (editAppSpecific)" + asiFieldResult.getErrorMessage());
    }
}

function GetLastInspComment(capId) {
    inspectionResult = aa.inspection.getInspections(capId);
    if (inspectionResult.getSuccess())
    {
        var lastInsp = inspectionResult.getOutput().pop();
        aa.print(lastInsp.getInspection().getResultComment() + "Our Result Comment");
    }
    return lastInsp.getInspection().getResultComment();
}


function GetLastInspDate(capId) {
    inspectionResult = aa.inspection.getInspections(capId);
    if (inspectionResult.getSuccess())
    {
        var lastInsp = inspectionResult.getOutput().pop();
        var LastDate = lastInsp.getInspectionDate().getMonth() + "/" + lastInsp.getInspectionDate().getDayOfMonth() + "/" + lastInsp.getInspectionDate().getYear();
    }
    return LastDate;
}

