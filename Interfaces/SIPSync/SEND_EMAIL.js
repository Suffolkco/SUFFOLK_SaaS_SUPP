/*------------------------------------------------------------------------------------------------------/
| BEGIN Load Variable and Dependencies
/------------------------------------------------------------------------------------------------------*/
var showDebug = true;
var debug = "";
var br = "";
var currentUserID = "ADMIN";

eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));

var email = aa.env.getValue("TOEMAIL");
var body = aa.env.getValue("EMAILBODY");

logDebug("Sending email");

// Execute the update
sendReport(email, body);

/*------------------------------------------------------------------------------------------------------/
| Loads other scripts
/------------------------------------------------------------------------------------------------------*/
function getScriptText(vScriptName) {
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
    return emseScript.getScriptText() + "";
}

/*------------------------------------------------------------------------------------------------------/
| Executes Search
/------------------------------------------------------------------------------------------------------*/
function sendReport(e, b) {
    var vError = '';

    try {

        aa.sendMail("noreplyehims@suffolkcountyny.gov", e, "", "SIP Failed Items", b);

    } catch (vError) {
        aa.env.setValue("Response", "Error: " + vError);

    }
}


