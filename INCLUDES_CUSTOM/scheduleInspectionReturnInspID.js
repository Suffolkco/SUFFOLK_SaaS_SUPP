function scheduleInspectionReturnInspID(iType,DaysAhead,vCapId){
	// Added Optional 4th parameter inspTime Valid format is HH12:MIAM or AM (SR5110) 
	// Added Optional 5th parameter inspComm ex. to call without specifying other options params scheduleInspection("Type",5,null,null,"Schedule Comment");
	var inspectorObj = null;
	var inspTime = null;
	var inspComm = "Scheduled via Script";
	var schedRes = aa.inspection.scheduleInspection(vCapId, inspectorObj, aa.date.parseDate(dateAdd(null,DaysAhead)), inspTime, iType, inspComm)
	if (schedRes.getSuccess()){
		logDebug("Successfully scheduled inspection : " + iType + " for " + dateAdd(null,DaysAhead));
		return schedRes.getOutput();
	}
	else{
		logDebug( "**ERROR: adding scheduling inspection (" + iType + "): " + schedRes.getErrorMessage());
	}
}