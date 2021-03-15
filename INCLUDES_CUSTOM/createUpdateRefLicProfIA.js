function createUpdateRefLicProfIA(capId) {

    if (capId == null) {
        logDebug("createUpdateReFLicProfIA : capId object is null");
        return;
    }
 
    capIDString = capId.getCustomID();
    cap = aa.cap.getCap(capId).getOutput();
    thisAppTypeResult = cap.getCapType();
    thisAppTypeString = thisAppTypeResult.toString();
    thisAppTypeArray = thisAppTypeString.split("/");    
    licNum = capIDString;
    licExpDate = getAppSpecific("Expiration Date", capId);

    if (cap)
    {      
        if (licExpDate && licExpDate != "")
        {
            var restrictionTable = loadASITable("RESTRICTIONS");                            
            for (var p in restrictionTable)
            {
                var type = restrictionTable[p]["Type"];
                var category = restrictionTable[p]["Category"];                                
                var cat = category.toString();
                cat = cat.substr(0,4);                              
            
                if (cat == "LW11" || cat == "LW10")
                {          
                    var capContResult = aa.people.getCapContactByCapID(capId);

                    if (capContResult.getSuccess()) 
                    {
                        conArray = capContResult.getOutput();
                        for (con in conArray)
                        {
                            contactType = conArray[con].getCapContactModel().getPeople().getContactType();
                            
                            if (contactType == "Vendor")
                            {                                           
                                var licenType;                                            
                                if (cat == "LW11")
                                {
                                    licenType = "IA Service Provider";
                                                          
                                }                                         
                                else if (cat == "LW10")
                                {
                                    licenType = "IA Installer";                                    
                                }
                                
                                // Find existing LP with the same first and last name first
                                logDebug("<b>*** Look for: ***" + capIDString+ ". License Type: " + licenType + "</b>");

                                var newLic = getRefLicenseProf(licNum, licenType);

                                if (newLic) 
                                {
                                    logDebug ("**Found lic Prof: " + licNum + " Skip**");
                                }
                                else
                                {
                                    logDebug ("**Cannot find lic Prof: " + licNum + ". Going to create one.**");
                                    newLic = aa.licenseScript.createLicenseScriptModel();
                                
                                    //Create a reference licensed prof from a Contact
                                    var capContResult = aa.people.getCapContactByCapID(capId);
                                    var altId = capId.getCustomID();
                                    if (capContResult.getSuccess()) {
                                        conArr = capContResult.getOutput();
                                    }
                                    else {
                                        logDebug ("**ERROR: getting cap contact: " + capAddResult.getErrorMessage());
                                        return false;
                                    }
                                    if (!conArr.length) {
                                        logDebug ("**WARNING: No contact available");
                                        return false;
                                    }

                                    if (pContactType == null) {
                                        var cont = conArr[0]; //if no contact type specified, use first contact
                                    }
                                    else
                                    {
                                        var contFound = false;
                                        for (yy in conArr) {
                                            if (pContactType.equals(conArr[yy].getCapContactModel().getPeople().getContactType()) || "Vendor".equals(conArr[yy].getCapContactModel().getPeople().getContactType()) ) {
                                                compCont = conArr[yy];
                                                cont = conArr[yy];
                                                contFound = true;
                                            }
                                        }
                                        if (!contFound) {
                                            logDebug ("**WARNING: No Contact found of type: "+pContactType);
                                            return false;
                                        }
                                    }
                                    peop = cont.getPeople();
                                    compPeop = compCont.getPeople();
                                    addr = peop.getCompactAddress();
                                    compAddr = compPeop.getCompactAddress();
                                    newLic.setContactFirstName(cont.getFirstName());
                                    newLic.setContactLastName(cont.getLastName());
                                    newLic.setBusinessName(compPeop.getBusinessName());
                                    newLic.setAddress1(compAddr.getAddressLine1());
                                    newLic.setAddress2(compAddr.getAddressLine2());
                                    newLic.setAddress3(compAddr.getAddressLine3());
                                    newLic.setCity(compAddr.getCity());
                                    newLic.setState(compAddr.getState());
                                    newLic.setZip(compAddr.getZip());
                                    newLic.setPhone1(compPeop.getPhone1());
                                    newLic.setPhone2(peop.getPhone2());
                                    newLic.setPhone3(peop.getPhone3());
                                    newLic.setEMailAddress(peop.getEmail());
                                    newLic.setFax(compPeop.getFax());
                                    newLic.setAgencyCode(aa.getServiceProviderCode());
                                    newLic.setAuditDate(sysDate);
                                    newLic.setAuditID(currentUserID);
                                    newLic.setAuditStatus("A");
                                    if (licExpDate && licExpDate != "")
                                        newLic.setLicenseExpirationDate(aa.date.parseDate(licExpDate));
                                    newLic.setLicenseType(rlpType);
                                    newLic.setStateLicense(thisCapIDString);
                                    newLic.setLicState("NY");
                                    newLic.setMaskedSsn(compPeop.getSocialSecurityNumber());
                                    newLic.setSocialSecurityNumber(compPeop.getSocialSecurityNumber());
                                    bDate = compCont.getCapContactModel().getBirthDate();
                                    issueDate = getAppSpecific("Issued Date");
                                    if (issueDate && issueDate != "") newLic.setLicenseIssueDate(aa.date.parseDate(issueDate));
                                    insCo = getAppSpecific("Insurance Agent", capId)
                                    if (insCo && insCo != "") newLic.setInsuranceCo(insCo);
                                    insPolicy = getAppSpecific("Insurance Policy", capId);
                                    if (insPolicy && insPolicy != "") newLic.setPolicy(insPolicy);
                                    insExpDate = getAppSpecific("Policy Expiration Date", capId);
                                    if (insExpDate && insExpDate != "") newLic.setInsuranceExpDate(aa.date.parseDate(insExpDate));
                                    wcInsPolicy = getAppSpecific("Workers Comp #", capId);
                                    if (wcInsPolicy && wcInsPolicy != "") newLic.setWcPolicyNo(wcInsPolicy);
                                    wcExpDate = getAppSpecific("Workers Comp Expiration Date", capId);
                                    if (wcExpDate && wcExpDate != "") newLic.setWcExpDate(aa.date.parseDate(wcExpDate));
                                    fein = getAppSpecific("Federal Tax ID #", capId);
                                    if (fein && fein != "") newLic.setFein(fein);
                                    if (bDate) {
                                        var sdtBirthDate = dateFormatted(1+bDate.getMonth(), bDate.getDate(), 1900+bDate.getYear(), "");
                                    }
                                    
                                    
                                    myResult = aa.licenseScript.createRefLicenseProf(newLic);
                                    if (myResult.getSuccess()) {
                                        bWebSite = getAppSpecific("Business Website", capId);
                                        if (bWebSite && bWebSite != "")
                                            editRefLicProfAttribute(licNum,"BUSINESS WEBSITE",bWebSite);
                                        cArrears = getAppSpecific("Child Support Arrears", capId);
                                        if (cArrears == "CHECKED")
                                            editRefLicProfAttribute(licNum, "CHILD SUPPORT ARREARS", "Yes");
                                        nysID = getAppSpecific("NYS Sales Tax ID #", capId);
                                        if (nysID && nysID != "") 
                                            editRefLicProfAttribute(licNum, "NYS SALES TAX ID #", nysID);
                                        dli = getAppSpecific("Driver License Info", capId);
                                        if (dli && dli != "")
                                            editRefLicProfAttribute(licNum, "DRIVER LICENSE INFO", dli);
                                        coNum = getAppSpecific("Company Affiliation License Number", capId);
                                        if (coNum && coNum != "")
                                            editRefLicProfAttribute(licNum, "LICENSE NUMBER",coNum);	
                                        if (bDate) {
                                            var sdtBirthDate = dateFormatted(1+bDate.getMonth(), bDate.getDate(), 1900+bDate.getYear(), "");
                                            editRefLicProfAttribute(licNum, "BIRTH DATE", sdtBirthDate);	
                                        }
                                        if (relate)
                                            assocResult = aa.licenseScript.associateLpWithCap(capId, newLic);
                                        logDebug("Successfully created LP " + thisCapIDString);
                                    }
                                    else {
                                        logDebug("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
                                        logMessage("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
                                        return false;
                                    }
                            }
                                
                            }
                        }
                    }
	                
                }
            }
        }
    }

    return true;
}
