function editASITableRow(tableCapId, tableName, editName, editValue) {
	logDebug("In editASITableRow with parameters:" + "|" + tableCapId + "|" + tableName + "|" + editName + "|" + editValue);
	var tableArr = loadASITable(tableName, tableCapId);
	var tssmResult = aa.appSpecificTableScript.removeAppSpecificTableInfos(tableName,tableCapId,"ADMIN");
	if (tableArr) {
		for (var r in tableArr) {
			logDebug("In row " + r);
			var rowArr=new Array();
			var tempArr=new Array();
			for (var col in tableArr[r]) {
				if (tableArr[r][col].columnName.toString() == editName) {
					logDebug("Editing column: " + editName + " to " + editValue);
					var tVal = tableArr[r][col];
					tVal.fieldValue = editValue;
				}else {
					var tVal = tableArr[r][col];
				}
				logDebug("colName:" + tableArr[r][col].columnName.toString() + "|row:" + tableArr[r][col])
				//bizarre string conversion - just go with it
				var colName = new String(tableArr[r][col].columnName.toString());
				colName=colName.toString();
				tempArr[colName] = tVal;
			}

			rowArr.push(tempArr); 
			//for (var val in rowArr) for (var c in rowArr[val]) aa.print("Value " + c + ": " + rowArr[val][c]);
			addASITable(tableName,rowArr,tableCapId);
		}
	}
}