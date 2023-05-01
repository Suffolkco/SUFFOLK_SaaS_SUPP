// ASA;CONSUMERAFFAIRS!LICENSES!HOME IMPROVEMENT!RENEWAL

//showDebug = 1;
//logDebug("Entering Renew ASA");

//aa.runScriptInNewTransaction("APPLICATIONSUBMITAFTER4RENEW");
//aa.runScript("APPLICATIONSUBMITAFTER4RENEW");




var conArray = getContactArray(capId);

if (conArray.length < 1) 
{
    var addChild = aa.cap.createRenewalCap(parentCapId, capId, true);
    aa.cap.updateAccessByACA(capId, "Y");
    /*if (publicUser)
    {
        //copying the contacts from the parent to the renewal record when beginning the renewal for ACA records only
        var capContacts = aa.people.getCapContactByCapID(parentCapId);
        if (capContacts.getSuccess())
        {
            capContacts = capContacts.getOutput();
            logDebug("capContacts: " + capContacts);
            for (var yy in capContacts)
            {
                aa.people.removeCapContact(parentCapId, capContacts[yy].getPeople().getContactSeqNumber());
            }
        }

        
    }*/
    copyContacts(parentCapId, capId);

    /*AInfo = new Array();
    loadAppSpecific(AInfo, parentCapId);
    for (asi in AInfo)
    {
        //Check list
        logDebug("ASI: " + asi + " value is:" + AInfo[asi]);
        editAppSpecificLOCAL(asi, AInfo[asi], capId);
    }

    var tableCopy = 0;
    if (tableCopy == 0)
    {
        copyASITables(parentCapId, capId);
        tableCopy = tableCopy + 1;
    }*/
    //copyAddresses(parentCapId, capId); 
    copyParcels(parentCapId, capId);
    copyParcelGisObjects();

    // DAP-587: Send email to vendor that we have received the renewal by mail
    if (!publicUser)
    {
    try{
       
        var emailText = ""
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
              

                addParameter(emailParams, "$$altID$$", parentCapId.getCustomID());
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
} 

function editAppSpecificLOCAL(itemName, itemValue)  // optional: itemCap
{
    var itemCap = capId;
    var itemGroup = null;
    if (arguments.length == 3) itemCap = arguments[2]; // use cap ID specified in args

    if (useAppSpecificGroupName)
    {
        if (itemName.indexOf(".") < 0)
        { logDebug("**WARNING: (editAppSpecific) requires group name prefix when useAppSpecificGroupName is true"); return false }


        itemGroup = itemName.substr(0, itemName.indexOf("."));
        itemName = itemName.substr(itemName.indexOf(".") + 1);
    }
    // change 2/2/2018 - update using: aa.appSpecificInfo.editAppSpecInfoValue(asiField)
    // to avoid issue when updating a blank custom form via script. It was wiping out the field alias 
    // and replacing with the field name

    var asiFieldResult = aa.appSpecificInfo.getByList(itemCap, itemName);
    if (asiFieldResult.getSuccess())
    {
        var asiFieldArray = asiFieldResult.getOutput();
        if (asiFieldArray.length > 0)
        {
            var asiField = asiFieldArray[0];
            if (asiField)
            {
                var origAsiValue = asiField.getChecklistComment();
                asiField.setChecklistComment(itemValue);

                var updateFieldResult = aa.appSpecificInfo.editAppSpecInfoValue(asiField);
                if (updateFieldResult.getSuccess())
                {
                    logDebug("Successfully updated custom field on record: " + itemCap.getCustomID() + " on " + itemName + " with value: " + itemValue);
                    if (arguments.length < 3) //If no capId passed update the ASI Array
                        AInfo[itemName] = itemValue;
                }
                else
                { logDebug("WARNING: (editAppSpecific) " + itemName + " was not updated."); }
            }
            else
            { logDebug("WARNING: (editAppSpecific) " + itemName + " was not updated."); }
        }
    }
    else
    {
        logDebug("ERROR: (editAppSpecific)" + asiFieldResult.getErrorMessage());
    }
}
