/*------------------------------------------------------------------------------------------------------/
| Program: DEQ Assigned Task Email Notification.js  Trigger: Batch|  
| This batch script will run daily
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
var showMessage = true;
var timeExpired = false;
var emailAddress = "ada.chan@suffolkcountyny.gov";
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
        logDebugLocal("End Date: " + startDate + br);		
        aa.sendMail("noreplyehimslower@suffolkcountyny.gov", emailAddress, "", "Batch Job - DEQ_OPC_INSPECTION_REPORTS", emailText);
    }
}
/*------------------------------------------------------------------------------------------------------/
| <===========End Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS//
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| <===========End Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

function mainProcess()    

{  
    try 
    {

        var vSQL = "SELECT RECORD_ID as recordNumber, ASSIGNED_USERID# as userId,   ASSIGNED_NAME_F as firstName, ASSIGNED_NAME_M as middleName, ASSIGNED_NAME_L as lastName,  DAYS_SINCE_ASSIGNED, RECORD_STATUS, TASK_IS_ACTIVE, TASK_IS_COMPLETE, ASSIGNED_USERID# FROM V_WORKFLOW WF WHERE DAYS_SINCE_ASSIGNED = 1 AND WF.RECORD_STATUS in ('Pending', 'Resubmitted') AND WF.TASK_IS_ACTIVE = 'Y' AND WF.TASK_IS_COMPLETE ='N' AND WF.RECORD_TYPE in ('Single Family Residence Application', 'Other Than Single Family Residence Application', 'Realty Subdivision Application') AND WF.ASSIGNED_USERID# is not NULL"; 
        var output = "Record ID\n";  		
        		
		var vResult = doSQLSelect_local(vSQL);  	     
		logDebugLocal("Pulling number of WWM records:" +  vResult.length);	
		
	
		for (r in vResult)
        {
            recordID = vResult[r]["recordNumber"];     
            firstName = vResult[r]["firstName"];   	
            middleName = vResult[r]["middleName"];   			
            lastName = vResult[r]["lastName"];   	
            userId = vResult[r]["userId"];  		
            capId = getApplication(recordID);
            capIDString = capId.getCustomID();
            cap = aa.cap.getCap(capId).getOutput();
			logDebugLocal("recordID:" +  recordID);	
            logDebugLocal("firstName:" +  firstName);	
            logDebugLocal("middleName:" +  middleName);	
            logDebugLocal("lastName:" +  lastName);	
            logDebugLocal("userId:" +  userId);	
            var assignUser = aa.person.getUser(userId);
            logDebugLocal("Assgined user: " + assignUser);		


            userOut = getOutput(assignUser);
            logDebugLocal("1: " +userOut);
      

            if (userOut != null)
            {                 
                    
                assUserStr = userOut.toString();
                logDebugLocal("assUserStr: " + assUserStr);
                assUsersplit = assUserStr.split("/");
                assName = assUsersplit[6];
                logDebugLocal("assName: " + assName);
                if (assName != undefined)
                {                                                
                    
                    assignedStaffNameCon = firstName + " " + lastName;
                    var emailParams = aa.util.newHashtable();                                
                    var altId = capId.getCustomID();
                    addParameter(emailParams, "$$ALTID$$", altId);
                    var shortNotes = getShortNotes(capId);
                    addParameter(emailParams, "$$shortNotes$$", shortNotes);                                                  
                    //addParameter(emailParams, "$$assignmentDate$$", assignedDateCon);
                    addParameter(emailParams, "$$assignmentName$$", assignedStaffNameCon);
                    //addParameter(emailParams, "$$dueDate$$", dueDateCon);
                    assignEmail = userOut.getEmail();
                    //assignTitle = userOut[0].getTitle();
                    logDebugLocal("Assigned User email is: " + assignEmail);
                    //logDebug("Assigned User is: " + assName + " and their title is: " + assignTitle);
                    
                    sendNotification("", assignEmail, "", "DEQ_ASSIGNED_USER", emailParams, null);
                    logDebugLocal("Email sent to: " + assignEmail);                  
                }                
                  
            }		
        }                       
    }
    catch (err) 
    {
        logDebugLocal("**ERROR** runtime error " + err.message + " at " + err.lineNumber + " stack: " + err.stack);
    }
}               
  
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/
function logDebugLocal(dstr)
{
    if (showDebug)
    {
        aa.print(dstr)
        emailText += dstr + "<br>";
        aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr)
    }
}
function sendNotification(emailFrom, emailTo, emailCC, templateName, params, reportFile)
{
	var itemCap = capId;
	if (arguments.length == 7) itemCap = arguments[6]; // use cap ID specified in args
	var id1 = itemCap.ID1;
 	var id2 = itemCap.ID2;
 	var id3 = itemCap.ID3;
	var capIDScriptModel = aa.cap.createCapIDScriptModel(id1, id2, id3);
	var result = null;
	result = aa.document.sendEmailAndSaveAsDocument(emailFrom, emailTo, emailCC, templateName, params, capIDScriptModel, reportFile);
	if(result.getSuccess())
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

function addParameter(pamaremeters, key, value)
{
	if(key != null)
	{
		if(value == null)
		{
			value = "";
		}
		pamaremeters.put(key, value);
	}
}

function debugObject(object) {
	 var output = ''; 
	 for (property in object) { 
	   output += "<font color=red>" + property + "</font>" + ': ' + "<bold>" + object[property] + "</bold>" +'; ' + "<BR>"; 
	 } 
	 logDebug(output);
} 

function elapsed() {
	var thisDate = new Date();
	var thisTime = thisDate.getTime();
	return ((thisTime - startTime) / 1000)
}


function getShortNotes() // option CapId
{
	var itemCap = capId
	if (arguments.length > 0)
		itemCap = arguments[0]; // use cap ID specified in args

	var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess())
		{ logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ; return false; }

	var cdScriptObj = cdScriptObjResult.getOutput();

	if (!cdScriptObj)
		{ logDebug("**ERROR: No cap detail script object") ; return false; }

	cd = cdScriptObj.getCapDetailModel();

	var sReturn = cd.getShortNotes();

	if(sReturn != null)
		return sReturn;
	else
        return "";
        
}

function logDebug(dstr) {
	if(showDebug) {
		aa.print(dstr)
		emailText += dstr + "<br>";
		aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"),dstr)
	}
}

function exists(eVal, eArray) {
	  for (ii in eArray)
	  	if (eArray[ii] == eVal) return true;
	  return false;
}

//
// matches:  returns true if value matches any of the following arguments
//
function matches(eVal, argList) {
	for (var i = 1; i < arguments.length; i++) {
		if (arguments[i] == eVal) {
			return true;
		}
	}
	return false;
} 

function getWorkflowStaff(capID, taskName)
{
    var taskHistoryResult = aa.workflow.getWorkflowHistory(capID,taskName,null);
    if(taskHistoryResult.getSuccess())
    {
        var taskArr = taskHistoryResult.getOutput();
        for(obj in taskArr)
        {
            var taskObj = taskArr[obj];
            var sysObj = taskObj.getTaskItem().getSysUser();
            if(sysObj)
            {
                var userResult = aa.person.getUser(sysObj.getFirstName(),sysObj.getMiddleName(),sysObj.getLastName());
                if(userResult.getSuccess())
                {
                    var userObj = userResult.getOutput();
                    return userObj.getUserID();
                }

            }
        }
    }
    else
    {
        logDebug("No task history.")
    }

    return null;
}

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


function convertDate(thisDate)
{

if (typeof(thisDate) == "string")
    {
    var retVal = new Date(String(thisDate));
    if (!retVal.toString().equals("Invalid Date"))
        return retVal;
    }

if (typeof(thisDate)== "object")
    {

    if (!thisDate.getClass) // object without getClass, assume that this is a javascript date already
        {
        return thisDate;
        }

    if (thisDate.getClass().toString().equals("class com.accela.aa.emse.dom.ScriptDateTime"))
        {
        return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
        }
        
    if (thisDate.getClass().toString().equals("class com.accela.aa.emse.util.ScriptDateTime"))
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
    if (thisDate.getClass().toString().equals("class java.sql.Timestamp"))
        {
        return new Date(thisDate.getMonth() + "/" + thisDate.getDate() + "/" + thisDate.getYear());
        }
    }

if (typeof(thisDate) == "number")
    {
    return new Date(thisDate);  // assume milliseconds
    }

logDebug("**WARNING** convertDate cannot parse date : " + thisDate);
return null;

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

function logDebugLocal(dstr)
{
    if (showDebug)
    {
        aa.print(dstr)
        emailText += dstr + "<br>";
        aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr)
    }
}