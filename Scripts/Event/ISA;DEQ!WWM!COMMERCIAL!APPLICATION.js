//EHIMS2-252

var lpResult = aa.licenseScript.getLicenseProf(capId);
var noFlag = false;
if (lpResult.getSuccess())
{
    var lpArr = lpResult.getOutput();

    //getting all LP emails
    for (var lp in lpArr)
    {
        if (lpArr[lp].getLicenseType() == "WWM Liquid Waste")
        {
            noFlag = true;
        }
    }
}
else 
{
    logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage());
}

if (!noFlag)
{
    showMessage = true;
    comment("Add the WWM Liquid Waste licensee under the 'Professionals’ tab, if applicable.")
}