function updateASITableRow(tableName, ColName, colValue,  RowIndex, vCapID, currentUserID, readOnly) {
    //  tableName is the name of the ASI table
    //  tableValueArray is an array of associative array values.  All elements MUST be either a string or asiTableVal object
    var itemCap = vCapID;

    var tssmResult = aa.appSpecificTableScript.getAppSpecificTableModel(itemCap, tableName)

    if (!tssmResult.getSuccess()) {
        logDebug("WARNING: error retrieving app specific table " + tableName + " " + tssmResult.getErrorMessage());
        return false;
    }

    var tssm = tssmResult.getOutput();
    var tsm = tssm.getAppSpecificTableModel();
    var fld = tsm.getTableField();
    var clm = tsm.getColumns();
    var fld_readonly = tsm.getReadonlyField();
    var sizeOFRecord = fld.size();
    var sizeOfColums = clm.size();
    var clmList = clm.toArray();

    var currentIndex = RowIndex * sizeOfColums;

    fld.set(currentIndex + getRowIndex(clmList, ColName), colValue);
    fld_readonly.set(currentIndex + getRowIndex(clmList, ColName), readOnly);

    tsm.setTableField(fld);
    tsm.setReadonlyField(fld_readonly);

    var addResult = aa.appSpecificTableScript.editAppSpecificTableInfos(tsm, itemCap, currentUserID);

    if (addResult.getSuccess()) {
        logDebug("updating app specific table " + tableName + " Successfully");
        //return false
    } else{
        logDebug("WARNING: error updating app specific table " + tableName + " " + addResult.getErrorMessage());
        return false;
    }
    function getRowIndex(cloumnList, columnName) {
        var index = -1;
        for (var i = 0; i < cloumnList.length; i++) {
            if (cloumnList[i].getColumnName() == columnName) return i;
        }
        return index;
    }
}