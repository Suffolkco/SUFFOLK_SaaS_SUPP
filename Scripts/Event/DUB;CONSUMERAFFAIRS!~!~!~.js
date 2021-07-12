if (String(aa.env.getValue("showDebug")).length > 0) {
    showDebug = aa.env.getValue("showDebug").substring(0, 1).toUpperCase().equals("Y");
}
// override showdebug
showDebug = true;
showMessage = true;

var itemCapType = aa.cap.getCap(capId).getOutput().getCapType().toString();
// If record type is WWM and it's a backoffice user, we do not want to update the status

emailText = publicUser;
if (!publicUser)
{   
    var capDocResult = aa.document.getDocumentListByEntity(capId, "CAP");
    if (capDocResult.getSuccess())
    {       
        if (capDocResult.getOutput().size() > 0)
        {
            for (docInx = 0; docInx < capDocResult.getOutput().size(); docInx++)
            {
                var documentObject = capDocResult.getOutput().get(docInx);
                var fileName = documentObject.getFileName();
                var docName = documentObject.getDocName();
                emailText = emailText + ". docName: " + docName;
                emailText = emailText + ". Filename: " + fileName;
                if (docName == "*")
                {
                    documentObject.setDocName(fileName);
                    emailText = emailText + ". Setting Doc name to: " + fileName;
                    emailText = emailText + "Set to: " + documentObject.getDocName();
                }
            }
        }
       
    }
    aa.sendMail("noreplyehimslower@suffolkcountyny.gov", "ada.chan@suffolkcountyny.gov", "", "DUB script", emailText);
}