/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_DEQ_OPC_ENF_CREATE_OP_TT_RECORDS.js
| Trigger: Batch
| Author: RLittlefield
| This batch script will run daily.
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| USER CONFIGURABLE PARAMETERS
/------------------------------------------------------------------------------------------------------*/
currentUserID = "ADMIN";
useAppSpecificGroupName = false;
/*------------------------------------------------------------------------------------------------------/
| GLOBAL VARIABLES
/------------------------------------------------------------------------------------------------------*/
br = "<br>";
debug = "";
systemUserObj = aa.person.getUser(currentUserID).getOutput();
publicUser = false;
/*------------------------------------------------------------------------------------------------------/
| INCLUDE SCRIPTS (Core functions, batch includes, custom functions)
/------------------------------------------------------------------------------------------------------*/
SCRIPT_VERSION = 3.0;
var useSA = false;
var SA = null;
var SAScript = null;
var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_FOR_EMSE");
if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I")
{
    useSA = true;
    SA = bzr.getOutput().getDescription();
    bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_INCLUDE_SCRIPT");
    if (bzr.getSuccess())
    {
        SAScript = bzr.getOutput().getDescription();
    }
}

if (SA)
{
    eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS", SA));
    eval(getMasterScriptText(SAScript, SA));
} else
{
    eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS"));
}

eval(getScriptText("INCLUDES_BATCH"));
eval(getMasterScriptText("INCLUDES_CUSTOM"));

function getMasterScriptText(vScriptName) {
    var servProvCode = aa.getServiceProviderCode();
    if (arguments.length > 1)
        servProvCode = arguments[1]; // use different serv prov code
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    try
    {
        var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
        return emseScript.getScriptText() + "";
    } catch (err)
    {
        return "";
    }
}

function getScriptText(vScriptName) {
    var servProvCode = aa.getServiceProviderCode();
    if (arguments.length > 1)
        servProvCode = arguments[1]; // use different serv prov code
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    try
    {
        var emseScript = emseBiz.getScriptByPK(servProvCode, vScriptName, "ADMIN");
        return emseScript.getScriptText() + "";
    } catch (err)
    {
        return "";
    }
}
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var emailText = "";
var showDebug = true;// Set to true to see debug messages in email confirmation
var maxSeconds = 60 * 5;// number of seconds allowed for batch processing, usually < 5*60
var showMessage = false;
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var useAppSpecificGroupName = false;
var timeExpired = false;
var br = "<BR>";
var emailAddress = "";
sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID();
batchJobName = "" + aa.env.getValue("BatchJobName");
batchJobID = 0;
var pgParms = aa.env.getParamValues();
var pgParmK = pgParms.keys();
while (pgParmK.hasNext())
{
    k = pgParmK.next();
    if (k == "Send Batch log to:")
    {
        emailAddress = pgParms.get(k);
    }
}
if (batchJobResult.getSuccess()) 
{
    batchJobID = batchJobResult.getOutput();
    logDebugLocal("Batch Job " + batchJobName + " Job ID is " + batchJobID + br);
}
else
{
    logDebugLocal("Batch job ID not found " + batchJobResult.getErrorMessage());
}
//This job should run on the entire DEQ module
var recTypeArray = [];
var fList = aa.cap.getCapTypeListByModule("DEQ", null);
if (fList.getSuccess())
{
    var fListOut = fList.getOutput();
    for (f in fListOut)
    {
        if ((fListOut[f].getType() == "General") && fListOut[f].getSubType() == "Site" && fListOut[f].getCategory() == "NA")
        {
            var recType = "DEQ" + "/" + fListOut[f].getType() + "/" + fListOut[f].getSubType() + "/" + fListOut[f].getCategory();
            recTypeArray.push(recType);
        }
        if ((fListOut[f].getType() == "OPC") && fListOut[f].getSubType() == "Hazardous Tank" && fListOut[f].getCategory() == "Permit")
        {
            var recType = "DEQ" + "/" + fListOut[f].getType() + "/" + fListOut[f].getSubType() + "/" + fListOut[f].getCategory();
            recTypeArray.push(recType);
        }
    }
}
/*------------------------------------------------------------------------------------------------------/
|
| START: END CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var message = "";
var startDate = new Date();
var startTime = startDate.getTime(); // Start timer
var todayDate = (startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear();
/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS//
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
var paramsOK = true;

if (paramsOK) 
{
    logDebugLocal("Start Date: " + startDate + br);
    logDebugLocal("Starting the timer for this job.  If it takes longer than 5 minutes an error will be listed at the bottom of the email." + br);
    if (!timeExpired) 
    {
        mainProcess(recType);
        //logDebugLocal("End of Job: Elapsed Time : " + elapsed() + " Seconds");
        logDebugLocal("End Date: " + startDate);
        aa.sendMail("ada.chan@suffolkcountyny.gov", emailAddress, "", "Batch Job - BATCH_DEQ_OPC_ENF_CREATE_OP_TT_RECORDS", emailText);
    }
}
/*------------------------------------------------------------------------------------------------------/
| <===========End Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
function mainProcess(thisType) {
    try
    {
        for (rec in recTypeArray)
        {
            var thisType = recTypeArray[rec];
            var capModel = aa.cap.getCapModel().getOutput();
            var appTypeArray = thisType.split("/");
            capTypeModel = capModel.getCapType();
            capTypeModel.setGroup(appTypeArray[0]);
            capTypeModel.setType(appTypeArray[1]);
            capTypeModel.setSubType(appTypeArray[2]);
            capTypeModel.setCategory(appTypeArray[3]);
            capModel.setCapType(capTypeModel);
            //capModel.setCapStatus(sArray[i]); if needed
            var recordListResult = aa.cap.getCapIDListByCapModel(capModel);
            if (!recordListResult.getSuccess())
            {
                logDebugLocal("**ERROR: Failed to get capId List : " + recordListResult.getErrorMessage());
            }
            else
            {
                var recArray = recordListResult.getOutput();
                logDebugLocal("Looping through " + recArray.length + " records of type " + thisType);
                for (var j in recArray)
                {
                    capId = aa.cap.getCapID(recArray[j].getID1(), recArray[j].getID2(), recArray[j].getID3()).getOutput();
                    capIDString = capId.getCustomID();
                    cap = aa.cap.getCap(capId).getOutput();
                    if (cap)
                    {
                        var capmodel = aa.cap.getCap(capId).getOutput().getCapModel();
                        if (capmodel.isCompleteCap())
                        {

                            if (appTypeArray[1] == "General" && appTypeArray[2] == "Site")
                            {
                                var permitToOperateEndDate = getAppSpecific("OPC Permit to Operate End Date");
                                if (permitToOperateEndDate != null)
                                {
                                    //logDebugLocal("capidstring is: " + capIDString);
                                    var dateDif = parseFloat(dateDiff(todayDate, permitToOperateEndDate));
                                    //logDebugLocal("todaydate is: " + todayDate + " and permitToOperateEndDate is: " + permitToOperateEndDate);
                                    var dateDifRound = Math.floor(dateDif);
                                    //logDebugLocal("datediffround is: " + dateDifRound);
                                    logDebugLocal("looking for a date diff on " + capIDString + " and datedifround is: " + dateDifRound);
                                    //Upcoming Prelim Hearing
                                    if (dateDifRound == -90)
                                    {
                                        var childEnfRecordArray = getChildren("DEQ/OPC/Enforcement/NA", capId);

                                        logDebugLocal("childenfrecordarray is: " + childEnfRecordArray);
                                        if (matches(childEnfRecordArray, null, "", undefined))
                                        {
                                            logDebugLocal("length is 0, creating child code enf record");
                                            logDebugLocal("updating contacts, parcel, address, ASIs, appname, and project description");
                                            var enfChild = createChild("DEQ", "OPC", "Enforcement", "NA", null, capId);
                                            copyContacts(capId, enfChild);
                                            copyParcel(capId, enfChild);
                                            copyAddress(capId, enfChild);
                                            var siteAltId = capId.getCustomID();
                                            editAppSpecific("Site/Pool (Parent) Record ID", siteAltId, enfChild);
                                            var fileRefNumber = getAppSpecific("File Reference Number", capId);
                                            editAppSpecific("File Reference Number/Facility ID", fileRefNumber, enfChild);
                                            editAppSpecific("Enforcement Type", "OP", enfChild);
                                            var appName = getAppName();
                                            var projDesc = workDescGet(capId);
                                            editAppName(appName, enfChild);
                                            updateWorkDesc(projDesc, enfChild);

                                            //updating Code Enf record with Tank record info
                                            logDebugLocal("checking for tank records as children of the site");
                                            var childTankRecordArray = getChildren("DEQ/OPC/Hazardous Tank/Permit", capId);
                                            logDebugLocal("childTankRecordArray length is: " + childTankRecordArray.length);
                                            if (childTankRecordArray.length > 0)
                                            {
                                                logDebugLocal("child tank records found");
                                                for (ct in childTankRecordArray)
                                                {
                                                    logDebugLocal("checking tank record appstatuses...");
                                                    if (getAppStatus(childTankRecordArray[ct]) == "Active")
                                                    {
                                                        logDebugLocal("Active tank found! AltID is: " + childTankRecordArray[ct].getCustomID());
                                                        var newRow = new Array();
                                                        var tankNo = getAppSpecific("SCDHS Tank #", childTankRecordArray[ct]);
                                                        var productStore = getAppSpecific("Product Stored Label", childTankRecordArray[ct]);
                                                        logDebugLocal("productstore is: " + productStore);
                                                        var capacity = getAppSpecific("Capacity", childTankRecordArray[ct]) + " " + getAppSpecific("Units", childTankRecordArray[ct]);
                                                        var tankLocLabel = getAppSpecific("Tank Location Label", childTankRecordArray[ct]);
                                                        var articleTwelve = getAppSpecific("Article 12 Reg", childTankRecordArray[ct]);
                                                        var articleEighteen = getAppSpecific("Article 18 Reg", childTankRecordArray[ct]);
                                                        newRow["Tank Number"] = tankNo;
                                                        newRow["Product Store Label"] = productStore;
                                                        newRow["Capacity"] = capacity;
                                                        newRow["Tank Location Label"] = tankLocLabel;
                                                        newRow["Article 12"] = articleTwelve;
                                                        newRow["Article 18"] = articleEighteen;
                                                        logDebugLocal("newRow psl is: " + newRow["Product Store Label"]);
                                                        addRowToASITable("OPERATING PERMIT", newRow, enfChild);
                                                    }
                                                }
                                            }


                                        }
                                        //     commenting this out for now because I don't know if updating existing code enf records is needed with this
                                        //    else
                                        //    {
                                        //        for (cr in childEnfRecordArray)
                                        //        {
                                        //            var childEnfRecord = childEnfRecordArray[cr];
                                        //            logDebug("child enf record is: " + childEnfRecord);
                                        //            var childRecCapType = aa.cap.getCap(childEnfRecordArray[cr]).getOutput().getCapType();
                                        //            logDebug("childreccaptype is: " + childRecCapType);
                                        //            if (childRecCapType == "DEQ/OPC/Enforcement/NA")
                                        //            {
                                        //                //update violations ASITs only
                                        //            }
                                        //         }
                                        //       }
                                    }
                                }
                            }
                            if (appTypeArray[1] == "OPC" && appTypeArray[2] == "Hazardous Tank" && appTypeArray[3] == "Permit")
                            {
                                var nextLineTestDate = getAppSpecific("Next Line Test Date");
                                var nextTankTestDate = getAppSpecific("Next Tank Test Date");
                                if (nextLineTestDate != null || nextTankTestDate != null)
                                {
                                    //logDebugLocal("capidstring is: " + capIDString);
                                    if (nextLineTestDate != null)
                                    {
                                        var dateDifLineTest = parseFloat(dateDiff(todayDate, nextLineTestDate));
                                    }
                                    if (nextTankTestDate != null)
                                    {
                                        var dateDifTankTest = parseFloat(dateDiff(todayDate, nextTankTestDate));
                                    }

                                    //logDebugLocal("todaydate is: " + todayDate + " and permitToOperateEndDate is: " + permitToOperateEndDate);
                                    var dateDifRoundLineTest = Math.floor(dateDifLineTest);
                                    var dateDifRoundTankTest = Math.floor(dateDifTankTest);

                                    //logDebugLocal("datediffround is: " + dateDifRound);
                                    //Upcoming Prelim Hearing
                                    if (dateDifRoundLineTest == -90 || dateDifRoundTankTest == -90)
                                    {
                                        var parentCap = getParent(capId);
                                        var childEnfRecordArray = getChildren("DEQ/OPC/Enforcement/NA", parentCap);

                                        logDebugLocal("childenfrecordarray is: " + childEnfRecordArray);
                                        if (matches(childEnfRecordArray, null, "", undefined))
                                        {
                                            logDebugLocal("length is 0, creating child code enf record");
                                            logDebugLocal("updating contacts, parcel, address, ASIs, appname, and project description");
                                            var enfChild = createChild("DEQ", "OPC", "Enforcement", "NA", null, parentCap);
                                            copyContacts(capId, enfChild);
                                            copyParcel(capId, enfChild);
                                            copyAddress(capId, enfChild);
                                            var siteAltId = parentCap.getCustomID();
                                            editAppSpecific("Site/Pool (Parent) Record ID", siteAltId, enfChild);
                                            var fileRefNumber = getAppSpecific("File Reference Number", parentCap);
                                            editAppSpecific("File Reference Number/Facility ID", fileRefNumber, enfChild);
                                            editAppSpecific("Enforcement Type", "TT", enfChild);
                                            var appName = getAppName();
                                            var projDesc = workDescGet(parentCap);
                                            editAppName(parentCap, enfChild);
                                            updateWorkDesc(projDesc, enfChild);


                                            var newRow = new Array();
                                            var tankNo = getAppSpecific("SCDHS Tank #", capId);
                                            var productStore = getAppSpecific("Product Stored Label", capId);
                                            logDebugLocal("productstore is: " + productStore);
                                            var capacity = getAppSpecific("Capacity", capId) + " " + getAppSpecific("Units", capId);
                                            var tankLocLabel = getAppSpecific("Tank Location Label", capId);
                                            var articleTwelve = getAppSpecific("Article 12 Reg", capId);
                                            var articleEighteen = getAppSpecific("Article 18 Reg", capId);
                                            newRow["Tank Number"] = tankNo;
                                            newRow["Product Store Label"] = productStore;
                                            newRow["Capacity"] = capacity;
                                            newRow["Tank Location Label"] = tankLocLabel;
                                            newRow["Next Tank Test Date"] = nextLineTestDate;
                                            newRow["Next Line Test Date"] = nextTankTestDate;
                                            logDebugLocal("newRow psl is: " + newRow["Product Store Label"]);
                                            addRowToASITable("TANK TIGHTNESS TEST", newRow, enfChild);



                                        }
                                        /* commenting this out for now because I don't know if updating existing code enf records is needed with this
                                        else
                                        {
                                            for (cr in childEnfRecordArray)
                                            {
                                                var childEnfRecord = childEnfRecordArray[cr];
                                                logDebug("child enf record is: " + childEnfRecord);
                                                var childRecCapType = aa.cap.getCap(childEnfRecordArray[cr]).getOutput().getCapType();
                                                logDebug("childreccaptype is: " + childRecCapType);
                                                if (childRecCapType == "DEQ/OPC/Enforcement/NA")
                                                {
                                                    //update violations ASITs only
                                                }
 
 
                                            }
                                        }*/
                                    }

                                }
                            }
                        }
                    }
                }
            }
        }
    }
    catch (err)
    {
        logDebugLocal("**ERROR** runtime error " + err.message + " at " + err.lineNumber + " stack: " + err.stack);
    }
    logDebugLocal("End of Job: Elapsed Time : " + elapsed() + " Seconds");
}
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/
function getAppStatus() {
    var itemCap = capId;
    if (arguments.length == 1) itemCap = arguments[0]; // use cap ID specified in args

    var appStatus = null;
    var capResult = aa.cap.getCap(itemCap);
    if (capResult.getSuccess())
    {
        licCap = capResult.getOutput();
        if (licCap != null)
        {
            appStatus = "" + licCap.getCapStatus();
        }
    } else
    {
        logDebugLocal("ERROR: Failed to get app status: " + capResult.getErrorMessage());
    }
    return appStatus;
}

function matches(eVal, argList) {
    for (var i = 1; i < arguments.length; i++)
    {
        if (arguments[i] == eVal)
        {
            return true;
        }
    }
    return false;
}

function lookup(stdChoice, stdValue) {
    var strControl;
    var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice, stdValue);

    if (bizDomScriptResult.getSuccess())
    {
        var bizDomScriptObj = bizDomScriptResult.getOutput();
        strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
        //logDebugLocal("lookup(" + stdChoice + "," + stdValue + ") = " + strControl);
    }
    else
    {
        //logDebugLocal("lookup(" + stdChoice + "," + stdValue + ") does not exist");
    }
    return strControl;
}

function dateDiff(date1, date2) {
    return (convertDate(date2).getTime() - convertDate(date1).getTime()) / (1000 * 60 * 60 * 24);
}
function convertDate(thisDate) {
    //converts date to javascript date
    if (typeof (thisDate) == "string")
    {
        var retVal = new Date(String(thisDate));
        if (!retVal.toString().equals("Invalid Date"))
            return retVal;
    }
    if (typeof (thisDate) == "object")
    {
        if (!thisDate.getClass)
        {// object without getClass, assume that this is a javascript date already 
            return thisDate;
        }
        if (thisDate.getClass().toString().equals("class com.accela.aa.emse.dom.ScriptDateTime"))
        {
            return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
        }
        if (thisDate.getClass().toString().equals("class java.util.Date"))
        {
            return new Date(thisDate.getTime());
        }
        if (thisDate.getClass().toString().equals("class java.lang.String"))
        {
            return new Date(String(thisDate));
        }
    }
    if (typeof (thisDate) == "number")
    {
        return new Date(thisDate);  // assume milliseconds
    }
    //logDebugLocal("**WARNING** convertDate cannot parse date : " + thisDate);
    return null;
}
function elapsed() {
    var thisDate = new Date();
    var thisTime = thisDate.getTime();
    return ((thisTime - startTime) / 1000)
}
function logDebugLocal(dstr) {
    if (showDebug)
    {
        aa.print(dstr)
        emailText += dstr + "<br>";
        aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr)
    }
}
function exists(eVal, eArray) {
    for (ii in eArray)
        if (eArray[ii] == eVal) return true;
    return false;
}
function getAppSpecific(itemName)  // optional: itemCap
{
    var updated = false;
    var i = 0;
    var itemCap = capId;
    if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args

    if (useAppSpecificGroupName)
    {
        if (itemName.indexOf(".") < 0)
        {logDebugLocal("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true"); return false}


        var itemGroup = itemName.substr(0, itemName.indexOf("."));
        var itemName = itemName.substr(itemName.indexOf(".") + 1);
    }

    var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
    if (appSpecInfoResult.getSuccess())
    {
        var appspecObj = appSpecInfoResult.getOutput();

        if (itemName != "")
        {
            for (i in appspecObj)
                if (appspecObj[i].getCheckboxDesc() == itemName && (!useAppSpecificGroupName || appspecObj[i].getCheckboxType() == itemGroup))
                {
                    return appspecObj[i].getChecklistComment();
                    break;
                }
        } // item name blank
    }
    else
    {logDebugLocal("**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage())}
}
function appMatch(ats) // optional capId or CapID string
{
    var matchArray = appTypeArray //default to current app
    if (arguments.length == 2) 
    {
        matchCapParm = arguments[1]
        if (typeof (matchCapParm) == "string")
            matchCapId = aa.cap.getCapID(matchCapParm).getOutput();   // Cap ID to check
        else
            matchCapId = matchCapParm;
        if (!matchCapId)
        {
            logDebug("**WARNING: CapId passed to appMatch was not valid: " + arguments[1]);
            return false
        }
        matchCap = aa.cap.getCap(matchCapId).getOutput();
        matchArray = matchCap.getCapType().toString().split("/");
    }

    var isMatch = true;
    var ata = ats.split("/");
    if (ata.length != 4)
        logDebug("**ERROR in appMatch.  The following Application Type String is incorrectly formatted: " + ats);
    else
        for (xx in ata)
            if (!ata[xx].equals(matchArray[xx]) && !ata[xx].equals("*"))
                isMatch = false;
    return isMatch;
}
function getAppName() {
    var itemCap = capId;
    if (arguments.length == 1) itemCap = arguments[0]; // use cap ID specified in args

    capResult = aa.cap.getCap(itemCap)

    if (!capResult.getSuccess())
    {logDebug("**WARNING: error getting cap : " + capResult.getErrorMessage()); return false}

    capModel = capResult.getOutput().getCapModel()

    return capModel.getSpecialText()
}
function addRowToASITable(tableName, tableValues) //optional capId
{
    //tableName is the name of the ASI table
    //tableValues is an associative array of values.  All elements must be either a string or asiTableVal object
    itemCap = capId
    if (arguments.length > 2)
    {
        itemCap = arguments[2]; //use capId specified in args
    }
    var tssmResult = aa.appSpecificTableScript.getAppSpecificTableModel(itemCap, tableName);
    if (!tssmResult.getSuccess())
    {
        logDebug("**WARNING: error retrieving app specific table " + tableName + " " + tssmResult.getErrorMessage());
        return false;
    }
    var tssm = tssmResult.getOutput();
    var tsm = tssm.getAppSpecificTableModel();
    var fld = tsm.getTableField();
    var col = tsm.getColumns();
    var fld_readonly = tsm.getReadonlyField(); //get ReadOnly property
    var coli = col.iterator();
    while (coli.hasNext())
    {
        colname = coli.next();
        if (!tableValues[colname.getColumnName()]) 
        {
            logDebug("Value in " + colname.getColumnName() + " - " + tableValues[colname.getColumnName()]);
            logDebug("addToASITable: null or undefined value supplied for column " + colname.getColumnName() + ", setting to empty string");
            tableValues[colname.getColumnName()] = "";
        }
        if (typeof (tableValues[colname.getColumnName()].fieldValue) != "undefined")
        {
            fld.add(tableValues[colname.getColumnName()].fieldValue);
            fld_readonly.add(tableValues[colname.getColumnName()].readOnly);
        }
        else // we are passed a string
        {
            fld.add(tableValues[colname.getColumnName()]);
            fld_readonly.add(null);
        }
    }
    tsm.setTableField(fld);
    tsm.setReadonlyField(fld_readonly); // set readonly field
    addResult = aa.appSpecificTableScript.editAppSpecificTableInfos(tsm, itemCap, currentUserID);
    if (!addResult.getSuccess())
    {
        logDebug("**WARNING: error adding record to ASI Table:  " + tableName + " " + addResult.getErrorMessage());
        return false;
    }
    else
    {
        logDebug("Successfully added record to ASI Table: " + tableName);
    }
}