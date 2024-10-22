/**********************************************************************************************
LIMS Interface EMSE script

This script will be called by the .NET portion of the LIMS interface. A set of result records
for a unique field Number/Inspection Sequence Number/CheckList ID will be passed. This set
will contain at least one result record but may contain more than one result record from
the lab.

*********************************************************************************************************/
var myCapId = "";
var myUserId = "ADMIN";
var currentUserID = "ADMIN";
var systemUserObj = aa.person.getUser(currentUserID).getOutput();
var eventName = "NA";
var useProductScript = true;
var runEvent = false;
debug = "";
const LAB_NUMBER = '1';
const LAB_NAME = 'Suffolk County Department of Health Services';

/* master script code don't touch */ aa.env.setValue("EventName", eventName); var vEventName = eventName; var controlString = eventName; var tmpID = aa.cap.getCapID(myCapId).getOutput(); if (tmpID != null) { aa.env.setValue("PermitId1", tmpID.getID1()); aa.env.setValue("PermitId2", tmpID.getID2()); aa.env.setValue("PermitId3", tmpID.getID3()); } aa.env.setValue("CurrentUserID", myUserId); var preExecute = "PreExecuteForAfterEvents"; var documentOnly = false; var SCRIPT_VERSION = 3.0; var useSA = false; var SA = null; var SAScript = null; var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_FOR_EMSE"); if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") { useSA = true; SA = bzr.getOutput().getDescription(); bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_INCLUDE_SCRIPT"); if (bzr.getSuccess()) { SAScript = bzr.getOutput().getDescription(); } } if (SA) { eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA, useProductScript)); eval(getScriptText("INCLUDES_ACCELA_GLOBALS", SA, useProductScript));	/* force for script test*/ showDebug = true; eval(getScriptText(SAScript, SA, useProductScript)); } else { eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, useProductScript)); eval(getScriptText("INCLUDES_ACCELA_GLOBALS", null, useProductScript)); } eval(getScriptText("INCLUDES_CUSTOM", null, useProductScript)); if (documentOnly) { doStandardChoiceActions2(controlString, false, 0); aa.env.setValue("ScriptReturnCode", "0"); aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed."); aa.abortScript(); } var prefix = lookup("EMSE_VARIABLE_BRANCH_PREFIX", vEventName); var controlFlagStdChoice = "EMSE_EXECUTE_OPTIONS"; var doStdChoices = true; var doScripts = false; var bzr = aa.bizDomain.getBizDomain(controlFlagStdChoice).getOutput().size() > 0; if (bzr) { var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice, "STD_CHOICE"); doStdChoices = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I"; var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice, "SCRIPT"); doScripts = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I"; } function getScriptText(vScriptName, servProvCode, useProductScripts) { if (!servProvCode) servProvCode = aa.getServiceProviderCode(); vScriptName = vScriptName.toUpperCase(); var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput(); try { if (useProductScripts) { var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName); } else { var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN"); } return emseScript.getScriptText() + ""; } catch (err) { return ""; } } logGlobals(AInfo); if (runEvent && typeof (doStandardChoiceActions) == "function" && doStdChoices) try { doStandardChoiceActions(controlString, true, 0); } catch (err) { logDebug(err.message) } if (runEvent && typeof (doScriptActions) == "function" && doScripts) doScriptActions(); var z = debug.replace(/<BR>/g, "\r"); aa.print(z);
var sysDate = aa.date.getCurrentDate();
var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), sysDate.getYear(), "");
debug = "";
selectDrillDownSeriesString = "SELECT DRLLD_SERIES_ID, PARENT_DDLIST_ID, CHILD_DDLIST_ID FROM RASITAB_DRLLD_SERIES WHERE SERV_PROV_CODE='SUFFOLKCO' and ASITAB_SUBGRP_NAM = 'SAMPLE RESULTS' and PARENT_COL_NAME = ? and CHILD_COL_NAME = ?";
var selectChildValueString = "SELECT c.BIZDOMAIN_VALUE AS CHILD_VALUE from RBIZDOMAIN_VALUE c INNER JOIN RASITAB_DRLLD_VAL_MAP map ON (c.serv_prov_code = map.serv_prov_code and c.BDV_SEQ_NBR = map.CHILD_VAL_ID and " +
    " c.BIZDOMAIN='DEQ_ANALYTE_INFO') " +
    " INNER JOIN RBIZDOMAIN_VALUE p on (map.serv_prov_code = p.serv_prov_code and map.parent_val_id = p.BDV_SEQ_NBR and p.BIZDOMAIN = 'DEQ_ANALYTE_NAME' and p.BIZDOMAIN_VALUE = ?) " +
    " WHERE p.SERV_PROV_CODE = 'SUFFOLKCO' and map.DRLLD_SERIES_ID = ? and p.REC_STATUS = 'A' and map.REC_STATUS = 'A' and c.REC_STATUS = 'A'";
var selectParentValueString = "SELECT p.BIZDOMAIN_VALUE AS PARENT_VALUE from RBIZDOMAIN_VALUE p INNER JOIN RASITAB_DRLLD_VAL_MAP map ON (p.serv_prov_code = map.serv_prov_code and p.BDV_SEQ_NBR = map.PARENT_VAL_ID and p.BIZDOMAIN='DEQ_GRP_NAME') " +
    " INNER JOIN RBIZDOMAIN_VALUE c on (map.serv_prov_code = c.serv_prov_code and map.child_val_id = c.BDV_SEQ_NBR and c.BIZDOMAIN = 'DEQ_ANALYTE_NAME' and c.BIZDOMAIN_VALUE = ?) " +
    " WHERE p.SERV_PROV_CODE = 'SUFFOLKCO' and map.DRLLD_SERIES_ID = ? and p.REC_STATUS = 'A' and map.REC_STATUS = 'A' and c.REC_STATUS = 'A'";
var updateInspString = "UPDATE g6ACTION set g6_DESI_DD = convert(datetime, ?) where serv_prov_code = 'SUFFOLKCO' and g6_act_num = ?";

var inspRecordId = null;
var inspSeqNum = -1;
var siteId = null;
var successFlag = true;
var inspectorUser = null;
var inspectorEmail = "";
var infoLog = [];
var warningLog = [];
var errorLog = [];
var content = "";
const pfoa = "$PFOA";
const pfas = "$PFAS";
const GROUP_NAME = "PERFLUORINATED COMPOUNDS";
const GROUP_NAME_1 = "PFAS 533";
const GROUP_NAME_2 = "PFAS 537.1";
const GROUP_NAME_3 = "PFAS SCWA";

const PFAS6_TOTAL_533 = "PFAS6 (Perfluoroalkyl Substance-6)";
const PFAS6_TOTAL_537_1 = "PFAS6 (Perfluoroalkyl Substance-6)";


const PFAS_CATEGORY_1_TOTAL_533 = "PFAS Category 1";
const PFAS_CATEGORY_1_TOTAL_537_1 = "PFAS Category 1";


const PFAS_CATEGORY_2_TOTAL_533 = "PFAS Category 2";
const PFAS_CATEGORY_2_TOTAL_537_1 = "PFAS Category 2";

//test data
//var resultsRecords = [
//    ["154-929-190211", "05/08/2018", "5:14:00 AM", "$FLAME", "Iron", "-0-", "Present < MDL", "Present < MDL", "0.1", "mg/L", "-0-", "-0-", "-0-", "-0-", "-0-", "ZD00477", "-0-"],
//   ["154-929-190211", "05/08/2018", "5:15:00 AM", "$FLAME", "Sodium", "27.7", "CONC", "CONC 1", "1", "mg/L", "-0-", "-0-", "-0-", "-0-","-0-", "ZD00477", "-0-"]
//];



var operation = String(aa.env.getValue("operation"));
if (operation == "DETERMINEDUP") {
    var fieldNum = String(aa.env.getValue("fieldNum"));
    var mess = "";
    dup = getAppIdByASILOCAL("Sample Event #", fieldNum, "DEQ/General/Lab/Results");
    if (dup) {
        logInfo("Duplicate : Data already posted for " + fieldNum + ", skipping");
        successFlag = true;
        mess = "DUPLICATEFOUND";
    }
    else {
        dup = getAppIdByASILOCAL("Sample Event #", fieldNum.split('-').join(''), "DEQ/General/Lab/Results");
        if (dup) {
            logInfo("Duplicate : Data already posted for " + fieldNum.split('-').join('') + ", skipping");
            successFlag = true;
            mess = "DUPLICATEFOUND";
        }
        else {
            successFlag = true;
            mess = "";
        }
    }
    returnStuff(successFlag, mess)
}
if (operation == "PROCESSDATA") {
    var jsonIN = String(aa.env.getValue("input"));
    d = JSON.parse(jsonIN);
    resultsRecords = d;
    var conn = aa.db.getConnection();
    logInfo("selectDrillDownSeriesString: " + selectDrillDownSeriesString);
    sDrillDownSeriesStmt = conn.prepareStatement(selectDrillDownSeriesString);
    sChildValueStmt = conn.prepareStatement(selectChildValueString);
    logInfo("selectChildValueString: " + selectChildValueString);
    logInfo("selectParentValueString: " + selectParentValueString);
    sParentValueStmt = conn.prepareStatement(selectParentValueString);
    try {
        showDebug = true;
        var aadb = new db();
        var fieldNum = resultsRecords[0][0];
        var labName = LAB_NAME;
        logInfo("Field Number = " + fieldNum);
        if (fieldNum.indexOf("-L-BW-ZWR") > 0) {
            fieldNum = fieldNum.replace("-L-BW-ZWR", "");
            // bottled water data - no inspection, no site.
            resId = getAppIdByASILOCAL("Sample Event #", fieldNum, "DEQ/General/Lab/Results");
            if (resId) {
                logInfo("Making table for " + fieldNum)
                makeTable(resultsRecords, resId, inspectorEmail);
            }
            else {
                logError("Could not find lab results record for field number " + fieldNum);
                successFlag = false;
            }
        }
        else {
            getInspectionInfo(fieldNum);
            if (siteId) {
                logInfo("Site Information = " + siteId.getCustomID());
                resId = getAppIdByASILOCAL("Sample Event #", fieldNum, "DEQ/General/Lab/Results");
                if (resId) {
                    makeTable(resultsRecords, resId, inspectorEmail);
                }
                else {
                    resId = getAppIdByASILOCAL("Sample Event #", fieldNum.split('-').join(''), "DEQ/General/Lab/Results");
                    if (resId) {
                        makeTable(resultsRecords, resId, inspectorEmail);
                    }
                    else {
                        //#1 GENERATE RESULT RECORD
                        var resId = createChild4LIMS("DEQ", "General", "Lab", "Results", fieldNum, siteId);
                        if (resId) {
                            logInfo("Created " + resId.getCustomID());
                            editAppSpecific("Sample Event #", fieldNum, resId);
                            editAppSpecific("Lab Results Returned", sysDateMMDDYYYY, resId);
                            makeTable(resultsRecords, resId, inspectorEmail);
                        }
                        else {
                            logError("Could not create result lab record for field number " + fieldNum);
                            successFlag = false;
                        }
                    }
                }
            }
            else {
                logError("Could not find inspection for field number " + fieldNum);
                successFlag = false;
            }
        }
    }
    catch (err) {
        logError("A JavaScript Error occured: " + err.message + ":" + err.stack);
        successFlag = false;
    }
    finally {
        sDrillDownSeriesStmt.close();
        sChildValueStmt.close();
        sParentValueStmt.close();
        conn.close();
    }
    returnStuff(successFlag);

}
if (operation == "COMPLETEPROCESSING") {
    showDebug = true;
    var aadb = new db();
    var fieldNum = String(aa.env.getValue("fieldNum"));
    var conn = aa.db.getConnection();
    uInspStmt = conn.prepareStatement(updateInspString);
    sDrillDownSeriesStmt = conn.prepareStatement(selectDrillDownSeriesString);
    sChildValueStmt = conn.prepareStatement(selectChildValueString);
    sParentValueStmt = conn.prepareStatement(selectParentValueString);
    try {
        if (fieldNum.indexOf("-L-BW-ZWR") > 0)
            fieldNum = fieldNum.replace("-L-BW-ZWR", "");
        resId = getAppIdByASILOCAL("Sample Event #", fieldNum, "DEQ/General/Lab/Results");
        if (!resId) {
            resId = getAppIdByASILOCAL("Sample Event #", fieldNum.split('-').join(''), "DEQ/General/Lab/Results");
        }
        if (resId) {
            getInspectionInfo(fieldNum);
            processCombos(resId);
            if (siteId) {
                // update inspection status, status date and desired date
                logInfo("Update inspection status of " + inspSeqNum + " on site " + siteId.getCustomID());
                var inspResultObj = aa.inspection.getInspection(siteId, inspSeqNum);
                if (inspResultObj.getSuccess()) {
                    var inspObj = inspResultObj.getOutput();
                    if (inspObj) {
                        inspModel = inspObj.getInspection();
                        if (inspModel != null) {
                            actModel = inspModel.getActivity();
                            actModel.setStatus("Lab Results Returned");
                            actModel.setStatusDate(new Date(sysDateMMDDYYYY));
                            inspModel.setActivity(actModel);
                            editResult = aa.inspection.updateInspectionForSuperVisor(inspModel);
                            if (!editResult.getSuccess()) {
                                logWarning("Issue updating inspection :" + editResult.getErrorMessage());
                            }
                            uInspStmt.setString(1, sysDateMMDDYYYY);
                            uInspStmt.setInt(2, inspSeqNum);
                            uInspStmt.execute();
                            createChildRelations(siteId, inspSeqNum, resId);
                            logInfo("Successfully processed " + fieldNum);
                        }
                    }
                    else {
                        logError("Failed to Process FieldNum: " + fieldNum + " inspection and site record cannot be found");
                        successFlag = false;
                    }
                }
            }
        }




        else {
            logError("Could not find lab result record for field number " + fieldNum);
            successFlag = false;
        }
    }
    catch (err) {
        logError("A JavaScript Error occured: " + err.message);
        successFlag = false;
    }
    finally {
        uInspStmt.close();
        sDrillDownSeriesStmt.close();
        sChildValueStmt.close();
        sParentValueStmt.close();
        conn.close();
    }
    returnStuff(successFlag);
}

function returnStuff(sFlag) {
    if (successFlag)
        aa.env.setValue("success", "true");
    else
        aa.env.setValue("success", "false");
    if (arguments.length == 2)
        aa.env.setValue("message", arguments[1]);
    else
        aa.env.setValue("message", "LIMS interface executed successfully");
    if (content) {
        aa.env.setValue("content", buildResultStructure(content));
    } else {
        aa.env.setValue("content", "");
    }
    if (errorLog) {
        aa.env.setValue("error", buildResultStructure(errorLog));
    } else {
        aa.env.setValue("error", []);
    }
    if (infoLog) {
        aa.env.setValue("info", buildResultStructure(infoLog));
    } else {
        aa.env.setValue("info", []);
    }
    if (warningLog) {
        aa.env.setValue("warning", buildResultStructure(warningLog));
    } else {
        aa.env.setValue("warning", []);
    }
    aa.env.setValue("ScriptReturnCode", "0");
    aa.env.setValue("ScriptReturnMessage", debug);
}

function getInspectionInfo(fieldNum) {
    // if the fieldNum is not a number, then should be legacy record, use checklistID
    if (isNaN(fieldNum)) {
        // find inspection by checklist ID - for legacy data
        var resultArr = aadb.dbDataSet("SELECT B1_PER_ID1,B1_PER_ID2,B1_PER_ID3, G6_ACT_NUM FROM GGUIDESHEET WHERE SERV_PROV_CODE='SUFFOLKCO' AND GUIDE_TYPE='Lab Methods' and GUIDESHEET_ID='" + fieldNum + "'", 1);
        if (resultArr.length > 0) {
            inspRecordId = aa.cap.getCapID(resultArr[0]["B1_PER_ID1"], resultArr[0]["B1_PER_ID2"], resultArr[0]["B1_PER_ID3"]).getOutput();
            inspSeqNum = resultArr[0]["G6_ACT_NUM"];
        }
        else {
            // try removing the dashes
            var resultArr3 = aadb.dbDataSet("SELECT B1_PER_ID1,B1_PER_ID2,B1_PER_ID3, G6_ACT_NUM FROM GGUIDESHEET WHERE SERV_PROV_CODE='SUFFOLKCO' AND GUIDE_TYPE='Lab Methods' and GUIDESHEET_ID='" + fieldNum.split('-').join('') + "'", 1);
            if (resultArr3.length > 0) {
                inspRecordId = aa.cap.getCapID(resultArr3[0]["B1_PER_ID1"], resultArr3[0]["B1_PER_ID2"], resultArr3[0]["B1_PER_ID3"]).getOutput();
                inspSeqNum = resultArr3[0]["G6_ACT_NUM"];
            }
        }
    }
    else {
        // either not legacy or legacy sample bottle numbers. Legacy bottle numbers are numeric but match the guidesheet ID
        var resultArr2 = aadb.dbDataSet("SELECT B1_PER_ID1,B1_PER_ID2,B1_PER_ID3, G6_ACT_NUM FROM GGUIDESHEET WHERE SERV_PROV_CODE='SUFFOLKCO' AND GUIDE_TYPE='Lab Methods' and GUIDESHEET_ID='" + fieldNum + "'", 1);
        if (resultArr2.length > 0) {
            inspRecordId = aa.cap.getCapID(resultArr2[0]["B1_PER_ID1"], resultArr2[0]["B1_PER_ID2"], resultArr2[0]["B1_PER_ID3"]).getOutput();
            inspSeqNum = resultArr2[0]["G6_ACT_NUM"];
        }
        else {
            // get the inspection according to the fieldnum value
            var resultArr = aadb.dbDataSet("SELECT B1_PER_ID1,B1_PER_ID2,B1_PER_ID3, G6_ACT_NUM FROM G6ACTION WHERE SERV_PROV_CODE='SUFFOLKCO' AND G6_ACT_NUM=" + fieldNum, 1);
            if (resultArr.length > 0) {
                inspRecordId = aa.cap.getCapID(resultArr[0]["B1_PER_ID1"], resultArr[0]["B1_PER_ID2"], resultArr[0]["B1_PER_ID3"]).getOutput();
                inspSeqNum = resultArr[0]["G6_ACT_NUM"];  // same value as fieldNum. Retrieving from table to make it have a consistent type as the other results
            }
        }
    }
    if (inspRecordId && inspSeqNum && inspSeqNum > 0) {
        var inspObj = aa.inspection.getInspection(inspRecordId, inspSeqNum).getOutput();
        var inspectorId = inspObj.getInspector();
        inspectorUser = null;
        if (inspectorId) {
            inspectorUser = aa.person.getUser(inspectorId.getUserID()).getOutput();            
            
            if (inspectorUser) {

                logInfo("inspectorId: " + inspectorId); 
                logInfo("User ID: " + inspectorId.getUserID());
                
                //EHIMS-5397
                if (inspectorId.getUserID() == 'JUANDREWS' ||   //110 Justin Andrews
                    inspectorId.getUserID() == 'DHOHENSCHUH' ||   //133 Doug Hohenschuh
                    inspectorId.getUserID() == 'SDRAKE' ||   //141 Sean Drake
                    inspectorId.getUserID() == 'BPEDERSEN' ||   //816 Brian Pedersen
                    inspectorId.getUserID() == 'ALESIEWICZ' ||   //886 Amanda Lesiewicz
                    inspectorId.getUserID() == 'TPIRNAK')     //959 Tyler Pirnak
                {
                    tmpEmailStr = "julia.cahill@suffolkcountyny.gov";
                    logInfo("Inspection ID: " + inspectorId.getUserID() + " detected. Diverging email to: " + tmpEmailStr);
                }
                else {
                    tmpEmailStr = inspectorUser.getEmail();                    
                }
                if (tmpEmailStr) {
                    inspectorEmail = tmpEmailStr;                   
                }
            }
        }
        logInfo("inspectorEmail: " + inspectorEmail + "|inspRecordId && inspSeqNum && inspSeqNum: " + inspRecordId + "," + inspSeqNum + "," + inspSeqNum);
        if (appMatch("DEQ/General/Site/NA", inspRecordId)) {
            siteId = inspRecordId;
        }
        else {
            var p = getParent(inspRecordId);
            while (p) {
                if (appMatch("DEQ/General/Site/NA", p)) {
                    siteId = p;
                    break;
                }
                p = getParent(p);
            }
        }
    }
}

function createChildRelations(siteId, inspSeqNum) {
    logInfo("Creating child relations");
    var insp2Check = "Sampling Event";
    var inspResultObj = aa.inspection.getInspections(siteId);
    var inspObj = null;
    if (inspResultObj.getSuccess()) {
        var inspList = inspResultObj.getOutput();
        if (inspList && inspList.length > 0) {
            for (var xx in inspList) {
                //  if (String(insp2Check).equals(inspList[xx].getInspectionType()) && inspList[xx].getInspection().getInspSequenceNumber() == inspSeqNum) {
                if (inspList[xx].getInspection().getIdNumber() == inspSeqNum) {
                    inspObj = inspList[xx];
                }
            }
        }
    }
    if (!inspObj) {
        logWarning("No inspection found to update"); return;
    }
    inspModel = inspObj.getInspection();
    gsList = inspModel.getGuideSheets();
    if (gsList) {
        gsArr = gsList.toArray();
        for (gsi in gsArr) {
            gs = gsArr[gsi];
            gsItemList = gs.getItems();
            if (gsItemList) {
                gsItemArr = gsItemList.toArray();
                for (gsii in gsItemArr) {
                    gsItem = gsItemArr[gsii];
                    if (gsItem.getGuideItemText() == "Children Records") {
                        gs0 = new guideSheetObjectLOCAL(gs, gsItem);
                        gs0.loadInfoTables();
                        childTable = gs0.infoTables["CHILDREN RECORDS"];
                        if (childTable) {
                            for (var rowIndex in childTable) {
                                thisRow = childTable[rowIndex];
                                childAltID = thisRow["Child Record"];
                                if (childAltID && childAltID != "") {
                                    childId = getApplication(childAltID);
                                    if (childId) {
                                        var result = aa.cap.createAppHierarchy(childId, resId);
                                        if (result.getSuccess())
                                            logInfo("Child application successfully linked");
                                        else
                                            logWarning("Could not link applications");
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

function guideSheetObjectLOCAL(gguidesheetModel, gguidesheetItemModel) {
    this.gsType = gguidesheetModel.getGuideType();
    this.gsSequence = gguidesheetModel.getGuidesheetSeqNbr();
    this.gsDescription = gguidesheetModel.getGuideDesc();
    this.gsIdentifier = gguidesheetModel.getIdentifier();
    this.item = gguidesheetItemModel;
    this.text = gguidesheetItemModel.getGuideItemText()
    this.status = gguidesheetItemModel.getGuideItemStatus();
    this.comment = gguidesheetItemModel.getGuideItemComment();
    this.score = gguidesheetItemModel.getGuideItemScore();

    this.info = new Array();
    this.infoTables = new Array();
    this.validTables = false;				//true if has ASIT info
    this.validInfo = false;				//true if has ASI info


    this.loadInfo = function () {
        var itemASISubGroupList = this.item.getItemASISubgroupList();
        //If there is no ASI subgroup, it will throw warning message.
        if (itemASISubGroupList != null) {
            this.validInfo = true;
            var asiSubGroupIt = itemASISubGroupList.iterator();
            while (asiSubGroupIt.hasNext()) {
                var asiSubGroup = asiSubGroupIt.next();
                var asiItemList = asiSubGroup.getAsiList();
                if (asiItemList != null) {
                    var asiItemListIt = asiItemList.iterator();
                    while (asiItemListIt.hasNext()) {
                        var asiItemModel = asiItemListIt.next();
                        this.info[asiItemModel.getAsiName()] = asiItemModel.getAttributeValue();

                    }
                }
            }
        }
    }

    this.loadInfoTables = function () {
        var guideItemASITs = this.item.getItemASITableSubgroupList();
        if (guideItemASITs != null) {
            logDebug(guideItemASITs.size());
            for (var j = 0; j < guideItemASITs.size(); j++) {
                var guideItemASIT = guideItemASITs.get(j);
                var tableArr = new Array();
                var columnList = guideItemASIT.getColumnList();
                for (var k = 0; k < columnList.size(); k++) {
                    var column = columnList.get(k);
                    var values = column.getValueMap().values();
                    var iteValues = values.iterator();
                    while (iteValues.hasNext()) {
                        var i = iteValues.next();
                        var zeroBasedRowIndex = i.getRowIndex() - 1;
                        if (tableArr[zeroBasedRowIndex] == null) tableArr[zeroBasedRowIndex] = new Array();
                        tableArr[zeroBasedRowIndex][column.getColumnName()] = i.getAttributeValue();
                    }
                }
                this.infoTables["" + guideItemASIT.getTableName()] = tableArr;
                this.validTables = true;
            }
        }
    }
}

function makeTable(labResults, resId, inspEmail) {
    /* COLUMN ORDER OF INPUT
    * 0 = FIELDNUMBER
    * 1 = DATEANALYZED
    * 2 = TIMEANALYZED
    * 3 = ANALYSISCODE
    * 4 - ANALYTENAME
    * 5 = NUMRESULT
    * 6 = TEXTRESULT
    * 7 = COMBRESULT
    * 8 = MDL
    * 9 = UNITS
    * 10 = REMARK1
    * 11 = REMARK2
    * 12 = REMARK3
    * 13 = REMARK4
    * 14 = REMARK5
    * 15 = LABNUMBER
    * 16 = ANALYSISCOMMENT
    * 17 = LAB CODE
    * 18 = LAB NAME
    * labmethod = DEQ_LAB_METHODS
    * labname = 
    * groupname=
    * analytename=
    * textresults=DEQ_TEXT_RESULTS
    * units=DEQ_UNITS
    */
    asitTableRows = [];
    sampleErrors = [];
    for (var row in labResults) {
        var r = labResults[row];
        var t = {};
        sampleError = false;
        fieldNum = r[0];
        if (fieldNum.indexOf("-L-BW-ZWR") > 0)
            fieldNum = fieldNum.replace("-L-BW-ZWR", "");
        t["Field Number"] = fieldNum;
        if (r[1] == "-0-") {
            logInfo("Incomplete HERMET line found, skipping : " + r);
            continue;        // this is an incomplete HERBMET data.
        }
        t["Analysis Date"] = r[1];
        t["Analysis Time"] = r[2];

        // If there is value, use the value for lab name
        if (r[3] == GROUP_NAME ||
            r[3] == GROUP_NAME_1 ||
            r[3] == GROUP_NAME_2 ||
            r[3] == GROUP_NAME_3) {
            // Wiat for josh to let us know if we need to check that r[3] == pfoa) {

            if (r[18]) {
                logInfo("A lab name has been found in the PFAS EDT file: " + r[18]);
                labName = r[18];
            }
            else {
                logInfo("A lab name has not been found in the PFAS EDT file. Skipping row: " + r);
                continue;    // this is an incomplete PFAS data.
            }
        }
        t["Lab Name"] = labName;

        ac = "" + r[3];
        if (r[3] == pfoa) {
            analysisCode = GROUP_NAME_1
        }
        else if (r[3] == pfas) {
            analysisCode = GROUP_NAME_2
        }
        else {
            analysisCode = r[3];
        }
       

        analyteName = r[4];

        // This is for drinking water ammonia. We need special handling since the analyte name for both drinking water ammonia and marine ammonia
        // are the same
        if (analysisCode == "_AMMONIA") {
            analyteName = "Ammonia";
        }

        prettyName = getPrettyName(analyteName);

        cMethod = getCertifiedMethod(analysisCode);
        if (!cMethod) cMethod = "";
        key = prettyName + "|" + cMethod;
        // Special case for VITECK EHIMS-4571
        if (analysisCode == "$VITEK") {
            key = "Vitek";
        }

        if (r[3] == GROUP_NAME || r[3] == GROUP_NAME_1 || r[3] == GROUP_NAME_2 || r[3] == GROUP_NAME_3) {
            t["Group Name"] = r[3];
        }
        else if (r[3] == pfoa) {
            t["Group Name"] = GROUP_NAME_1;
        }
        else if (r[3] == pfas) {
            t["Group Name"] = GROUP_NAME_2;
        }
        else {
            t["Group Name"] = getGroupNameValue(key);
        }
        t["Analyte & Method"] = key;
        logInfo("key: " + key);
        aInfo = getAnalyteObject(key);
       
        if (aInfo && aInfo != "")
            t["Analyte Information"] = aInfo.info;
        else
            sampleError = true;
        t["Certified Method"] = cMethod;
        t["C-Number"] = aInfo.casNumber;
        t["Analyte Name"] = prettyName;
        t["DMDL Notation"] = aInfo.dmdlNotation;
        t["DMDL"] = aInfo.dmdl;
        t["MCL"] = aInfo.mcl;
        t["MCL Notation"] = aInfo.mclNotation;
        t["Units"] = doUnitTranslation(doNullTranslation("STRING", r[9]));
        t["CAS Number"] = aInfo.casNumber;
        rawNumericResult = "" + r[5];
        t["Numeric Result"] = doNullTranslation("NUMBER", r[5]);
        t["Trace Results"] = "";
        if (r[6] == "INVALID" || r[6] == "Invalid" || r[6] == "LA" || r[6] == "NR" || r[6] == "NA" || r[6] == "N/A") {
            sampleError = true;
        }
        rawTextResult = "" + r[6];
        textResult = doTextResultTranslation(r[6]);
        logInfo("r[6]: " + r[6]);
        logInfo("textResult: " + textResult);
        t["Text Results"] = textResult;
        t["Combination Results"] = r[7];
        t["Analyte MDL"] = doNullTranslation("STRING", r[8]);
        t["Result Notation"] = getResultNotation(textResult);
        logInfo("Result notation: " + t["Result Notation"]);
        t["Flag"] = getFlagValue(textResult, doNullTranslation("NUMBER", r[5]), aInfo.mcl);
        t["Remarks1"] = doNullTranslation("STRING", r[10]);
        t["Remarks2"] = doNullTranslation("STRING", r[11]);
        t["Remarks3"] = doNullTranslation("STRING", r[12]);
        t["Remarks4"] = doNullTranslation("STRING", r[13]);
        t["Remarks5"] = doNullTranslation("STRING", r[14]);
        t["Lab Sample Number"] = r[15];
        t["Lab Analysis Code"] = analysisCode;
        // < MDL logic
        // EHIMS-5173
        if (textResult.equals("Present < MDL"))
        {
            // Text results is Analyte MDT is it is Present < MDL
            t["Results"] = doNullTranslation("STRING", r[8]);
        }
        else // Otherwise, Text results is numeric result
        {
            t["Results"] = rawNumericResult;
        }
        if (rawNumericResult == "-0-" || rawNumericResult == "0") {
            t["Results"] = doNullTranslation("STRING", r[8]);
        }
        //   else {    // 1016 per Josh
        if (analyteName == "Colilert" || analyteName == "E.Coli" ||
            analyteName == "Total Coliform" || analyteName == "E.coli (Qualitative)") {
            if (textResult == "N") {
                t["Results"] = "0";
                t["Flag"] = "";     // 10/16/19 changed from * to blank per Josh
                t["Result Notation"] = "<";
            }
            if (textResult == "P") {
                t["Results"] = "1.1";
                t["Flag"] = "*";
                t["Result Notation"] = "=";
            }
        }
        if (analyteName == "Gross Alpha E" || analyteName == "Gross Alpha P" || analyteName == "Gross Beta" || analyteName == "Tritium" || analyteName == "RADON") {
            if (textResult == "CONC") {
                t["Results"] = r[7];        // combination reults
                t["Result Notation"] = "=";
                logInfo(analyteName + ", " + r[7])
            }
            else {
                t["Results"] = doNullTranslation("STRING", r[8]);  // changed from r[7] per Josh 1018. Not in the spec.
                t["Result Notation"] = "<";
            }
        }
        if (analysisCode == GROUP_NAME || analysisCode == GROUP_NAME_1 || analysisCode == GROUP_NAME_2 || analysisCode == GROUP_NAME_3) {
            if (textResult == "") {
                t["Text Results"] = "Not detected";
            }
            else if (textResult == "CONC (G)") {
                t["Text Results"] = doNullTranslation("NUMBER", r[5]);

            }
        }      
        //    }

        if (!sampleError) {
            {
                logInfo("Data added: Numberic Result|Text Results|Results|: " + t["Numeric Result"] + "|" + t["Text Results"] + "|" + t["Results"]);
                asitTableRows.push(t);
            }
        }
        else {
            sampleErrors.push(t);
            logInfo("Sample error added. Total error: " + sampleErrors.length);
        }
    }
    if (sampleErrors.length > 0) {
        // email inspector the errors 
        if (inspEmail != "") {
            msg = "";
            for (var seIndex in sampleErrors) {
                thisRow = sampleErrors[seIndex];
                for (var n in thisRow) {
                    msg += n + "=" + thisRow[n] + " ";
                }
                msg += "\r\n";
            }
            logInfo("Sending sample error email to: " + inspEmail);
            aa.sendEmail("AccelaAdmin@suffolkcountyny.gov", inspEmail, "", "LIMS Interface", msg, null);           
            
        }
    }
    if (asitTableRows.length > 0)
        addToASITableLOCAL("SAMPLE RESULTS", asitTableRows, resId);
    logInfo("Number of rows with sample errors : " + sampleErrors.length);
    logInfo("Added " + asitTableRows.length + " rows to SAMPLE RESULTS table on lab record " + resId.toString());

}

function processCombos(resId) {   
        metalCombos = [];
        metalComboFound = false;
        metalComboRow = [];
        aldiCombos = [];
        aldiComboFound = false;
        aldiComboRow = [];
        svocCombos = [];
        svocComboFound = false;
        svocComboRow = [];
        hazardIndexCombos = [];
        hazardIndexFound = false;
        hazardIndexRow = [];

        asiTableRowArray = [];

        pFAS6Combos533 = [];
        pFAS6Combos533Found = false;
        pFAS6Combos533Row = [];

        pFAS6Combos537 = [];
        pFAS6Combos537Found = false;
        pFAS6Combos537Row = [];

        pfaCatogory1Combos533 = [];
        pfaCatogory1Combos533Found = false;
        pfaCatogory1Combos533Row = [];

        pfaCatogory1Combos537 = [];
        pfaCatogory1Combos537Found = false;
        pfaCatogory1Combos537Row = [];

        pfaCatogory2Combos533 = [];
        pfaCatogory2Combos533Found = false;
        pfaCatogory2Combos533Row = [];

        pfaCatogory2Combos537 = [];
        pfaCatogory2Combos537Found = false;
        pfaCatogory2Combos537Row = [];

        originalTable = [];     // without the combo rows
        var labResults = loadASITable("SAMPLE RESULTS", resId);
        for (var rIndex in labResults) {
            var row = labResults[rIndex];
            var prettyName = row["Analyte Name"];
            switch ("" + prettyName) {
                case "Iron (Fe)":
                case "Manganese (Mn)":
                    metalCombos.push(row);
                    originalTable.push(row);
                    break;
                case "HFPO-DA/GenX (Hexafluoropropylene oxide dimer acid)":
                case "PFNA (Perfluorononanoic acid)":
                case "PFBS (Perfluorobutanesulfonic acid)":
                case "PFHxS (Perfluorohexanesulfonic acid)":
                    logInfo("Added row to harzard Index combo: " + row["Results"]);
                    hazardIndexCombos.push(row);
                    originalTable.push(row);
                    break;
                case "Aldicarb":
                case "Aldicarb-Sulfoxide":
                case "Aldicarb-Sulfone":
                    aldiCombos.push(row);
                    originalTable.push(row);
                    break;
                case "Simazine":
                case "Atrazine":
                    svocCombos.push(row);
                    originalTable.push(row);
                    break;
                case "Iron + Manganese (Combined, Calc)":
                    metalComboFound = true;
                    metalComboRow = row;
                    break;
                /****** Uncomment this to include total 
                case PFAS_CATEGORY_2_TOTAL_533:
                    pfaCatogory2Combos533Found = true;
                    pfaCatogory2Combos533Row = row;
                    break;
                case PFAS_CATEGORY_2_TOTAL_537_1:
                    pfaCatogory2Combos537Found = true;
                    pfaCatogory2Combos537Row = row;
                    break;
                case PFAS_CATEGORY_1_TOTAL_533:
                    pfaCatogory1Combos533Found = true;
                    pfaCatogory1Combos533Row = row;
                    break;
                case PFAS_CATEGORY_1_TOTAL_537_1:
                    pfaCatogory1Combos537Found = true;
                    pfaCatogory1Combos537Row = row;
                    break;
                case PFAS6_TOTAL_533:
                    pFAS6Combos533Found = true;
                    pFAS6Combos533Row = row;
                    break;
                case PFAS6_TOTAL_537_1:
                    pFAS6Combos537Found = true;
                    pFAS6Combos537Row = row;
                    break;
                    */

                // PFAS6 Group
                /****** Uncomment this to include total
               case "PFOS (Perfluorooctanesulfonic acid)":
               case "PFOA (Perfluorooctanoic acid)":
               case "PFHxS (Perfluorohexanesulfonic acid)":
               case "PFHpA (Perfluoroheptanoic acid)":
               case "PFNA (Perfluorononanoic acid)":
               case "PFDA (Perfluorodecanoic acid)":
                /****** Uncomment this to include total
               // Case sensitive
               case "PFOS (Perfluorooctanesulfonic Acid)":
               case "PFOA (Perfluorooctanoic Acid)":
               case "PFHxS (Perfluorohexanesulfonic Acid)":
               case "PFHpA (Perfluoroheptanoic Acid)":
               case "PFNA (Perfluorononanoic Acid)":
               case "PFDA (Perfluorodecanoic Acid)":
                   // Find the group to decide which combo to add
    
                   analysisCode = row["Lab Analysis Code"];
                   cMethod = getCertifiedMethod(analysisCode);
                   if (cMethod == GROUP_NAME_1) {
                       pFAS6Combos533.push(row);
                   }
                   if (cMethod == GROUP_NAME_2) {
                       pFAS6Combos537.push(row);
                   }
    
                   originalTable.push(row);
                   break;
               // Case senstivie
               case "PFHpS (Perfluoroheptanesulfonic acid)":
               case "PFHpS (Perfluoroheptanesulfonic Acid)":
               // Case senstivie
               case "PFUnA (Perfluoroundecanoic acid)":
               case "PFUnA (Perfluoroundecanoic Acid)":
               // Case sensitive
               case "PFDoA (Perfluorododecanoic acid)":           
               case "PFDoA (Perfluorododecanoic Acid)":
                                          
               case "HFPO-DA/GenX (Hexafluoropropylene oxide dimer acid)":
               // Case sensitive  
               case "11Cl-PF3OUdS (11-Chloroeicosafluoro-3-oxaundecane-1-sulfonic acid)":                  
               case "11Cl-PF3OUdS (11-Chloroeicosafluoro-3-Oxaundecane-1-Sulfonic Acid)":
               // Case sensitive    
               case "9Cl-PF3ONS (9-Chlorohexadecafluoro-3-oxanonane-1-sulfonic acid)":           
               case "9Cl-PF3ONS (9-Chlorohexadecafluoro-3-Oxanonane-1-Sulfonic Acid)":
    
                   analysisCode = row["Lab Analysis Code"];
                   cMethod = getCertifiedMethod(analysisCode);
                   if (cMethod == GROUP_NAME_1) {
                       pfaCatogory1Combos533.push(row);
                   }
                   if (cMethod == GROUP_NAME_2) {
                       pfaCatogory1Combos537.push(row);
                   }
    
                   originalTable.push(row);
                   break;
            
            
               case "PFBA (Perfluorobutanoic acid)":
               case "PFBS (Perfluorobutanesulfonic acid)":
               case "PFPeA (Perfluoropentanoic acid)":
               case "PFPeS (Perfluoropentanesulfonic acid)":
               case "PFHxA (Perfluorohexanoic acid)":
               case "ADONA (4,8-Dioxa-3H-perfluorononanoic acid)":
               case "4:2FTS (1H, 1H, 2H, 2H-Perfluorohexane sulfonic acid)":
               case "6:2FTS (1H, 1H, 2H, 2H-Perfluorooctane sulfonic acid)":
               case "8:2FTS (1H, 1H, 2H, 2H-Perfluorodecane sulfonic acid)":
               case "NFDHA (Nonafluoro-3,6-dioxaheptanoic acid)":          
               case "PFEESA (Perfluoro(2-ethoxyethane)sulfonic acid)":
               case "PFMPA (Perfluoro-3-methoxypropanoic acid)":
               case "PFMBA (Perfluoro-4-methoxybutanoic acid)":          
             
                                      
                   analysisCode = row["Lab Analysis Code"];
                   cMethod = getCertifiedMethod(analysisCode);
                   if (cMethod == GROUP_NAME_1) {
                       pfaCatogory2Combos533.push(row);
                   }
                   if (cMethod == GROUP_NAME_2) {
                       pfaCatogory2Combos537.push(row);
                   }
    
                   originalTable.push(row);
                   break;
                   */
                case "Total Aldicarb(calc)":
                    logInfo("Pretty Name: " + prettyName);
                    aldiComboFound = true;
                    aldiComboRow = row;
                    break;
                case "Total Triazines + Metabolites(Calc)":
                    svocComboFound = true;
                    svocComboRow = row;
                    break;
                case "PFAS Hazard Index":
                    logInfo("Pretty Name: " + prettyName);
                    hazardIndexFound = true;
                    hazardIndxRow = row;
                    break;
                default:
                    originalTable.push(row);
                    break;
            }
        }

        //**************** Uncomment this section to addd the group row *******************************************
        //1. PFAS6 533 TOTAL: add total pfa main group row 533
        /*
        logInfo("1. Found " + pFAS6Combos533.length + " pFAS6 533 main group rows to combine");
        if (pFAS6Combos533.length > 1) {
            var totalMainGroup = 0.0;
            for (var pIndex in pFAS6Combos533) {
                thisMain = pFAS6Combos533[pIndex];
                if (thisMain["Analyte Name"] == "PFOS (Perfluorooctanesulfonic acid)" ||
                    thisMain["Analyte Name"] == "PFOA (Perfluorooctanoic acid)" ||
                    thisMain["Analyte Name"] == "PFHxS (Perfluorohexanesulfonic acid)" ||
                    thisMain["Analyte Name"] == "PFHpA (Perfluoroheptanoic acid)" ||
                    thisMain["Analyte Name"] == "PFNA (Perfluorononanoic acid)" ||
                    thisMain["Analyte Name"] == "PFDA (Perfluorodecanoic acid)" ||
                    // Case sensitive
                    thisMain["Analyte Name"] == "PFOS (Perfluorooctanesulfonic Acid)" ||
                    thisMain["Analyte Name"] == "PFOA (Perfluorooctanoic Acid)" ||
                    thisMain["Analyte Name"] == "PFHxS (Perfluorohexanesulfonic Acid)" ||
                    thisMain["Analyte Name"] == "PFHpA (Perfluoroheptanoic Acid)" ||
                    thisMain["Analyte Name"] == "PFNA (Perfluorononanoic Acid)" ||
                    thisMain["Analyte Name"] == "PFDA (Perfluorodecanoic Acid)")
                {
    
                    logInfo("Adding " + thisMain["Analyte Name"] + ", " + parseFloat(thisMain["Numeric Result"]));
                    //totalMainGroup += parseFloat(thisMain["Numeric Result"]);
    
                    var floatMain533 = parseFloat(thisMain["Numeric Result"]);
                    totalMainGroup += floatMain533;
                    totalMainGroup = parseFloat(totalMainGroup);
                    
                }
            }
    
            // add total main group row
            logInfo("Total pFAS6 PFA 533 main group is: " + totalMainGroup);
            if (totalMainGroup > 0) {
                if (!pFAS6Combos533Found) {
                    var t = {};
                    t["Field Number"] = pFAS6Combos533[0]["Field Number"];
                    t["Analysis Date"] = pFAS6Combos533[0]["Analysis Date"];
                    t["Analysis Time"] = pFAS6Combos533[0]["Analysis Time"];
    
                    prettyName = GROUP_NAME_1;//MAIN_GROUP_TOTAL_533;
                    t["Lab Name"] = pFAS6Combos533[0]["Lab Name"];
                    analysisCode = pFAS6Combos533[0]["Lab Analysis Code"];
                    cMethod = getCertifiedMethod(analysisCode);
                    if (!cMethod) cMethod = "";
                    key = prettyName + "|" + cMethod;
                    t["Group Name"] = GROUP_NAME_1; //MAIN_GROUP_TOTAL_533;
                    t["Analyte & Method"] = key;
                    aInfo = getAnalyteObject(key);
                    if (aInfo && aInfo != "")
                        t["Analyte Information"] = aInfo.info;
                    t["Certified Method"] = cMethod;
                    t["C-Number"] = aInfo.casNumber;
                    t["Analyte Name"] = PFAS6_TOTAL_533;//prettyName;
                    t["DMDL Notation"] = aInfo.dmdlNotation;
                    t["DMDL"] = aInfo.dmdl;
                    t["MCL"] = aInfo.mcl;
                    t["MCL Notation"] = aInfo.mclNotation;
    
    
                    t["Units"] = pFAS6Combos533[0]["Units"];
                    t["CAS Number"] = aInfo.casNumber;
                    t["Numeric Result"] = "" + totalMainGroup;
                    t["Trace Results"] = ""; t["Text Results"] = ""; t["Combination Results"] = ""; t["Analyte MDL"] = "";
                    t["Result Notation"] = "="; t["Flag"] = ""; t["Remarks1"] = ""; t["Remarks2"] = ""; t["Remarks3"] = "";
                    t["Remarks4"] = ""; t["Remarks5"] = ""; t["Lab Sample Number"] = "";
    
                    t["Lab Analysis Code"] = analysisCode; // Confirm with Josh
                    t["Results"] = "" + totalMainGroup;
                    asiTableRowArray.push(t);
                    logInfo("Added pFAS6 combination 533 row. Total: " + totalMainGroup);
                }
                else {
                    pFAS6Combos533Row["Number Result"] = totalMainGroup;
                    pFAS6Combos533Row["Results"] = totalMainGroup;
                }
            }
        }
        */
        //2. PFAS6 537.1 TOTAL: add total pfa main group row 537.1
        //**************** Uncomment this section to addd the group row *******************************************
        /*logInfo("2. Found " + pFAS6Combos537.length + " pfas 537.1 main group rows to combine");
        if (pFAS6Combos537.length > 1) {
            var totalMainGroup537 = 0.0;
            for (var pIndex in pFAS6Combos537) {
                thisMain537 = pFAS6Combos537[pIndex];
                if (thisMain537["Analyte Name"] == "PFOS (Perfluorooctanesulfonic acid)" ||
                    thisMain537["Analyte Name"] == "PFOA (Perfluorooctanoic acid)" ||
                    thisMain537["Analyte Name"] == "PFHxS (Perfluorohexanesulfonic acid)" ||
                    thisMain537["Analyte Name"] == "PFHpA (Perfluoroheptanoic acid)" ||
                    thisMain537["Analyte Name"] == "PFNA (Perfluorononanoic acid)" ||
                    thisMain537["Analyte Name"] == "PFDA (Perfluorodecanoic acid)" ||
                    // Case sensitive list below
                    thisMain537["Analyte Name"] == "PFOS (Perfluorooctanesulfonic Acid)" ||
                    thisMain537["Analyte Name"] == "PFOA (Perfluorooctanoic Acid)" ||
                    thisMain537["Analyte Name"] == "PFHxS (Perfluorohexanesulfonic Acid)" ||
                    thisMain537["Analyte Name"] == "PFHpA (Perfluoroheptanoic Acid)" ||
                    thisMain537["Analyte Name"] == "PFNA (Perfluorononanoic Acid)" ||
                    thisMain537["Analyte Name"] == "PFDA (Perfluorodecanoic Acid)") {
                    logInfo("Adding " + thisMain537["Analyte Name"] + ", " + parseFloat(thisMain537["Numeric Result"]));
                    //totalMainGroup537 += parseFloat(thisMain["Numeric Result"]);
    
                    var floatMain537 = parseFloat(thisMain537["Numeric Result"]);
                    totalMainGroup537 += floatMain537;
                    totalMainGroup537 = parseFloat(totalMainGroup537);
                    logInfo("Adding " + thisMain537["Analyte Name"] + ", " + floatMain537);
                }
            }
    
            // add total main group row
            logInfo("Total PFA 537.1 main group is: " + totalMainGroup537);
            if (totalMainGroup537 > 0) {
                if (!pFAS6Combos537Found) {
                    var t = {};
                    t["Field Number"] = pFAS6Combos537[0]["Field Number"];
                    t["Analysis Date"] = pFAS6Combos537[0]["Analysis Date"];
                    t["Analysis Time"] = pFAS6Combos537[0]["Analysis Time"];
    
                    prettyName = GROUP_NAME_1;//MAIN_GROUP_TOTAL_537_1;
                    t["Lab Name"] = pFAS6Combos537[0]["Lab Name"];
                    analysisCode = pFAS6Combos537[0]["Lab Analysis Code"];
                    cMethod = getCertifiedMethod(analysisCode);
                    if (!cMethod) cMethod = "";
                    key = prettyName + "|" + cMethod;
                    t["Group Name"] = GROUP_NAME_1;//MAIN_GROUP_TOTAL_537_1;
                    t["Analyte & Method"] = key;
                    aInfo = getAnalyteObject(key);
                    if (aInfo && aInfo != "")
                        t["Analyte Information"] = aInfo.info;
                    t["Certified Method"] = cMethod;
                    t["C-Number"] = aInfo.casNumber;
                    t["Analyte Name"] = PFAS6_TOTAL_537_1;//prettyName;
                    t["DMDL Notation"] = aInfo.dmdlNotation;
                    t["DMDL"] = aInfo.dmdl;
                    t["MCL"] = aInfo.mcl;
                    t["MCL Notation"] = aInfo.mclNotation;
                    t["Units"] = pfaMainGroupCombos537[0]["Units"];
                    t["CAS Number"] = aInfo.casNumber;
                    t["Numeric Result"] = "" + totalMainGroup537;
                    t["Trace Results"] = ""; t["Text Results"] = ""; t["Combination Results"] = ""; t["Analyte MDL"] = "";
                    t["Result Notation"] = "="; t["Flag"] = ""; t["Remarks1"] = ""; t["Remarks2"] = ""; t["Remarks3"] = "";
                    t["Remarks4"] = ""; t["Remarks5"] = ""; t["Lab Sample Number"] = "";
    
                    t["Lab Analysis Code"] = analysisCode; // Confirm with Josh
                    t["Results"] = "" + totalMainGroup537;
                    asiTableRowArray.push(t);
                    logInfo("Added main group combination 537.1 main group row. Total: " + totalMainGroup537);
                }
                else {
                    pFAS6Combos537Row["Number Result"] = totalMainGroup537;
                    pFAS6Combos537Row["Results"] = totalMainGroup537;
                }
            }
        }
        */

        //3. Category 1 PAS TOTAL: add total prioritized subset of emerging pfa 533 group row
        //**************** Uncomment this section to addd the group row *******************************************
        /*logInfo("3. Found " + pfaCatogory1Combos533.length + " PFAS Category 1 prioritized subset group rows to combine");
        if (pfaCatogory1Combos533.length > 1) {
            var totalPrioritizedSubsetGroup533 = 0.0;
            for (var sIndex in pfaCatogory1Combos533) {
                thisPrior = pfaCatogory1Combos533[sIndex];
                if (thisPrior["Analyte Name"] == "PFHpS (Perfluoroheptanesulfonic acid)" ||               
                    thisPrior["Analyte Name"] == "PFDoA (Perfluorododecanoic acid)" ||                
                    thisPrior["Analyte Name"] == "PFUnA (Perfluoroundecanoic acid)" ||                
                    thisPrior["Analyte Name"] == "HFPO-DA/GenX (Hexafluoropropylene oxide dimer acid)" ||
                    thisPrior["Analyte Name"] == "11Cl-PF3OUdS (11-Chloroeicosafluoro-3-oxaundecane-1-sulfonic acid)" ||
                    thisPrior["Analyte Name"] == "9Cl-PF3ONS (9-Chlorohexadecafluoro-3-oxanonane-1-sulfonic acid)" ||
                    // case sensitive list
                    thisPrior["Analyte Name"] == "PFHpS (Perfluoroheptanesulfonic Acid)" ||
                    thisPrior["Analyte Name"] == "PFDoA (Perfluorododecanoic Acid)" ||
                    thisPrior["Analyte Name"] == "PFUnA (Perfluoroundecanoic Acid)") {
                    //totalPrioritizedSubsetGroup533 += parseFloat(thisPrior["Numeric Result"]);
    
                    var floatPrior533 = parseFloat(thisPrior["Numeric Result"]);
                    totalPrioritizedSubsetGroup533 += floatPrior533;
                    totalPrioritizedSubsetGroup533 = parseFloat(totalPrioritizedSubsetGroup533);
                    logInfo("Adding " + thisPrior["Analyte Name"] + ", " + floatPrior533);
                }
            }
            // add total total prioritized of emerging pfa group row
            logInfo("Total " + PFAS_CATEGORY_1_TOTAL_533 + " is: " + totalPrioritizedSubsetGroup533);
            if (totalPrioritizedSubsetGroup533 > 0) {
                if (!pfaCatogory1Combos533Found) {
                    var t = {};
                    t["Field Number"] = pfaCatogory1Combos533[0]["Field Number"];
                    t["Analysis Date"] = pfaCatogory1Combos533[0]["Analysis Date"];
                    t["Analysis Time"] = pfaCatogory1Combos533[0]["Analysis Time"];
                    t["Lab Name"] = pfaCatogory1Combos533[0]["Lab Name"];
                    prettyName = GROUP_NAME_1;//PRIORITIZED_SUBSET_TOTAL_533;
                    analysisCode = pfaCatogory1Combos533[0]["Lab Analysis Code"];
                    cMethod = getCertifiedMethod(analysisCode);
                    key = prettyName + "|" + cMethod;
                    t["Group Name"] = GROUP_NAME_1;//PRIORITIZED_SUBSET_TOTAL_533;
                    t["Analyte & Method"] = key;
                    aInfo = getAnalyteObject(key);
                    if (aInfo && aInfo != "")
                        t["Analyte Information"] = aInfo.info;
                    t["Certified Method"] = cMethod;
                    t["C-Number"] = aInfo.casNumber;
                    t["Analyte Name"] = PFAS_CATEGORY_1_TOTAL_533;//prettyName;
                    t["DMDL Notation"] = aInfo.dmdlNotation;
                    t["DMDL"] = aInfo.dmdl;
                    t["MCL"] = aInfo.mcl;
                    t["MCL Notation"] = aInfo.mclNotation;
                    t["Units"] = pfaCatogory1Combos533[0]["Units"];
                    t["CAS Number"] = aInfo.casNumber;
                    t["Numeric Result"] = "" + totalPrioritizedSubsetGroup533;
                    t["Trace Results"] = ""; t["Text Results"] = ""; t["Combination Results"] = ""; t["Analyte MDL"] = "";
                    t["Result Notation"] = "="; t["Flag"] = ""; t["Remarks1"] = ""; t["Remarks2"] = ""; t["Remarks3"] = "";
                    t["Remarks4"] = ""; t["Remarks5"] = ""; t["Lab Sample Number"] = "";
                    t["Lab Analysis Code"] = analysisCode; // Confirm with Josh
                    t["Results"] = "" + totalPrioritizedSubsetGroup533;
                    asiTableRowArray.push(t);
                    logInfo("Added main group combination main group row. Total: " + totalPrioritizedSubsetGroup533);
                }
                else {
                    pfaCatogory1Combos533["Number Result"] = totalPrioritizedSubsetGroup533;
                    pfaCatogory1Combos533["Results"] = totalPrioritizedSubsetGroup533;
                }
            }
        }
        */
        //**************** Uncomment this section to addd the group row *******************************************
        //4. Category 1 PFAS TOTAL: add total prioritized subset of emerging pfa 537.1 group row
        /* logInfo("4. Found " + pfaCatogory1Combos537.length + " PFAS Category 1 prioritized subset main group rows to combine");
        if (pfaCatogory1Combos537.length > 1) {
            var totalPrioritizedSubsetGroup537 = 0.0;
            for (var sIndex in pfaCatogory1Combos537)
            {
                thisPrior537 = pfaCatogory1Combos537[sIndex];
                if (thisPrior537["Analyte Name"] == "PFHpS (Perfluoroheptanesulfonic acid)" ||
                    thisPrior["Analyte Name"] == "PFUnA (Perfluoroundecanoic acid)" ||
                    thisPrior["Analyte Name"] == "PFDoA (Perfluorododecanoic acid)" ||
                    thisPrior["Analyte Name"] == "HFPO-DA/GenX (Hexafluoropropylene oxide dimer acid)" ||            
                    thisPrior["Analyte Name"] == "11Cl-PF3OUdS (11-Chloroeicosafluoro-3-oxaundecane-1-sulfonic acid)" ||
                    thisPrior["Analyte Name"] == "9Cl-PF3ONS (9-Chlorohexadecafluoro-3-oxanonane-1-sulfonic acid)" ||
                    // Case sensitive List below
                    thisPrior["Analyte Name"] == "PFHpS(Perfluoroheptanesulfonic Acid)" ||
                    thisPrior["Analyte Name"] == "PFUnA (Perfluoroundecanoic Acid)" ||
                    thisPrior["Analyte Name"] == "PFDoA (Perfluorododecanoic Acid)")
                    {
                        //totalPrioritizedSubsetGroup537 += parseFloat(thisPrior537["Numeric Result"]);
    
    
                        var floatPrior537 = parseFloat(thisPrior537["Numeric Result"]);
                        totalPrioritizedSubsetGroup537 += floatPrior537;
                        totalPrioritizedSubsetGroup537 = parseFloat(totalPrioritizedSubsetGroup537);
                        logInfo("Adding " + thisPrior["Analyte Name"] + ", " + floatPrior537);
                    }
                
            }
            // add total total prioritized of emerging pfa group row
            logInfo("Total " + PFAS_CATEGORY_1_TOTAL_537_1 + " is: " + totalPrioritizedSubsetGroup537);
            if (totalPrioritizedSubsetGroup537 > 0) {
                if (!pfaCatogory1Combos537Row) {
                    var t = {};
                    t["Field Number"] = pfaCatogory1Combos537[0]["Field Number"];
                    t["Analysis Date"] = pfaCatogory1Combos537[0]["Analysis Date"];
                    t["Analysis Time"] = pfaCatogory1Combos537[0]["Analysis Time"];
                    t["Lab Name"] = pfaCatogory1Combos537[0]["Lab Name"];
                    prettyName = GROUP_NAME_1;//PRIORITIZED_SUBSET_TOTAL_537_1;
                    analysisCode = pfaCatogory1Combos537[0]["Lab Analysis Code"];
                    cMethod = getCertifiedMethod(analysisCode);
                    key = prettyName + "|" + cMethod;
                    t["Group Name"] = GROUP_NAME_1;//PRIORITIZED_SUBSET_TOTAL_537_1;
                    t["Analyte & Method"] = key;
                    aInfo = getAnalyteObject(key);
                    if (aInfo && aInfo != "")
                        t["Analyte Information"] = aInfo.info;
                    t["Certified Method"] = cMethod;
                    t["C-Number"] = aInfo.casNumber;
                    t["Analyte Name"] = PFAS_CATEGORY_1_TOTAL_537_1;// prettyName;
                    t["DMDL Notation"] = aInfo.dmdlNotation;
                    t["DMDL"] = aInfo.dmdl;
                    t["MCL"] = aInfo.mcl;
                    t["MCL Notation"] = aInfo.mclNotation;
                    t["Units"] = pfaPriorSubsetCombos537[0]["Units"];
                    t["CAS Number"] = aInfo.casNumber;
                    t["Numeric Result"] = "" + totalPrioritizedSubsetGroup537;
                    t["Trace Results"] = ""; t["Text Results"] = ""; t["Combination Results"] = ""; t["Analyte MDL"] = "";
                    t["Result Notation"] = "="; t["Flag"] = ""; t["Remarks1"] = ""; t["Remarks2"] = ""; t["Remarks3"] = "";
                    t["Remarks4"] = ""; t["Remarks5"] = ""; t["Lab Sample Number"] = "";
                    t["Lab Analysis Code"] = analysisCode; // Confirm with Josh
                    t["Results"] = "" + totalPrioritizedSubsetGroup537;
                    asiTableRowArray.push(t);
                    logInfo("Added main group combination main group row. Total: " + totalPrioritizedSubsetGroup537);
                }
                else {
                    pfaCatogory1Combos537["Number Result"] = totalPrioritizedSubsetGroup537;
                    pfaCatogory1Combos537["Results"] = totalPrioritizedSubsetGroup537;
                }
            }
        }
        */
        //**************** Uncomment this section to addd the group row *******************************************
        //5. Category 2 PFAS TOTAL: add total remaining emerging pfa 533 group row
        /* logInfo("5. Found " + pfaCatogory2Combos533.length + " PFAS Category 2 group rows to combine");
        if (pfaCatogory2Combos533.length > 1) {
            var totalRemainingSubsetGroup533 = 0.0;
            for (var rIndex in pfaCatogory2Combos533) {
                thisRemain = pfaCatogory2Combos533[rIndex];
                if (thisRemain["Analyte Name"] == "PFBA (Perfluorobutanoic acid)" ||               
                    thisRemain["Analyte Name"] == "PFBS (Perfluorobutanesulfonic acid)" ||                
                    thisRemain["Analyte Name"] == "PFPeA (Perfluoropentanoic acid)" ||                
                    thisRemain["Analyte Name"] == "PFPeS (Perfluoropentanesulfonic acid)" ||                
                    thisRemain["Analyte Name"] == "PFHxA (Perfluorohexanoic acid)" ||                
                    thisRemain["Analyte Name"] == "ADONA (4,8-Dioxa-3H-perfluorononanoic acid)" ||                
                    thisRemain["Analyte Name"] == "4:2FTS (1H, 1H, 2H, 2H-Perfluorohexane sulfonic acid)" ||
                    thisRemain["Analyte Name"] == "6:2FTS (1H, 1H, 2H, 2H-Perfluorooctane sulfonic acid)" ||
                    thisRemain["Analyte Name"] == "8:2FTS (1H, 1H, 2H, 2H-Perfluorodecane sulfonic acid)" ||
                    thisRemain["Analyte Name"] == "NFDHA (Nonafluoro-3,6-dioxaheptanoic acid)" ||
                    thisRemain["Analyte Name"] == "PFEESA (Perfluoro(2-ethoxyethane)sulfonic acid)" ||                
                    thisRemain["Analyte Name"] == "PFMPA (Perfluoro-3-methoxypropanoic acid)" ||
                    thisRemain["Analyte Name"] == "PFMBA (Perfluoro-4-methoxypropanoic acid)") {
    
                    //totalRemainingSubsetGroup533 += parseFloat(thisRemain["Numeric Result"]);
    
    
                    var floatRemain533 = parseFloat(thisRemain["Numeric Result"]);
                    logInfo("Adding " + thisRemain["Analyte Name"] + ", " + floatRemain533);
                    //logInfo("floatRemain533 " + floatRemain533);
                    totalRemainingSubsetGroup533 += floatRemain533;
                    totalRemainingSubsetGroup533 = totalRemainingSubsetGroup533;
    
                }
    
            }
            // add total total prioritized of emerging pfa group row
            logInfo("Total " + PFAS_CATEGORY_2_TOTAL_533 + " 533 is: " + totalRemainingSubsetGroup533);
            if (totalRemainingSubsetGroup533 > 0) {
                if (!pfaCatogory2Combos533Found) {
                    var t = {};
                    t["Field Number"] = pfaCatogory2Combos533[0]["Field Number"];
                    t["Analysis Date"] = pfaCatogory2Combos533[0]["Analysis Date"];
                    t["Analysis Time"] = pfaCatogory2Combos533[0]["Analysis Time"];
                    t["Lab Name"] = pfaCatogory2Combos533[0]["Lab Name"];
                    prettyName = GROUP_NAME_1;//REMAINING_PFAS_TOTAL_533;
                    analysisCode = pfaCatogory2Combos533[0]["Lab Analysis Code"];
                    cMethod = getCertifiedMethod(analysisCode);
                    key = prettyName + "|" + cMethod;
                    t["Group Name"] = GROUP_NAME_1;//REMAINING_PFAS_TOTAL_533;
                    t["Analyte & Method"] = key;
                    aInfo = getAnalyteObject(key);
                    if (aInfo && aInfo != "")
                        t["Analyte Information"] = aInfo.info;
                    t["Certified Method"] = cMethod;
                    t["C-Number"] = aInfo.casNumber;
                    t["Analyte Name"] = PFAS_CATEGORY_2_TOTAL_533;//prettyName;
                    t["DMDL Notation"] = aInfo.dmdlNotation;
                    t["DMDL"] = aInfo.dmdl;
                    t["MCL"] = aInfo.mcl;
                    t["MCL Notation"] = aInfo.mclNotation;
                    t["Units"] = pfaCatogory2Combos533[0]["Units"];
                    t["CAS Number"] = aInfo.casNumber;
                    t["Numeric Result"] = "" + totalRemainingSubsetGroup533;
                    t["Trace Results"] = ""; t["Text Results"] = ""; t["Combination Results"] = ""; t["Analyte MDL"] = "";
                    t["Result Notation"] = "="; t["Flag"] = ""; t["Remarks1"] = ""; t["Remarks2"] = ""; t["Remarks3"] = "";
                    t["Remarks4"] = ""; t["Remarks5"] = ""; t["Lab Sample Number"] = "";
                    t["Lab Analysis Code"] = analysisCode; // Confirm with Josh
                    t["Results"] = "" + totalRemainingSubsetGroup533;
                    asiTableRowArray.push(t);
                    logInfo("Added main group combination main group row. Total: " + totalRemainingSubsetGroup533);
                }
                else {
                    pfaCatogory2Combos533["Number Result"] = totalRemainingSubsetGroup533;
                    pfaCatogory2Combos533["Results"] = totalRemainingSubsetGroup533;
                }
            }
        }
    
        //6. Remaining Emerging PFAS TOTAL: add total remaining PFAS Category 2 group row
        logInfo("6. Found " + pfaCatogory2Combos537.length + " PFAS Category 2 group rows to combine");
        if (pfaCatogory2Combos537.length > 1) {
            var totalRemainingSubsetGroup537 = 0.0;
            for (var rIndex in pfaCatogory2Combos537) {
                thisRemain537 = pfaCatogory2Combos537[rIndex];
    
                if (thisRemain537["Analyte Name"] == "PFBA (Perfluorobutanoic acid)" ||               
                    thisRemain537["Analyte Name"] == "PFBS (Perfluorobutanesulfonic acid)" ||               
                    thisRemain537["Analyte Name"] == "PFPeA (Perfluoropentanoic acid)" ||               
                    thisRemain537["Analyte Name"] == "PFPeS (Perfluoropentanesulfonic acid)" ||                
                    thisRemain537["Analyte Name"] == "PFHxA (Perfluorohexanoic acid)" ||                
                    thisRemain537["Analyte Name"] == "ADONA (4,8-Dioxa-3H-perfluorononanoic acid)" ||
                    thisRemain537["Analyte Name"] == "4:2FTS (1H, 1H, 2H, 2H-Perfluorohexane sulfonic acid)" ||
                    thisRemain537["Analyte Name"] == "6:2FTS (1H, 1H, 2H, 2H-Perfluorooctane sulfonic acid)" ||
                    thisRemain537["Analyte Name"] == "8:2FTS (1H, 1H, 2H, 2H-Perfluorodecane sulfonic acid)" ||
                    thisRemain537["Analyte Name"] == "NFDHA (Nonafluoro-3,6-dioxaheptanoic acid)" ||
                    thisRemain537["Analyte Name"] == "PFEESA (Perfluoro(2-ethoxyethane)sulfonic acid)" ||
                    thisRemain537["Analyte Name"] == "PFMBA (Perfluoro-4-methoxybutanoic acid)" ||
                    thisRemain537["Analyte Name"] == "PFMPA (Perfluoro-3-methoxypropanoic acid)") {
                    //totalRemainingSubsetGroup537 += parseFloat(thisRemain537["Numeric Result"]);
                    var floatRemain537 = parseFloat(thisRemain537["Numeric Result"]);
                    totalRemainingSubsetGroup537 += floatRemain537;
                    totalRemainingSubsetGroup537 = parseFloat(totalRemainingSubsetGroup537);
                }
    
            }
            // add total total prioritized of emerging pfa group row
            logInfo("Total " + PFAS_CATEGORY_2_TOTAL_537_1 + " 537.1 is: " + totalRemainingSubsetGroup537);
            if (totalRemainingSubsetGroup537 > 0) {
                if (!pfaCatogory2Combos537) {
                    var t = {};
                    t["Field Number"] = pfaCatogory2Combos537[0]["Field Number"];
                    t["Analysis Date"] = pfaCatogory2Combos537[0]["Analysis Date"];
                    t["Analysis Time"] = pfaCatogory2Combos537[0]["Analysis Time"];
                    t["Lab Name"] = pfaCatogory2Combos537[0]["Lab Name"];
                    prettyName = GROUP_NAME_1;//REMAINING_PFAS_TOTAL_537_1;
                    analysisCode = pfaCatogory2Combos537[0]["Lab Analysis Code"];
                    cMethod = getCertifiedMethod(analysisCode);
                    key = prettyName + "|" + cMethod;
                    t["Group Name"] = GROUP_NAME_1;//REMAINING_PFAS_TOTAL_537_1;
                    t["Analyte & Method"] = key;
                    aInfo = getAnalyteObject(key);
                    if (aInfo && aInfo != "")
                        t["Analyte Information"] = aInfo.info;
                    t["Certified Method"] = cMethod;
                    t["C-Number"] = aInfo.casNumber;
                    t["Analyte Name"] = PFAS_CATEGORY_2_TOTAL_537_1;//prettyName;
                    t["DMDL Notation"] = aInfo.dmdlNotation;
                    t["DMDL"] = aInfo.dmdl;
                    t["MCL"] = aInfo.mcl;
                    t["MCL Notation"] = aInfo.mclNotation;
                    t["Units"] = pfaCatogory2Combos537[0]["Units"];
                    t["CAS Number"] = aInfo.casNumber;
                    t["Numeric Result"] = "" + totalRemainingSubsetGroup537;
                    t["Trace Results"] = ""; t["Text Results"] = ""; t["Combination Results"] = ""; t["Analyte MDL"] = "";
                    t["Result Notation"] = "="; t["Flag"] = ""; t["Remarks1"] = ""; t["Remarks2"] = ""; t["Remarks3"] = "";
                    t["Remarks4"] = ""; t["Remarks5"] = ""; t["Lab Sample Number"] = "";
                    t["Lab Analysis Code"] = analysisCode; // Confirm with Josh
                    t["Results"] = "" + totalRemainingSubsetGroup537;
                    asiTableRowArray.push(t);
                    logInfo("Added main group combination main group row. Total: " + totalRemainingSubsetGroup537);
                }
                else {
                    pfaCatogory2Combos537["Number Result"] = totalRemainingSubsetGroup537;
                    pfaCatogory2Combos537["Results"] = totalRemainingSubsetGroup537;
                }
            }
        }
        */
      
    
    
    //**********************************
    //EHIMS-5265
    //************        

    
    logInfo("Found " + hazardIndexCombos.length + " PFAS hazard index rows to combine");
    
    if (hazardIndexCombos.length > 1)
    {
        var totalHazardIndex = 0.0;
        for (var mIndex in hazardIndexCombos) {
            thisHazardIndex = hazardIndexCombos[mIndex];
            logInfo("Analyte name: " + thisHazardIndex["Analyte Name"]);
            logInfo("Result Notation: " + thisHazardIndex["Result Notation"]);

            if (thisHazardIndex["Analyte Name"] == "HFPO-DA/GenX (Hexafluoropropylene oxide dimer acid)") {
                var floatHFPO = parseFloat(thisHazardIndex["Numeric Result"]);
                logInfo("A. floatHFPO: " + floatHFPO);
                
                if (thisHazardIndex["Result Notation"] == "<") {
                    logInfo("A. Result notation is <. Set as 0.");
                    floatHFPO = 0;
                }
                else if (thisHazardIndex["Result Notation"] == "=")
                {
                    if (floatHFPO < 5) {
                        floatHFPO = 0;
                        logInfo("B. Result notation is = and less than 5. Set as 0.");
                    }
                    else {
                        logInfo("A. HFPO - DA / GenX(Hexafluoropropylene oxide dimer acid) is < and >= 5: Divide " + floatHFPO + " by 10 is: ");  
                        floatHFPO = floatHFPO / 10;
                        logInfo("A. Calculated: " + floatHFPO);
                    }
                }
                else {
                    floatHFPO = floatHFPO / 10;
                    logInfo("A. HFPO - DA / GenX(Hexafluoropropylene oxide dimer acid) divide by 10: " + floatHFPO);
                }
                logInfo("Original totalHardIndex: " + totalHazardIndex + ". Adding " + floatHFPO);
                totalHazardIndex += floatHFPO;
                logInfo("A. Total sum totalHazardIndex: " + totalHazardIndex);
            }
            if (thisHazardIndex["Analyte Name"] == "PFBS (Perfluorobutanesulfonic acid)") {
                var floatPFBS = parseFloat(thisHazardIndex["Numeric Result"]);
                logInfo("B. floatPFBS: " + floatPFBS);
                if (thisHazardIndex["Result Notation"] == "<")
                {
                    logInfo("B. Result notation is <. Set as 0.");
                    floatPFBS = 0;
                }
                else if (thisHazardIndex["Result Notation"] == "=") {
                    if (floatPFBS <3) {
                        floatPFBS = 0;
                        logInfo("B. Result notation is = and less than 3. Set as 0.");
                    }
                    else {

                        logInfo("B. PFBS (Perfluorobutanesulfonic acid) is < and >= 3: Divide " + floatPFBS + " by 2000 is: ");
                        floatPFBS = floatPFBS / 2000;
                        logInfo("B. Calculated: " + floatPFBS);
                    }
                }
                else {
                    floatPFBS = floatPFBS / 2000;
                    logInfo("B. PFBS (Perfluorobutanesulfonic acid) divides by 2000: " + floatPFBS);
                }
                logInfo("B. PFBS (Perfluorobutanesulfonic acid): " + floatPFBS);
                logInfo("Original totalHardIndex: " + totalHazardIndex + ". Adding " + floatPFBS);
                totalHazardIndex += floatPFBS;
                logInfo("B. totalHazardIndex: " + totalHazardIndex);
            }
            if (thisHazardIndex["Analyte Name"] == "PFNA (Perfluorononanoic acid)") {
                var floatPFNA = parseFloat(thisHazardIndex["Numeric Result"]);
                logInfo("C. floatPFNA: " + floatPFNA);

                if (thisHazardIndex["Result Notation"] == "<") {
                    floatPFNA = 0;
                    logInfo("C. Result notation is <. Set as 0.");
                }
                else if (thisHazardIndex["Result Notation"] == "=") {
                    if (floatPFNA < 4) {
                        floatPFNA = 0;
                        logInfo("C. Result notation is =. Set as 0.");
                    }
                    else {
                        logInfo("C. PFNA (Perfluorononanoic acid) is < and >= 4: Divide " + floatPFNA + " by 10 is ");
                        floatPFNA = floatPFNA / 10;
                        logInfo("Calculated: " + floatPFNA);
                    }
                }
                else {
                    floatPFNA = floatPFNA / 10
                    logInfo("C.  PFNA (Perfluorononanoic acid) divides by 10: " + floatPFNA);
                }
                logInfo("C. PFNA (Perfluorononanoic acid): " + floatPFNA);
                logInfo("Original totalHardIndex: " + totalHazardIndex + ". Adding " + floatPFNA);
                totalHazardIndex += floatPFNA;
                logInfo("C. totalHazardIndex: " + totalHazardIndex);
            }
            if (thisHazardIndex["Analyte Name"] == "PFHxS (Perfluorohexanesulfonic acid)") {

                var floatPFHxS = parseFloat(thisHazardIndex["Numeric Result"]);
                logInfo("D. floatPFHxS: " + floatPFHxS);

                if (thisHazardIndex["Result Notation"] == "<") {
                    floatPFHxS = 0;
                    logInfo("D. Result notation is <. Set as 0.");
                }
                else if (thisHazardIndex["Result Notation"] == "=") {
                    if (floatPFHxS < 3) {
                        floatPFHxS = 0;
                        logInfo("D. Result notation is = and less than 3. Set as 0.");
                    }
                    else {
                        logInfo("D. PFHxS (Perfluorohexanesulfonic acid) is < and >= 3: Divide " + floatPFHxS + " by 10 ");
                        floatPFHxS = floatPFHxS / 10;
                        logInfo("Calculated: " + floatPFHxS);
                    }
                }
                else {
                    floatPFHxS = floatPFHxS / 10
                    logInfo("D. PFHxS (Perfluorohexanesulfonic acid) divides by 10: " + floatPFHxS);
                }
                logInfo("D. PFHxS (Perfluorohexanesulfonic acid): " + floatPFHxS);
                logInfo("Original totalHardIndex: " + totalHazardIndex + ". Adding " + floatPFHxS);
                totalHazardIndex += floatPFHxS;
                logInfo("D. totalHazardIndex: " + totalHazardIndex);
            }
            
        }

        // add total hazard index row
        logInfo("Found " + hazardIndexCombos.length + " hazard rows to combine");
        if (hazardIndexCombos.length > 1)
        {
            if (!hazardIndexFound) {
                var t = {};
                t["Field Number"] = hazardIndexCombos[0]["Field Number"];
                t["Analysis Date"] = hazardIndexCombos[0]["Analysis Date"];
                t["Analysis Time"] = hazardIndexCombos[0]["Analysis Time"];
                t["Lab Name"] = LAB_NAME;
                prettyName = "PFAS Hazard Index";
                analysisCode = hazardIndexCombos[0]["Lab Analysis Code"];
                cMethod = getCertifiedMethod(analysisCode);
                key = prettyName + "|" + cMethod;
                t["Group Name"] = hazardIndexCombos[0]["Group Name"];
                t["Analyte & Method"] = key;
                aInfo = getAnalyteObject(key);
                if (aInfo && aInfo != "")
                    t["Analyte Information"] = aInfo.info;
                t["Certified Method"] = cMethod;
                t["C-Number"] = aInfo.casNumber;
                t["Analyte Name"] = prettyName;
                t["DMDL Notation"] = aInfo.dmdlNotation;
                t["DMDL"] = aInfo.dmdl;
                t["MCL"] = aInfo.mcl;
                t["MCL Notation"] = aInfo.mclNotation;
                t["Units"] = "ng/L";
                t["CAS Number"] = aInfo.casNumber;
                var totalHizardIndex2Sig = parseFloat(totalHazardIndex).toPrecision(2);
                logInfo("Total Numeric Result: " + totalHizardIndex2Sig.toString());
                if (totalHizardIndex2Sig < 0.1) {
                    logInfo("Total Hazard Index is less than 0.1. Set result notation to < and numeric result to 0.1");
                    t["Result Notation"] = "<";
                    t["Numeric Result"] = "0.1";
                    t["Results"] = "0.1";
                }
                else {
                    t["Result Notation"] = "=";
                    t["Numeric Result"] = "" + totalHizardIndex2Sig;
                    t["Results"] = "" + totalHizardIndex2Sig;
                }
               
                t["Trace Results"] = ""; t["Text Results"] = ""; t["Combination Results"] = ""; t["Analyte MDL"] = "0.1";
               
                t["Flag"] = getFlagValue("=", doNullTranslation("NUMBER", totalHazardIndex), aInfo.mcl);
                t["Remarks1"] = ""; t["Remarks2"] = ""; t["Remarks3"] = "";
                t["Remarks4"] = ""; t["Remarks5"] = ""; t["Lab Sample Number"] = "";
                t["Lab Analysis Code"] = hazardIndexCombos[0]["Lab Analysis Code"];
                

                asiTableRowArray.push(t);
                logInfo("TotalHzardIndex Total: " + totalHazardIndex);
                logInfo("Numeric Result after 2 significant figures: " + t["Numeric Result"]);
                logInfo("Flag: " + t["Flag"]);
                logInfo("cMethod: " + cMethod);
                logInfo("prettyName: " + prettyName);
                logInfo("Added PFAS Hazard Index row");
            }
            else {
                hazardIndexRow["Numeric Results"] = "" + totalHazardIndex;
                hazardIndexRow["Results"] = "" + totalHazardIndex;
            }
        }
    }
  
    logInfo("Found " + metalCombos.length + " metal rows to combine");
    if (metalCombos.length > 1) {
        var totalMetals = 0.0;
        for (var mIndex in metalCombos) {
            thisMetal = metalCombos[mIndex];
            if (thisMetal["Analyte Name"] == "Iron (Fe)") {
                var floatIron = parseFloat(thisMetal["Numeric Result"]);
                var threeFixedFe = parseFloat(floatIron).toFixed(3);
                var floatThreeFixedFe = parseFloat(threeFixedFe);
                totalMetals += floatThreeFixedFe;
            }
            if (thisMetal["Analyte Name"] == "Manganese (Mn)") {
                var floatMn = parseFloat(thisMetal["Numeric Result"]) / 1000;
                var threeFixedMn = parseFloat(floatMn).toFixed(3);
                var floatThreeFixedMn = parseFloat(threeFixedMn);
                totalMetals += floatThreeFixedMn;
            }
        }
        // add total metal row
        if (totalMetals > 0) {
            if (!metalComboFound) {
                var t = {};
                t["Field Number"] = metalCombos[0]["Field Number"];
                t["Analysis Date"] = metalCombos[0]["Analysis Date"];
                t["Analysis Time"] = metalCombos[0]["Analysis Time"];
                t["Lab Name"] = LAB_NAME;
                prettyName = "Iron + Manganese (Combined, Calc)";
                cMethod = "EPA 200.8";
                key = prettyName + "|" + cMethod;
                t["Group Name"] = "METALS";
                t["Analyte & Method"] = key;
                aInfo = getAnalyteObject(key);
                if (aInfo && aInfo != "")
                    t["Analyte Information"] = aInfo.info;
                t["Certified Method"] = cMethod;
                t["C-Number"] = aInfo.casNumber;
                t["Analyte Name"] = prettyName;
                t["DMDL Notation"] = aInfo.dmdlNotation;
                t["DMDL"] = aInfo.dmdl;
                t["MCL"] = aInfo.mcl;
                t["MCL Notation"] = aInfo.mclNotation;
                t["Units"] = "mg/L";
                t["CAS Number"] = aInfo.casNumber;
                t["Numeric Result"] = "" + totalMetals;
                t["Trace Results"] = ""; t["Text Results"] = ""; t["Combination Results"] = ""; t["Analyte MDL"] = "";
                t["Result Notation"] = "=";
                t["Flag"] = getFlagValue("=", doNullTranslation("NUMBER", totalMetals), aInfo.mcl);
                t["Remarks1"] = ""; t["Remarks2"] = ""; t["Remarks3"] = "";
                t["Remarks4"] = ""; t["Remarks5"] = ""; t["Lab Sample Number"] = "";
                t["Lab Analysis Code"] = "$DWICP";
                t["Results"] = "" + totalMetals;
                // Ada: What if it doesn't exist, add
                asiTableRowArray.push(t);
                logInfo("Added combination metal row");
            }
            else {
                metalComboRow["Numeric Results"] = "" + totalMetals;
                metalComboRow["Results"] = "" + totalMetals;
            }
        }
    }
    logInfo("Found " + aldiCombos.length + " aldi rows to combine");
    if (aldiCombos.length > 1) {
        var totalAldis = 0.0;
        for (var aIndex in aldiCombos) {
            thisAldi = aldiCombos[aIndex];

            if (thisAldi["Analyte Name"] == "Aldicarb") {
                totalAldis += parseFloat(thisAldi["Numeric Result"]);
            }
            if (thisAldi["Analyte Name"] == "Aldicarb-Sulfone") {
                totalAldis += parseFloat(thisAldi["Numeric Result"]);
            }
            if (thisAldi["Analyte Name"] == "Aldicarb-Sulfoxide") {
                totalAldis += parseFloat(thisAldi["Numeric Result"]);
            }
            logInfo("Adding  " + parseFloat(thisAldi["Numeric Result"]) + " from " + thisAldi["Analyte Name"] + ". Total: " + totalAldis);
        }
        logInfo("Total Aldi comb values: " + totalAldis);

        // Append total aldi row
        logInfo("Aldicombo found? " + aldiComboFound);
        // If there is total, add the combination row
        if (totalAldis > 0) {
            if (!aldiComboFound) {
                var t = {};
                t["Field Number"] = aldiCombos[0]["Field Number"];
                t["Analysis Date"] = aldiCombos[0]["Analysis Date"];
                t["Analysis Time"] = aldiCombos[0]["Analysis Time"];
                t["Lab Name"] = LAB_NAME;;
                prettyName = "Total Aldicarb (calc)";
                cMethod = "SM 21 6610B";
                key = prettyName + "|" + cMethod;
                t["Group Name"] = "ALDICARB PESTICIDES";
                t["Analyte & Method"] = key;
                aInfo = getAnalyteObject(key);
                if (aInfo && aInfo != "")
                    t["Analyte Information"] = aInfo.info;
                t["Certified Method"] = cMethod;
                t["C-Number"] = aInfo.casNumber;
                t["Analyte Name"] = prettyName;
                t["DMDL Notation"] = aInfo.dmdlNotation;
                t["DMDL"] = aInfo.dmdl;
                t["MCL"] = aInfo.mcl;
                t["MCL Notation"] = aInfo.mclNotation;
                t["Units"] = "";
                t["CAS Number"] = aInfo.casNumber;
                t["Numeric Result"] = "" + totalAldis;
                t["Trace Results"] = ""; t["Text Results"] = ""; t["Combination Results"] = ""; t["Analyte MDL"] = "";
                t["Result Notation"] = "="; t["Flag"] = ""; t["Remarks1"] = ""; t["Remarks2"] = ""; t["Remarks3"] = "";
                t["Remarks4"] = ""; t["Remarks5"] = ""; t["Lab Sample Number"] = "";
                t["Lab Analysis Code"] = "$TEMIK";
                t["Results"] = "" + totalAldis;
                asiTableRowArray.push(t);
                logInfo("Added combination aldi row");
            }
            else {
                logInfo("This is the combo row. Set Aldicombo row number result and result to: " + totalAldis);
                aldiComboRow["Number Result"] = totalAldis;
                aldiComboRow["Results"] = totalAldis;
                logInfo("This is the length: " + aldiComboRow.length);
            }
        }
    }
    logInfo("Found " + svocCombos.length + " svoc rows to combine");
    if (svocCombos.length > 1) {
        var totalSvocs = 0.0
        for (var sIndex in svocCombos) {
            thisSvoc = svocCombos[sIndex];
            if (thisSvoc["Analyte Name"] == "Simazine")
                totalSvocs += parseFloat(thisSvoc["Numeric Result"]);
            if (thisSvoc["Analyte Name"] == "Atrazine")
                totalSvocs += parseFloat(thisSvoc["Numeric Result"]);
        }
        // add total svoc row
        if (totalSvocs > 0) {
            if (!svocComboFound) {
                var t = {};
                t["Field Number"] = svocCombos[0]["Field Number"];
                t["Analysis Date"] = svocCombos[0]["Analysis Date"];
                t["Analysis Time"] = svocCombos[0]["Analysis Time"];
                t["Lab Name"] = LAB_NAME;;
                prettyName = "Total Triazines + Metabolites (Calc)";
                cMethod = "EPA 525.2";
                key = prettyName + "|" + cMethod;
                t["Group Name"] = "SEMI-VOLATILE ORGANICS METHOD 525";
                t["Analyte & Method"] = key;
                aInfo = getAnalyteObject(key);
                if (aInfo && aInfo != "")
                    t["Analyte Information"] = aInfo.info;
                t["Certified Method"] = cMethod;
                t["C-Number"] = aInfo.casNumber;
                t["Analyte Name"] = prettyName;
                t["DMDL Notation"] = aInfo.dmdlNotation;
                t["DMDL"] = aInfo.dmdl;
                t["MCL"] = aInfo.mcl;
                t["MCL Notation"] = aInfo.mclNotation;
                t["Units"] = "";
                t["CAS Number"] = aInfo.casNumber;
                t["Numeric Result"] = "" + totalSvocs;
                t["Trace Results"] = ""; t["Text Results"] = ""; t["Combination Results"] = ""; t["Analyte MDL"] = "";
                t["Result Notation"] = "=";
                t["Flag"] = ""; t["Remarks1"] = ""; t["Remarks2"] = ""; t["Remarks3"] = "";
                t["Remarks4"] = ""; t["Remarks5"] = ""; t["Lab Sample Number"] = "";
                t["Lab Analysis Code"] = "$NVOC";
                t["Results"] = "" + totalSvocs;
                asiTableRowArray.push(t);
                logInfo("Added combination svoc row");
            }
            else {
                svocComboRow["Numeric Result"] = "" + totalSvocs;
                svocComboRow["Results"] = "" + totalSvocs;
            }
        }
    }

    if (!metalComboFound && !aldiComboFound && !svocComboFound && !pFAS6Combos533Found && !pFAS6Combos537Found && !pfaCatogory1Combos533Found && !pfaCatogory1Combos537Found
        && !pfaCatogory2Combos533Found && !pfaCatogory2Combos537Found && !hazardIndexFound) {

        logInfo("One of the combo has been found. Add combo row to the table");
        logInfo("asiTableRowArray length: " + asiTableRowArray.length);
        if (asiTableRowArray.length > 0)
            addToASITableLOCAL("SAMPLE RESULTS", asiTableRowArray, resId);
    }
    else {

        logInfo("Data table - originalTable : " + originalTable.length);
        logInfo("aldiComboFound? " + aldiComboFound);
        removeASITable("SAMPLE RESULTS", resId);

        if (metalComboFound)
            originalTable.push(metalComboRow);
        if (aldiComboFound) {
            logInfo("Push aldiComboRow to original table.");
            logInfo("Combo Length is: " + aldiComboRow.length);
            originalTable.push(aldiComboRow);
        }
        if (hazardIndexFound) {
            logInfo("Push hazardIndexRow to original table.");
            originalTable.push(hazardIndexRow);
        }
        if (svocComboFound)
            originalTable.push(svocComboRow);
        if (pFAS6Combos533Found)
            originalTable.push(pFAS6Combos533Row);
        if (pFAS6Combos537Found)
            originalTable.push(pFAS6Combos537Row);
        if (pfaCatogory1Combos533Found)
            originalTable.push(pfaCatogory1Combos533Row);
        if (pfaCatogory1Combos537Found)
            originalTable.push(pfaCatogory1Combos537Row);
        if (pfaCatogory2Combos533Found)
            originalTable.push(pfaCatogory2Combos533Row);
        if (pfaCatogory2Combos537Found)
            originalTable.push(pfaCatogory2Combos537Row);
        addASITable("SAMPLE RESULTS", originalTable, resId);

    }

}

function getGroupNameValue(key) {
    var drillDownSeriesInfo = getDrillDownSeries(sDrillDownSeriesStmt, "Group Name", "Analyte & Method");
    return getGroupName(drillDownSeriesInfo, sParentValueStmt, key);
}

function getGroupName(drillDownInfo, sStmt, am) {
    sStmt.setString(1, am);
    sStmt.setInt(2, drillDownInfo.seriesID)
    var rSet = sStmt.executeQuery();
    while (rSet.next()) {
        parentValue = rSet.getString("PARENT_VALUE");
        return parentValue;
    }
    return "";
}

function getResultNotation(textResults) {
    if (textResults) {
        logInfo("textResult:" + textResults);
        if (textResults.equals("Trace") || textResults.equals("Present < MDL") || textResults.equals("Not detected") || textResults.equals("<1 or <MRL or <(anything)") ||
            textResults.equals("Below Det Lim") || textResults.equals("Less than") || textResults.equals("Less than MRL")) {
            return "<";
        }
        else if (textResults.equals("> 16,000")) {
            return ">";
        }
        else if (textResults.equals("CONC") || textResults.equals("1.4+/-0.1")) {
            return "=";
        }
        else if (textResults.equals("P (positive / present)") || textResults.equals("~17 or ~(anything)")) {
            return "Present";
        }
        else if (textResults.equals("N (negative)")) {
            return "Absent";
        }
        else {
            return "";
        }
    }
    return "";

}


function getFlagValue(textResult, numRes, mcl) {

    //  if (textResult && (textResult.equals("Present < MDL") || textResult.equals("P (positive / present)")) ||
    if (numRes && mcl && parseFloat(numRes) > parseFloat(mcl)) {
        return "*";
    }
    return "";

}

function doNullTranslation(outputType, input) {
    if (input == "-0-") {
        if (outputType == "NUMBER")
            return "0";
        else
            return "";
    }
    else return input;
}

function getPrettyName(input) {
    translated_value = lookupLOCAL("DEQ_ANALYTENAME_TO_PRETTYNAME", input);
    if (translated_value && translated_value != "" && translated_value != "null" && translated_value != "undefined")
        return translated_value;
    else
        return input;
}

function getCertifiedMethod(aCode) {
    translated_value = lookupLOCAL("DEQ_LABCODE_TO_METHOD", aCode);
    if (translated_value && translated_value != "" && translated_value != "null" && translated_value != "undefined")
        return translated_value;
    else
        return aCode;
}
function doTextResultTranslation(input) {
    if (input.indexOf("+/-") > 0) return "CONC";
    translated_value = lookupLOCAL("DEQ_TEXT_RESULTS", input);
    if (translated_value && translated_value != "" && translated_value != "null" && translated_value != "undefined")
        return translated_value;
    else
        return input;
}

function doUnitTranslation(input) {
    translated_value = lookupLOCAL("DEQ_UNITS", input);
    if (translated_value && translated_value != "" && translated_value != "null" && translated_value != "undefined")
        return translated_value;
    else
        return input;
}

function getAnalyteObject(am) {
    var obj = {};
    obj.casNumber = '';
    obj.info = '';
    obj.analyte = '';
    obj.dmdlNotation = '';
    obj.dmdl = '';
    obj.mcl = '';
    obj.mclNotation = '';
    obj.defaultUnits = '';

    try {
       
        drillDownSeriesInfo = getDrillDownSeries(sDrillDownSeriesStmt, "Analyte & Method", "Analyte Information");
        logInfo("drillDownSeriesInfo: " + drillDownSeriesInfo)
        logInfo("am: " + am)
        logInfo("sChildValueStmt: " + sChildValueStmt)
        infoString = "" + getAInfo(drillDownSeriesInfo, sChildValueStmt, am);
        obj.info = infoString;
        logInfo("InfoString: " + infoString);
      
        infoPieces = infoString.split("|");
        logInfo("obj.mcl : " + obj.mcl);
        if (infoPieces.length > 0)
            obj.dmdlNotation = infoPieces[1];
        if (infoPieces.length > 1)
            obj.dmdl = infoPieces[2];
        if (infoPieces.length > 2)
            obj.mcl = infoPieces[3];
        if (infoPieces.length > 3)
            obj.mclNotation = infoPieces[4];
        if (infoPieces.length > 4)
            obj.defaultUnits = infoPieces[5];
        if (infoPieces.length >= 5)
            obj.casNumber = infoPieces[6];

    }
    catch (err) {
        logError("Exception getting analyte info " + err);
    }

    return obj;
}
function getAInfo(drillDownInfo, sStmt, am) {
   
    logInfo("am: " + am);
    sStmt.setString(1, am);
    sStmt.setInt(2, drillDownInfo.seriesID)
    logInfo("drillDownInfo.seriesID: " + drillDownInfo.seriesID);
    var rSet = sStmt.executeQuery();
    logInfo("rSet: " + rSet);
    while (rSet.next()) {
        parentValue = rSet.getString("CHILD_VALUE");
        logInfo("parentValue: " + parentValue);
        return parentValue;
    }
    return null
}
function drillDownInfo() {
    seriesID = null;
    parentListID = null;
    childListID = null;
}

function getDrillDownSeries(sStmt, parentColName, childColName) {
    sStmt.setString(1, parentColName);
    sStmt.setString(2, childColName);
    var rSet = sStmt.executeQuery();
    newDDInfo = new drillDownInfo();
    while (rSet.next()) {
        newDDInfo.seriesID = rSet.getInt("DRLLD_SERIES_ID");
        newDDInfo.parentListID = rSet.getInt("PARENT_DDLIST_ID");
        newDDInfo.childListID = rSet.getInt("CHILD_DDLIST_ID");
        logInfo("newDDInfo.seriesID:" + newDDInfo.seriesID);
        logInfo("newDDInfo.parentListID:" + newDDInfo.parentListID);
        logInfo("newDDInfo.childListID:" + newDDInfo.childListID);
        return newDDInfo;
    }
    return null;
}
function createChild4LIMS(grp, typ, stype, cat, desc, itemCap) // optional parent capId
{
    //
    // creates the new application and returns the capID object
    //	
    var appCreateResult = aa.cap.createApp(grp, typ, stype, cat, desc);
    logInfo("creating cap " + grp + "/" + typ + "/" + stype + "/" + cat);
    if (appCreateResult.getSuccess()) {
        var newId = appCreateResult.getOutput();
        logInfo("cap " + grp + "/" + typ + "/" + stype + "/" + cat + " created successfully ");

        // create Detail Record
        capModel = aa.cap.newCapScriptModel().getOutput();
        capDetailModel = capModel.getCapModel().getCapDetailModel();
        capDetailModel.setCapID(newId);
        aa.cap.createCapDetail(capDetailModel);

        var newObj = aa.cap.getCap(newId).getOutput();	//Cap object
        var result = aa.cap.createAppHierarchy(itemCap, newId);
        if (result.getSuccess())
            logInfo("Child application successfully linked");
        else
            logWarning("Could not link applications");

        return newId;
    }
    else {
        logDebug("**ERROR: adding child App: " + appCreateResult.getErrorMessage());
    }
}


function getAppIdByASILOCAL(ASIName, ASIValue, ats)
//
// returns the cap Id string of an application based on App-Specific Info and applicationtype.  Returns first result only!
//
{
    var ata = ats.split("/");
    if (ata.length != 4)
        logError("**ERROR: getAppIdByASI in appMatch.  The following Application Type String is incorrectly formatted: " + ats);

    var getCapResult = aa.cap.getCapIDsByAppSpecificInfoField(ASIName, ASIValue);
    if (getCapResult.getSuccess())
        var apsArray = getCapResult.getOutput();
    else { logError("**ERROR: getting caps by app type: " + getCapResult.getErrorMessage()); return null }


    for (aps in apsArray) {
        myCap = aa.cap.getCap(apsArray[aps].getCapID()).getOutput();
        myAppTypeString = myCap.getCapType().toString();
        myAppTypeArray = myAppTypeString.split("/");

        isMatch = true;
        for (xx in ata)
            if (!ata[xx].equals(myAppTypeArray[xx]) && !ata[xx].equals("*"))
                isMatch = false;

        if (isMatch) {
            //   logDebug("getAppIdByName(" + ASIName + "," + ASIValue + "," + ats + ") Returns " + apsArray[aps].getCapID().toString());
            return apsArray[aps].getCapID();
        }
    }
}


/**
 * database object
 * var x = new db();
 */
function db() {
    this.version = function () {
        return 1.0;
    }

    /**
     * Executes a sql statement and returns rows as dataset
     * @param {string} sql 
     * @param {integer} maxRows 
     * @return {string[]}
     */
    this.dbDataSet = function (sql, maxRows) {
        var dataSet = new Array();
        if (maxRows == null) {
            maxRows = 100;
        }
        try {
            var conn = aa.db.getConnection();
            var sStmt = conn.prepareStatement(sql);
            sStmt.setMaxRows(maxRows);
            var rSet = sStmt.executeQuery();
            while (rSet.next()) {
                var row = new Object();
                var maxCols = sStmt.getMetaData().getColumnCount();
                for (var i = 1; i <= maxCols; i++) {
                    row[sStmt.getMetaData().getColumnName(i)] = rSet.getString(i);
                }
                dataSet.push(row);
            }
            rSet.close();
            conn.close();
        }
        catch (err) {
            throw ("dbDataSet: " + err);
        }
        return dataSet;
    }

    /**
     * Executes a sql statement and returns nothing
     * @param {string} sql 
     */
    this.dbExecute = function (sql) {
        try {
            var conn = aa.db.getConnection();
            var sStmt = conn.prepareStatement(sql);
            sStmt.setMaxRows(1);
            var rSet = sStmt.executeQuery();
            rSet.close();
            conn.close();
        }
        catch (err) {
            throw ("deExecute: " + err);
        }
    }

    /**
     * Returns first row first column of execute statement
     * @param {string} sql
     * @returns {object}  
     */
    this.dbScalarExecute = function (sql) {
        var out = null;
        try {
            var conn = aa.db.getConnection();
            var sStmt = conn.prepareStatement(sql);
            sStmt.setMaxRows(1);
            var rSet = sStmt.executeQuery();

            if (rSet.next()) {
                out = rSet.getString(1);
            }
            rSet.close();
            conn.close();
        }
        catch (err) {
            throw ("dbScalarValue: " + err);
        }
        return out;
    }
    return this;
}


function addToASITableLOCAL(tableName, tableValueArray) // optional capId
{
    //  tableName is the name of the ASI table
    //  tableValues is an associative array of values.  All elements must be either a string or asiTableVal object
    itemCap = capId
    if (arguments.length > 2)
        itemCap = arguments[2]; // use cap ID specified in args
    var tssmResult = aa.appSpecificTableScript.getAppSpecificTableModel(itemCap, tableName)

    if (!tssmResult.getSuccess()) {
        logError("Error : error retrieving app specific table " + tableName + " " + tssmResult.getErrorMessage());
        return false
    }

    var tssm = tssmResult.getOutput();
    var tsm = tssm.getAppSpecificTableModel();
    var fld = tsm.getTableField();
    var fld_readonly = tsm.getReadonlyField(); //get ReadOnly property

    for (thisRow in tableValueArray) {
        var col = tsm.getColumns();
        var coli = col.iterator();

        while (coli.hasNext()) {
            colname = coli.next();
            if (!tableValueArray[thisRow][colname.getColumnName()]) {
                tableValueArray[thisRow][colname.getColumnName()] = "";
            }
            if (typeof (tableValueArray[thisRow][colname.getColumnName()].fieldValue) != "undefined") // we are passed an asiTablVal Obj
            {
                fld.add(tableValueArray[thisRow][colname.getColumnName()].fieldValue);
                fld_readonly.add(tableValueArray[thisRow][colname.getColumnName()].readOnly);
                //fld_readonly.add(null);
            } else // we are passed a string
            {
                fld.add(tableValueArray[thisRow][colname.getColumnName()]);
                fld_readonly.add(null);
            }
        }
    }

    tsm.setTableField(fld);
    tsm.setReadonlyField(fld_readonly); // set readonly field

    addResult = aa.appSpecificTableScript.editAppSpecificTableInfos(tsm, itemCap, currentUserID);
    if (!addResult.getSuccess()) {
        logError("ERROR adding record to ASI Table:  " + tableName + " " + addResult.getErrorMessage());
        return false
    }
    else
        logInfo("Successfully added record to ASI Table: " + tableName);
}


function lookupLOCAL(stdChoice, stdValue) {
    var strControl;
    var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice, stdValue);

    if (bizDomScriptResult.getSuccess()) {
        var bizDomScriptObj = bizDomScriptResult.getOutput();
        strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
    }

    return strControl;
}



function arrayToString(arr) {
    return "[" + (arr ? arr.join("|") : "") + "]";
}
// returns the result as proper JSON structure when called by construct API
function buildResultStructure(value) {
    if (value) {
        if (Object.prototype.toString.call(value) == "[object Object]") {
            value = buildObjectStructure(value);
        } else if (Object.prototype.toString.call(value) === '[object Array]') {
            value = buildArrayStructure(value);
        }
    }
    return value;
}

function buildObjectStructure(obj) {
    var table = aa.util.newHashMap();
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            var value = obj[p];
            table.put(obj[p], buildResultStructure(value));
        }
    }
    return obj;
}

function buildArrayStructure(arr) {
    var arrList = aa.util.newArrayList();
    for (var i = 0; i < arr.length; i++) {
        arrList.add(buildResultStructure(arr[i]));
    }
    return arrList;
}

function logInfo(s) {
    infoLog.push(s);
}

function logWarning(s) {
    warningLog.push(s);
}

function logError(s) {
    errorLog.push(s);
}


