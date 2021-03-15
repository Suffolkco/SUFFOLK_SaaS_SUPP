function editASITableRowViaRowIdentifer(tableCapId, tableName, editName, editValue, rowValue, rowIdentifier) {
    logDebug("In editASITableRow with parameters:" + "|" + tableCapId + "|" + tableName + "|" + editName + "|" + editValue + "|" + rowValue + "|" + rowIdentifier);
    //[push]
    var tableArr = loadASITable(tableName, tableCapId);
    var returnStatus = false;
	var tssmResult = aa.appSpecificTableScript.removeAppSpecificTableInfos(tableName,tableCapId,"ADMIN");
	if (tableArr) {
		for (var r in tableArr) {
			logDebug("In row " + r);
			var rowArr=new Array();
			var tempArr=new Array();
			for (var col in tableArr[r]) {
                if(tableArr[r][rowIdentifier] != undefined)
                {

               
              //  logDebug("This is value of col: " + col);
             // logDebug("Comparing: " + tableArr[r][rowIdentifier].toString()   + " with: " + rowValue.toString());
                if (tableArr[r][rowIdentifier].toString()  == rowValue.toString()) 
                {  // logDebug("Comparing: " + tableArr[r][col].columnName.toString() + " with: " + editName);
                   
                    if(tableArr[r][col].columnName.toString()==editName)
                    {
                        logDebug("We are looking for tank number: " + rowValue + " this is our current value: " + tableArr[r][col]);
                    
					var tVal = tableArr[r][editName];
                    tVal.fieldValue = editValue;
                    logDebug("Set value of " + tableArr[r][editName].columnName.toString() + " to be: " + editValue);
                    returnStatus = true;
                    
                }
                else {
                    var tVal = tableArr[r][col];
                   // logDebug("Else statement: " + tVal);
				}
				}else {
                    var tVal = tableArr[r][col];
                   // logDebug("Else statement: " + tVal);
				}
			//	logDebug("colName:" + tableArr[r][col].columnName.toString() + "|row:" + tableArr[r][col])
				//bizarre string conversion - just go with it
				var colName = new String(tableArr[r][col].columnName.toString());
				colName=colName.toString();
				tempArr[colName] = tVal;
            }

        }
			rowArr.push(tempArr); 
			//for (var val in rowArr) for (var c in rowArr[val]) logDebug("Value " + c + ": " + rowArr[val][c]);
			addASITable(tableName,rowArr,tableCapId);
		}
    }
    return returnStatus;
}