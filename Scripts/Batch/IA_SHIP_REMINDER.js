/*-------------------------------------------------------------------------------------------------------/
| Program: IA_SHIP_REMINDER.js  Trigger: Batch
| Version 1.0 Zachary McVicker 04/18/2022
| This batch script will run daily. 
| This will send an email notification to the IA Installer. 
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS 
|
/------------------------------------------------------------------------------------------------------*/
var emailText = "";
var showDebug = true; // Set to true to see debug messages in email confirmation//
var maxSeconds = 60 * 5; // number of seconds allowed for batch processing, usually < 5*60
var showMessage = false;
var useAppSpecificGroupName = false;
var br = "<BR>";
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID();
batchJobName = "" + aa.env.getValue("BatchJobName");
batchJobID = 0;
if (batchJobResult.getSuccess()) {
    batchJobID = batchJobResult.getOutput();
    logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID + br);
} else {
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
var dateLookingFor = new Date(dateAdd((startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear(), -14));
convertedDate = (dateLookingFor.getMonth() + 1) + "/" + dateLookingFor.getDate() + "/" + dateLookingFor.getFullYear();
var dateLookingFor2 = new Date(dateAdd((startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear(), -28));
convertedDate2 = (dateLookingFor2.getMonth() + 1) + "/" + dateLookingFor2.getDate() + "/" + dateLookingFor2.getFullYear();
var dateLookingFor3 = new Date(dateAdd((startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear(), -42));
convertedDate3 = (dateLookingFor3.getMonth() + 1) + "/" + dateLookingFor3.getDate() + "/" + dateLookingFor3.getFullYear();
var dateLookingFor4 = new Date(dateAdd((startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear(), -56));
convertedDate4 = (dateLookingFor4.getMonth() + 1) + "/" + dateLookingFor4.getDate() + "/" + dateLookingFor4.getFullYear();
var dateForExpire =  new Date(dateAdd((startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear(), -60));
var expiredDate = (dateForExpire.getMonth() + 1) + "/" + dateForExpire.getDate() + "/" + dateForExpire.getFullYear();
var capId = "";
logDebug("We are looking for this date: " + convertedDate);
// all record types to check


/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS//
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
try {
    var rtArray = "DEQ/WWM/SHIP/Application";
    var statusLookingFor = "Documents Requested"
    var notificationToSend = "DEQ_SHIP_ADDITIONAL_DOCUMENTS";
    mainProcess(); 
    var rtArray = "DEQ/WWM/SHIP/Application";
    var statusLookingFor = "OK to Proceed"
    var notificationToSend = "DEQ_SHIP_14_DAY_OK_PROCEED";
    mainProcess()
} 
    catch (err) {
    logDebug("**ERROR** runtime error " + err.message + " at " + err.lineNumber + " stack: " + err.stack);
}
logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/

function mainProcess()
{
    logDebug("Starting search for Ship records in this status: "+ statusLookingFor);
    var thisType = rtArray;
    var totalPermits = 0;
    var appTypeArray = thisType.split("/");
    var sql = "SELECT B1_ALT_ID                                                              \n" +
        "  FROM B1PERMIT P                                                               \n" +
        " WHERE P.SERV_PROV_CODE = 'SUFFOLKCO'                                                \n" +
        "   AND P.REC_STATUS = 'A'                                                       \n" +
        "   AND P.B1_PER_GROUP = '" + appTypeArray[0] + "'                                          \n" +
        "   AND P.B1_PER_TYPE = '" + appTypeArray[1] + "'                                        \n" +
        "   AND P.B1_PER_SUB_TYPE = '" + appTypeArray[2] + "'                                     \n" +
        "   AND P.B1_PER_CATEGORY = '" + appTypeArray[3] + "'                                    \n" +
        "   AND P.B1_APPL_STATUS = '" + statusLookingFor + "'                                    \n";
    logDebug("SQL: " + sql);
    var altIds = doSQLSelect_local(sql);
    if (altIds)
    {
        if (altIds.length <= 0)
        {
            logDebug("No records found");
        }
        else
        {
            logDebug("Retrieving ship (START)");
            logDebug("********************************");
            for (i in altIds)
            {
                var row = altIds[i];

                var altId = row.B1_ALT_ID; logDebug(altId);
                var capIdRes = aa.cap.getCapID(altId);

                //GET CAP ID, if result returns an error then don't process this record.
                if (!capIdRes.getSuccess()) { logDebug("ERROR getting capId for record " + altId + ". Err: " + capIdRes.getOutput()); continue; }

                capId = capIdRes.getOutput();
                capId = aa.cap.getCapID(capId.getID1(), capId.getID2(), capId.getID3()).getOutput();
                var cap = aa.cap.getCap(capId).getOutput();
                totalPermits++;
                if (cap) 
                {
                        // EHIMS2-289: Get Created By
                        var  capDetail = getCapDetailByID(capId);
                        var userId = capDetail.getCreateBy();
                        var createByUseObj = aa.person.getUser(userId).getOutput();  
                        if (createByUseObj != null)
                        {
                            var userName = createByUseObj.getFirstName() + " " + createByUseObj.getLastName();
                            logDebug("userName is: " + userName);
                            createByEmail =  createByUseObj.getEmail();           
                            logDebug("email address is: " + createByEmail);
                        }

                    var myStatusHistory = getCapStatusHistory(null, capId);
                    //logDebug("Status History:" + myStatusHistory);
                   
                        var newStatusDate = (myStatusHistory[0]['date'].getMonth() + 1) + "/" + myStatusHistory[0]['date'].getDate() + "/" + myStatusHistory[0]['date'].getFullYear()
                        var newStatus = myStatusHistory[0]['status']
                        //logDebug("History: "+ myStatusHistory[0]['status'] + " " + myStatusHistory[0]['date'])

                        if (myStatusHistory[0]['status'] == statusLookingFor)
                        {
                            logDebug("new status date = " + newStatusDate);
                            logDebug("converted Date = " + convertedDate);
                            logDebug("converted Date2 = " + convertedDate2);
                            logDebug("converted Date3 = " + convertedDate3);
                            logDebug("converted Date4 = " + convertedDate4);
                            logDebug("expiration date = " + expiredDate);
                            if (matches(newStatusDate, convertedDate, convertedDate2, convertedDate3, convertedDate4))
                            {
                                logDebug("capId = " + capId.getCustomID());
                                logDebug("Date = " + newStatusDate);
                                logDebug("Status = " + newStatus);
                                //addToSet(capId, "IARENEWAL", "Ecology Renewals");
                                var licProfResult = aa.licenseScript.getLicenseProf(capId);
                                var capLPs = licProfResult.getOutput();
                                for (l in capLPs)
                                {
                                    var conEmail = "";
                                    if (capLPs[l].getLicenseType() == "IA Installer")
                                    {
                                        if (!matches(capLPs[l].email, null, undefined, ""))
                                        {
                                            conEmail += capLPs[l].email + ";"
                                        }

                                        var params = aa.util.newHashtable();
                                        var iaInstallerEmail = capLPs[l].getLicenseType().email;
                                        addParameter(params, "$$altId$$", capId.getCustomID());
                                        sendNotification("noreplyehims@suffolkcountyny.gov", iaInstallerEmail, "", notificationToSend, params, null);
                                        sendNotification("noreplyehims@suffolkcountyny.gov", createByEmail, "", notificationToSend, params, null);
                                    }
                                }
                            }
                            if (newStatusDate == expiredDate && statusLookingFor == "OK to Proceed")
                            {
                                updateAppStatus(capId,"Enforcement Action", "");
                                logDebug("Expiration Matched");
                                logDebug("capId = " + capId.getCustomID());
                                logDebug("Date = " + newStatusDate);
                                logDebug("Status = " + newStatus); 
                                //addToSet(capId, "IARENEWAL", "Ecology Renewals");
                                var licProfResult = aa.licenseScript.getLicenseProf(capId);
                                var capLPs = licProfResult.getOutput();
                                for (l in capLPs)
                                {
                                    if (capLPs[l].getLicenseType() == "IA Installer")
                                    {
                                        if (!matches(capLPs[l].email, null, undefined, ""))
                                        {
                                            conEmail += capLPs[l].email + ";"
                                        }

                                        var params = aa.util.newHashtable();
                                        var iaInstallerEmail = capLPs[l].getLicenseType().email;
                                        addParameter(params, "$$altId$$", capId.getCustomID());
                                        sendNotification("noreplyehims@suffolkcountyny.gov", iaInstallerEmail, "", notificationToSend, params, null);
                                        sendNotification("noreplyehims@suffolkcountyny.gov", createByEmail, "", notificationToSend, params, null);
                                    }
                                }
                            }
                        }
                    
                }
            }
            logDebug("_______________________________________________________________________________");
            logDebug("Total Permits : " + totalPermits + " in this status: " + statusLookingFor);
            logDebug("Run Time: " + elapsed());
            logDebug("_______________________________________________________________________________");
        }
    }
}

function doSQLSelect_local(sql) {
    try {
        //logdebug("iNSIDE FUNCTION");
        var array = [];
        //commented out as per task 6825 , replaced with var conn = aa.db.getConnection();
        //var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
        //var ds = initialContext.lookup("java:/AA");
        //var conn = ds.getConnection();
        var conn = aa.db.getConnection();
        var sStmt = conn.prepareStatement(sql);

        if (sql.toUpperCase().indexOf("SELECT") == 0) {
            //logdebug("executing " + sql);
            var rSet = sStmt.executeQuery();
            while (rSet.next()) {
                var obj = {};
                var md = rSet.getMetaData();
                var columns = md.getColumnCount();
                for (i = 1; i <= columns; i++) {
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
    } catch (err) {
        //logdebug("ERROR: "+ err.message);
        return array
    }
}
 
function sendNotification(emailFrom,emailTo,emailCC,templateName,params,reportFile)

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
 


function addParameter(pamaremeters, key, value) {
    if (key != null) {
        if (value == null) {
            value = "";
        }
        pamaremeters.put(key, value);
    }
}



function dateAdd(td, amt) {
    // perform date arithmetic on a string
    // td can be "mm/dd/yyyy" (or any string that will convert to JS date)
    // amt can be positive or negative (5, -3) days
    if (!td) {
        dDate = new Date();
    } else {
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

function jsDateToMMDDYYYY(pJavaScriptDate) {
    //converts javascript date to string in MM/DD/YYYY format
    if (pJavaScriptDate != null) {
        if (Date.prototype.isPrototypeOf(pJavaScriptDate)) {
            return (pJavaScriptDate.getMonth() + 1).toString() + "/" + pJavaScriptDate.getDate() + "/" + pJavaScriptDate.getFullYear();
        } else {
            logDebug("Parameter is not a javascript date");
            return ("INVALID JAVASCRIPT DATE");
        }
    } else {
        logDebug("Parameter is null");
        return ("NULL PARAMETER VALUE");
    }
}

function dateDiff(date1, date2) {
    return (convertDate(date2).getTime() - convertDate(date1).getTime()) / (1000 * 60 * 60 * 24);
}

function debugObject(object) {
    var output = '';
    for (property in object) {
        output += "<font color=red>" + property + "</font>" + ': ' + "<bold>" + object[property] + "</bold>" + '; ' + "<BR>";
    }
    logDebug(output);
}

function elapsed() {
    var thisDate = new Date();
    var thisTime = thisDate.getTime();
    return ((thisTime - startTime) / 1000)
}

function logDebug(dstr) {
    if (showDebug) {
        aa.print(dstr)
        emailText += dstr + "<br>";
        aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr)
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


function getCapStatusHistory(sortType)
{
    // Optional capId
    var itemCap = capId;
    if (arguments.length == 2)
        itemCap = arguments[1];
    sortType = String(sortType).toUpperCase();
    if (!matches(sortType, "ASC", "DESC"))
        sortType = "DESC"; // default sort type
    var statusHisRes = aa.cap.getStatusHistoryByCap(itemCap, "APPLICATION", null);
    if (statusHisRes.getSuccess())
        var statusHisArr = statusHisRes.getOutput();
    else
    {
        logDebug("**ERROR: getting cap status history: " + statusHisRes.getErrorMessage());
        return null;
    }
    var resArray = new Array(); // Two dimensional Array
    for (hIdx in statusHisArr)
    {
        var tempArr = new Array();
        tempArr['status'] = statusHisArr[hIdx].getStatus();
        tempArr['date'] = convertDate(statusHisArr[hIdx].getStatusDate());
        resArray.push(tempArr);
    }
    if (sortType == "DESC")
        return resArray.sort(function (a, b)
        {
            if (a['date'] === b['date'])
            {
                return 0;
            } else
            {
                return (a['date'] > b['date']) ? -1 : 1;
            }
        });
    if (sortType == "ASC")
        return resArray.sort(function (a, b)
        {
            if (a['date'] === b['date'])
            {
                return 0;
            } else
            {
                return (a['date'] < b['date']) ? -1 : 1;

            }

        });

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