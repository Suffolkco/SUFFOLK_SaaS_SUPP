
//ASA:DEQ/ACA/REGISTRATION/NA/
if(!publicUser)
{
    // Get Public User Address  
    var emailAddress = getAppSpecific("Public User Email Address"); 
    logDebug("Public Email Address:" + emailAddress);  
    var getUserResult = aa.publicUser.getPublicUserByEmail(emailAddress)

    if (getUserResult.getSuccess() && getUserResult.getOutput()) {
        var userModel = getUserResult.getOutput();
        logDebug("Found an existing public user: " + userModel.getUserID());

        //if (refPeopleId)	{
                //logDebug("createRefContactsFromCapContactsAndLink: Linking this public user with new reference contact : " + refPeopleId);
                //aa.licenseScript.associateContactWithPublicUser(userModel.getUserSeqNum(), refPeopleId);

                // ASI Table
                var pinTable = loadASITable("ACA REGISTRATION");

                for (var p in pinTable)
                {
                    var pin = pinTable[p]["PIN"];
                    var recordId = pinTable[p]["Record ID"];
                    var id = pinTable[p]["Contact ID"];
                    var licCap = aa.cap.getCapID(parseInt(pin)).getOutput();
                    var contactID = parseInt(id);
                    var recordIdString = recordId.toString();  

                    logDebug("Switch to upper case: " + recordIdString.toUpperCase());
                    var recordIdUpperCase = recordIdString.toUpperCase();

                    var capIDString = licCap.getCustomID();     

                    logDebug(pin + "," + recordId + "," + id + "," + licCap);

                    if (licCap)
                    {
                        logDebug("CapIdString: " + capIDString + ", Record ID: " + recordId);
                        if (matches(capIDString, recordIdUpperCase))
                        {			
                            logDebug("Matching:" + capIDString + "," + recordIdUpperCase);  
                            editContactToSpecifcRecord(licCap, contactID, emailAddress);	
                            // Set description
                            updateWorkDesc("See FAQ for details. No further steps required.");        
                            // Update Project Name
                            var projectName = "DO NOT SUBMIT UNDER THIS APPLICATION - SUBMIT UNDER " + capIDString;
                            // On AA, this is project name
                            updateShortNotes(projectName);                                      
                            // On AA, this is application name                            				
                            editAppName(projectName);			
                        }	
                    }
                }
    
            //}        
    }
}

function matches(eVal, argList) {
	for (var i = 1; i < arguments.length; i++) {
		if (arguments[i] == eVal) {
			return true;
		}
	}
	return false;
} 


/*
if(matches(itemCapType, "DEQ/ACA/Registration/NA")) 
{  

    var pin = aa.cap.getCapID(parseInt(AInfo["PIN"])).getOutput();
    var recordId = AInfo["Record ID"];
    var contactID = parseInt(AInfo["Contact ID"]);
    var capIDString = pin.getCustomID();     
    logDebug("Info: " + capIDString + "," + recordId + "," + contactID);

    if (pin) 
    {
        if (matches(capIDString, recordId))
        {
            logDebug("Matching:" + capIDString + "," + recordId);   

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
                        logDebug("Contact sequence Number :" + foundId);   
                    
                        if (contactID == foundId)
                        {
                            logDebug("Contact ID is the same. :"); 

                                                            
                            var currentContactEmail = capPeoples[loopk].getCapContactModel().getPeople().getEmail();
                            if (currentContactEmail != null)
                            {
                                logDebug("Email already exists in contact #:" + foundId);   
                            }
                            else
                            {									
                                var ACAemailAddress = "ada.chan@suffolkcountyny.gov";
                                capPeoples[loopk].getCapContactModel().getPeople().setEmail(ACAemailAddress);
                                logDebug("Set email:" + ACAemailAddress);                                   
                                                                
                                //3.3.2 Edit People with source People information.                                 
                                aa.people.editCapContactWithAttribute(capPeoples[loopk].getCapContactModel());
                             
                                logDebug("Email set:" + capPeoples[loopk].getCapContactModel().getPeople().getEmail());         

                                // Get Global Contact Number on the contact
                                var refContactNum = capPeoples[loopk].getCapContactModel().getRefContactNumber();

                                if (refContactNum)  // This is a reference contact.   Let's refresh or overwrite as requested in parms.
                                {
                                    logDebug("Reference Contact Number is :" + refContactNum);   
                                }
                            }	
                        }		
                }
            }
        
        }
    }
} */