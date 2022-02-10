//WTUA:DEQ/Ecology/IA/Transfer

var pin = AInfo["PIN Number"];
var iaNumber = AInfo["IA Record Number"];

if (wfTask == "Review form and check that documents are correct" && wfStatus == "Complete");
{
    var getCapResult = aa.cap.getCapIDsByAppSpecificInfoField("IA PIN Number", pin);
    if (getCapResult.getSuccess())
    {
        var apsArray = getCapResult.getOutput();
        for (aps in apsArray)
        {
            myCap = aa.cap.getCap(apsArray[aps].getCapID()).getOutput();
            logDebug("apsArray = " + apsArray);
            var relCap = myCap.getCapID();
            var relCapID = relCap.getCustomID();
        }
    }

    var getCapResult = aa.cap.getCapID(iaNumber);
    if (getCapResult.getSuccess() && matches(relCapID, iaNumber))
    {
        var wwmIA = getCapResult.getOutput();
        copyLicenseProfessional(capId, wwmIA);

        //Gathering Contacts from IA Record
        var contactResult = aa.people.getCapContactByCapID(wwmIA);
        var capContacts = contactResult.getOutput();
        var conEmail = ""; 
        for (c in capContacts)
        {
            if (matches(capContacts[c].getCapContactModel().getContactType(), "Property Owner", "Agent"))
            {
                if (!matches(capContacts[c].email, null, undefined, ""))
                {
                conEmail += capContacts[c].email;
                }
            }
        }

        //Gathering LPs from IA Record
        var licProfResult = aa.licenseScript.getLicenseProf(wwmIA);
        var capLPs = LicProfResult.getOutput();
        for (l in capLPs)
        {
            if (!matches(capContacts[l].email, null, undefined, ""))
            conEmail += capLPs[l].email;
        }
        
        var vRParams = aa.util.newHashtable();
        var addrResult = aa.address.getAddressByCapId(wwmIA)
        addParameter(vEParams, "$$altID$$", capIDString);
        addParameter(vRParams, "$$address$$", addrResult);

        sendNotification("", conEmail, "", "DEQ_IA_SEPTIC_REGISTRATION", vEParams, null);
    }
}

function copyLicenseProfessional(srcCapId, targetCapId)
{
    //1. Get license professionals with source CAPID.
    var capLicenses = getLicenseProfessional(srcCapId);
    if (capLicenses == null || capLicenses.length == 0)
    {
        return;
    }
    //2. Get license professionals with target CAPID.
    var targetLicenses = getLicenseProfessional(targetCapId);
    //3. Check to see which licProf is matched in both source and target.
    for (loopk in capLicenses)
    {
        sourcelicProfModel = capLicenses[loopk];
        //3.1 Set target CAPID to source lic prof.
        sourcelicProfModel.setCapID(targetCapId);
        targetLicProfModel = null;
        //3.2 Check to see if sourceLicProf exist.
        if (targetLicenses != null && targetLicenses.length > 0)
        {
            for (loop2 in targetLicenses)
            {
                if (isMatchLicenseProfessional(sourcelicProfModel, targetLicenses[loop2]))
                {
                    targetLicProfModel = targetLicenses[loop2];
                    break;
                }
            }
        }
        //3.3 It is a matched licProf model.
        if (targetLicProfModel != null)
        {
            //3.3.1 Copy information from source to target.
            aa.licenseProfessional.copyLicenseProfessionalScriptModel(sourcelicProfModel, targetLicProfModel);
            //3.3.2 Edit licProf with source licProf information. 
            aa.licenseProfessional.editLicensedProfessional(targetLicProfModel);
        }
        //3.4 It is new licProf model.
        else
        {
            //3.4.1 Create new license professional.
            aa.licenseProfessional.createLicensedProfessional(sourcelicProfModel);
        }
    }
}