/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_CA_TLC_MASS_BUSNAME_UPDATE.js
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
        aa.sendMail("monthlycalicensingrenewals@suffolkcountyny.gov", emailAddress, "", "Batch Job - BATCH_CA_TLC_MASS_BUSNAME_UPDATE", emailText);
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

        var vSQL = "select B1_ALT_ID as recordNumber, b3.B1_EMAIL as emailAdd, b3.b1_contact_type as contactType, b3.B1_FNAME, b3.B1_MName, b3.B1_LNAME, b3.B1_BUSINESS_NAME, b3.B1_CONTACT_NBR as contactId from b1permit b1, b3contact b3 where b1.serv_prov_code = 'SUFFOLKCO' and b1.b1_per_group = 'ConsumerAffairs' and b1.b1_per_type = 'ID Cards' AND b1.B1_PER_SUB_TYPE = 'Home Improvement-Sales' and b1_per_category = 'NA' AND B1.SERV_PROV_CODE = B3.SERV_PROV_CODE AND B1.B1_PER_ID1 = B3.B1_PER_ID1 AND B1.B1_PER_ID2 = B3.B1_PER_ID2 AND B1.B1_PER_ID3 = B3.B1_PER_ID3 and b3.b1_contact_type = 'Vendor' and B3.B1_BUSINESS_NAME = 'Trinity Solar Inc'";
        var count = 0;
        var vResult = doSQLSelect_local(vSQL);
        logDebugLocal("Total Result Count: " + vResult.length);
        for (r in vResult)
        {
            recordID = vResult[r]["recordNumber"];
            emailAddress = vResult[r]["emailAdd"];        
            contactId = vResult[r]["contactId"];  
            contactType = vResult[r]["contactType"];  
            capId = getApplication(recordID);
            capIDString = capId.getCustomID();
           
            cap = aa.cap.getCap(capId).getOutput();
          
            if (cap)
            {
                var capmodel = aa.cap.getCap(capId).getOutput().getCapModel();
                if (capmodel.isCompleteCap())
                {        
                     // Get and set expiration Date
                     b1ExpResult = aa.expiration.getLicensesByCapID(capId)
                     logDebugLocal(" ************* " + capIDString + " *************"); 

                    if (b1ExpResult.getSuccess())
                    {
                        if (b1ExpResult.getOutput() != "" && b1ExpResult.getOutput() != null)
                        {
                            var b1Exp = b1ExpResult.getOutput();
                            try
                            {                           
                                if (!matches(b1Exp, null, undefined, ""))
                                {                                  
                                     
                                    logDebugLocal("App Status: " + getAppStatus(capId));

                                    updateAppStatus("Active", "Updated via batch script");
                                    logDebugLocal("Update App Status to: " + getAppStatus(capId));
                                    // Custom Field expiration date as well
                                    licExpDate = getAppSpecific("Expiration Date", capId);
                                    logDebugLocal("Custom Field expiration date is: " + licExpDate);
                                    if (!matches(licExpDate, null, undefined, ""))
                                    {
                                        editAppSpecific("Expiration Date", "01/01/2026", capId);
                                        logDebugLocal("Custom Field expiration date set to : " +  getAppSpecific("Expiration Date", capId));
                                    }

                                    // Update task
                                    var taskResult1 = aa.workflow.getTask(capId,"Issuance");
                                    if (taskResult1.getSuccess()){
                                        tTask = taskResult1.getOutput();
                                        logDebugLocal("Task Status: " + tTask.getDisposition());                       
                                        updateTask("Issuance", "Renewed", "", "");       
                                        logDebugLocal("Update to Task Status: " +aa.workflow.getTask(capId,"Issuance").getOutput().getDisposition()); 
                                    
                                    }
                                                               
                                    var curExp = b1Exp.getExpDate();
                                    if (curExp != null)
                                    {                                    
                                        expDateCon = new Date(curExp.getMonth() + "/" + curExp.getDayOfMonth() + "/" + curExp.getYear());
                                        logDebugLocal("Current expiration date is: " + expDateCon);
                                        var year = expDateCon.getFullYear();
                                        var month = expDateCon.getMonth();
                                        var day = expDateCon.getDate();
                                        var newDate = new Date(year + 2, month, day);
                                        var dateMMDDYYYY = jsDateToMMDDYYYY(newDate);
                                        dateMMDDYYYY = aa.date.parseDate(dateMMDDYYYY);
                                        logDebugLocal("New expiration date is: " + newDate);
                                        b1Exp.setExpDate(dateMMDDYYYY);                             
                                        
                                        var curSt = b1Exp.getExpStatus();
                                        logDebugLocal("Expiration Status: " + curSt);
                                        if (curSt != null)
                                        {                                            
                                            b1Exp.setExpStatus("Active");
                                            logDebugLocal("New Expiration Status: " + b1Exp.getExpStatus());
                                        }

                                        aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
                                        logDebugLocal("Expiration date has been updated to + 2 years");	
                                    
                                    }
                                }
                            }   
                            catch (ex)
                            {
                                logDebugLocal("**ERROR** runtime error " + ex.message);
                            }
                        }
                    }

                    
                    var capPeoples = getPeople(capId)
                                      
                    if (capPeoples == null || capPeoples.length == 0)
                    {            
                        logDebugLocal("No contact has been found.");   
                    }
                    else
                    {
                        for (loopk in capPeoples)
                        {
                            var capContactType = capPeoples[loopk].getCapContactModel().getPeople().getContactType();                                                      
                
                            foundId = capPeoples[loopk].getCapContactModel().getPeople().getContactSeqNumber();				
                        
                            if (contactId == foundId)
                            {
                                busName = capPeoples[loopk].getCapContactModel().getPeople().getBusinessName();
                                logDebugLocal(capIDString + ", Current Business Name: " + busName  + ", Contact sequence Number :" + foundId); 
                                newBusName = 'Trinity Solar LLC';                                                              						
                                capPeoples[loopk].getCapContactModel().getPeople().setBusinessName(newBusName);							                                                                                                                     ;
                                aa.people.editCapContactWithAttribute(capPeoples[loopk].getCapContactModel());
                                logDebugLocal("Business Name set to:" + capPeoples[loopk].getCapContactModel().getPeople().getBusinessName());                                             
                                count++;
                            }
                        }
                                                                            
                                
                    }      
            
                   
                    
                }
            }
        }

        logDebugLocal("Total Updates: " + count);
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

