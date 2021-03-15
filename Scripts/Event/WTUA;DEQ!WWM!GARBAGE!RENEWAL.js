//WTUA:DEQ/WWM/GARBAGE/RENEWAL
var showDebug = false;
 
var parentCapId = getParentCapID4Renewal(); 
logDebug("Parent ID is: " + parentCapId);
var tankInfo = loadASITable("TRUCKS USED FOR WASTE HAULAGE");
var tankInfoRows = tankInfo.length;
var totalTrucks = 0;
var b1ExpResult = aa.expiration.getLicensesByCapID(parentCapId);

if (wfTask == "Renewal Review" && wfStatus == "Permit Issued")
{
    if (parentCapId)
    {
    removeASITable("TRUCKS USED FOR WASTE HAULAGE", parentCapId);
    removeASITable("DISPOSAL SITES", parentCapId);
    copyASITables(capId, parentCapId);
    updateAppStatusRen("Complete", "Updated via WTUA script", parentCapId);

        var parentTrucks = loadASITable("TRUCKS USED FOR WASTE HAULAGE", parentCapId);
        var parentTruckCount = parseInt(parentTrucks.length);
        for (c in parentTrucks)
        {
            firstRow = parentTrucks[c]; 
            endDate = firstRow["End Date"];
            year = firstRow["Year"];
            logDebug("End Date is: " + endDate);
            logDebug("Year is: " + year);
            if ((endDate.toString()).length < 1)
            {
                totalTrucks++;
                logDebug("Added 1 to total"); 
            }
        }
        editAppSpecific("Total number of trucks", parseInt(totalTrucks), parentCapId);
        editAppSpecific("Total number of trucks", parseInt(totalTrucks), capId);
        if (b1ExpResult.getSuccess())
        {
            b1Exp = b1ExpResult.getOutput();
            var curExp = b1Exp.getExpDate();
            var curExpCon = curExp.getMonth() + "/" + curExp.getDayOfMonth() + "/" + curExp.getYear();
            var newExpObj = new Date(curExpCon);
            var newExp = "12/31" + "/" + (newExpObj.getFullYear() + 2);
            newExp = aa.date.parseDate(newExp);
            b1Exp.setExpDate(newExp);
            b1Exp.setExpStatus("Pending");
            aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
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
}

function updateAppStatusRen(stat,cmt) 
{
    var thisCap = capId;
    logDebug("We're in the function.");
    logDebug(arguments.length);
    //logDebug(updateStatusResult);
	if (arguments.length > 2) thisCap = arguments[2];
	updateStatusResult = aa.cap.updateAppStatus(thisCap, "APPLICATION", stat, sysDate, cmt, systemUserObj);
	if (!updateStatusResult.getSuccess()) 
	{
		logDebug("ERROR: application status update to " + stat + " was unsuccessful.  The reason is "  + 
		updateStatusResult.getErrorType() + ":" + updateStatusResult.getErrorMessage());
	} 
	else 
	{
		logDebug("Application Status updated to " + stat);
	}
}