//WTUA:DEQ/OPC/ENFORCEMENT/NA


//showDebug = true;


var emailParams = aa.util.newHashtable();
var reportParams = aa.util.newHashMap();
var parentCapId = getParent(capId);
logDebug("This is our Parent CapID : " + parentCapId);
var conEmailList = "";
var conEmailListAll = "";
var appName = cap.getSpecialText();
var fileRefNum = AInfo["File Reference Number/Facility ID"];
addParameter(emailParams, "$$fileRefNum$$", fileRefNum);
addParameter(emailParams, "$$altID$$", capId.getCustomID());
addParameter(emailParams, "$$facilityName$$", appName);
var addrResult = getAddressInALineCustom(capId);
addParameter(emailParams, "$$addressInALine$$", addrResult);
var dateThirtyDaysOut = dateAdd(new Date(), 30);
var dateSixtyDaysOut = dateAdd(new Date(), 60);
logDebug("date sixty days out is: " + dateSixtyDaysOut);
var hearingDate = AInfo["Hearing Date"];
if (!matches(hearingDate, null, "", undefined))
{
    var hearingDateLessSeven = (convertDate(hearingDate).getMonth() + 1) + "/" + (convertDate(hearingDate).getDate()) + "/" + (convertDate(hearingDate).getYear() + 1900);
    hearingDateLessSeven = dateAdd(hearingDateLessSeven, -7);
    logDebug("hearingdatelessseven is: " + hearingDateLessSeven);
}
var hearingTime = AInfo["Hearing Time"];
var todayDate = new Date();
var todayDateConverted = dateFormatted(todayDate.getMonth() + 1, todayDate.getDate(), todayDate.getYear() + 1900, "MM/DD/YYYY");
var fineAmount = AInfo["Fine Amount"];
var revisedFineAmount = AInfo["Revised Fine Amount"];
var enfReqRevDue;
var formHearingDue;
var prelimHearingDue;


if (parentCapId)
{ //We are preventing an error if we don't find a Parent ID if we do then we add the contacts 
    //getting contacts by type, and then all
    var conArrayParent = getContactArray(parentCapId);
    var enfType = getAppSpecific("Enforcement Type", capId);

    for (con in conArrayParent)
    {
        if (conArrayParent[con].peopleModel.getAuditStatus() == "A")
        {
            if (enfType == "SP")
            {
                if (matches(conArrayParent[con]["contactType"], "Pool Owner", "Pool Operator", "Property Owner"))
                {
                    if (!matches(conArrayParent[con].email, null, undefined, ""))
                    {
                        logDebug("Additional contact email: " + conArrayParent[con].email);
                        conEmailList += conArrayParent[con].email + "; ";
                    }
                }
            }
            else
            {
                if (matches(conArrayParent[con]["contactType"], "Property Owner", "Tank Owner", "Operator"))
                {
                    if (!matches(conArrayParent[con].email, null, undefined, ""))
                    {
                        logDebug("Contact email: " + conArrayParent[con].email);
                        conEmailList += conArrayParent[con].email + "; ";
                    }
                }
            }
            if (!matches(conArrayParent[con].email, null, undefined, ""))
            {
                logDebug("Contact email: " + conArrayParent[con].email);
                conEmailListAll += conArrayParent[con].email + "; ";
            }

        }
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
    if (fTask.getTaskDescription() == "Preliminary Hearing")
    {
        if (fTask.getDueDate() != null)
        {
            prelimHearingDue = fTask.getDueDate();
            prelimHearingDue = prelimHearingDue.getMonth() + "/" + prelimHearingDue.getDayOfMonth() + "/" + prelimHearingDue.getYear();
            logDebug("prelim hearing due date is: " + prelimHearingDue);
        }
    }
    if (fTask.getTaskDescription() == "Formal Hearing")
    {
        if (fTask.getDueDate() != null)
        {
            formHearingDue = fTask.getDueDate();
            formHearingDue = formHearingDue.getMonth() + "/" + formHearingDue.getDayOfMonth() + "/" + formHearingDue.getYear();
            logDebug("formal hearing due date is: " + formHearingDue);
        }
    }
}

//Violation Review
if (wfTask == "Violation Review") 
{
    if (wfStatus == "Request Inspection")
    {
        //
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

    if (wfStatus == "Request Inspection")
    {
        addParameter(emailParams, "$$inspDueDate$$", dateSixtyDaysOut);
        sendNotification("", "Michael.Seaman@suffolkcountyny.gov", "", "DEQ_OPC_ENF_INSP_REQ", emailParams, null);
        sendNotification("", "ryan.littlefield@scubeenterprise.com", "", "DEQ_OPC_ENF_INSP_REQ", emailParams, null);
        activateTask("Request Inspection");
        deactivateTask("Enforcement Request Review");
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
                reportToSend = "OPC OP NOPH";
                break;
            case "TT":
                reportToSend = "OPC TT NOPH";
                break;
            case "SP":
                reportToSend = "OPC Swimming Pool NOPH";
                break;
            case "EE":
                reportToSend = "OPC EE NOPH";
                break;
            case "T8":
                reportToSend = "OPC T8 NOPH";
                break;
            case "WL":
                reportToSend = "OPC Warning Letter";
                break;
        }
        reportParams.put("RecordID", capId.getCustomID());
        if (reportToSend != "")
        {
            generateReportBatch(capId, reportToSend, 'DEQ', reportParams);
        }
        /*
        not sure why this code is here, as the above code should do the same thing
        
        if (String(enfType) == "TT")
        {
            var rFile = new Array();
            rFile = reportRunSaveCustom(reportToSend, false, true, true, 'DEQ', reportParams);
        }
        if (String(enfType) == "OP")
        {
            var rFile = new Array();
            rFile = reportRunSaveCustom(reportToSend, false, true, true, 'DEQ', reportParams);
        }*/

        //set task due date to the date found in the TSI Hearing Date on the Preliminary Hearing task
        //addStdConditionStrict("DEQ", "Notice of Hearing", capId);
        if (!matches(parentCapId, "", null, undefined))
        {
            addStdConditionStrict("DEQ", "Open Enforcement Record", parentCapId);
            //Gets siblings by looking at the parent
            addConditionSiblings(parentCapId)
        }

    }
    if (wfStatus == "NOFH Sent")
    {
        //set task due date to the date found in the TSI Hearing Date on the Formal Hearing task
        //addStdConditionStrict("DEQ", "Notice of Hearing", capId);
        addStdConditionStrict("DEQ", "Open Enforcement Record", parentCapId);
        //Gets siblings by looking at the parent
        addConditionSiblings(parentCapId);
    }
    if (wfStatus == "Warning Letter Sent")
    {
        //need to confirm that this report information is correct, below:
        generateReportBatch(capId, "OPC Warning Letter", 'DEQ', reportParams);
        //set task due date to the date found in the TSI Hearing Date on the Formal Hearing task
        //addStdConditionStrict("DEQ", "Notice of Hearing", capId);
        //Gets siblings by looking at the parent 
        //Also gets the record you are on so I commented out the o
        addConditionSiblings(parentCapId);
        addStdConditionStrict("DEQ", "Open Enforcement Record", parentCapId);
    }
}

//Preliminary Hearing
if (wfTask == "Preliminary Hearing")
{
    if (wfStatus == "Request Inspection")
    {
        addParameter(emailParams, "$$inspDueDate$$", dateSixtyDaysOut);
        sendNotification("", "Michael.Seaman@suffolkcountyny.gov", "", "DEQ_OPC_ENF_INSP_REQ", emailParams, null);
        //sendNotification("", "ryan.littlefield@scubeenterprise.com", "", "DEQ_OPC_ENF_INSP_REQ", emailParams, null);

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

            //adding a couple more contacts from the parent, for SP enforcement types
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
        addParameter(emailParams, "$$revFineAmount$$", revisedFineAmount);
        addParameter(emailParams, "$$feeDueDate$$", prelimHearingDue);
        //addParameter(reportParams, "$$RecordID$$", capId.getCustomID());
        reportParams.put("RecordID", capId.getCustomID().toString());
        logDebug(reportParams);
        var reportToUse = generateReportP("OPC Waiver Report", reportParams, 'DEQ');

        if (reportToUse)
        {
            var sendThisReport = new Array();
            sendThisReport.push(reportToUse);
        }


        if (conEmailList == '')
        {
            aa.print("We found no contacts on the parent record");
            var systemEmail = systemUserObj.getEmail();
            aa.print(systemEmail);

            sendNotification("", systemEmail, "", "DEQ_OPC_ENF_REV_WAIVER", emailParams, sendThisReport);
        }
        else
        {
            aa.print("We found a user on the parent sending email");
            aa.print(conEmailList);
            sendNotification("", conEmailList, "", "DEQ_OPC_ENF_REV_WAIVER", emailParams, sendThisReport);
        }


    }
}

//Formal Hearing
if (wfTask == "Formal Hearing")
{
    if (wfStatus == "Request Inspection")
    {
        addParameter(emailParams, "$$inspDueDate$$", dateSixtyDaysOut);
        sendNotification("", "Michael.Seaman@suffolkcountyny.gov", "", "DEQ_OPC_ENF_INSP_REQ", emailParams, null);
        //sendNotification("", "ryan.littlefield@scubeenterprise.com", "", "DEQ_OPC_ENF_INSP_REQ", emailParams, null);

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
        addParameter(emailParams, "$$hearingDateLessSeven$$", hearingDateLessSeven);
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
        addParameter(emailParams, "$$feeDueDate$$", formHearingDue);
        addParameter(emailParams, "$$revFineAmount$$", revisedFineAmount);
        reportParams.put("RecordID", capId.getCustomID().toString());
        var reportToUse = generateReportP("OPC Waiver Report", reportParams, 'DEQ');

        if (reportToUse)
        {
            var sendThisReport = new Array();
            sendThisReport.push(reportToUse);
        }


        sendNotification("", conEmailList, "", "DEQ_OPC_ENF_REV_WAIVER", emailParams, sendThisReport);
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

    sendNotification("", conEmailList, "", "DEQ_OPC_ENF_CASE_CLOSED", emailParams, null);
}



if (wfTask == "End Enforcement Action" && wfStatus == "Close")
{
    removeAllCapConditions(capId);
    removeAllCapConditions(parentCapId);
    //Gets siblings by looking at the parent
    removeConditionsSiblings(parentCapId);
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

function getAddressInALineCustom() {

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
                strAddress = "";
                var addPart = addressToUse.getHouseNumberStart();
                if (addPart && addPart != "" && addPart != null)
                    strAddress += addPart;
                var addPart = addressToUse.getStreetDirection();
                if (addPart && addPart != "" && addPart != null)
                    strAddress += " " + addPart;
                var addPart = addressToUse.getStreetName();
                if (addPart && addPart != "" && addPart != null)
                    strAddress += " " + addPart;
                if (matches(addressToUse.getStreetSuffix(), null, ""))
                {
                    strAddress += ",";
                }
                var addPart = addressToUse.getStreetSuffix();
                if (addPart && addPart != "" && addPart != null)
                    strAddress += " " + addPart + ",";
                var addPart = addressToUse.getCity();
                if (addPart && addPart != "" && addPart != null)
                    strAddress += " " + addPart + ",";
                var addPart = addressToUse.getState();
                if (addPart && addPart != "" && addPart != null)
                    strAddress += " " + addPart;
                var addPart = addressToUse.getZip();
                if (addPart && addPart != "" && addPart != null)
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
    aa.print("arguments.length:" + arguments.length);
    if (arguments.length == 3)
    {
        itemCap = arguments[2]; // use cap ID specified in args
    }
    if (!aa.capCondition.getStandardConditions)
    {
        aa.print("addStdConditionStrict function is not available in this version of Accela Automation.");
    } else
    {
        standardConditions = aa.capCondition.getStandardConditions(cType, cDesc).getOutput();
        aa.print("standardConditions.length:" + standardConditions.length);
        for (i = 0; i < standardConditions.length; i++)
        {
            // Activate strict match
            if (standardConditions[i].getConditionType().toUpperCase() == cType.toUpperCase() && standardConditions[i].getConditionDesc().toUpperCase() == cDesc.toUpperCase())
            {
                standardCondition = standardConditions[i];
                var addCapCondResult = aa.capCondition.addCapCondition(itemCap, standardCondition.getConditionType(), standardCondition.getConditionDesc(), "OPC staff, see open enforcement record", sysDate, null, sysDate, null, null, standardCondition.getImpactCode(), systemUserObj, systemUserObj, "Applied", currentUserID, "A", null, "Y", standardCondition.getIncludeInConditionName(), standardCondition.getIncludeInShortDescription(), standardCondition.getInheritable(), standardCondition.getLongDescripton(), standardCondition.getPublicDisplayMessage(), standardCondition.getResolutionAction(), null, null, standardCondition.getConditionNbr(), standardCondition.getConditionGroup(), standardCondition.getDisplayNoticeOnACA(), standardCondition.getDisplayNoticeOnACAFee(), standardCondition.getPriority(), standardCondition.getConditionOfApproval());

                if (addCapCondResult.getSuccess())
                {
                    aa.print("Successfully added condition (" + standardCondition.getConditionDesc() + ")");
                    aa.print("Adding a condition to " + capId);
                } else
                {
                    aa.print("**ERROR: adding condition (" + standardCondition.getConditionDesc() + "): " + addCapCondResult.getErrorMessage());
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



function generateReportBatch(itemCap, reportName, module, parameters) {
    //returns the report file which can be attached to an email.
    var user = currentUserID; // Setting the User Name
    var report = aa.reportManager.getReportInfoModelByName(reportName);
    logDebug("This is the Report Parameter " + parameters);
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
    aa.print("This is the permission on the report" + permit);
    logDebug("This is the permission on the report" + permit);
    if (permit.getOutput().booleanValue())
    {
        var reportResult = aa.reportManager.getReportResult(report);
        logDebug("Report Result" + reportResult.getSuccess());
        if (reportResult.getSuccess())
        {
            reportOutput = reportResult.getOutput();
            logDebug("This is the Report Output in the next part" + reportOutput);
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
function addConditionSiblings(ParentCap) {
    var childRecords = getChildren("DEQ/OPC/*/*", ParentCap);
    for (child in childRecords)
    {
        aa.print("Adding conditions to " + childRecords[child]);
        addStdConditionStrict("DEQ", "Open Enforcement Record", childRecords[child]);
    }

}
function removeConditionsSiblings(ParentCap) {
    var childRecords = getChildren("DEQ/OPC/*/*", ParentCap);
    for (child in childRecords)
    {
        aa.print("Removing conditions to " + childRecords[child]);
        removeAllCapConditions(childRecords[child])
    }


}

function removeAllCapConditions(itemCap) {
    var capCondResult = aa.capCondition.getCapConditions(itemCap);

    if (!capCondResult.getSuccess())
    {logDebug("**WARNING: error getting cap conditions : " + capCondResult.getErrorMessage()); return false}

    var ccs = capCondResult.getOutput();
    for (pc1 in ccs)
    {
        var rmCapCondResult = aa.capCondition.deleteCapCondition(itemCap, ccs[pc1].getConditionNumber());
        if (rmCapCondResult.getSuccess())
            logDebug("Successfully removed condition to CAP : " + itemCap + ". Condition Description:" + ccs[pc1].getConditionDescription());
    }

}
function generateReportP(aaReportName, parameters, rModule) {
    var reportName = aaReportName;
    report = aa.reportManager.getReportInfoModelByName(reportName);
    aa.print("After getting the Name" + report);
    aa.print("This is our Cap ID Module and Parameter" + capId + rModule + parameters)
    report = report.getOutput();
    aa.print("The Output" + report);
    report.setModule(rModule);
    report.setCapId(capId);
    report.setReportParameters(parameters);
    var permit = aa.reportManager.hasPermission(reportName, currentUserID);
    aa.print("This is the permit value we are trying to get" + permit);
    if (permit.getOutput().booleanValue())
    {
        aa.print("This is the permit value we are trying to get" + permit.getOutput().booleanValue());
        var reportResult = aa.reportManager.getReportResult(report);

        if (reportResult)
        {
            reportResult = reportResult.getOutput();
            aa.print("Report Results" + reportResult)
            var reportFile = aa.reportManager.storeReportToDisk(reportResult);
            logDebug("Report Result: " + reportResult);
            reportFile = reportFile.getOutput();
            return reportFile
        }
        else
        {
            logDebug("Unable to run report: " + reportName + " for Admin" + systemUserObj);
            return false;
        }
    }
    else
    {
        logDebug("No permission to report: " + reportName + " for Admin" + systemUserObj);
        return false;
    }
}

function reportRunSaveCustom(reportName, view, edmsSave, storeToDisk, reportModule, reportParams) {
    var name = "";
    var rFile = new Array();
    var error = "";
    var reportModel = aa.reportManager.getReportModelByName(reportName); //get detail of report to drive logic
    if (reportModel.getSuccess()) 
    {
        reportDetail = reportModel.getOutput();
        name = reportDetail.getReportDescription();
        if (name == null || name == "") 
        {
            name = reportDetail.getReportName();
        }
        var reportInfoModel = aa.reportManager.getReportInfoModelByName(reportName);  //get report info to change the way report runs
        if (reportInfoModel.getSuccess()) 
        {
            report = reportInfoModel.getOutput();
            report.setModule(reportModule);
            report.setCapId(capId);
            reportInfo = report.getReportInfoModel();
            report.setReportParameters(reportParams);
            //process parameter selection and EDMS save
            if (edmsSave == true && view == true) 
            {
                reportRun = aa.reportManager.runReport(reportParams, reportDetail);
                showMessage = true;
                comment(reportRun.getOutput()); //attaches report
                if (storeToDisk == true) 
                {
                    reportInfo.setNotSaveToEDMS(false);
                    reportResult = aa.reportManager.getReportResult(report); //attaches report
                    if (reportResult.getSuccess()) 
                    {
                        reportOut = reportResult.getOutput();
                        reportOut.setName(changeNameofAttachment(reportOut.getName()));
                        rFile = aa.reportManager.storeReportToDisk(reportOut);
                        if (rFile.getSuccess()) 
                        {
                            rFile = rFile.getOutput();
                        }
                        else 
                        {
                            rFile = new Array();
                            error = "Report failed to store to disk.  Debug reportFile for error message.";
                            logDebug(error);
                        }
                    }
                    else 
                    {
                        rFile = new Array();
                        error = "Report failed to run and store to disk.  Debug reportResult for error message, line 52";
                        logDebug(error);
                    }
                }
                else 
                {
                    rFile = new Array();
                }
            }
            else if (edmsSave == true && view == false) 
            {
                reportInfo.setNotSaveToEDMS(false);
                reportResult = aa.reportManager.getReportResult(report); //attaches report
                if (reportResult.getSuccess()) 
                {
                    reportOut = reportResult.getOutput();
                    reportOut.setName(changeNameofAttachment(reportOut.getName()));
                    if (storeToDisk == true) 
                    {
                        rFile = aa.reportManager.storeReportToDisk(reportOut);
                        if (rFile.getSuccess()) 
                        {
                            logDebug("Storing to disk");
                            rFile = rFile.getOutput();
                        }
                        else 
                        {
                            rFile = new Array();
                            error = "Report failed to store to disk.  Debug rFile for error message.";
                            logDebug(error);
                        }
                    }
                    else 
                    {
                        rFile = new Array();
                    }
                }
                else 
                {
                    rFile = new Array();
                    error = "Report failed to run and store to disk.  Debug reportResult for error message, line 93";
                    logDebug(error);
                }
            }
            else if (edmsSave == false && view == true) 
            {
                reportRun = aa.reportManager.runReport(reportParams, reportDetail);
                showMessage = true;
                comment(reportRun.getOutput());
                if (storeToDisk == true) 
                {
                    reportInfo.setNotSaveToEDMS(true);
                    reportResult = aa.reportManager.getReportResult(report);
                    if (reportResult.getSuccess()) 
                    {
                        reportResult = reportResult.getOutput();
                        reportResult.setName(changeNameofAttachment(reportResult.getName()));
                        rFile = aa.reportManager.storeReportToDisk(reportResult);
                        if (rFile.getSuccess()) 
                        {
                            rFile = rFile.getOutput();
                        }
                        else 
                        {
                            rFile = new Array();
                            error = "Report failed to store to disk.  Debug rFile for error message.";
                            logDebug(error);
                        }
                    }
                    else 
                    {
                        rFile = new Array();
                        error = "Report failed to run and store to disk.  Debug reportResult for error message, line 125";
                        logDebug(error);
                    }
                }
                else 
                {
                    rFile = new Array();
                }
            }
            else if (edmsSave == false && view == false) 
            {
                if (storeToDisk == true) 
                {
                    reportInfo.setNotSaveToEDMS(true);
                    reportResult = aa.reportManager.getReportResult(report);
                    if (reportResult.getSuccess()) 
                    {
                        reportResult = reportResult.getOutput();
                        reportResult.setName(changeNameofAttachment(reportResult.getName()));
                        rFile = aa.reportManager.storeReportToDisk(reportResult);
                        logDebug("Report File: " + rFile.getSuccess());
                        if (rFile.getSuccess()) 
                        {
                            rFile = rFile.getOutput();
                            logDebug("Actual Report: " + rFile);
                        }
                        else 
                        {
                            rFile = new Array();
                            error = "Report failed to store to disk.  Debug rFile for error message.";
                            logDebug(error);
                        }
                    }
                    else 
                    {
                        rFile = new Array();
                        error = "Report failed to run and store to disk.  Debug reportResult for error message, line 163";
                        logDebug(error);
                    }
                }
                else 
                {
                    rFile = new Array();
                }
            }
        }
        else 
        {
            rFile = new Array();
            error = "Failed to get report information.  Check report name matches name in Report Manager.";
            logDebug(error);
        }
    }
    else 
    {
        rFile = new Array();
        error = "Failed to get report detail.  Check report name matches name in Report Manager.";
        logDebug(error);
    }
    function changeNameofAttachment(attachmentName) {
        rptExtLoc = attachmentName.indexOf(".");
        rptLen = attachmentName.length();
        ext = attachmentName.substr(rptExtLoc, rptLen);
        attachName = name + ext;
        return attachName
    }
    return rFile;
}