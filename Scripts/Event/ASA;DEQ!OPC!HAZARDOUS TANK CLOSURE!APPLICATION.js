//DEQ/OPC/HAZARDOUS TANK CLOSURE/APPLICATION

var tankClose = loadASITable("TANK CLOSURE INFORMATION", capId);
var feeCount = 0;
var feeEx = getAppSpecific("Fee Exempt");
var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var reportFile = new Array();
	var conArray = getContactArray();
	var conEmail = "";
    var fromEmail = "";   
    var capAddresses = null;  
    var shortNotes = getShortNotes(capId);

// Send email to all contacts 
if (!publicUser)
{
    var s_result = aa.address.getAddressByCapId(capId);
    if(s_result.getSuccess())
    {
    capAddresses = s_result.getOutput();
    }
    logDebug("Getting emails.");

    if(matches(fromEmail, null, "", undefined))
    {
    fromEmail = "";
    }
    for (con in conArray)
    {
    if (!matches(conArray[con].email, null, undefined, ""))
    {
        logDebug("Contact email: " + conArray[con].email);
        conEmail += conArray[con].email + "; ";
    }
    }
    var lpResult = aa.licenseScript.getLicenseProf(capId);
    if (lpResult.getSuccess())
    { 
    var lpArr = lpResult.getOutput();  
    } 
    else 
    { 
    logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
    }
    for (var lp in lpArr)
    {
    if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
    {
        logDebug("LP email: " + lpArr[lp].email);
        conEmail += lpArr[lp].getEmail() + "; ";
    }
    }
    getRecordParams4Notification(emailParams);
        
    addParameter(emailParams, "$$CAPAlias$$", cap.getCapType().getAlias());
    addParameter(emailParams, "$$shortNotes$$", shortNotes);  
    addParameter(emailParams, "$$altID$$", capId.getCustomID());

    if (capAddresses != null)
    {
    logDebug("Record address:" +capAddresses[0]);
        addParameter(emailParams, "$$address$$", capAddresses[0]);
    }

    if (conEmail != null)
    {
        logDebug ("test");
        logDebug("Email addresses: " + conEmail);
        sendNotification("", conEmail, "", "DEQ_OPC_TANK_CLOSURE_APPLICATION_SUBMITTAL", emailParams, reportFile);
    }
}

if (feeEx == "No" || feeEx == null)
    {
        for (t in tankClose)
        {
            var locat = tankClose[t]["Location"].toString();
            //var proStor = tankClose[t]["Product Stored Code"].toString();
            //var capac = parseFloat(tankClose[t]["Capacity"]);
            
            if (matches(locat, "Underground-Outdoors", "Underground-Indoors"))
            {
                logDebug("Adding 1 to fee count");
                feeCount++;
            }
            else 
            {
                logDebug("There is no fee for this location type");
            }
        }
        if (feeCount >= 1)
        {
            updateFee("HM-UST-CLOSU", "DEQ_TANKCLAPP", "FINAL", feeCount, "Y");
        }
}

function matches(eVal, argList) {
	for (var i = 1; i < arguments.length; i++) {
		if (arguments[i] == eVal) {
			return true;
		}
	}
	return false;
} 