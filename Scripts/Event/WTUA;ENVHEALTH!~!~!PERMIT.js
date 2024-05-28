var showDebug = true;
var emailText = "";

try {
    // If the permit is inactive, we disable the FA LP. If the permit is reactivate, we enable the FA LP.
    if(wfStatus == "Inactive" || wfStatus == "Closed" || wfStatus == "Revoked" ||  wfStatus == "Active")    
    {

        var lpResult = aa.licenseScript.getLicenseProf(capId);
        
        if (lpResult.getSuccess())
        { 
            var lpArr = lpResult.getOutput();  
            logDebugLocal("LP Length: " + lpArr.length);
        
            for (var lp in lpArr)
            {   
                logDebugLocal("LP getLicenseType: " + lpArr[lp].getLicenseType());
                lpID = lpArr[lp].getLicenseNbr()        
                logDebugLocal("LP ID: " + lpID);

                if (lpArr[lp].getLicenseType() == "Food Facility")
                {   
                    var refLp = getRefLicenseProf(lpID)

                    if (wfStatus == "Active")
                    {
                        if (refLp.getAuditStatus() == 'I')
                        {
                            refLp.setAuditStatus("A");
                            aa.licenseScript.editRefLicenseProf(refLp);
                            logDebugLocal(lpID + ": has been reactivated");
                        }
                    }
                    else if (wfStatus == "Closed" || wfStatus == "Revoked" || wfStatus == "Inactive")
                    {
                        if (refLp.getAuditStatus() == 'A')
                        {
                            refLp.setAuditStatus("I");
                            
                            aa.licenseScript.editRefLicenseProf(refLp);                                            
                            logDebugLocal(lpID + ": deactivated linked License");
                        }
                        else
                        {
                            logDebugLocal(lpID + " is already disabled");
                        }
                    }
                    
                }
            }

        } 
        else 
        { 
            logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
        }
    }

}    	        
catch (err) {
    aa.print("A JavaScript Error occurred: " + err.message);
}

function getRefLicenseProf(refstlic)
{
    
	var refLicObj = null;
	var refLicenseResult = aa.licenseScript.getRefLicensesProfByLicNbr(aa.getServiceProviderCode(),refstlic);
	if (!refLicenseResult.getSuccess())
		{ logDebugLocal("**ERROR retrieving Ref Lic Profs : " + refLicenseResult.getErrorMessage()); return false; }
	else
		{
		var newLicArray = refLicenseResult.getOutput();
		if (!newLicArray) return null;
		for (var thisLic in newLicArray)
			if (refstlic && refstlic.toUpperCase().equals(newLicArray[thisLic].getStateLicense().toUpperCase()))
				refLicObj = newLicArray[thisLic];
		}

	return refLicObj;
}
function logDebugLocal(dstr)
{
    if (showDebug)
    {
        aa.print(dstr)
        emailText += dstr + "<br>";
        aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr)
    }
}
	
