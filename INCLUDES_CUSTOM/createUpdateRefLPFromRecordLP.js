
function createupdateRefLPFromRecordLP(capId) {
	itemCap = capId;
	if (arguments.length > 0)
		itemCap = arguments[0];
	if (!itemCap) {
		logDebug("capId object is null")
		return;
	}
	relate = true;
	var capLicenseResult = aa.licenseProfessional.getLicenseProf(itemCap);
    var capLicenseArr = new Array();
    if (capLicenseResult.getSuccess()) {
        capLicenseArr = capLicenseResult.getOutput();
    } else {
        retVal = false;
    }
    for (capLic in capLicenseArr) {
        licProfScriptModel = capLicenseArr[capLic];
        licNumber = licProfScriptModel.getLicenseNbr();
		licType = licProfScriptModel.getLicenseType();
		aa.print(licNumber + ":" + licType);
        var updating = false;
        var newLic = getRefLicenseProf(licNumber, licType);
        if (newLic) {
            updating = true;
        }
        else {
            var newLic = aa.licenseScript.createLicenseScriptModel();
		}
		if (!updating) {
			newLic.setLicenseType(licType);
			newLic.setStateLicense(licNumber);
		}
        newLic.setAddress1(licProfScriptModel.getAddress1());
        newLic.setAddress2(licProfScriptModel.getAddress2());
        newLic.setAddress3(licProfScriptModel.getAddress3());
        newLic.setAgencyCode(licProfScriptModel.getAgencyCode());
        newLic.setAuditDate(licProfScriptModel.getAuditDate());
        newLic.setAuditID(licProfScriptModel.getAuditID());
        newLic.setAuditStatus(licProfScriptModel.getAuditStatus());
		newLic.setBusinessLicense(licProfScriptModel.getBusinessLicense());
        newLic.setBusinessName(licProfScriptModel.getBusinessName());
        newLic.setCity(licProfScriptModel.getCity());
        newLic.setCityCode(licProfScriptModel.getCityCode());
        newLic.setContactFirstName(licProfScriptModel.getContactFirstName());
        newLic.setContactLastName(licProfScriptModel.getContactLastName());
        newLic.setContactMiddleName(licProfScriptModel.getContactMiddleName());
        newLic.setContryCode(licProfScriptModel.getCountryCode());
        newLic.setCountry(licProfScriptModel.getCountry());
        newLic.setEinSs(licProfScriptModel.getEinSs());
        newLic.setEMailAddress(licProfScriptModel.getEmail());
		newLic.setFax(licProfScriptModel.getFax());
		issueDate = licProfScriptModel.getLastUpdateDate();  // yes- really, the original issue date is stored in this field.
		if (issueDate) {
			newLic.setLicenseIssueDate(issueDate);
		}
        newLic.setPhone1(licProfScriptModel.getPhone1());
        newLic.setPhone2(licProfScriptModel.getPhone2());
        //newLic.setSelfIns(licProfScriptModel.getSelfIns());
        newLic.setState(licProfScriptModel.getState());
		newLic.setLicState('NY');
        newLic.setSuffixName(licProfScriptModel.getSuffixName());
        newLic.setWcExempt(licProfScriptModel.getWorkCompExempt());
        newLic.setZip(licProfScriptModel.getZip());
        newLic.setFein(licProfScriptModel.getFein());
		newLic.setPhone3(licProfScriptModel.getPhone3());
		casm = licProfScriptModel.getAttributes();
        if (updating) {
            var myResult = aa.licenseScript.editRefLicenseProf(newLic);
            if (myResult.getSuccess()) {
                logDebug("Successfully updated LP " + licNumber);
            }
            else {
                logDebug("**ERROR: can't update ref lic prof: " + myResult.getErrorMessage());
            }
        }
        else {
			aa.print("creating a lic prof");
            myResult = aa.licenseScript.createRefLicenseProf(newLic);
            if (myResult.getSuccess()) {
                if (relate)
                    assocResult = aa.licenseScript.associateLpWithCap(capId, newLic);
				logDebug("Successfully create LP " + licNumber);
            }
            else {
                aa.print("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
            }
		}
		for (var i in casm) {
			attrObj = casm[i];
			attrVal = attrObj.getAttributeValue();
			if (attrVal && attrVal != "") {
				editRefLicProfAttribute(licNumber, attrObj.getAttributeName(), attrVal);
			}
		}
    }
}
