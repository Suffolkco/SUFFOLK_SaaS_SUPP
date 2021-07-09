/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_CA_TLC_EXPIRATION.js
| Trigger: Batch
| Client: Suffolk
| Version 1.0 7/9/2021
| Author: RLittlefield
| This batch script will run daily.
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var emailText = "";
var showDebug = true;// Set to true to see debug messages in email confirmation
var maxSeconds = 60 * 5;// number of seconds allowed for batch processing, usually < 5*60
var showMessage = false;
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var useAppSpecificGroupName = false;
var timeExpired = false;
var br = "<BR>";
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
    logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID + br);
}
else
{
    logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());
}
var recTypeArray = [];
var fList = aa.cap.getCapTypeListByModule("ConsumerAffairs", null);
if (fList.getSuccess())
{
    var fListOut = fList.getOutput();
    for (f in fListOut)
    {
        if (fListOut[f].getType() == "TLC" && matches(fListOut[f].getSubType(), "Drivers", "Vehicles") && fListOut[f].getCategory() == "New")
        {
            var recType = "ConsumerAffairs" + "/" + fListOut[f].getType() + "/" + fListOut[f].getSubType() + "/" + fListOut[f].getCategory();
            recTypeArray.push(recType);
        }
    }
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
    logDebug("Start Date: " + startDate + br);
    logDebug("Starting the timer for this job.  If it takes longer than 5 minutes an error will be listed at the bottom of the email." + br);
    if (!timeExpired) 
    {
        mainProcess();
        //logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");
        logDebug("End Date: " + startDate);
        aa.sendMail("monthlycalicensingrenewals@suffolkcounty.gov", emailAddress, "", "Batch Job - BATCH_CA_TLC_EXPIRATION", emailText);
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
        for (r in recTypeArray)
        {
            var thisType = recTypeArray[r];
            var appTypeArray = thisType.split("/");
            var capSearchModel = aa.cap.capModel.getOutput();
            var capTypeModel = capSearchModel.capType;
            capTypeModel.setGroup(appTypeArray[0]);
            capTypeModel.setType(appTypeArray[1]);
            capTypeModel.setSubType(appTypeArray[2]);
            capTypeModel.setCategory(appTypeArray[3]);
            capSearchModel.setCapType(capTypeModel);
            var recordListResult = aa.cap.getCapListByCollection(capSearchModel, null, null, fromDate, toDate, null, new Array());
            if (!recordListResult.getSuccess())
            {
                logDebug("**ERROR: Failed to get capId List : " + recordListResult.getErrorMessage());
            }
            else
            {
                var recArray = recordListResult.getOutput();
                logDebug("Looping through " + recArray.length + " records of type " + thisType);
                for (var j in recArray)
                {
                    capId = recArray[j].getCapID();
                    capIDString = capId.getCustomID();
                    cap = aa.cap.getCap(capId).getOutput();
                    if (cap)
                    {
                        var capmodel = aa.cap.getCap(capId).getOutput().getCapModel();
                        if (capmodel.isCompleteCap())
                        {
                            if (getAppStatus() != "Expired")
                            {
                                b1ExpResult = aa.expiration.getLicensesByCapID(capId)
                                if (b1ExpResult.getSuccess())
                                {
                                    var b1Exp = b1ExpResult.getOutput();
                                    var curExp = null;

                                    try
                                    {
                                        var curExp = b1Exp.getExpDate();
                                    }
                                    catch (err)
                                    {
                                        logDebug("<b>" + capIDString + "<b>" + "has no Expiration code, bypassing");
                                    }
                                    finally
                                    {
                                        if (curExp != null)
                                        {
                                            var curSt = b1Exp.getExpStatus();
                                            if (curSt != null)
                                            {
                                                if (curSt == "About to Expire")
                                                {
                                                    var curExpCon = curExp.getMonth() + "/" + curExp.getDayOfMonth() + "/" + curExp.getYear();
                                                    var dateDif;
                                                    dateDif = parseFloat(dateDiff(todayDate, curExpCon));
                                                    var dateDifRound = Math.floor(dateDif);
                                                    if (dateDifRound == 0)
                                                    {
                                                        //Setting renewal info status to Expired
                                                        b1Exp.setExpStatus("Expired");
                                                        aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
                                                        logDebug("<b>" + capIDString + "</b>" + "renewal info has been set to Expired");

                                                        //Setting app status to Expired
                                                        aa.cap.updateAppStatus(capId, "Set to Expired from Batch", "Expired", sysDate, "Updated via BATCH_CA_TLC_EXPIRATION", systemUserObj);

                                                        var vEParams = aa.util.newHashtable();

                                                        addParameter(vEParams, "$$altID$$", capIDString);
                                                        addParameter(vEParams, "$$capAlias$$", cap.getCapType().getAlias());

                                                        logDebug("<b>" + capIDString + "</b>" + " Expired");
                                                        var contactResult = aa.people.getCapContactByCapID(capId);
                                                        if (contactResult.getSuccess())
                                                        {
                                                            var capContacts = contactResult.getOutput();
                                                            for (c in capContacts)
                                                            {
                                                                if (appTypeArray[2] == "Drivers")
                                                                {
                                                                    if (capContacts[c].getCapContactModel().getContactType() == "Applicant")
                                                                    {
                                                                        addParameter(vEParams, "$$FullNameBusName$$", getContactName(capContacts[c]));
                                                                        if (!matches(capContacts[c].email, null, undefined, ""))
                                                                        {
                                                                            sendNotification("", capContacts[c].email, "", "CA_DRIVER_EXPIRATION", vEParams, null);
                                                                        }
                                                                    }
                                                                }
                                                                if (appTypeArray[2] == "Vehicles")
                                                                {
                                                                    if (matches(capContacts[c].getCapContactModel().getContactType(), "Applicant", "Vehicle Owner"))
                                                                    {
                                                                        addParameter(vEParams, "$$FullNameBusName$$", getContactName(capContacts[c]));
                                                                        if (!matches(capContacts[c].email, null, undefined, ""))
                                                                        {
                                                                            sendNotification("", capContacts[c].email, "", "CA_VEHICLE_REG_EXPIRATION", vEParams, null);
                                                                        }
                                                                    }
                                                                }

                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
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
        logDebug("**ERROR** runtime error " + err.message + " at " + err.lineNumber + " stack: " + err.stack);
    }
    logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");
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
    if (result.getSuccess())
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
function addParameter(pamaremeters, key, value)
{
    if (key != null)
    {
        if (value == null)
        {
            value = "";
        }
        pamaremeters.put(key, value);
    }
}
function lookup(stdChoice, stdValue) 
{
    var strControl;
    var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice, stdValue);

    if (bizDomScriptResult.getSuccess())
    {
        var bizDomScriptObj = bizDomScriptResult.getOutput();
        strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
        //logDebug("lookup(" + stdChoice + "," + stdValue + ") = " + strControl);
    }
    else
    {
        //logDebug("lookup(" + stdChoice + "," + stdValue + ") does not exist");
    }
    return strControl;
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
    //logDebug("**WARNING** convertDate cannot parse date : " + thisDate);
    return null;
}
function elapsed()
{
    var thisDate = new Date();
    var thisTime = thisDate.getTime();
    return ((thisTime - startTime) / 1000)
}
function logDebug(dstr)
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
        logDebug("ERROR: Failed to get app status: " + capResult.getErrorMessage());
    }
    return appStatus;
}