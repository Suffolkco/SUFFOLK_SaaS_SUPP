var contactResult = aa.people.getCapContactByCapID(capId);
var capContacts = contactResult.getOutput();
var conEmail = "";
for (c in capContacts)
{
    if (matches(capContacts[c].getCapContactModel().getContactType(), "Property Owner"))
    {
        addParameter(vEParams, "$$FullNameBusName$$", capContacts[c].getCapContactModel().getContactName());
    }
    {
        if (!matches(capContacts[c].email, null, undefined, ""))
        {
            conEmail += capContacts[c].email + ";"
        }
    }
}

var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);  
if (capParcelResult.getSuccess())
{
    var Parcels = capParcelResult.getOutput().toArray();
    for (zz in Parcels)
    {
        var parcelNumber = Parcels[zz].getParcelNumber();
        logDebug("parcelNumber = " + parcelNumber);
    }
}

var addrResult = getAddressInALine(capId);

var vEParams = aa.util.newHashtable();
var addrResult = getAddressInALine(capId);
addParameter(vEParams, "$$altID$$", capId.getCustomID());
addParameter(vEParams, "$$address$$", addrResult);
addParameter(vEParams, "$$Parcel$$", parcelNumber);

sendNotification("", conEmail, "", "DEQ_SHIP_HOMEOWNER", vEParams, null);


function getAddressInALine(capId)
{

    var capAddrResult = aa.address.getAddressByCapId(capId);
    var addressToUse = null;
    var strAddress = "";

    if (capAddrResult.getSuccess())
    {
        var addresses = capAddrResult.getOutput();
        if (addresses)
        {
            for (zz in addresses)
            {
                capAddress = addresses[zz];
                if (capAddress.getPrimaryFlag() && capAddress.getPrimaryFlag().equals("Y"))
                    addressToUse = capAddress;
            }
            if (addressToUse == null)
                addressToUse = addresses[0];

            if (addressToUse)
            {
                strAddress = addressToUse.getHouseNumberStart();
                var addPart = addressToUse.getStreetDirection();
                if (addPart && addPart != "")
                    strAddress += " " + addPart;
                var addPart = addressToUse.getStreetName();
                if (addPart && addPart != "")
                    strAddress += " " + addPart;
                var addPart = addressToUse.getStreetSuffix();
                if (addPart && addPart != "")
                    strAddress += " " + addPart;
                var addPart = addressToUse.getCity();
                if (addPart && addPart != "")
                    strAddress += " " + addPart + ",";
                var addPart = addressToUse.getState();
                if (addPart && addPart != "")
                    strAddress += " " + addPart;
                var addPart = addressToUse.getZip();
                if (addPart && addPart != "")
                    strAddress += " " + addPart;
                return strAddress
            }
        }
    }
    return null;
}
function getContactName(vConObj)
{
    if (vConObj.people.getContactTypeFlag() == "organization")
    {
        if (vConObj.people.getBusinessName() != null && vConObj.people.getBusinessName() != "")
            return vConObj.people.getBusinessName();

        return vConObj.people.getBusinessName2();
    }
    else
    {
        if (vConObj.people.getFullName() != null && vConObj.people.getFullName() != "")
        {
            return vConObj.people.getFullName();
        }
        if (vConObj.people.getFirstName() != null && vConObj.people.getLastName() != null)
        {
            return vConObj.people.getFirstName() + " " + vConObj.people.getLastName();
        }
        if (vConObj.people.getBusinessName() != null && vConObj.people.getBusinessName() != "")
            return vConObj.people.getBusinessName();

        return vConObj.people.getBusinessName2();
    }
}