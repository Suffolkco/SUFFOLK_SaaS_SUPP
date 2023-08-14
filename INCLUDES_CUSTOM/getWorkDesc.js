function getWorkDesc(pCapId){
	var workDescResult = aa.cap.getCapWorkDesByPK(pCapId);
	if (!workDescResult.getSuccess()){
		logDebug("**ERROR: Failed to get work description: " + workDescResult.getErrorMessage()); 
		return false;
	}
	var workDescObj = workDescResult.getOutput();
	var workDesc = workDescObj.getDescription();
	return workDesc;
}