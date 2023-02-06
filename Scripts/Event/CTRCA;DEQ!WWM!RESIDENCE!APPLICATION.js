//CTRCA:DEQ/WWM/RESIDENCE/APPLICATION

//ASA:DEQ/WWM/RESIDENCE/APPLICATION

var methWat = AInfo["Method of Water Supply"];
var methSew = AInfo["Method of Sewage Disposal"];
var feeEx = AInfo["Fee Exempt"];
var countyState = AInfo["Is this application part of the County/State I/A OWTS SIP grant/loan program?"]

if (feeEx == "No" || feeEx == null )
{
	if (methSew.equals("Public Sewers")  ||
	methSew.equals("Construct an STP") ||
	methSew.equals("Existing STP"))
	{
		updateFee("RES-PW-PS", "DEQ_SFR", "FINAL", 1, "Y");
	}
	else
	{
		updateFee("RES-PW-PS", "DEQ_SFR", "FINAL", 0, "Y");
	}
	if (methWat.equals("Private Well"))
	{
		updateFee("RES-WELL-OWT", "DEQ_SFR", "FINAL", 1, "Y");
		
		if (feeExists("RES-PW-OWTS"))
		{
			updateFee("RES-PW-OWTS", "DEQ_SFR", "FINAL", 0, "Y");
		}
	}
	else if (methWat.equals("Public Water"))
	{
		if (feeExists("RES-WELL-OWT"))
		{
			updateFee("RES-WELL-OWT", "DEQ_SFR", "FINAL", 0, "Y");
		}
		if (methSew.equals("Conventional Septic System") || methSew.equals("I/A System"))
		{
			updateFee("RES-PW-OWTS", "DEQ_SFR", "FINAL", 1, "Y");
			
		}
		else
		{
			updateFee("RES-PW-OWTS", "DEQ_SFR", "FINAL", 0, "Y");
		}
	} 
	else 
	{
		logDebug("No Fee.");
	}
}

removeBORFees(capId);

// Add BOR fee if the custom field is set to Yes by public user
var borDocCheck = determineACADocumentAttached("Board of Review Application");    

if(borDocCheck)
{       
	addFee("BOR", "DEQ_SFR", "FINAL", 1, "Y");
}



var b1ExpResult = aa.expiration.getLicensesByCapID(capId);
if (b1ExpResult.getSuccess())
{
	b1Exp = b1ExpResult.getOutput();
	var todaysDate = new Date();
	var todDateCon = (todaysDate.getMonth() + 1) + "/" + todaysDate.getDate() + "/" + (todaysDate.getFullYear());
	//logDebug("This is the current month: " + todaysDate.getMonth());
	//logDebug("This is the current day: " + todaysDate.getDate());
	//logDebug("This is the current year: " + todaysDate.getFullYear());
	b1Exp = b1ExpResult.getOutput();
	var dateAdd = addDays(todDateCon, 2190);
	var dateMMDDYYY = jsDateToMMDDYYYY(dateAdd);

	dateMMDDYYY = aa.date.parseDate(dateMMDDYYY);
	b1Exp.setExpDate(dateMMDDYYY);
	b1Exp.setExpStatus("Pending");
	aa.expiration.editB1Expiration(b1Exp.getB1Expiration());      
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