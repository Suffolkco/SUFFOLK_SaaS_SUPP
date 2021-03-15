function editContactToSpecifcRecord(pin, contactID, publicEmailAddress) 
{        
	try
	{
		var capPeoples = getPeople(pin)
		
		if (capPeoples == null || capPeoples.length == 0)
		{            
			logDebug("No contact has been found.");   
		}
		else
		{
			for (loopk in capPeoples)
			{
				foundId = capPeoples[loopk].getCapContactModel().getPeople().getContactSeqNumber();				
			
				if (contactID == foundId)
				{
					logDebug("Contact sequence Number :" + foundId);   
										
					var refContact;												
					var getUserResult;

					// Get public user with ID if it's from ACA
					if (publicUser || publicEmailAddress == null) {	
						getUserResult = aa.publicUser.getPublicUserByPUser(publicUserID);
					}
					else // if it's backoffice, use entered ASI public email address
					{
						getUserResult = aa.publicUser.getPublicUserByEmail(publicEmailAddress);
					}

					if (getUserResult.getSuccess() && getUserResult.getOutput()) {
						userModel = getUserResult.getOutput();	                            
						userSeqNum = userModel.getUserSeqNum();
						refContact = getRefContactForPublicUser(userSeqNum) 					

						logDebug("Success:" + userModel.getEmail());  

						if (publicUser)
						{
							editAppSpecific("Public User Email Address", userModel.getEmail(), capId);
							logDebug("Update App Specific:" + userModel.getEmail());  
						}
					}

					if (refContact) 
					{      
						// Get Global Contact Number on the record
						var refContactNum = capPeoples[loopk].getCapContactModel().getRefContactNumber();
						logDebug("Global reference id found in record: " + refContactNum); 
						contactType = capPeoples[loopk].getCapContactModel().getPeople().getContactType();

						// There is a global reference contact in the contact
						if (refContactNum != null)                                    
						{                                                                              
							logDebug("Public contact info: " + refContact);   
							//debugObject ("aa people:" + aa.people);
							//debugObject ("aa.licenseScript:" + aa.licenseScript);
							logDebug("Public user email address:" + userModel.getEmail());   

							//var newEmailAddress = refContact.getEmail();                                        
							var currentContactEmail = capPeoples[loopk].getCapContactModel().getPeople().getEmail();                                       
							
							// Update Reference contact with public user email address
							logDebug("Get reference contact id: " + refContactNum + "," + contactType); 
							
							var refConResult = aa.people.getPeople(refContactNum);
							if (refConResult.getSuccess()) {
								var refPeopleModel = refConResult.getOutput();
								if (refPeopleModel != null) {
									pm = refPeopleModel;
									pm.setEmail(userModel.getEmail());
																			
									var result = aa.people.editPeopleWithAttribute(pm, pm.getAttributes());
		
									if (result.getSuccess()) {
										logDebug("Successfully update the contact with email address");
									}	
									else{
										logDebug("Unable to update the reference contact");
									}
								}
							}
							// Update first name, last name if they are missing in the record contact.
							if (capPeoples[loopk].getCapContactModel().getPeople().getFirstName() == null &&
							capPeoples[loopk].getCapContactModel().getPeople().getLastName() == null)
							{
								capPeoples[loopk].getCapContactModel().getPeople().setFirstName(userModel.getFirstName());
								capPeoples[loopk].getCapContactModel().getPeople().setLastName(userModel.getLastName());
							}
							if (capPeoples[loopk].getCapContactModel().getPeople().getEmail() == null)
							{
								capPeoples[loopk].getCapContactModel().getPeople().setEmail(userModel.getEmail());
							}

							logDebug("Set email:" + userModel.getEmail());                                                                                           ;
							aa.people.editCapContactWithAttribute(capPeoples[loopk].getCapContactModel());
							logDebug("Email set:" + capPeoples[loopk].getCapContactModel().getPeople().getEmail());                                             
																
							logDebug("Associate contact with public user : " + refContactNum);                                                  
							aa.licenseScript.associateContactWithPublicUser(userSeqNum, refContactNum);                                                 


						}
						else // No reference contact has been found in the record
						{
							logDebug("No reference contact has been found for contact:" + contactID);   
							var contractTypeArray = [];
							
							contractTypeArray.push(contactType);
							logDebug("Push");
							createRefContactsFromCapContactsAndLinkPublic(pin, contractTypeArray, null, null, true, comparePeopleMatchCriteria, userModel);
							
							
							// Set missing reference contact number to be the ACA reference contact number
							//capPeoples[loopk].getCapContactModel().setRefContactNumber(refContactNum)
							//logDebug("Set:" +  refContactNum);
							
							//addRefContactToRecord(refContactNum, contactType, pin);
						
							// }
						}												
					}		
					
				}
			}  
			
		}      
	}    	        
	catch (err) {
		aa.print("A JavaScript Error occurred: " + err.message);
	}
    
}
function createRefContactsFromCapContactsAndLinkPublic(pCapId, contactTypeArray, ignoreAttributeArray, replaceCapContact, overwriteRefContact, refContactExists, userModel)
	{

	// contactTypeArray is either null (all), or an array or contact types to process
	//
	// ignoreAttributeArray is either null (none), or an array of attributes to ignore when creating a REF contact
	//
	// replaceCapContact not implemented yet
	//
	// overwriteRefContact -- if true, will refresh linked ref contact with CAP contact data
	//
	// refContactExists is a function for REF contact comparisons.
	//
	// Version 2.0 Update:   This function will now check for the presence of a standard choice "REF_CONTACT_CREATION_RULES".
	// This setting will determine if the reference contact will be created, as well as the contact type that the reference contact will
	// be created with.  If this setting is configured, the contactTypeArray parameter will be ignored.   The "Default" in this standard
	// choice determines the default action of all contact types.   Other types can be configured separately.
	// Each contact type can be set to "I" (create ref as individual), "O" (create ref as organization),
	// "F" (follow the indiv/org flag on the cap contact), "D" (Do not create a ref contact), and "U" (create ref using transaction contact type).

	var standardChoiceForBusinessRules = "REF_CONTACT_CREATION_RULES";


	var ingoreArray = new Array();
	if (arguments.length > 1) ignoreArray = arguments[1];

	var defaultContactFlag = lookup(standardChoiceForBusinessRules,"Default");

	var c = aa.people.getCapContactByCapID(pCapId).getOutput()
	var cCopy = aa.people.getCapContactByCapID(pCapId).getOutput()  // must have two working datasets

	for (var i in c)
	   {
	   var ruleForRefContactType = "U"; // default behavior is create the ref contact using transaction contact type
	   var con = c[i];

	   var p = con.getPeople();

	   var contactFlagForType = lookup(standardChoiceForBusinessRules,p.getContactType());

	  // if (!defaultContactFlag && !contactFlagForType) // standard choice not used for rules, check the array passed
	   //	{
            if (contactTypeArray && !exists(p.getContactType(),contactTypeArray))
			continue;  // not in the contact type list.  Move along.
	//	}

	   if (!contactFlagForType && defaultContactFlag) // explicit contact type not used, use the default
	   	{
	   	ruleForRefContactType = defaultContactFlag;
	   	}

	   if (contactFlagForType) // explicit contact type is indicated
	   	{
	   	ruleForRefContactType = contactFlagForType;
	   	}

	   if (ruleForRefContactType.equals("D"))
	   	continue;

	   var refContactType = "";

	   switch(ruleForRefContactType)
	   	{
		   case "U":
		     refContactType = p.getContactType();
		     break;
		   case "I":
		     refContactType = "Individual";
		     break;
		   case "O":
		     refContactType = "Organization";
		     break;
		   case "F":
		     if (p.getContactTypeFlag() && p.getContactTypeFlag().equals("organization"))
		     	refContactType = "Organization";
		     else
		     	refContactType = "Individual";
		     break;
		}

	   var refContactNum = con.getCapContactModel().getRefContactNumber();

	   if (refContactNum)  // This is a reference contact.   Let's refresh or overwrite as requested in parms.
	   	{
	   	if (overwriteRefContact)
	   		{
	   		p.setContactSeqNumber(refContactNum);  // set the ref seq# to refresh
	   		p.setContactType(refContactType);

	   						var a = p.getAttributes();

							if (a)
								{
								var ai = a.iterator();
								while (ai.hasNext())
									{
									var xx = ai.next();
									xx.setContactNo(refContactNum);
									}
					}

	   		var r = aa.people.editPeopleWithAttribute(p,p.getAttributes());

			if (!r.getSuccess())
				logDebug("WARNING: couldn't refresh reference people : " + r.getErrorMessage());
			else
				logDebug("Successfully refreshed ref contact #" + refContactNum + " with CAP contact data");
			}

	   	if (replaceCapContact)
	   		{
				// To Be Implemented later.   Is there a use case?
			}

	   	}
	   	else  // user entered the contact freehand.   Let's create or link to ref contact.
	   	{
			var ccmSeq = p.getContactSeqNumber();

			var existingContact = refContactExists(p);  // Call the custom function to see if the REF contact exists

			var p = cCopy[i].getPeople();  // get a fresh version, had to mangle the first for the search

			if (existingContact)  // we found a match with our custom function.  Use this one.
				{
					refPeopleId = existingContact;
				}
			else  // did not find a match, let's create one
				{

				var a = p.getAttributes();

				if (a)
					{
					//
					// Clear unwanted attributes
					var ai = a.iterator();
					while (ai.hasNext())
						{
						var xx = ai.next();
						if (ignoreAttributeArray && exists(xx.getAttributeName().toUpperCase(),ignoreAttributeArray))
							ai.remove();
						}
					}

                p.setContactType(refContactType);
                p.setEmail(userModel.getEmail());
             
                
                logDebug("Success:" + p.getEmail());  

				var r = aa.people.createPeopleWithAttribute(p,a);

				if (!r.getSuccess())
					{logDebug("WARNING: couldn't create reference people : " + r.getErrorMessage()); continue; }

				//
				// createPeople is nice and updates the sequence number to the ref seq
				//

				var p = cCopy[i].getPeople();
				var refPeopleId = p.getContactSeqNumber();
                logDebug("Successfully created reference contact #" + refPeopleId);            
            }
            
               
            publicUserSeqNum = userModel.getUserSeqNum();
            logDebug("publicUserSeqNum: " + publicUserSeqNum);
            // Need to link to an existing public user.
            if (publicUserSeqNum != null)
            {
                logDebug("createRefContactsFromCapContactsAndLink: Linking this public user with new reference contact : " + refPeopleId);                        
                aa.licenseScript.associateContactWithPublicUser(publicUserSeqNum, refPeopleId);
            }


			//
			// now that we have the reference Id, we can link back to reference
			//

		    var ccm = aa.people.getCapContactByPK(pCapId,ccmSeq).getOutput().getCapContactModel();

            ccm.setRefContactNumber(refPeopleId);
            // Only if it's null, we overwrote the email.
            if (ccm.getEmail() == null)
            {
                ccm.setEmail(userModel.getEmail());
            }

		    r = aa.people.editCapContact(ccm);

		    if (!r.getSuccess())
				{ logDebug("WARNING: error updating cap contact model : " + r.getErrorMessage()); }
			else
				{ logDebug("Successfully linked ref contact " + refPeopleId + " to cap contact " + ccmSeq);}


	    }  // end if user hand entered contact
	}  // end for each CAP contact
} 