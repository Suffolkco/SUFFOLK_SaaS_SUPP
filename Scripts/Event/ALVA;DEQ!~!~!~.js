try
{
    aa.sendMail("noreplyehims@suffolkcountyny.gov", "ryan.littlefield@scubeenterprise.com", "", "ALVA is running", "");

    var emailParams = aa.util.newHashtable();
    var currentUserID = aa.env.getValue("CurrentUserID");
    if (currentUserID.indexOf("PUBLICUSER") == 0)
    {
        publicUser = true;
    }
    if (publicUser)
    {

        sendNotification("", "ryan.littlefield@scubeenterprise.com", "", "DEQ_OPC_ENF_INSP_REQ", emailParams, null);
    }
    //aa.sendMail("noreplyehims@suffolkcountyny.gov", "ryan.littlefield@scubeenterprise.com", "", "ALVA is running", "publicuser is " + publicUser + " and currentuserid is " + currentUserID);
}

catch (err)
{
    aa.print("ERROR ENCOUNTERED");
    aa.sendMail("noreplyehims@suffolkcountyny.gov", "ryan.littlefield@scubeenterprise.com", "", "Debug From ALVA - SUFFOLK", debug + " " + err.message);
}