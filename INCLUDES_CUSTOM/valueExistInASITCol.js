function valueExistInASITCol(vTableName,keyName,keyValue,vCapId){
	var tableArr = loadASITable(vTableName, vCapId);
	var matchResult = false;
	if (tableArr) {
		for (var r in tableArr) {
			if (parseInt(tableArr[r][keyName]) == parseInt(keyValue)) {
				matchResult = true;
			}
		}
	}
	return matchResult;
}