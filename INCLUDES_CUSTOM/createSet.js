function createSet(setName,setDescription) {

    //optional 3rd parameter is setType
    //optional 4th parameter is setStatus
    //optional 5th paramater is setStatusComment
    servProvCode = "SUFFOLKCO";
    var setType = "";
    var setStatus = "";
    var setStatusComment = "";

    if (arguments.length > 2) {
        setType = arguments[2]
    }

    if (arguments.length > 3) {
        setStatus = arguments[3]
    }

    if (arguments.length > 4) {
        setStatusComment = arguments[4];
    }

    var setScript = aa.set.getSetHeaderScriptModel().getOutput();
    setScript.setSetID(setName);
    setScript.setSetTitle(setDescription);
    setScript.setSetStatusComment(setStatusComment);
    setScript.setSetStatus(setStatus);
    setScript.setRecordSetType(setType);
    setScript.setServiceProviderCode(servProvCode);
    setScript.setAuditDate(aa.date.getCurrentDate());
    //setScript.setAuditID(currentUserID);

    var setCreateResult = aa.set.createSetHeader(setScript);

    return setCreateResult.getSuccess();
}