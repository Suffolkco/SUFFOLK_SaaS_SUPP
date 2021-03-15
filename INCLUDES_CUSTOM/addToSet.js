function addToSet(addToSetCapId, setPrefix, setType) {

    var sysDate = todayDate;
	var sDateMMDDYYYY =     (startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear()    ;
    var sysDateArray = sDateMMDDYYYY.split("/");
	if(sysDateArray[1].length>2){
		var dayOfMonth = sysDateArray[1].substr(1,2);	
	}else {
		var dayOfMonth = sysDateArray[1];
	}
	
	if(sysDateArray[0].length>2){
		var month = sysDateArray[0].substr(1,2);
	}else{
		var month = sysDateArray[0];
	}


    var setExists = false;

	var sDateMMDDYYYY =     (startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear()    ;
	var sysDateArray = sDateMMDDYYYY.split("/");
    var setName = setPrefix + " " +  (startDate.getMonth() + 1) + "/" + sysDateArray[2];
    logDebug("Set Name: " + setName);
	setGetResult = aa.set.getSetByPK(setName);
	if(setGetResult.getSuccess()) setExists = true;

    if (!setExists && setPrefix != undefined) {
        setDescription = setName;
        setStatus = "Pending";
        setExists = createSet(setName,setDescription,setType,setStatus);
    }

    if (setExists) {
        var setObj = new capSet(setName);
        var memberExists = false;
        for (var i in setObj.members) {
            var mCapId = aa.cap.getCapID(setObj.members[i].ID1,setObj.members[i].ID2,setObj.members[i].ID3).getOutput();
            if (mCapId.getCustomID() == addToSetCapId.getCustomID()) {
                memberExists = true;
                break;
            }

        }
        if (!memberExists)
            aa.set.add(setName,addToSetCapId);
    }
}


