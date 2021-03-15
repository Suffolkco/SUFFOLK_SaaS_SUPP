function createLicProfAndRelate(rlpType, pContactType, licExpDate, licIssDate, capId)
{
    //Creates/updates a reference licensed prof from a Contact
    var capContResult = aa.people.getCapContactByCapID(capId);
    var altId = capId.getCustomID();
    if (capContResult.getSuccess())
    {
        conArr = capContResult.getOutput();
    }
    else
    {
        logDebug ("**ERROR: getting cap contact: " + capAddResult.getErrorMessage());
        return false;
    }
    if (!conArr.length)
    {
        logDebug ("**WARNING: No contact available");
        return false;
    }

    var newLic = aa.licenseScript.createLicenseScriptModel();

    if (pContactType == null)
    {
        var cont = conArr[0]; //if no contact type specified, use first contact
    }
    else
    {
        var contFound = false;
        for (yy in conArr)
        {
            if (pContactType.equals(conArr[yy].getCapContactModel().getPeople().getContactType()))
            {
                compCont = conArr[yy];
                cont = conArr[yy];
                contFound = true;
            }
        }
        if (!contFound)
        {
            logDebug ("**WARNING: No Contact found of type: "+pContactType);
            return false;
        }
    }
    logDebug("=========We are now handling the Reference Contact Information=========");
    peop = cont.getPeople();
    compPeop = compCont.getPeople();
    addr = peop.getCompactAddress();
    compAddr = compPeop.getCompactAddress();
    newLic.setContactFirstName(cont.getFirstName());
    newLic.setContactLastName(cont.getLastName());
    newLic.setBusinessName(compPeop.getBusinessName());
    logDebug("Company Name: " +compPeop.getBusinessName() + " Pulled from: " + capId.getCustomID() );
    newLic.setAddress1(compAddr.getAddressLine1());
    newLic.setAddress2(compAddr.getAddressLine2());
    newLic.setAddress3(compAddr.getAddressLine3());
    newLic.setCity(compAddr.getCity());
    newLic.setState(compAddr.getState());
    newLic.setZip(compAddr.getZip());
    newLic.setPhone1(compPeop.getPhone3());
    newLic.setPhone2(peop.getPhone2());
    newLic.setEMailAddress(peop.getEmail());
    newLic.setFax(compPeop.getFax());
    newLic.setAgencyCode(aa.getServiceProviderCode());
    newLic.setAuditDate(sysDate);
    newLic.setAuditID(currentUserID);
    newLic.setAuditStatus("A");
    newLic.setLicenseExpirationDate(aa.date.parseDate(licExpDate));
    newLic.setLicenseType(rlpType);
    newLic.setStateLicense(altId);
    newLic.setContLicBusName(compPeop.getEmail());
    newLic.setLicState("NY");
    newLic.setLicenseIssueDate(aa.date.parseDate(licIssDate));
    
    myResult = aa.licenseScript.createRefLicenseProf(newLic);
    
    if (myResult.getSuccess())
    {
        assocResult = aa.licenseScript.associateLpWithCap(capId, newLic);
        return true;
    }
    else
    {
        logDebug("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
        logMessage("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
        return false;
    }
}