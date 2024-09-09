var capAddresses = null;  

if (wfTask == "Inspections" && wfStatus == "Plan Changed")
{
	updateTask("Plans Distribution", "Awaiting Client Reply", "Plan corrections submitted by Applicant", "Plan corrections submitted by Applicant");
	workflowPlanRevisionsNeeded(" ", capAddresses);
} 

// Set expiration date to be one year after the approved date
var todaysDate = new Date();
var dateCon = (todaysDate.getMonth() + 1) + "/" + todaysDate.getDate() + "/" + todaysDate.getFullYear();
var dateAdd = addDays(dateCon, 365);
var dateMMDDYYY = jsDateToMMDDYYYY(dateAdd);
var b1ExpResult = aa.expiration.getLicensesByCapID(capId);
var capAddresses = null;  
var s_result = aa.address.getAddressByCapId(capId);
if(s_result.getSuccess())
{
	capAddresses = s_result.getOutput();	
}

if (wfTask == "Plans Coordination" && wfStatus == "Approved")
{    
	// Send email notification
	workflowPlansCoordinationApproved(capAddresses);			
	
    if (b1ExpResult.getSuccess())
    {
        b1Exp = b1ExpResult.getOutput();
        dateMMDDYYY = aa.date.parseDate(dateMMDDYYY);
        b1Exp.setExpDate(dateMMDDYYY);
        b1Exp.setExpStatus("Pending");
        aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
    }

	// EHIMS-5290: compare and copy contact
	var parentId = getParents("DEQ/General/Site/NA");      
	logDebug("parentId: "  + parentId);                                      
	if (parentId != null)
	{
		for (p in parentId)
		{
			var itemCap = aa.cap.getCap(parentId[p]).getOutput();
			var appTypeResult = itemCap.getCapType();
			var appTypeString = appTypeResult.toString(); 
			var appTypeArray = appTypeString.split("/");
			var siteCheck = false;
			parentId = parentId[p];
			logDebug("Found parent site: " + parentId.getCustomID());
			compareContacts(capId, parentId);				
			
		}
	}
	
}
else if (wfTask == 'Plans Coordination' && wfStatus == 'Plan Revisions Needed')     
{
	logDebug("Plans coordination and Plan Revisions Needed.");          
	logDebug("In this loop Comments:" + wfComment);
	
	if (wfComment == null)
	{
		logDebug("Comments are empty.");
		workflowPlanRevisionsNeeded(" ", capAddresses);
	}
	else
	{
		logDebug("Comments are: " + wfComment);
		workflowPlanRevisionsNeeded(wfComment, capAddresses);
	}		
}
else if (wfTask == 'Inspections' && wfStatus == 'Plan Changed')     
{
	logDebug("Inspections and Plan Changed.");          
	logDebug("In this loop Comments:" + wfComment);
	
	if (wfComment == null)
	{
		logDebug("Comments are empty.");
		workflowInspectionPlanChangedOPC(" ", capAddresses);
	}
	else
	{
		logDebug("Comments are: " + wfComment);
		workflowInspectionPlanChangedOPC(wfComment, capAddresses);
	}		
}

function addDays(date, days) 
{
	var result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}
function jsDateToMMDDYYYY(pJavaScriptDate) {
	//converts javascript date to string in MM/DD/YYYY format
	if (pJavaScriptDate != null) {
		if (Date.prototype.isPrototypeOf(pJavaScriptDate)) {
			return (pJavaScriptDate.getMonth() + 1).toString() + "/" + pJavaScriptDate.getDate() + "/" + pJavaScriptDate.getFullYear();
		} else {
			logDebug("Parameter is not a javascript date");
			return ("INVALID JAVASCRIPT DATE");
		}
	} else {
		logDebug("Parameter is null");
		return ("NULL PARAMETER VALUE");
	}
}

// targetCapId = SITE
function compareContacts(srcCapId, targetCapId)
{
  //1. Get people with source CAPID.
  var capPeoples = getPeople(srcCapId);
  logDebug("Source Cap ID:" + srcCapId);
  var matchContactTypeOnly = false;
  var matchAllContactInfo = false;
  if (capPeoples == null || capPeoples.length == 0)
  {
    logDebug("Didn't get the source peoples!");
    return;
  }  
  //2. Get people with SITE CAPID.
  var targetPeople = getPeople(targetCapId);

  // EHIMS-5290: Check if unregistered new tank owner is present at site:
  var unregisteredTankOwner = getContactInfoType("Unregistered New Tank Owner", targetCapId);
  var unregisteredTankOperator = getContactInfoType("Unregistered New Tank Operator", targetCapId);

  //3. Check to see which people is matched in both source and target.
  for (loopk in capPeoples)
  {
    sourcePeopleModel = capPeoples[loopk];
    //3.1 Set target CAPID to source people.
    sourcePeopleModel.getCapContactModel().setCapID(targetCapId);
    
    targetPeopleModel = null;

    // Skip if the child contact is inactive
    if (sourcePeopleModel.getCapContactModel().getPeople().getAuditStatus() != 'I')
    {

      var sourceContactType = sourcePeopleModel.getCapContactModel().getPeople().getContactType;
      logDebug("Source contact type is for : " + srcCapId.getCustomID() + " is " + sourceContactType);
      var found = false;
      
      //3.2 Check to see if sourcePeople exist.
      if (targetPeople != null && targetPeople.length > 0)
      {      

        for (loop2 in targetPeople)
        {        
          var auditStatus = targetPeople[loop2].getCapContactModel().getPeople().getAuditStatus();
          var targetContactType = targetPeople[loop2].getCapContactModel().getPeople().getContactType();
          // Flag if no matching contact type in target record
          if (matches(sourceContactType, targetContactType) && auditStatus != "I" )
          {
             found = true;
             logDebug("Same contact type has been found: " + sourceContactType);
          }

          if (auditStatus == 'I')
          {
            logDebug("SKIP: Audit Status for " + targetCapId.getCustomID() + " for " + targetContactType + " is already inactive.");
            
          }
          else if (!matches(targetContactType, 
          "Billing Contact", "Business Owner", "Property Owner", "Tank Owner", "Operator", 
          "Unregistered New Tank Owner", "Unregistered New Tank Operator"))
          {
            logDebug("SKIP: Contact type is not one of the following: Billing Contact, Business Owner or Property Owner: " + targetContactType);
          
          }  
          // Check if it is Unregistered New Tank Owner      
          else if (matches(targetContactType, "Unregistered New Tank Owner"))
          {
            logDebug("Unregistered New Tank Owner found. Process function.");
              processTankOwnerOrOperator(srcCapId, targetCapId, targetPeople[loop2], "Tank Owner");
          }
          // Check if it is Unregistered New Tank Operator      
          else if (matches(targetContactType, "Unregistered New Tank Operator"))
          {
            logDebug("Unregistered New Tank Operator found. Process function.");  
            processTankOwnerOrOperator(srcCapId, targetCapId, targetPeople[loop2], "Operator");
          }
          else
          {
            // This scenario is to cover when SITE has a contact Tank Owner and has a New Unregistered Tank Owner, we should skip
            // since it has been taken care in the Unregistered Tank Owner logic above
            if (unregisteredTankOwner && matches(targetContactType, "Tank Owner"))
            {
              logDebug("There is an unregistered Tank Owner contact in SITE and also Tank Owner in SITE.");
            }
            // This scenario is to cover when SITE has a contact Operator and has a New Unregistered Tank Operator, we should skip
            // since it has been taken care in the Unregistered Tank Operator logic above
            else if (unregisteredTankOperator && matches(targetContactType, "Operator"))
            {
              logDebug("There is an unregistered Tank Operator contact in SITE and also Operator in SITE.");
            }
            else
            {
              // First, compare if the they have the same Contact Type
              if (isMatchContactTypeLocal(sourcePeopleModel, targetPeople[loop2]))
              {
                // Check Reference Contact ID
                //logDebug("*****************");
                //debugObject(sourcePeopleModel.getCapContactModel());
                logDebug("Contact Type Matched.");
                logDebug("**********************************");
                logDebug(srcCapId.getCustomID() + " and " + targetCapId.getCustomID())
                logDebug("**********************************");
                logDebug("Comparing reference ID: Child - " + sourcePeopleModel.getCapContactModel().getRefContactNumber() + " VS Parent - " + targetPeople[loop2].getCapContactModel().getRefContactNumber());
              
                // Then check to see if the reference ID is the same
                if (!isMatchContactRefIDLocal(sourcePeopleModel, targetPeople[loop2]))
                {     
                  logDebug("Reference IDs do not match. ");
                  // 1. Compare if they have the same first, last name and organization name. 
                  if (isMatchPeopleLocal(sourcePeopleModel, targetPeople[loop2]))
                  {
                    targetPeopleModel = targetPeople[loop2];
                    logDebug("****Found matching SITE contact type: " + targetContactType);
                    matchAllContactInfo = true;
                    if (sourcePeopleModel.getCapContactModel().getPeople().getAuditStatus() == 'I' ||
                    (targetPeopleModel.getCapContactModel().getPeople().getAuditStatus() == 'I'))
                    {
                      logDebug("Same first, last and org name. However, the source contact status is: " + sourcePeopleModel.getCapContactModel().getPeople().getAuditStatus());
                      logDebug("Same first, last and org name. However, the source contact status is: " + targetPeopleModel.getCapContactModel().getPeople().getAuditStatus());
                    }
                    else
                    {
                      logDebug("Same first, last and org name. ***Overwrite contact info***");
                  
                      // Get child contact info
                      var phone = sourcePeopleModel.getCapContactModel().getPeople().getPhone1();
                      var phone2 = sourcePeopleModel.getCapContactModel().getPeople().getPhone2();
                      var phone3 = sourcePeopleModel.getCapContactModel().getPeople().getPhone3();
                      var fax = sourcePeopleModel.getCapContactModel().getPeople().getFax();
                      var addr1 = sourcePeopleModel.getCapContactModel().getPeople().getCompactAddress().getAddressLine1();
                      var city = sourcePeopleModel.getCapContactModel().getPeople().getCompactAddress().getCity();
                      var state = sourcePeopleModel.getCapContactModel().getPeople().getCompactAddress().getState();
                      var zip = sourcePeopleModel.getCapContactModel().getPeople().getCompactAddress().getZip();
                      var email = sourcePeopleModel.getCapContactModel().getPeople().getEmail();
                      var startdate = sourcePeopleModel.getCapContactModel().getPeople().getStartDate();
                      logDebug("*** Child CapId: " + capId.getCustomID());               

                      logDebug("*** SITE CapId: " + targetCapId.getCustomID());
                      logDebug("Updating SITE contact ID " + targetPeopleModel.getCapContactModel().getRefContactNumber());
                      logDebug("Set phone 1: " + phone);
                      targetPeopleModel.getCapContactModel().getPeople().setPhone1(phone);
                      logDebug("Set phone 2: " + phone2);
                      targetPeopleModel.getCapContactModel().getPeople().setPhone2(phone2);
                      logDebug("Set phone 3: " + phone3);
                      targetPeopleModel.getCapContactModel().getPeople().setPhone3(phone3);
                      logDebug("Set fax: " + fax);
                      targetPeopleModel.getCapContactModel().getPeople().setFax(fax);
                      logDebug("Set Address addr1: " + addr1);
                      targetPeopleModel.getCapContactModel().getPeople().getCompactAddress().setAddressLine1(addr1);
                      logDebug("Set Address city: " + city);
                      targetPeopleModel.getCapContactModel().getPeople().getCompactAddress().setCity(city);
                      logDebug("Set Address State: " + state);
                      targetPeopleModel.getCapContactModel().getPeople().getCompactAddress().setState(state);
                      logDebug("Set Address Zip: " + zip);
                      targetPeopleModel.getCapContactModel().getPeople().getCompactAddress().setZip(zip);	
                      logDebug("Set email: " + email);
                      targetPeopleModel.getCapContactModel().getPeople().setEmail(email);	
                      logDebug("Set start date: " + startdate);
                      targetPeopleModel.getCapContactModel().getPeople().setStartDate(startdate);	
                      aa.people.editCapContact(targetPeopleModel.getCapContactModel());				    
                    }            
                  }
                  //2. If different contact info, inactive the existing parent reference ID and add the child contact to parent.
                  else // Contact Type match but not first, last or orgnaization name
                  {
                    targetPeopleModel = targetPeople[loop2];
                    logDebug("*** Contact type match but contact information does not.");
                    matchContactTypeOnly = true;        
                    
                    logDebug("Reference contact ID or contact info doesn't match. Inactivate contact with the same contact type.");
                    logDebug("********************************************************");
                    // Inactivate the existing SITE contact.
                    logDebug("Set contact type on SITE: " + targetPeopleModel.getCapContactModel().getPeople().getContactType() + " to inactive.");
                    targetPeopleModel.getCapContactModel().getPeople().setAuditStatus("I");

                    // Get Start and End date on child 
                    childStartDate  = sourcePeopleModel.getCapContactModel().getPeople().getStartDate();
                  // childEndDate = sourcePeopleModel.getCapContactModel().getPeople().getEndDate();
                    logDebug("Get Child Start Date: " + childStartDate);
                    // (use the “Start Date” of the Child Contact as the “End Date”) existing parent 
                    // reference ID and Copy the child contact to Parent (include the Start Date)    
                    logDebug("Set End Date on SITE: " + childStartDate);          
                    targetPeopleModel.getCapContactModel().getPeople().setEndDate(childStartDate);
                  
                    aa.people.editCapContact(targetPeopleModel.getCapContactModel());
                  
                    logDebug("Contact Status for SITE is now : " + targetPeopleModel.getCapContactModel().getPeople().getAuditStatus());
                  
                    //3.4.1 Create new people.
                    aa.people.createCapContactWithAttribute(sourcePeopleModel.getCapContactModel());
                    
                    logDebug("Coped from: " + sourcePeopleModel.getCapContactModel().getPeople().getFirstName() + ", " + sourcePeopleModel.getCapContactModel().getPeople().getLastName() + ", " +
                    sourcePeopleModel.getCapContactModel().getPeople().getBusinessName());
                    
                  }
                }     
                else
                {
                  logDebug("SKIP: Same reference ID.")
                } 
              }    
              else
              {
                logDebug("SKIP: Contact type does not match");
              }
            }   
          }
          
        }
      }
    }    
    else
    {
      logDebug("Contact is not active: " + sourcePeopleModel.getCapContactModel().getPeople().getContactType());
    }

    // If no target of the same contact type is found, copy
    if (!found)
    {
      logDebug("No target contact type has been found in : " + targetCapId.getCustomID());
      logDebug("Copying contact type: " + sourceContactType + " to " + targetCapId.getCustomID);
      copyContact(srcCapId, targetCapId, sourceContactType);
    }
  
  }

  logDebug("* Done Scanning all contacts. *");    
}

function isMatchContactTypeLocal(capContactScriptModel, capContactScriptModel2)
{
  if (capContactScriptModel == null || capContactScriptModel2 == null)
  {
    return false;
  }
  var contactType1 = capContactScriptModel.getCapContactModel().getPeople().getContactType();
  var contactType2 = capContactScriptModel2.getCapContactModel().getPeople().getContactType();
  
  
  logDebug("Compare Contact Types: " + capId.getCustomID() + "|" + contactType1 + "VS SITE record|" + contactType2);


  if ((contactType1 == null && contactType2 != null) 
    || (contactType1 != null && contactType2 == null))
  {
    return false;
  }
  if (contactType1 != null && !contactType1.equals(contactType2))
  {
    return false;
  }
  
  return  true;
}

function isMatchContactRefIDLocal(capContactScriptModel, capContactScriptModel2)
{
  if (capContactScriptModel == null || capContactScriptModel2 == null)
  {
    return false;
  }
  var refContact1 = capContactScriptModel.getCapContactModel().getRefContactNumber();
  var refContact2 = capContactScriptModel2.getCapContactModel().getRefContactNumber();
  
  
  logDebug("Compare Contact Reference ID: " + capId.getCustomID() + "|" + refContact1 + ", SITE record|" + refContact2);


  if ((refContact1 == null && refContact2 != null) 
    || (refContact1 != null && refContact2 == null))
  {
    return false;
  }
  if (refContact1 != null && !refContact1.equals(refContact2))
  {
    return false;
  }
  
  return  true;
}


function isMatchPeopleLocal(capContactScriptModel, capContactScriptModel2)
{
  if (capContactScriptModel == null || capContactScriptModel2 == null)
  {
    return false;
  }
  
  var firstName1 = capContactScriptModel.getCapContactModel().getPeople().getFirstName();
  var firstName2 = capContactScriptModel2.getCapContactModel().getPeople().getFirstName();
  var lastName1 = capContactScriptModel.getCapContactModel().getPeople().getLastName();
  var lastName2 = capContactScriptModel2.getCapContactModel().getPeople().getLastName();
  var busName1 = capContactScriptModel.getCapContactModel().getPeople().getBusinessName();
  var busName2 = capContactScriptModel2.getCapContactModel().getPeople().getBusinessName();
  var refContact1 = capContactScriptModel.getCapContactModel().getRefContactNumber();
  var refContact2 = capContactScriptModel2.getCapContactModel().getRefContactNumber();


  logDebug("Compare Contact Info: " + capId.getCustomID());
  logDebug("|First name|" + firstName1 + "; SITE record: |First Name|" + firstName2 + "|, " +  capId.getCustomID() + ": |Last Name|" + lastName1 + "|, Site Last Name: |" + lastName2);
  logDebug(capId.getCustomID() + ": |Business Name|" + busName1 + "|, Site |Business Name: |" + busName2 + "|");
  logDebug("Reference ID: " + refContact1 + ", " + refContact2);

 
  if ((firstName1 == null && firstName2 != null) 
    || (firstName1 != null && firstName2 == null))
  {
    return false;
  }
  if (firstName1 != null && !firstName1.equals(firstName2))
    {
      return false;
    }
  if ((lastName1 == null && lastName2 != null) 
    || (lastName1 != null && lastName2 == null))
  {
    return false;
  }
  if (lastName1 != null && !lastName1.equals(lastName2))
  {
    return false;
  }
  if ((busName1 == null && busName2 != null) 
    || (busName1 != null && busName2 == null))
  {
    return false;
  }
  if (busName1 != null && !busName1.equals(busName2))
  {
    return false;
  }
  return  true;
}

function getContactInfoType(cType, id) {
	var returnArray = new Array();
	var haveCType = false;
	
	var contModel = null; 
	var consResult = aa.people.getCapContactByCapID(id);	
	if (consResult.getSuccess()) {
		var cons = consResult.getOutput();
		for (thisCon in cons) {
			var capContactType = cons[thisCon].getCapContactModel().getPeople().getContactType();
			if (capContactType == cType) {										
				return true;
            }
        }
    }
	return false;
}

function copyContact(pFromCapId, pToCapId, contactType) 
{
	if (pToCapId == null)
	{
		var vToCapId = capId;
	}
	else
	{
		var vToCapId = pToCapId;
	}
	var capContactResult = aa.people.getCapContactByCapID(pFromCapId);
	var copied = 0;
	if (capContactResult.getSuccess()) 
	{
		var Contacts = capContactResult.getOutput();
		for (yy in Contacts) 
		{
			var newContact = Contacts[yy].getCapContactModel();
      if (newContact.getPeople().getContactType() == contactType)
      {
        // Retrieve contact address list and set to related contact
        var contactAddressrs = aa.address.getContactAddressListByCapContact(newContact);
        if (contactAddressrs.getSuccess()) 
        {
          var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());
          newContact.getPeople().setContactAddressList(contactAddressModelArr);
        }
        newContact.setCapID(vToCapId);
        // Create cap contact, contact address and contact template
        aa.people.createCapContactWithAttribute(newContact);
        copied++;
        logDebug("Copied contact from " + pFromCapId.getCustomID() + " to " + vToCapId.getCustomID());
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

function processTankOwnerOrOperator(srcCapId, targetCapId, targetPeopleModel, contactType)
{   
  // First find if there is any 
  siteTankContact = getContactObj(targetCapId,contactType);
  childTankContact = getContactObj(srcCapId, contactType);
      
  if (childTankContact != null && siteTankContact != null)
  {          
    // 1. deactivate SITE Unregistered New Tank Owner/Operator                 
    logDebug("Set contact type on SITE : " + targetPeopleModel.getCapContactModel().getPeople().getContactType() + " to inactive.");
    targetPeopleModel.getCapContactModel().getPeople().setAuditStatus("I");             

    // 2. use the “Start Date” of the Child Tank Owner/operator as the “End Date” for the SITE unregisterd)     
    childTankStartDate  = childTankContact.people.getStartDate();       
    logDebug("Get " + contactType + " Child Start Date: " + childTankStartDate);       
         
    logDebug("Set SITE unregistered new tank owner/operator end Date: " + childTankStartDate);       
    targetPeopleModel.getCapContactModel().getPeople().setEndDate(childTankStartDate);              
    aa.people.editCapContact(targetPeopleModel.getCapContactModel());

    // 2.  Deactivate the active Tank Owner/Operator       
    if (siteTankContact.people.getAuditStatus() == 'A')
    {                     
      siteTankContact.people.setAuditStatus("I");                
      
      //siteUnregisteredStartDate = targetPeopleModel.getCapContactModel().getPeople().getStartDate();        
      //logDebug("Get Start Date of child tank: " + siteUnregisteredStartDate);          
            
      // use the “Start Date” of the child Tank Owner /Operator as the “End Date” in the parent tank owner/operator
      logDebug("Set SITE Tank End date using the START date of the child tank owner/operator contact: " + childTankStartDate);       
      siteTankContact.people.setEndDate(childTankStartDate);              
      aa.people.editCapContact(siteTankContact.capContact);
      // Copy the child Tank contact to the Parent (include the Start Date)
      logDebug("Copy Tank Owner/operator contract from child to: " + targetCapId.getCustomID());
      copyContact(srcCapId, targetCapId, contactType);
    }
    
}
}