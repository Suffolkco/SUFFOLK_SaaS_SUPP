//ASIUA:DEQ/Ecology/IA/Application
//Update the expiration date based off of Custom Field.
 
var expDate = getAppSpecific("Contract Expiration Date", capId);
logDebug("Expiration Date: " + expDate);
var b1Exp;
logDebug("Type of expDate: " + typeof(expDate));
 
b1ExpResult = aa.expiration.getLicensesByCapID(capId)
if (b1ExpResult.getSuccess())
{
 b1Exp = b1ExpResult.getOutput();
var tmpDate = b1Exp.getExpDate();
 
logDebug("DateCovnerted: " + tmpDate.getMonth() + "/" + tmpDate.getDayOfMonth() + "/" + tmpDate.getYear());
expDate = aa.date.parseDate(expDate);
 
//b1Exp.setExpDateString(String(expDate));
if (expDate != null)
{
    b1Exp.setExpDate(expDate);
    aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
}

var tmpDate2 = b1Exp.getExpDate();
logDebug("DateCovnerted: " + tmpDate2.getMonth() + "/" + tmpDate2.getDayOfMonth() + "/" + tmpDate2.getYear());


} 
