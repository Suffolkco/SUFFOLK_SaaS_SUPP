/*------------------------------------------------------------------------------------------------------/
| Program : DEQ_IA_TRAN_SKIP_LAB.js
| Event   : ACA ONLOAD Event
| Client  : SUFFOLK
| Author  : JGreene
| Notes   : Updated by JDG on 02/24/2022 
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var showMessage = false;
var showDebug = false;
var useAppSpecificGroupName = false;
var useTaskSpecificGroupName = false;
var cancel = false;
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var startTime = startDate.getTime();
var message = "";
var debug = "";
var br = "<BR>";
var useSA = false;
var SA = null;
var SAScript = null;
var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_FOR_EMSE");
if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I")
{
    useSA = true;
    SA = bzr.getOutput().getDescription();
    bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_INCLUDE_SCRIPT");
    if (bzr.getSuccess()) { SAScript = bzr.getOutput().getDescription(); }
}

if (SA)
{
    eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA));
    eval(getScriptText(SAScript, SA));
} else
{
    eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, true));
}

eval(getScriptText("INCLUDES_CUSTOM", null, true));

var cap = aa.env.getValue("CapModel");
var capId = cap.getCapID();
var servProvCode = capId.getServiceProviderCode()
var publicUser = false;
var currentUserID = aa.env.getValue("CurrentUserID");
if (currentUserID.indexOf("PUBLICUSER") == 0) { currentUserID = "ADMIN"; publicUser = true }
var capIDString = capId.getCustomID();
var systemUserObj = aa.person.getUser(currentUserID).getOutput();
var appTypeResult = cap.getCapType();
var appTypeString = appTypeResult.toString();
var appTypeArray = appTypeString.split("/");
var currentUserGroup;
var currentUserGroupObj = aa.userright.getUserRight(appTypeArray[0], currentUserID).getOutput()
if (currentUserGroupObj) currentUserGroup = currentUserGroupObj.getGroupName();
var capName = cap.getSpecialText();
var capStatus = cap.getCapStatus();
var AInfo = new Array();
loadAppSpecific4ACA(AInfo);

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

var sampleResult = AInfo["Sample Results"];
if (sampleResult == "CHECKED") 
{
    var pcapId = getParent();
    if (pcapId)
    {

        var parentTable = loadASITable("LAB RESULTS", pcapId);
        var labResultTable = new Array();
        var newRow = new Array();
        for (var row in LABRESULTS)
        {
            newRow["Technology"] = LABRESULTS[row]["Technology"];
            newRow["Email"] = LABRESULTS[row]["Email"];
            newRow["Site Name"] = LABRESULTS[row]["Site Name"];
            newRow["Site Address"] = LABRESULTS[row]["Site Address"];
            newRow["Site City"] = LABRESULTS[row]["Site City"];
            newRow["WWM#"] = LABRESULTS[row]["WWM#"];
            newRow["IA#"] = LABRESULTS[row]["IA#"];
            labResultTable.push(newRow);
            break;
        }

        removeASITable("LAB RESULTS");
        addASITable4ACAPageFlow(cap.getAppSpecificTableGroupModel(), "LAB RESULTS", labResultTable);
    }

}



/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

if (debug.indexOf("**ERROR") > 0)
{
    aa.env.setValue("ErrorCode", "1");
    aa.env.setValue("ErrorMessage", debug);
}
else
{
    if (cancel)
    {
        aa.env.setValue("ErrorCode", "-2");
        if (showMessage) aa.env.setValue("ErrorMessage", message);
        if (showDebug) aa.env.setValue("ErrorMessage", debug);
    }
    else
    {
        aa.env.setValue("ErrorCode", "0");
        if (showMessage) aa.env.setValue("ErrorMessage", message);
        if (showDebug) aa.env.setValue("ErrorMessage", debug);
    }
}

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
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