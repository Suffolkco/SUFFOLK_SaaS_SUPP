/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_CA_UPDATE_HI_STATUS_180DAYS.js
| Trigger: Batch
| Client: Suffolk
| Version 1.0 04/08/2021
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
        aa.sendMail("monthlycalicensingrenewals@suffolkcountyny.gov", emailAddress, "", "BATCH_CA_UPDATE_HI_STATUS_180DAYS", emailText);
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
        
        // Waiting on Applicant status
        var vSQL = "SELECT B1.B1_ALT_ID as recordNumber, B1.B1_FILE_DD as openDate FROM B1PERMIT B1 WHERE B1.SERV_PROV_CODE = 'SUFFOLKCO' and B1_PER_GROUP = 'ConsumerAffairs' and B1.B1_PER_TYPE = 'Licenses' and B1.B1_PER_SUB_TYPE = 'Home Improvement' and B1.B1_PER_CATEGORY = 'NA' and B1.B1_APPL_STATUS = 'Waiting on Applicant'";        
        var output = "Record ID | Open Date \n";
        var vResult = doSQLSelect_local(vSQL);
        var count = 0;

        for (r in vResult)
        {
            recordID = vResult[r]["recordNumber"];
            openDate = vResult[r]["openDate"];
           
            output += recordID + " | " + openDate + "\n";
            capId = getApplication(recordID);
            capIDString = capId.getCustomID();

        
            cap = aa.cap.getCap(capId).getOutput();
            var appTypeResult = cap.getCapType();
            var appTypeString = appTypeResult.toString();
            var appTypeArray = appTypeString.split("/");
            if (cap)
            {
                var capmodel = aa.cap.getCap(capId).getOutput().getCapModel();
                if (capmodel.isCompleteCap())
                {
                    if (matches(getAppStatus(capId), "Waiting on Applicant"))
                    {                        
                        fileDateObj = cap.getFileDate();
                        fileDate = "" + fileDateObj.getMonth() + "/" + fileDateObj.getDayOfMonth() + "/" + fileDateObj.getYear();
                        fileDateYYYYMMDD = dateFormatted(fileDateObj.getMonth(),fileDateObj.getDayOfMonth(),fileDateObj.getYear(),"YYYY-MM-DD")
                        
                        //logDebugLocal("Open Date for " + capIDString + ": " + fileDateYYYYMMDD);
                        
                        
                        //var newDate = dateAddMonths(fileDateObj, 6);
                        var newDate = dateAdd(fileDateObj, 180);
                        var openDate = convertDate(newDate);
                        
                        //logDebugLocal("Added 180 days: " + newDate);
                        //logDebugLocal("Record " + capIDString + ": 6 months after record open date " + fileDateYYYYMMDD + " is: " + newDate);

                        var todayDate = new Date();
	                    var sDateMMDDYYYY = (todayDate.getMonth() + 1) + "/" + todayDate.getDate() + "/" + todayDate.getFullYear()    ;
                        
                        //logDebugLocal("Today's date: " +  sDateMMDDYYYY);

                        var dateDifference = dateDiff(todayDate, openDate)

                       

                        if (dateDifference <= -180)
                        {
                            logDebugLocal("Days Difference: " + parseInt(Math.abs(dateDifference)) + " days.");
                            logDebugLocal("Setting Record " + capIDString + " to Closed-Withdrawn. The record has opened longer than 180 days on: " + fileDateYYYYMMDD + 
                            "and have an application status of " + getAppStatus(capId));
                            updateAppStatus("Closed-Withdrawn");      
                            count++;                    
                            
                        }
                        
                    }
                }
            }           
        }
        logDebugLocal("Total of record Ids that have been updated:  " + count);
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

function dateAddMonths(pDate, pMonths)
	{
	// Adds specified # of months (pMonths) to pDate and returns new date as string in format MM/DD/YYYY
	// If pDate is null, uses current date
	// pMonths can be positive (to add) or negative (to subtract) integer
	// If pDate is on the last day of the month, the new date will also be end of month.
	// If pDate is not the last day of the month, the new date will have the same day of month, unless such a day doesn't exist in the month, in which case the new date will be on the last day of the month
	//
	if (!pDate)
		baseDate = new Date();
	else
		baseDate = convertDate(pDate);

	var day = baseDate.getDate();
	baseDate.setMonth(baseDate.getMonth() + pMonths);
	if (baseDate.getDate() < day)
		{
		baseDate.setDate(1);
		baseDate.setDate(baseDate.getDate() - 1);
		}
	return ((baseDate.getMonth() + 1) + "/" + baseDate.getDate() + "/" + baseDate.getFullYear());
	}

function dateAdd(td,amt) 
{
	// perform date arithmetic on a string
	// td can be "mm/dd/yyyy" (or any string that will convert to JS date)
	// amt can be positive or negative (5, -3) days
	if (!td) 
	{
		dDate = new Date();
	} 
	else 
	{
		dDate = convertDate(td);
	}
	//var i = 0;
	//while (i < Math.abs(amt)) 
	//{
	//	dDate = new Date(aa.calendar.getNextWorkDay(aa.date.parseDate(dDate.getMonth()+1 + "/" + dDate.getDate() + "/" + dDate.getFullYear())).getOutput().getTime());
	//	i++;
	//}
	dDate.setTime(dDate.getTime() + (1000 * 60 * 60 * 24 * amt));
	return (dDate.getMonth() + 1) + "/" + dDate.getDate() + "/" + dDate.getFullYear();
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

function generateReportBatch(itemCap, reportName, module, parameters)
{
    //returns the report file which can be attached to an email.
    var user = currentUserID; // Setting the User Name
    var report = aa.reportManager.getReportInfoModelByName(reportName);
    if (!report.getSuccess() || report.getOutput() == null)
    {
        logDebug("**WARN report generation failed, missing report or incorrect name: " + reportName);
        return false;
    }
    report = report.getOutput();
    report.setModule(module);
    report.setCapId(itemCap); //CSG Updated from itemCap.getCustomID() to just itemCap so the file would save to Record
    report.setReportParameters(parameters);

    var permit = aa.reportManager.hasPermission(reportName, user);

    if (permit.getOutput().booleanValue())
    {
        var reportResult = aa.reportManager.getReportResult(report);
        if (reportResult.getSuccess())
        {
            reportOutput = reportResult.getOutput();
            var reportFile = aa.reportManager.storeReportToDisk(reportOutput);
            reportFile = reportFile.getOutput();
            return reportFile;
        } else
        {
            logDebug("**WARN System failed get report: " + reportResult.getErrorType() + ":" + reportResult.getErrorMessage());
            return false;
        }
    } else
    {
        logDebug("You have no permission.");
        return false;
    }
}

function dateDiff(date1, date2) {

    return (convertDate(date2).getTime() - convertDate(date1).getTime()) / (1000 * 60 * 60 * 24);
}
