function sendEmailtoAAUser(emailTo, templateName, capId)
{
    var emailParameters = aa.util.newHashtable();
    addParameter(emailParameters, "$$AltID$$",capId.getCustomID());
    addParameter(emailParameters, "$$subject$$","Your Timesheet has been rejected");
    if (emailTo != null && emailTo != '') {
        sendNotification("", emailTo, "", templateName, emailParameters, null);
    }
}