function getContactsEmailArray(contactTypeArray)
{
    var itemCap = capId;
    var result = new Array();
    if (!contactTypeArray)
        contactTypeArray = new Array();
    var getAll = (contactTypeArray.length == 0)
    if (arguments.length > 1)
        itemCap = arguments[1];
    var emailString = "";
    var contactArray = getPeople(itemCap);
    for (var c in contactArray)
    {
        if (!(contactArray[c].getPeople().getEmail() && contactArray[c].getPeople().getEmail().length() > 0))
            continue;
        if (getAll || exists(contactArray[c].getPeople().getContactType(), contactTypeArray))
        {
            result.push(contactArray[c].getPeople().getEmail());
        }
    }
    return result;
}