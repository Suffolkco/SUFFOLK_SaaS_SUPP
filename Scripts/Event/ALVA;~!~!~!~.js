var params = aa.env.getParamValues();
var keys = params.keys();
var key = null;
while (keys.hasMoreElements())
{
    key = keys.nextElement();
    eval("var " + key + " = aa.env.getValue(\"" + key + "\");");
    logDebug("Loaded Env Variable: " + key + " = " + aa.env.getValue(key));
}
var emailParams = aa.util.newHashtable();
var currentUserID = aa.env.getValue("CurrentUserID");
if (currentUserID.indexOf("PUBLICUSER") == 0)
{
    publicUser = true;
}
if (publicUser && LicenseModel.licenseType == "WWM Liquid Waste")
{
    var personResult = aa.person.getUser(currentUserID);
    if (personResult.getSuccess())
    {
        var personObj = personResult.getOutput();
        if (personObj == null) // no user found
        {
            logDebug("**ERROR: Failed to get User");
        }
    }
    else
    {
        logDebug("**ERROR: Failed to get User: " + personResult.getErrorMessage());
    }


    var userFull = personObj.getFullName();
    var userEmail = personObj.getEmail();
    var emailText = "User " + currentUserID + " with ACA User ID " + userFull + " and email address " + userEmail + " has added license number " + LicenseModel.stateLicense + " to their public user account. Please approve or reject this association." + "<br>" + "(1) To review / approve the request, open the launchpad in Accela (back office).<br>(2) Choose 'Public User', which may be under your favorites, or may be under All Pages.<br>(3) Click 'Search', then look up the user’s account.<br>(4) Click the user’s email address, then go to the 'License' tab.<br>(5) There should be a line item where = the 'License Status' column = Unapproved.<br>(6) If OK, check the box next to that item, and click 'APPROVE'.";
    var recipient = lookup("LICENSE_VALIDATION_RECIPIENT", "Recipient");
    aa.sendMail("noreplyehims@suffolkcountyny.gov", String(recipient), "", "A public user has added a license to their account", emailText);

}


