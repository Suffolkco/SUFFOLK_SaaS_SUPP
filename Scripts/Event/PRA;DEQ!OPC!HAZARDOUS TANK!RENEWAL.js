//PRA:DEQ/OPC/HAZARDOUS TANK/RENEWAL



 


//Moving this script to WTUA on 12/3/18 per SuffolkCo request

var showDebug = false;
/*
var newDate = new Date();

var parentCap = getParentCapID4Renewal();
logDebug("Parent cap D is: " + parentCap);

//Adding 1 year to the expiration date of parent record and setting the expiration status to Pending
b1ExpResult = aa.expiration.getLicensesByCapID(parentCap)
if (b1ExpResult.getSuccess())
{
	b1Exp = b1ExpResult.getOutput();
	var curExp = b1Exp.getExpDate();
	var curExpCon = curExp.getMonth() + "/" + curExp.getDayOfMonth() + "/" + curExp.getYear();
	var newDateCon = (parseInt(newDate.getMonth() + 1)+"/"+newDate.getDate()+"/"+(parseInt(newDate.getYear())+1900));
	logDebug("Current Expiration is: " + curExpCon);
	logDebug("Current Expiration year is: " + curExp.getYear());
	logDebug("Current year is: " + newDate.getFullYear())

	if (curExp.getYear() == newDate.getFullYear())
	{
		
		var dateAdd = addDays(newDateCon, 365);
		logDebug("dateAdd is: " + dateAdd);
		var DDMMYYYY = jsDateToMMDDYYYY(dateAdd);
		logDebug("Date added to MMDDYYYY is: " + DDMMYYYY);

		DDMMYYYY = aa.date.parseDate(DDMMYYYY);
		if (balanceDue <= 0)
		{		
		b1Exp.setExpStatus("Pending");
		b1Exp.setExpDate(DDMMYYYY);
		aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
		var newExp = b1Exp.getExpDate();
		var newExpCon = newExp.getMonth() + "/" + newExp.getDayOfMonth() + "/" + newExp.getYear();
		logDebug("New Expiration date should be 1 year from date of payment: " + newExpCon);
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
*/