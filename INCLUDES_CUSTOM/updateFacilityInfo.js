function updateFacilityInfo(targetCapId,vFacilityId){
	var capResult = aa.cap.getCap(vFacilityId);
	if(capResult != null){
		var capModel = capResult.getOutput().getCapModel()
		var appName = capModel.getSpecialText();
		var itemName = "Facility ID";
		var itemGroup = null;
		if (useAppSpecificGroupName){
			if (itemName.indexOf(".") < 0)
				{ logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
			itemGroup = itemName.substr(0,itemName.indexOf("."));
			itemName = itemName.substr(itemName.indexOf(".")+1);
		}
		var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(targetCapId,itemName,vFacilityId.getCustomID(),itemGroup);
		if (appSpecInfoResult.getSuccess()){
			logDebug( "INFO: " + itemName + " was updated."); 
		} 	
		else{
			logDebug( "WARNING: " + itemName + " was not updated."); 
		}
		var itemName = "Facility Name";
		var itemGroup = null;
		if (useAppSpecificGroupName){
			if (itemName.indexOf(".") < 0)
				{ logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
			itemGroup = itemName.substr(0,itemName.indexOf("."));
			itemName = itemName.substr(itemName.indexOf(".")+1);
		}
		var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(targetCapId,itemName,appName,itemGroup);
		if (appSpecInfoResult.getSuccess()){
			logDebug( "INFO: " + itemName + " was updated."); 
		} 	
		else{
			logDebug( "WARNING: " + itemName + " was not updated."); 
		}
	}
}