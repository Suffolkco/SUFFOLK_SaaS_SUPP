/*------------------------------------------------------------------------------------------------------/
| BEGIN Load Variable and Dependencies
/------------------------------------------------------------------------------------------------------*/
var showDebug = true;
var debug = "";
var br = "";
var currentUserID = "ADMIN"

eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));

var field = aa.env.getValue("CUSTOMFIELD");
var fieldVal = aa.env.getValue("CUSTOMFIELDVALUE");

logDebug("Values being used for the search: " + field + ":" + fieldVal);

// Execute the update
getCAP(field, fieldVal);

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
function getCAP(f, v) {
    var vError = '';
    var id;

    try {

        var results = aa.cap.getCapIDsByAppSpecificInfoField(f, v).getOutput();

        if (results.length > 0) {
            id = results[0].getCapID();
            logDebug("CAP " + id + " found.");
            aa.print(id);
        }
        else {
            logDebug("No CAP found.");
        }

        aa.env.setValue("Response", id);

    } catch (vError) {
        aa.env.setValue("Response", "Error: " + vError);

    }
}


