//ASA:ADMINISTRATION/BILLING/PARAMETERS/NA

//Update Billing Parameters altId

try{
	var billingKey = getAppSpecific("Billing Key");
	var billingMonth = getAppSpecific("Billing Month");
	var billingSched = getAppSpecific("Billing Schedule");
	var billMonthNum=billingMonth.substr(0,2);
	switch(String(billingSched)){
		case "Annual":
			var billSched = "ANN";
			break;
		case "Bi-Annual":
			var billSched = "BIANN";
			break;
		case "Monthly":
			var billSched = "MNTH";
			break;
		case "Quarterly":
			var billSched = "QRT";
			break;
		case "Semi-Annual":
			var billSched = "SEMIANN";
			break;
		default: break;
	}
	var today = new Date();
	var todaysYear = today.getFullYear();
	var newAltID = billingKey + "_" + billMonthNum + "_" + todaysYear + "_" + billSched;
	if (newAltID != null && newAltID != "") {
		var altUpdated = aa.cap.updateCapAltID(capId, newAltID);
		if (!altUpdated.getSuccess()) {
			logDebug("**WARN Exeption ASA updating altId: " + altUpdated.getErrorMessage());
		} else {
			//refresh Global capId
			capId = aa.cap.getCapID(newAltID).getOutput();
			//logDebug("**TRACE refreshed capId: " + capId + " " + capId.getCustomID());
		}
	} else {
		logDebug("**WARN ASA: failed to get new altid");
	}
 
}catch (err) {
	logDebug("A JavaScript Error occurred: ASA:ADMINISTRATION/BILLING/PARAMETERS/NA altId update:  " + err.message);
}
 
// update appStatus to "Open"

try{
	updateAppStatus("Open", "Updated via EMSE");
}catch (err) {
	logDebug("A JavaScript Error occurred: ASA:ADMINISTRATION/BILLING/PARAMETERS/NA appStatus update:  " + err.message);
}
