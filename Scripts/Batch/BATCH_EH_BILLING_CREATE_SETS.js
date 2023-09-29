/*
Batch Job Script 
Name: BATCH_EH_BILLING_CREATE_SETS
Description: Creates Sets from EnvHealth Program records that fall into the parameters entered in the specified 
             Billing Parameter Record, parameter BillingParamRecNumber
Author: Accela
*/

//#region Load Environment
var SCRIPT_VERSION = "3.0";
var BATCH_NAME = "BATCH_EH_BILLING_CREATE_SETS";
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, true));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS", null, true));
eval(getScriptText("INCLUDES_CUSTOM", null, true));
//#endregion

//override functions for cleaner logs
var emailText = "";
var br = "<BR>";
overRide = "function logDebug(dstr) {aa.print(dstr + br);emailText += dstr}";
eval(overRide);

if (!matches(capId, null, undefined)) {
    var vCapId = capId;
}
//#region Batch Parameters
var EmailNotifyTo = aa.env.getValue("EmailNotifyTo");
if (matches(EmailNotifyTo, null, undefined, "")) {
    EmailNotifyTo = getUserEmail(currentUserID);
}
var billingParamRecNumber = aa.env.getValue("BillingParamRecNumber");
if (matches(billingParamRecNumber, null, undefined, "")) {
    billingParamRecNumber = capIDString;
}

//DC-1066 - jcrussell - begin
//batch parameter "Record Status" is semicolon-delimited list. IF not present then use single default status.
var VALID_REC_STATUS_ARR = [];
var recordStatus = ("" + aa.env.getValue("RecordStatus")).trim();
if (matches(recordStatus, null, undefined, "")) {
    VALID_REC_STATUS_ARR.push("Active, billable"); // default
} else {
    VALID_REC_STATUS_ARR = recordStatus.split(";").map(function (ele) { return ("" + ele).trim(); });
}
VALID_REC_STATUS_ARR.forEach(function (el, idx) {
    aa.print("Valid Record Status [" + idx + "] : " + el);
});
//DC-1066 - jcrussell - end
//#endregion

//#region Batch Globals
var showDebug = true; // Set to true to see debug messages
var startDate = new Date();
var startTime = startDate.getTime(); // Start timer
var sysDate = aa.date.getCurrentDate();
var batchJobID = aa.batchJob.getJobID().getOutput();
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var servProvCode = aa.getServiceProviderCode();
var capId = null;
var altId = "";
var documentOnly = false;
var annBilling = "";
var billingParamRec = null;
var billingMonthIndex = "";
var set = null;
var workflowUpdated = false;
var facilities = [];

var dateMap = aa.util.newHashMap();
dateMap.put("01 January", "January");
dateMap.put("02 February", "February");
dateMap.put("03 March", "March");
dateMap.put("04 April", "April");
dateMap.put("05 May", "May");
dateMap.put("06 June", "June");
dateMap.put("07 July", "July");
dateMap.put("08 August", "August");
dateMap.put("09 September", "September");
dateMap.put("10 October", "October");
dateMap.put("11 November", "November");
dateMap.put("12 December", "December");

//#endregion

// Execute Main Process
try {
    mainProcess();
} catch (err) {
    logDebug("Error in mainProcess: " + err.message);
    logDebug(err.stack);
}

if (documentOnly) {
    aa.env.setValue("ScriptReturnCode", "0");
    aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");
    aa.abortScript();
}
logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");

//#region Main
function mainProcess() {
    //get billing parameter record
    billingParamRec = aa.cap.getCapID(billingParamRecNumber).getOutput();
    if (!billingParamRec) {
        logDebug("<B><Font Color=RED>" + billingParamRecNumber + ": Invalid record number</Font></B>");
        return false;
    }
    //load tables
    var BILLINGRANGE = loadASITable("BILLING PROGRAMS RANGE", billingParamRec);
    var PROGRAMELEMENTKEY = loadASITable("PROGRAM ELEMENT KEYS", billingParamRec);
    //get billing month
    var billingMonth = getAppSpecific("Billing Month", billingParamRec) || false;
    if (!billingMonth) {
        logDebug("<B><Font Color=RED>" + billingParamRecNumber + ": has an invalid billing month, exiting</Font></B>");
        return false;
    }
    annBilling = getAppSpecific("Anniversary Billing", billingParamRec);
    billingMonthIndex = Number(billingMonth.split(" ")[0]) - 1;
    logDebug("Billing month for this billing record is: " + billingMonth);
    //program elements array
    var elementArray = new Array();
// Get program elements from billing range
for (var b in BILLINGRANGE) {
    var thisRow = BILLINGRANGE[b];
    var startRange = String(thisRow["Program Element Start"]).substr(0, 4);
    var endRange = String(thisRow["Program Element End"]).substr(0, 4);

    var currentValue = startRange;
    while (compareValues(currentValue, endRange) <= 0) {
        elementArray.push(currentValue);
        currentValue = incrementValue(currentValue);
    }
}
    //get program elements from program element key asit
    for (var p in PROGRAMELEMENTKEY) {
        var thisProgram = String(PROGRAMELEMENTKEY[p]["Program Element Key"]);
        var thisProgramKeyString = lookup("EH_PROGRAM_ELEMENT_BILLING_KEY", thisProgram) || "";
        var thisProgramKeyArray = thisProgramKeyString.split(",");
        for (var x in thisProgramKeyArray)
            elementArray.push(thisProgramKeyArray[x]);
    }

    if ("CHECKED".equals(annBilling)) {
        addToSetByFacilityAnnDate(elementArray, billingMonth);
    } else {
        //check for Anniversary Date
        addToSetByPermitProgramElement(elementArray);
    }

    if (!matches(EmailNotifyTo, null, undefined, "")) {
        var emailCapId = getApplication(billingParamRecNumber)
        var template = "EH_BILLING_BATCH_LOG";
        var params = aa.util.newHashtable();
        addParameter(params, "$$BatchName$$", BATCH_NAME);
        addParameter(params, "$$BatchLog$$", emailText);
        sendNotification("NoReply@accela.com", EmailNotifyTo, "", template, params, null, emailCapId);
    }
}
//#endregion

//#region Private Functions
function getUserEmail(userID) {
    var userEmail = ""
    var currentUsrVar = aa.person.getUser(userID).getOutput();
    if (currentUsrVar != null) {
        userEmail = currentUsrVar.getEmail();
    }
    return userEmail;
}
function getPermitsByProgramElement(keys) {
    var sql = "SELECT B.B1_ALT_ID FROM B1PERMIT B INNER JOIN BCHCKBOX ASI ON B.B1_PER_ID1 = ASI.B1_PER_ID1 AND B.B1_PER_ID2 = ASI.B1_PER_ID2 AND B.B1_PER_ID3 = ASI.B1_PER_ID3 AND B.SERV_PROV_CODE = ASI.SERV_PROV_CODE AND ASI.B1_CHECKBOX_DESC = 'Program Element'\
		WHERE left(ASI.B1_CHECKLIST_COMMENT,4) IN (select * from string_split($$keys$$, ',')) AND B.SERV_PROV_CODE = '$$servProvCode$$'\
		AND B.B1_PER_GROUP = '?InGroup' \
		AND B.B1_PER_TYPE = '?InType' \
		AND B.B1_PER_SUB_TYPE = '?InSubType' \
		AND B.B1_PER_CATEGORY = '?InCategory' \
		";

    var keysStr = "'" + keys.join(",") + "'";
    sql = sql.replace("$$keys$$", keysStr).replace("$$servProvCode$$", aa.getServiceProviderCode());

    var appTypeString = aa.env.getValue("Record Type");
    if (matches(appTypeString, null, undefined, "")) {
        appTypeString = "EnvHealth/*/*/Permit"
    }
    var recordTypeArray = appTypeString.split("/");
    capGroup = recordTypeArray[0];
    capType = recordTypeArray[1];
    capSubType = recordTypeArray[2];
    capCategory = recordTypeArray[3];

    if (capGroup == "*") {
        sql = sql.replace("AND B.B1_PER_GROUP = '?InGroup'", "");
    } else {
        sql = sql.replace("?InGroup", capGroup);
    }
    if (capType == "*") {
        sql = sql.replace("AND B.B1_PER_TYPE = '?InType'", "");
    } else {
        sql = sql.replace("?InType", capType);
    }
    if (capSubType == "*") {
        sql = sql.replace("AND B.B1_PER_SUB_TYPE = '?InSubType'", "");
    } else {
        sql = sql.replace("?InSubType", capSubType);
    }
    if (capCategory == "*") {
        sql = sql.replace("AND B.B1_PER_CATEGORY = '?InCategory'", "");
    } else {
        sql = sql.replace("?InCategory", capCategory);
        ;
    }

    var r = aa.db.select(sql, new Array()).getOutput();
    var result = new Array();
    if (r.size() > 0) {
        r = r.toArray();
        for (var x in r) {
            var thiscapId = aa.cap.getCapID(r[x].get("B1_ALT_ID")).getOutput();
            result.push(thiscapId);
        }
    }
    return result;
}
function elapsed() {
    var thisDate = new Date();
    var thisTime = thisDate.getTime();
    return ((thisTime - startTime) / 1000)
}
function getScriptText(vScriptName, servProvCode, useProductScripts) {
    if (!servProvCode)
        servProvCode = aa.getServiceProviderCode();
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    try {
        if (useProductScripts) {
            var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
        } else {
            var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
        }
        return emseScript.getScriptText() + "";
    } catch (err) {
        return "";
    }
}
function isCapExists(SetId, CapId) {
    var memberResult = aa.set.getCAPSetMembersByPK(SetId);
    members = memberResult.getOutput().toArray();
    for (var i = 0; i < members.length; i++) {
        if (members[i].toString() == CapId.toString()) {
            return true;
        }
    }
    return false;
}
function addToSetByPermitProgramElement(programElements) {
    logDebug("Now retrieving all permits with program elements: " + programElements);
    var getCapResult = getPermitsByProgramElement(programElements);
    logDebug("Retrieved this many records: " + getCapResult.length);

    for (var c in getCapResult) {
        //capId = aa.cap.getCapID(getCapResult[c].getID1(), getCapResult[c].getID2(), getCapResult[c].getID3()).getOutput();
        capId = getCapResult[c];
        logDebug("<B><Font Color=BLUE>Processing " + capId.getCustomID() + "</Font></B>");
        addPermitToSet(capId);
    }
}

function programElementMatch(ptogElArr, pElement) {
    if (!pElement || pElement == null) {
        return false;
    }
    for (var p in ptogElArr) {
        if (pElement.indexOf(ptogElArr[p] + "") >= 0) {
            return true;
        }
    }
    return false;
}

function addToSetByFacilityAnnDate(programElements, billingMonth) {
    //billingMonth is the same, we get the list once
    if (!facilities || facilities.length == 0) {
        facilities = getRecordListByTypeAndASI("EnvHealth/Facility/NA/NA", "Billing Anniversary", billingMonth);
        logDebug("**INFO addToSetByFacilityAnnDate() facilities loaded " + facilities.length);
    }
    for (var f in facilities) {
        var facilityRecord = facilities[f];
        var facPermits = getChildren("EnvHealth/*/*/*", facilityRecord);
        for (var p in facPermits) {
            var pElement = getAppSpecific("Program Element", facPermits[p]);
            //if (pElement && pElement.indexOf(programElement + "") >= 0)
            //addPermitToSet(facPermits[p]);
            if (programElementMatch(programElements, pElement)) {
                addPermitToSet(facPermits[p]);
            }//programElementMatch
        }//for facPermits
    }//for facilities
}

function getRecordListByTypeAndASI(recordType, asiName, asiValue) {
    var annMonth = dateMap.get(asiValue);
    if (!annMonth) {
        aa.print("**WARN getRecordListByTypeAndASI() could not get month translation from asiValue=" + asiValue);
        return [];
    }
    var cacheService = com.accela.aa.emse.dom.service.CachedService.getInstance();
    var capService = com.accela.aa.emse.dom.service.CachedService.getInstance().getCapService();

    var recordList = new Array();
    try {
        var capTypeModel = aa.cap.getCapTypeModel().getOutput();
        var capModel = aa.cap.getCapModel().getOutput();
        if (recordType && recordType != "") {
            capModel.setCapType(capTypeModel);
            var recordTypeArr = recordType.split("/");
            capTypeModel.setGroup(recordTypeArr[0]);
            capTypeModel.setType(recordTypeArr[1]);
            capTypeModel.setSubType(recordTypeArr[2]);
            capTypeModel.setCategory(recordTypeArr[3]);
        }
        if (asiName && asiName != "" && asiValue && asiValue != "") {
            //repeat for more ASIs
            var appSpecificInfoModelList = aa.util.newArrayList();
            var appSpecificInfoModel = new com.accela.aa.aamain.cap.AppSpecificInfoModel();
            appSpecificInfoModel.setCheckboxDesc(asiName);
            appSpecificInfoModel.setChecklistComment(annMonth);
            appSpecificInfoModelList.add(appSpecificInfoModel)
            capModel.setAppSpecificInfoGroups(appSpecificInfoModelList);
        }
        var capID = new com.accela.aa.aamain.cap.CapIDModel();
        capID.setServiceProviderCode(aa.getServiceProviderCode());
        capModel.setCapID(capID);

        recordList = capService.getCapIDListByContition(capModel);
        if (recordList && recordList != null) {
            recordList = recordList.toArray();
        }
    } catch (e) {
        logDebug("**WARN getRecordListByTypeAndASI() Error: " + e);
    }
    return recordList;
}

function addPermitToSet(itemCap) {
    capId = itemCap;
    var cap = aa.cap.getCap(capId).getOutput();
    altId = capId.getCustomID();
    var capStatus = cap.getCapStatus();//getAppStatus();
    // DC-1066 - jcrussell - begin
    // short-circuit if not matched in array
    var isValidStatus = false;
    VALID_REC_STATUS_ARR.forEach(function (el, idx) {
        if (("" + el).toUpperCase() == ("" + capStatus).toUpperCase()) {
            isValidStatus = true;
        }
    });
    if (!isValidStatus) {
        logDebug(altId + " has status " + capStatus + " and is not in list of valid App Status [" + VALID_REC_STATUS_ARR.join("|") + "], skipping...");
        return;
    }
    // DC-1066 - jcrussell - end

    var setName = billingParamRec.getCustomID();
    if (set == null) {
        set = new capSet(setName, setName, "Billing");
        set.type = "Billing";
        set.status = "Open";
        set.update();
    }//set is not init

    if ("CHECKED".equals(annBilling)) {
        //set.refresh(); 
        if (!isCapExists(set.setId, capId)) {
            set.add(capId);
            //set.update();
            logDebug(altId + ": added to set " + setName);
        }
        if (!workflowUpdated) {
            workflowUpdated = true;
            resultWorkflowTask("Renewal Set Processing", "Set Review in Progress", "", "", null, billingParamRec);
            var taskAssignedTo = getUserAssignedToTask(billingParamRec, "Renewal Set Processing");
            if (taskAssignedTo && !isBlank(taskAssignedTo.getEmail())) {
                var template = "EH_BILLING_TASK_UPDATE";
                var params = aa.util.newHashtable();
                addParameter(params, "$$taskName$$", "Renewal Set Processing");
                addParameter(params, "$$taskStatus$$", "Set Review in Progress");
                sendNotification("", taskAssignedTo.getEmail(), "", template, params, new Array());
            }//taskAssignedTo
        }//!workflowUpdated
    } else {
        var nextBillingDate = getAppSpecific("Next Billing Date") || false;
        if (!nextBillingDate) {
            logDebug(altId + ": does not have a billing date, skipping...");
            return false;
        }
        logDebug(altId + ": Got next billing date of " + nextBillingDate);
        var thisBillDate = new Date(nextBillingDate);
        var thisBillDateIndex = Number(thisBillDate.getMonth());
		var currentYear = new Date().getFullYear();
		if (thisBillDateIndex != billingMonthIndex || thisBillDate.getFullYear() != currentYear) {
			logDebug(altId + ": has a billing month(" + (thisBillDateIndex + 1) + ") not equal to the billing parameter bill month(" + (billingMonthIndex + 1) + ") or is not in the current year");
			return false;
		}
        if (!isCapExists(set.setId, capId)) {
            set.add(capId);
            //set.update();
            logDebug(altId + ": added to set " + setName);
        }
        if (!workflowUpdated) {
            workflowUpdated = true;
            resultWorkflowTask("Renewal Set Processing", "Set Review in Progress", "", "", null, billingParamRec);
            var taskAssignedTo = getUserAssignedToTask(billingParamRec, "Renewal Set Processing");
            if (taskAssignedTo && !isBlank(taskAssignedTo.getEmail())) {
                var template = "EH_BILLING_TASK_UPDATE";
                var params = aa.util.newHashtable();
                addParameter(params, "$$taskName$$", "Renewal Set Processing");
                addParameter(params, "$$taskStatus$$", "Set Review in Progress");
                sendNotification("", taskAssignedTo.getEmail(), "", template, params, new Array());
            }//taskAssignedTo
        }//!workflowUpdated
    }
}
function getUserAssignedToTask(vCapId, taskName) {
    currentUsrVar = null
    var taskResult1 = aa.workflow.getTask(vCapId, taskName);
    if (taskResult1.getSuccess()) {
        tTask = taskResult1.getOutput();
    } else {
        logDebug("**ERROR: Failed to get workflow task object");
        return false;
    }
    taskItem = tTask.getTaskItem()
    taskUserObj = tTask.getTaskItem().getAssignedUser()

    if (taskUserObj != null) {
        return taskUserObj;
    } else {
        return false;
    }
}

function incrementChar(char) {
    var code = char.charCodeAt(0);
    return String.fromCharCode(code + 1);
}

function compareValues(a, b) {
    var alphaNumericRegex = /^[a-zA-Z0-9]*$/;
    if (alphaNumericRegex.test(a) && alphaNumericRegex.test(b)) {
        var numericA = parseInt(a, 36);
        var numericB = parseInt(b, 36);
        return numericA - numericB;
    } else {
        return a.localeCompare(b);
    }
}

function incrementValue(value) {
    var numericValue = parseInt(value, 36);
    numericValue++;
    return numericValue.toString(36).toUpperCase();
}
//#endregion
