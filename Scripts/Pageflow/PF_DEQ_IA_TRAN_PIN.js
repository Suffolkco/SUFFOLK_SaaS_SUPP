/*------------------------------------------------------------------------------------------------------/
| Program : PF_DEQ_IA_TRAN_PIN
| Event   : ACA_BEFORE Event
|
|
| 
| Author:JGreene
/------------------------------------------------------------------------------------------------------*/

var documentOnly = false;
var disableTokens = false;
var useAppSpecificGroupName = false;
var useTaskSpecificGroupName = false;
var enableVariableBranching = false;
var maxEntries = 99;
var cancel = false;
var startDate = new Date();
var startTime = startDate.getTime();
var message = "";
var debug = "";
var br = "<br>";
var showDebug = false;
var showMessage = false;
//Needed to load the includes files
//This way we are not re-defining everything over and over.
eval(getScriptText("INCLUDES_CUSTOM", null, true));
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, true));
var cap = aa.env.getValue("CapModel");
var capId = cap.getCapID();
var AInfo = new Array();
var messageList = "";
loadAppSpecific4ACA(AInfo);
try
{
    var pin = AInfo["PIN Number"];
    var iaNumber = AInfo["IA Record Number"];

    var getCapResult = aa.cap.getCapIDsByAppSpecificInfoField("IA PIN Number", pin);
    if (getCapResult.getSuccess())
    {
        var apsArray = getCapResult.getOutput();
        for (aps in apsArray)
        {
            myCap = aa.cap.getCap(apsArray[aps].getCapID()).getOutput();
            logDebug("apsArray = " + apsArray);
            var relCap = myCap.getCapID();
            var relCapID = relCap.getCustomID();
        }
    }

    var getCapResult = aa.cap.getCapID(iaNumber);
    if (getCapResult.getSuccess())
    {
        if (!matches(relCapID, iaNumber))
        {
            messageList += "PIN and IA Number do not match.  Please try entering the PIN Number and IA Record Number again or, if you do not have this information, you may continue the form by leaving these fields blank and clicking ‘Continue Application’." + br;
        }
    }

    if (iaNumber != null && iaNumber != "")
    {
        var isValidRec = validateRecordExist(iaNumber, "DEQ/Ecology/IA/Application");
        if (isValidRec == "NOT_FOUND") {
            messageList += "IA Record Number does not exist. Please try entering the IA Record Number again or, if you do not have this information, you may continue the form by leaving this field blank and clicking ‘Continue Application’." + br
        }
    }
    // Require LP
    var lpList = cap.getLicenseProfessionalList();
    var correctType = false;

    if (lpList != null)
    {
        for (i = 0; i < lpList.size(); i++)
        {
            logDebug("license type is: " + lpList.get(i).getLicenseType());
            if (lpList.get(i).getLicenseType() == "IA Service Provider")
            {
                correctType = true;
                break;
            }
        }
    }

    if (correctType == false)
    {
        messageList += "You have chosen the incorrect License Type. Click ‘Create an Application’ to return to the previous page and select the ‘IA Service Provider’ option from the Licenses drop down. If this option is not available, please contact us as IAOWTSRME@suffolkcontyny.gov." + br;
    }

    if (messageList != "")
    {
        showMessage = true;
        cancel = true;
        comment(messageList);
    }
}
catch (error)
{
    logDebug("an error was encoutered: " + error.message);
    showDebug = true;
    showMessage = true;
}

if (debug.indexOf("**ERROR") > 0 || debug.substr(0, 7) == "**ERROR")
{
    aa.env.setValue("ErrorCode", "1");
    aa.env.setValue("ErrorMessage", debug);
} else
{
    if (cancel)
    {
        aa.env.setValue("ErrorCode", "-2");
        if (showMessage) aa.env.setValue("ErrorMessage", message);
        if (showDebug) aa.env.setValue("ErrorMessage", debug);
    } else
    {
        aa.env.setValue("ErrorCode", "0");
        if (showMessage) aa.env.setValue("ErrorMessage", message);
        if (showDebug) aa.env.setValue("ErrorMessage", debug);
    }
}


//ACA Functions 
function getScriptText(vScriptName, servProvCode, useProductScripts) {
    if (!servProvCode) servProvCode = aa.getServiceProviderCode();
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    try
    {
        if (useProductScripts)
        {
            var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
        } else
        {
            var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
        }
        return emseScript.getScriptText() + "";
    } catch (err)
    {
        return "";
    }
}
function validateRecordExist(recordNum, recType, reqCapStatus) {
    var truckLocCapId = aa.cap.getCapID(recordNum);
    if (truckLocCapId.getSuccess())
    {
        truckLocCapId = truckLocCapId.getOutput();
        if (truckLocCapId != null)
        {
            var truckLocCap = aa.cap.getCap(truckLocCapId);
            truckLocCap = truckLocCap.getOutput();
            if (truckLocCap.getCapType().getValue() == recType)
            {
                if (truckLocCap.getCapStatus() == reqCapStatus)
                {
                    return "VALID";
                } else
                {
                    return "NOT_VALID";
                }
            } else
            {
                return "NOT_FOUND";
            }
        }//truckLocCapId !null
    }//truckLocCapId success
    return "NOT_FOUND";
}