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
    var emailText = "User " + currentUserID + " has added license number " + LicenseModel.stateLicense + " to their public user account. Please approve or reject this association."; 
    var recipient = lookup("LICENSE_VALIDATION_RECIPIENT", "Recipient");
    aa.sendMail("noreplyehims@suffolkcountyny.gov", String(recipient), "", "A public user has added a license to their account", emailText);

}


