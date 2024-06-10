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
  //2. Get people with target CAPID.
  var targetPeople = getPeople(targetCapId);
  //3. Check to see which people is matched in both source and target.
  for (loopk in capPeoples)
  {
    sourcePeopleModel = capPeoples[loopk];
    //3.1 Set target CAPID to source people.
    sourcePeopleModel.getCapContactModel().setCapID(targetCapId);
    
    targetPeopleModel = null;
    //3.2 Check to see if sourcePeople exist.
    if (targetPeople != null && targetPeople.length > 0)
    {
      for (loop2 in targetPeople)
      {        
        var auditStatus = targetPeople[loop2].getCapContactModel().getPeople().getAuditStatus();
       
        if (auditStatus == 'I')
        {
          logDebug("Audit Status for " + targetCapId.getCustomID() + " for " + targetPeople[loop2].getCapContactModel().getPeople().getContactType() + " is inactive.");
          
        }
        else
        {
          // Contact Type match
          if (isMatchContactTypeLocal(sourcePeopleModel, targetPeople[loop2]))
          {
            // Check Reference Contact ID
            if (!isMatchContactRefIDLocal(sourcePeopleModel, targetPeople[loop2]))
            {     // fist name, organization name match aas well
              if (isMatchPeopleLocal(sourcePeopleModel, targetPeople[loop2]))
              {
                targetPeopleModel = targetPeople[loop2];
                logDebug("***Found matching contact type: " + targetPeopleModel.getCapContactModel().getPeople().getContactType());
                matchAllContactInfo = true;
                break;
              }
              else // Contact Type match but not first, last or orgnaization name
              {
                targetPeopleModel = targetPeople[loop2];
                logDebug("*** Contact type match but contact information does not.");
                matchContactTypeOnly = true;                
              }
            }          
          }    
        }   
        
      }
    }
    logDebug("* Done Scanning *");
    //3.3 It is a matched people model.  
    if (targetPeopleModel != null)
    {      
      // If contact type is the same but first name, last name, organization are different. 
      if (matchAllContactInfo || matchContactTypeOnly)
      {
        logDebug("Reference contact ID or contact info doesn't match. Inactivate contact with the same contact type.");
        logDebug("********************************************************");
        // Inactivate the existing SITE contact.
        logDebug("Set contact type on SITE: " + targetPeopleModel.getCapContactModel().getPeople().getContactType() + " to inactive.");
        targetPeopleModel.getCapContactModel().getPeople().setAuditStatus("I");
        aa.people.editCapContact(targetPeopleModel.getCapContactModel());

        logDebug("Contact Status for SITE is now : " + targetPeopleModel.getCapContactModel().getPeople().getAuditStatus());
        //3.4.1 Create new people.
        aa.people.createCapContactWithAttribute(sourcePeopleModel.getCapContactModel());
        
        logDebug("Coped from: " + sourcePeopleModel.getCapContactModel().getPeople().getFirstName() + ", " + sourcePeopleModel.getCapContactModel().getPeople().getLastName() + ", " +
        sourcePeopleModel.getCapContactModel().getPeople().getBusinessName());

      }
      else
      {
        logDebug("Reference contact ID is the same. No change has to be made.");
      }
    }
  }    
  
}


function isMatchContactTypeLocal(capContactScriptModel, capContactScriptModel2)
{
  if (capContactScriptModel == null || capContactScriptModel2 == null)
  {
    return false;
  }
  var contactType1 = capContactScriptModel.getCapContactModel().getPeople().getContactType();
  var contactType2 = capContactScriptModel2.getCapContactModel().getPeople().getContactType();
  
  
  logDebug("Compare Contact Types: " + capId.getCustomID() + "|" + contactType1 + ", SITE record|" + contactType2);


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
  var refContact1 = capContactScriptModel.getCapContactModel().getPeople().getRefContactNumber();
  var refContact2 = capContactScriptModel2.getCapContactModel().getPeople().getRefContactNumber();
  
  
  logDebug("Compare Contact Reference ID: " + capId.getCustomID() + "|" + refContact1 + ", SITE record|" + refContact2);


  if ((refContact1 == null && refContact2 != null) 
    || (refContact1 != null && refContact2 == null))
  {
    return false;
  }
  if (refContact1 != null && !contactType1.equals(refContact2))
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
  var refContact1 = capContactScriptModel.getCapContactModel().getPeople().getRefContactNumber();
  var refContact2 = capContactScriptModel2.getCapContactModel().getPeople().getRefContactNumber();


  logDebug("Compare Contact Info: " + capId.getCustomID() + " |First name|" + firstName1 + "; SITE record: |First Name|" + firstName2 + "|, " +  capId.getCustomID() + ": |Last Name|" + lastName1 + "|, Site Last Name: |" + lastName2 + "|, " +  capId.getCustomID() + ": |Business Name|" + busName1 + "|, Site |Business Name: |" + busName2 + "|");
  logDebug("Reference ID: " + refContact1 + ", " + refContact2);

  if ((refContact1 == null && refContact2 != null) 
    || (refContact1 != null && refContact2 == null))
  {
    return false;
  }
  if (refContact1 != null && !refContact1.equals(refContact2))
  {
    return false;
  }

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