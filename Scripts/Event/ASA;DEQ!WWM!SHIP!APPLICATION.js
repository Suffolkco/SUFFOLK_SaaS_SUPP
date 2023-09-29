
//EHIMS2-35
if (!publicUser)
{
    var greaseTrap = getAppSpecific("In-Kind Grease Trap Replacement");
    var septicInstall = getAppSpecific("Septic Tank Installation");
    var iaOwts = getAppSpecific("I/A OWTS Installation");
    var leachingPool = getAppSpecific("Leaching Pool(s)/Galley(s) Installation");
    var shallowDrainfield = getAppSpecific("Pressurized Shallow Drainfield Installation");
    var gravity = getAppSpecific("Gravity (Trench or Bed) Drainfield Installation");
    var other = getAppSpecific("Other");
    var saniDecommission = getAppSpecific("Existing Sanitary System Decommissioning ONLY");
    var pumpOutOnly = getAppSpecific("Pump Out ONLY");
    var lw9Req = false;
    var lw9Found = false;
    var lw10Req = false;
    var lw10Found = false;
    var lw127Req = false;
    var lw127Found = false;
    var conditionAddAndEmail = false;
    var endorsementArray = new Array();
    var lpList = aa.licenseScript.getLicenseProf(capId);
    var emailParams = aa.util.newHashtable();

    logDebug("lplist is: " + lpList);

    if (greaseTrap == "CHECKED" || septicInstall == "CHECKED" || leachingPool == "CHECKED" || gravity == "CHECKED")
    {
        lw9Req = true;
    }
    if (iaOwts == "CHECKED" || shallowDrainfield == "CHECKED")
    {
        lw10Req = true;
    }
    if (pumpOutOnly == "CHECKED")
    {
        lw127Req = true;
    }
    if (lpList && lpList != null)
    {
        var lpArray = lpList.getOutput();
        logDebug("lparray is: " + lpArray);

        for (i in lpArray)
        {
            if (!matches(lpArray[i].getLicenseNbr(), "", null) && !matches(lpArray[i].getLicenseType(), "", null))
            {
                if (lpArray[i].getLicenseType() == "WWM Liquid Waste")
                {
                    logDebug("license number is: " + lpArray[i].getLicenseNbr());
                    var licNo = lpArray[i].getLicenseNbr();
                    logDebug("license type is: " + lpArray[i].getLicenseType());
                    logDebug("Professional types are: " + lpArray[i].getAddress3());
                    if (lpArray[i].getAddress3() != null)
                    {
                        endorsementArray = lpArray[i].getAddress3().split(", ");
                    }
                    logDebug("endorsementArray is: " + endorsementArray);
                    var lpRecord = aa.cap.getCapID(lpArray[i].getLicenseNbr()).getOutput();
                    if (!matches(lpRecord, "", null, undefined))
                    {
                        logDebug("lpRecord is: " + lpRecord);
                        logDebug("lpRecord AltID is: " + lpRecord.getCustomID());
                        addParameter(emailParams, "$$lpRecord$$", lpRecord.getCustomID());
                    }
                    else
                    {
                        var licNoText = "Professional number: " + licNo + " (not linked to a record.)";
                        addParameter(emailParams, "$$lpRecord$$", licNoText);
                    }
                    if (endorsementArray != null)
                    {
                        for (endors in endorsementArray)
                        {
                            logDebug("endorsement array entry is: " + endorsementArray[endors]);
                            if (endorsementArray[endors] == "LW9")
                            {
                                lw9Found = true;
                            }
                            if (endorsementArray[endors] == "LW10")
                            {
                                lw10Found = true;
                            }
                            if (matches(endorsementArray[endors], "LW1", "LW2", "LW7"))
                            {
                                lw127Found = true;
                            }
                        }
                    }
                    else
                    {
                        addParameter(emailParams, "$$noLpRecord$$", "This LP does not have an endorsement code associated with them, but the record that they have submitted is " + capId.getCustomID());
                    }
                }
            }
        }
        if ((lw9Req && !lw9Found) || (lw10Req && !lw10Found) || (lw127Req && !lw127Found))
        {
            conditionAddAndEmail = true;
        }
    }

    if (conditionAddAndEmail)
    {
        addStdCondition("LP", "Check WWM Liquid Waste LP Endorsement", capId);
        addParameter(emailParams, "$$altID$$", capId.getCustomID());
        var endorsement = "";
        if ((lw9Req && !lw9Found))
        {
            endorsement = 'LW9 - Conventional Septic Systems Installation';
        }
        //
        if ((lw10Req && !lw10Found))
        {
            endorsement = endorsement + ' LW10 - Innovation/Alternative Treatment System Installation';
        }
        // Applied for Pump Out
        if (lw127Req && !lw127Found)
        {            
            endorsement = endorsement + ' LW1 - Septic Tank PUmping Clean and Maintenace/ LW2 - Grease Trap/Inceptor/ LW7- Vactor (Pump/Vacuum) Services';
        }

        addParameter(emailParams, "$$altID$$", capId.getCustomID());
        addParameter(emailParams, "$$endorsement$$", endorsement);
        
        sendNotification("", "ryan.littlefield@scubeenterprise.com", "", "DEQ_WWM_LIQUID_WASTE_LP_NOTIFICATION", emailParams, null);
    }


    // EHIMS2-289: Get Created By
    var  capDetail = getCapDetailByID(capId);
    var userId = capDetail.getCreateBy();
    var createByUseObj = aa.person.getUser(userId).getOutput();  
    if (createByUseObj != null)
    {
        var userName = createByUseObj.getFirstName() + " " + createByUseObj.getLastName();
        logDebug("userName is: " + userName);
        createByEmail =  createByUseObj.getEmail();           
        logDebug("email address is: " + createByEmail);
    }

    var contactResult = aa.people.getCapContactByCapID(capId);
    var capContacts = contactResult.getOutput();
    var propEmail = "";
    var conEmail = "";
    var lpEmail = "";

    var propOwnerName = "";
    for (c in capContacts)
    {
        if (matches(capContacts[c].getCapContactModel().getContactType(), "Agent", "Property Owner"))
        {
            if (!matches(capContacts[c].email, null, undefined, ""))
            {
                conEmail += capContacts[c].email + ";";
            }
        }
        if (matches(capContacts[c].getCapContactModel().getContactType(), "Property Owner"))
        {
            if (!matches(capContacts[c].email, null, undefined, ""))
            {
                propEmail += capContacts[c].email + ";"
                propOwnerName = capContacts[c].getCapContactModel().getContactName();
            }
        }
    }

    var lpResult = aa.licenseScript.getLicenseProf(capId);
    if (lpResult.getSuccess())
    {
        var lpArr = lpResult.getOutput();

        // Send email to each contact separately.
        for (var lp in lpArr)
        {
            if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
            {
                lpEmail += lpArr[lp].email + ";";
            }
        }
    }
    else 
    {
        logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage());
    }
    var allEmail = conEmail + lpEmail + createByEmail;
    var propMailAll = propEmail + createByEmail;

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
    addParameter(vEParams, "$$homeowner$$", propOwnerName);
    logDebug("propemail is: " + propEmail);
    logDebug("propemailAll is: " + propMailAll);
    logDebug("allemail is: " + allEmail);
    sendNotification("", propMailAll, "", "DEQ_SHIP_SANI_RETRO_PROPOSED", vEParams, null);
    sendNotification("", allEmail, "", "DEQ_SHIP_APPLICATION_RECEIVED", vEParams, null);

}

function getAddressInALine(capId) {

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


// var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
// if (capParcelResult.getSuccess())
// {
//     var Parcels = capParcelResult.getOutput().toArray();
//     for (zz in Parcels)
//     {
//         var parcelNumber = Parcels[zz].getParcelNumber();
//         logDebug("parcelNumber = " + parcelNumber);
//     }
// }

// var addrResult = getAddressInALine(capId);

// var vEParams = aa.util.newHashtable();
// var addrResult = getAddressInALine(capId);
// addParameter(vEParams, "$$altID$$", capId.getCustomID());
// addParameter(vEParams, "$$address$$", addrResult);
// addParameter(vEParams, "$$Parcel$$", parcelNumber);
// addParameter(vEParams, "$$FullNameBusName$$", capContacts[c].getCapContactModel().getContactName());

// sendNotification("", conEmail, "", "DEQ_SHIP_HOMEOWNER", vEParams, null);


// function getAddressInALine(capId)
// {

//     var capAddrResult = aa.address.getAddressByCapId(capId);
//     var addressToUse = null;
//     var strAddress = "";

//     if (capAddrResult.getSuccess())
//     {
//         var addresses = capAddrResult.getOutput();
//         if (addresses)
//         {
//             for (zz in addresses)
//             {
//                 capAddress = addresses[zz];
//                 if (capAddress.getPrimaryFlag() && capAddress.getPrimaryFlag().equals("Y"))
//                     addressToUse = capAddress;
//             }
//             if (addressToUse == null)
//                 addressToUse = addresses[0];

//             if (addressToUse)
//             {
//                 strAddress = addressToUse.getHouseNumberStart();
//                 var addPart = addressToUse.getStreetDirection();
//                 if (addPart && addPart != "")
//                     strAddress += " " + addPart;
//                 var addPart = addressToUse.getStreetName();
//                 if (addPart && addPart != "")
//                     strAddress += " " + addPart;
//                 var addPart = addressToUse.getStreetSuffix();
//                 if (addPart && addPart != "")
//                     strAddress += " " + addPart;
//                 var addPart = addressToUse.getCity();
//                 if (addPart && addPart != "")
//                     strAddress += " " + addPart + ",";
//                 var addPart = addressToUse.getState();
//                 if (addPart && addPart != "")
//                     strAddress += " " + addPart;
//                 var addPart = addressToUse.getZip();
//                 if (addPart && addPart != "")
//                     strAddress += " " + addPart;
//                 return strAddress
//             }
//         }
//     }
//     return null;
// }
// function getContactName(vConObj)
// {
//     if (vConObj.people.getContactTypeFlag() == "organization")
//     {
//         if (vConObj.people.getBusinessName() != null && vConObj.people.getBusinessName() != "")
//             return vConObj.people.getBusinessName();

//         return vConObj.people.getBusinessName2();
//     }
//     else
//     {
//         if (vConObj.people.getFullName() != null && vConObj.people.getFullName() != "")
//         {
//             return vConObj.people.getFullName();
//         }
//         if (vConObj.people.getFirstName() != null && vConObj.people.getLastName() != null)
//         {
//             return vConObj.people.getFirstName() + " " + vConObj.people.getLastName();
//         }
//         if (vConObj.people.getBusinessName() != null && vConObj.people.getBusinessName() != "")
//             return vConObj.people.getBusinessName();

//         return vConObj.people.getBusinessName2();
//     }
// }

