function copyOwner(sCapID, tCapID) {
    var ownrReq = aa.owner.getOwnerByCapId(sCapID);
    if (ownrReq.getSuccess()) {
        var ownrObj = ownrReq.getOutput();
        if (ownrObj.length >= 1) {
            for (xx in ownrObj) {
                ownrObj[xx].setCapID(tCapID);
                aa.owner.createCapOwnerWithAPOAttribute(ownrObj[xx]);
                logDebug("Copied Owner: " + ownrObj[xx].getOwnerFullName());
            }
        } else {
            logDebug("Warning: No owners exist to copy");
        }
    } else {
        logDebug("Error Copying Owner : " + ownrObj.getErrorType() + " : " + ownrObj.getErrorMessage());
    }
}