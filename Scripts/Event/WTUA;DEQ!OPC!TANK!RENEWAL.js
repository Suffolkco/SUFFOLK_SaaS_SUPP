//DEQ:OPC/TANK/RENEWAL
 
var showDebug = false;
var parentCapId = getParentCapID4Renewal(); 
var testDate = AInfo["Test Date"];
var b1ExpResult = aa.expiration.getLicensesByCapID(parentCapId);
var b1Exp = b1ExpResult.getOutput();
var newDate = new Date();

if (wfTask == "Renewal Review" && wfStatus == "Complete")
{
    //logDebug("This is the current month: " + newDate.getMonth());
    //logDebug("This is the current day: " + newDate.getDate());
    //logDebug("This is the current year: " + newDate.getFullYear());
    var dateAdd = addDays(testDate, 1095);
    var dateMMDDYYY = jsDateToMMDDYYYY(dateAdd);
    dateMMDDYYY = aa.date.parseDate(dateMMDDYYY);
	b1Exp.setExpDate(dateMMDDYYY);
	b1Exp.setExpStatus("Active");
    aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
	logDebug("Setting " + parentCapId + " 's expiration date to " + dateAdd);
	
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
function addDays(date, days) 
{
	var result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}