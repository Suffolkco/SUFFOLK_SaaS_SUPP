// WTUA:CONSUMERAFFAIRS/COMPLAINT/NA/NA
// WTUA;CONSUMERAFFAIRS!COMPLAINT!NA!NA.js
showMessage=true;
showDebug=true;

if (matches(appTypeArray[1], "Complaint")) {
	//if ( wfTask == "Case Disposition-Notification" && wfStatus == "Complete" ){
	if ( wfTask == "Intake" && wfStatus == "Complete" ){
        try{
            // ************************************************
            // Create a 'Complaint' Ref LP to support ACA Search
            // ************************************************
            //showMessage=true;
            //showDebug=true;
            var altId = capId.getCustomID();
            var licNumber = altId;
            var licType = "Complaint";
            var existingLp = getRefLicenseProf(licNumber, licType);
            if (existingLp) {
                logDebug("The Ref LP Exists - Skipping " + altId);
            } else {
                var capContResult = aa.people.getCapContactByCapID(capId);
                if (capContResult.getSuccess()) {
                    contactArr = capContResult.getOutput();
                    if (!contactArr || contactArr.length <= 0) {
                        logDebug ("**WARNING: No contact available for " + altId);
                    }
                    for (yy in contactArr) {
                        if ("Vendor".equals(contactArr[yy].getCapContactModel().getPeople().getContactType()) ||  "Business Owner".equals(contactArr[yy].getCapContactModel().getPeople().getContactType())) {
                            var vendorContact = contactArr[yy];
                            var vendorPerson = vendorContact.getPeople();
                            var vendorAddress = vendorPerson.getCompactAddress();
                            // Keep this break in place IF this record has both the Bus Owner and Vendor
                            var newLic = getRefLicenseProf(licNumber, licType);
                            if(newLic){
                                logDebug("Existing Complaint License found " + licNumber);
                                break;
                            }
                            // IF we are here we will create the Ref LP
                            newLic = aa.licenseScript.createLicenseScriptModel();
                            newLic.setStateLicense(licNumber);
                            newLic.setContactFirstName(vendorPerson.getFirstName());
                            newLic.setContactLastName(vendorPerson.getLastName());
                            newLic.setBusinessName(vendorPerson.getBusinessName());
                            newLic.setAddress1(vendorAddress.getAddressLine1());
                            newLic.setAddress2(vendorAddress.getAddressLine2());
                            newLic.setAddress3(vendorAddress.getAddressLine3());
                            newLic.setCity(vendorAddress.getCity());
                            newLic.setState(vendorAddress.getState());
                            newLic.setZip(vendorAddress.getZip());
                            newLic.setPhone1(vendorPerson.getPhone1());
                            newLic.setPhone2(vendorPerson.getPhone2());
                            newLic.setPhone3(vendorPerson.getPhone3());
                            newLic.setEMailAddress(vendorPerson.getEmail());
                            newLic.setFax(vendorPerson.getFax());
                            newLic.setAgencyCode(aa.getServiceProviderCode());
                            newLic.setAuditDate(sysDate);
                            newLic.setAuditID(currentUserID);
                            newLic.setAuditStatus("A");
                            newLic.setLicenseType(licType);
                            newLic.setLicState("NY");
                            newLic.setMaskedSsn(vendorPerson.getSocialSecurityNumber());
                            newLic.setSocialSecurityNumber(vendorPerson.getSocialSecurityNumber());
                            bDate = vendorContact.getCapContactModel().getBirthDate();
                            issueDate = getAppSpecific("Issued Date");
                            if (issueDate && issueDate != ""){
                                newLic.setLicenseIssueDate(aa.date.parseDate(issueDate));
                            }
                            insCo = getAppSpecific("Insurance Agent", capId)
                            if (insCo && insCo != ""){
                                newLic.setInsuranceCo(insCo);
                            }
                            insPolicy = getAppSpecific("Insurance Policy", capId);
                            if (insPolicy && insPolicy != ""){
                                newLic.setPolicy(insPolicy);
                            } 
                            insExpDate = getAppSpecific("Policy Expiration Date", capId);
                            if (insExpDate && insExpDate != ""){
                                newLic.setInsuranceExpDate(aa.date.parseDate(insExpDate));
                            } 
                            wcInsPolicy = getAppSpecific("Workers Comp #", capId);
                            if (wcInsPolicy && wcInsPolicy != ""){
                                newLic.setWcPolicyNo(wcInsPolicy);
                            } 
                            wcExpDate = getAppSpecific("Workers Comp Expiration Date", capId);
                            if (wcExpDate && wcExpDate != ""){
                                newLic.setWcExpDate(aa.date.parseDate(wcExpDate));
                            }
                            fein = getAppSpecific("Federal Tax ID #", capId);
                            if (fein && fein != ""){
                                newLic.setFein(fein);
                            } 
                            if (bDate) {
                                var sdtBirthDate = dateFormatted(1+bDate.getMonth(), bDate.getDate(), 1900+bDate.getYear(), "");
                            }
                            var myResult = aa.licenseScript.createRefLicenseProf(newLic);
                            if (myResult.getSuccess()) {
                                var bWebSite = getAppSpecific("Business Website", capId);
                                if (bWebSite && bWebSite != "")
                                    editRefLicProfAttribute(licNumber,"BUSINESS WEBSITE",bWebSite);
                                var cArrears = getAppSpecific("Child Support Arrears", capId);
                                if (cArrears == "CHECKED")
                                    editRefLicProfAttribute(licNumber, "CHILD SUPPORT ARREARS", "Yes");
                                var nysID = getAppSpecific("NYS Sales Tax ID #", capId);
                                if (nysID && nysID != "") 
                                    editRefLicProfAttribute(licNumber, "NYS SALES TAX ID #", nysID);
                                var dli = getAppSpecific("Driver License Info", capId);
                                if (dli && dli != "")
                                    editRefLicProfAttribute(licNumber, "DRIVER LICENSE INFO", dli);
                                var coNum = getAppSpecific("Company Affiliation License Number", capId);
                                if (coNum && coNum != "")
                                    editRefLicProfAttribute(licNumber, "LICENSE NUMBER",coNum);	
                                if (bDate) {
                                    var sdtBirthDate = dateFormatted(1+bDate.getMonth(), bDate.getDate(), 1900+bDate.getYear(), "");
                                    editRefLicProfAttribute(licNumber, "BIRTH DATE", sdtBirthDate);	
                                }
                                // Associate this new Ref LP to the current Record
                                assocResult = aa.licenseScript.associateLpWithCap(capId, newLic);
                                logDebug("Successfully created LP " + licNumber);
                                //var emailFrom = "noreplywwm@suffolkcountyny.gov";
                                //var emailTo = "jcrussell@accela.com";
                                //var emailCc = "";
                                //var emailSubject = "WTUA:CONSUMERAFFAIRS/COMPLAINT/NA/NA";
                                //var emailBody = "Hello<br/>Please Remove This code from SUFFOLKCO <br/>Record " + capId + "<br/> LP: " + licNumber;
                                //aa.sendMail(emailFrom,emailTo,emailCc,emailSubject,emailBody);
                            }
                            break;
                        } 
                    }
                } 
            }
            // ************************************************
        } catch(ex){
            logDebug("ERROR: " + ex.message);
        }
	}
    else if (wfTask == "Assignment" && wfStatus == "Assigned")
    {
        // Retrieve values from custom fields        
        amtContract = getAppSpecific("Total Dollar Amount of the Contract", capId);
        amountDisputed = getAppSpecific("Amount Disputed", capId);

        // Set TSI in Complaint Review to the same values as custom fields.
        editTaskSpecific("Complaint Review","Complaint Dispute Value",amountDisputed)
        editTaskSpecific("Complaint Review","Total Job Cost",amtContract)
    }     
    
} 


