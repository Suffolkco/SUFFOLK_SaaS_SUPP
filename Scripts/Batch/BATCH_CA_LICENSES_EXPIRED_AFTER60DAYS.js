/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_CA_LICENSES_EXPIRED_AFTER60DAYS.js
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
        aa.sendMail("monthlycalicensingrenewals@suffolkcountyny.gov", emailAddress, "", "Batch Job - BATCH_CA_LICENSES_EXPIRED_AFTER60DAYS", emailText);
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
        var dateCheck = dateAdd(null, -60);
        dateCheckString = String(dateCheck).split("/")
        var dateToCheck = (String('0' + dateCheckString[0]).slice(-2) + '/' + String('0' + dateCheckString[1]).slice(-2) + '/' + dateCheckString[2]);
        
        logDebugLocal("Date to check: " + dateToCheck);
        dateCheckString1 = dateToCheck.replace(/\b0/g, '');            
        logDebugLocal("Date to check 1: " + dateCheckString1);     
        
       
        var vSQL = "SELECT B1.B1_ALT_ID as recordNumber, BC.B1_CHECKLIST_COMMENT as ExpDate FROM B1PERMIT B1 INNER JOIN BCHCKBOX BC on b1.serv_prov_code = bc.serv_prov_code and b1.b1_per_id1 = bc.b1_per_id1 and b1.b1_per_id2 = bc.b1_per_id2 and b1.b1_per_id3 = bc.b1_per_id3 and bc.B1_CHECKBOX_TYPE = 'LICENSE DATES' and bc.B1_CHECKBOX_DESC = 'Expiration Date' and BC.B1_CHECKLIST_COMMENT IN ('" + dateToCheck + "','" + dateCheckString1 + "') WHERE B1.SERV_PROV_CODE = 'SUFFOLKCO' and B1_PER_GROUP = 'ConsumerAffairs' and B1.B1_PER_TYPE = 'Licenses' and B1_PER_CATEGORY = 'NA' ";
        var output = "Record ID | Expiration Date \n";
        var vResult = doSQLSelect_local(vSQL); 
        logDebugLocal("Count:" + vResult.length); 
        for (r in vResult)
        {
            recordID = vResult[r]["recordNumber"];
            expirationDate = vResult[r]["ExpDate"];
            output += recordID + " | " + expirationDate + "\n";
            capId = getApplication(recordID);
            capIDString = capId.getCustomID();
            cap = aa.cap.getCap(capId).getOutput();
            logDebugLocal(capIDString + ". Status: " + getAppStatus() + "Expiration Date: " + expirationDate);            
            if (cap)
            {
                var capmodel = aa.cap.getCap(capId).getOutput().getCapModel();
                if (capmodel.isCompleteCap())
                {
                    if (getAppStatus() == "Expired")
                    {
                           
                            var vEParams = aa.util.newHashtable();
                            var vRParams = aa.util.newHashtable();
                            var AInfo = new Array();
                            loadAppSpecific(AInfo);
                            var PIN = AInfo["PIN Number"];

                           // DAP-602: Generate PIN if it doesn't exist
                           if (matches(PIN, null, "", undefined))
                           {
                               logDebugLocal("PIN in : " + capIDString + " is empty.");
                               var pinNumber = makePIN(8);
                               logDebugLocal("New PIN number generated: " + pinNumber);
                               if(editAppSpecificL('PIN Number',pinNumber,capId))
                               {
                                   PIN = pinNumber;
                                   logDebugLocal("Assigned PIn to " + capIDString);
                               }
                           }
                                                       
                            addParameter(vEParams, "$$altID$$", capIDString);
                            addParameter(vEParams, "$$capAlias$$", cap.getCapType().getAlias());
                            addParameter(vEParams, "$$expirDate$$", expirationDate);
                            addParameter(vEParams, "$$PINNumber$$", PIN);
                            addACAUrlsVarToEmail(vEParams); 
                            exec = lookupLOCAL('REPORT_CONFIG', 'COUNTY_EXECUTIVE');
                            commissioner = lookupLOCAL('REPORT_CONFIG', 'DCA_COMMISSIONER');
                            dca_title_commissioner = lookupLOCAL('REPORT_CONFIG', 'COMMISSIONER_TITLE');
                            logDebug(exec + ", " + commissioner);
                            addParameter(vEParams, "$$exec$$", exec);
                            addParameter(vEParams, "$$comm$$", commissioner);
                            addParameter(vEParams, "$$title$$", dca_title_commissioner);
                            logDebugLocal("<b>" + capIDString + "</b>" + " Expired");

                             // As per DAP-349, do not send email until after 60 days of the expiration. Blocking sending email here
                            
                            var contactResult = aa.people.getCapContactByCapID(capId);
                            if (contactResult.getSuccess())
                            {
                                var capContacts = contactResult.getOutput();
                                var conEmail = "";
                                for (c in capContacts)
                                {
                                    if (capContacts[c].getCapContactModel().getContactType() == "Vendor")
                                    {
                                        addParameter(vEParams, "$$FullNameBusName$$", getContactName(capContacts[c]));

                                        if (!matches(capContacts[c].email, null, undefined, ""))
                                        {
                                            addParameter(vRParams, "RecordID", capIDString);
                                            addParameter(vRParams, "FromDate", dateToCheck);
                                            addParameter(vRParams, "ToDate", dateToCheck);
                                            addParameter(vRParams, "Email", "Yes");

                                            conEmail += capContacts[c].email;

                                            var caReport = generateReportBatch(capId, "CA Renewal Notifications SSRS V2", "ConsumerAffairs", vRParams);
                                            if (caReport)
                                            {                                                
                                                var caReports = new Array();
                                                caReports.push(caReport);
                                            }
                                            logDebugLocal("Conemail is: " + conEmail + " for " + capIDString);
                                            var success = sendNotification("", conEmail, "", "CA_LICENSE_EXPIRATION", vEParams, caReports);
                                            logDebugLocal("success:" + success);
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
function lookupLOCAL(stdChoice, stdValue) {
    var strControl;
    var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice, stdValue);

    if (bizDomScriptResult.getSuccess()) {
        var bizDomScriptObj = bizDomScriptResult.getOutput();
        strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
    }
  
    return strControl;
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



