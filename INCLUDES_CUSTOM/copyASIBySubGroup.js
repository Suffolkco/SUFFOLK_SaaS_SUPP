function copyASIBySubGroup(sourceCapId, targetCapId, vSubGroupName) {
	useAppSpecificGroupName = true;
    var sAInfo = new Array;
    loadAppSpecific(sAInfo, sourceCapId);
    for (var asi in sAInfo) {
		if( asi.substr(0,asi.indexOf(".")) == vSubGroupName){
			editAppSpecific(asi, sAInfo[asi], targetCapId);
		}
    }
	useAppSpecificGroupName = false;
}
