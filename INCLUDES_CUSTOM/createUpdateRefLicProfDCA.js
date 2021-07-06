
function createUpdateRefLicProfDCA(capId, relate) {
	if (capId == null) {
		logDebug("createUpdateReFLicProfDCA : capId object is null");
		return;
	}
	if (relate == null) relate = true;
    thisCapIDString = capId.getCustomID();
	thisCap = aa.cap.getCap(capId).getOutput();
	thisAppTypeResult = thisCap.getCapType();
	thisAppTypeString = thisAppTypeResult.toString();
    thisAppTypeArray = thisAppTypeString.split("/");
    
    pContactType = "Business Owner";
    rlpType = thisAppTypeArray[2];
    licNum = thisCapIDString;
    licExpDate = getAppSpecific("Expiration Date", capId);

    // 20210628 - jcrussell - begin
    // Moved to within Ref LP Loop
    // var updating = false;
    // var newLic = getRefLicenseProf(licNum, rlpType);
	// if (newLic) {
    //     updating = true;
    // }
    // else {
    //     var newLic = aa.licenseScript.createLicenseScriptModel();
    // }
    // 20210628 - jcrussell - end

    //Creates/updates a reference licensed prof from a Contact
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
    // 20210628 - jcrussell - begin
    // If we are here we have either 'pContactType' or "Vendor" contact.
    // we need to, also, create a DBA Ref LP if DBA Cont Ty exists.
    var allContDoRefLp = [];
    allContDoRefLp['prim'] = [];
    allContDoRefLp['prim']['compCont'] = compCont;
    allContDoRefLp['prim']['cont'] = cont;
    for(var zz in conArr){
        if("DBA".equals(conArr[zz].getCapContactModel().getPeople().getContactType())){
            allContDoRefLp['dba'] = [];
            allContDoRefLp['dba']['compCont'] = conArr[zz];
            allContDoRefLp['dba']['cont'] = conArr[zz];
            break;
        }
    }
    for(var idxa in allContDoRefLp){
        compCont = allContDoRefLp[idxa]['compCont'];
        cont = allContDoRefLp[idxa]['cont'];

        peop = cont.getPeople();
        compPeop = compCont.getPeople();
        addr = peop.getCompactAddress();
        compAddr = compPeop.getCompactAddress();

        // Set Ref LP State Lic correctly for primary or DBA Ref LP
        var licNumber = "";
        if(idxa == 'prim'){
            licNumber = thisCapIDString;
        } else if(idxa == 'dba'){
            licNumber = "DBA_" + thisCapIDString;
        }


        // This was moved from outside the loop, since we may now
        // be acting on multiple ref LPs.
        var updating = false;
        var newLic = getRefLicenseProf(licNumber, rlpType);
        if (newLic) {
            updating = true;
        }
        else {
            var newLic = aa.licenseScript.createLicenseScriptModel();
        }

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
        //newLic.setStateLicense(thisCapIDString);
        newLic.setStateLicense(licNumber);
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
        
        if (updating) {
            var myResult = aa.licenseScript.editRefLicenseProf(newLic);
            if (myResult.getSuccess()) {
                //logDebug("Successfully updated LP " + thisCapIDString);
                logDebug("Successfully updated LP " + licNumber);
            }
            else {
                logDebug("**ERROR: can't update ref lic prof: " + myResult.getErrorMessage());
                return false;
            }
        }
        else {
            myResult = aa.licenseScript.createRefLicenseProf(newLic);
            if (myResult.getSuccess()) {
                bWebSite = getAppSpecific("Business Website", capId);
                if (bWebSite && bWebSite != "")
                    editRefLicProfAttribute(licNumber,"BUSINESS WEBSITE",bWebSite);
                cArrears = getAppSpecific("Child Support Arrears", capId);
                if (cArrears == "CHECKED")
                    editRefLicProfAttribute(licNumber, "CHILD SUPPORT ARREARS", "Yes");
                nysID = getAppSpecific("NYS Sales Tax ID #", capId);
                if (nysID && nysID != "") 
                    editRefLicProfAttribute(licNumber, "NYS SALES TAX ID #", nysID);
                dli = getAppSpecific("Driver License Info", capId);
                if (dli && dli != "")
                    editRefLicProfAttribute(licNumber, "DRIVER LICENSE INFO", dli);
                coNum = getAppSpecific("Company Affiliation License Number", capId);
                if (coNum && coNum != "")
                    editRefLicProfAttribute(licNumber, "LICENSE NUMBER",coNum);	
                if (bDate) {
                    var sdtBirthDate = dateFormatted(1+bDate.getMonth(), bDate.getDate(), 1900+bDate.getYear(), "");
                    editRefLicProfAttribute(licNumber, "BIRTH DATE", sdtBirthDate);	
                }
                if (relate)
                    assocResult = aa.licenseScript.associateLpWithCap(capId, newLic);
                //logDebug("Successfully created LP " + thisCapIDString);
                logDebug("Successfully created LP " + licNumber);
            }
            else {
                logDebug("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
                logMessage("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
                return false;
            }
        }
    }
    // 20210628 - jcrussell - end

	return true;
}

