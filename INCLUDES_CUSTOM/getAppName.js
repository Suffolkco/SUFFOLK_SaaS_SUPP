function getAppName(capId){    
    capResult = aa.cap.getCap(capId);
    capModel = capResult.getOutput().getCapModel()
    var appName = capModel.getSpecialText();
    if(appName)
		return appName;
	else
		return false;
}