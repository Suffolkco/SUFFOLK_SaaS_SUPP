/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_CA_TLC_ABOUT_TO_EXPIRE.js
| Trigger: Batch
| Client: Suffolk
| Version 1.0 7/9/2021
| Author: JGreene
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
        aa.sendMail("monthlycalicensingrenewals@suffolkcounty.gov", emailAddress, "", "Batch Job - BATCH_CA_TLC_ABOUT_TO_EXPIRE", emailText);
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
                    //logDebug("CapIDString is: " + capIDString);
                    cap = aa.cap.getCap(capId).getOutput();
                    if (cap)
                    {
                        var capmodel = aa.cap.getCap(capId).getOutput().getCapModel();
                        if (capmodel.isCompleteCap())
                        {
                            //logDebug("app status is: " + getAppStatus());
                            if (!matches(getAppStatus(), "About to Expire", "Expired"))
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
                                                if (curSt != "About to Expire")
                                                {
                                                    var curExpCon = curExp.getMonth() + "/" + curExp.getDayOfMonth() + "/" + curExp.getYear();
                                                    //logDebug("Curr Exp Converted is: " + curExpCon);
                                                    var dateDif;
                                                    dateDif = parseFloat(dateDiff(todayDate, curExpCon));
                                                    var dateDifRound = Math.floor(dateDif);
                                                    //logDebug("Number of days out = " + dateDifRound);
                                                    if (dateDifRound == 32)
                                                    {
                                                        //Setting renewal info status to About to Expire
                                                        b1Exp.setExpStatus("About to Expire");
                                                        aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
                                                        logDebug("<b>" + capIDString + "</b>" + "renewal info has been set to About to Expire");

                                                        //Setting app status to About to Expire
                                                        aa.cap.updateAppStatus(capId, "Set to About to Expire from Batch", "About to Expire", sysDate, "Updated via BATCH_CA_TLC_ABOUT_TO_EXPIRE", systemUserObj);

                                                        var vEParams = aa.util.newHashtable();
                                                        var vRParams = aa.util.newHashtable();

                                                        addParameter(vEParams, "$$altID$$", capIDString);
                                                        addParameter(vEParams, "$$capAlias$$", cap.getCapType().getAlias());
                                                        addParameter(vRParams, "RecordID", capIDString);
                                                        addParameter(vRParams, "RecordID", capIDString);
                                                        addParameter(vRParams, "FromDate", dateToCheck);
                                                        addParameter(vRParams, "ToDate", dateToCheck);
                                                        addParameter(vRParams, "Email", "Yes");

                                                        logDebug("<b>" + capIDString + "</b>" + " About to Expire");
                                                        var contactResult = aa.people.getCapContactByCapID(capId);
                                                        if (contactResult.getSuccess())
                                                        {
                                                            var capContacts = contactResult.getOutput();
                                                            var conEmail = "";
                                                            for (c in capContacts)
                                                            {
                                                                if (appTypeArray[2] == "Drivers")
                                                                {
                                                                    if (capContacts[c].getCapContactModel().getContactType() == "Applicant")
                                                                    {
                                                                        addParameter(vEParams, "$$FullNameBusName$$", getContactName(capContacts[c]));

                                                                        if (!matches(capContacts[c].email, null, undefined, ""))
                                                                        {
                                                                            conEmail += capContacts[c].email;
                                                                            logDebugLocal("Conemail is: " + conEmail);

                                                                            var caReport = generateReportBatch(capId, "CA Renewal Notifications SSRS V2", appTypeArray[0], vRParams);
                                                                            if (caReport)
                                                                            {
                                                                                var caReports = new Array();
                                                                                caReports.push(caReport);
                                                                            }
                                                                            sendNotification("", conEmail, "", "CA_LICENSE_ABOUT_TO_EXPIRE", vEParams, caReports);
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
                                                                            conEmail += capContacts[c].email;
                                                                            logDebugLocal("Conemail is: " + conEmail);

                                                                            var caReport = generateReportBatch(capId, "CA Renewal Notifications SSRS V2", appTypeArray[0], vRParams);
                                                                            if (caReport)
                                                                            {
                                                                                var caReports = new Array();
                                                                                caReports.push(caReport);
                                                                            }

                                                                            sendNotification("", conEmail, "", "CA_LICENSE_ABOUT_TO_EXPIRE", vEParams, caReports);
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
function emailWithReportAttachASync(pSendToEmailAddresses, pEmailTemplate, pEParams, pReportTemplate, pRParams, pAddAdHocTask, pChangeReportDescription)
{
    var x = 0;
    var vAsyncScript = "SEND_EMAIL_ATTACH_ASYNC";
    var envParameters = aa.util.newHashMap();

    //Initialize optional parameters	
    var vEParams = aa.util.newHashtable();
    var vReportTemplate = "";
    var vRParams = aa.util.newHashtable();
    var vAddAdHocTask = true;
    var vChangeReportDescription = "";

    if (pEParams != undefined && pEParams != null && pEParams != "")
    {
        logDebug("pEParams is defined");
        vEParams = pEParams;
    }

    if (pReportTemplate != undefined && pReportTemplate != null && pReportTemplate != "")
    {
        logDebug("pReportTemplate is defined");
        vReportTemplate = pReportTemplate;
    }

    if (pRParams != undefined && pRParams != null && pRParams != "")
    {
        logDebug("pRParams is defined");
        vRParams = pRParams;
    }

    if (pAddAdHocTask != undefined && pAddAdHocTask != null && pAddAdHocTask != "")
    {
        logDebug("pAddAdHocTask is defined");
        if (pAddAdHocTask == "N")
        {
            vAddAdHocTask = false;
        } else if (pAddAdHocTask == false)
        {
            vAddAdHocTask = false;
        }
    }

    if (pChangeReportDescription != undefined && pChangeReportDescription != null && pChangeReportDescription != "")
    {
        logDebug("pChangeReportDescription is defined");
        vChangeReportDescription = pChangeReportDescription;
    }

    //Save variables to the hash table and call sendEmailASync script. This allows for the email to contain an ACA deep link for the document
    envParameters.put("sendToEmailAddresses", pSendToEmailAddresses);
    envParameters.put("emailTemplate", pEmailTemplate);
    envParameters.put("vEParams", vEParams);
    envParameters.put("reportTemplate", vReportTemplate);
    envParameters.put("vRParams", vRParams);
    envParameters.put("vChangeReportDescription", vChangeReportDescription);
    envParameters.put("CapId", capId);

    //Start modification to support batch script
    var vEvntTyp = aa.env.getValue("eventType");
    if (vEvntTyp == "Batch Process")
    {
        aa.env.setValue("sendToEmailAddresses", pSendToEmailAddresses);
        aa.env.setValue("emailTemplate", pEmailTemplate);
        aa.env.setValue("vEParams", vEParams);
        aa.env.setValue("reportTemplate", vReportTemplate);
        aa.env.setValue("vRParams", vRParams);
        aa.env.setValue("vChangeReportDescription", vChangeReportDescription);
        aa.env.setValue("CapId", capId);
        //call sendEmailASync script
        logDebug("Attempting to run Non-Async: " + vAsyncScript);
        aa.includeScript(vAsyncScript);
    } else
    {
        //call sendEmailASync script
        logDebug("Attempting to run Async: " + vAsyncScript);
        aa.runAsyncScript(vAsyncScript, envParameters);
    }
    //End modification to support batch script

    return true;
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