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

//#endregion

//#region Batch Parameters
var currentUserID = "ADMIN";
var EmailNotifyTo = aa.env.getValue("EmailNotifyTo");
var billingParamRecNumber = aa.env.getValue("BillingParamRecNumber");
var recordStatus = aa.env.getValue("Record Status");
//#endregion

//override functions for cleaner logs
var emailText = "";
var br = "<BR>";
overRide = "function logDebug(dstr) {aa.print(dstr + br);emailText += dstr}";
eval(overRide);

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

//#endregion

// Execute Main Process
mainProcess();

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
    if (!billingParamRec){
        logDebug("<B><Font Color=RED>" + billingParamRecNumber + ": Invalid record number</Font></B>");
        return false;
    }
    //load tables
    var BILLINGRANGE = loadASITable("BILLING PROGRAMS RANGE", billingParamRec);
    var PROGRAMELEMENTKEY = loadASITable("PROGRAM ELEMENT KEYS", billingParamRec);
    //get billing month
    var billingMonth = getAppSpecific("Billing Month", billingParamRec) || false;
    if (!billingMonth){
        logDebug("<B><Font Color=RED>" + billingParamRecNumber + ": has an invalid billing month, exiting</Font></B>");
        return false;
    }
    annBilling = getAppSpecific("Anniversary Billing", billingParamRec);
    billingMonthIndex = Number(billingMonth.split(" ")[0]) -1;
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
    for (var p in PROGRAMELEMENTKEY){
        var thisProgram = String(PROGRAMELEMENTKEY[p]["Program Element Key"]);
        var thisProgramKeyString = lookup("EH_PROGRAM_ELEMENT_BILLING_KEY", thisProgram) || "";
        var thisProgramKeyArray = thisProgramKeyString.split(",");
        for (var x in thisProgramKeyArray)
            elementArray.push(thisProgramKeyArray[x]);
    }
    for (var e in elementArray){
        //check for Anniversary Date
        if ("CHECKED".equals(annBilling)){
            addToSetByFacilityAnnDate(elementArray[e], billingMonth);
        }else{
            addToSetByPermitProgramElement(elementArray[e]);
        }
    }
    if(!matches(EmailNotifyTo,null,undefined,"")){
        aa.sendMail("NoReply@accela.com",EmailNotifyTo, "", "Batch Job - EH Monthly Billing Create Renewal Sets", emailText);
    }
}
//#endregion

//#region Private Functions
function getPermitsByProgramElement(key){
    var sql = "SELECT B.B1_ALT_ID FROM B1PERMIT B INNER JOIN BCHCKBOX ASI ON B.B1_PER_ID1 = ASI.B1_PER_ID1 AND B.B1_PER_ID2 = ASI.B1_PER_ID2 AND B.B1_PER_ID3 = ASI.B1_PER_ID3 AND B.SERV_PROV_CODE = ASI.SERV_PROV_CODE AND ASI.B1_CHECKBOX_DESC = 'Program Element'\
	WHERE ASI.B1_CHECKLIST_COMMENT LIKE '%$$key$$%' AND B.SERV_PROV_CODE = '$$servProvCode$$'\
	AND B.B1_PER_GROUP = '?InGroup' \
	AND B.B1_PER_TYPE = '?InType' \
	AND B.B1_PER_SUB_TYPE = '?InSubType' \
	AND B.B1_PER_CATEGORY = '?InCategory' \
	";
    sql = sql.replace("$$key$$", key).replace("$$servProvCode$$", aa.getServiceProviderCode());

    var appTypeString = aa.env.getValue("Record Type");
    if(matches(appTypeString,null,undefined,"")){
        appTypeString = "EnvHealth/*/*/Permit"
    }
    var recordTypeArray = appTypeString.split("/");
    capGroup = recordTypeArray[0];
    capType = recordTypeArray[1];
    capSubType = recordTypeArray[2];
    capCategory = recordTypeArray[3];

    if(capGroup == "*"){
        sql = sql.replace("AND B.B1_PER_GROUP = '?InGroup'","");
    }else{
        sql = sql.replace("?InGroup",capGroup);
    }
    if(capType == "*"){
        sql = sql.replace("AND B.B1_PER_TYPE = '?InType'","");
    }else{
        sql = sql.replace("?InType",capType);
    }	
    if(capSubType == "*"){
        sql = sql.replace("AND B.B1_PER_SUB_TYPE = '?InSubType'","");
    }else{
        sql = sql.replace("?InSubType",capSubType);
    }   
    if(capCategory == "*"){
        sql = sql.replace("AND B.B1_PER_CATEGORY = '?InCategory'","");
    }else{
        sql = sql.replace("?InCategory",capCategory);;
    }

    var r = aa.db.select(sql, new Array()).getOutput();
    var result = new Array();
    if (r.size() > 0){
        r = r.toArray();
        for (var x in r){
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
function addToSetByPermitProgramElement(programElement)
{
    logDebug("Now retrieving all permits with program element: " + programElement);
    var getCapResult = getPermitsByProgramElement(programElement);
    logDebug("Retrieved this many records: " + getCapResult.length);

    for (var c in getCapResult){
        capId = aa.cap.getCapID(getCapResult[c].getID1(), getCapResult[c].getID2(), getCapResult[c].getID3()).getOutput();
        logDebug("<B><Font Color=BLUE>Processing " + capId.getCustomID() + "</Font></B>");
        addPermitToSet(capId);
    }
}
function addToSetByFacilityAnnDate(programElement, billingMonth){
    var facilities = getFacilitiesByAnnDate(billingMonth);
    for (var f in facilities){
        var facilityRecord = aa.cap.getCapID(facilities[f].getID1(), facilities[f].getID2(), facilities[f].getID3()).getOutput();
        if (!appMatch("EnvHealth/Facility/NA/NA", facilityRecord)){
            logDebug(facilityRecord.getCustomID() + ": is not a facility record, skipping");
            continue;
        }
        var facPermits = getChildren("EnvHealth/*/*/*", facilityRecord);
        for (var p in facPermits){
            var pElement = getAppSpecific("Program Element", facPermits[p]);
            if (pElement && pElement.indexOf(programElement + "") >= 0)
                addPermitToSet(facPermits[p]);
        }
    }
}
function getFacilitiesByAnnDate(annDate){
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
    var annMonth = dateMap.get(annDate);
    if (annMonth){
        var getCapResult = aa.cap.getCapIDsByAppSpecificInfoField("Billing Anniversary", annMonth).getOutput() || new Array();
        return getCapResult;
    }else{
        return new Array();
    }
}
function addPermitToSet(itemCap) {
    capId = itemCap;
    var cap = aa.cap.getCap(capId).getOutput();
    altId = capId.getCustomID();
    var capStatus = getAppStatus();
    if (!matches(recordStatus, undefined, null, "")) {
        if (!recordStatus.equalsIgnoreCase(capStatus)) {
            logDebug(altId + ": is not " + recordStatus + " status, skipping...");
            return false;
        }
    }
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
    var setName = billingParamRec.getCustomID();
    var set = new capSet(setName, setName, "Billing");
    if (!isCapExists(set.setId, capId)) {
        set.add(capId);
        set.update();
        logDebug(altId + ": added to set " + setName);
    }
    resultWorkflowTask("Renewal Set Processing", "Set Review in Progress", "", "", null, billingParamRec);
    var taskAssignedTo = getUserAssignedToTask(billingParamRec, "Renewal Set Processing");
    if (taskAssignedTo && !isBlank(taskAssignedTo.getEmail())) {
        var template = "EH_BILLING_TASK_UPDATE";
        var params = aa.util.newHashtable();
        addParameter(params, "$$taskName$$", "Renewal Set Processing");
        addParameter(params, "$$taskStatus$$", "Set Review in Progress");
        sendNotification("", taskAssignedTo.getEmail(), "", template, params, new Array());
    }
}
function getAppStatus(){
    var itemCapId = capId;
    var capStatus = null;
    if (arguments.length == 1) itemCapId = arguments[0];
    var itemCap = aa.cap.getCap(itemCapId).getOutput();
    capStatus = itemCap.getCapStatus();
    return capStatus;
}
function getUserAssignedToTask(vCapId,taskName){
    currentUsrVar = null
    var taskResult1 = aa.workflow.getTask(vCapId,taskName);
    if (taskResult1.getSuccess()){
        tTask = taskResult1.getOutput();
    }
    else{
        logDebug("**ERROR: Failed to get workflow task object");
        return false;
    }
    taskItem = tTask.getTaskItem()
    taskUserObj = tTask.getTaskItem().getAssignedUser()

    if(taskUserObj != null){
        return taskUserObj;
    }
    else{
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
