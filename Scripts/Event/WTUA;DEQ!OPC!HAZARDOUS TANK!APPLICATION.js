//WTUA:DEQ/OPC/HAZARDOUS TANK/APPLICATION
var showDebug = true;
var capAddresses = null;  
var completeAppStatus = "Complete";

var s_result = aa.address.getAddressByCapId(capId);
if(s_result.getSuccess())
{
	capAddresses = s_result.getOutput();	
}

if (wfTask == "Inspections" && wfStatus == "Plan Changed")
{ 
	logDebug("Hazardous Tank Application in Inspection and Plan Changed.");  
	logDebug("wfComment: " + wfComment);
		
	if (wfComment == null)
	{
		workflowInspectionPlanChangedOPC(" ", capAddresses);
		logDebug("Comments are empty.");
	}
	else
	{
		logDebug("Comments are: " + wfComment);
		workflowInspectionPlanChangedOPC(wfComment, capAddresses);
	}

	updateTask("Plans Distribution", "Awaiting Client Reply", "Plan corrections submitted by Applicant", "Plan corrections submitted by Applicant");              
	logDebug("done in Inspections.")
}
else if (wfTask == 'Plans Coordination' && wfStatus == 'Plan Revisions Needed')     
{
	logDebug("Plans coordination and Plan Revisions Needed.");          
	logDebug("In this loop Comments:" + wfComment);
	
	if (wfComment == null)
	{
		logDebug("Comments are empty.");
		workflowPlanRevisionsNeeded(" ", capAddresses);
	}
	else
	{
		logDebug("Comments are: " + wfComment);
		workflowPlanRevisionsNeeded(wfComment, capAddresses);
	}		
}
else if (wfTask == "Plans Distribution" && wfStatus == "Approved")
{
    //Adding 1 year to the expiration date
	b1ExpResult = aa.expiration.getLicensesByCapID(capId)
	if (b1ExpResult.getSuccess())
	{
		b1Exp = b1ExpResult.getOutput();		
		var stDate = new Date(wfDateMMDDYYYY);
		stDateCon = new Date(stDate.getMonth() + "/" + stDate.getDate() + "/" + stDate.getYear());
		var year = stDateCon.getFullYear();
		var month = stDateCon.getMonth();
		var day = stDateCon.getDate();
		var newDate = new Date(year + 1901, month + 1, day);
		var dateMMDDYYYY = jsDateToMMDDYYYY(newDate);
        dateMMDDYYYY = aa.date.parseDate(dateMMDDYYYY);
		b1Exp.setExpDate(dateMMDDYYYY);
		aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
		logDebug("Expiration has been updated to the status date + 1 year");
    }
}
else if (wfTask == "Plans Coordination" && wfStatus == "Approved")
{
	// Email notification	
	workflowPlansCoordinationApproved(capAddresses);			

    //Adding 1 year to the expiration date
	b1ExpResult = aa.expiration.getLicensesByCapID(capId)
	if (b1ExpResult.getSuccess())
	{
		b1Exp = b1ExpResult.getOutput();
		var newDate = new Date();
		var todDateCon = (newDate.getMonth() + 1) + "/" + newDate.getDate() + "/" + (newDate.getFullYear());
		//logDebug("This is the current month: " + newDate.getMonth());
		//logDebug("This is the current day: " + newDate.getDate());
		//logDebug("This is the current year: " + newDate.getFullYear());
		var dateAdd = addDays(todDateCon, 365);
		var dateMMDDYYY = jsDateToMMDDYYYY(dateAdd);
		dateMMDDYYY = aa.date.parseDate(dateMMDDYYY);
		b1Exp.setExpDate(dateMMDDYYY);
		aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
    }

	// EHIMS-5290
	copyAndCompareContacts();
} 

var parentId = getParent();

if (wfTask == "Final Review" && wfStatus == "Approved")
{
	var childTankArray = getChildren("DEQ/OPC/Hazardous Tank/Permit", parentId);
	var tankAppInfo = loadASITable("TANK INFORMATION");

	if (childTankArray != null)
	{
		for (var i = 0; i < childTankArray.length; i++)
		{
            var getCapResult = aa.cap.getCapID(childTankArray[i]);
			if (getCapResult)
			{
				var childTankCapId = childTankArray[i].getCustomID();
                var tankID = getAppSpecific("Tank ID From Plan", childTankArray[i]);
                var epaReg = getAppSpecific("EPA Tank", childTankArray[i]);
                logDebug("EPA Regulated is: " + epaReg);
                var childCap = getCapResult.getOutput();
				logDebug("Tank ID From Plan for " + childTankCapId + " is " + tankID);
				b1ExpResult = aa.expiration.getLicensesByCapID(childTankArray[i]);
				b1Exp = b1ExpResult.getOutput();
				if (tankAppInfo != null)
				{
					for (var j = 0; j < tankAppInfo.length; j++)
					{
						var tankIDApp = tankAppInfo[j]["Tank Id from Plan"];
						logDebug("Tank Id from Plan on App is: " + tankIDApp);
						if (tankIDApp.toString() == tankID.toString())
						{
							logDebug("Match");
							if (epaReg == "No" || epaReg == null)
							{
								var noDate = new Date("1/1/2200");
								var noDateCon = (noDate.getMonth() + 1) + "/" + noDate.getDate() + "/" + noDate.getFullYear();
								noDateCon = aa.date.parseDate(noDateCon);
								b1Exp.setExpDate(noDateCon);
								aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
								logDebug("Setting " + childTankArray[i] + " 's expiration date to " + noDate);       
								break;
							}
							else
							{
								var newDate = new Date();
								var todDateCon = (newDate.getMonth() + 1) + "/" + newDate.getDate() + "/" + (newDate.getFullYear());
								//logDebug("This is the current month: " + newDate.getMonth());
								//logDebug("This is the current day: " + newDate.getDate());
								//logDebug("This is the current year: " + newDate.getFullYear());
								var dateAdd = addDays(todDateCon, 1095);
								var dateMMDDYYY = jsDateToMMDDYYYY(dateAdd);
								dateMMDDYYY = aa.date.parseDate(dateMMDDYYY);
								b1Exp.setExpDate(dateMMDDYYY);
								aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
								logDebug("Setting " + childTankArray[i] + " 's expiration date to " + dateAdd);       
								break;
							}
						}
					}
				}
			}
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