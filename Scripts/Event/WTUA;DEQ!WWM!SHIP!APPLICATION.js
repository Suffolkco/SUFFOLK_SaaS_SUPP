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

if (wfTask == "Application Review" && wfStatus == "Full Permit Required")
{
    //deactivateActiveTasks("DEQ_SHIP")
    closeTask("Application Review", "Full Permit Required", "", "");
    deactivateTask("Site Consult");
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
sendNotification("", conEmail, "", "DEQ_SHIP_HOMEOWNER", vEParams, null);

}

