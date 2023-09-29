function countRecordContactsByType(vContactType,vCapId){
	var cntTypeCnt = 0;
	var capContactResult = aa.people.getCapContactByCapID(vCapId);
	if (capContactResult.getSuccess()){
		var Contacts = capContactResult.getOutput();
		for (yy in Contacts){
			var thisContact = Contacts[yy].getCapContactModel();
			if(thisContact.getContactType() == vContactType) {
				cntTypeCnt++
			}
		}
	}
	return cntTypeCnt
}