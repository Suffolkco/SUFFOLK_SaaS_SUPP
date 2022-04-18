var contactResult = aa.people.getCapContactByCapID(capId);
var capContacts = contactResult.getOutput();
var conEmail = "";
for (c in capContacts)
{
    if (matches(capContacts[c].getCapContactModel().getContactType(), "Property Owner"))

    {
        if (!matches(capContacts[c].email, null, undefined, ""))
        {
            conEmail += capContacts[c].email + ";"
        }
    }
}

if (wfTask == "Pending Review" && wfStatus == "Full Permit Required")
{
    //deactivateActiveTasks("DEQ_SHIP")
    closeTask("Application Review", "Full Permit Required", "", "");
    deactivateTask("Required Field Consult");
    deactivateTask("Residential Provisional Phase");
    deactivateTask("Grant Review");
}

if (wfTask == "Preliminary Sketch Review")
{
    if (wfStatus == "Full Permit Required")
    {
    //deactivateActiveTasks("DEQ_SHIP")
    closeTask("Preliminary Sketch Review", "Full Permit Required", "", "");
    deactivateTask("Inspections");
    deactivateTask("Final Review"); 
    }
}

if (isTaskActive("Grant Review") || isTaskActive("Preliminary Sketch Review"))
{
    deactivateTask("Final Review")
    deactivateTask("Inspections")
} 

if (wfTask == "Grant Review" && (wfStatus == "No Application Received" || wfStatus == "Not Eligible" || wfStatus == "OK to Proceed")) 
{
    if (isTaskStatus("Preliminary Sketch Review", "OK to Proceed"))
        
        {
            deactivateTask("Inspections")
            activateTask("Final Review");

        }   
}

if (wfTask == "Grant Review" && (wfStatus =="OK to Proceed" || wfStatus == "Awaiting Client Reply" || wfStatus == "Awaiting Gran Issuance"))
{
    editAppSpecific("Part of Septic Improvement Program(SIP)", "Yes")
}

if (wfTask == "Grant Review" && (wfStatus =="No Application Received" || wfStatus == "Not Eligible"))
{
    editAppSpecific("Part of Septic Improvement Program(SIP)", "No")
}

if (wfTask == "Final Review" && wfStatus == "Registration Complete")

{
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
addParameter(vEParams, "$$FullNameBusName$$", capContacts[c].getCapContactModel().getContactName());
sendNotification("", conEmail, "", "DEQ_SANITARY_REPLACEMENT", vEParams, null);

}

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