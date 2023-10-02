/*------------------------------------------------------------------------------------------------------/
| Program : ACA_CA_REN_STATUS_AFTER.js
| Event   : ACA_AFTER Event
|
|
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

try
{
  var parentCapId = getParentCapID4Renewal(capId);
  if (typeof parentCapId == undefined || !parentCapId || parentCapId == null || parentCapId == "") 
  {    
    aa.debug("Debug", "Parent:" + parentCapId);
  }
  else
  {               
    var licAppStatus = getAppStatus(parentCapId);
    logDebug("We found the parent record of this renewal " + parentCapId.getCustomID() + " with this status: "+ licAppStatus);
    if(licAppStatus != "About to Expire")
    {
        cancel = true;
        showMessage = true;
        comment("Your License cannot be renewed at this time, please call 311 or email: consumer.affairs@suffolkcountyny.gov for assistance");
    }
   }
   aa.sendMail("noreply@accela.com", "ada.chan@suffolkcountyny.gov", "", "Debug From ACA_CA_REN_STATUS_AFTER", debug);
    
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

function getParent(targetCapId) {
    // returns the capId object of the parent.  Assumes only one parent!
    //
    var getCapResult = aa.cap.getProjectParents(targetCapId, 1);
    if (getCapResult.getSuccess()) {
      var parentArray = getCapResult.getOutput();
      if (parentArray.length) return parentArray[0].getCapID();
      else {
        aa.print(
          "**WARNING: GetParent found no project parent for this application"
        );
        return false;
      }
    } else {
      aa.print(
        "**WARNING: getting project parents:  " + getCapResult.getErrorMessage()
      );
      return false;
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
