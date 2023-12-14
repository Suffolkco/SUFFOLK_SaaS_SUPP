// If the permit is inactive, we disable the FA LP
if(wfStatus == "Closed" || wfStatus == "Revoked"){


    var lpResult = aa.licenseScript.getLicenseProf(capId);
	if (lpResult.getSuccess())
	{ 
		var lpArr = lpResult.getOutput();  
        logDebugLocal("lpArr: " + lpArr);

        for (var lp in lpArr)
        {            
            licProfScriptModel = lpArr[lp];
            logDebugLocal("lp: " + lp);
            //Deactivating license profesionals
            var refLic = getRefLicenseProf(lp) // Load the reference License Professional

            logDebugLocal("Found LP object: " + refLic);
            if (refLic)
            {
                if (refLic.getAuditStatus() == 'A')
                {
                    refLic.setAuditStatus("I");
                    aa.licenseScript.editRefLicenseProf(refLic);
                    disabledCnt++;
                    logDebugLocal(lpID + ": deactivated linked License");
                }
                else
                {
                    logDebugLocal(lpID + " is already disabled");
                    alreadyDisabledCnt++;
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
	
