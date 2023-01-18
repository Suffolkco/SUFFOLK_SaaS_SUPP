//WTUA:ADMINISTRATION/BILLING/PARAMETERS/NA
if(wfTask == "Renewal Set Processing" && wfStatus == "Invalid Renewal Set"){
	var setID = capId.getCustomID(); 
	var setResult = aa.set.getSetByPK(setID);
	if(setResult.getSuccess()){
		setResult=setResult.getOutput();
		var updateSet = new capSet(setID);
		updateSet.status = "Invalid";
		updateSet.comment = "Set deemed Invalid - updated via EMSE";
		updateSet.update();
		logDebug("Successfully updated set status to Invalid");
	}else {
		logDebug("**WARN WTUA: failed to update set status to Invalid");
	}
}
if ("Renewal Set Processing".equals(wfTask) && "Create Renewal Set".equals(wfStatus)){
	var envParameters = aa.util.newHashMap();
	envParameters.put("BillingParamRecNumber", capId.getCustomID());
	envParameters.put("EmailNotifyTo", getUserEmail(currentUserID));
	aa.runAsyncScript("BATCH_EH_BILLING_CREATE_SETS", envParameters);
}
if(wfTask == "Renewal Set Processing" && wfStatus == "Run Fee Assessment Batch"){
	var envParameters = aa.util.newHashMap();
	envParameters.put("BillingParamRecNumber", capId.getCustomID());
	envParameters.put("EmailNotifyTo", getUserEmail(currentUserID));
	aa.runAsyncScript("BATCH_EH_BILLING_ASSESSFEES", envParameters);
	
}
if ("Fee Assessment Review".equals(wfTask) && "Invalid Fee Assessment".equals(wfStatus)){
	var envParameters = aa.util.newHashMap();
	envParameters.put("BillingParamRecNumber", capId.getCustomID());
	envParameters.put("EmailNotifyTo", getUserEmail(currentUserID));
	aa.runAsyncScript("BATCH_EH_BILLING_INVALID", envParameters);
}
if(wfTask == "Fee Assessment Review" && wfStatus == "Run Invoice Batch"){
	var envParameters = aa.util.newHashMap();
	envParameters.put("BillingParamRecNumber", capId.getCustomID());
	envParameters.put("CreateNextBillingRecord", "Y");
	envParameters.put("EmailNotifyTo", getUserEmail(currentUserID));
	aa.runAsyncScript("BATCH_EH_BILLING_INVOICEFEES", envParameters);
}

function getUserEmail(userID){
	var userEmail = "";
	var currentUsrVar = aa.person.getUser(userID).getOutput();
	if (currentUsrVar != null){
		userEmail = currentUsrVar.getEmail();
	}
	return  userEmail;
}
