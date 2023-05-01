
aa.cap.updateAccessByACA(capId, "Y");

include("CA_REN_TO_LIC_SUBMITTAL");


    // DAP-587: Send email to vendor that we have received the renewal by mail
    if (!publicUser)
    {
    try{
       
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
                addParameter(emailParams, "$$altID$$", parentCapId);
                addParameter(emailParams, "$$name$$", fName + " " + lName);
                logDebug("fName:" + fName);
                logDebug("parentCapId.getCustomID():" + parentCapId.getCustomID());		
        
                var success = sendNotification("", email, "", "DCA_RENEWAL_VENDOR_NOTIFICATION", emailParams, reportFile);	
                logDebug("success:" + success + ", to: " + email);		
            }
            
        }catch(err){
            logDebug("**WARN: Error in ASA sending email to vendor -  " + err.message);
        }
    }

/*if (!publicUser)
{
    if ((appTypeArray[1] != "ID Cards") || (appTypeArray[1] != "Registration"))
    {
    addFee("LIC_REN_01", "CA_LIC_REN", "FINAL", 1, "Y")
    }
}*/ 