/*------------------------------------------------------------------------------------------------------/
| Program: DEQ Assigned Task Email Notification.js  Trigger: Batch|  
| This batch script will run daily
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var emailText = "";
var showDebug = true;// Set to true to see debug messages in email confirmation
var maxSeconds = 60 * 5;// number of seconds allowed for batch processing, usually < 5*60
var showMessage = true;
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var useAppSpecificGroupName = false;
var timeExpired = false;
var br = "<BR>";
var emailAddress = "ada.chan@suffolkcountyny.gov";//email to send report
sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID();
batchJobName = "" + aa.env.getValue("BatchJobName");
batchJobID = 0;
if (batchJobResult.getSuccess()) 
{
	batchJobID = batchJobResult.getOutput();
	logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID + br);
}
else
{
	logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());
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
var todayDate = "" + startDate.getFullYear() + "-" + (startDate.getMonth() + 1) + "-" + startDate.getDate();
// all record types to check
//var rtArray = ["DEQ/WWM/Commercial/Application", "DEQ/WWM/Residence/Application", "DEQ/WWM/Subdivision/Application"];
var rtArray = ["DEQ/WWM/Commercial/Application", "DEQ/WWM/Residence/Application", "DEQ/WWM/Subdivision/Application"];
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
	logDebug("Start Date: " + startDate + br);
	logDebug("Starting the timer for this job.  If it takes longer than 5 minutes an error will be listed at the bottom of the email." + br);
	if (!timeExpired) 
	{
		processComResSub();
		aa.sendMail("noreplyehimslower@suffolkcountyny.gov", emailAddress, "", "Batch Job - assigneed Task", emailText);
	}
}
/*------------------------------------------------------------------------------------------------------/
| <===========End Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
function processComResSub() 
{
    var sent = false;
    try 
    {
        for (var i in rtArray) 
        {
            var thisType = rtArray[i];
            var capModel = aa.cap.getCapModel().getOutput();
            var appTypeArray = thisType.split("/");
            // Specify the record type to query
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
                logDebug("**ERROR: Failed to get capId List : " + recordListResult.getErrorMessage());
                continue;
            }
            var recArray = recordListResult.getOutput();
            logDebug("<b>" + thisType + " prior to Preliminary Approval" + "</b>");

            for (var j in recArray) 
            {
                capId = aa.cap.getCapID(recArray[j].getID1(), recArray[j].getID2(), recArray[j].getID3()).getOutput();
                capIDString = capId.getCustomID();
				cap = aa.cap.getCap(capId).getOutput();
				var appStatus = getAppStatus(capId);
                if (capIDString == "C-20-0070")
                {
				// Only if the application has an "Active" status
				if(appStatus == "Pending" || appStatus == "Resubmitted")
				{
					if (cap)
					{
						var workflowResult = aa.workflow.getTasks(capId);
						var appCheck = false;
						
						if (workflowResult.getSuccess())
						{
							var wfObj = workflowResult.getOutput();
						}
						else
						{ 
							logDebug("**ERROR: Failed to get workflow object"); 
						}
						for (i in wfObj)
						{
                            fTask = wfObj[i];
                                                       
							logDebug("Task is: " + fTask.getTaskDescription() + " and the status is: " + fTask.getDisposition());
                            if (fTask.getTaskDescription() != null && (fTask.getTaskDescription() == ("WWM Review") ||  fTask.getTaskDescription() == ("WR Review") || fTask.getTaskDescription() == ("OPC Review")))
							{                  
                                //var assignUser = fTask.getTaskItem().getAssignedUser();

                                var assignUser = aa.people.getUsersByUserIdAndName("", fTask.getAssignedStaff().getFirstName(),fTask.getAssignedStaff().getMiddleName(),fTask.getAssignedStaff().getLastName());

                                if (fTask.getActiveFlag().equals("Y") && assignUser != null)
                                {						
                                    userOut = getOutput(assignUser);
                                    if (userOut != null)
                                    {                 
                                         
                                        var dueDate =  fTask.getDueDate();		

                                        if (dueDate != null)
                                        {
                                            dueDateCon = dueDate.getMonth() + "/" + dueDate.getDayOfMonth() + "/" + dueDate.getYear();
                                            logDebug("Due Date is: " + dueDateCon);					
                                        
                                            var todaysDate = new Date();																
                                            var todDateCon = (todaysDate.getMonth() + 1) + "/" + todaysDate.getDate() + "/" + (todaysDate.getFullYear());
                                            var assignedDate = fTask.getAssignmentDate();
                                            assignedDateCon = (assignedDate.getMonth()) + "/" + assignedDate.getDayOfMonth()+ "/" + assignedDate.getYear();
                                            logDebug("Assigned Date is: " + assignedDateCon);
                                            logDebug("Today Date is: " + todDateCon + ".Assigned Date is: " + assignedDateCon);	
                                            
                                            var dateDiff = parseFloat(dateDifference(assignedDate, todDateCon));

                                            logDebug("Day difference is: " + dateDiff);
                                                                            
                                            // Assigned yesterday
                                            if (dateDiff == 1)
                                            {
                                                assUserStr = userOut[0].toString();
                                                logDebug("assUserStr: " + assUserStr);
                                                assUsersplit = assUserStr.split("/");
                                                assName = assUsersplit[6];
                                                logDebug("assName: " + assName);
                                                if (assName != undefined)
                                                {
                                                    logDebug("Active Flag: " + fTask.getActiveFlag());									       
                                                   
                                                    assignedStaffNameCon = fTask.getAssignedStaff().getFirstName() + " " + fTask.getAssignedStaff().getLastName();
                                                    var emailParams = aa.util.newHashtable();                                
                                                    var altId = capId.getCustomID();
                                                    addParameter(emailParams, "$$ALTID$$", altId);
                                                    var shortNotes = getShortNotes(capId);
                                                    addParameter(emailParams, "$$shortNotes$$", shortNotes);                                                  
                                                    //addParameter(emailParams, "$$assignmentDate$$", assignedDateCon);
                                                    addParameter(emailParams, "$$assignmentName$$", assignedStaffNameCon);
                                                    //addParameter(emailParams, "$$dueDate$$", dueDateCon);
                                                    assignEmail = userOut[0].getEmail();
                                                    //assignTitle = userOut[0].getTitle();
                                                    logDebug("Assigned User email is: " + assignEmail);
                                                    //logDebug("Assigned User is: " + assName + " and their title is: " + assignTitle);
                                                   
                                                    sendNotification("", assignEmail, "", "DEQ_ASSIGNED_USER", emailParams, null);
                                                    logDebug("Email sent to: " + assignEmail);                  
                                                }
                                        
                                            }
                                        }
                                        
                                    }
                                }	}
                            }		
						}		
				
					}
				}
				
			}
        }                       
    }
    catch (err) 
    {
        logDebug("**ERROR** runtime error " + err.message + " at " + err.lineNumber + " stack: " + err.stack);
    }
}               
  
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/

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
 


function getAppStatus() {
	var itemCap = capId;
	if (arguments.length == 1) itemCap = arguments[0]; // use cap ID specified in args

	var appStatus = null;
   var capResult = aa.cap.getCap(itemCap);
   if (capResult.getSuccess()) {
      licCap = capResult.getOutput();
      if (licCap != null) {
         appStatus = "" + licCap.getCapStatus();
      }
   } else {
		logDebug("ERROR: Failed to get app status: " + capResult.getErrorMessage());
	}
	return appStatus;
}