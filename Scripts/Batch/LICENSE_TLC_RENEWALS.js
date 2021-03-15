aa.env.setValue("BatchJobName","LICENSE_TLC_RENEWALS")
aa.env.setValue("appGroup","ConsumerAffairs")
aa.env.setValue("appTypeType","TLC")
aa.env.setValue("appSubtype","*")
aa.env.setValue("appCategory","*")
aa.env.setValue("fromDate","")
aa.env.setValue("toDate","")
aa.env.setValue("lookAheadDays",30)
aa.env.setValue("daySpan",5)
aa.env.setValue("gracePeriodDays",0)
aa.env.setValue("ExpirationPeriod", "TLC_EXP_LICENSE")
aa.env.setValue("expirationStatus","Active")
aa.env.setValue("newApplicationStatus","About to Expire")	//Main record
aa.env.setValue("newExpirationStatus","About to Expire")	//Main record
aa.env.setValue("setPrefix","LIC_ABOUTTOEXPIRE")
aa.env.setValue("deactivateLicense","N")		//N
aa.env.setValue("removeSearchEntries","N")		//N
aa.env.setValue("lockParentLicense","N")
aa.env.setValue("inspSched","")
aa.env.setValue("skipAppStatus","")
aa.env.setValue("emailNotificationsYN","Y")
aa.env.setValue("emailSender","Matthew Cereola <matthew.cereola@suffolkcountyny.gov>") //noreply@suffolkcountyny.gov
aa.env.setValue("emailAddress","Matthew Cereola <matthew.cereola@suffolkcountyny.gov>")

/*-----------------------------------------------------------------------------------------------------/
| Program: Batch Expiration.js  Trigger: Batch
| Client: Suffolk County
|
| Version 1.0 - Base Version. 11/01/08 JHS
| Version 1.1 - Updates based on config 02/21/09
| Version 1.2 - Only create sets if CAPS qualify 02/26/09
| Version 1.3 - Added ability to lock parent license (for adv permits) 1/12/10
| Version 1.5 - Updates based on config SuffolkCO 05/01/16 JAB
/------------------------------------------------------------------------------------------------------*/
/*
/*
PaymentReceiveAfter
EMSE	
balanceDue <= 0 && appMatch("ConsumerAffairs/TLC/Drivers/New") && (capStatus == "About to Expire" || capStatus == "Expired") ^ updateAppStatus("License Active", "Status Updated by EMSE Script", capId); updateExpStatus(capId, "Active", 365);
balanceDue <= 0 && appMatch("ConsumerAffairs/TLC/Vehicles/New") && (capStatus == "About to Expire" || capStatus == "Expired") ^ updateAppStatus("Registration Active", "Status Updated by EMSE Script", capId); updateExpStatus(capId, "Active", 365);

---------------------
--Expiration Models--
---------------------
TLC_EXP_LICENSE: For licenses expiring each year
-------------------------------------------
--Batch jobs for change Expiration Status--
-------------------------------------------
LICENSE_TLC_RENEWALS 
-------------------------------------------
--Batch jobs for license renewal --
-------------------------------------------
Lic_Renewal_LICENSE
*/
/*--------------------------------------------------------------------------------------------------
// These values is for change the expiration status (About To Expire), notification process
// Testing values to be used in Script Test.
//--------------------------------------------------------------------------------------------------
aa.env.setValue("BatchJobName","LICENSE_TLC_RENEWALS")
aa.env.setValue("appGroup","ConsumerAffairs")
aa.env.setValue("appTypeType","TLC")
aa.env.setValue("appSubtype","*")
aa.env.setValue("appCategory","*")
aa.env.setValue("fromDate","")
aa.env.setValue("toDate","")
aa.env.setValue("lookAheadDays",30)
aa.env.setValue("daySpan",5)
aa.env.setValue("gracePeriodDays",0)
aa.env.setValue("ExpirationPeriod", "TLC_EXP_LICENSE")
aa.env.setValue("expirationStatus","Active")
aa.env.setValue("newApplicationStatus","About to Expire")	//Main record
aa.env.setValue("newExpirationStatus","About to Expire")	//Main record
aa.env.setValue("setPrefix","LIC_ABOUTTOEXPIRE")
aa.env.setValue("deactivateLicense","N")		//N
aa.env.setValue("removeSearchEntries","N")		//N
aa.env.setValue("lockParentLicense","N")
aa.env.setValue("inspSched","")
aa.env.setValue("skipAppStatus","")
aa.env.setValue("emailNotificationsYN","Y")
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
aa.env.setValue("BatchJobName","Lic_Renewal_LICENSE")
aa.env.setValue("appGroup","ConsumerAffairs")
aa.env.setValue("appTypeType","TLC")
aa.env.setValue("appSubtype","*")
aa.env.setValue("appCategory","*")
aa.env.setValue("fromDate","")
aa.env.setValue("toDate","")
aa.env.setValue("lookAheadDays",-30)
aa.env.setValue("daySpan",5)
aa.env.setValue("gracePeriodDays",0)
aa.env.setValue("ExpirationPeriod", "TLC_EXP_LICENSE")
aa.env.setValue("expirationStatus","About to Expire")
aa.env.setValue("newApplicationStatus","Expired")	//Main record
aa.env.setValue("newExpirationStatus","Expired")	//Main record
aa.env.setValue("setPrefix","LIC_EXPIRED")
aa.env.setValue("deactivateLicense","N")
aa.env.setValue("removeSearchEntries","N")
aa.env.setValue("lockParentLicense","N")
aa.env.setValue("inspSched","")
aa.env.setValue("skipAppStatus","")
aa.env.setValue("emailNotificationsYN","Y")
aa.env.setValue("emailSender","Matthew Cereola <matthew.cereola@suffolkcountyny.gov>")
aa.env.setValue("emailAddress","Matthew Cereola <matthew.cereola@suffolkcountyny.gov>")

*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var emailText = "";
var maxSeconds = 4.5 * 60;		// number of seconds allowed for batch processing, usually < 5*60
var message = "";
var br = "<br>";
var debug = "";
var showDebug = true;			// Set to true to see debug messages in email confirmation

/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/
SCRIPT_VERSION = 2.0;
//eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
//eval(getScriptText("INCLUDES_ACCELA_GLOBALS"));
//eval(getScriptText("INCLUDES_CUSTOM"));

function getScriptText(vScriptName) 
{
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
	return emseScript.getScriptText() + "";
}

/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID()
batchJobName = "" + aa.env.getValue("BatchJobName");
wfObjArray = null;

batchJobID = 0;
if (batchJobResult.getSuccess())
{
	batchJobID = batchJobResult.getOutput();
	logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID);
}
else
	logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());

/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var fromDate = getParam("fromDate");					//
var toDate = getParam("toDate");						//
var dFromDate = aa.date.parseDate(fromDate);			//
var dToDate = aa.date.parseDate(toDate);				//
var appGroup = getParam("appGroup");					// app Group to process {Licenses}
var appTypeType = getParam("appTypeType");				// app type to process {Rental License}
var appSubtype = getParam("appSubtype");				// app subtype to process {NA}
var appCategory = getParam("appCategory");				// app category to process {NA}
var lookAheadDays = aa.env.getValue("lookAheadDays");   // Number of days from today
var daySpan = aa.env.getValue("daySpan");				// Days to search (6 if run weekly, 0 if daily, etc.)
var gracePeriodDays = 0; //getParam("gracePeriodDays");		// bump up expiration date by this many days
var expPeriod = getParam("ExpirationPeriod");			// app Expiration Period
var expStatus = getParam("expirationStatus");			// test for this expiration status
var newExpStatus = getParam("newExpirationStatus");		// update to this expiration status
var newAppStatus = getParam("newApplicationStatus");	// update the CAP to this status
var setPrefix = getParam("setPrefix");					// Prefix for set ID
var deactivateLicense = "N"; //getParam("deactivateLicense");	// deactivate the LP
var removeSearchEntries = "N"; //getParam("removeSearchEntries"); // remove search entries from DB
var lockParentLicense = "N"; //getParam("lockParentLicense");     // add this lock on the parent license
var inspSched = ""; //getParam("inspSched");			           //   Schedule Inspection
var skipAppStatusArray = getParam("skipAppStatus").split(",");
var emailNotificationsYN = getParam("emailNotificationsYN");	// send out emails?
var emailSender = getParam("emailSender");				// email sender account
var emailAddress = getParam("emailAddress");		// email to send the batch job result

/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var timeExpired = false;

var altId;
var capId;

//New renewal record variables
var capStatus;
var appTypeString;

var currentUserID = aa.env.getValue("CurrentUserID");

// for invoicing
var feeSeqList;
var paymentPeriodList;
var feeTemp;
var feeSched;
var feePeriod;
var feeList;
var publicUser = false;
var renYear;
var emailReport;

var startTime = startDate.getTime();			// Start timer
var systemUserObj = aa.person.getUser("ADMIN").getOutput();


//Validate workflow parameters
var paramsOK = true;

if (!fromDate.length) // no "from" date, assume today + number of days to look ahead
	fromDate = dateAdd(null,parseInt(lookAheadDays))

if (!toDate.length)  // no "to" date, assume today + number of look ahead days + span
	toDate = dateAdd(null,parseInt(lookAheadDays)+parseInt(daySpan))

logMessage("","**********************************************************");
logMessage("","    Date Range - fromDate: " + fromDate + ", toDate: " + toDate)
logMessage("","**********************************************************");

if (appGroup=="") appGroup="*";
if (appTypeType=="") appTypeType="*";
if (appSubtype=="") appSubtype="*";
if (appCategory=="") appCategory="*";

var appType = appGroup+"/"+appTypeType+"/"+appSubtype+"/"+appCategory;


/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/
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
	if (emailAddress.length) aa.sendMail(emailSender, emailAddress, "", batchJobName + " Results", emailText + " - End of Job: " + batchJobName + " Elapsed Time : " + elapsed() + " Seconds");
}
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
function mainProcess()
	{
		var capFilterType = 0
		var capFilterInactive = 0;
		var capFilterError = 0;
		var capFilterStatus = 0;
		var capCount = 0;
		var setName;
		var setDescription;
		
		var expResult = aa.expiration.getLicensesByDate(expStatus,fromDate,toDate);

		if (expResult.getSuccess())
		{
			myExp = expResult.getOutput();
			logDebug("Processing " + myExp.length + " expiration records");
		}
		else
		{ 
			logDebug("ERROR: Getting Expirations, reason is: " + expResult.getErrorType() + ":" + expResult.getErrorMessage()); return false
		}

		for (thisExp in myExp)  // for each b1expiration (effectively, each license app)
		{
				if (elapsed() > maxSeconds) // only continue if time hasn't expired
				{
					logDebug("A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.") ;
					timeExpired = true ;
					break;
				}

				b1Exp = myExp[thisExp];
				var	expDate = b1Exp.getExpDate();
				if (expDate) var b1ExpDate = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
				var b1Status = b1Exp.getExpStatus();

				capId = aa.cap.getCapID(b1Exp.getCapID().getID1(),b1Exp.getCapID().getID2(),b1Exp.getCapID().getID3()).getOutput();

				if (!capId)
				{
					logDebug("Could not get a Cap ID for " + b1Exp.getCapID().getID1() + "-" + b1Exp.getCapID().getID2() + "-" + b1Exp.getCapID().getID3());
					logDebug("This is likely being caused by 09ACC-03874.   Please disable outgoing emails until this is resolved")
					continue;
				}

				altId = capId.getCustomID();

				//logDebug(altId + ": Renewal Status : " + b1Status + ", Expires on " + b1ExpDate);

				cap = aa.cap.getCap(capId).getOutput();
				capStatus = cap.getCapStatus();

				appTypeResult = cap.getCapType();		//create CapTypeModel object
				appTypeString = appTypeResult.toString();
				appTypeArray = appTypeString.split("/");

				// Filter by CAP Type
				if (appType.length && !appMatch(appType))
				{
					capFilterType++;
					logDebug(altId + ": Application Type does not match")
					continue;
				}

				// Filter the Licenses by Expiration Period JAB:09/28/2014
				//logDebug("Expiration Code for:" + altId + ": " + );
				if (expPeriod != b1Exp.getExpCode())
				{
					capFilterType++;
					logDebug(altId + ": Application Type does not belong to the expiration period " + expPeriod)
					continue;
				}
					
				// Filter by CAP Status
				if (exists(capStatus,skipAppStatusArray))
				{
					capFilterStatus++;
					logDebug(altId + ": skipping due to application status of " + capStatus)
					continue;
				}
				capCount++;

				// Create Set
				if (setPrefix != "" && capCount == 1)
				{
					var yy = startDate.getFullYear().toString().substr(2,2);
					var mm = (startDate.getMonth()+1).toString();
					if (mm.length<2)
						mm = "0"+mm;
					var dd = startDate.getDate().toString();
					if (dd.length<2)
						dd = "0"+dd;
					var hh = startDate.getHours().toString();
					if (hh.length<2)
						hh = "0"+hh;
					var mi = startDate.getMinutes().toString();
					if (mi.length<2)
						mi = "0"+mi;

					var setName = setPrefix.substr(0,5) + yy + mm + dd + hh + mi;

					setDescription = setPrefix + " : " + startDate.toLocaleString()
					var setCreateResult= aa.set.createSet(setName,setDescription)

					if (setCreateResult.getSuccess())
						logDebug("Set ID "+setName+" created for CAPs processed by this batch job.");
					else
						logDebug("ERROR: Unable to create new Set ID "+setName+" created for CAPs processed by this batch job.");
				}

				//---------------------------------------------------------------------
				// Actions start here:
				//---------------------------------------------------------------------
				// update expiration status
				if (newExpStatus.length > 0)
				{
					b1Exp.setExpStatus(newExpStatus);
					aa.expiration.editB1Expiration(b1Exp.getB1Expiration());					
					logDebug(altId + ": Updated expiration status to: " + newExpStatus);
				}
			
				// update CAP status
				if (newAppStatus.length > 0)
				{
					updateAppStatus(capId, newAppStatus ,"");
					//logDebug(altId + ": Updated Application Status to " + newAppStatus);
				}

				// schedule Inspection
				if (inspSched.length > 0)
				{
					scheduleInspection(inspSched,"1");
					inspId = getScheduledInspId(inspSched);
					if (inspId) autoAssignInspection(inspId);
					logDebug(altId + ": Scheduled " + inspSched + ", Inspection ID: " + inspId);
				}
				
				// Add to Set
				if (setPrefix != "") 
				{					
					aa.set.add(setName,capId);
				}

				//---------------------------------------------------------------------				
				//Validating the expiration status to active to add fees and send notification
				//---------------------------------------------------------------------
				if (b1Status == "Active")
				{				
					//Deactivating license profesionals
					var refLic = getRefLicenseProf(altId) // Load the reference License Professional

					if (refLic && deactivateLicense.substring(0,1).toUpperCase().equals("Y"))
					{
						refLic.setAuditStatus("I");
						aa.licenseScript.editRefLicenseProf(refLic);
						logDebug(altId + ": deactivated linked License");
					}
				
					// update expiration date based on interval
					if (parseInt(gracePeriodDays) != 0)
					{
						newExpDate = dateAdd(b1ExpDate,parseInt(gracePeriodDays));
						b1Exp.setExpDate(aa.date.parseDate(newExpDate));
						aa.expiration.editB1Expiration(b1Exp.getB1Expiration());

						//logDebug(altId + ": updated CAP expiration to " + newExpDate);
						if (refLic)
						{
							refLic.setLicenseExpirationDate(aa.date.parseDate(newExpDate));
							aa.licenseScript.editRefLicenseProf(refLic);
							//logDebug(altId + ": updated License expiration to " + newExpDate);
						}
					}					
					
					// remove search entries
					if (removeSearchEntries.substring(0,1).toUpperCase().equals("Y"))
					{
						aa.specialSearch.removeSearchDataByCapID(capId);
						logDebug(altId + ": Removed search entries");
					}

					// lock Parent License				
					if (lockParentLicense != "") 
					{
						licCap = getLicenseCapId("*/*/*/*"); 
						if (licCap)
							{
								logDebug(licCap + ": adding Lock : " + lockParentLicense);
								addStdCondition("Suspension",lockParentLicense,licCap);
							}
						else
							logDebug(altId + ": Can't add Lock, no parent license found");
					}			
						
					//---------------------------------------------------------------------
					//				Add the renewal fees
					//---------------------------------------------------------------------				
					feeTemp = getRenewalFeeScheduleFeeCodesByRecType(appTypeArray[0].toString() + "/" + appTypeArray[1].toString() + "/" + appTypeArray[2].toString() + "/" + appTypeArray[3].toString());
									
					feeSched = feeTemp.substring(0,feeTemp.lastIndexOf("|"));	
					feePeriod = "FINAL";
					feeList = feeTemp.substring(feeTemp.lastIndexOf("|")+1, feeTemp.length);
					
					renYear = startDate.getFullYear() + 1; //Renovation Year
					
					//logDebug( feeTemp + " ** Adding fees: Schedule-> -" + feeSched + "- Fees-> -" + feeList + "-");				
					if (feeList.length > 0 &&  feeSched.length > 0) 
					{
						for (var fe in feeList.split(","))
							var feObj = addFeeWithExtraData(feeList.split(",")[fe], feeSched, feePeriod, 1, "N", capId, renYear.toString() + " - Renewal", false, false);
							//var feObj = addFee(feeList.split(",")[fe], feeSched, feePeriod, 1, "N");
							
					}
				}
				//---------------------------------------------------------------------
				//				Generated the notification and send email
				//---------------------------------------------------------------------				
				conArray = getContactArray(capId)
				for (thisCon in conArray)
				{					
					b3Contact = conArray[thisCon]
					//if (b3Contact["contactType"] == "Applicant")
					//{
						//conPhone2 = b3Contact["phone2countrycode"] + b3Contact["phone2"];
						conEmail = b3Contact["email"];
						//aa.print("--------" + b1Status + conEmail + emailNotificationsYN);
						
						if (!conEmail) conEmail = "";
						
						// Eventually we need to get a language preference from the user profile
						if (conEmail && emailNotificationsYN.substring(0,1).toUpperCase().equals("Y")) 
						{							
							//Establich the email body based on the record type							
							tempNotinfo = getNotificationInfo(appTypeArray[0].toString() + "/" + appTypeArray[1].toString() + "/" + appTypeArray[2].toString() + "/" + appTypeArray[3].toString() + "|" + b1Status, altId)
							arrNotInfo = tempNotinfo.split("|");
											
							emailSubject = arrNotInfo[0];
							emailContent = arrNotInfo[1];
							reportName   = arrNotInfo[2];
							
							//Create about to expire notification
							emailReport = "";
							if (reportName != "") emailReport = runReportAttach(capId,reportName,"RecordID",altId);
							
							//Send the notification here **************							
							//-----------------------------------------------------------------------------
							//conEmail = "jabfree@hotmail.com"; //comment this line only debug*************
							//-----------------------------------------------------------------------------
							aa.sendEmail(emailSender, conEmail, "", emailSubject , emailContent , emailReport);
							logDebug("email sent to applicant " + conEmail + "\n" + emailSubject + "\n" + emailContent + "\n" + emailReport);	
						}
					//}
				}
				
		}				
		logMessage("","------------------------------------------------------------");
		logMessage("","		Total CAPS qualified date range: " + myExp.length);
		logMessage("","		Ignored due to application type: " + capFilterType);
		logMessage("","		Ignored due to CAP Status: " + capFilterStatus);
		logMessage("","		Total CAPS processed: " + capCount);
		logMessage("","------------------------------------------------------------");		
 	}

//Renewal fees per record type
function getRenewalFeeScheduleFeeCodesByRecType(sRecordType)
{
	switch (sRecordType) {
		case "ConsumerAffairs/TLC/Drivers/New":
			sFeeSchedule = "TLC_DRIVER";
			sFeeItemCodes = "TLC_DRIVER";
			break;
		case "ConsumerAffairs/TLC/Vehicles/New":
			sFeeSchedule = "TLC_RENEW VEHICLE";
			sFeeItemCodes = "TLC_RENEW_V";
			break;		 
		default: 
			sFeeSchedule = "NA";
			sFeeItemCodes = "NA";
	}
	return sFeeSchedule + "|" + sFeeItemCodes;
}

function getNotificationInfo(sRecordType, pAltID)
{
	switch (sRecordType) {
		//About to Expire
		case "ConsumerAffairs/TLC/Drivers/New|Active":
			sEmailSubject = "Your For-Hire Driver's license is set to expire - " + pAltID ;
			sEmailBody = "Dear Licensee:<br><br>"
						+ "Your For-Hire Driver's license is set to expire. " + pAltID + "<br><br>"
						+ "Please return the enclosed renewal application (notarized) with payment and your drug test receipt.<br><br>"
						+ "If your defensive driving course certificate is set to expire within the next year, you will need to take the course again before renewal.  Once completed, please include your new completed course certificate along with your renewal.<br><br>"
						+ "Your check or money order must be payable to Suffolk County Consumer Affairs and returned/mailed to the address below:<br>"
						+ "            PO BOX 6100<br>"
						+ "            HAUPPAUGE, NEW YORK 11788<br><br>"
						+ "If you need more information please contact Suffolk County Consumer Affairs at consumer.affairs@suffolkcountyny.gov or by phone (631) 853-4458.<br><br>"						
						+ "-----------------------------------------------------------------<br>"
						+ "DIVISION OF CONSUMER AFFAIRS<br>"
						+ "Suffolk County Department of Labor, Licensing & Consumer Affairs<br>"
						+ "Rosalie Drago -- Steven Bellone<br>"
						+ "Commissioner --   Suffolk County Executive";
			sNoticeReport = "License Renewal - Driver";
			break;			
		//Expire
		case "ConsumerAffairs/TLC/Drivers/New|About to Expire":
			sEmailSubject = "Your For-Hire Driver's license has expired - " + pAltID ;
			sEmailBody = "Dear Licensee:<br><br>"
						+ "Your For-Hire Driver's license has expired. " + pAltID + "<br><br>"
						+ "Please send renewal payment immediately to avoid further action.<br><br>"						
						+ "Failure to renew your license may result in having to obtain a new For-Hire Driver's license.<br><br>"
						+ "Your check or money order must be payable to Suffolk County Consumer Affairs and returned/mailed to the address below:<br>"
						+ "            PO BOX 6100<br>"
						+ "            HAUPPAUGE, NEW YORK 11788<br><br>"
						+ "If you need more information please contact Suffolk County Consumer Affairs at consumer.affairs@suffolkcountyny.gov or by phone (631) 853-4458.<br><br>"						
						+ "-----------------------------------------------------------------<br>"
						+ "DIVISION OF CONSUMER AFFAIRS<br>"
						+ "Suffolk County Department of Labor, Licensing & Consumer Affairs<br>"
						+ "Rosalie Drago -- Steven Bellone<br>"
						+ "Commissioner --   Suffolk County Executive";
			sNoticeReport = "";
			break;			
		//About to Expire
		case "ConsumerAffairs/TLC/Vehicles/New|Active":
			sEmailSubject = "Your Vehicle Registration is about to expire - " + pAltID;
			sEmailBody = "Dear Owner:<br><br>"
						+ "Your Vehicle Registration is about to expire."  + pAltID +" <br><br>"
						+ "Please return the enclosed renewal application (notarized) with payment.<br><br>"
						+ "Along with the renewal application, please send a copy of the vehicle NYSDMV registration and proof of the insurance for the vehicle.<br><br>"
						+ "Your check or money order must be payable to Suffolk County Consumer Affairs and returned/mailed to the address below:<br>"
						+ "            PO BOX 6100<br>"
						+ "            HAUPPAUGE, NEW YORK 11788<br><br>"
						+ "If you need more information please contact Suffolk County Consumer Affairs at consumer.affairs@suffolkcountyny.gov or by phone (631) 853-4458.<br><br>"						
						+ "-----------------------------------------------------------------<br>"
						+ "DIVISION OF CONSUMER AFFAIRS<br>"
						+ "Suffolk County Department of Labor, Licensing & Consumer Affairs<br>"
						+ "Rosalie Drago -- Steven Bellone<br>"
						+ "Commissioner --   Suffolk County Executive";
			sNoticeReport = "License Renewal - Vehicle";
			break;
		//Expired
		case "ConsumerAffairs/TLC/Vehicles/New|About to Expire":
			sEmailSubject = "Your Vehicle Registration has expired - " + pAltID ;
			sEmailBody = "Dear Owner:<br><br>"
						+ "Your Vehicle Registration has expired. " + pAltID + "<br><br>"
						+ "Please send renewal payment immediately to avoid further action.<br><br>"
						+ "Failure to renew the registration may result in having to obtain a new registration for your vehicle.<br><br>"
						+ "Your check or money order must be payable to Suffolk County Consumer Affairs and returned/mailed to the address below:<br>"
						+ "            PO BOX 6100<br>"
						+ "            HAUPPAUGE, NEW YORK 11788<br><br>"
						+ "If you need more information please contact Suffolk County Consumer Affairs at consumer.affairs@suffolkcountyny.gov or by phone (631) 853-4458.<br><br>"						
						+ "-----------------------------------------------------------------<br>"
						+ "DIVISION OF CONSUMER AFFAIRS<br>"
						+ "Suffolk County Department of Labor, Licensing & Consumer Affairs<br>"
						+ "Rosalie Drago -- Steven Bellone<br>"
						+ "Commissioner --   Suffolk County Executive";
			sNoticeReport = "";
			break;			
		default:
			sEmailSubject = "Problem validating the License Type" + pAltID;
			sEmailBody = "There are a problem validating the License " + pAltID + ", please contact Suffolk County";
	}
	return sEmailSubject + "|" + sEmailBody + "|" + sNoticeReport
}


function runReportAttach(itemCapId,aaReportName)
	{
	// optional parameters are report parameter pairs
	// for example: runReportAttach(capId,"ReportName","altid",capId.getCustomID(),"months","12");
	var reportName = aaReportName;
	var reportFile = "";

	reportResult = aa.reportManager.getReportInfoModelByName(reportName);

	if (!reportResult.getSuccess())
		{ logDebug("**WARNING** couldn't load report " + reportName + " " + reportResult.getErrorMessage()); return false; }

	var report = reportResult.getOutput(); 

	var itemCap = aa.cap.getCap(itemCapId).getOutput();
	appTypeResult = itemCap.getCapType();
	appTypeString = appTypeResult.toString(); 
	appTypeArray = appTypeString.split("/");

	report.setModule(appTypeArray[0]); 
	report.setCapId(itemCapId.getID1() + "-" + itemCapId.getID2() + "-" + itemCapId.getID3()); 
	report.getEDMSEntityIdModel().setAltId(itemCapId.getCustomID());

	var parameters = aa.util.newHashMap();              

	for (var i = 2; i < arguments.length ; i = i+2)
	{
		parameters.put(arguments[i],arguments[i+1]);
		//logDebug("Report parameter: " + arguments[i] + " = " + arguments[i+1]);
	}	

	report.setReportParameters(parameters);

	var permit = aa.reportManager.hasPermission(reportName,"ADMIN"); 
	if(permit.getOutput().booleanValue()) 
	{ 
		var reportResult = aa.reportManager.getReportResult(report); 
		//logDebug("Report " + aaReportName + " has been run for " + itemCapId.getCustomID());
		
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
	return reportFile;
}

/*------------------------------------------------------------------------------------------------------/

									Accela Functions  
					Internal Functions and Classes (Used by this script)
				
/------------------------------------------------------------------------------------------------------*/
function appMatch(ats)
{
	var isMatch = true;
	var ata = ats.split("/");
	if (ata.length != 4)
		logDebug("ERROR in appMatch.  The following Application Type String is incorrectly formatted: " + ats);
	else
		for (xx in ata)
			if (!ata[xx].equals(appTypeArray[xx]) && !ata[xx].equals("*"))
				isMatch = false;
	return isMatch;
}

function updateAppStatus(sCapID, stat,cmt)
	{
	//updateStatusResult = aa.cap.updateAppStatus(capId,"APPLICATION",stat, sysDate, cmt ,systemUserObj);
	updateStatusResult = aa.cap.updateAppStatus(sCapID,"APPLICATION",stat, sysDate, cmt ,systemUserObj);	
	if (updateStatusResult.getSuccess())
		logDebug("Updated application status to " + stat + " successfully.");
	else
		logDebug("ERROR: application status update to " + stat + " was unsuccessful.  The reason is "  + updateStatusResult.getErrorType() + ":" + updateStatusResult.getErrorMessage());
	}

function elapsed() {
	var thisDate = new Date();
	var thisTime = thisDate.getTime();
	return ((thisTime - startTime) / 1000)
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

function appSpecific() {
	//
	// Returns an associative array of App Specific Info
	//
  	appArray = new Array();
    	var appSpecInfoResult = aa.appSpecificInfo.getByCapID(capId);
	if (appSpecInfoResult.getSuccess())
	 	{
		var fAppSpecInfoObj = appSpecInfoResult.getOutput();

		for (loopk in fAppSpecInfoObj)
			appArray[fAppSpecInfoObj[loopk].checkboxDesc] = fAppSpecInfoObj[loopk].checklistComment;
		}
	return appArray;
}

function dateAdd(td,amt)
// perform date arithmetic on a string
// td can be "mm/dd/yyyy" (or any string that will convert to JS date)
// amt can be positive or negative (5, -3) days
// if optional parameter #3 is present, use working days only
{
	useWorking = false;
	if (arguments.length == 3)
		useWorking = true;

	if (!td)
		dDate = new Date();
	else
		dDate = new Date(td);
	i = 0;
	if (useWorking)
		while (i < Math.abs(amt))
			{
			dDate.setTime(dDate.getTime() + (1000 * 60 * 60 * 24 * (amt > 0 ? 1 : -1)));
			if (dDate.getDay() > 0 && dDate.getDay() < 6)
				i++
			}
	else
		dDate.setTime(dDate.getTime() + (1000 * 60 * 60 * 24 * amt));

	return (dDate.getMonth()+1) + "/" + dDate.getDate() + "/" + dDate.getFullYear();
}

function getCapId(pid1,pid2,pid3)
{
    var s_capResult = aa.cap.getCapID(pid1, pid2, pid3);
    if(s_capResult.getSuccess())
      return s_capResult.getOutput();
    else
    {
      logDebug("ERROR: Failed to get capId: " + s_capResult.getErrorMessage());
      return null;
    }
}

function getParam(pParamName) //gets parameter value and logs message showing param value
{
	var ret = "" + aa.env.getValue(pParamName);
	logDebug("Parameter : " + pParamName+" = "+ret);
	return ret;
}

function isNull(pTestValue,pNewValue)
{
	if (pTestValue==null || pTestValue=="")
		return pNewValue;
	else
		return pTestValue;
}

function jsDateToMMDDYYYY(pJavaScriptDate)
{
	//converts javascript date to string in MM/DD/YYYY format
	//
	if (pJavaScriptDate != null)
		{
		if (Date.prototype.isPrototypeOf(pJavaScriptDate))
	return (pJavaScriptDate.getMonth()+1).toString()+"/"+pJavaScriptDate.getDate()+"/"+pJavaScriptDate.getFullYear();
		else
			{
			logDebug("Parameter is not a javascript date");
			return ("INVALID JAVASCRIPT DATE");
			}
		}
	else
		{
		logDebug("Parameter is null");
		return ("NULL PARAMETER VALUE");
		}
}

function lookup(stdChoice,stdValue)
{
	var strControl;
	var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice,stdValue);

   	if (bizDomScriptResult.getSuccess())
   		{
		bizDomScriptObj = bizDomScriptResult.getOutput();
		var strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
		logDebug("getStandardChoice(" + stdChoice + "," + stdValue + ") = " + strControl);
		}
	else
		{
		logDebug("getStandardChoice(" + stdChoice + "," + stdValue + ") does not exist");
		}
	return strControl;
}


function scheduleInspection(iType,DaysAhead) // optional inspector ID.  This function requires dateAdd function
{
	var inspectorObj = null;
	if (arguments.length == 3)
		{
		var inspRes = aa.person.getUser(arguments[2])
		if (inspRes.getSuccess())
			var inspectorObj = inspRes.getOutput();
		}

	var schedRes = aa.inspection.scheduleInspection(capId, inspectorObj, aa.date.parseDate(dateAdd(null,DaysAhead)), null, iType, "Scheduled via Script")

	if (schedRes.getSuccess())
		logDebug("Successfully scheduled inspection : " + iType + " for " + dateAdd(null,DaysAhead));
	else
		logDebug( "**ERROR: adding scheduling inspection (" + iType + "): " + schedRes.getErrorMessage());
}

function autoAssignInspection(iNumber)
{
	// updates the inspection and assigns to a new user
	// requires the inspection id
	//

	iObjResult = aa.inspection.getInspection(capId,iNumber);
	if (!iObjResult.getSuccess())
		{ logDebug("**ERROR retrieving inspection " + iNumber + " : " + iObjResult.getErrorMessage()) ; return false ; }

	iObj = iObjResult.getOutput();


	inspTypeResult = aa.inspection.getInspectionType(iObj.getInspection().getInspectionGroup(), iObj.getInspectionType())

	if (!inspTypeResult.getSuccess())
		{ logDebug("**ERROR retrieving inspection Type " + inspTypeResult.getErrorMessage()) ; return false ; }

	inspTypeArr = inspTypeResult.getOutput();

        if (inspTypeArr == null || inspTypeArr.length == 0)
		{ logDebug("**ERROR no inspection type found") ; return false ; }

	inspType = inspTypeArr[0]; // assume first

	inspSeq = inspType.getSequenceNumber();

	inspSchedDate = iObj.getScheduledDate().getYear() + "-" + iObj.getScheduledDate().getMonth() + "-" + iObj.getScheduledDate().getDayOfMonth()

 	logDebug(inspSchedDate)

	iout =  aa.inspection.autoAssignInspector(capId.getID1(),capId.getID2(),capId.getID3(), inspSeq, inspSchedDate)

	if (!iout.getSuccess())
		{ logDebug("**ERROR retrieving auto assign inspector " + iout.getErrorMessage()) ; return false ; }

	inspectorArr = iout.getOutput();

	if (inspectorArr == null || inspectorArr.length == 0)
		{ logDebug("**WARNING no auto-assign inspector found") ; return false ; }

	inspectorObj = inspectorArr[0];  // assume first

	iObj.setInspector(inspectorObj);

	assignResult = aa.inspection.editInspection(iObj)

	if (!assignResult.getSuccess())
		{ logDebug("**ERROR re-assigning inspection " + assignResult.getErrorMessage()) ; return false ; }
	else
		logDebug("Successfully reassigned inspection " + iObj.getInspectionType() + " to user " + inspectorObj.getUserID());

}

function getScheduledInspId(insp2Check)
{
	// warning, returns only the first scheduled occurrence
	var inspResultObj = aa.inspection.getInspections(capId);
	if (inspResultObj.getSuccess())
		{
		var inspList = inspResultObj.getOutput();
		for (xx in inspList)
			if (String(insp2Check).equals(inspList[xx].getInspectionType()) && inspList[xx].getInspectionStatus().toUpperCase().equals("SCHEDULED"))
				return inspList[xx].getIdNumber();
		}
	return false;
}

// exists:  return true if Value is in Array
function exists(eVal, eArray) 
{
	  for (ii in eArray)
	  	if (eArray[ii] == eVal) return true;
	  return false;
}

function getContactArray()
{
	// Returns an array of associative arrays with contact attributes.  Attributes are UPPER CASE
	// optional capid
	var thisCap = capId;
	if (arguments.length == 1) thisCap = arguments[0];

	var cArray = new Array();

	var capContactResult = aa.people.getCapContactByCapID(thisCap);
	if (capContactResult.getSuccess())
		{
		var capContactArray = capContactResult.getOutput();
		for (yy in capContactArray)
			{
			var aArray = new Array();
			aArray["lastName"] = capContactArray[yy].getPeople().lastName;
			aArray["firstName"] = capContactArray[yy].getPeople().firstName;
			aArray["businessName"] = capContactArray[yy].getPeople().businessName;
			aArray["contactSeqNumber"] =capContactArray[yy].getPeople().contactSeqNumber;
			aArray["contactType"] =capContactArray[yy].getPeople().contactType;
			aArray["relation"] = capContactArray[yy].getPeople().relation;
			aArray["phone1"] = capContactArray[yy].getPeople().phone1;
			aArray["phone2"] = capContactArray[yy].getPeople().phone2;
			aArray["phone2countrycode"] = capContactArray[yy].getCapContactModel().getPeople().getPhone2CountryCode();
			aArray["email"] = capContactArray[yy].getCapContactModel().getPeople().getEmail();


			var pa = capContactArray[yy].getCapContactModel().getPeople().getAttributes().toArray();
	                for (xx1 in pa)
                   		aArray[pa[xx1].attributeName] = pa[xx1].attributeValue;
			cArray.push(aArray);
			}
		}
	return cArray;
}


function getRefLicenseProf(refstlic)
{
	var refLicObj = null;
	var refLicenseResult = aa.licenseScript.getRefLicensesProfByLicNbr(aa.getServiceProviderCode(),refstlic);
	if (!refLicenseResult.getSuccess())
		{ logDebug("**ERROR retrieving Ref Lic Profs : " + refLicenseResult.getErrorMessage()); return false; }
	else
		{
		var newLicArray = refLicenseResult.getOutput();
		if (!newLicArray) return null;
		for (var thisLic in newLicArray)
			if (refstlic && refstlic.toUpperCase().equals(newLicArray[thisLic].getStateLicense().toUpperCase()))
				refLicObj = newLicArray[thisLic];
		}

	return refLicObj;
}

function getLicenseCapId(licenseCapType)
{
	var itemCap = capId
	if (arguments.length > 1) itemCap = arguments[1]; // use cap ID specified in args

	var capLicenses = getLicenseProfessional(itemCap);
	if (capLicenses == null || capLicenses.length == 0)
		{
		return;
		}

	for (var capLic in capLicenses)
		{
		var LPNumber = capLicenses[capLic].getLicenseNbr()
		var lpCapResult = aa.cap.getCapID(LPNumber);
		if (!lpCapResult.getSuccess())
			{ logDebug("**ERROR: No cap ID associated with License Number : " + LPNumber) ; continue; }
		licCapId = lpCapResult.getOutput();
		if (appMatch(licenseCapType,licCapId))
			return licCapId;
		}
}

function addStdCondition(cType,cDesc)
{
                if (!aa.capCondition.getStandardConditions)
                                {
                                aa.print("addStdCondition function is not available in this version of Accela Automation.");
                                }
        else
                                {
                                standardConditions = aa.capCondition.getStandardConditions(cType,cDesc).getOutput();
                                for(i = 0; i<standardConditions.length;i++)
                                                {
                                                standardCondition = standardConditions[i]
                                                aa.capCondition.createCapConditionFromStdCondition(capId, standardCondition.getConditionNbr())
                                                }
                                }
}
	
function getLicenseProfessional(itemcapId)
{
	capLicenseArr = null;
	var s_result = aa.licenseProfessional.getLicenseProf(itemcapId);
	if(s_result.getSuccess())
	{
		capLicenseArr = s_result.getOutput();
		if (capLicenseArr == null || capLicenseArr.length == 0)
		{
			logDebug("WARNING: no licensed professionals on this CAP:" + itemcapId);
			capLicenseArr = null;
		}
	}
	else
	{
		logDebug("ERROR: Failed to license professional: " + s_result.getErrorMessage());
		capLicenseArr = null;
	}
	return capLicenseArr;
}

function updateFeeItemInvoiceFlag(feeSeq,finvoice)
{
	if(feeSeq == null)
		return;
	if(publicUser && !cap.isCompleteCap())
	{
		var feeItemScript = aa.finance.getFeeItemByPK(capId,feeSeq);
		if(feeItemScript.getSuccess)
		{
			var feeItem = feeItemScript.getOutput().getF4FeeItem();
			feeItem.setAutoInvoiceFlag(finvoice);
			aa.finance.editFeeItem(feeItem);
		}
	}
}

function addFeeWithExtraData(fcode, fsched, fperiod, fqty, finvoice, feeCap, feeComment, UDF1, UDF2) {
    var feeCapMessage = "";
    var feeSeq_L = new Array(); 			// invoicing fee for CAP in args
    var paymentPeriod_L = new Array(); 		// invoicing pay periods for CAP in args

    assessFeeResult = aa.finance.createFeeItem(feeCap, fsched, fcode, fperiod, fqty);
    if (assessFeeResult.getSuccess()) {
        feeSeq = assessFeeResult.getOutput();
        logMessage("Successfully added Fee " + fcode + ", Qty " + fqty + feeCapMessage);
        logDebug("The assessed fee Sequence Number " + feeSeq + feeCapMessage);

        fsm = aa.finance.getFeeItemByPK(feeCap, feeSeq).getOutput().getF4FeeItem();

        if (feeComment) fsm.setFeeNotes(feeComment);
        if (UDF1) fsm.setUdf1(UDF1);
        if (UDF2) fsm.setUdf2(UDF2);

        aa.finance.editFeeItem(fsm)


        if (finvoice == "Y" && arguments.length == 5) // use current CAP
        {
            feeSeqList.push(feeSeq);
            paymentPeriodList.push(fperiod);
        }
        if (finvoice == "Y" && arguments.length > 5) // use CAP in args
        {
            feeSeq_L.push(feeSeq);
            paymentPeriod_L.push(fperiod);
            var invoiceResult_L = aa.finance.createInvoice(feeCap, feeSeq_L, paymentPeriod_L);
            if (invoiceResult_L.getSuccess())
                logMessage("Invoicing assessed fee items is successful.");
            else
                logDebug("**ERROR: Invoicing the fee items assessed was not successful.  Reason: " + invoiceResult.getErrorMessage());
        }
    }
    else {
        logDebug("**ERROR: assessing fee (" + fcode + "): " + assessFeeResult.getErrorMessage());
        return null;
    }
    return feeSeq;
}