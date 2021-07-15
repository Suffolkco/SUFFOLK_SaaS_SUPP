if (wfTask == "Renewal Review" && wfStatus == "Complete")
{
    var vEParams = aa.util.newHashtable();
    var parentCapId = getParentCapID4Renewal();

    //Updating Expiration Date of License
    var todayExpDate = new Date();
    logDebug("New Date Exp Date is: " + todayExpDate)
    var newExpDate = (todayExpDate.getMonth() + 1) + "/" + 1 + "/" + (todayExpDate.getFullYear() + 2);
    logDebug("New Exp Date is: " + newExpDate);

        var b1ExpResult = aa.expiration.getLicensesByCapID(parentCapId);
        if (b1ExpResult.getSuccess())
        {
            var b1Exp = b1ExpResult.getOutput();
            b1Exp.setExpStatus("Active");
            b1Exp.setExpDate(aa.date.parseDate(newExpDate));
            aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
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
        sendNotification("", conEmail, "", "CA_TLC_RENEWAL_APPLICANT_NOTICE", vEParams, null);
    }
}

