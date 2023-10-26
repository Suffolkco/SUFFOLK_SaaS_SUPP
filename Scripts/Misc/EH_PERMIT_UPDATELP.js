// PHP-96
/*cap = aa.cap.getCap(itemCapId).getOutput();
thisAppTypeResult = cap.getCapType();
thisAppTypeString = thisAppTypeResult.toString();
thisAppTypeArray = thisAppTypeString.split("/");    
logDebug("LP Creation thisAppTypeString: " + thisAppTypeString);
logDebug("appTypeArray[0]:" + thisAppTypeArray[0]);
logDebug("appTypeArray[1]:" + thisAppTypeArray[1]);
logDebug("appTypeArray[2]:" + thisAppTypeArray[2]);
logDebug("appTypeArray[3]:" + thisAppTypeArray[3]);
if (thisAppTypeArray[0] == "EnvHealth" && thisAppTypeArray[1] == "Health Program" 
&& thisAppTypeArray[2] == "Food Protection" && thisAppTypeArray[3] == "Permit")*/
{	
	// Retrieve record address
	var capAddrResult = aa.address.getAddressByCapId(capId);
	var addressLine1;    
	var addressCity; 
	var addressState; 
	var addressZip;
	//var addressStreetName;		
	var addressStreetAddress;
	// Street # in address detail
	//var addressHouseNumberStart;
	
	var addressToUse;
	var dbaName = getAppSpecific("Facility Name", capId);				
	logDebug("Facility DBA Name is: " + dbaName);

	if (capAddrResult.getSuccess())
	{
		var addresses = capAddrResult.getOutput();
		if (addresses)
		{           
			logDebug("Found address for: " + capId.getCustomID());

			addressToUse = addresses[0];
			//Retrieve the addrress from Permit to be copied to LP
			if (addressToUse)
			{
				addressLine1 = addressToUse.getAddressLine1();     
				addressStreetName = addressToUse.getStreetName();  
				addressCity = addressToUse.getCity();    
				addressState = addressToUse.getState();             
				addressZip = addressToUse.getZip();
				// Street Address box
				addressStreetAddress = addressToUse.getFullAddress();
				// street #
				addressHouseNumberStart = addressToUse.getHouseNumberStart();			
				// Street # End 					
				//addressHouseNumberEnd = addressToUse.getHouseNumberEnd();						
				// Street Type
				//addressStreetType = addressToUse.getstreetSuffix();	
				// Street Suffix
				//addressStreetSuffix = addressToUse.getStreetSuffixdirection();
				// Unit Type
				//addressUnitType = addressToUse.getUnitType();
				// Unit #
				//addressUnitType = addressToUse.getUnitStart();
				
				//debugObject(addressToUse);
				logDebug("Address Line 1: " + addressLine1 + ", " +  addressCity + ", " +  addressState + ", " + addressZip);
				logDebug("Street Address: " + addressStreetName + ", Street #: " +  addressHouseNumberStart);
			}        
		}
	}

	// LP information
	//var rlpId = getAppSpecific("Facility ID", itemCapId);	
	//logDebug("**rlpId is: " + rlpId);
	var rlpType = "Food Facility";
	var capLicenseArr;
	var updating = false;

	
	// Retrieve existing LP if it is of Food Facility License Type
	// ACA is retrieving from reference LP and not record LP
	rlpId = capId.getCustomID();
	logDebug("**rlpId is: " + rlpId);
	//var lp = getRefLicenseProf(rlpId, rlpType);
	var lp = aa.licenseScript.getLicenseProf(capId);
	// Existing Food Facility type LP has been found
	if (lp)
	{
		logDebug("Existing license type is: " + lp.getLicenseType());  
		if (newLic.getLicenseType() == rlpType)
		{
			logDebug("Found existing LP with  type: " + lp.getLicenseType());  
			updating = true;
			logDebug("Updating existing LP : " + rlpId);								
			logDebug("Existing address is: " + lp.getAddress1());        
			logDebug("Existing city is: " + lp.getCity());  
			logDebug("Existing state is: " + lp.getState());  
			logDebug("Existing zip is: " + lp.getZip());  
		}

	}
	else
	{
		logDebug("Creating new Ref Lic Prof : " + rlpId);
		lp = aa.licenseScript.createLicenseScriptModel();        
		lp.setAgencyCode(aa.getServiceProviderCode());
		lp.setAuditDate(sysDate);
		lp.setAuditID(currentUserID);
		lp.setAuditStatus("A");
		lp.setLicState("NY");					
		lp.setAuditStatus("A");		
		lp.setLicState("NY");
		lp.setStateLicense(rlpId);
		//newLic.setContLicBusName('');   		
		
	}
	

	logDebug("=========We are now handling the Reference Contact Information=========");	
	/*if (addressLine1 != null)	
	{
		newLic.setAddress1(addressLine1);
	}*/
	lp.setLicenseType(rlpType);     
	logDebug("Set business name: " + dbaName);
	lp.setBusinessName(dbaName);			
	logDebug("Set Address 1: " + addressStreetAddress);
	lp.setAddress1(addressStreetAddress);

	logDebug("Set Address 2: " + addressStreetAddress);
	lp.setAddress2(addressStreetAddress);

	logDebug("Set Address City: " + addressCity);
	lp.setCity(addressCity);
	logDebug("Set Address State: " + addressState);
	lp.setState(addressState);
	logDebug("Set Address Zip: " + addressZip);
	lp.setZip(addressZip);			
	lp.setAuditDate(sysDate);
	lp.setAuditID(currentUserID);				
	assocResult = aa.licenseScript.associateLpWithCap(capId, lp);
	//debugObject(lp);

	if (updating)
	{
		myResult = aa.licenseScript.editRefLicenseProf(lp);
	}
	else
	{			
		logDebug(dbaName + "," + addressLine1 + ","  + addressCity + ","  + addressState + "," +  addressZip + "," + rlpType);
		myResult = aa.licenseScript.createRefLicenseProf(lp);
	}

	if (myResult.getSuccess())
	{
		logDebug("Successfully added/updated License No. " + rlpId + ", Type: " + rlpType);
		logMessage("Successfully added/updated License No. " + rlpId + ", Type: " + rlpType);        
	}
	else
	{
		logDebug("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
		logMessage("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());    
	} 
	
}

// TESTING FUNCTION HERE
/*logDebug("***:" + rNewLicId);
//if (!rNewLicId) 
{
	rNewLicIdString = rNewLicId.getCustomID();
	logDebug("**rNewLicIdString**: " + rNewLicIdString);		
	logDebug("** Start LP Creation **");	
	LPCreation(rNewLicId);
	logDebug("** End LP Creation **");	
}

var newLic = getRefLicenseProf('FA0012029')
		
// Existing Food Facility type LP has been found
if (newLic)
{
	logDebug("TESTING FUNCION RETRIEVE DATA: " + newLic.getLicenseType());  
	if (newLic.getLicenseType() == "Food Facility")
	{
		logDebug(newLic.getLicenseType());  													
		logDebug("Address is: " + newLic.getAddress1());        
		logDebug("City is: " + newLic.getCity());  
		logDebug("State is: " + newLic.getState());  
		debugObject(newLic);
	}
}*/


function getRefLicenseProf(refstlic)
	{
	var refLicObj = null;
	var refLicenseResult = aa.licenseScript.getRefLicensesProfByLicNbr(aa.getServiceProviderCode(),refstlic);
	if (!refLicenseResult.getSuccess())
		{ logDebug("**ERROR retrieving Ref Lic Profs : " + refLicenseResult.getErrorMessage()); return false; }
	else
		{
		var newLicArray = refLicenseResult.getOutput();
		if (!newLicArray) return null;
		for (var thisLic in newLicArray)
			if (refstlic && newLicArray[thisLic] && refstlic.toUpperCase().equals(newLicArray[thisLic].getStateLicense().toUpperCase()))
				refLicObj = newLicArray[thisLic];
		}

	return refLicObj;
	}
	function debugObject(object) {
		var output = '';
		for (property in object) {
			output += "<font color=red>" + property + "</font>" + ': ' + "<bold>" + object[property] + "</bold>" + '; ' + "<BR>";
		}
		logDebug(output);
	}