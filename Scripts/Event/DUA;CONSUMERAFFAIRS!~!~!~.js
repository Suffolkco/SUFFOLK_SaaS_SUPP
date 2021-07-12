showDebug = true;
showMessage = true;

if (!publicUser)
{
    aa.ads.ads.DocumentModel

    var capDocResult = aa.document.getDocumentListByEntity(capId, "CAP");
    if (capDocResult.getSuccess())
    {       
        logDebug("*** count *** " + capDocResult.getOutput().size());
        debugObject("*******capDocResult*****" + capDocResult);
        debugObject("*******getOutput*****" + capDocResult.getOutput());

        for (docInx = 0; docInx < capDocResult.getOutput().size(); docInx++)
        {
            var documentObject = capDocResult.getOutput().get(docInx);        
      
            if (documentObject.getDocName() == "*")
            {
                debugObject("*******documentObject*****" +documentObject);
                logDebug("*** documentNo *****" + documentObject.getDocumentNo());
                logDebug("docName:" + documentObject.getDocName());
                logDebug("fileName:" + documentObject.getFileName());
                docContent = documentObject.getDocumentContent();
                documentObject.setDocName(documentObject.getFileName());
                
                documentObject.setDocDescription("Test");
                documentObject.setDocumentContent(docContent);
                
                logDebug("Setting docName to filename:" + documentObject.getFileName());
                //documentObject.setCapId(capId);
                logDebug("Setting docName to filename:" + documentObject.getFileName());
                logDebug("Getting docName:" + documentObject.getDocumentNo() + ":" + documentObject.getDocName());
                //emailText = emailText + documentObject.getDocName();
            }
        }
    }
}
//aa.sendMail("noreplyehimslower@suffolkcountyny.gov", "ada.chan@suffolkcountyny.gov", "", "DUA script", emailText);


function debugObject(object) {
    var output = ''; 
    for (property in object) { 
      output += "<font color=red>" + property + "</font>" + ': ' + "<bold>" + object[property] + "</bold>" +'; ' + "<BR>"; 
    } 
    logDebug(output);
} 
