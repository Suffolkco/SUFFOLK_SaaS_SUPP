// ASA;CONSUMERAFFAIRS!~!RENEWAL!NA
showDebug = true;

aa.runScriptInNewTransaction("APPLICATIONSUBMITAFTER4RENEW");
aa.runScript("APPLICATIONSUBMITAFTER4RENEW");


var addChild = aa.cap.createRenewalCap(parentCapId, capId, true);

aa.cap.updateAccessByACA(capId, "N");
if (publicUser)
{
    //copying the contacts from the parent to the renewal record when beginning the renewal for ACA records only
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
    copyContacts(parentCapId, capId);
}
copyASIFields(parentCapId, capId);
copyASITables(parentCapId, capId);