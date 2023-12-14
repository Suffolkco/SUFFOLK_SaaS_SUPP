var showDebug = true;

// If the permit is inactive, we disable the FA LP
if(wfStatus == "Closed" || wfStatus == "Revoked"){


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
                if (lpArr[lp].getAuditStatus() == 'A')
                {
                    lpArr[lp].setAuditStatus("I");
                    var refLp = getRefLicenseProf(lpID)
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
	else 
	{ 
		logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
	}
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
	
