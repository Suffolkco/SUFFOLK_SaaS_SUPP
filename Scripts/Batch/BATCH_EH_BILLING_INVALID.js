/*
Batch Job Script
Name: BATCH_EH_BILLING_INVALID
Description: 
Author: Don Bates (Accela)
*/
var BATCH_NAME = "BATCH_EH_BILLING_INVALID";

var SCRIPT_VERSION = "3.0";
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, true));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS", null, true));


// Get Parameters
var currentUserID = "ADMIN";
var EmailNotifyTo = aa.env.getValue("EmailNotifyTo");
var billingParamRecNumber = aa.env.getValue("BillingParamRecNumber");

//override functions for cleaner logs
var emailText = "";
var br = "<BR>";
overRide = "function logDebug(dstr) {aa.print(dstr + br);emailText += dstr}";
eval(overRide);

// Execute Main Process
mainProcess();

function mainProcess(){
    //get billing parameter record
    var billingParamId = aa.cap.getCapID(billingParamRecNumber).getOutput();
    if (!billingParamId){
        logDebug("<B><Font Color=RED>" + billingParamRecNumber + ": Invalid record number</Font></B");
        return false;
    }
    var setName = billingParamId.getCustomID();
    var EnvhProgramSet = aa.set.getSetByPK(setName).getOutput();
	if (EnvhProgramSet == null) {
		logDebug("<B><Font Color=RED>Set " + setName + " Not Found</Font></B>");
        return false;
	}
	logDebug("Found Set ID " + setName);
    logDebug("<B>Begin Processing of Set Members</B>");
	//get set members and process each record
	var setMembers = aa.set.getCAPSetMembersByPK(setName).getOutput().toArray();
	for (a in setMembers) {
		var setCap = aa.cap.getCap(setMembers[a].ID1, setMembers[a].ID2, setMembers[a].ID3).getOutput();
		var EnvhProgramCapId = setCap.getCapID();
        logDebug("<B><Font Color=BLUE>Set Member " + EnvhProgramCapId.getCustomID() + "</Font></B>");
        var feeA = loadFees(EnvhProgramCapId);
        for(var f in feeA){
            var thisFee = feeA[f];
            var feeSeqNo = thisFee.sequence
            var feeStat = thisFee.status
            if(feeStat == "NEW"){
                var editResult = aa.finance.removeFeeItem(EnvhProgramCapId, feeSeqNo);
                if (editResult.getSuccess()) {
                    logDebug("Removed existing Fee Item: " + feeSeqNo);
                } else {
                    logDebug("**ERROR: removing fee item (" + feeSeqNo + "): " + editResult.getErrorMessage());
                }
            }
        }
    }
    logDebug("<B>End Processing of Set Members</B>");
}

// Batch Custom Functions
function getScriptText(vScriptName, servProvCode, useProductScripts) {
    if (!servProvCode)
        servProvCode = aa.getServiceProviderCode();
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    try {
        if (useProductScripts) {
            var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
        } else {
            var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
        }
        return emseScript.getScriptText() + "";
    } catch (err) {
        return "";
    }
}
