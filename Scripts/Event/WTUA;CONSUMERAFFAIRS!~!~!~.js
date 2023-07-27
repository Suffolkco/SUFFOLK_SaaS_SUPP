//WTUA;CONSUMERAFFAIRS!~!~!~!

if (matches(appTypeArray[1], "Registrations", "ID Cards", "Licenses")) {
	if ( wfTask == "Issuance" && (wfStatus == "Issued" || wfStatus == "Renewed"))
	{
		createUpdateRefLicProfDCA(capId, true);		
		createUpdateRefLicProfIA(capId);
	}

} 

// DAP-559
if (matches(appTypeArray[1], "Licenses") && appTypeArray[2] != "Renewal" && matches(appTypeArray[3], "NA"))
{
	if ( wfTask == "Issuance" && wfStatus == "Invalid Payment")
	{
		var expDateASI = getAppSpecific("Expiration Date", capId);

		//Updating Expiration Date of License	
		logDebug("Current ASI Expdate is: " + expDateASI);
		
		var expDate = new Date(expDateASI);
		logDebug("expDate's date is " + expDate);	
		var newExpDate = moveBackDate(expDate);
		logDebug("New expiration date is " + newExpDate);

		editAppSpecific("Expiration Date", newExpDate, capId);
		var b1ExpResult = aa.expiration.getLicensesByCapID(capId);
		if (b1ExpResult.getSuccess())
		{
			var b1Exp = b1ExpResult.getOutput();
			b1Exp.setExpStatus("Expired");
			b1Exp.setExpDate(aa.date.parseDate(newExpDate));
			aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
		} 
		
	}
}


logDebug("appTypeString  is " + appTypeString);
// DAP-362
if (matches(appTypeArray[1], "Registrations", "Licenses") && appTypeArray[2] != "Renewal" && matches(appTypeArray[3], "NA"))
{

	if ( wfTask == "Issuance" && wfStatus == "Issued")
	{
		var expDateASI = getAppSpecific("Expiration Date", capId);

		//Updating Expiration Date of License	
		logDebug("Current ASI Expdate is: " + expDateASI);
		
		var today = new Date();
		logDebug("today's date is " + today);
		var nullExpDate = (today.getMonth() + 1) + "/" + 1 + "/" + (today.getFullYear() + 2);

		var newExpDate = formatDate(nullExpDate);
		logDebug("New expiration date is " + newExpDate);

		editAppSpecific("Expiration Date", newExpDate, capId);
		var b1ExpResult = aa.expiration.getLicensesByCapID(capId);
		if (b1ExpResult.getSuccess())
		{
			var b1Exp = b1ExpResult.getOutput();
			b1Exp.setExpStatus("Active");
			b1Exp.setExpDate(aa.date.parseDate(newExpDate));
			aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
		} 
		// DAP-579 Send Survey
		var conArray = getContactByType("Vendor", capId);
		var conEmail = "";
		var emailTemplate = "";
		var emailParams = aa.util.newHashtable();
		if (!matches(conArray.email, null, undefined, "")) 
		{			
			emailTemplate = "CA_LIC_REG_SURVEYS";						
			conEmail += conArray.email + "; ";
			logDebug("Email addresses: " + conEmail);
			sendNotification("", conEmail, "", emailTemplate, emailParams, null);
		}
	}

} 
function moveBackDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear()-2;

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [month, day, year].join('/');
}
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [month, day, year].join('/');
}