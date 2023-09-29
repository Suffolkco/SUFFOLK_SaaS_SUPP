function updateBStructure(vCapId,structNo,structType,structName,structDesc){
    var updated = aa.bStructure.updateStructure(vCapId, structNo, structType, structName, structDesc, "", aa.date.getCurrentDate());
    if (updated.getSuccess()) {
        logDebug("BStructure Updated Successfully");
        return true;
    } else {
        logDebug("BStructure Updated ERROR: " + updated.getErrorMessage());
        return false;
    }
}