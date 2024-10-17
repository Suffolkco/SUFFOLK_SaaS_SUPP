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
    // PHP-158: As per request, do not copy san area
    //var sanArea = getAppSpecific("Sanitarian Area",facilityCapId);
    //editAppSpecific("SAN AREA", sanArea);

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

    if(!matches(facilityCapId,null,undefined,false))
    {
        var facLp = getRefLicenseProf(facilityCapId)
                
        // Find any reference Facility LP
        if (facLp)
        {      
            if (facLp.getLicenseType() == rlpType)  
            {
                logDebug("Found license type " + rlpType + " in " + capId.getCustomID());

                updating = true;
                logDebug("Updating existing Ref Lic Prof : " + facilityCapId);
                logDebug("Existing license type is: " + facLp.getLicenseType());  
                logDebug("Existing business name is: " + facLp.getBusinessName());  
                logDebug("Existing address is: " + facLp.getAddress1());        
                logDebug("Existing city is: " + facLp.getCity());  
                logDebug("Existing state is: " + facLp.getState());  
                logDebug("Existing zip is: " + facLp.getZip());  
            }

        }
        else
        {
            logDebug("Did not find existing LP " + facilityCapId);        
            logDebug("Createing new Ref Lic Prof : " + facilityCapId);
            facLp = aa.licenseScript.createLicenseScriptModel();        
            facLp.setAgencyCode(aa.getServiceProviderCode());
            facLp.setAuditDate(sysDate);
            facLp.setAuditID(currentUserID);
            facLp.setAuditStatus("A");
            facLp.setStateLicense(facilityCapId);
        }
        
        facLp.setLicenseType(rlpType);       
        facLp.setBusinessName(dbaName);
        facLp.setAddress1(addressLine1);        
        facLp.setCity(addressCity);
        facLp.setState(addressState);
        facLp.setZip(addressZip);      

        if (updating)
            myResult = aa.licenseScript.editRefLicenseProf(facLp);
            else
            myResult = aa.licenseScript.createRefLicenseProf(facLp);

        if (myResult.getSuccess())
        {
            logDebug("Successfully created/edit License No. " + facilityCapId + ", Type: " + rlpType);
            logMessage("Successfully created/edit License No. " + facilityCapId + ", Type: " + rlpType); 
            // Added new below. Test to see if it works.
            assocResult = aa.licenseScript.associateLpWithCap(capId, facLp);       
        }
        else
        {
            logDebug("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
            logMessage("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());    
        } 
    }

}
else // There is LP
{    
    logDebugLocal("LP Length: " + capLicenseArr.length);

    for (var lp in capLicenseArr)
    {   
        logDebugLocal("LP getLicenseType: " + capLicenseArr[lp].getLicenseType());
        rlpId = capLicenseArr[lp].getLicenseNbr()        
        logDebugLocal("LP ID: " + rlpId);

        if (capLicenseArr[lp].getLicenseType() == "Food Facility")
        {   
            var refLp = getRefLicenseProf(rlpId)
            
            // Existing Food Facility LP has been found
            if (refLp)
            {
                updating = true;
                logDebug("Updating existing Ref Lic Prof : " + rlpId);
                logDebug("Existing license type is: " + refLp.getLicenseType());  
                logDebug("Existing business name is: " + refLp.getBusinessName());  
                logDebug("Existing address is: " + refLp.getAddress1());        
                logDebug("Existing city is: " + refLp.getCity());  
                logDebug("Existing state is: " + refLp.getState());  
                logDebug("Existing zip is: " + refLp.getZip());  

            }
            else
            {
                logDebug("Createing new Ref Lic Prof : " + rlpId);
                refLp = aa.licenseScript.createLicenseScriptModel();        
                refLp.setAgencyCode(aa.getServiceProviderCode());
                refLp.setAuditDate(sysDate);
                refLp.setAuditID(currentUserID);
                refLp.setAuditStatus("A");
            }
            
            refLp.setLicenseType(rlpType);       
            refLp.setBusinessName(dbaName);
            refLp.setAddress1(addressLine1);        
            refLp.setCity(addressCity);
            refLp.setState(addressState);
            refLp.setZip(addressZip);      

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