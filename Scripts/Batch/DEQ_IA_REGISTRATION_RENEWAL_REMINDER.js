/*------------------------------------------------------------------------------------------------------/
| Program: DEQ_IA_REGISTRATION_RENEWAL_REMINDER.js
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
        aa.sendMail("ada.chan@suffolkcountyny.gov", emailAddress, "", "Batch Job - BATCH_IA_REGISTRATION_RENEWAL_REMINDER", emailText);
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
     

        var vSQL = "SELECT B1.B1_ALT_ID as recordNumber, BC.B1_CHECKLIST_COMMENT as ContractExpDate, B1_FILE_DD as OpenDate FROM B1PERMIT B1 INNER JOIN BCHCKBOX BC on b1.serv_prov_code = bc.serv_prov_code and b1.b1_per_id1 = bc.b1_per_id1 and b1.b1_per_id2 = bc.b1_per_id2 and b1.b1_per_id3 = bc.b1_per_id3 and bc.B1_CHECKBOX_DESC = 'Contract Expiration Date' WHERE B1.SERV_PROV_CODE = 'SUFFOLKCO' and B1_PER_GROUP = 'DEQ' and B1.B1_PER_TYPE = 'Ecology' and B1.B1_PER_SUB_TYPE= 'IA' AND B1_APPL_CLASS = 'COMPLETE' AND B1_FILE_DD >  '01/01/2024'";
        
        var vResult = doSQLSelect_local(vSQL);
        var count = 0;
        var addressNullCount = 0;
        var emailNullCount = 0;
        logDebugLocal("Number of records returned: " + vResult.length);
        for (r in vResult)
        {
            recordID = vResult[r]["recordNumber"];          
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
                    //var appStatus = getAppStatus();                    
                    //if (!matches(appStatus, "Expired", "About to Expire"))
                    

                    var vEParams = aa.util.newHashtable();
                    var vRParams = aa.util.newHashtable();
                    logDebugLocal(" ****** " + capIDString + " ****** ");
                    // Pull custom fields:
                    contractStartDate = getAppSpecific("Contract Start Date", capId);
                    logDebugLocal("Contract Start Date: " + contractStartDate);
                    contractExpDate = getAppSpecific("Contract Expiration Date", capId);
                    logDebugLocal("Contract Expiration Date: " + contractExpDate);
                    installDate = getAppSpecific("Installation Date", capId);
                    logDebugLocal("Contract Installation Date: " + installDate);
                 
                    // Pull Record Open date:
                    fileDateObj = cap.getFileDate();
                    fileDate = "" + fileDateObj.getMonth() + "/" + fileDateObj.getDayOfMonth() + "/" + fileDateObj.getYear();
                    fileDateYYYYMMDD = dateFormatted(fileDateObj.getMonth(),fileDateObj.getDayOfMonth(),fileDateObj.getYear(),"YYYY-MM-DD")
                    addParameter(vRParams, "FileDate", fileDate);
                  
                    // Pull address:
                    var capAddressResult = aa.address.getAddressByCapId(capId);
                    var addressToUse;
                    if (capAddressResult.getSuccess())
                    {
                        Address = capAddressResult.getOutput();
                        addressToUse = Address[0];
                        for (yy in Address)
                        {
                            if ("Y"==Address[yy].getPrimaryFlag())
                            {
                                priAddrExists = true;
                                addressToUse = Address[yy];
                                logDebugLocal("Target CAP has primary address");
                            
                            }
                        }
                    }          
                    if (!matches(addressToUse, null, undefined, ""))                
                    {
                        addressLine1 = addressToUse.getAddressLine1();     
                        addressStreetName = addressToUse.getStreetName();  
                        addressCity = addressToUse.getCity();    
                        addressState = addressToUse.getState();             
                        addressZip = addressToUse.getZip();
                    }
                    else
                    {
                        logDebugLocal("Address is null for: " + capIDString);
                        addressNullCount++;
                    }
                     
                    //addParameter(vRParams, "AddressLine1", addressLine1);
                    //addParameter(vRParams, "AddressLine2", addressCity + " " + addressState + " " + addressZip);
                   

                    // Pull Parcel Number
                    var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
                    if (capParcelResult.getSuccess())
                    {
                        var Parcels = capParcelResult.getOutput().toArray();
                        for (zz in Parcels)
                        {
                            var parcelNumber = Parcels[zz].getParcelNumber();
                            logDebugLocal("parcelNumber = " + parcelNumber);
                            //addParameter(vRParams, "TaxMap", parcelNumber );  
                        }
                    }
                    // Pull contacts
                    var contactResult = aa.people.getCapContactByCapID(capId);
                    if (contactResult.getSuccess())
                    {
                        var capContacts = contactResult.getOutput();
                        var conEmail = "";
                        for (c in capContacts)
                        {
                            peop = capContacts[c].getPeople();
                            
                            if (capContacts[c].getCapContactModel().getContactType() == "Property Owner"
                            && peop.getAuditStatus() == 'A')
                            {    
                                if (!matches(capContacts[c].email, null, undefined, ""))
                                {                                    
                                    conEmail += capContacts[c].email;
                                    count++;
                                    logDebugLocal("Conemail is: " + capContacts[c].email);
                                } 
                                else
                                {
                                    logDebugLocal("No email address found for property owner: " + capIDString);
                                    emailNullCount++;
                                }                               
                            }
                        }

                        var firstName = peop.getFirstName();
                        var lastName = peop.getLastName();                       
                        //addParameter(vRParams, "FirstName", firstName);
                        //addParameter(vRParams, "LastName", lastName);
                        //addParameter(vRParams, "Email", conEmail);
                        addParameter(vRParams, "RECORD_ID", capIDString);
                        var caReport = generateReportBatch(capId, "IA Registration Renewal Reminder", "Ecology", vRParams);  
                        //sendNotification("", conEmail, "", "DEQ_IA_REGISTRATION_RENEWAL_REMINDER", vRParams, caReport);               
                       
                    }


                }
            }
        }

        logDebugLocal("Total number of emails that were sent: " + count);
        logDebugLocal("Total number of empty address: " + addressNullCount);
        logDebugLocal("Total number of empty email address: " + emailNullCount);
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


function lookupLOCAL(stdChoice, stdValue) {
    var strControl;
    var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice, stdValue);

    if (bizDomScriptResult.getSuccess()) {
        var bizDomScriptObj = bizDomScriptResult.getOutput();
        strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
    }
  
    return strControl;
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
