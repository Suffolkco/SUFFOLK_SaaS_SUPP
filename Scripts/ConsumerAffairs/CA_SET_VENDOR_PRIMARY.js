//Setting Vendor as Primary contact on submission

var contactResult = aa.people.getCapContactByCapID(capId);
if (contactResult.getSuccess())
{
    var capContacts = contactResult.getOutput();
    for (cap in capContacts)
    {
        if (capContacts[cap].getPeople().getContactType() == "Vendor")
        {
            var contactSeqNumber = capContacts[cap].getPeople().getContactSeqNumber();
            break;
        }
    }
    contactSetPrimary(contactSeqNumber);
}