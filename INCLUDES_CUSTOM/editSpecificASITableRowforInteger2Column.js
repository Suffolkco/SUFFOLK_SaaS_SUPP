function editSpecificASITableRowforInteger2Column(tableCapId, tableName, keyName1, keyValue1,keyName2, keyValue2, editName, editValue) {
	// keyName and keyValue is the column name and column value you want to use to filter for records you want to update
	// editName and editValue are the new values
   var tableArr = loadASITable(tableName, tableCapId);
   var tssmResult = aa.appSpecificTableScript.removeAppSpecificTableInfos(tableName,tableCapId,"ADMIN");
   if (tableArr) {
      for (var r in tableArr) {
        if (parseInt(tableArr[r][keyName1]) == parseInt(keyValue1) && parseInt(tableArr[r][keyName2]) == parseInt(keyValue2)) {
            var rowArr=new Array();
            var tempArr=new Array();
            for (var col in tableArr[r]) {
               if (tableArr[r][col].columnName.toString() == editName) {
                  logDebug(" Editing row " + r + " updating " + tableArr[r][col].columnName.toString() + " to " + editValue);
                  var tVal = tableArr[r][col];
                  tVal.fieldValue = editValue;
               }
               else {
                  var tVal = tableArr[r][col];
               }
               //bizarre string conversion - just go with it
               var colName = new String(tableArr[r][col].columnName.toString());
               colName=colName.toString();
               tempArr[colName] = tVal;
            }
            rowArr.push(tempArr); 
            //for (var val in rowArr) for (var c in rowArr[val]) aa.print("Value " + c + ": " + rowArr[val][c]);
            addASITable(tableName,rowArr,tableCapId);
         
         }else {
            var rowArr=new Array();
            var tempArr=new Array();
            for (var col in tableArr[r]) {
               var tVal = new asiTableValObj(tableArr[r][col].columnName, tableArr[r][col].fieldValue, tableArr[r][col].readOnly);
               var tVal = tableArr[r][col];
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
   }//end loop
}