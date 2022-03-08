//WTUA;CONSUMERAFFAIRS!~!~!~!

if (matches(appTypeArray[1], "Registrations", "ID Cards", "Licenses")) {
	if ( wfTask == "Issuance" && (wfStatus == "Issued" || wfStatus == "Renewed"))
	{
		createUpdateRefLicProfDCA(capId, true);		
		createUpdateRefLicProfIA(capId);
	}

} 

// DAP-362
if (matches(appTypeArray[1], "Registrations", "Licenses")) {
	if ( wfTask == "Issuance" && wfStatus == "Issued")
	{
		var expDateASI = getAppSpecific("Expiration Date", capId);

		//Updating Expiration Date of License
		if (expDateASI != null)
		{
			logDebug("ASI Expdate is: " + expDateASI);
			expDateASI = new Date(expDateASI);
			logDebug("New Date Exp Date is: " + expDateASI)
			var newExpDate = (expDateASI.getMonth() + 1) + "/" + 1 + "/" + (expDateASI.getFullYear() + 2);
			logDebug("New Exp Date is: " + newExpDate);
			editAppSpecific("Expiration Date", newExpDate, capId);
			var b1ExpResult = aa.expiration.getLicensesByCapID(capId);
			if (b1ExpResult.getSuccess())
			{
				var b1Exp = b1ExpResult.getOutput();
				b1Exp.setExpStatus("Active");
				b1Exp.setExpDate(aa.date.parseDate(newExpDate));
				aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
						
			}

		var today = new Date();
        logDebug("today's date is " + today);
        var nullExpDate = (today.getMonth() + 1) + "/" + 1 + "/" + (today.getFullYear() + 2);
        logDebug("null date is " + nullExpDate);
        editAppSpecific("Expiration Date", nullExpDate, capId);
        var b1ExpResult = aa.expiration.getLicensesByCapID(capId);
        if (b1ExpResult.getSuccess())
        {
            var b1Exp = b1ExpResult.getOutput();
            b1Exp.setExpStatus("Active");
            b1Exp.setExpDate(aa.date.parseDate(nullExpDate));
            aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
        } 
	}

} 
