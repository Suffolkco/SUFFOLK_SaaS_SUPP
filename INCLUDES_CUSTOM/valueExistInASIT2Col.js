function valueExistInASIT2Col(vTableName,keyName1,keyValue1,keyName2,keyValue2,vCapId){
	var tableArr = loadASITable(vTableName, vCapId);
	var matchResult = false;
	if (tableArr) {
		for (var r in tableArr) {
			if (parseInt(tableArr[r][keyName1]) == parseInt(keyValue1) && tableArr[r][keyName2].toString() == keyValue2.toString()) {
				
				matchResult = true;
			}
		}
	}
	return matchResult;
}