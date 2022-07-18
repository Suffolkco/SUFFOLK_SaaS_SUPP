/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_DEQ_COMPLAINT_REMINDERS.js
| Trigger: Batch
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
message = "";
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
var maxSeconds = 60 * 5;// number of seconds allowed for batch processing, usually < 5*60
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var useAppSpecificGroupName = false;
var timeExpired = false;
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
    logMessage("Batch Job " + batchJobName + " Job ID is " + batchJobID + br);
}
else
{
    logMessage("Batch job ID not found " + batchJobResult.getErrorMessage());
}
//This job should run on the entire DEQ module
var recTypeArray = [];
var fList = aa.cap.getCapTypeListByModule("DEQ", null);
if (fList.getSuccess())
{
    var fListOut = fList.getOutput();
    for (f in fListOut)
    {
        if ((fListOut[f].getType() == "General" && fListOut[f].getSubType() == "Complaint"))
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
| CORE EXPIRATION BATCH FUNCTIONALITY
/------------------------------------------------------------------------------------------------------*/
// Default showDebug to false. Update if provided as an environmental variable
showDebug = true;
if (String(aa.env.getValue("showDebug")).length > 0)
{
    if (aa.env.getValue("showDebug").substring(0, 1).toUpperCase().equals("Y"))
    {
        showDebug = true;
    }
}

// Default showMessage to true. Update if provided as an environmental variable
showMessage = true;
if (String(aa.env.getValue("showMessage")).length > 0)
{
    if (aa.env.getValue("showMessage").substring(0, 1).toUpperCase().equals("N"))
    {
        showMessage = false;
    }
}
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
var paramsOK = true;

if (paramsOK)
{
    logMessage("Start Date: " + startDate + br);
    logMessage("Starting the timer for this job.  If it takes longer than 5 minutes an error will be listed at the bottom of the email." + br);
    if (!timeExpired)
    {
        mainProcess(recType);
        //logMessage("End of Job: Elapsed Time : " + elapsed() + " Seconds");
        logMessage("End Date: " + startDate);
        aa.sendMail("noreplyehims@suffolkcountyny.gov", emailAddress, "", "Batch Job - BATCH_DEQ_COMPLAINT_REMINDERS", emailText);
    }
}
/*------------------------------------------------------------------------------------------------------/
| <===========End Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| <=========== Errors and Reporting
/------------------------------------------------------------------------------------------------------*/
if (debug.indexOf("**ERROR") > 0)
{
    aa.env.setValue("ScriptReturnCode", "1");
    aa.env.setValue("ScriptReturnMessage", debug);
} else
{
    aa.env.setValue("ScriptReturnCode", "0");
    if (showMessage)
    {
        aa.env.setValue("ScriptReturnMessage", message);
    }
    if (showDebug)
    {
        aa.env.setValue("ScriptReturnMessage", debug);
    }
}
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
                logMessage("**ERROR: Failed to get capId List : " + recordListResult.getErrorMessage());
            }
            else
            {
                var recArray = recordListResult.getOutput();
                logMessage("Looping through " + recArray.length + " records of type " + thisType);
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
                            if (getAppStatus() != "Closed")
                            {
                                var statDate = cap.getFileDate();
                                if (statDate != null)
                                {
                                    var statDateToPrint = statDate.getMonth() + "/" + statDate.getDayOfMonth() + "/" + statDate.getYear();
                                    logDebug("statdatetoprint is: " + statDateToPrint);
                                    var currWfTask = "";
                                    var currWfStatus = "";
                                    var emailParams = aa.util.newHashtable();
                                    var dateDif = parseFloat(dateDiff(todayDate, statDate));
                                    var dateDifRound = Math.floor(dateDif);
                                    if (dateDifRound == -2)
                                    {
                                        var workflowResult = aa.workflow.getTasks(capId);
                                        if (workflowResult.getSuccess())
                                        {
                                            var wfObj = workflowResult.getOutput();
                                            for (w in wfObj)
                                            {
                                                if (((wfObj[w].getActiveFlag() == "Y")))
                                                {
                                                    currWfTask = String(wfObj[w].getTaskDescription());
                                                    var userIdAssigned = getUserIDAssignedToTask(capId, currWfTask);
                                                    var userToSend = aa.person.getUser(userIdAssigned).getOutput();
                                                    addParameter(emailParams, "$$altID$$", capIDString);
                                                    addParameter(emailParams, "$$openDate$$", statDateToPrint);
                                                    if (!matches(userToSend, null, undefined, "", " ") && !matches(userIdAssigned, null, undefined, "", " ") && !matches(userToSend.getEmail(), null, undefined, "", " "))
                                                    {
                                                        logDebug("sending email to " + userToSend.getEmail());
                                                        sendNotification("", userToSend.getEmail(), "", "DEQ_CMPLNT_ATTN_REQUIRED_2_DAYS", emailParams, null);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    if (dateDifRound == -5)
                                    {
                                        var workflowResult = aa.workflow.getTasks(capId);
                                        if (workflowResult.getSuccess())
                                        {
                                            var wfObj = workflowResult.getOutput();
                                            var userIdAssigned;
                                            var userToSend;
                                            for (w in wfObj)
                                            {
                                                if (((wfObj[w].getActiveFlag() == "Y")))
                                                {
                                                    currWfTask = String(wfObj[w].getTaskDescription());
                                                    currWfStatus = String(wfObj[w].getDisposition());
                                                    userIdAssigned = getUserIDAssignedToTask(capId, currWfTask);
                                                    userToSend = aa.person.getUser(userIdAssigned).getOutput();
                                                    addParameter(emailParams, "$$altID$$", capIDString);
                                                    addParameter(emailParams, "$$wfTask$$", currWfTask);
                                                    addParameter(emailParams, "$$wfStatus$$", currWfStatus);
                                                    if (!matches(userToSend, null, undefined, "", " ") && !matches(userIdAssigned, null, undefined, "", " ") && !matches(userToSend.getEmail(), null, undefined, "", " "))
                                                    {
                                                        logDebug("sending email to " + userToSend.getEmail());
                                                        sendNotification("", userToSend.getEmail(), "", "DEQ_CMPLNT_ATTN_REQUIRED_5_DAYS", emailParams, null);
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
            }
        }
    }

    catch (err)
    {
        logMessage("**ERROR** runtime error " + err.message + " at " + err.lineNumber + " stack: " + err.stack);
    }
    logMessage("End of Job: Elapsed Time : " + elapsed() + " Seconds");
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
        logDebug("ERROR: Failed to get app status: " + capResult.getErrorMessage());
    }
    return appStatus;
}
function getContactName(vConObj) {
    if (vConObj.people.getContactTypeFlag() == "organization")
    {
        if (vConObj.people.getBusinessName() != null && vConObj.people.getBusinessName() != "")
            return vConObj.people.getBusinessName();

        return vConObj.people.getBusinessName2();
    }
    else
    {
        if (vConObj.people.getFullName() != null && vConObj.people.getFullName() != "")
        {
            return vConObj.people.getFullName();
        }
        if (vConObj.people.getFirstName() != null && vConObj.people.getLastName() != null)
        {
            return vConObj.people.getFirstName() + " " + vConObj.people.getLastName();
        }
        if (vConObj.people.getBusinessName() != null && vConObj.people.getBusinessName() != "")
            return vConObj.people.getBusinessName();

        return vConObj.people.getBusinessName2();
    }
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
function addParameter(pamaremeters, key, value) {
    if (key != null)
    {
        if (value == null)
        {
            value = "";
        }
        pamaremeters.put(key, value);
    }
}
function lookup(stdChoice, stdValue) {
    var strControl;
    var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice, stdValue);

    if (bizDomScriptResult.getSuccess())
    {
        var bizDomScriptObj = bizDomScriptResult.getOutput();
        strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
        //logDebug("lookup(" + stdChoice + "," + stdValue + ") = " + strControl);
    }
    else
    {
        //logDebug("lookup(" + stdChoice + "," + stdValue + ") does not exist");
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
    //logDebug("**WARNING** convertDate cannot parse date : " + thisDate);
    return null;
}
function elapsed() {
    var thisDate = new Date();
    var thisTime = thisDate.getTime();
    return ((thisTime - startTime) / 1000)
}
function logDebug(dstr) {
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