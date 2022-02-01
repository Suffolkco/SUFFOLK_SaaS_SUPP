//ASA:DEQ/WWM/SUBDIVISION/APPLICATION

var propLots = AInfo["Total Number of Lots Proposed"];
var feeEx = AInfo["Fee Exempt"];

if (feeEx == "No" || feeEx == null)
{
    if (propLots != null)
    {
        updateFee("SUB-LOT", "DEQ_SUB", "FINAL", parseInt(propLots), "Y");
    }
}

removeBORFees(capId);

// Add BOR fee if the custom field is set to Yes by public user
if (publicUser)
{
	var bor = AInfo["Are you applying for a Board of Review(BOR) hearing at this time? If yes, submit form WWM"];
	
	if (bor == 'Yes')
	{
	    addFee("BOR", "DEQ_WWM_SUB", "FINAL", 1, "Y")
	}
}

var capmodel = aa.cap.getCap(capId).getOutput().getCapModel();
if(capmodel.isCompleteCap() && capmodel.getCreatedByACA() == "N")
{
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
}
function removeBORFees(itemCap) 
{
	getFeeResult = aa.fee.getFeeItems(itemCap, null, "NEW");
	if (getFeeResult.getSuccess()) 
	{
		var feeList = getFeeResult.getOutput();
		for (feeNum in feeList) 
		{
			if (feeList[feeNum].getFeeitemStatus().equals("NEW")) 
			{
				
				if (feeList[feeNum].getFeeCod() == "BOR")
				{
					var feeSeq = feeList[feeNum].getFeeSeqNbr();
					var editResult = aa.finance.removeFeeItem(itemCap, feeSeq);
					if (editResult.getSuccess()) {
						logDebug("Removed existing Fee Item: " + feeList[feeNum].getFeeCod());
					} else {
						logDebug("**ERROR: removing fee item (" + feeList[feeNum].getFeeCod() + "): " + editResult.getErrorMessage());
						break
					}
				}
				
			}
			
		}
	} 
	else {
		logDebug("**ERROR: getting fee items (" + feeList[feeNum].getFeeCod() + "): " + getFeeResult.getErrorMessage())
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