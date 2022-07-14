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
