//PRA:DEQ/WWM/RESIDENCE/RENEWAL
 
var showDebug = false;
var newDate = new Date();

var parentCapId = getParentCapID4Renewal();
var parArray = getContactArray(parentCapId);
//logDebug("Parent cap D is: " + parentCap);

//Adding 3 years to the expiration date of parent record and setting the expiration status to Pending//
b1ExpResult = aa.expiration.getLicensesByCapID(parentCapId)
if (b1ExpResult.getSuccess())
{
    b1Exp = b1ExpResult.getOutput();
    b1Exp = b1ExpResult.getOutput();
    if (b1Exp.getExpStatus() == "About to Expire")
    {
        var curExp = b1Exp.getExpDate();
        var curExpCon = curExp.getMonth() + "/" + curExp.getDayOfMonth() + "/" + curExp.getYear();
        var year = newDate.getFullYear();
        var month = newDate.getMonth();
        var day = newDate.getDate(); 
        var dateAdd = addDays(curExpCon, 1095);
        var DDMMYYYY = jsDateToMMDDYYYY(dateAdd);
        //logDebug("Date added to MMDDYYYY is: " + DDMMYYYY);
        DDMMYYYY = aa.date.parseDate(DDMMYYYY);
        if (balanceDue <= 0)
        {		
        b1Exp.setExpStatus("Pending");
        b1Exp.setExpDate(DDMMYYYY);
        aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
        //var newExp = b1Exp.getExpDate();
        //var newExpCon = newExp.getMonth() + "/" + newExp.getDayOfMonth() + "/" + newExp.getYear();
        //logDebug(dateAdd + " should be 3 years from: " + curExpCon);
        closeTask("Renewal Review", "Renewal Complete", "Updated via PRA script", "Updated via PRA script");

        //Overwriting parent's contacts with renewal's contacts
            for (p in parArray)
            {
                if (matches(parArray[p].contactType, "Property Owner", "Applicant", "Designer", "Agent"))
                {
                    aa.people.removeCapContact(parentCapId, parArray[p].contactSeqNumber);
                    logDebug("Removed " + parArray[p].contactType + " from " + parentCapId);
                }
            }
        copyContacts(capId, parentCapId);
          var projIncomplete = aa.cap.getProjectByChildCapID(capId, "Renewal", "Incomplete");
          logDebug("Proj Inc " + projIncomplete.getSuccess());
          if(projIncomplete.getSuccess())
          {
              var projInc = projIncomplete.getOutput();
              for (var pi in projInc)
              {
                  parentCapId = projInc[pi].getProjectID();
                  logDebug("parentCapId: " + parentCapId);
                  projInc[pi].setStatus("Review");
                  var updateResult = aa.cap.updateProject(projInc[pi]);
              }
          }     
          var projReview = aa.cap.getProjectByChildCapID(capId, "Renewal", "Review");
          logDebug("Proj Rev " + projReview.getSuccess());
          if(projReview.getSuccess())
          {
              var projRev = projReview.getOutput();
              for (var pr in projRev)
              {
                  parentCapId = projRev[pr].getProjectID();
                  logDebug("parentCapId: " + parentCapId);
                  projRev[pr].setStatus("Complete");
                  var updateResult = aa.cap.updateProject(projRev[pr]);
              }
          }	
        }
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
/*
function copyContactsResRen(pFromCapId, pToCapId) {
    //Copies all contacts from pFromCapId to pToCapId
    //07SSP-00037/SP5017
    //
    if (pToCapId == null)
     var vToCapId = capId;
    else
     var vToCapId = pToCapId;
   
   var capContactResult = aa.people.getCapContactByCapID(pFromCapId);
    var copied = 0;
    if (capContactResult.getSuccess()) {
     var Contacts = capContactResult.getOutput();
      for (yy in Contacts) {
        var newContact = Contacts[yy].getCapContactModel();
        if (Contacts[yy].getPeople().getContactType() == "Applicant") {
  
      // Retrieve contact address list and set to related contact
        var contactAddressrs = aa.address.getContactAddressListByCapContact(newContact);
        if (contactAddressrs.getSuccess()) {
        var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());
        newContact.getPeople().setContactAddressList(contactAddressModelArr);
        }
        newContact.setCapID(vToCapId);
    
  
  
  
      // Create cap contact, contact address and contact template
        aa.people.createCapContactWithAttribute(newContact);
        copied++;
        //logDebug("Copied contact from " + pFromCapId.getCustomID() + " to " + vToCapId.getCustomID());
      }
    }
    } else {
     logMessage("**ERROR: Failed to get contacts: " + capContactResult.getErrorMessage());
     return false;
    }
    return copied;
   }
   */