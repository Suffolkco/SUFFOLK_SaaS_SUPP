try
{
    logDebug("This is an ASA Event")
}
catch (err)
{
    aa.print("ERROR ENCOUNTERED");
    aa.sendMail("noreply@accela.com", "Jacob.Greene@scubeenterprise.com", "", "Debug From ASA - SUFFOLK", debug + " " + err.message);
}