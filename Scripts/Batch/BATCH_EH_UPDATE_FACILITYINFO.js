/*
Batch Job Script
Name: BATCH_EH_UPDATE_FACILITYINFO
Description: 
Author: Don Bates (Accela)
Updates the Facility Custom fields on Facilities child records, where the Facility ID is null
If the Facility ID is null the batch determines that the update is needed.
*/

var BATCH_NAME = "BATCH_EH_UPDATE_FACILITYINFO";

var SCRIPT_VERSION = "3.0";
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, true));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS", null, true));

// Get Parameters
var currentUserID = "ADMIN";
var EmailNotifyTo = aa.env.getValue("EmailNotifyTo");
var runForVariable = aa.env.getValue("runForRecord");

//override functions for cleaner logs
var emailText = "";
var br = "<BR>";
overRide = "function logDebug(dstr) {aa.print(dstr + br);emailText += dstr}";
eval(overRide);

// Execute Main Process
mainProcess();

function mainProcess(){
    try{
        //
        showDebug = true
        if(matches(runForVariable,null,undefined,"")){
            var sql = "SELECT B.B1_ALT_ID FROM B1PERMIT B WHERE B.REC_STATUS = 'A' AND B.B1_PER_GROUP = 'EnvHealth' AND B.SERV_PROV_CODE = '$$servProvCode$$'";
            sql = sql.replace("$$servProvCode$$", aa.getServiceProviderCode());
        }else{
            // If the batch parameter runForRecord is provided
            var sql = "SELECT B.B1_ALT_ID FROM B1PERMIT B WHERE B.B1_ALT_ID = '$$runForRecord$$' AND B.REC_STATUS = 'A' AND B.B1_PER_GROUP = 'EnvHealth' AND B.SERV_PROV_CODE = '$$servProvCode$$'";
            sql = sql.replace("$$servProvCode$$", aa.getServiceProviderCode());
            sql = sql.replace("$$runForRecord$$", runForRecord);
        }
        
        var r = aa.db.select(sql, new Array()).getOutput();
        var result = new Array();
        if (r.size() > 0){
            r = r.toArray();
            for (var x in r){
                var thiscapId = aa.cap.getCapID(r[x].get("B1_ALT_ID")).getOutput();
                result.push(thiscapId);
            }
        }
        logDebug("Number of records selected by query " + result.length);
        var updatedRecs = 0;
        for (var c in result){
            batchRecordCapId = result[c];
            if(!appMatchLOC("EnvHealth/Facility/NA/NA",batchRecordCapId) && matches(getAppSpecific("Facility ID",batchRecordCapId),null,"")){
                var facilityID = getFacilityId(batchRecordCapId);
                if(facilityID != false){
                    logDebug("<B><Font Color=BLUE>Processing " + batchRecordCapId.getCustomID() + "</Font></B>");
                    updateFacilityInfo(batchRecordCapId,facilityID);
                    updatedRecs++
                }
            }
        }
        logDebug("Number of updatedRecs " + updatedRecs)
        if(!matches(EmailNotifyTo,null,undefined,"")){
            aa.sendMail("NoReply@accela.com",EmailNotifyTo, "", "Batch Job - BATCH_EH_UPDATE_FACILITYINFO", emailText);
        }
    }catch (err) {
        logDebug(err.message);
    }
}

// Batch Custom Functions
function appMatchLOC(ats) // optional capId or CapID string
	{
	var matchArray = appTypeArray //default to current app
	if (arguments.length == 2) 
		{
		matchCapParm = arguments[1]
		if (typeof(matchCapParm) == "string")
			matchCapId = aa.cap.getCapID(matchCapParm).getOutput();   // Cap ID to check
		else
			matchCapId = matchCapParm;
		if (!matchCapId)
			{
			logDebug("**WARNING: CapId passed to appMatch was not valid: " + arguments[1]);
			return false
			}
		matchCap = aa.cap.getCap(matchCapId).getOutput();
		matchArray = matchCap.getCapType().toString().split("/");
		}
		
	var isMatch = true;
	var ata = ats.split("/");
	if (ata.length != 4)
		logDebug("**ERROR in appMatch.  The following Application Type String is incorrectly formatted: " + ats);
	else
		for (xx in ata)
			if (!ata[xx].equals(matchArray[xx]) && !ata[xx].equals("*"))
				isMatch = false;
	return isMatch;
	}
function updateFacilityInfo(targetCapId,vFacilityId){
	var capResult = aa.cap.getCap(vFacilityId);
	if(capResult != null){
		var capModel = capResult.getOutput().getCapModel()
		var appName = capModel.getSpecialText();
		var itemName = "Facility ID";
		var itemGroup = null;
		if (useAppSpecificGroupName){
			if (itemName.indexOf(".") < 0)
				{ logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
			itemGroup = itemName.substr(0,itemName.indexOf("."));
			itemName = itemName.substr(itemName.indexOf(".")+1);
		}
		var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(targetCapId,itemName,vFacilityId.getCustomID(),itemGroup);
		if (appSpecInfoResult.getSuccess()){
			logDebug( "INFO: " + itemName + " was updated."); 
		} 	
		else{
			logDebug( "WARNING: " + itemName + " was not updated."); 
		}
		var itemName = "Facility Name";
		var itemGroup = null;
		if (useAppSpecificGroupName){
			if (itemName.indexOf(".") < 0)
				{ logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
			itemGroup = itemName.substr(0,itemName.indexOf("."));
			itemName = itemName.substr(itemName.indexOf(".")+1);
		}
		var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(targetCapId,itemName,appName,itemGroup);
		if (appSpecInfoResult.getSuccess()){
			logDebug( "INFO: " + itemName + " was updated."); 
		} 	
		else{
			logDebug( "WARNING: " + itemName + " was not updated."); 
		}
	}
}
function getFacilityId(vCapId){
    var facilityId = null;
    facilityId = getParentByCapId(vCapId);
    if(!matches(facilityId,null,undefined,"")){
        if(appMatch("EnvHealth/Facility/NA/NA",facilityId)){
            return facilityId;
        }else{
            // If Parent isnt a Facility, try the Gradparent
            facilityId = getParentByCapId(facilityId);
            if(!matches(facilityId,null,undefined,"")){
                if(appMatchLOC("EnvHealth/Facility/NA/NA",facilityId)){
                    return facilityId;
                }
            }
        }
    }
    return false;
}
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
