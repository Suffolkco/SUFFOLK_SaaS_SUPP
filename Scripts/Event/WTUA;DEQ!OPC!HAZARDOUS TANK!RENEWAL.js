//WTUA:DEQ/OPC/HAZARDOUS TANK/RENEWAL

var showDebug = false;
var parentCapId = getParentCapID4Renewal();
logDebug("Parent cap D is: " + parentCapId);
var capAddresses = null;  
//Adding 1 year to the expiration date of parent record and setting the expiration status to Pending
b1ExpResult = aa.expiration.getLicensesByCapID(parentCapId)



var s_result = aa.address.getAddressByCapId(capId);
if(s_result.getSuccess())
{
	capAddresses = s_result.getOutput();	
}

if (wfTask == "Renewal Review" && wfStatus == "Awaiting Client Reply")
{
	logDebug("Renewal Review and PIncomplete.");          
	logDebug("In this loop Comments:" + wfComment);
	
	if (wfComment == null)
	{
		logDebug("Comments are empty.");
		workflowAwaitingClientOPC(" ", capAddresses);
	}
	else
	{
		logDebug("Comments are: " + wfComment);
		workflowAwaitingClientOPC(wfComment, capAddresses);
	}		
}


if (wfTask == "Renewal Review" && wfStatus == "Complete")
{
    if (b1ExpResult.getSuccess())
    {
        b1Exp = b1ExpResult.getOutput();
        curExp = b1Exp.getExpDate(); 
        //logDebug("Current expiration is: " + curExp);
        expDateCon = new Date(curExp.getMonth() + "/" + curExp.getDayOfMonth() + "/" + curExp.getYear());
        logDebug("Current expiration converted is: " + expDateCon);
        var year = expDateCon.getFullYear();
        var month = expDateCon.getMonth();
        var day = expDateCon.getDate();
        var newDate = new Date(year + 1, month, day);
        var dateMMDDYYYY = jsDateToMMDDYYYY(newDate);
        dateMMDDYYYY = aa.date.parseDate(dateMMDDYYYY);
        b1Exp.setExpDate(dateMMDDYYYY);
        b1Exp.setExpStatus("Pending");
        aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
        logDebug("Expiration of parent has been updated to + 1 year");	
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
            projInc[pi].setStatus("Complete");
            var updateResult = aa.cap.updateProject(projInc[pi]);
        }
    }     
}
else if (wfTask == "Renewal Review" && wfStatus == "Incomplete")
{
    var s_result = aa.address.getAddressByCapId(capId);
    if(s_result.getSuccess())
    {
        capAddresses = s_result.getOutput();
    }

	logDebug("Renewal Review and Incomplete.");          
	logDebug("In this loop Comments:" + wfComment);
	
	if (wfComment == null)
	{
		logDebug("Comments are empty.");
		workflowAwaitingClientOPC(" ", capAddresses);
	}
	else
	{
		logDebug("Comments are: " + wfComment);
		workflowAwaitingClientOPC(wfComment, capAddresses);
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
