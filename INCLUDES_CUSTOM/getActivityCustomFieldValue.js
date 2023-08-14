function getActivityCustomFieldValue(capId,activityCustomFieldName,curActivityNumber){
	var activityBusiness = aa.proxyInvoker.newInstance("com.accela.aa.aamain.servicerequest.ActivityBusiness").getOutput();
	var ActivitySpecInfoBusiness = aa.proxyInvoker.newInstance("com.accela.aa.aamain.activityspecinfo.ActivitySpecInfoBusiness").getOutput();
	if(activityBusiness != null){
		var activityList = activityBusiness.getActivityListBySR(capId);
		if(!activityList) {
			logDebug("No activities on target record.");
			return false;
		}
		var lIt = activityList.iterator();
		while(lIt.hasNext()){
			var thisActivity = lIt.next();
			if(thisActivity.getActivityNumber() == parseInt(curActivityNumber)){
				var fieldsList = ActivitySpecInfoBusiness.getRefASIsByRefAcitivity(aa.getServiceProviderCode(),'RECORD',thisActivity.getActivityNumber());
				var fIt = fieldsList.iterator();
				while(fIt.hasNext()){
					var thisField = fIt.next();
					if(thisField.ASIName == activityCustomFieldName){
						return thisField.dispASIValue;
					}
				}
			}
		}
	}
}