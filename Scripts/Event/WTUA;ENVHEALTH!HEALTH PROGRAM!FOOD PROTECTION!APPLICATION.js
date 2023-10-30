
// PHP-96
// Add a Faciility Information Contact
if (wfTask == "Application Review" && (wfStatus == "No Plans Required" || wfStatus == "Plans Approved"))
{   	
   // Use facility name
   var dbaName = getAppSpecific("Facility Name", capId);		
   logDebug("*********************************************");		
   logDebug("Facility DBA Name is: " + dbaName);
   var contactType = "Facility Information";
   var facContactType = "Accounts Receivable";
	var addressLine1;
	var addressStreetName;
	var addressCity;
	var addressState;
	var addressZip;
	var addressStreetAddress;
	var addressHouseNumberStart;

   // Use Address
   var capAddrResult = aa.address.getAddressByCapId(capId);
    
	if (capAddrResult.getSuccess())
	{
		var addresses = capAddrResult.getOutput();
		if (addresses)
		{           
			logDebug("Found address for: " + capId.getCustomID());

			addressToUse = addresses[0];
			//Retrieve the addrress from Application to be copied to LP
			if (addressToUse)
			{
				//debugObject(addressToUse);
				addressLine1 = addressToUse.getAddressLine1();    
				addressDescription = addressToUse.getAddressDescription();     
				fullAddress  = addressToUse.getFullAddress();     
				addressStreetName = addressToUse.getStreetName();  
				addressCity = addressToUse.getCity();    
				addressState = addressToUse.getState();             
				addressZip = addressToUse.getZip();
				// Street Address box
				addressStreetAddress = addressToUse.getFullAddress();
				// street #
				addressHouseNumberStart = addressToUse.getHouseNumberStart();			                
				logDebug("Address Line 1: " + addressLine1 + ", " +  addressCity + ", " +  addressState + ", " + addressZip);
				logDebug("Street Address: " + addressStreetName + ", Street #: " +  addressHouseNumberStart);
				logDebug("Location Description: " + addressDescription);
				logDebug("Street Address: " + fullAddress);
			}        
		}
	}

	//add contact in FSA
	var conArray = getContactByType("Accounts Receivable", capId);	
	var firstName = conArray.getFirstName();	
	var middleName = conArray.getMiddleName();
	var lastName = conArray.getLastName();	
	logDebug(firstName + ", " + middleName + ", " + lastName);
	
	contactNbr = addReferenceContactByName(firstName, middleName, lastName);
	logDebug("contactNbr: "  + contactNbr);

	var capContactResult = aa.people.getCapContactByCapID(capId);
	if (capContactResult.getSuccess())
		{
		var Contacts = capContactResult.getOutput();
		
		for (yy in Contacts) {
			var newContact = Contacts[yy].getCapContactModel();

			logDebug(newContact.getPeople().getContactSeqNumber());

			
			if (contactNbr == newContact.getPeople().getContactSeqNumber())
			{
				logDebug("Set contactType: " + contactType);
				newContact.setContactType(contactType);
				logDebug("Set dba name: " + dbaName);
				newContact.setBusinessName(dbaName);	
				//debugObject(newContact)					;
				newContact.setAddressLine1(addressStreetAddress);
				logDebug("Set Address City: " + addressCity);
				newContact.setCity(addressCity);
				logDebug("Set Address State: " + addressState);
				newContact.setState(addressState);
				logDebug("Set Address Zip: " + addressZip);
				newContact.setZip(addressZip);	
				aa.people.editCapContact(newContact);

				logDebug("Contact for " + contactNbr + " Updated to " + contactType);
			}

		}
	}
		

/*
	var parentId = getParents("EnvHealth/Facility/NA/NA");
	if(!matches(parentId,null,undefined,"") && parentId.length != 0)
	{
		logDebug("Debug","Parent:" + parentCapId.getCustomID());
	

	// Copy Accounts Receivable contact from FAC to FSA. That's where the address is from
	var copied = copyContactsFromParentByType(parentCapId, capId, facContactType);
	if (copied)
	{
		editContactType(facContactType, contactType, capId);
	
		var capContacts = aa.people.getCapContactByCapID(capId);
		if (capContacts.getSuccess())
		{
			logDebug(capContacts.getSuccess());

			capContacts = capContacts.getOutput();
			logDebug("capContacts: " + capContacts.length);

			for (var yy in capContacts)
			{			
				logDebug(capContacts[yy].getPeople().getContactType());

				if (capContacts[yy].getPeople().getContactType() == contactType)
				{         
					debugObject(capContacts[yy].getPeople()); 
					logDebug("Setting contact with contact type: " + contactType);
					capContacts[yy].getPeople().setBusinessName(dbaName);			
					logDebug("Set Address 1: " + addressStreetAddress);

					var capContactScriptModel = capContacts[yy];
					var capContactModel = capContactScriptModel.getCapContactModel();

					var contactAddressrs = aa.address.getContactAddressListByCapContact(capContactModel);
					if (contactAddressrs.getSuccess()) 
					{
						debugObject(contactAddressrs.getOutput());
						//var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());
						//newContact.getPeople().setContactAddressList(contactAddressModelArr);
					}

					capContacts[yy].getPeople().setContactAddress(ContactAddressModel);		

					logDebug("Set Address City: " + addressCity);
					capContacts[yy].getPeople().setCity(addressCity);
					logDebug("Set Address State: " + addressState);
					capContacts[yy].getPeople().setState(addressState);
					logDebug("Set Address Zip: " + addressZip);
					capContacts[yy].getPeople().setZip(addressZip);			
					aa.people.editCapContact(capContacts[yy].getCapContactModel());
				
				}
			}
					
		}
	}		*/
	

}	

function addReferenceContactByName(vFirst, vMiddle, vLast)
{
	var userFirst = vFirst;
	var userMiddle = vMiddle;
	var userLast = vLast;

	//Find PeopleModel object for user
	var peopleResult = aa.people.getPeopleByFMLName(userFirst, userMiddle, userLast);
	if (peopleResult.getSuccess())
		{
		var peopleObj = peopleResult.getOutput();
		//logDebug("peopleObj is "+peopleObj.getClass());
		if (peopleObj==null)
			{
			logDebug("No reference user found.");
			return false;
			}
		logDebug("No. of reference contacts found: "+peopleObj.length);
		}
	else
		{
			logDebug("**ERROR: Failed to get reference contact record: " + peopleResult.getErrorMessage());
			return false;
		}

	//Add the reference contact record to the current CAP
	var contactAddResult = aa.people.createCapContactWithRefPeopleModel(capId, peopleObj[0]);
	if (contactAddResult.getSuccess())
		{
		logDebug("Contact successfully added to CAP.");
		var capContactResult = aa.people.getCapContactByCapID(capId);
		if (capContactResult.getSuccess())
			{
			var Contacts = capContactResult.getOutput();
			var idx = Contacts.length;
			var contactNbr = Contacts[idx-1].getCapContactModel().getPeople().getContactSeqNumber();
			logDebug ("Contact Nbr = "+contactNbr);
			return contactNbr;
			}
		else
			{
			logDebug("**ERROR: Failed to get Contact Nbr: "+capContactResult.getErrorMessage());
			return false;
			}
		}
	else
		{
			logDebug("**ERROR: Cannot add contact: " + contactAddResult.getErrorMessage());
			return false;
		}
}

function debugObject(object) {
    var output = '';
    for (property in object) {
        output += "<font color=red>" + property + "</font>" + ': ' + "<bold>" + object[property] + "</bold>" + '; ' + "<BR>";
    }
    logDebug(output);
}								
function copyContactsFromParentByType(pFromCapId, pToCapId, pContactType)
{
//	Copies all contacts from pFromCapId to pToCapId
//	where type == pContactType
	if (pToCapId==null)
		var vToCapId = capId;
	else
		var vToCapId = pToCapId;

	var capContactResult = aa.people.getCapContactByCapID(pFromCapId);
	var copied = 0;

	if (capContactResult.getSuccess())
	{
		var Contacts = capContactResult.getOutput();
		for (yy in Contacts)
		{

			if(Contacts[yy].getCapContactModel().getContactType() == pContactType)
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
					
				newContact.setCapID(vToCapId);	
				aa.people.createCapContact(newContact);

				copied++;
				logDebug("Copied contact from "+pFromCapId.getCustomID()+" to "+vToCapId.getCustomID());
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

		
function getContactArray()
{
	// Returns an array of associative arrays with contact attributes.  Attributes are UPPER CASE
	// optional capid
	var thisCap = capId;
	if (arguments.length == 1) thisCap = arguments[0];

	var cArray = new Array();

	var capContactResult = aa.people.getCapContactByCapID(thisCap);
	if (capContactResult.getSuccess())
		{
		var capContactArray = capContactResult.getOutput();
		for (yy in capContactArray)
			{
			var aArray = new Array();
			aArray["lastName"] = capContactArray[yy].getPeople().lastName;
			aArray["firstName"] = capContactArray[yy].getPeople().firstName;
			aArray["businessName"] = capContactArray[yy].getPeople().businessName;
			aArray["contactSeqNumber"] =capContactArray[yy].getPeople().contactSeqNumber;
			aArray["contactType"] =capContactArray[yy].getPeople().contactType;
			aArray["relation"] = capContactArray[yy].getPeople().relation;
			aArray["phone1"] = capContactArray[yy].getPeople().phone1;
			aArray["phone2"] = capContactArray[yy].getPeople().phone2;
			aArray["phone2countrycode"] = capContactArray[yy].getCapContactModel().getPeople().getPhone2CountryCode();
			aArray["email"] = capContactArray[yy].getCapContactModel().getPeople().getEmail();


			var pa = capContactArray[yy].getCapContactModel().getPeople().getAttributes().toArray();
	                for (xx1 in pa)
                   		aArray[pa[xx1].attributeName] = pa[xx1].attributeValue;
			cArray.push(aArray);
			}
		}
	return cArray;
}

/**
 * This Function creates or update a ref contact from the specified contact types array
 * @param contactTypeArray [Array or null]
 * @param createRefContact [boolean]
 * @param overwriteRefContact [boolean]
 * @param refContactExists [String]
 * @param refContactType [String]
 */
function createOrUpdateRefContactsFromCapContactsAndLink(contactTypeArray, createRefContact, overwriteRefContact, compareFunctionName, refContactType) {

	var c = aa.people.getCapContactByCapID(capId).getOutput();
	var cCopy = aa.people.getCapContactByCapID(capId).getOutput() // must have two working datasets
	for ( var i in c) {
		var ruleForRefContactType = "U"; // default behavior is create the ref contact using transaction contact type
		var defaultRefContactType = "Individual"; // default behavior is create the ref contact as Individual
		var con = c[i];
		var p = con.getPeople();
		if (contactTypeArray != null && !exists(p.getContactType(), contactTypeArray))
			continue; //if ContacttypeArray is not "ALL" and Cap Contact not in the contact type list.  Move along.

		if (isEmptyOrNull(refContactType))
			refContactType = defaultRefContactType;
		var refContactNum = con.getCapContactModel().getRefContactNumber();

		if (refContactNum) // This is a reference contact.   Let's refresh or overwrite as requested in parms.
		{
			if (overwriteRefContact) {

				p.setContactSeqNumber(refContactNum); // set the ref seq# to refresh
				p.setContactType(refContactType);

				var a = p.getAttributes();

				if (a) {
					var ai = a.iterator();
					while (ai.hasNext()) {
						var xx = ai.next();
						xx.setContactNo(refContactNum);
					}
				}

				var r = aa.people.editPeopleWithAttribute(p, p.getAttributes());

				if (!r.getSuccess())
					logDebug("WARNING: couldn't refresh reference people : " + r.getErrorMessage());
				else
					logDebug("Successfully refreshed ref contact #" + refContactNum + " with CAP contact data");
			}

		} 
		else // user entered the contact freehand.   Let's create or link to ref contact.
		{
			logDebug("user entered the contact freehand.");

			// if the flag to create a ref contact is set to false , then do not create it.
			if (!createRefContact)
				continue;

			var ccmSeq = p.getContactSeqNumber();
			logDebug(ccmSeq);
			// Call the custom function to see if the REF contact exists
			// for now I will stop using the function until we get confirmation

			var existingContact = null;
			var refPeopleId = null;
			if (!isEmptyOrNull(compareFunctionName)) {
				existingContact = eval(compareFunctionName + "(p)");
			} else {
				existingContact = comparePeopleMatchCriteria(p);
			}
			logDebug("existingContact: " + existingContact);

			var p = cCopy[i].getPeople(); // get a fresh version, had to mangle the first for the search

			if (existingContact) // we found a match with our custom function.  Use this one.
			{
				refPeopleId = existingContact;
			} else // did not find a match, let's create one
			{
				logDebug("did not find a match, let's create one");
				var a = p.getAttributes();

				p.setContactType(refContactType);
				var r = aa.people.createPeopleWithAttribute(p, a);

				if (!r.getSuccess()) {
					logDebug("WARNING: couldn't create reference people : " + r.getErrorMessage());
					continue;
				}

				//
				// createPeople is nice and updates the sequence number to the ref seq
				//

				var p = cCopy[i].getPeople();
				refPeopleId = p.getContactSeqNumber();

				logDebug("Successfully created reference contact #" + refPeopleId);
			}

			//
			// now that we have the reference Id, we can link back to reference
			//
			logDebug("now that we have the reference Id, we can link back to reference");
			var ccm = aa.people.getCapContactByPK(capId, ccmSeq).getOutput();
			if (ccm != null) {
				ccm = ccm.getCapContactModel();
			}

			ccm.setRefContactNumber(refPeopleId);
			r = aa.people.editCapContact(ccm);

			if (!r.getSuccess()) {
				logDebug("WARNING: error updating cap contact model : " + r.getErrorMessage());
			} else {
				logDebug("Successfully linked ref contact " + refPeopleId + " to cap contact " + ccmSeq);
			}

		} // end if user hand entered contact

	}// end for each CAP contact

}// end of function 

function getPeople(capId)
{
	capPeopleArr = null;
	var s_result = aa.people.getCapContactByCapID(capId);
	if(s_result.getSuccess())
	{
	capPeopleArr = s_result.getOutput();
	if (capPeopleArr == null || capPeopleArr.length == 0)
	{
	logDebug("WARNING: no People on this CAP:" + capId);
	capPeopleArr = null;
	}
	}
	else
	{
	logDebug("ERROR: Failed to People: " + s_result.getErrorMessage());
	capPeopleArr = null;  
	}
	return capPeopleArr;
}


function editContactType(existingType,newType)
//Function will change contact types from exsistingType to newType, 
//optional paramter capID
{    
    if (arguments.length==3)
    updateCap=arguments[2]
    capContactResult = aa.people.getCapContactByCapID(updateCap);
    if (capContactResult.getSuccess())
	{
        Contacts = capContactResult.getOutput();
        for (yy in Contacts)
		{
		var theContact = Contacts[yy].getCapContactModel();
		if(theContact.getContactType() == existingType)
			{
			theContact.setContactType(newType);
			var peopleModel = theContact.getPeople();
			var contactAddressrs = aa.address.getContactAddressListByCapContact(theContact);
			if (contactAddressrs.getSuccess())
			{
				var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());
				peopleModel.setContactAddressList(contactAddressModelArr);    
			}
			aa.people.editCapContactWithAttribute(theContact);
			//logDebug("Contact for " + theContact.getFullName() + " Updated to " + newType);
			}
		}
	}
 }

