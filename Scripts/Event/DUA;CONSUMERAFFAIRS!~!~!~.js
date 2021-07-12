showDebug = true;
showMessage = true;

var capDocResult = aa.document.getDocumentListByEntity(capId, "CAP");
if (capDocResult.getSuccess())
{       
    logDebug("*** count *** " + capDocResult.getOutput().size());

    for (docInx = 0; docInx < capDocResult.getOutput().size(); docInx++)
    {
        var documentObject = capDocResult.getOutput().get(docInx);        
        
        if (documentObject.getDocName() == "*")
        {
            logDebug("*** documentNo *****" + documentObject.getDocumentNo());
            logDebug("docName:" + documentObject.getDocName());
            logDebug("fileName:" + documentObject.getFileName());
            documentObject.setDocName(documentObject.getFileName());
            //documentObject.setCapId(capId);
            logDebug("Setting docName to filename:" + documentObject.getFileName());
            logDebug("Getting docName:" + documentObject.getDocumentNo() + ":" + documentObject.getDocName());
            emailText = emailText + documentObject.getDocName();
        }
    }
}

aa.sendMail("noreplyehimslower@suffolkcountyny.gov", "ada.chan@suffolkcountyny.gov", "", "DUB script", emailText);