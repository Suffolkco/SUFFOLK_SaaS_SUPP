// Script Initalizer:
aa.env.setValue("BatchJobName","DCA_LICENSE_RENEWALS")
aa.env.setValue("appGroup","ConsumerAffairs")
aa.env.setValue("fromDate","")
aa.env.setValue("toDate","")
aa.env.setValue("lookAheadDays",30)
aa.env.setValue("daySpan",5)
aa.env.setValue("expirationStatus","Active")

/*------------------------------------------------------------------------------------------------------/
| START: USER CONFIGURABLE PARAMETERS
/------------------------------------------------------------------------------------------------------*/
var SCRIPT_VERSION = 3.0;
var useCustomScriptFile = true;  // if true, use Events->Custom Script, else use Events->Scripts->INCLUDES_CUSTOM
var SA = null;
var SAScript = null;

//BEGIN Includes - Include master scripts and global variables
if (SA) {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA,useCustomScriptFile));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS", SA,useCustomScriptFile));
	eval(getScriptText(SAScript, SA));
} else {
	//eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,useCustomScriptFile));
	//eval(getScriptText("INCLUDES_ACCELA_GLOBALS",null,useCustomScriptFile));
}

//Include INCLUDES_CUSTOM scripts
eval(getScriptText("INCLUDES_CUSTOM",null,useCustomScriptFile));

//Global variables
br = "\n<br>";
showDebug = true;			// Set to true to see debug messages in email confirmation
showMessage = true;			// Set to true to see debug messages in email confirmation
currentUserID = aa.env.getValue("CurrentUserID");

var emailText = "";
var maxSeconds = 15 * 60;		// number of seconds allowed for batch processing, usually < 5*60
var timeExpired = false;
var sysDate = aa.date.getCurrentDate();
var currDate = new Date();
var batchJobID = 0;
var batchJobResult = aa.batchJob.getJobID()
var batchJobName = "DCA_LICENSE_RENEWALS";
var systemUserObj = aa.person.getUser("ADMIN").getOutput();

var paramsOK = true;
var recordIDText = "";
/*------------------------------------------------------------------------------------------------------/
| END: USER CONFIGURABLE PARAMETERS
/------------------------------------------------------------------------------------------------------*/
if (batchJobResult.getSuccess())
{
	batchJobID = batchJobResult.getOutput();
	logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID);
}
else
{
	logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());
}
/*----------------------------------------------------------------------------------------------------/
| Start: BATCH PARAMETERS
/------------------------------------------------------------------------------------------------------*/

/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
//var fromDate = getParam("fromDate");					//
var startDate = new Date();
var todayDate = (startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear();
logMessage("Today's date: " + todayDate);

//var fromDate = "05/28/2020";		
var fromDate = todayDate;			
var toDate = "";						//
var dFromDate = aa.date.parseDate(fromDate);			//
var dToDate = aa.date.parseDate(toDate);				//
var appGroup = "ConsumerAffairs";					// app Group to process {Licenses}
var appTypeType = "Licenses,ID Cards,Registrations";				// app type to process {Rental License}
var appTypeTypeArray = appTypeType.split(",");
var appSubtype = "*";				// app subtype to process {NA}
var appCategory = "*";				// app category to process {NA}
var lookAheadDays = 30;   // Number of days from today
var daySpan = 5;				// Days to search (6 if run weekly, 0 if daily, etc.)
//var newAppStatus = getParam("newApplicationStatus");	// update the CAP to this status
var processAppStatusArray = "Active,License Active,Shelved";
var emailSender = "monthlycalicensingrenewals@suffolkcountyny.gov";			// email sender account
//var emailAddress = getParam("emailAddress");		// email to send the batch job result

/*----------------------------------------------------------------------------------------------------/
| End: BATCH PARAMETERS
/------------------------------------------------------------------------------------------------------*/
 
var timeExpired = false;

var altId;
var capId;

//New renewal record variables
var capStatus;
var appTypeString;

var currentUserID = aa.env.getValue("CurrentUserID");
var publicUser = false;
var emailReport;

var startTime = startDate.getTime();			// Start timer
var systemUserObj = aa.person.getUser("ADMIN").getOutput();

var useAppSpecificGroupName = false;
var thisType;

//Validate Record Types
if (appGroup=="") appGroup="*";
if (appTypeType=="") appTypeType="*";
if (appSubtype=="") appSubtype="*";
if (appCategory=="") appCategory="*";
var appType = appGroup+"/"+appTypeType+"/"+appSubtype+"/"+appCategory;

//Validate workflow parameters
var paramsOK = true;

if (!fromDate.length) // no "from" date, assume today + number of days to look ahead
	fromDate = dateAdd(null,parseInt(lookAheadDays))

if (!toDate.length)  // no "to" date, assume today + number of look ahead days + span
{
	toDate = dateAdd(fromDate,parseInt(lookAheadDays)+parseInt(daySpan));
	dToDate = aa.date.parseDate(toDate);	
}

logMessage("","**********************************************************");
logMessage("","    Date Range - fromDate: " + fromDate + ", toDate: " + toDate)
logMessage("","**********************************************************");

/*------------------------------------------------------------------------------------------------------/
| Main Process
/------------------------------------------------------------------------------------------------------*/
if (paramsOK)
{
	logMessage("","**********************************************************");
	logMessage("","           Start of Job");
	logMessage("","**********************************************************");
	if (!timeExpired) 
	{
		try 
		{		
			mainProcess();
		} 
		catch (err) 
		{
			logDebug("ERROR: " + err.message + " In " + batchJobName + " Line " + err.lineNumber);
			logDebug("Stack: " + err.stack);			
		}	
	}
	logMessage("","**********************************************************");
	logMessage("","End of Job: " + batchJobName + " Elapsed Time : " + elapsed() + " Seconds");
	logMessage("","**********************************************************");	
	//aa.eventLog.createEventLog("License Renewal", "Batch Process", batchJobName, sysDate, sysDate,"License Renewal", "Job was completed." , batchJobID);
	//if (emailAddress.length) aa.sendMail(emailSender, emailAddress, "", batchJobName + " Results", emailText + " - End of Job: " + batchJobName + " Elapsed Time : " + elapsed() + " Seconds");
}
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
function mainProcess()
{
	var capFilterExpNull = 0;
	var capFilterExpDays = 0;
	var capFilterInactive = 0;
	var capFilterError = 0;
	var capFilterStatus = 0;
	var capCount = 0;
	var totalCAPS = 0;
	var emailSent = 0;	
	var missingEmailAddress = 0;

	var	expDate;
	var	expDateTemp;
	var conEmail;
	var emailSubject;
	var	emailContent;
	

	//Set current date
	//var sCurrDate = currDate.getFullYear() + "/" + ("0" + (currDate.getMonth() + 1)).slice(-2) + "/" + ("0" + (currDate.getDate())).slice(-2);	
	 ;
	//Get record by type
	for (xx in appTypeTypeArray) 
	{
		thisType = appTypeTypeArray[xx];		
		logDebug("-------------------------------------------------------------------------------");
		logDebug("    Record Types: " + appGroup + "/" + thisType + "/" + appSubtype + "/" + appCategory)
		var expResult = aa.cap.getByAppType(appGroup, thisType);
		//var expResult = aa.cap.getByAppType("ConsumerAffairs", "Licenses", "Master Electrician", "NA");		
		//ConsumerAffairs/ID Cards/Appliance Repair ID Card-Sales/NA
		//var expResult = aa.cap.getByAppType("ConsumerAffairs","*");
	
		if (expResult.getSuccess())
		{
			myExp = expResult.getOutput();
			totalCAPS = totalCAPS + myExp.length;
			logDebug("        Processing " + myExp.length + " expiration records");			
		}
		else
		{ 
			logDebug("ERROR: Getting Expirations, reason is: " + expResult.getErrorType() + ":" + expResult.getErrorMessage()); 
			return false;
		}
		
		//Set timeout
		for (thisExp in myExp)
		{			
			// only continue if time hasn't expired
			if (elapsed() > maxSeconds) 
			{
				logDebug("A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.") ;
				timeExpired = true ;
				break;
			}
	
			b1Exp = myExp[thisExp];
			
			capId = aa.cap.getCapID(b1Exp.getCapID().getID1(),b1Exp.getCapID().getID2(),b1Exp.getCapID().getID3()).getOutput();
			altId = capId.getCustomID();
			
			
			var b1Status = b1Exp.getCapStatus();
	
			// Filter by CAP Status
			//if (!exists(b1Status,processAppStatusArray))
			if (b1Status != "Active" &&  b1Status != "License Active" && b1Status != "Shelved")
			{
				capFilterStatus++;
				//logDebug(altId + ": skipping due to application status of " + capStatus);
				continue;
			}						
			
			//get the expiration date from ASI "Expiration Date"
			expDateTemp = getAppSpecific("Expiration Date");	

			//Validate the expiration date		
			if (expDateTemp === '' || expDateTemp === null || typeof(expDateTemp) === 'undefined')
			{
				capFilterExpNull++;
				//logDebug(altId + ": skipping due to expiration date null or empty.");
				continue;
			}			
			
			
			//Validate the expiration date 30 dyas before expiring
			var difDays = daysBetween(expDateTemp,toDate)
				
			
			if (difDays > -5 && difDays <= 5)
			{
				logDebug("DifDays: " + difDays +", Expiration date:" + expDateTemp + ", Status:" + b1Status + "Record ID: " + altId);
			}
			else
			{
				capFilterExpDays++;
				//logDebug(altId + ": skipping due to expiration date not meet (" + lookAheadDays + " days rule).");
				continue;				
			}

            var contactArray = getPeople(capId);
            if(contactArray)
            {
                for(thisContact in contactArray) 
                {			
                    //logDebug("Contact: " + contactArray[thisContact].getPeople().contactType);

                    if((contactArray[thisContact].getPeople().contactType).toUpperCase() == "VENDOR")
                    {

						if (matches(contactArray[thisContact].email, null, undefined, ""))
						{
							logDebug("No email has been found for altid: " + altId + ". Contact: " + contactArray[thisContact].getPeople().firstName + " " +
							contactArray[thisContact].getPeople().lastname);
							missingEmailAddress++;
						}
						else
						{

							//conEmail = "jabfree@hotmail.com"; //comment this line only debug*************
							emailSubject = "Your license " + altId + " is set to expire - " + expDateTemp ;						
							emailContent = "Dear Licensee:<br><br>"
											+ "Your license, registration or ID Card is set to expire. " + altId + "<br><br>"
											+ "Please return the enclosed renewal application with payment and all supporting certificates, class/endorsement requirements and/or other documentation needed to renew.<br><br>"
											+ "Please make sure all of the renewal form is completely filled out where noted.<br><br>"
											+ "Your check or money order must be payable to Suffolk County Consumer Affairs and returned/mailed to the address below:<br>"
											+ "            PO BOX 6100<br>"
											+ "            HAUPPAUGE, NEW YORK 11788<br><br>"
											+ "If you need more information please contact Suffolk County Consumer Affairs at consumer.affairs@suffolkcountyny.gov or by phone (631) 853-4599.<br><br>"						
											+ "-----------------------------------------------------------------<br>"
											+ "DIVISION OF CONSUMER AFFAIRS<br>"
											+ "Suffolk County Department of Labor, Licensing & Consumer Affairs<br>"
											+ "Rosalie Drago -- Steven Bellone<br>"
											+ "Commissioner --   Suffolk County Executive";
								reportName = "CA Renewal Notifications SSRS V2";
								//reportName = "License Renewal - Driver";
								//conEmail = "ada.chan@suffolkcountyny.gov"; 
								conEmail = contactArray[thisContact].email;
								emailReport = "";

								var reportParams = aa.util.newHashtable();
								reportParams.put("RecordID", altId);
								reportParams.put("FromDate", fromDate);
								//reportParams.put("FromDate", dFromDate);
								reportParams.put("ToDate", toDate);
								reportParams.put("Email", "Yes");
								//reportParams.put("ToDate", dToDate);
								var reportFile = new Array();
								
							
								try
								{
									logDebug("Load Report: " + reportName + " with params: " +  reportParams);
																								
								//returns the report file which can be attached to an email.
									var user = currentUserID;   // Setting the User Name
																	
									reportResult = aa.reportManager.getReportInfoModelByName(reportName);

									if (!reportResult.getSuccess())
										{ logDebug("**WARNING** couldn't load report " + reportName + " " + reportResult.getErrorMessage()); return false; }

									var report = reportResult.getOutput(); 

									var itemCap = aa.cap.getCap(capId).getOutput();
									appTypeResult = itemCap.getCapType();
									appTypeString = appTypeResult.toString(); 
									appTypeArray = appTypeString.split("/");
									logDebug("Module: " + appTypeArray[0]);
									report.setModule(appTypeArray[0]); 
									report.setCapId(capId.getID1() + "-" + capId.getID2() + "-" + capId.getID3()); 
									report.getEDMSEntityIdModel().setAltId(altId);								
									report.setReportParameters(reportParams);

									var permit = aa.reportManager.hasPermission(reportName,"ADMIN"); 
									if(permit.getOutput().booleanValue()) 
									{ 
										var reportResult = aa.reportManager.getReportResult(report); 
										//logDebug("Report " + reportName + " has been run for " + altId);
										
										reportResult = reportResult.getOutput(); 			
										if (reportResult != null)
										{								
											reportFile = aa.reportManager.storeReportToDisk(reportResult);
											reportFile = reportFile.getOutput();			
										}
										else
										{
											logDebug("Report result was " + reportResult + ", verify report name and parameters. ");
										}		
									}
									else
										logDebug("No permission to report: "+ reportName + " for user: " + currentUserID);						

								}
								catch (err)
								{
									logDebug("ERROR: " + err.message + " In " + batchJobName + " Line " + err.lineNumber);
									logDebug("Stack: " + err.stack);			
								}
								if (reportFile) {
									// TEST only. Want only 1 email sent.							
									//if (emailSent <  5)
									//{
										aa.sendEmail(emailSender, conEmail, "", emailSubject , emailContent , reportFile);										
									//}		
									logDebug("*** Email to be sent: " + altId + ". Record Types: " + appCategory + "***.")
									emailSent++;
									recordIDText = recordIDText + "," + altId;
								}
						}
									

                        capCount++;
					}
				}
			}
		}
		logDebug("-------------------------------------------------------------------------------");			
	}
			
	logMessage("","------------------------------------------------------------");
	logMessage("","		Total CAPS qualified to process: " + totalCAPS);
	logMessage("","		Ignored due to exp date null or empty: " + capFilterExpNull);
	logMessage("","		Ignored due to exp date no meet the rule: " + capFilterExpDays);
	logMessage("","		Ignored due to CAP Status: " + capFilterStatus);
	logMessage("","		Ignored due to missing email address: " + missingEmailAddress);
	logMessage("","		Total email sent: " + emailSent);
	logMessage("","		Total CAPS processed: " + capCount);
	logMessage("","		Emails sent to: " + recordIDText);
	logMessage("","------------------------------------------------------------");		
}


/*------------------------------------------------------------------------------------------------------/
| 			External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/


/*------------------------------------------------------------------------------------------------------/
									Accela Functions  
					Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/
//Gets parameter value and logs message showing param value
function getParam(pParamName) 
{
	var ret = "" + aa.env.getValue(pParamName);
	logDebug("Parameter : " + pParamName+" = "+ret);
	return ret;
}
function matches(eVal, argList) {
	for (var i = 1; i < arguments.length; i++) {
		if (arguments[i] == eVal) {
			return true;
		}
	}
	return false;
} 

function getPeople(capId)
{
  capPeopleArr = null;
  var s_result = aa.people.getCapContactByCapID(capId);
  if(s_result.getSuccess())
  {
    capPeopleArr = s_result.getOutput();
    if (capPeopleArr == null || capPeopleArr.length == 0)
    {
      aa.print("WARNING: no People on this CAP:" + capId);
      capPeopleArr = null;
    }
  }
  else
  {
    aa.print("ERROR: Failed to People: " + s_result.getErrorMessage());
    capPeopleArr = null;  
  }
  return capPeopleArr;
}
function elapsed() 
{
	var thisDate = new Date();
	var thisTime = thisDate.getTime();
	return ((thisTime - startTime) / 1000)
}

//Gets the script contect
function getScriptText(vScriptName, servProvCode, useProductScripts) 
{
	if (!servProvCode)  servProvCode = aa.getServiceProviderCode();
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try 
	{
		if (useProductScripts) 
		{
			var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
		} 
		else 
		{
			var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
		}
		return emseScript.getScriptText() + "";
	} 
	catch (err) 
	{
		return "";
	}
}

function dateAdd(td, amt)
// perform date arithmetic on a string
// td can be "mm/dd/yyyy" (or any string that will convert to JS date)
// amt can be positive or negative (5, -3) days
// if optional parameter #3 is present, use working days only
{

	var useWorking = false;
	if (arguments.length == 3)
		useWorking = true;

	if (!td)
		dDate = new Date();
	else
		dDate = convertDate(td);

	var i = 0;
	if (useWorking)
		if (!aa.calendar.getNextWorkDay) {
			logDebug("getNextWorkDay function is only available in Accela Automation 6.3.2 or higher.");
			while (i < Math.abs(amt)) {
				dDate.setDate(dDate.getDate() + parseInt((amt > 0 ? 1 : -1), 10));
				if (dDate.getDay() > 0 && dDate.getDay() < 6)
					i++
			}
		} else {
			while (i < Math.abs(amt)) {
				if (amt > 0) {
					dDate = new Date(aa.calendar.getNextWorkDay(aa.date.parseDate(dDate.getMonth() + 1 + "/" + dDate.getDate() + "/" + dDate.getFullYear())).getOutput().getTime());
					i++;
				} else {
					dDate = new Date(aa.calendar.getPreviousWorkDay(aa.date.parseDate(dDate.getMonth() + 1 + "/" + dDate.getDate() + "/" + dDate.getFullYear())).getOutput().getTime());
					i++;

				}
			}
		}
	else
		dDate.setDate(dDate.getDate() + parseInt(amt, 10));

	return (dDate.getMonth() + 1) + "/" + dDate.getDate() + "/" + dDate.getFullYear();
}

function convertDate(thisDate) {
    //converts date to javascript date
    if (typeof (thisDate) == "string") {
        var retVal = new Date(String(thisDate));
        if (!retVal.toString().equals("Invalid Date"))
            return retVal;
    }
    if (typeof (thisDate) == "object") {
        if (!thisDate.getClass) { // object without getClass, assume that this is a javascript date already 
            return thisDate;
        }
        if (thisDate.getClass().toString().equals("class com.accela.aa.emse.dom.ScriptDateTime")) {
            return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
        }
        if (thisDate.getClass().toString().equals("class java.util.Date")) {
            return new Date(thisDate.getTime());
        }
        if (thisDate.getClass().toString().equals("class java.lang.String")) {
            return new Date(String(thisDate));
        }
    }
    if (typeof (thisDate) == "number") {
        return new Date(thisDate); // assume milliseconds
    }
    logDebug("**WARNING** convertDate cannot parse date : " + thisDate);
    return null;
}

function logDebug(dstr)
{
	//if (showDebug.substring(0,1).toUpperCase().equals("Y"))
	if(showDebug)
	{
		aa.print(dstr)
		//emailText+= dstr + "<br>";
		//aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"),dstr)
	}
}

function logMessage(etype,edesc) 
{
	//aa.eventLog.createEventLog(etype, "Batch Process", batchJobName, sysDate, sysDate,"", edesc,batchJobID);
	aa.print(etype + " : " + edesc);
	emailText+=etype + " : " + edesc + "\n";
	if (etype=="INFO" || etype=="ERROR") 
    {
      userEmailText+=etype + " : " + edesc + "<br> \n";
	}
	else if (etype=="CSR") CSREmailText+= edesc + "<br> \n";
}




function generateReport(aaReportName,parameters,rModule) {
	var reportName = aaReportName;
      
	report = aa.reportManager.getReportInfoModelByName(reportName);
	
	if (report.getSuccess()) 		
	{ 
		logMessage("Report retrieved succesffuly.")
		report = report.getOutput();
	
		report.setModule(rModule);
		report.setCapId(capId);

		report.setReportParameters(parameters);

		var permit = aa.reportManager.hasPermission(reportName,currentUserID);

		if(permit.getOutput().booleanValue()) {
		var reportResult = aa.reportManager.getReportResult(report);
		
		if(reportResult) {
			reportResult = reportResult.getOutput();
			var reportFile = aa.reportManager.storeReportToDisk(reportResult);
				logMessage("Report Result: "+ reportResult);
			reportFile = reportFile.getOutput();
			return reportFile
		} else {
				logMessage("Unable to run report: "+ reportName + " for Admin" + systemUserObj);
				return false;
		}
		} else {
			logMessage("No permission to report: "+ reportName + " for Admin" + systemUserObj);
			return false;
		}
	}
	else
	{
		logMessage("Unable to retreive report:" + reportName);
	}
}

//Days Between Two Dates
function daysBetween(date1, date2) 
{
  //Get 1 day in milliseconds
  var one_day=1000*60*60*24;

  // Convert both dates to milliseconds
  var date1_ms = new Date(date1).getTime();
  var date2_ms = new Date(date2).getTime();

  // Calculate the difference in milliseconds
  var difference_ms = date2_ms - date1_ms;
    
  // Convert back to days and return
  return Math.round(difference_ms/one_day);
}

function updateAppStatus(sCapID, stat,cmt)
{
	//updateStatusResult = aa.cap.updateAppStatus(capId,"APPLICATION",stat, sysDate, cmt ,systemUserObj);
	updateStatusResult = aa.cap.updateAppStatus(sCapID,"APPLICATION",stat, sysDate, cmt ,systemUserObj);	
	if (updateStatusResult.getSuccess())
	{
		//logDebug("Updated application status to " + stat + " successfully.");
	}
	else
		logDebug("ERROR: application status update to " + stat + " was unsuccessful.  The reason is "  + updateStatusResult.getErrorType() + ":" + updateStatusResult.getErrorMessage());
}

function getAppSpecific(itemName)  // optional: itemCap
{
	var updated = false;
	var i=0;
	var itemCap = capId;
	if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args
   	
	if (useAppSpecificGroupName)
	{
		if (itemName.indexOf(".") < 0)
			{ logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
		
		
		var itemGroup = itemName.substr(0,itemName.indexOf("."));
		var itemName = itemName.substr(itemName.indexOf(".")+1);
	}
	
    var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
	if (appSpecInfoResult.getSuccess())
 	{
		var appspecObj = appSpecInfoResult.getOutput();
		
		if (itemName != "")
		{
			for (i in appspecObj)
				if( appspecObj[i].getCheckboxDesc() == itemName && (!useAppSpecificGroupName || appspecObj[i].getCheckboxType() == itemGroup) )
				{
					return appspecObj[i].getChecklistComment();
					break;
				}
		} // item name blank
	} 
	else
		{ logDebug( "**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage()) }
}

function updateTask(wfstr, wfstat, wfcomment, wfnote) // optional process name, cap id
{
	var useProcess = false;
	var processName = "";
	if (arguments.length > 4) {
		if (arguments[4] != "") {
			processName = arguments[4]; // subprocess
			useProcess = true;
		}
	}
	var itemCap = capId;
	if (arguments.length == 6)
		itemCap = arguments[5]; // use cap ID specified in args

	var workflowResult = aa.workflow.getTaskItems(itemCap, wfstr, processName, null, null, null);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
		return false;
	}

	if (!wfstat)
		wfstat = "NA";

	for (i in wfObj) {
		var fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) {
			var dispositionDate = aa.date.getCurrentDate();
			var stepnumber = fTask.getStepNumber();
			var processID = fTask.getProcessID();
			if (useProcess)
				aa.workflow.handleDisposition(itemCap, stepnumber, processID, wfstat, dispositionDate, wfnote, wfcomment, systemUserObj, "U");
			else
				aa.workflow.handleDisposition(itemCap, stepnumber, wfstat, dispositionDate, wfnote, wfcomment, systemUserObj, "U");
			//logMessage("Updating Workflow Task " + wfstr + " with status " + wfstat);
			//logDebug("Updating Workflow Task " + wfstr + " with status " + wfstat);
		}
	}
}

// exists:  return true if Value is in Array
function exists(eVal, eArray)
{
	  for (ii in eArray)
	  	if (eArray[ii] == eVal) return true;
	  return false;
}