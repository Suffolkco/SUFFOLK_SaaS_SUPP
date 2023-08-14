function returnValueInASITCol(vTableName,keyName1,keyValue1,returnColumn,vCapId){
	var returnValue = null;
	var tableArr = loadASITable(vTableName, vCapId);
	if (tableArr) {
		for (var r in tableArr) {
			if (parseInt(tableArr[r][keyName1]) == parseInt(keyValue1)){
				returnValue = tableArr[r][returnColumn]
			}
		}
	}
	return returnValue;
}