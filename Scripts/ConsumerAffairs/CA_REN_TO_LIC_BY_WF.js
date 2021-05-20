if (wfTask == "Renewal Review" && wfStatus == "Complete")
{
    var vEParams = aa.util.newHashtable();
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
    var capContacts = aa.people.getCapContactByCapID(parentCapId);
    if (capContacts.getSuccess())
    {
        capContacts = capContacts.getOutput();
        logDebug("capContacts: " + capContacts);
        for (var yy in capContacts)
        {
            aa.people.removeCapContact(parentCapId, capContacts[yy].getPeople().getContactSeqNumber());
        }
    }
    copyContacts(capId, parentCapId);
    copyASIFields(capId, parentCapId);
    copyASITables(capId, parentCapId);

    var conArray = getContactByType("Applicant", capId);
    var conEmail = "";

    if (!matches(conArray.email, null, undefined, ""))
    {
        addParameter(vEParams, '$$altID$$', parentCapId.getCustomID());
        addParameter(vEParams, "$$expDate$$", newExpDate);
        conEmail += conArray.email + "; ";
        logDebug("Email addresses: " + conEmail);
        sendNotification("", conEmail, "", "CA_LICENSE_RENEWAL_APPLICANT_NOTICE", vEParams, null);
    }
}

