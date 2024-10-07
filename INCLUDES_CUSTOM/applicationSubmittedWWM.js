function applicationSubmittedWWM() {
	var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	
	var conEmail = "";
	var lpEmail = "";
	
	var shortNotes = getShortNotes(capId);

	var lpResult = aa.licenseScript.getLicenseProf(capId);
	if (lpResult.getSuccess())
	{
		var lpArr = lpResult.getOutput();
	}
	else 
	{
		logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage());
	}
	for (var lp in lpArr)
	{
		if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
		{
			getRecordParams4Notification(emailParams);	
			addParameter(emailParams, "$$altID$$", capId.getCustomID());
			addParameter(emailParams, "$$shortNotes$$", shortNotes);	
			lpEmail = lpArr[lp].getEmail();				
			if (lpEmail != null)
			{
				sendNotification("", lpEmail, "", "DEQ_WWM_APPLICATION SUBMITTAL", emailParams, reportParams);
			}			
		}
	}
	
	// Send additional PIN information for contacts
	var capPeoples = getPeople(capId)
	var reportParams1 = aa.util.newHashtable();
	var emailParams1 = aa.util.newHashtable();	            
	for (loopk in capPeoples)
	{
		cont = capPeoples[loopk];                 
		peop = cont.getPeople();
		conEmail = peop.getEmail();
		var reportFile = new Array();	

		logDebug("Found contact email: " + conEmail);
		// Local contact ID
		localCId = cont.getCapContactModel().getPeople().getContactSeqNumber();		
		logDebug("localCId: " + localCId);			
		contactType = cont.getCapContactModel().getPeople().getContactType();
		logDebug("contactType: " + contactType);	
		logDebug("altid: " + capId.getCustomID());	

		reportParams1.put("ContactID", localCId);
		reportParams1.put("RecordID", capId.getCustomID());
		reportParams1.put("ContactType", contactType);			
		// ACA PIN - from reportParams1 above.      
		rFile = generateReport("ACA Registration Pins-WWM",reportParams1, 'DEQ');
		logDebug("This is the ACA Pin File: " + rFile); 
		if (rFile) {
			reportFile.push(rFile);
		}

		getRecordParams4Notification(emailParams1);	
		addParameter(emailParams1, "$$altID$$", capId.getCustomID());	
		addParameter(emailParams1, "$$shortNotes$$", shortNotes);					
		if (conEmail != null)
		{
			sendNotification("", conEmail, "", "DEQ_WWM_APPLICATION SUBMITTAL", emailParams1, reportFile);
		}					
			
	}
}

function getPeople(capId)
{
  capPeopleArr = null;
  var s_result = aa.people.getCapContactByCapID(capId);
  if(s_result.getSuccess())
  {
    capPeopleArr = s_result.getOutput();
    if (capPeopleArr == null || capPeopleArr.length == 0)
    {
      aa.print("WARNING: no People on this CAP:" + capId);
      capPeopleArr = null;
    }
  }
  else
  {
    aa.print("ERROR: Failed to People: " + s_result.getErrorMessage());
    capPeopleArr = null;  
  }
  return capPeopleArr;
}

function getContactArrayLocal()
{
	// Returns an array of associative arrays with contact attributes.  Attributes are UPPER CASE
	// optional capid
	// added check for ApplicationSubmitAfter event since the contactsgroup array is only on pageflow,
	// on ASA it should still be pulled normal way even though still partial cap
	var thisCap = capId;
	if (arguments.length == 1) thisCap = arguments[0];
	var cArray = new Array();
	if (arguments.length == 0 && !cap.isCompleteCap() && !matches(controlString, "ApplicationSubmitAfter", "ConvertToRealCapAfter")) // we are in a page flow script so use the capModel to get contacts
	{
	capContactArray = cap.getContactsGroup().toArray() ;
	}
	else
	{
	var capContactResult = aa.people.getCapContactByCapID(thisCap);
	if (capContactResult.getSuccess())
		{
		var capContactArray = capContactResult.getOutput();
		}
	}

	if (capContactArray)
	{
	for (yy in capContactArray)
		{
		var aArray = new Array();
		aArray["lastName"] = capContactArray[yy].getPeople().lastName;
		aArray["refSeqNumber"] = capContactArray[yy].getCapContactModel().getRefContactNumber();
		aArray["firstName"] = capContactArray[yy].getPeople().firstName;
		aArray["middleName"] = capContactArray[yy].getPeople().middleName;
		aArray["businessName"] = capContactArray[yy].getPeople().businessName;
		aArray["contactSeqNumber"] =capContactArray[yy].getPeople().contactSeqNumber;
		aArray["contactType"] =capContactArray[yy].getPeople().contactType;
		aArray["relation"] = capContactArray[yy].getPeople().relation;
		aArray["phone1"] = capContactArray[yy].getPeople().phone1;
		aArray["phone2"] = capContactArray[yy].getPeople().phone2;
		aArray["email"] = capContactArray[yy].getPeople().email;
		aArray["addressLine1"] = capContactArray[yy].getPeople().getCompactAddress().getAddressLine1();
		aArray["addressLine2"] = capContactArray[yy].getPeople().getCompactAddress().getAddressLine2();
		aArray["city"] = capContactArray[yy].getPeople().getCompactAddress().getCity();
		aArray["state"] = capContactArray[yy].getPeople().getCompactAddress().getState();
		aArray["zip"] = capContactArray[yy].getPeople().getCompactAddress().getZip();
		aArray["fax"] = capContactArray[yy].getPeople().fax;
		aArray["notes"] = capContactArray[yy].getPeople().notes;
		aArray["country"] = capContactArray[yy].getPeople().getCompactAddress().getCountry();
		aArray["fullName"] = capContactArray[yy].getPeople().fullName;
		aArray["peopleModel"] = capContactArray[yy].getPeople();

		var pa = new Array();

		if (arguments.length == 0 && !cap.isCompleteCap()) {
			var paR = capContactArray[yy].getPeople().getAttributes();
			if (paR) pa = paR.toArray();
			}
		else
			var pa = capContactArray[yy].getCapContactModel().getPeople().getAttributes().toArray();
				for (xx1 in pa)
					aArray[pa[xx1].attributeName] = pa[xx1].attributeValue;

		cArray.push(aArray);
		}
	}
	return cArray;
}