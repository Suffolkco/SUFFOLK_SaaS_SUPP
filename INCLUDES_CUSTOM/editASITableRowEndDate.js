function editASITableRowEndDate(tableCapId, tableName, editValue1, editValue2) 
{
    var tableArr = loadASITable(tableName, tableCapId);
    var tssmResult = aa.appSpecificTableScript.removeAppSpecificTableInfos(tableName,tableCapId,"ADMIN");
    var k = 0;
    showDebug = false; 
    if (tableArr) 
    {
        logDebug("tableArr.length is: " + tableArr.length);
        for (var r in tableArr) 
        {
			logDebug("In row " + r + " in editASITableRowEndDate");
			var rowArr=new Array();
            var tempArr=new Array();
            var endCheck = false;
            endCheck = checkEndDate(k, tableArr);
            for (var col in tableArr[r]) 
            {
                var tVal = tableArr[r][col];
                if (!endCheck)
                {
                    logDebug("column name is: " + tableArr[r][col].columnName.toString());
                    logDebug("field's value is: " + tVal);
                    if (tableArr[r][col].columnName.toString() == "Approved Date") 
                    {
                        //Updating current rows "Approved date to 01/01/current year + 1 only if "End Date" is null
                        ;
                        tVal.fieldValue = editValue2;      
                    }
                    if (tableArr[r][col].columnName.toString() == "Start Date") 
                    {
                        ;
                        tVal.fieldValue = editValue1;      
                    }
                }
                else 
                {
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
            k++;
		}
	}
}

function checkEndDate(k,tableArr)
{
    if (tableArr) 
    {
        for (j in tableArr) 
        {
            var j = k;
            aa.print("In row " + j + " in checkEndDate");
            for (c in tableArr[j])
            {
                var tVal = tableArr[j][c];
                if (tableArr[j][c].columnName.toString() == "End Date")
                {
                    if (tVal.toString().length == 0)
                    {
                        aa.print("Setting endCheck to false");
                        return false;       
                    }
                    else
                    {
                        aa.print("Setting endCheck to true");
                        return true;
                    }
                }
            }
        }
    }
}