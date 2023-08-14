function addBStructure(vCapId,structNo,structType,structName,structDesc){
    var added = aa.bStructure.addStructure(vCapId, structNo, structType, structName, structDesc, "", aa.date.getCurrentDate());
    if (added.getSuccess()) {
        logDebug("BStructure Added Successfully");
        return true;
    } else {
        logDebug("BStructure Added ERROR: " + added.getErrorMessage());
        return false;
    }
}