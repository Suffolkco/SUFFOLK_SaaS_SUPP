//WTUA:DEQ/OPC/TIGHTNESS TEST COMPANY/RENEWAL
 
var showDebug = false;
var todaysDate = new Date();
var dateCon = (todaysDate.getMonth() + 1) + "/" + todaysDate.getDate() + "/" + todaysDate.getFullYear();
var dateAdd = addDays(dateCon, 1095);
var dateMMDDYYY = jsDateToMMDDYYYY(dateAdd);
var parentCapId = getParentCapID4Renewal(); 
var parAltId = parentCapId.getCustomID();
var b1ExpResult = aa.expiration.getLicensesByCapID(parentCapId);

if (wfTask == "Inspection" && wfStatus == "Approved")
{
    if (b1ExpResult.getSuccess())
    {
        b1Exp = b1ExpResult.getOutput();
        dateMMDDYYY = aa.date.parseDate(dateMMDDYYY);
        b1Exp.setExpDate(dateMMDDYYY);
        b1Exp.setExpStatus("Active");
        aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
        updateAppStatus("Active", "Updated via WTUA script", parentCapId);
        var refLic = getRefLicenseProf(parAltId);
        if (refLic) 
        {   
            refLic.setLicenseExpirationDate(dateMMDDYYY);
            refLic.setAuditStatus("A");
            aa.licenseScript.editRefLicenseProf(refLic);
            logDebug(parentCapId + ": updated License expiration to " + dateMMDDYYY);
        }
    }
    var projIncomplete = aa.cap.getProjectByChildCapID(capId, "Renewal", "Incomplete");
    logDebug("Proj Inc " + projIncomplete.getSuccess());
    if(projIncomplete.getSuccess())
    {
        var projInc = projIncomplete.getOutput();
        for (var pi in projInc)
        {
            parentCapId = projInc[pi].getProjectID();
            logDebug("parentCapId: " + parentCapId);
            projInc[pi].setStatus("Review");
            var updateResult = aa.cap.updateProject(projInc[pi]);
        }
    }     
    var projReview = aa.cap.getProjectByChildCapID(capId, "Renewal", "Review");
    logDebug("Proj Rev " + projReview.getSuccess());
    if(projReview.getSuccess())
    {
        var projRev = projReview.getOutput();
        for (var pr in projRev)
        {
            parentCapId = projRev[pr].getProjectID();
            logDebug("parentCapId: " + parentCapId);
            projRev[pr].setStatus("Complete");
            var updateResult = aa.cap.updateProject(projRev[pr]);
        }
    }	
}
function addDays(date, days) 
{
	var result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}
function jsDateToMMDDYYYY(pJavaScriptDate) {
	//converts javascript date to string in MM/DD/YYYY format
	if (pJavaScriptDate != null) {
		if (Date.prototype.isPrototypeOf(pJavaScriptDate)) {
			return (pJavaScriptDate.getMonth() + 1).toString() + "/" + pJavaScriptDate.getDate() + "/" + pJavaScriptDate.getFullYear();
		} else {
			logDebug("Parameter is not a javascript date");
			return ("INVALID JAVASCRIPT DATE");
		}
	} else {
		logDebug("Parameter is null");
		return ("NULL PARAMETER VALUE");
	}
}