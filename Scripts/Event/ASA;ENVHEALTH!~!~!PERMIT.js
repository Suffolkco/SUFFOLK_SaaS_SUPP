//Add the Program Identifier to the Structure portlet
eval(getScriptText("EH_FacilityStructureCustomFunctions"));
var programIdentifierString = getAppSpecific("Program Identifier");
if(!matches(programIdentifierString,null,undefined,"")){
    addBStructure(capId,1,"FACILITY",programIdentifierString,programIdentifierString);
}


var facilityCapId = getFacilityId(capId);
logDebug("FacilityCapId: " + facilityCapId);
if(!matches(facilityCapId,null,undefined,false)){
    // Copy Setpc/Sewage
    var disposalSystem = getAppSpecific("Septic/Sewage",facilityCapId);
    editAppSpecific("Septic/Sewage", disposalSystem);

    // Copy Sanitarian Area from Facility to FSP as San Area 
    var sanArea = getAppSpecific("Sanitarian Area",facilityCapId);
    editAppSpecific("SAN AREA", sanArea);

    // Copy Days/Hours of operation
    var daysOp = getAppSpecific("Days of Operation",facilityCapId);
    editAppSpecific("Days of Operation", daysOp);

    var hrsOp = getAppSpecific("Hours of Operation",facilityCapId);
    editAppSpecific("Hours of Operation", hrsOp);

}


//PHP-96
// Retrieve record address
var capAddrResult = aa.address.getAddressByCapId(capId);
var addressLine1;    
var addressCity; 
var addressState; 
var addressZip;
var dbaName = getAppSpecific("Facility Name", capId);				
logDebug("Facility DBA Name is: " + dbaName);

if (capAddrResult.getSuccess())
{
    var addresses = capAddrResult.getOutput();
    if (addresses)
    {           
        logDebug("Found address for: " + capId.getCustomID());

        addressToUse = addresses[0];

        if (addressToUse)
        {
            addressLine1 = addressToUse.getAddressLine1();                
            addressCity = addressToUse.getCity();    
            addressState = addressToUse.getState();             
            addressZip = addressToUse.getZip();
            dbaName
            logDebug(addressLine1 + ", " +  addressCity + ", " +  addressState + ", " + addressZip);

        }        

    }
}

// LP information
//var rlpId = getAppSpecific("Facility ID",capId);	
var rlpType = "Food Facility";
var capLicenseArr;
var updating = false;

var capLicenseResult = aa.licenseScript.getLicenseProf(itemCap);
if (capLicenseResult.getSuccess())
{
    capLicenseArr = capLicenseResult.getOutput();  
}
else
{ logDebug("**ERROR: getting lic prof: " + capLicenseResult.getErrorMessage());  }

// No LPs in the record at all
if (capLicenseArr == null || !capLicenseArr.length)
{
     logDebug("**WARNING: no licensed professionals on this CAP");
}
else // There is LP
{
    // Retrieve existing LP if it is of Food Facility License Type
    rlpId = itemCap.getCustomID();
    var newLic = getRefLicenseProf(rlpId)
    // Existing Food Facility LP has been found
	if (newLic)
    {
        updating = true;
        logDebug("Updating existing Ref Lic Prof : " + rlpId);
        logDebug("Existing license type is: " + newLic.getLicenseType());  
        logDebug("Existing business name is: " + newLic.getBusinessName());  
        logDebug("Existing address is: " + newLic.getAddress1());        
        logDebug("Existing city is: " + newLic.getCity());  
        logDebug("Existing state is: " + newLic.getState());  
        logDebug("Existing zip is: " + newLic.getZip());  

    }
	else
    {
        logDebug("Createing new Ref Lic Prof : " + rlpId);
		newLic = aa.licenseScript.createLicenseScriptModel();        
        newLic.setAgencyCode(aa.getServiceProviderCode());
        newLic.setAuditDate(sysDate);
        newLic.setAuditID(currentUserID);
        newLic.setAuditStatus("A");
    }
	
    newLic.setLicenseType(rlpType);       
    newLic.setBusinessName(dbaName);
    newLic.setAddress1(addressLine1);        
    newLic.setCity(addressCity);
    newLic.setState(addressState);
    newLic.setZip(addressZip);      

	if (updating)
		myResult = aa.licenseScript.editRefLicenseProf(newLic);
	else
		myResult = aa.licenseScript.createRefLicenseProf(newLic);

	if (myResult.getSuccess())
    {
        logDebug("Successfully added/updated License No. " + rlpId + ", Type: " + rlpType);
        logMessage("Successfully added/updated License No. " + rlpId + ", Type: " + rlpType); 
        // Added new below. Test to see if it works.
        assocResult = aa.licenseScript.associateLpWithCap(capId, newLic);       
    }
	else
    {
        logDebug("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
        logMessage("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());    
    } 
}

function getFacilityId(vCapId){
    var facilityId = null;
    facilityId = getParentByCapId(vCapId);
    if(!matches(facilityId,null,undefined,"")){
        if(appMatch("EnvHealth/Facility/NA/NA",facilityId)){
            return facilityId;
        }else{
            // If Parent isnt a Facility, try the Gradparent
            facilityId = getParentByCapId(facilityId);
            if(!matches(facilityId,null,undefined,"")){
                if(appMatch("EnvHealth/Facility/NA/NA",facilityId)){
                    return facilityId;
                }
            }
        }
    }
    return false;
}