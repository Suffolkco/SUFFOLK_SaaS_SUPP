//CTRCA

include("CA_REN_TO_LIC_SUBMITTAL");

aa.cap.updateAccessByACA(capId, "Y");


if (!publicUser)
{
    // DAP-533
    var parentCapId = getParentCapID4Renewal();
    logDebug("parentCapId: " + parentCapId);
    if (getAppStatus(parentCapId) == "Shelved")
    {
        logDebug("Parent record has a status of Shelved. SLS_38 fee code instead.")
        updateFee("SLS_38", "CA_SALES", "FINAL", 1, "Y", "N", null) 
    }

    else if (!appMatch("ConsumerAffairs/Licenses/Dry Cleaning/Renewal") && !appMatch("ConsumerAffairs/Licenses/Restricted Electrical/Renewal") && !appMatch("ConsumerAffairs/Licenses/Restricted Plumbing/Renewal"))
    {
        logDebug("app is not Dry Cleaning");
        addFee("LIC_REN_01", "CA_LIC_REN", "FINAL", 1, "Y");
        logDebug("Added Renewal Fee");
    }
    else if (appMatch("ConsumerAffairs/Licenses/Dry Cleaning/Renewal"))
    {
        logDebug("app is Dry Cleaning");
        var dryCleanerExempt = checkForFee(parentCapId, "LIC_25")


        if (!dryCleanerExempt) 
        {
            logDebug("should not be exempt from fee");
            addFee("LIC_REN_01", "CA_LIC_REN", "FINAL", 1, "Y")
            logDebug("Added Renewal Fee") 
        }
    }
    else if (appMatch("ConsumerAffairs/Licenses/Restricted Electrical/Renewal"))
    {
        addFee("LIC_09", "CA_LICENSE", "FINAL", 1, "Y") 
    }
    else if (appMatch("ConsumerAffairs/Licenses/Restricted Plumbing/Renewal")) 
    {
        addFee("LIC_18", "CA_LICENSE", "FINAL", 1, "Y") 
    }
    
    // DAP-587: Send email to vendor that we have received the renewal by mail
    if (!publicUser)
    {
    try{
       
        if ((appTypeArray[1] == "Licenses") ||(appTypeArray[1] == "ID Cards") || (appTypeArray[1] == "Registration"))
        {
            var emailText = ""
        
            var parentCapId = getParentCapID4Renewal();
                var emailParams = aa.util.newHashtable();
                var reportFile = new Array();
                    
                var contactType = "Vendor";
                var contactInfo = getContactInfo(contactType, capId);
                if(contactInfo == false){
                    logDebug("No vendor contact exists on this record");
                }else{
                    
                
                    // copy Vendor name, org name & phone to short notes
                    var fName = contactInfo[4];
                    var lName = contactInfo[5];					
                    var email = contactInfo[8];	
            
                
                    getRecordParams4Notification(emailParams);
                    logDebug("parentCapId:" + parentCapId);
                    addParameter(emailParams, "$$altID$$", parentCapId.getCustomID());
                    addParameter(emailParams, "$$name$$", fName + " " + lName);
                    exec = lookupLOCAL('REPORT_CONFIG', 'COUNTY_EXECUTIVE');
                    commissioner = lookupLOCAL('REPORT_CONFIG', 'DCA_COMMISSIONER');
                    logDebug(exec + ", " + commissioner);
                    addParameter(emailParams, "$$exec$$", exec);
                    addParameter(emailParams, "$$comm$$", commissioner);
                    
                    logDebug("fName:" + fName);
                    logDebug("parentCapId.getCustomID():" + parentCapId.getCustomID());		
            
                    var success = sendNotification("", email, "", "DCA_RENEWAL_VENDOR_NOTIFICATION", emailParams, reportFile);	
                    logDebug("success:" + success + ", to: " + email);		
                }
            }
            
        }catch(err){
            logDebug("**WARN: Error in ASA sending email to vendor -  " + err.message);
        }
    }

}
function lookupLOCAL(stdChoice, stdValue) {
    var strControl;
    var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice, stdValue);

    if (bizDomScriptResult.getSuccess()) {
        var bizDomScriptObj = bizDomScriptResult.getOutput();
        strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
    }
  
    return strControl;
}
function getAppStatus(pcapId) {
	var itemCap = pcapId;
    logDebug("pcapId: " + pcapId);

	var appStatus = null;
    var capResult = aa.cap.getCap(itemCap);
   if (capResult.getSuccess()) {
      licCap = capResult.getOutput();
      if (licCap != null) {
         appStatus = "" + licCap.getCapStatus();
      }
   } else {
		logDebug("ERROR: Failed to get app status: " + capResult.getErrorMessage());
	}
	return appStatus;
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

function checkForFee(pCapId, pFeeCode)

    {
    
        logDebug("pCapId: " + pCapId.getCustomID());
    
        var checkStatus = false;
    
        var statusArray = ["NEW", "INVOICED"];
    
        var feeResult = aa.fee.getFeeItems(pCapId);
    
        var feeObjArr;
    
        var x = 0;
    
        if (feeResult.getSuccess())
    
        {
    
            feeObjArr = feeResult.getOutput();
    
        } else
    
        {
    
            logDebug("**ERROR: getting fee items: " + capContResult.getErrorMessage());
    
            return false
    
        }
    
        for (x in feeObjArr)
    
        {
    
            var vFee = feeObjArr[x];
    
            var y = 0;
    
            logDebug("feeObjArr[x].getFeeCod(): " + feeObjArr[x].getFeeCod());
    
            logDebug("feeObjArr[x].getF4FeeItemModel().feeNotes: " + feeObjArr[x].getF4FeeItemModel().feeNotes);
    
            logDebug("feeObjArr[x].getFeeitemStatus(): " + feeObjArr[x].getFeeitemStatus());
    
            if (pFeeCode == feeObjArr[x].getFeeCod() && exists(feeObjArr[x].getFeeitemStatus(), statusArray))
    
            {
    
                return true;
    
            }
    
            /*if (pFeeCode == feeObjArr[x].getFeeCod() && pFeeComment == feeObjArr[x].getF4FeeItemModel().feeNotes && exists(feeObjArr[x].getFeeitemStatus(), statusArray))
    
            {
    
                return true;
    
            }*/
    
        }
    
        return false;
    }