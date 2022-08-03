// WTUA:CONSUMERAFFAIRS/COMPLAINT/NA/NA
// WTUA;CONSUMERAFFAIRS!COMPLAINT!NA!NA.js
showMessage=true;
showDebug=true;

if (matches(appTypeArray[1], "Complaint")) 
{
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
    else if (wfTask == "Assignment" && wfStatus == "Assigned"){
    // Retrieve values from custom fields        
    amtContract = getAppSpecific("Total Dollar Amount of the Contract", capId);
    amountDisputed = getAppSpecific("Amount Disputed", capId);

    // Set TSI in Complaint Review to the same values as custom fields.
    editTaskSpecific("Complaint Review","Complaint Dispute Value",amountDisputed)
    editTaskSpecific("Complaint Review","Total Job Cost",amtContract)

        // DAP-508: When Greg changes the workflow Assignment -> Assigned task in the workflow, 
    // email to the complainant with attachment
    if (currentUserID == 'GSPENCER' || currentUserID == 'ACHAN')
    {
        logDebug("Current ID:" + currentUserID);
        }
        var emailText = ""
        var emailParams = aa.util.newHashtable();
        var reportFile = new Array();
        var reportParams = aa.util.newHashtable();   
        var contactType = "Complainant";
        var contactInfo = getContactInfo(contactType, capId);
        if(contactInfo == false){
            logDebug("No complainant contact exists on this record");
        }
        else
        {
            getRecordParams4Notification(emailParams);
            alternateID = capId.getCustomID();
            addParameter(emailParams, "$$altID$$", alternateID.toString());               

            var vAddrLine1 = contactInfo[0];
            var vCity = contactInfo[1];
            var vState = contactInfo[2];
            var vZip = contactInfo[3];
            
            // copy Vendor name, org name & phone to short notes
            var fName = contactInfo[4];
            var lName = contactInfo[5];					
            var email = contactInfo[8];	
            
            
            addParameter(emailParams, "$$fName$$", fName);
            addParameter(emailParams, "$$lName$$", lName);

            
            reportParams.put("RecordID", alternateID.toString());
            
            var itemCap = aa.cap.getCap(capId).getOutput();
            appTypeResult = itemCap.getCapType();
            appTypeString = appTypeResult.toString(); 
            appTypeArray = appTypeString.split("/");

            rFile = generateReport("Complaint Consumer Report", reportParams, appTypeArray[0]);
            
            logDebug("This is the consumer file: " + rFile);           
        
            if (rFile) {
                reportFile.push(rFile);
            }

                //1. Check if the record has been assigned
            var cdScriptObjResult = aa.cap.getCapDetail(capId);
            if (!cdScriptObjResult.getSuccess())
                { logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ; }

            var cdScriptObj = cdScriptObjResult.getOutput();

            if (!cdScriptObj)
                { logDebug("**ERROR: No cap detail script object") ; }

            cd = cdScriptObj.getCapDetailModel();

            // Record Assigned to
            var assignedUserid = cd.getAsgnStaff();
            if (assignedUserid !=  null)
            {
                iNameResult = aa.person.getUser(assignedUserid) 
                if(iNameResult.getSuccess())
                {
                    assignedUser = iNameResult.getOutput();     
                    logDebug("Assigned user: " + assignedUser.getFirstName() + " " + assignedUser.getLastName());
                    assigneeEmail = assignedUser.getEmail();
                    sendNotification("Consumer.Affairs@suffolkcountyny.gov", assigneeEmail, "", "DCA_CMP_CONSUMER_ASSIGNED", emailParams, reportFile);	
                }
            }


            var success = sendNotification("", email, "", "DCA_CMP_CONSUMER_ASSIGNED", emailParams, reportFile);	                               
            logDebug("success:" + success + ", to: " + email);

            //aa.sendMail("Consumer.Affairs@suffolkcountyny.gov", "ada.chan@suffolkcountyny.gov", "", "CA_SEND_COMPOAINANT_EMAIL", emailText);
                    
        }
    }    
        
    
} 

function getContactInfo(cType, capId) {
	var returnArray = new Array();
	var haveCType = false;
	
	var contModel = null; 
	var consResult = aa.people.getCapContactByCapID(capId);	
	if (consResult.getSuccess()) {
		var cons = consResult.getOutput();
		for (thisCon in cons) {
			var capContactType = cons[thisCon].getCapContactModel().getPeople().getContactType();
			if (capContactType == cType) {				
				var contModel = cons[thisCon].getCapContactModel(); 
				
				var firstName = contModel.getFirstName();
				var lastName = contModel.getLastName();
				var business = contModel.getBusinessName();
				var phone = contModel.getPhone1();
				var addr1 = contModel.getAddressLine1();
				var city = contModel.getCity();
				var state = contModel.getState();
				var zip = contModel.getZip();
				var email = contModel.getPeople().getEmail();

			
				// build returnArray
				returnArray.push(addr1);
				returnArray.push(city);
				returnArray.push(state);
				returnArray.push(zip);
				returnArray.push(firstName);
				returnArray.push(lastName);
				returnArray.push(business);
				returnArray.push(phone);
				returnArray.push(email);
				return returnArray;
				haveCType = true;
			}
		}
	}
	if (haveCType == false){
		return false;
	}
}

