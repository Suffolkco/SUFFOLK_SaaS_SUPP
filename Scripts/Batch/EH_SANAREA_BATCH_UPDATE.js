/*
Batch Job Script 
Name: BATCH_EH_SANAREA_UPDATE
Description: Updates the 'SAN_AREA' field on the records based on the zip code of the record's address. Gets SanAreas to zips info from EH_SANAREA_BATCH_UPDATE standard choice
Author: Ron Kovacs
*/

//#region Load Environment
var SCRIPT_VERSION = "3.0";
var BATCH_NAME = "BATCH_EH_SANAREA_UPDATE";
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, true));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS", null, true));

//#endregion

//override functions for cleaner logs
var emailText = "";
var br = "<BR>";
overRide = "function logDebug(dstr) {aa.print(dstr + br);emailText += dstr + br;}";
eval(overRide);

//#region Batch Globals
var showDebug = true; // Set to true to see debug messages
var startDate = new Date();
var startTime = startDate.getTime(); // Start timer
var sysDate = aa.date.getCurrentDate();
var batchJobID = aa.batchJob.getJobID().getOutput();
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var servProvCode = aa.getServiceProviderCode();
var capId = null;
var altId = "";
var documentOnly = false;

//#endregion

// Execute Main Process
mainProcess();

logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");

//#region Main
function mainProcess() {
    var appTypeResult = aa.cap.getByAppType("EnvHealth", null, null, "Permit");
    if (appTypeResult.getSuccess()) {
        var appTypeArray = appTypeResult.getOutput();
        var zipToSanAreaMap = buildZipToSanAreaMap(); // Build the map before starting the loop
        for (var a in appTypeArray) {
            var capId = appTypeArray[a].getCapID();
            altId = capId.getCustomID();
            logDebug("altId is: " + altId);
            var zipCode = getZipCodeFromAddress(capId);
            logDebug("Extracted Zip:" + zipCode);
            if (zipCode !== "" && zipCode !== "NA") {
                var sanArea = getSanAreaByZipCode(zipCode, zipToSanAreaMap); // Pass the map to the function
                logDebug("SAN_AREA should be:" + sanArea);
                if (sanArea !== "NA") {
                    var currentSanArea = getAppSpecific("SAN AREA", capId);
					logDebug("Current San Area is: " + currentSanArea);
                    if (sanArea !== currentSanArea) {
                        //logDebug("Attempting to update 'SAN AREA' for Record with id: " + capId + " to: " + sanArea);
                        var updateResult = editAppSpecific("SAN AREA", sanArea, capId);
                        if (updateResult && updateResult.getSuccess()) {
                           //logDebug("Successfully updated 'SAN AREA' ASI field for Record with id: " + capId);
                        } else if (updateResult) {
                            logDebug("**ERROR: Failed to update 'SAN AREA' ASI field for Record with id: " + altId + ". Error: " + updateResult.getErrorMessage());
                        }
                    } else {
                        logDebug("'SAN_AREA' ASI field for Record with id: " + altId + " already has the value: " + sanArea + ". No update needed.");
                    }
                } else {
                    logDebug("No SAN_AREA value found for ZipCode: " + zipCode);
                }
            } else {
                logDebug("No address or ZipCode found for Record with id: " + altId);
            }
        }
    } else {
        logDebug("**ERROR: Getting permit records in EnvHealth module: " + appTypeResult.getErrorMessage());
    }
}


//#endregion 


//#region Private Functions

function buildZipToSanAreaMap() {
    var zipToSanAreaMap = {};
    for (var i = 1; i <= 19; i++) {
        var zipCodesString = lookup("EH_SANAREA_BATCH_UPDATE", i.toString()) || "";
        if (zipCodesString !== "") {
            var zipCodes = zipCodesString.split(",");
            for (var j in zipCodes) {
                zipToSanAreaMap[zipCodes[j]] = i.toString();
            }
        }
    }
    return zipToSanAreaMap;
}


function getSanAreaByZipCode(zipCode, zipToSanAreaMap) {
    return zipToSanAreaMap[zipCode] || "NA";
}


function getZipCodeFromAddress(capId) {
    var strZipCode = "NA";
    var capAddressResult = aa.address.getAddressByCapId(capId);
    if (capAddressResult.getSuccess()) {
        var addressArray = capAddressResult.getOutput();
        for (var i in addressArray) {
            var addressModel = addressArray[i];
            if (addressModel.getPrimaryFlag() == "Y") {
                strZipCode = addressModel.getZip();
                break;
            }
        }
    } else {
        logDebug("**ERROR: Failed to get Address object: " + capAddressResult.getErrorType() + ":" + capAddressResult.getErrorMessage());
    }
    return strZipCode;
}


function elapsed() {
    var thisDate = new Date();
    var thisTime = thisDate.getTime();
    return ((thisTime - startTime) / 1000);
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
//#endregion