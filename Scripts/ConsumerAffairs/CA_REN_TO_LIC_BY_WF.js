if (wfTask == "Renewal Review" && wfStatus == "Complete")
{

    var parentCapId = getParentCapID4Renewal();
    var expDateASI = getAppSpecific("Expiration Date", parentCapId);

    //Updating Expiration Date of License
    logDebug("ASI Expdate is: " + expDateASI);
    expDateASI = new Date(expDateASI);
    logDebug("New Date Exp Date is: " + expDateASI)
    var newExpDate = (expDateASI.getMonth() + 1) + "/" + 1 + "/" + (expDateASI.getFullYear() + 2);
    logDebug("New Exp Date is: " + newExpDate);
    editAppSpecific("Expiration Date", newExpDate, parentCapId);
    if (expDateASI != null)
    {
        var b1ExpResult = aa.expiration.getLicensesByCapID(parentCapId);
        if (b1ExpResult.getSuccess())
        {
            var b1Exp = b1ExpResult.getOutput();
            b1Exp.setExpStatus("Active");
            b1Exp.setExpDate(aa.date.parseDate(newExpDate));
            aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
            updateAppStatus("Active", "", parentCapId);
            activateTask("Issuance", "", parentCapId);
            updateTask("Issuance", "Issued", "", "", parentCapId);
        }
    }
    copyContacts(capId, parentCapId);
    copyASIFields(capId, parentCapId);
    copyASITables(capId, parentCapId);
}
