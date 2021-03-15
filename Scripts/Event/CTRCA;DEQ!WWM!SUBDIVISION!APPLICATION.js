//CTRCA:DEQ/WWM/SUBDIVISION/APPLICATION

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