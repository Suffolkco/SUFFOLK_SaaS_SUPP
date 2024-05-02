/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_CA_TASK_ASSIGNED_EMAIL_NOTIFICATION.js
| Trigger: Batch
| Client: Suffolk
| Version 1.0 04/09/2021
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

function getMasterScriptText(vScriptName)
{
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

function getScriptText(vScriptName)
{
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
    logDebugLocal("Batch Job " + batchJobName + " Job ID is " + batchJobID + br);
}
else
{
    logDebugLocal("Batch job ID not found " + batchJobResult.getErrorMessage());
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
var fromDate = aa.date.parseDate("1/1/1980");
var toDate = aa.date.parseDate((new Date().getMonth() + 1) + "/" + new Date().getDate() + "/" + new Date().getFullYear());
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
    if (!timeExpired) 
    {
        mainProcess();
        //logDebugLocal("End of Job: Elapsed Time : " + elapsed() + " Seconds");
        logDebugLocal("End Date: " + startDate);
        aa.sendMail("licensing@suffolkcountyny.gov", emailAddress, "", "Batch Job - BATCH_CA_TASK_ASSIGNED_EMAIL_NOTIFICATION", emailText);
    }
}
/*------------------------------------------------------------------------------------------------------/
| <===========End Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
function mainProcess() 
{
    try
    {
        var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), sysDate.getYear(), "");
        // Test
        //sysDateMMDDYYYY='12/01/2022';
        dateCheckString = sysDateMMDDYYYY;
        dateCheckString1 = dateCheckString.replace(/\b0/g, '');

        logDebugLocal("Date to check: " + dateCheckString);        
        logDebugLocal("Date to check 1: " + dateCheckString1);

        var vSQL = "select RECORD_ID as recordNumber from V_WORKFLOW where RECORD_MODULE = 'ConsumerAffairs' and TASK in ('Issuance', 'Application') and ASSIGNED_USERID# is NOT NULL AND TASK_IS_ACTIVE = 'Y'";       
        var vResult = doSQLSelect_local(vSQL); 
        logDebugLocal("Result returned: " + vResult.length);

        var count = 0;

        for (r in vResult)
        {
            recordID = vResult[r]["recordNumber"];          
            capId = getApplication(recordID);
            capIDString = capId.getCustomID();
            cap = aa.cap.getCap(capId).getOutput();
            appTypeResult = cap.getCapType();
            appTypeString = appTypeResult.toString();
            appTypeArray = appTypeString.split("/");
            logDebug("Record Type: " + appTypeString);     

            if (cap)
            {
                var capmodel = aa.cap.getCap(capId).getOutput().getCapModel();
                if (capmodel.isCompleteCap())
                {
                    if (matches(appTypeArray[1], "Registrations", "ID Cards", "Licenses", "TLC", "Inspections")) 
                    {
                        var workflowResult = aa.workflow.getTasks(capId);
                                        
                        if (workflowResult.getSuccess())
                        {
                            var wfObj = workflowResult.getOutput();
                        }
                        else
                        { 
                            logDebugLocal("**ERROR: Failed to get workflow object"); 
                        }
                        for (i in wfObj)
                        {
                            fTask = wfObj[i];
                                        
                            var assignUser = aa.people.getUsersByUserIdAndName("", fTask.getAssignedStaff().getFirstName(),fTask.getAssignedStaff().getMiddleName(),fTask.getAssignedStaff().getLastName());

                            if (fTask.getActiveFlag().equals("Y") && assignUser != null)
                            {						
                                userOut = getOutput(assignUser);
                                
                                if (userOut != null)
                                {                 
                                                                
                                    if (fTask.getTaskDescription() != null && (fTask.getTaskDescription() == ("Application") ||  fTask.getTaskDescription() == ("Issuance"))) 
                                    {               
                                        var assignedDate = fTask.getAssignmentDate();
                                        var todaysDate = new Date();																
                                        var todDateCon = (todaysDate.getMonth() + 1) + "/" + todaysDate.getDate() + "/" + (todaysDate.getFullYear());
                                    
                                        assignedDateCon = (assignedDate.getMonth()) + "/" + assignedDate.getDayOfMonth()+ "/" + assignedDate.getYear();
                                    
                                                                            
                                        var dateDiff = parseFloat(dateDifference(assignedDate, todDateCon));
                                        
                                                                        
                                        // Assigned today
                                        if (dateDiff == 0)
                                        {       
                                            logDebugLocal(appTypeString)
                                            logDebugLocal(capIDString + ": Today Date is: " + todDateCon + ". Assigned Date is: " + assignedDateCon); 
                                            logDebugLocal("Task is active: " + fTask.getTaskDescription() + " and the status is: " + fTask.getDisposition());                   
                                            assignedStaffNameCon = fTask.getAssignedStaff().getFirstName() + " " + fTask.getAssignedStaff().getLastName();
                                            var emailParams = aa.util.newHashtable();                                
                                            var altId = capId.getCustomID();
                                            addParameter(emailParams, "$$altID$$", altId);
                                            var shortNotes = getShortNotes(capId);
                                            addParameter(emailParams, "$$shortNotes$$", shortNotes);                                                  
                                            //addParameter(emailParams, "$$assignmentDate$$", assignedDateCon);
                                            addParameter(emailParams, "$$assignmentName$$", assignedStaffNameCon);
                                            //addParameter(emailParams, "$$dueDate$$", dueDateCon);                                     
                                            assignEmail = userOut[0].getEmail();
                                            
                                            logDebug("Assigned User email is: " + assignEmail);
                                            //logDebug("Assigned User is: " + assName + " and their title is: " + assignTitle);
                                            
                                            sendNotification("", assignEmail, "", "DCA_LIC_TASK_ASSIGNED", emailParams, null);
                                            logDebugLocal("Email sent to: " + assignEmail);       
                                            count++;
                                        
                                        }                        
                                    }
                                
                                }		
                            }		
                        }
                    
                    }
                    else
                    {
                        logDebugLocal("Skip: Exclude record type" + appTypeArray);
                    }
                }
            }
        }
        logDebugLocal("Number of emails sent " + count);
				
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
function getOutput(result, object) {
    if (result.getSuccess()) {
        return result.getOutput();
    } else {
        logDebug("ERROR: Failed to get " + object + ": " + result.getErrorMessage());
        return null;
    }
}
function dateDifference(date1, date2)
{
    return (convertDate(date2).getTime() - convertDate(date1).getTime()) / (1000 * 60 * 60 * 24);
}

function getContactName(vConObj)
{
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
function matches(eVal, argList)
{
    for (var i = 1; i < arguments.length; i++)
    {
        if (arguments[i] == eVal)
        {
            return true;
        }
    }
    return false;
}

function dateDiff(date1, date2)
{
    return (convertDate(date2).getTime() - convertDate(date1).getTime()) / (1000 * 60 * 60 * 24);
}
function convertDate(thisDate)
{
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
function elapsed()
{
    var thisDate = new Date();
    var thisTime = thisDate.getTime();
    return ((thisTime - startTime) / 1000)
}
function logDebugLocal(dstr)
{
    if (showDebug)
    {
        aa.print(dstr)
        emailText += dstr + "<br>";
        aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr)
    }
}
function exists(eVal, eArray)
{
    for (ii in eArray)
        if (eArray[ii] == eVal) return true;
    return false;
}
function getAppStatus()
{
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
function doSQLSelect_local(sql)
{
    try
    {
        //logdebug("iNSIDE FUNCTION");
        var array = [];
        var conn = aa.db.getConnection();
        var sStmt = conn.prepareStatement(sql);
        if (sql.toUpperCase().indexOf("SELECT") == 0)
        {
            //logdebug("executing " + sql);
            var rSet = sStmt.executeQuery();
            while (rSet.next())
            {
                var obj = {};
                var md = rSet.getMetaData();
                var columns = md.getColumnCount();
                for (i = 1; i <= columns; i++)
                {
                    obj[md.getColumnName(i)] = String(rSet.getString(md.getColumnName(i)));
                    //logdebug(rSet.getString(md.getColumnName(i)));
                }
                obj.count = rSet.getRow();
                array.push(obj)
            }
            rSet.close();
            //logdebug("...returned " + array.length + " rows");
            //logdebug(JSON.stringify(array));
        }
        sStmt.close();
        conn.close();
        return array
    } catch (err)
    {
        //logdebug("ERROR: "+ err.message);
        return array
    }
}

function editAppSpecificL(itemName,itemValue, itemCap){

    var itemGroup = null;

    if (useAppSpecificGroupName){
        if (itemName.indexOf(".") < 0){ logDebug("**WARNING: (editAppSpecific) requires group name prefix when useAppSpecificGroupName is true") ; return false }
        itemGroup = itemName.substr(0,itemName.indexOf("."));
        itemName = itemName.substr(itemName.indexOf(".")+1);
    }
    
    var asiFieldResult = aa.appSpecificInfo.getByList(itemCap, itemName);
    if(asiFieldResult.getSuccess()){
        var asiFieldArray = asiFieldResult.getOutput();
        if(asiFieldArray.length > 0){
            var asiField = asiFieldArray[0];
            if(asiField){
                //printObjProperties(asiField);
                var origAsiValue = asiField.getChecklistComment();
                if(origAsiValue && origAsiValue != null && origAsiValue.trim() != ""){
                    logDebugLocal("SKIPPING ... PIN Value already set for record " + itemCap + " : " + origAsiValue);
                    return false;
                }
                asiField.setChecklistComment(itemValue);
                asiField.setAuditStatus("A");
                var updateFieldResult = aa.appSpecificInfo.editAppSpecInfoValue(asiField);
                if(updateFieldResult.getSuccess()){
                    logDebugLocal("Successfully updated custom field: " + itemName + " with value: " + itemValue);
                    return true;
                } else { 
                    logDebugLocal( "WARNING: (editAppSpecificL) " + itemName + " was not updated."); 
                    return false;
                }	
            } else { 
                logDebugLocal( "WARNING: (editAppSpecificL) " + itemName + " was not updated."); 
                return false;
            }
        }
    } else {
        logDebugLocal("ERROR: (editAppSpecificL) " + asiFieldResult.getErrorMessage());
        return false;
    }
    return false;
} 

function makePIN(length) {
    var result = '';
    var characters = 'ABCDEFGHJKMNPQRTWXY2346789';
    var charactersLength = characters.length;
    
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
       
    }
    return result;
}


