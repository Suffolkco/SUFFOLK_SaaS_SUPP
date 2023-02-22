/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_DEQ_OPC_ENF_HEARING_DATE_REMINDER.js
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
//This job should run on the entire Fire module
var recTypeArray = [];
var fList = aa.cap.getCapTypeListByModule("DEQ", null);
if (fList.getSuccess())
{
    var fListOut = fList.getOutput();
    for (f in fListOut)
    {
        if ((fListOut[f].getType() == "OPC") && fListOut[f].getSubType() == "Enforcement" && fListOut[f].getCategory() == "NA")
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
        aa.sendMail("ada.chan@suffolkcountyny.gov", emailAddress, "", "Batch Job - BATCH_DEQ_OPC_ENF_HEARING_DATE_REMINDER", emailText);
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
                            var appName = cap.getSpecialText();
                            var fileRefNum = getAppSpecific("File Reference Number/Facility ID");
                            var hearingDate = getAppSpecific("Hearing Date");
                            var hearingTime = getAppSpecific("Hearing Time");
                            var enfType = getAppSpecific("Enforcement Type");
                            var vEParams = aa.util.newHashtable();
                            var conEmail;

                            var addrResult = getAddressInALine(capId);

                            if (matches(getAppStatus(), "OPEN PH", "Open PH"))
                            {
                                var phNotPaid = false;
                                var workflowResult = aa.workflow.getTasks(capId);
                                if (workflowResult.getSuccess())
                                {
                                    var wfObj = workflowResult.getOutput();
                                    for (w in wfObj)
                                    {
                                        if (matches(wfObj[w].getTaskDescription(), "Preliminary Hearing") && !matches(wfObj[w].getDisposition(), "Paid") && wfObj[w].getActiveFlag() == "Y")
                                        {
                                            phNotPaid = true;
                                        }
                                    }
                                }
                                if (phNotPaid)
                                {
                                    var prelimHearingUserId = getUserIDAssignedToTask(capId, "Preliminary Hearing")
                                    //logDebugLocal("prelimhearing user id is: " + prelimHearingUserId);
                                    var userToSend = aa.person.getUser(prelimHearingUserId).getOutput();
                                    //logDebugLocal("user to send is: " + userToSend);
                                    if (userToSend != null)
                                    {
                                        var prelimHearingUserName = userToSend.getFirstName() + " " + userToSend.getLastName();
                                        //logDebugLocal("prelimhearingusername is: " + prelimHearingUserName);
                                        var prelimHearingUserPhone = userToSend.getPhoneNumber();
                                        var prelimHearingUserEmail = userToSend.getEmail();
                                        //logDebugLocal("prelimhearinguser email is: " + prelimHearingUserEmail);

                                        addParameter(vEParams, "$$assignUser$$", prelimHearingUserName);
                                        addParameter(vEParams, "$$userPhoneNum$$", prelimHearingUserPhone);
                                        addParameter(vEParams, "$$userEmail$$", prelimHearingUserEmail);
                                    }

                                    var statDate = getAppSpecific("Hearing Date");
                                    if (statDate != null)
                                    {
                                        logDebugLocal("capidstring is: " + capIDString);
                                        var dateDif = parseFloat(dateDiff(todayDate, statDate));
                                        //logDebugLocal("todaydate is: " + todayDate + " and statdate is: " + statDate);
                                        var dateDifRound = Math.floor(dateDif);
                                        //logDebugLocal("datediffround is: " + dateDifRound);

                                        //Upcoming Prelim Hearing
                                        if (matches(dateDifRound, 1, 7))
                                        {
                                            //logDebugLocal("Checking for Prelim Hearing Reminders...");

                                            addParameter(vEParams, "$$altID$$", capIDString);
                                            addParameter(vEParams, "$$capAlias$$", cap.getCapType().getAlias());
                                            addParameter(vEParams, "$$fileRefNum$$", fileRefNum);
                                            addParameter(vEParams, "$$facilityName$$", appName);
                                            addParameter(vEParams, "$$addressInALine$$", addrResult);
                                            addParameter(vEParams, "$$hearingDate$$", hearingDate);
                                            addParameter(vEParams, "$$hearingTime$$", hearingTime);

                                            var parentCapId = getParent(capId);
                                            if (parentCapId)
                                            {
                                                var contactResult = aa.people.getCapContactByCapID(parentCapId);

                                                if (contactResult.getSuccess())
                                                {
                                                    var capContacts = contactResult.getOutput();
                                                    conEmail = "";
                                                    for (c in capContacts)
                                                    {
                                                        if (!matches(capContacts[c].email, null, undefined, ""))
                                                        {
                                                            if (capContacts[c].getPeople().getAuditStatus() == "A")
                                                            {
                                                                if (enfType == "SP")
                                                                {
                                                                    if (matches(capContacts[c].getCapContactModel().getContactType(), "Property Owner", "Pool Owner", "Pool Operator"))
                                                                    {
                                                                        conEmail += String(capContacts[c].email) + ";";
                                                                    }
                                                                }
                                                                else
                                                                {
                                                                    if (matches(capContacts[c].getCapContactModel().getContactType(), "Property Owner", "Tank Owner", "Operator"))
                                                                    {
                                                                        conEmail += String(capContacts[c].email) + ";";
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }

                                                logDebugLocal("sending notification on : " + capId.getCustomID() + " to " + conEmail);
                                                sendNotification("", conEmail, "", "DEQ_OPC_ENF_PRELIM_HEARING_REM", vEParams, null);
                                            }
                                        }

                                        //Missed Prelim Hearing
                                        if (matches(dateDifRound, -1))
                                        {
                                            //logDebugLocal("Checking for Prelim Hearing past due...");

                                            var workflowResult = aa.workflow.getTasks(capId);
                                            if (workflowResult.getSuccess())
                                            {
                                                var workflowResultTsi = aa.workflow.getTask(capId, "Preliminary Hearing");
                                                var taskObj = workflowResultTsi.getOutput();
                                                var tsiResult = aa.taskSpecificInfo.getTaskSpecificInfoByTask(capId, taskObj.getProcessID(), taskObj.getStepNumber());

                                                if (tsiResult.getSuccess())
                                                {
                                                    var tsiOut = tsiResult.getOutput();
                                                    var hearingDateTsi = "";
                                                    for (t in tsiOut)
                                                    {
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
                                            addParameter(vEParams, "$$altID$$", capIDString);
                                            addParameter(vEParams, "$$fileRefNum$$", fileRefNum);
                                            addParameter(vEParams, "$$facilityName$$", appName);
                                            addParameter(vEParams, "$$prelimHearingDate$$", statDate);

                                            logDebugLocal("sending missed hearing template to " + prelimHearingUserEmail + " as part of " + capId.getCustomID());

                                            sendNotification("", prelimHearingUserEmail, "", "DEQ_OPC_ENF_MIS_HEARING", vEParams, null);
                                        }
                                    }
                                }
                            }
                            if (matches(getAppStatus(), "OPEN FH", "Open FH"))
                            {
                                var fhNotPaid = false;
                                var workflowResult = aa.workflow.getTasks(capId);
                                if (workflowResult.getSuccess())
                                {
                                    var wfObj = workflowResult.getOutput();
                                    for (w in wfObj)
                                    {
                                        if (matches(wfObj[w].getTaskDescription(), "Formal Hearing") && !matches(wfObj[w].getDisposition(), "Paid") && wfObj[w].getActiveFlag() == "Y")
                                        {
                                            fhNotPaid = true;
                                        }
                                    }
                                }
                                if (fhNotPaid)
                                {
                                    var statDate = getAppSpecific("Hearing Date");
                                    if (statDate != null)
                                    {
                                        var hearingDateMinusWeek = dateAdd(statDate, -7);
                                        //logDebugLocal("hearingdateminusweek is: " + hearingDateMinusWeek);
                                        //logDebugLocal("capidstring is: " + capIDString);
                                        var dateDif = parseFloat(dateDiff(todayDate, statDate));
                                        //logDebugLocal("todaydate is: " + todayDate + " and statdate is: " + statDate);
                                        var dateDifRound = Math.floor(dateDif);
                                        //logDebugLocal("datedifround is: " + dateDifRound);

                                        var formalHearingUserId = getUserIDAssignedToTask(capId, "Formal Hearing")
                                        //logDebugLocal("formalHearingUserId user id is: " + formalHearingUserId);
                                        var userToSend = aa.person.getUser(formalHearingUserId).getOutput();
                                        //logDebugLocal("user to send is: " + userToSend);
                                        if (userToSend != null)
                                        {
                                            var formalHearingUserName = userToSend.getFirstName() + " " + userToSend.getLastName();
                                            //logDebugLocal("formalHearingUserName is: " + formalHearingUserName);
                                            var formalHearingUserPhone = userToSend.getPhoneNumber();
                                            var formalHearingUserEmail = userToSend.getEmail();
                                            //logDebugLocal("formalHearingUserEmail email is: " + formalHearingUserEmail);

                                            addParameter(vEParams, "$$assignUser$$", formalHearingUserName);
                                            addParameter(vEParams, "$$userPhoneNum$$", formalHearingUserPhone);
                                            addParameter(vEParams, "$$userEmail$$", formalHearingUserEmail);
                                        }

                                        //Looking for upcoming Formal Hearing date
                                        if (matches(dateDifRound, 7, 10, 14))
                                        {
                                            logDebugLocal("Checking for Formal Hearing Reminders...");
                                            logDebugLocal("datedifround is: " + dateDifRound);
                                            addParameter(vEParams, "$$altID$$", capIDString);
                                            addParameter(vEParams, "$$capAlias$$", cap.getCapType().getAlias());
                                            addParameter(vEParams, "$$addressInALine$$", addrResult);
                                            addParameter(vEParams, "$$fileRefNum$$", fileRefNum);
                                            addParameter(vEParams, "$$facilityName$$", appName);
                                            addParameter(vEParams, "$$hearingDate$$", statDate);
                                            addParameter(vEParams, "$$hearingTime$$", hearingTime);
                                            addParameter(vEParams, "$$hearingDateMinusWeek$$", hearingDateMinusWeek);



                                            var parentCapId = getParent(capId);
                                            if (parentCapId)
                                            {
                                                var contactResult = aa.people.getCapContactByCapID(parentCapId);
                                                if (contactResult.getSuccess())
                                                {
                                                    var capContacts = contactResult.getOutput();
                                                    var conEmail = "";
                                                    for (c in capContacts)
                                                    {
                                                        if (!matches(capContacts[c].email, null, undefined, ""))
                                                        {
                                                            //logDebugLocal("is this contact active or inactive?: " + capContacts[c].getPeople().getAuditStatus())
                                                            if (capContacts[c].getPeople().getAuditStatus() == "A")
                                                            {
                                                                if (enfType == "SP")
                                                                {
                                                                    if (matches(capContacts[c].getCapContactModel().getContactType(), "Property Owner", "Pool Owner", "Pool Operator"))
                                                                    {
                                                                        conEmail += String(capContacts[c].email) + ";";
                                                                    }
                                                                }
                                                                else
                                                                {
                                                                    if (matches(capContacts[c].getCapContactModel().getContactType(), "Property Owner", "Tank Owner", "Operator"))
                                                                    {
                                                                        conEmail += String(capContacts[c].email) + ";";
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                                logDebugLocal("sending notification on : " + capId.getCustomID() + " to " + conEmail);
                                                sendNotification("", conEmail, "", "DEQ_OPC_ENF_FORMAL_HEARING_REM", vEParams, null);
                                            }
                                        }
                                    }
                                }
                            }
                            /* if (!matches(getAppStatus(), "Withdrawn"))
                             {
                                 var workflowResult = aa.workflow.getTasks(capId);
                                 if (workflowResult.getSuccess())
                                 {
                                     var wfObj = workflowResult.getOutput();
                                     for (i in wfObj)
                                     {
                                         if (wfObj[i].getTaskDescription() == "Enforcement Request Review" && wfObj[i].getDisposition() == "Warning Letter Sent")
                                         {
                                             var dueDate = wfObj[i].getDueDate().getMonth() + "/" + wfObj[i].getDueDate().getDayOfMonth() + "/" + wfObj[i].getDueDate().getYear();
                                             logDebugLocal("due date for warning letter task is: " + dueDate);
                                             var errUserId = getUserIDAssignedToTask(capId, "Enforcement Request Review")
                                             //logDebugLocal("prelimhearing user id is: " + errUserId);
                                             var userToSend = aa.person.getUser(errUserId).getOutput();
                                             //logDebugLocal("user to send is: " + userToSend);
                                             if (userToSend != null)
                                             {
                                                 var errUserName = userToSend.getFirstName() + " " + userToSend.getLastName();
                                                 logDebugLocal("errusername is: " + errUserName);
                                                 var errUserEmail = userToSend.getEmail();
 
                                                 if (dueDate != null)
                                                 {
                                                     var dateDif = parseFloat(dateDiff(todayDate, dueDate));
                                                     //logDebugLocal("todaydate is: " + todayDate + " and duedate is: " + dueDate);
                                                     var dateDifRound = Math.floor(dateDif);
                                                     logDebugLocal("datediffround is: " + dateDifRound);
 
                                                     //Overdue Warning Letter status
                                                     if (matches(dateDifRound, -1))
                                                     {
                                                         addParameter(vEParams, "$$altID$$", capIDString);
                                                         addParameter(vEParams, "$$fileRefNum$$", fileRefNum);
                                                         addParameter(vEParams, "$$facilityName$$", appName);
                                                         var contactResult = aa.people.getCapContactByCapID(capId);
                                                         if (contactResult.getSuccess())
                                                         {
                                                             var capContacts = contactResult.getOutput();
                                                             var conEmail = "";
                                                             for (c in capContacts)
                                                             {
                                                                 addParameter(vEParams, "$$FullNameBusName$$", getContactName(capContacts[c]));
                                                                 if (!matches(capContacts[c].email, null, undefined, ""))
                                                                 {
                                                                     conEmail += capContacts[c].email + ";";
                                                                 }
                                                             }
                                                         }
                                                         sendNotification("", errUserEmail, "", "DEQ_OPC_ENF_ACT_REQ", vEParams, null);
                                                     }
                                                 }
                                             }
                                         }
                                     }
                                 }
                                 else
                                 {
                                     //logDebugLocal("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage()); 
                                     return false;
                                 }
                             }*/

                            if (!matches(getAppStatus(), "Case Closed", "Withdrawn"))
                            {
                                //logDebugLocal("Checking for overdue workflow tasks...");
                                var workflowResult = aa.workflow.getTasks(capId);
                                if (workflowResult.getSuccess())
                                {
                                    var wfObj = workflowResult.getOutput();
                                    for (i in wfObj)
                                    {
                                        if (wfObj[i].getActiveFlag() == "Y")
                                        {
                                            if (wfObj[i].getDueDate() != null)
                                            {
                                                var dueDate = wfObj[i].getDueDate().getMonth() + "/" + wfObj[i].getDueDate().getDayOfMonth() + "/" + wfObj[i].getDueDate().getYear();

                                                //logDebugLocal("due date for " + wfObj[i].getTaskDescription() + " task is: " + dueDate);
                                                var taskUserId = getUserIDAssignedToTask(capId, wfObj[i].getTaskDescription())
                                                //logDebugLocal("assigned user id is: " + taskUserId);
                                                var userToSend = aa.person.getUser(taskUserId).getOutput();
                                                //logDebugLocal("user to send is: " + userToSend);
                                                if (userToSend != null)
                                                {
                                                    var taskUserName = userToSend.getFirstName() + " " + userToSend.getLastName();
                                                    //logDebugLocal("taskUserName is: " + taskUserName);
                                                    var taskUserEmail = userToSend.getEmail();

                                                    if (dueDate != null)
                                                    {
                                                        var dateDif = parseFloat(dateDiff(todayDate, dueDate));
                                                        //logDebugLocal("todaydate is: " + todayDate + " and duedate is: " + dueDate);
                                                        var dateDifRound = Math.floor(dateDif);
                                                        //logDebugLocal("datediffround is: " + dateDifRound);

                                                        //Overdue open task
                                                        if (matches(dateDifRound, -1))
                                                        {
                                                            //logDebugLocal("datedif matches");
                                                            addParameter(vEParams, "$$altID$$", capIDString);
                                                            //logDebugLocal("capidstring is: " + capIDString);
                                                            addParameter(vEParams, "$$fileRefNum$$", fileRefNum);
                                                            addParameter(vEParams, "$$facilityName$$", appName);
                                                            //logDebugLocal("sending action required template to " + taskUserEmail + " as part of " + capId.getCustomID());
                                                            sendNotification("", taskUserEmail, "", "DEQ_OPC_ENF_ACT_REQ", vEParams, null);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                else
                                {
                                    //logDebugLocal("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage()); 
                                    return false;
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



function checkInspectionResult(insp2Check, insp2Result) {
    var inspResultObj = aa.inspection.getInspections(capId);
    if (inspResultObj.getSuccess())
    {
        var inspList = inspResultObj.getOutput();
        for (xx in inspList)
            if (String(insp2Check).equals(inspList[xx].getInspectionType()) && String(insp2Result).equals(inspList[xx].getInspectionStatus()))
                return true;
    }
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
function getConfiguredContactTypes() {
    var bizDomScriptResult = aa.bizDomain.getBizDomain('CONTACT TYPE');
    var vContactTypeArray = [];
    var i;

    if (bizDomScriptResult.getSuccess())
    {
        bizDomScriptArray = bizDomScriptResult.getOutput().toArray();

        for (i in bizDomScriptArray)
        {
            if (bizDomScriptArray[i].getAuditStatus() != 'I')
            {
                vContactTypeArray.push(bizDomScriptArray[i].getBizdomainValue());
            }
        }
    }

    return vContactTypeArray;
}
function logDebugLocal(dstr) {
    if (showDebug)
    {
        aa.print(dstr)
        emailText += dstr + "<br>";
        aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr)
    }
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
function sendNotification(emailFrom, emailTo, emailCC, templateName, params, reportFile) {
    var itemCap = capId;
    if (arguments.length == 7) itemCap = arguments[6]; // use cap ID specified in args
    var id1 = itemCap.ID1;
    var id2 = itemCap.ID2;
    var id3 = itemCap.ID3;
    var capIDScriptModel = aa.cap.createCapIDScriptModel(id1, id2, id3);
    var result = null;
    result = aa.document.sendEmailAndSaveAsDocument(emailFrom, emailTo, emailCC, templateName, params, capIDScriptModel, reportFile);
    if (result.getSuccess())
    {
        logDebug("Sent email successfully!");
        return true;
    }
    else
    {
        logDebug("Failed to send mail. - " + result.getErrorType());
        return false;
    }
}