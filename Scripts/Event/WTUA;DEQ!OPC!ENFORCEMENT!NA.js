//WTUA:DEQ/OPC/ENFORCEMENT/NA

if (currentUserID == "RLITTLEFIELD")
{
    showDebug = true;
}

var emailParams = aa.util.newHashtable();
var reportParams = aa.util.newHashtable();
var parentCapId = getParent(capId);
var conArrayParent = getContactArray(parentCapId);
var conEmailList = "";
var conEmailListAll = "";
var appName = cap.getSpecialText();
var fileRefNum = AInfo["File Reference Number/Facility ID"];
addParameter(emailParams, "$$fileRefNum$$", fileRefNum);
addParameter(emailParams, "$$altID$$", capId.getCustomID());
addParameter(emailParams, "$$facilityName$$", appName);
var addrResult = getAddressInALine(capId);
addParameter(emailParams, "$$addressInALine$$", addrResult);
var dateThirtyDaysOut = dateAdd(new Date(), 30);
var dateSixtyDaysOut = dateAdd(new Date(), 60);
logDebug("date sixty days out is: " + dateSixtyDaysOut);
var hearingDate = AInfo["Hearing Date"];
var hearingTime = AInfo["Hearing Time"];
var todayDate = new Date();
var todayDateConverted = dateFormatted(todayDate.getMonth() + 1, todayDate.getDate(), todayDate.getYear() + 1901, "MM/DD/YYYY");
var fineAmount = AInfo["Fine Amount"];
var revisedFineAmount = AInfo["Revised Fine Amount"];
var enfReqRevDue;

//getting contacts by type, and then all
for (con in conArrayParent)
{
    if (matches(conArrayParent[con]["contactType"], "Property Owner", "Tank Owner", "Operator"))
    {
        if (!matches(conArrayParent[con].email, null, undefined, ""))
        {
            logDebug("Contact email: " + conArrayParent[con].email);
            conEmailList += conArrayParent[con].email + "; ";
        }
    }
    if (!matches(conArrayParent[con].email, null, undefined, ""))
    {
        logDebug("Contact email: " + conArrayParent[con].email);
        conEmailListAll += conArrayParent[con].email + "; ";
    }
}

//grabbing the due date of the Enforcement Request Review task in the current workflow, for use in multiple other task/statuses
var workflowResult = aa.workflow.getTasks(capId);
var wfObj = workflowResult.getOutput();

for (i in wfObj)
{
    var fTask = wfObj[i];
    if (fTask.getTaskDescription() == "Enforcement Request Review")
    {
        if (fTask.getDueDate() != null)
        {
            enfReqRevDue = fTask.getDueDate();
            enfReqRevDue = enfReqRevDue.getMonth() + "/" + enfReqRevDue.getDayOfMonth() + "/" + enfReqRevDue.getYear();
            logDebug("enforcement request review date is: " + enfReqRevDue);
        }
    }
}

//Violation Review
if (wfTask == "Violation Review") 
{
    if (wfStatus == "Request Inspection")
    {

        addParameter(emailParams, "$$inspDueDate$$", dateSixtyDaysOut);
        updateTaskDueDate("Violation Review", dateSixtyDaysOut);
        sendNotification("", "Michael.Seaman@suffolkcountyny.gov", "", "DEQ_OPC_ENF_INSP_REQ", emailParams, null);
        sendNotification("", "ryan.littlefield@scubeenterprise.com", "", "DEQ_OPC_ENF_INSP_REQ", emailParams, null);
    }
    if (wfStatus == "NOV Letter Sent")
    {
        //preparing inspection report either from the tank or site (whichever copied to this record) for sending along with the notification here
        var otpRFiles = new Array();
        var docList = getDocumentList();
        var docDates = [];
        var maxDate;

        for (doc in docList)
        {
            if (matches(docList[doc].getDocCategory(), "Inspection Report"))
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
        var docToSend = prepareDocumentForEmailAttachment(capId, "Inspection Report", docFileName);

        logDebug("docToSend" + docToSend);
        docToSend = docToSend === null ? [] : [docToSend];
        otpRFiles.push(docToSend);

        //gathering inspection date information to push into the parameter in the email
        var inspDates = [];
        var aTwelveSite = loadASITable("ARTICLE 12 TANK VIOLATIONS", capId);
        if (aTwelveSite)
        {
            if (aTwelveSite.length >= 1)
            {
                for (ats in aTwelveSite)
                {
                    if (!matches(aTwelveSite[ats]["Inspection Date"], "", null, " "))
                    {
                        inspDates.push(new Date(aTwelveSite[ats]["Inspection Date"]));
                    }
                }
            }
        }
        logDebug("inspdates is: " + inspDates);
        var maxDate = Math.max.apply(null, inspDates);
        logDebug("maxdate 1 is: " + maxDate);
        maxDate = new Date(maxDate);
        logDebug("maxdate 2 is: " + maxDate);
        maxDate = (maxDate.getMonth() + 1) + "/" + maxDate.getDate() + "/" + maxDate.getFullYear()
        logDebug("maxdate final is: " + maxDate);

        addParameter(emailParams, "$$violationDueDate$$", dateSixtyDaysOut);
        addParameter(emailParams, "$$inspDate$$", maxDate);
        sendNotification("", conEmailList, "", "DEQ_OPC_ENF_NOV_LETTER", emailParams, otpRFiles);
        updateTaskDueDate("Violation Review", dateThirtyDaysOut);
    }
}

//Enforcement Request Review
if (wfTask == "Enforcement Request Review")
{
    if (wfStatus == "Request Inspection")
    {
        addParameter(emailParams, "$$inspDueDate$$", dateSixtyDaysOut);
        sendNotification("", "Michael.Seaman@suffolkcountyny.gov", "", "DEQ_OPC_ENF_INSP_REQ", emailParams, null);
        sendNotification("", "ryan.littlefield@scubeenterprise.com", "", "DEQ_OPC_ENF_INSP_REQ", emailParams, null);

    }
    if (wfStatus == "NOPH Sent")
    {
        //need to confirm that this report information is correct, below:

        var enfType = getAppSpecific("Enforcement Type", capId);
        var reportToSend = "";
        switch (String(enfType))
        {
            //OP
            case "OP":
                reportToSend = "";
            case "TT":
                reportToSend = "";
            case "SP":
                reportToSend = "OPC Swimming Pool NOPH";
            case "EE":
                reportToSend = "OPC EE NOPH";
            case "IW":
                reportToSend = "";
            case "BB":
                reportToSend = "";
            case "T8":
                reportToSend = "";
            case "WL":
                reportToSend = "OPC Warning Letter";
            case "LL":
                reportToSend = "";
        }
        addParameter(reportParams, "$$RecordID$$", capId.getCustomID());

        generateReportBatch(capId, reportToSend, 'DEQ', reportParams);

        //set task due date to the date found in the TSI Hearing Date on the Preliminary Hearing task
        addStdConditionStrict("DEQ", "Notice of Hearing", capId);
        addStdConditionStrict("DEQ", "Notice of Hearing", parentCapId);

    }
    if (wfStatus == "NOFH Sent")
    {
        //set task due date to the date found in the TSI Hearing Date on the Formal Hearing task
        addStdConditionStrict("DEQ", "Notice of Hearing", capId);
        addStdConditionStrict("DEQ", "Notice of Hearing", parentCapId);

    }
    if (wfStatus == "Warning Letter Sent")
    {
        //need to confirm that this report information is correct, below:
        generateReportBatch(capId, "OPC Warning Letter", 'DEQ', reportParams);
    }
    //check current record to see if the current mask reflects the current value in the Enforcement Type ASI. If not, update the mask to reflect the current value.
    var enfType = AInfo["Enforcement Type"];
    logDebug("enftype is: " + enfType);
    var altIdString = String(capId.getCustomID());
    var altIdLastTwo = capId.getCustomID().slice(-2);
    logDebug("last two of alt id is " + altIdLastTwo);
    if (altIdLastTwo != enfType)
    {
        //ENF-22-00002-EE
        if (altIdString.charAt(-3) == "-")
        {
            //change last two digits of mask
            altIdString = altIdString.replace(altIdLastTwo, enfType)
            logDebug("Updating Alt ID to: " + altIdString);
            updateAltID(altIdString, capId);
        }
        else
        //ENF-22-00002
        {
            //add last two digits to existing altid
            var altSplit = capId.getCustomID().split("-");
            altIdString = altSplit[0] + "-" + altSplit[1] + "-" + altSplit[2] + "-" + enfType;
            logDebug("Updating Alt ID to: " + altIdString);
            updateAltID(altIdString, capId);
        }

    }
}

//Preliminary Hearing
if (wfTask == "Preliminary Hearing")
{
    if (wfStatus == "Request Inspection")
    {
        addParameter(emailParams, "$$inspDueDate$$", dateSixtyDaysOut);
        sendNotification("", "Michael.Seaman@suffolkcountyny.gov", "", "DEQ_OPC_ENF_INSP_REQ", emailParams, null);
        sendNotification("", "ryan.littlefield@scubeenterprise.com", "", "DEQ_OPC_ENF_INSP_REQ", emailParams, null);

    }
    if (wfStatus == "Adjourned")
    {
        var prelimHearingUserId = getUserIDAssignedToTask(capId, "Preliminary Hearing")
        var userToSend = aa.person.getUser(prelimHearingUserId).getOutput();
        if (userToSend != null)
        {
            var prelimHearingUserName = userToSend.getFirstName() + " " + userToSend.getLastName();
            var prelimHearingUserPhone = userToSend.getPhoneNumber();
            var prelimHearingUserEmail = userToSend.getEmail();

            addParameter(emailParams, "$$assignUser$$", prelimHearingUserName);
            addParameter(emailParams, "$$userPhoneNum$$", prelimHearingUserPhone);
            addParameter(emailParams, "$$userEmail$$", prelimHearingUserEmail);
        }
        addParameter(emailParams, "$$hearingDate$$", hearingDate);
        addParameter(emailParams, "$$hearingTime$$", hearingTime);

        sendNotification("", conEmailList, "", "DEQ_OPC_ENF_PRELIM_HEARING_ADJ", emailParams, null);

        //set task due date to the date found in the TSI Hearing Date on this task
        if (workflowResult.getSuccess())
        {
            var workflowResultTsi = aa.workflow.getTask(capId, wfTask);
            var taskObj = workflowResultTsi.getOutput();
            var tsiResult = aa.taskSpecificInfo.getTaskSpecificInfoByTask(capId, taskObj.getProcessID(), taskObj.getStepNumber());

            if (tsiResult.getSuccess())
            {
                var tsiOut = tsiResult.getOutput();
                var hearingDateTsi = "";
                for (t in tsiOut)
                {
                    var tsiInfoModel = tsiOut[t].getTaskSpecificInfoModel();
                    if (tsiOut[t].getCheckboxDesc() == "Preliminary Hearing Date")
                    {
                        if (!matches(tsiOut[t].getChecklistComment(), null, undefined, ""))
                        {
                            hearingDateTsi = tsiOut[t].getChecklistComment().toUpperCase();
                        }
                    }
                }
            }
        }
        updateTaskDueDate("Preliminary Hearing", hearingDateTsi);
    }
    if (wfStatus == "Revised Waiver")
    {

        var prelimHearingUserId = getUserIDAssignedToTask(capId, "Preliminary Hearing")
        var userToSend = aa.person.getUser(prelimHearingUserId).getOutput();
        if (userToSend != null)
        {
            var prelimHearingUserName = userToSend.getFirstName() + " " + userToSend.getLastName();
            var prelimHearingUserPhone = userToSend.getPhoneNumber();
            var prelimHearingUserEmail = userToSend.getEmail();

            addParameter(emailParams, "$$assignUser$$", prelimHearingUserName);
            addParameter(emailParams, "$$userPhoneNum$$", prelimHearingUserPhone);
            addParameter(emailParams, "$$userEmail$$", prelimHearingUserEmail);
        }
        addParameter(emailParams, "$$dateSent$$", todayDateConverted);
        addParameter(emailParams, "$$fineAmount$$", fineAmount);
        addParameter(emailParams, "$$revisedFineAmount$$", revisedFineAmount);
        addParameter(emailParams, "$$feeDueDate$$", enfReqRevDue);


        sendNotification("", conEmailListAll, "", "DEQ_OPC_ENF_REV_WAIVER", emailParams, null);
    }
}

//Formal Hearing
if (wfTask == "Formal Hearing")
{
    if (wfStatus == "Request Inspection")
    {
        addParameter(emailParams, "$$inspDueDate$$", dateSixtyDaysOut);
        sendNotification("", "Michael.Seaman@suffolkcountyny.gov", "", "DEQ_OPC_ENF_INSP_REQ", emailParams, null);
        sendNotification("", "ryan.littlefield@scubeenterprise.com", "", "DEQ_OPC_ENF_INSP_REQ", emailParams, null);

    }
    if (wfStatus == "Adjourned")
    {
        var formalHearingUserId = getUserIDAssignedToTask(capId, "Formal Hearing")
        var userToSend = aa.person.getUser(formalHearingUserId).getOutput();
        if (userToSend != null)
        {
            var formalHearingUserName = userToSend.getFirstName() + " " + userToSend.getLastName();
            var formalHearingUserPhone = userToSend.getPhoneNumber();
            var formalHearingUserEmail = userToSend.getEmail();

            addParameter(emailParams, "$$assignUser$$", formalHearingUserName);
            addParameter(emailParams, "$$userPhoneNum$$", formalHearingUserPhone);
            addParameter(emailParams, "$$userEmail$$", formalHearingUserEmail);
        }
        addParameter(emailParams, "$$hearingDate$$", hearingDate);
        addParameter(emailParams, "$$hearingTime$$", hearingTime);

        sendNotification("", conEmailList, "", "DEQ_OPC_ENF_FORMAL_HEARING_ADJ", emailParams, null);
        //set task due date to the date found in the TSI Hearing Date on this task
    }
    if (wfStatus == "Revised Waiver")
    {
        var formalHearingUserId = getUserIDAssignedToTask(capId, "Formal Hearing")
        logDebug("formal hearing user id is: " + formalHearingUserId);
        var userToSend = aa.person.getUser(formalHearingUserId).getOutput();
        if (userToSend != null)
        {
            var formalHearingUserName = userToSend.getFirstName() + " " + userToSend.getLastName();
            var formalHearingUserPhone = userToSend.getPhoneNumber();
            var formalHearingUserEmail = userToSend.getEmail();

            addParameter(emailParams, "$$assignUser$$", formalHearingUserName);
            addParameter(emailParams, "$$userPhoneNum$$", formalHearingUserPhone);
            addParameter(emailParams, "$$userEmail$$", formalHearingUserEmail);
        }
        addParameter(emailParams, "$$dateSent$$", todayDateConverted);
        addParameter(emailParams, "$$fineAmount$$", fineAmount);
        addParameter(emailParams, "$$feeDueDate$$", enfReqRevDue);
        addParameter(emailParams, "$$revisedFineAmount$$", revisedFineAmount);


        sendNotification("", conEmailListAll, "", "DEQ_OPC_ENF_REV_WAIVER", emailParams, null);
    }
}

//Commissioner's Order
if (wfTask == "Commissioner's Order")
{
    if (wfStatus == "Request Inspection")
    {
        addParameter(emailParams, "$$inspDueDate$$", dateSixtyDaysOut);
        sendNotification("", "Michael.Seaman@suffolkcountyny.gov", "", "DEQ_OPC_ENF_INSP_REQ", emailParams, null);
        sendNotification("", "ryan.littlefield@scubeenterprise.com", "", "DEQ_OPC_ENF_INSP_REQ", emailParams, null);

    }
}

//Collection
if (wfTask == "Collection")
{
    if (wfStatus == "Request Inspection")
    {
        addParameter(emailParams, "$$inspDueDate$$", dateSixtyDaysOut);
        sendNotification("", "Michael.Seaman@suffolkcountyny.gov", "", "DEQ_OPC_ENF_INSP_REQ", emailParams, null);
        sendNotification("", "ryan.littlefield@scubeenterprise.com", "", "DEQ_OPC_ENF_INSP_REQ", emailParams, null);

    }
}

//Inspection Request
if (wfTask == "Request Inspection")
{
    if (wfStatus == "Inspection Review")
    {
        //recipient needs to be the user assigned to the Enforcement Request Review task
        var eRRUserId = getUserIDAssignedToTask(capId, "Enforcement Request Review")
        var userToSend = aa.person.getUser(eRRUserId).getOutput();
        if (userToSend != null)
        {
            var eRRUserEmail = userToSend.getEmail();
        }

        sendNotification("", eRRUserEmail, "", "DEQ_OPC_ENF_INSP_REQ_COMPLETE", emailParams, null);
    }
}
if (wfStatus == "Case Closed")
{
    var ccUserId = getUserIDAssignedToTask(capId, wfTask)
    var userToSend = aa.person.getUser(ccUserId).getOutput();
    if (userToSend != null)
    {
        var ccHearingUserName = userToSend.getFirstName() + " " + userToSend.getLastName();
        var ccHearingUserPhone = userToSend.getPhoneNumber();
        var ccHearingUserEmail = userToSend.getEmail();

        addParameter(emailParams, "$$assignUser$$", ccHearingUserName);
        addParameter(emailParams, "$$userPhoneNum$$", ccHearingUserPhone);
        addParameter(emailParams, "$$userEmail$$", ccHearingUserEmail);
    }

    sendNotification("", conEmailListAll, "", "DEQ_OPC_ENF_CASE_CLOSED", emailParams, null);
}

function updateTaskDueDate(taskName, dueDate) {
    var workflowResult = aa.workflow.getTasks(capId);
    if (workflowResult.getSuccess())
    {
        var wfObj = workflowResult.getOutput();
        for (i in wfObj)
        {
            if (wfObj[i].getTaskDescription() == taskName)
            {
                wfObj[i].setDueDate(aa.date.parseDate(dueDate));
                var tResult = aa.workflow.adjustTaskWithNoAudit(wfObj[i].getTaskItem());
                if (tResult.getSuccess())
                {
                    logDebug("Set Workflow task: " + taskName + " due date to " + dueDate);
                }
                else
                {
                    logDebug("**ERROR: Failed to update comment on workflow task: " + tResult.getErrorMessage());
                    return false;
                }
            }
        }
    }
}
function updateAltID(newId) {
    var itemCap = capId;
    if (arguments.length > 1 && arguments[1])
        itemCap = arguments[1];

    var result = aa.cap.updateCapAltID(itemCap, newId);
    if (result.getSuccess())
        logDebug("Successfully updated alt Id to: " + newId);
    else
        logDebug("Problem updating alt Id: " + result.getErrorMessage());
}

function getAddressInALine() {

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
function getUserIDAssignedToTask(vCapId, taskName) {
    currentUsrVar = null;
    var taskResult1 = aa.workflow.getTask(vCapId, taskName);
    if (taskResult1.getSuccess())
    {
        tTask = taskResult1.getOutput();
    } else
    {
        logMessage("**ERROR: Failed to get workflow task object ");
        return false;
    }
    taskItem = tTask.getTaskItem();
    taskUserObj = tTask.getTaskItem().getAssignedUser();
    taskUserObjLname = taskUserObj.getLastName();
    taskUserObjFname = taskUserObj.getFirstName();
    taskUserObjMname = taskUserObj.getMiddleName();
    currentUsrVar = aa.person.getUser(taskUserObjFname, taskUserObjMname, taskUserObjLname).getOutput();
    if (currentUsrVar != null)
    {
        currentUserIDVar = currentUsrVar.getGaUserID();
        return currentUserIDVar;
    } else
    {
        return false;
    }
}
function addStdConditionStrict(cType, cDesc) {
    var itemCap = capId;
    if (arguments.length == 3)
    {
        itemCap = arguments[2]; // use cap ID specified in args
    }
    if (!aa.capCondition.getStandardConditions)
    {
        logDebug("addStdConditionStrict function is not available in this version of Accela Automation.");
    } else
    {
        standardConditions = aa.capCondition.getStandardConditions(cType, cDesc).getOutput();
        for (i = 0; i < standardConditions.length; i++)
        {
            // Activate strict match
            if (standardConditions[i].getConditionType().toUpperCase() == cType.toUpperCase() && standardConditions[i].getConditionDesc().toUpperCase() == cDesc.toUpperCase())
            {
                standardCondition = standardConditions[i];
                var addCapCondResult = aa.capCondition.addCapCondition(itemCap, standardCondition.getConditionType(), standardCondition.getConditionDesc(), standardCondition.getConditionComment(), sysDate, null, sysDate, null, null, standardCondition.getImpactCode(), systemUserObj, systemUserObj, "Applied", currentUserID, "A", null, standardCondition.getDisplayConditionNotice(), standardCondition.getIncludeInConditionName(), standardCondition.getIncludeInShortDescription(), standardCondition.getInheritable(), standardCondition.getLongDescripton(), standardCondition.getPublicDisplayMessage(), standardCondition.getResolutionAction(), null, null, standardCondition.getConditionNbr(), standardCondition.getConditionGroup(), standardCondition.getDisplayNoticeOnACA(), standardCondition.getDisplayNoticeOnACAFee(), standardCondition.getPriority(), standardCondition.getConditionOfApproval());

                if (addCapCondResult.getSuccess())
                {
                    logDebug("Successfully added condition (" + standardCondition.getConditionDesc() + ")");
                } else
                {
                    logDebug("**ERROR: adding condition (" + standardCondition.getConditionDesc() + "): " + addCapCondResult.getErrorMessage());
                }
            }
        }
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