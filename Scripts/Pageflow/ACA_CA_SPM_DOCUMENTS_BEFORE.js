/*------------------------------------------------------------------------------------------------------/
| Program : ACA_CA_SPM_DOCUMENTS_BEFORE.js
| Event   : ACA_BEFORE Event
|
|
| 
| Author:jgreene
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
loadAppSpecific4ACA(AInfo);
try
{
    var docComments = "";
    if (!determineACADocumentAttached("Background Explanation"))
    {
        docComments += "Background Explanation" + "<br>";
    }
    if (!determineACADocumentAttached("Passport Photo"))
    {
        docComments += "Passport Photo" + "<br>";
    }
    if (!determineACADocumentAttached("Copy of New York State Driver's License or NYSDMV non-driver photo I.D."))
    {
        docComments += "Copy of New York State Driver's License or NYSDMV non-driver photo I.D." + "<br>";
    }
    if (!determineACADocumentAttached("Proof of Banking"))
    {
        docComments += "Proof of Banking" + "<br>";
    }

    if (!determineACADocumentAttached("Copy of DBA Certificate or State Filing Receipt"))
    {
        docComments += "Copy of DBA Certificate or State Filing Receipt" + "<br>";
    }

    if (!determineACADocumentAttached("Certificate of Liability and Property Damage Insurance"))
    {
        docComments += "Certificate of Liability and Property Damage Insurance" + "<br>";
    }

    if (!determineACADocumentAttached("Certification by the Association of Pool and Spa Certificate"))
    {
        docComments += "Certification by the Association of Pool and Spa Certificate" + "<br>";
    }

    if (docComments != "") 
    {
        cancel = true;
        showMessage = true;
        comment("This submission requires you to submit the following documents: <br>" + docComments);
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
function getScriptText(vScriptName, servProvCode, useProductScripts)
{
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
