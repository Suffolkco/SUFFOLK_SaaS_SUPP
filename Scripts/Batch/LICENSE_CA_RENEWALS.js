aa.env.setValue("BatchJobName","LICENSE_CA_RENEWALS")
aa.env.setValue("appGroup","ConsumerAffairs")
aa.env.setValue("appTypeType","ID Cards,Licenses,Registrations")
aa.env.setValue("appSubtype","*")
aa.env.setValue("appCategory","*")
aa.env.setValue("fromDate","")
aa.env.setValue("toDate","")
aa.env.setValue("lookAheadDays",-30)
aa.env.setValue("daySpan",0)
aa.env.setValue("newApplicationStatus","Pending Renewal")	//Main record
aa.env.setValue("processAppStatus","License Active,Active,Pending Issuance")
aa.env.setValue("emailSender","Matthew Cereola <matthew.cereola@suffolkcountyny.gov>") //noreply@suffolkcountyny.gov
aa.env.setValue("emailAddress","Matthew Cereola <matthew.cereola@suffolkcountyny.gov>")

/*
--Renewal = LICENSE_CA_RENEWALS
Insert into BATCH_JOB_PARAMETER (SERV_PROV_CODE,BATCH_JOB_NAME,R1_PARAMETER_NAME,R1_PARAMETER_DESC,R1_PARAMETER_VALUE,R1_PARAMETER_VALUE_TYPE,R1_REQUIRE_FLAG,R1_DISPLAY_ORDER,REC_DATE,REC_FUL_NAM,REC_STATUS) values ('SUFFOLKCO','LICENSE_CA_RENEWALS','BatchJobName',null,'LICENSE_CA_RENEWALS','Text','Y',10,to_timestamp('25-SEP-18','DD-MON-RR HH.MI.SSXFF AM'),'ADMIN','A');
Insert into BATCH_JOB_PARAMETER (SERV_PROV_CODE,BATCH_JOB_NAME,R1_PARAMETER_NAME,R1_PARAMETER_DESC,R1_PARAMETER_VALUE,R1_PARAMETER_VALUE_TYPE,R1_REQUIRE_FLAG,R1_DISPLAY_ORDER,REC_DATE,REC_FUL_NAM,REC_STATUS) values ('SUFFOLKCO','LICENSE_CA_RENEWALS','appCategory',null,'*','Text','Y',50,to_timestamp('25-SEP-18','DD-MON-RR HH.MI.SSXFF AM'),'ADMIN','A');
Insert into BATCH_JOB_PARAMETER (SERV_PROV_CODE,BATCH_JOB_NAME,R1_PARAMETER_NAME,R1_PARAMETER_DESC,R1_PARAMETER_VALUE,R1_PARAMETER_VALUE_TYPE,R1_REQUIRE_FLAG,R1_DISPLAY_ORDER,REC_DATE,REC_FUL_NAM,REC_STATUS) values ('SUFFOLKCO','LICENSE_CA_RENEWALS','appGroup',null,'ConsumerAffairs','Text','Y',20,to_timestamp('25-SEP-18','DD-MON-RR HH.MI.SSXFF AM'),'ADMIN','A');
Insert into BATCH_JOB_PARAMETER (SERV_PROV_CODE,BATCH_JOB_NAME,R1_PARAMETER_NAME,R1_PARAMETER_DESC,R1_PARAMETER_VALUE,R1_PARAMETER_VALUE_TYPE,R1_REQUIRE_FLAG,R1_DISPLAY_ORDER,REC_DATE,REC_FUL_NAM,REC_STATUS) values ('SUFFOLKCO','LICENSE_CA_RENEWALS','appSubtype',null,'*','Text','Y',40,to_timestamp('25-SEP-18','DD-MON-RR HH.MI.SSXFF AM'),'ADMIN','A');
Insert into BATCH_JOB_PARAMETER (SERV_PROV_CODE,BATCH_JOB_NAME,R1_PARAMETER_NAME,R1_PARAMETER_DESC,R1_PARAMETER_VALUE,R1_PARAMETER_VALUE_TYPE,R1_REQUIRE_FLAG,R1_DISPLAY_ORDER,REC_DATE,REC_FUL_NAM,REC_STATUS) values ('SUFFOLKCO','LICENSE_CA_RENEWALS','appTypeType',null,'ID Cards,Licenses,Registrations','Text','Y',30,to_timestamp('25-SEP-18','DD-MON-RR HH.MI.SSXFF AM'),'ADMIN','A');
Insert into BATCH_JOB_PARAMETER (SERV_PROV_CODE,BATCH_JOB_NAME,R1_PARAMETER_NAME,R1_PARAMETER_DESC,R1_PARAMETER_VALUE,R1_PARAMETER_VALUE_TYPE,R1_REQUIRE_FLAG,R1_DISPLAY_ORDER,REC_DATE,REC_FUL_NAM,REC_STATUS) values ('SUFFOLKCO','LICENSE_CA_RENEWALS','daySpan',null,'0','Number','Y',90,to_timestamp('25-SEP-18','DD-MON-RR HH.MI.SSXFF AM'),'ADMIN','A');
Insert into BATCH_JOB_PARAMETER (SERV_PROV_CODE,BATCH_JOB_NAME,R1_PARAMETER_NAME,R1_PARAMETER_DESC,R1_PARAMETER_VALUE,R1_PARAMETER_VALUE_TYPE,R1_REQUIRE_FLAG,R1_DISPLAY_ORDER,REC_DATE,REC_FUL_NAM,REC_STATUS) values ('SUFFOLKCO','LICENSE_CA_RENEWALS','emailAddress',null,'Matthew Cereola <matthew.cereola@suffolkcountyny.gov>','Text','Y',130,to_timestamp('25-SEP-18','DD-MON-RR HH.MI.SSXFF AM'),'ADMIN','A');
Insert into BATCH_JOB_PARAMETER (SERV_PROV_CODE,BATCH_JOB_NAME,R1_PARAMETER_NAME,R1_PARAMETER_DESC,R1_PARAMETER_VALUE,R1_PARAMETER_VALUE_TYPE,R1_REQUIRE_FLAG,R1_DISPLAY_ORDER,REC_DATE,REC_FUL_NAM,REC_STATUS) values ('SUFFOLKCO','LICENSE_CA_RENEWALS','emailSender',null,'Matthew Cereola <matthew.cereola@suffolkcountyny.gov>','Text','Y',120,to_timestamp('25-SEP-18','DD-MON-RR HH.MI.SSXFF AM'),'ADMIN','A');
Insert into BATCH_JOB_PARAMETER (SERV_PROV_CODE,BATCH_JOB_NAME,R1_PARAMETER_NAME,R1_PARAMETER_DESC,R1_PARAMETER_VALUE,R1_PARAMETER_VALUE_TYPE,R1_REQUIRE_FLAG,R1_DISPLAY_ORDER,REC_DATE,REC_FUL_NAM,REC_STATUS) values ('SUFFOLKCO','LICENSE_CA_RENEWALS','fromDate',null,null,'Text','N',60,to_timestamp('25-SEP-18','DD-MON-RR HH.MI.SSXFF AM'),'ADMIN','A');
Insert into BATCH_JOB_PARAMETER (SERV_PROV_CODE,BATCH_JOB_NAME,R1_PARAMETER_NAME,R1_PARAMETER_DESC,R1_PARAMETER_VALUE,R1_PARAMETER_VALUE_TYPE,R1_REQUIRE_FLAG,R1_DISPLAY_ORDER,REC_DATE,REC_FUL_NAM,REC_STATUS) values ('SUFFOLKCO','LICENSE_CA_RENEWALS','lookAheadDays',null,'-30','Number','Y',80,to_timestamp('25-SEP-18','DD-MON-RR HH.MI.SSXFF AM'),'ADMIN','A');
Insert into BATCH_JOB_PARAMETER (SERV_PROV_CODE,BATCH_JOB_NAME,R1_PARAMETER_NAME,R1_PARAMETER_DESC,R1_PARAMETER_VALUE,R1_PARAMETER_VALUE_TYPE,R1_REQUIRE_FLAG,R1_DISPLAY_ORDER,REC_DATE,REC_FUL_NAM,REC_STATUS) values ('SUFFOLKCO','LICENSE_CA_RENEWALS','newApplicationStatus',null,'Pending Renewal','Text','Y',100,to_timestamp('25-SEP-18','DD-MON-RR HH.MI.SSXFF AM'),'ADMIN','A');
Insert into BATCH_JOB_PARAMETER (SERV_PROV_CODE,BATCH_JOB_NAME,R1_PARAMETER_NAME,R1_PARAMETER_DESC,R1_PARAMETER_VALUE,R1_PARAMETER_VALUE_TYPE,R1_REQUIRE_FLAG,R1_DISPLAY_ORDER,REC_DATE,REC_FUL_NAM,REC_STATUS) values ('SUFFOLKCO','LICENSE_CA_RENEWALS','processAppStatus',null,'Active,Pending Issuance','Text','Y',110,to_timestamp('25-SEP-18','DD-MON-RR HH.MI.SSXFF AM'),'ADMIN','A');
Insert into BATCH_JOB_PARAMETER (SERV_PROV_CODE,BATCH_JOB_NAME,R1_PARAMETER_NAME,R1_PARAMETER_DESC,R1_PARAMETER_VALUE,R1_PARAMETER_VALUE_TYPE,R1_REQUIRE_FLAG,R1_DISPLAY_ORDER,REC_DATE,REC_FUL_NAM,REC_STATUS) values ('SUFFOLKCO','LICENSE_CA_RENEWALS','toDate',null,null,'Text','N',70,to_timestamp('25-SEP-18','DD-MON-RR HH.MI.SSXFF AM'),'ADMIN','A');


--Expired = LICENSE_CA_EXPIRED
Insert into BATCH_JOB_PARAMETER (SERV_PROV_CODE,BATCH_JOB_NAME,R1_PARAMETER_NAME,R1_PARAMETER_DESC,R1_PARAMETER_VALUE,R1_PARAMETER_VALUE_TYPE,R1_REQUIRE_FLAG,R1_DISPLAY_ORDER,REC_DATE,REC_FUL_NAM,REC_STATUS) values ('SUFFOLKCO','LICENSE_CA_EXPIRED','BatchJobName',null,'LICENSE_CA_EXPIRED','Text','Y',10,to_timestamp('25-SEP-18','DD-MON-RR HH.MI.SSXFF AM'),'ADMIN','A');
Insert into BATCH_JOB_PARAMETER (SERV_PROV_CODE,BATCH_JOB_NAME,R1_PARAMETER_NAME,R1_PARAMETER_DESC,R1_PARAMETER_VALUE,R1_PARAMETER_VALUE_TYPE,R1_REQUIRE_FLAG,R1_DISPLAY_ORDER,REC_DATE,REC_FUL_NAM,REC_STATUS) values ('SUFFOLKCO','LICENSE_CA_EXPIRED','appCategory',null,'*','Text','Y',50,to_timestamp('25-SEP-18','DD-MON-RR HH.MI.SSXFF AM'),'ADMIN','A');
Insert into BATCH_JOB_PARAMETER (SERV_PROV_CODE,BATCH_JOB_NAME,R1_PARAMETER_NAME,R1_PARAMETER_DESC,R1_PARAMETER_VALUE,R1_PARAMETER_VALUE_TYPE,R1_REQUIRE_FLAG,R1_DISPLAY_ORDER,REC_DATE,REC_FUL_NAM,REC_STATUS) values ('SUFFOLKCO','LICENSE_CA_EXPIRED','appGroup',null,'ConsumerAffairs','Text','Y',20,to_timestamp('25-SEP-18','DD-MON-RR HH.MI.SSXFF AM'),'ADMIN','A');
Insert into BATCH_JOB_PARAMETER (SERV_PROV_CODE,BATCH_JOB_NAME,R1_PARAMETER_NAME,R1_PARAMETER_DESC,R1_PARAMETER_VALUE,R1_PARAMETER_VALUE_TYPE,R1_REQUIRE_FLAG,R1_DISPLAY_ORDER,REC_DATE,REC_FUL_NAM,REC_STATUS) values ('SUFFOLKCO','LICENSE_CA_EXPIRED','appSubtype',null,'*','Text','Y',40,to_timestamp('25-SEP-18','DD-MON-RR HH.MI.SSXFF AM'),'ADMIN','A');
Insert into BATCH_JOB_PARAMETER (SERV_PROV_CODE,BATCH_JOB_NAME,R1_PARAMETER_NAME,R1_PARAMETER_DESC,R1_PARAMETER_VALUE,R1_PARAMETER_VALUE_TYPE,R1_REQUIRE_FLAG,R1_DISPLAY_ORDER,REC_DATE,REC_FUL_NAM,REC_STATUS) values ('SUFFOLKCO','LICENSE_CA_EXPIRED','appTypeType',null,'ID Cards,Licenses,Registrations','Text','Y',30,to_timestamp('25-SEP-18','DD-MON-RR HH.MI.SSXFF AM'),'ADMIN','A');
Insert into BATCH_JOB_PARAMETER (SERV_PROV_CODE,BATCH_JOB_NAME,R1_PARAMETER_NAME,R1_PARAMETER_DESC,R1_PARAMETER_VALUE,R1_PARAMETER_VALUE_TYPE,R1_REQUIRE_FLAG,R1_DISPLAY_ORDER,REC_DATE,REC_FUL_NAM,REC_STATUS) values ('SUFFOLKCO','LICENSE_CA_EXPIRED','daySpan',null,'0','Number','Y',90,to_timestamp('25-SEP-18','DD-MON-RR HH.MI.SSXFF AM'),'ADMIN','A');
Insert into BATCH_JOB_PARAMETER (SERV_PROV_CODE,BATCH_JOB_NAME,R1_PARAMETER_NAME,R1_PARAMETER_DESC,R1_PARAMETER_VALUE,R1_PARAMETER_VALUE_TYPE,R1_REQUIRE_FLAG,R1_DISPLAY_ORDER,REC_DATE,REC_FUL_NAM,REC_STATUS) values ('SUFFOLKCO','LICENSE_CA_EXPIRED','emailAddress',null,'Matthew Cereola <matthew.cereola@suffolkcountyny.gov>','Text','Y',130,to_timestamp('25-SEP-18','DD-MON-RR HH.MI.SSXFF AM'),'ADMIN','A');
Insert into BATCH_JOB_PARAMETER (SERV_PROV_CODE,BATCH_JOB_NAME,R1_PARAMETER_NAME,R1_PARAMETER_DESC,R1_PARAMETER_VALUE,R1_PARAMETER_VALUE_TYPE,R1_REQUIRE_FLAG,R1_DISPLAY_ORDER,REC_DATE,REC_FUL_NAM,REC_STATUS) values ('SUFFOLKCO','LICENSE_CA_EXPIRED','emailSender',null,'Matthew Cereola <matthew.cereola@suffolkcountyny.gov>','Text','Y',120,to_timestamp('25-SEP-18','DD-MON-RR HH.MI.SSXFF AM'),'ADMIN','A');
Insert into BATCH_JOB_PARAMETER (SERV_PROV_CODE,BATCH_JOB_NAME,R1_PARAMETER_NAME,R1_PARAMETER_DESC,R1_PARAMETER_VALUE,R1_PARAMETER_VALUE_TYPE,R1_REQUIRE_FLAG,R1_DISPLAY_ORDER,REC_DATE,REC_FUL_NAM,REC_STATUS) values ('SUFFOLKCO','LICENSE_CA_EXPIRED','fromDate',null,null,'Text','N',60,to_timestamp('25-SEP-18','DD-MON-RR HH.MI.SSXFF AM'),'ADMIN','A');
Insert into BATCH_JOB_PARAMETER (SERV_PROV_CODE,BATCH_JOB_NAME,R1_PARAMETER_NAME,R1_PARAMETER_DESC,R1_PARAMETER_VALUE,R1_PARAMETER_VALUE_TYPE,R1_REQUIRE_FLAG,R1_DISPLAY_ORDER,REC_DATE,REC_FUL_NAM,REC_STATUS) values ('SUFFOLKCO','LICENSE_CA_EXPIRED','lookAheadDays',null,'-1','Number','Y',80,to_timestamp('25-SEP-18','DD-MON-RR HH.MI.SSXFF AM'),'ADMIN','A');
Insert into BATCH_JOB_PARAMETER (SERV_PROV_CODE,BATCH_JOB_NAME,R1_PARAMETER_NAME,R1_PARAMETER_DESC,R1_PARAMETER_VALUE,R1_PARAMETER_VALUE_TYPE,R1_REQUIRE_FLAG,R1_DISPLAY_ORDER,REC_DATE,REC_FUL_NAM,REC_STATUS) values ('SUFFOLKCO','LICENSE_CA_EXPIRED','newApplicationStatus',null,'Expired','Text','Y',100,to_timestamp('25-SEP-18','DD-MON-RR HH.MI.SSXFF AM'),'ADMIN','A');
Insert into BATCH_JOB_PARAMETER (SERV_PROV_CODE,BATCH_JOB_NAME,R1_PARAMETER_NAME,R1_PARAMETER_DESC,R1_PARAMETER_VALUE,R1_PARAMETER_VALUE_TYPE,R1_REQUIRE_FLAG,R1_DISPLAY_ORDER,REC_DATE,REC_FUL_NAM,REC_STATUS) values ('SUFFOLKCO','LICENSE_CA_EXPIRED','processAppStatus',null,'Pending Renewal','Text','Y',110,to_timestamp('25-SEP-18','DD-MON-RR HH.MI.SSXFF AM'),'ADMIN','A');
Insert into BATCH_JOB_PARAMETER (SERV_PROV_CODE,BATCH_JOB_NAME,R1_PARAMETER_NAME,R1_PARAMETER_DESC,R1_PARAMETER_VALUE,R1_PARAMETER_VALUE_TYPE,R1_REQUIRE_FLAG,R1_DISPLAY_ORDER,REC_DATE,REC_FUL_NAM,REC_STATUS) values ('SUFFOLKCO','LICENSE_CA_EXPIRED','toDate',null,null,'Text','N',70,to_timestamp('25-SEP-18','DD-MON-RR HH.MI.SSXFF AM'),'ADMIN','A');

*/

/*-----------------------------------------------------------------------------------------------------/
| Program: Batch Expiration.js  Trigger: Batch
| Client: Suffolk County
|
| Version 1.0 - Base Version. 09/20/2018 JAB
/------------------------------------------------------------------------------------------------------*/
/*
-------------------------------------------
--Batch jobs for change Expiration Status--
-------------------------------------------
LICENSE_CA_RENEWALS
-------------------------------------------
--Batch jobs for license renewal --
-------------------------------------------
/*--------------------------------------------------------------------------------------------------
// These values is for change the expiration status (About To Expire), notification process
// Testing values to be used in Script Test.
//Closed-Withdrawn,Internal Hold,Closed-Incomplete
//--------------------------------------------------------------------------------------------------
aa.env.setValue("BatchJobName","LICENSE_CA_RENEWALS")
aa.env.setValue("appGroup","ConsumerAffairs")
aa.env.setValue("appTypeType","ID Cards,Licenses,Registrations")
aa.env.setValue("appSubtype","*")
aa.env.setValue("appCategory","*")
aa.env.setValue("fromDate","")
aa.env.setValue("toDate","")
aa.env.setValue("lookAheadDays",-30)
aa.env.setValue("daySpan",0)
aa.env.setValue("newApplicationStatus","Pending Renewal")	//Main record
aa.env.setValue("processAppStatus","License Active,Active,Pending Issuance")
aa.env.setValue("emailSender","Matthew Cereola <matthew.cereola@suffolkcountyny.gov>") //noreply@suffolkcountyny.gov
aa.env.setValue("emailAddress","Matthew Cereola <matthew.cereola@suffolkcountyny.gov>")
*/

/*-------------------------------------------
--Batch jobs for change Expiration Status--
-------------------------------------------
--Lic_ShowroomTax_Expire
------------------------------------------*/
/*--------------------------------------------------------------------------------------------------
// These values is for renewal process
// Testing values to be used in Script Test. 
//--------------------------------------------------------------------------------------------------
aa.env.setValue("BatchJobName","LICENSE_CA_RENEWALS")
aa.env.setValue("appGroup","ConsumerAffairs")
aa.env.setValue("appTypeType","ID Cards,Licenses,Registrations")
aa.env.setValue("appSubtype","*")
aa.env.setValue("appCategory","*")
aa.env.setValue("fromDate","")
aa.env.setValue("toDate","")
aa.env.setValue("lookAheadDays",-1)
aa.env.setValue("daySpan",0)
aa.env.setValue("newApplicationStatus","Expired")	//Main record
aa.env.setValue("processAppStatus","Pending Renewal")
aa.env.setValue("emailSender","Matthew Cereola <matthew.cereola@suffolkcountyny.gov>")
aa.env.setValue("emailAddress","Matthew Cereola <matthew.cereola@suffolkcountyny.gov>")

*/
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
var maxSeconds = 4.9 * 60;		// number of seconds allowed for batch processing, usually < 5*60
var timeExpired = false;
var sysDate = aa.date.getCurrentDate();
var currDate = new Date();
var batchJobID = 0;
var batchJobResult = aa.batchJob.getJobID()
var batchJobName = "" + aa.env.getValue("BatchJobName");
var systemUserObj = aa.person.getUser("ADMIN").getOutput();

var paramsOK = true;

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
var fromDate = getParam("fromDate");					//
var toDate = getParam("toDate");						//
var dFromDate = aa.date.parseDate(fromDate);			//
var dToDate = aa.date.parseDate(toDate);				//
var appGroup = getParam("appGroup");					// app Group to process {Licenses}
var appTypeType = getParam("appTypeType");				// app type to process {Rental License}
var appTypeTypeArray = getParam("appTypeType").split(",");
var appSubtype = getParam("appSubtype");				// app subtype to process {NA}
var appCategory = getParam("appCategory");				// app category to process {NA}
var lookAheadDays = aa.env.getValue("lookAheadDays");   // Number of days from today
var daySpan = aa.env.getValue("daySpan");				// Days to search (6 if run weekly, 0 if daily, etc.)
var newAppStatus = getParam("newApplicationStatus");	// update the CAP to this status
var processAppStatusArray = getParam("processAppStatus").split(",");
var emailSender = getParam("emailSender");				// email sender account
var emailAddress = getParam("emailAddress");		// email to send the batch job result

/*----------------------------------------------------------------------------------------------------/
| End: BATCH PARAMETERS
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
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
	toDate = dateAdd(null,parseInt(lookAheadDays)+parseInt(daySpan))

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
	
	var	expDate;
	var	expDateTemp;
	var conEmail;
	var emailSubject;
	var	emailContent;	

	//Set current date
	var sCurrDate = currDate.getFullYear() + "/" + ("0" + (currDate.getMonth() + 1)).slice(-2) + "/" + ("0" + (currDate.getDate())).slice(-2);	
	
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
			if (!exists(b1Status,processAppStatusArray))
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
			var difDays = daysBetween(expDateTemp,fromDate)
			
			//logDebug(altId + ": expDateTemp " + expDateTemp);
			//logDebug(altId + ": fromDate " + fromDate);
			//logDebug(altId + ": difDays " + difDays);
			
			
			if (difDays != 0)
			{
				capFilterExpDays++;
				//logDebug(altId + ": skipping due to expiration date not meet (" + lookAheadDays + " days rule).");
				continue;				
			}

			//---------------------------------------------------------------------
			// Actions start here:
			//---------------------------------------------------------------------					
			// update CAP status and wft status
			if (newAppStatus.length > 0)
			{
				updateAppStatus(capId, newAppStatus ,"");
				updateTask("Issuance", newAppStatus, "Updated by batch name " + batchJobName, "Updated by batch name " + batchJobName);
				logDebug("            " + altId + ": Updated Application Status to " + newAppStatus);			
			}
	
			//conEmail = "jabfree@hotmail.com"; //comment this line only debug*************
			emailSubject = altId + " - " + newAppStatus;
			emailContent = altId + " - was changed to " + newAppStatus + " status";
			aa.sendEmail(emailSender, conEmail, "", emailSubject , emailContent , null);			
			//logDebug("email sent to " + conEmail + "\n" + emailSubject + "\n" + emailContent);				
			capCount++;
		}
		logDebug("-------------------------------------------------------------------------------");			
	}
			
	logMessage("","------------------------------------------------------------");
	logMessage("","		Total CAPS qualified to process: " + totalCAPS);
	logMessage("","		Ignored due to exp date null or empty: " + capFilterExpNull);
	logMessage("","		Ignored due to exp date no meet the rule: " + capFilterExpDays);
	logMessage("","		Ignored due to CAP Status: " + capFilterStatus);
	logMessage("","		Total CAPS processed: " + capCount);
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