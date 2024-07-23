if (wfTask == "Renewal Review" && wfStatus == "Complete")

{
var projIncomplete = aa.cap.getProjectByChildCapID(capId, "Renewal", "Incomplete");
    logDebug("Proj Inc " + projIncomplete.getSuccess());
    if(projIncomplete.getSuccess())
    {
        var projInc = projIncomplete.getOutput();
        for (var pi in projInc)
        {
            parentCapId = projInc[pi].getProjectID();
            logDebug("parentCapId: " + parentCapId);
            projInc[pi].setStatus("Complete");
            var updateResult = aa.cap.updateProject(projInc[pi]);
        }
    }
}

// New Specification
// EHIMS-5076 
// Send an email to all the contacts. Attach the forms in the email. 
if (wfTask == "Renewal Review" && wfStatus == "Awaiting Client Reply")
{
    var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();	
	var conEmail = "";
    		
	var capContResult = aa.people.getCapContactByCapID(capId);

	if (capContResult.getSuccess()) {
		conArray = capContResult.getOutput();
	} else {
		retVal = false;
	}

	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
	}
	for (con in conArray)
	{
		cont = conArray[con];				
		peop = cont.getPeople();

		if (peop.getAuditStatus() != "I")
		{
            if (!matches(peop.getEmail(), null, undefined, ""))
            {
                conEmail += peop.getEmail() + "; ";
            }
        }   
	}
	
	getRecordParams4Notification(emailParams);
    getWorkflowParams4Notification(emailParams);    
    addParameter(emailParams, "$$altID$$", capId.getCustomID());
	if (conEmail != null)
	{
        sendNotification("", conEmail, "", "DEQ_OPC_SITE_RENEWAL_INCOMPLETE", emailParams, null);
    }

}
else if (wfTask == "Renewal Review" && wfStatus == "Issue Permit")
{
    // Update project name and application name from renewal to SITE

    // Application Name
    var appName = workDescGet(capId);
    
    // Get Project Name
    var projectName = getShortNotes(capId);
    logDebug("appName: " + appName + ", projectName: " + projectName);

    // On AA, this is project name
    updateShortNotes(projectName, parentCapId);                                      
    // On AA, this is application name                            				
    editAppName(appName, parentCapId);			

    // Copy address from renewal to site
    copyAddress(capId, parentCapId);


    var parentCapContact;	
	var vParentCCSM;	
	var vParentContactObj;
	var deleteContactFromParent;
    // Update the SITE contacts 
    var parentCapId = getParentCapID4Renewal();    
    overwriteContactsToParent(parentCapId);
    // Update Permit Start Date and Permit End Date

    // Update Permit Start Date and Permit End Date
    var article18 = getAppSpecific("Article 18 Regulated Site", parentCapId);
    logDebug("article18: " + article18)    

    permitStartDate = getAppSpecific("OPC Permit to Operate Start Date", parentCapId);
    permitEndDate = getAppSpecific("OPC Permit to Operate End Date", parentCapId);

    logDebug("permitStartDate: " + permitStartDate);
    logDebug("permitEndDate: " + permitEndDate);

    var permYears = 0;
    	
    //Add 5 years
    if ((article18 != null && article18 == "No"))
    {       
        permYears = 5;       
        logDebug("permyears: " + permYears);    

    }
    else if (article18 == "Yes") // Add 3 years
    {
        permYears = 3;
		logDebug("permyears: " + permYears);     
    }
    var dateMMDDYYY;
    if ((permitStartDate && permitStartDate != "") &&
      (permitEndDate && permitEndDate != ""))
    {
        var dateStartDate  = new Date(permitStartDate);
        var dateEndDate  = new Date(permitEndDate);

        var permitStartDateCon = (dateStartDate.getMonth() + 1  + "/" + dateStartDate.getDate() + "/" + (dateStartDate.getFullYear() + permYears));
        var permitEndDateCon = (dateEndDate.getMonth() + 1 + "/" + dateEndDate.getDate() + "/" + (dateEndDate.getFullYear() + permYears));
        logDebug("permitStartDateCon: " + permitStartDateCon);
        logDebug("permitEndDateCon: " + permitEndDateCon);

        var result = new Date(permitEndDateCon);
      
        var expDateMMDDYYY = jsDateToMMDDYYYY(result);
        expDateMMDDYYY = aa.date.parseDate(expDateMMDDYYY);
        logDebug("Set Expiration date: " + expDateMMDDYYY);  
        
        // Update parent SITE record  custom field start date and end date
        editAppSpecific("OPC Permit to Operate Start Date", permitStartDateCon, parentCapId);
        logDebug("Get ASI permitStartDate: " + getAppSpecific("OPC Permit to Operate Start Date", parentCapId));  
        editAppSpecific("OPC Permit to Operate End Date", permitEndDateCon, parentCapId);        
        logDebug("Get ASI permitEndDate: " + getAppSpecific("OPC Permit to Operate End Date", parentCapId));   

    }   

}


function overwriteContactsToParent(parentCapId)
{
    

	var capContactResult = aa.people.getCapContactByCapID(capId);
	var copied = 0;
    var parentCapContactResult = aa.people.getCapContactByCapID(parentCapId);	
    parentCapContacts = parentCapContactResult.getOutput();

    
	if (capContactResult.getSuccess())
	{
		var Contacts = capContactResult.getOutput();
        // Route through renewal contacts
		for (yy in Contacts)
		{
            renewalContactType = Contacts[yy].getCapContactModel().getContactType();

			if(renewalContactType == "Billing Contact" ||
            renewalContactType == "Tank Owner" ||
            renewalContactType == "Business Owner" ||
            renewalContactType == "Operator" ||
            renewalContactType == "Property Owner")
			{
			    var xNewContact = Contacts[yy].getCapContactModel();            
				var peopleModel = xNewContact.getPeople();
				var newContact = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.CapContactModel").getOutput();
				newContact.setRefContactNumber(xNewContact.getRefContactNumber());
			    peopleModel.setServiceProviderCode(aa.getServiceProviderCode());
			    peopleModel.setContactSeqNumber(newContact.getPeople().getContactSeqNumber());
			    peopleModel.setAuditID(aa.getAuditID());
			    newContact.setPeople(peopleModel);
			    var contactAddressrs = aa.address.getContactAddressListByCapContact(newContact);
				if (contactAddressrs.getSuccess()) {
					var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());
					newContact.getPeople().setContactAddressList(contactAddressModelArr);
				}
					
				newContact.setCapID(parentCapId);	
				aa.people.createCapContact(newContact);
				copied++;
				logDebug("Copied contact from "+ capId.getCustomID()+" to "+ parentCapId.getCustomID());
			}

		}
	}
	else
	{
		logDebug("**ERROR: Failed to get contacts: " + capContactResult.getErrorMessage()); 
		return false; 
	}
	return copied;
}
